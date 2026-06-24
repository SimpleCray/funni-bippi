# CLAUDE.md — funni-bippi-be

NestJS 11 monorepo. Anonymous stranger-chat backend. 3 apps + 1 shared lib over Kafka + Redis + Socket.IO.

> Deep request flows: **[FLOW.md](./FLOW.md)**. Setup/scaling: **[README.md](./README.md)**. Read those before changing flow logic.

---

## Architecture (must internalize before editing)

3 separate Node processes, no direct calls between them:

| App | Path | Port | Transport |
|-----|------|------|-----------|
| api-gateway | `apps/api-gateway` | `:3001` | HTTP + WebSocket + Kafka consumer |
| matching-service | `apps/matching-service` | — | Kafka only |
| chat-service | `apps/chat-service` | — | Kafka only |

Rules that drive every change:

- **Services never call each other directly.** All inter-service comms = Kafka topics. Don't add HTTP/import coupling between apps.
- **Only api-gateway touches Socket.IO.** matching/chat push to browser via `gateway.broadcast` topic → gateway re-emits. Never try to emit to a socket from chat/matching.
- **Redis = only shared state.** No in-memory cross-process state. In-process `Map`s (e.g. matching timeouts) are per-instance only — don't assume they survive across instances.
- **Topic names live in one place:** `libs/shared/src/events/kafka-events.ts`. Import `KafkaTopics`, never hardcode strings.

---

## Where things go

- Business logic → `*.service.ts` (`@Injectable`). Controllers/gateways stay thin routers.
- HTTP routes → `@Get/@Post` controllers in api-gateway.
- Kafka handlers → `@EventPattern(KafkaTopics.X)` controllers.
- WS events → `@SubscribeMessage('event:name')` in `chat.gateway.ts`.
- Shared types / DTOs / guards / redis / utils → `libs/shared/src/*`, imported via `@app/shared`.
- New cross-service type → `libs/shared/src/types/index.ts`. New DTO → `libs/shared/src/dto/` with `class-validator` decorators.

Import alias: `@app/shared` → `libs/shared/src` (see `tsconfig.json` paths). Use it; no deep relative `../../../libs`.

---

## Conventions

- **No hardcoded magic strings.** Every shared identifier comes from a constant in `libs/shared`, never a literal:
  - Socket event names → `SOCKET_EVENTS` (`libs/shared/src/events/socket-events.ts`). Use in `@SubscribeMessage(SOCKET_EVENTS.X)`, `.emit(SOCKET_EVENTS.X, ...)`, broadcast `event:` fields.
  - Kafka topics → `KafkaTopics` (`events/kafka-events.ts`).
  - DI tokens → `KAFKA_CLIENT` etc. (`constants/tokens.ts`). Use in `ClientsModule.register({ name: KAFKA_CLIENT })` AND `@Inject(KAFKA_CLIENT)`.
  - Redis keys are templated per-service (e.g. `QUEUES` const in matching) — keep them defined once, don't re-inline.
- **DI only.** Never `new SomeService()`. Declare in constructor, register in the owning module's `providers`/`imports`.
- **Validate all inbound payloads** with a DTO + `ValidationPipe` (`whitelist: true`). WS handlers also need `@UseGuards(SessionGuard)`.
- **strictNullChecks + noImplicitAny on.** No untyped `any`. Type socket data via `TypedSocket`.
- Redis access through `RedisService` wrapper (`libs/shared/src/redis`), not raw `ioredis`.
- IDs = `uuid()`. Messages carry `messageId` for FE dedup — keep emitting it.
- Money/state mutation in Redis: respect existing key shapes (`session:`, `socket:`, `queue:male|female`, `room:`, `userRoom:`). Update FLOW.md/README tables if you change them.

---

## Two-gender queue model (easy to get wrong)

- Only `queue:male` + `queue:female`, keyed by user's **own** gender.
- `interest` decides which queue(s) `tryMatch` searches, NOT which queue user is pushed to.
- Match must be **mutual**: candidate's interest must also accept joiner's gender. See `matching.service.ts tryMatch`.

---

## Broadcast pattern (chat/matching → browser)

`this.broadcast(...)` emits `gateway.broadcast`. 3 types:

| type | effect |
|------|--------|
| `join-room` | add socket(s) to Socket.IO room |
| `emit-to-socket` | emit to specific socketIds |
| `emit-to-room` | emit to room, optional `excludeSocketIds` |

Multi-instance correctness relies on `redis-io.adapter.ts` (Socket.IO Redis adapter). Don't remove it — without it cross-instance emits silently drop.

---

## Commands

```bash
npm run start:api          # gateway :3001 (watch)
npm run start:matching     # matching (watch)
npm run start:chat         # chat (watch)
docker compose up -d       # Redis + Kafka + Zookeeper
npm run build:all          # build 3 apps
npm run lint               # eslint --fix
npm run test               # jest (*.spec.ts under apps/)
```

Local chat needs all 5 running (Redis, Kafka, 3 apps) + 2 browser tabs to match.

---

## Gotchas

- `api-gateway` is the nest-cli default project — bare `nest start`/`nest build` (and `npm start`/`start:dev`/`build`) target it. matching/chat must be named explicitly.
- Kafka topics auto-create with **1 partition** → extra matching/chat instances sit idle until partitions added (see README scaling).
- Timeout timers (`this.timeouts` Map in matching) are per-process; on timeout the queue entry is NOT auto-removed — FE must `user:cancel`.
- `chat:typing` and `chat:reaction` skip Kafka — handled locally in gateway, relayed via `client.to(roomId)`. Ephemeral, fire-and-forget, never hit chat-service/Redis. Keep that pattern for new ephemeral UI events.
- Uploads → `UPLOAD_DIR` (`C:/tmp/uploads` Win, `/tmp/uploads` else), served at `/files/*` via `ServeStaticModule`. Multer validates `image/*` + `MAX_FILE_SIZE_MB`.
- Env has defaults for local dev (`.env.example`). CORS origin = `FE_URL`.

---

## When you change a flow

Keep these in sync or they rot: `FLOW.md` (step tables), `README.md` (event/topic/key tables), `libs/shared` types/DTOs. A new Kafka topic touches: `kafka-events.ts` → producer `.emit` → consumer `@EventPattern` → README topic table.
