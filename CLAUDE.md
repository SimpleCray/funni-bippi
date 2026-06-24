# CLAUDE.md — funni-bippi (monorepo root)

Anonymous stranger-chat app. Two independent apps in one repo:

| Dir | Stack | Read before working there |
|-----|-------|---------------------------|
| `funni-bippi-be/` | NestJS 11 · Kafka · Redis · Socket.IO | **`funni-bippi-be/CLAUDE.md`** |
| `funni-bippi-fe/` | Next.js 16 · React 19 · Zustand · socket.io-client | **`funni-bippi-fe/CLAUDE.md`** |

`documents/` = specs. `design/` = design assets.

## Routing rule (do this first)

Before ANY code task, open the matching subdir's `CLAUDE.md` and follow it. BE work → BE doc. FE work → FE doc. Don't apply one side's conventions to the other.

## Contract between FE & BE (keep in sync)

The two talk over HTTP + Socket.IO. Shared shapes are duplicated, not imported — change both sides together:

- **No hardcoded event strings anywhere.** Socket event names live in a constant on each side and are mirrored: BE `libs/shared/src/events/socket-events.ts` (`SOCKET_EVENTS`) ↔ FE `lib/socketEvents.ts` (`SOCKET_EVENTS`). Adding/renaming an event = edit BOTH files. BE also centralizes Kafka topics (`KafkaTopics`) + DI tokens (`KAFKA_CLIENT`).
- Socket events + payloads: BE `chat.gateway.ts` ↔ FE `hooks/useSocket.ts` / `useChat.ts` / `useMatching.ts`.
- REST: `POST /session/init`, `POST /upload` (Authorization: sessionId), `GET /files/:name`, `GET /health`.
- Types like `Gender`, `Interest`, `Stranger`, `Message` exist on BOTH sides (`libs/shared/src/types` vs FE `types/index.ts`). Edit in tandem.

Full flows: `funni-bippi-be/FLOW.md`.
