# Funni Bippi — Backend

> NestJS microservices backend for real-time anonymous stranger chat.
> Stack: NestJS 11 · Kafka · Redis · Socket.IO · TypeScript

For step-by-step request flows (FE → BE → FE), see **[FLOW.md](./FLOW.md)**.
For full architecture requirements, see **[../documents/BACKEND_REQUIREMENTS.md](../documents/BACKEND_REQUIREMENTS.md)**.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Quick Start — Chat in the UI](#quick-start--chat-in-the-ui)
6. [Environment Variables](#environment-variables)
7. [npm Scripts](#npm-scripts)
8. [API & Socket Events](#api--socket-events)
9. [Kafka Topics](#kafka-topics)
10. [Redis Keys](#redis-keys)
11. [Troubleshooting](#troubleshooting)
12. [Horizontal Scaling (Multi-Instance)](#horizontal-scaling-multi-instance)

---

## Overview

This backend powers **Funni Bippi** — an anonymous chat-with-strangers app. Users get a temporary session, join a matchmaking queue, get paired with another online user, and chat in real time via WebSocket.

**Three NestJS apps** run as separate processes:

| App | Role | Port |
|-----|------|------|
| **api-gateway** | HTTP REST, WebSocket (Socket.IO), static file serving | `:3001` |
| **matching-service** | Matchmaking queue, user pairing | Kafka only |
| **chat-service** | Room management, message relay | Kafka only |

Plus **Redis** and **Kafka** (via Docker) as shared infrastructure.

---

## Architecture

```
Browser (Next.js FE)
        │
        ▼ HTTP + WebSocket
┌───────────────────┐
│    api-gateway     │  POST /session/init, /upload, /health
│    (port 3001)     │  Socket.IO: user:join, chat:message, ...
└─────────┬─────────┘
          │ Kafka
    ┌─────┴─────┐
    ▼           ▼
matching-    chat-
service      service
    │           │
    └─────┬─────┘
          ▼
       Redis
  (sessions, queues, rooms)
```

**Request path (simplified):**

```
FE → api-gateway → Kafka → matching/chat service → Kafka → api-gateway → FE
```

Services never call each other over HTTP. All inter-service communication goes through Kafka topics. The chat and matching services push events back to browsers via the `gateway.broadcast` topic — see [FLOW.md §19](./FLOW.md#19-the-gatewaybroadcast-loop-explained).

---

## Project Structure

```
funni-bippi-be/
├── apps/
│   ├── api-gateway/              # Entry point — HTTP + WebSocket
│   │   └── src/
│   │       ├── main.ts           # Bootstrap (HTTP :3001 + Kafka consumer)
│   │       ├── app.module.ts     # Root module
│   │       ├── auth/             # POST /session/init, GET /health
│   │       ├── gateway/          # Socket.IO ChatGateway + Kafka broadcast consumer
│   │       └── upload/           # POST /upload, serves /files/*
│   │
│   ├── matching-service/         # Kafka microservice — matchmaking
│   │   └── src/
│   │       ├── main.ts
│   │       ├── matching.module.ts
│   │       ├── matching.controller.ts   # Kafka: user.join-queue, user.leave-queue
│   │       └── matching.service.ts    # Queue logic, pairing, 30s timeout
│   │
│   ├── chat-service/             # Kafka microservice — rooms & messages
│   │   └── src/
│   │       ├── main.ts
│   │       ├── chat.module.ts
│   │       ├── chat.controller.ts     # Kafka: match.found, chat.message, ...
│   │       └── chat.service.ts        # Room lifecycle, message relay
│   │
├── libs/
│   └── shared/                   # Shared across all apps (@app/shared)
│       └── src/
│           ├── dto/              # JoinQueueDto, SendMessageDto, ...
│           ├── events/           # Kafka topic constants
│           ├── guards/             # SessionGuard
│           ├── redis/            # RedisModule, RedisService
│           ├── types/            # RoomData, SessionData, MessagePayload, ...
│           └── utils/            # makeStranger() name generator
│
├── nginx/
│   └── nginx.conf                # Reverse proxy + rate limiting (optional)
├── docker-compose.yml            # Kafka + Zookeeper + Redis
├── FLOW.md                       # Detailed request flows (read this!)
├── package.json
└── nest-cli.json
```

> **Note:** `api-gateway` is the nest-cli default project, so bare `nest start` / `nest build` target it. The other two apps are started explicitly by name (`nest start matching-service`, etc.) — see [npm Scripts](#npm-scripts).

---

## Prerequisites

- **Node.js 22+**
- **Docker Desktop** (for Redis + Kafka)
- **npm** (project uses `package-lock.json`)

---

## Quick Start — Chat in the UI

To chat in the UI, you need **5 things running**: Redis + Kafka (Docker), then the **3 NestJS apps**, then the frontend.

### What you need

| Service | Why |
|---------|-----|
| **Redis** | Sessions, match queue, room data |
| **Kafka** | Messages between api-gateway, matching, chat |
| **api-gateway** | HTTP (`/session/init`, `/upload`) + WebSocket |
| **matching-service** | Pairs users |
| **chat-service** | Creates rooms, relays messages |

You do **not** need `notification-service` — it is not implemented yet.

---

### Step 1 — Start infrastructure (Docker)

```powershell
cd funni-bippi-be
docker compose up -d
```

Verify all 3 containers are running:

```powershell
docker ps
```

You should see `funni-redis`, `funni-kafka`, and `funni-zookeeper`.

---

### Step 2 — Install dependencies (first time only)

```powershell
cd funni-bippi-be
npm install
```

---

### Step 3 — Start the 3 backend apps

Use **3 separate terminals**, all from `funni-bippi-be`:

**Terminal 1 — API Gateway (port 3001)**

```powershell
npm run start:api
```

**Terminal 2 — Matching Service**

```powershell
npm run start:matching
```

**Terminal 3 — Chat Service**

```powershell
npm run start:chat
```

Wait until you see logs like:

- `API Gateway listening on :3001`
- `Redis connected`
- Kafka consumer joined (no crash)

> A brief Kafka "leadership election" error right after Docker starts is normal — it usually clears in a few seconds.

---

### Step 4 — Verify backend is ready

```powershell
# PowerShell
Invoke-RestMethod http://localhost:3001/health
```

Expected: `{ "status": "ok" }`

```bash
# macOS / Linux
curl http://localhost:3001/health
```

---

### Step 5 — Start the frontend

In another terminal:

```powershell
cd funni-bippi-fe
npm install   # first time only
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The FE defaults to `http://localhost:3001` for the backend, so no `.env` is required for local dev.

Optional — create `funni-bippi-fe/.env.local`:

```env
NEXT_PUBLIC_BE_URL=http://localhost:3001
```

---

### Step 6 — Test chat

1. Open **two browser tabs** (or two windows) at `http://localhost:3000`
2. In each tab, click **Start Chatting**
3. Both users should match and be able to send messages

One tab alone will only show the "searching" animation until a second user joins.

---

### Optional — Image uploads on Windows

Create the upload directory:

```powershell
New-Item -ItemType Directory -Force -Path C:\tmp\uploads
```

On Linux/macOS, files are saved to `/tmp/uploads` by default.

---

### Optional — Expose with ngrok (demo)

```bash
ngrok http 3001
```

Copy the `https://xxxx.ngrok.io` URL and set it as `NEXT_PUBLIC_BE_URL` in `funni-bippi-fe/.env.local`.

---

## Environment Variables

Create a `.env` file in `funni-bippi-be/` (all values have defaults for local dev):

```env
NODE_ENV=development
PORT=3001

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092

# Frontend (CORS)
FE_URL=http://localhost:3000

# File storage
UPLOAD_DIR=C:/tmp/uploads    # Windows default; use /tmp/uploads on Linux/macOS
MAX_FILE_SIZE_MB=5

# Session
SESSION_TTL_SECONDS=86400
```

| Variable | Default | Used by |
|----------|---------|---------|
| `PORT` | `3001` | api-gateway |
| `REDIS_URL` | `redis://localhost:6379` | All services |
| `KAFKA_BROKERS` | `localhost:9092` | All services |
| `FE_URL` | `http://localhost:3000` | CORS on api-gateway |
| `UPLOAD_DIR` | `C:/tmp/uploads` (Win) / `/tmp/uploads` | Upload + static files |
| `MAX_FILE_SIZE_MB` | `5` | Upload validation |
| `SESSION_TTL_SECONDS` | `86400` (24h) | Session TTL in Redis |

---

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run start:api` | Start api-gateway in watch mode (`:3001`) |
| `npm run start:api:2` | Start a 2nd api-gateway instance (`:3002`) — for scaling |
| `npm run start:api:3` | Start a 3rd api-gateway instance (`:3003`) — for scaling |
| `npm run start:matching` | Start matching-service in watch mode |
| `npm run start:matching:2` | Start a 2nd matching-service instance — for scaling |
| `npm run start:chat` | Start chat-service in watch mode |
| `npm run start:chat:2` | Start a 2nd chat-service instance — for scaling |
| `npm run build:all` | Build all three services |
| `npm run start:api:prod` | Run built api-gateway (`:3001`) |
| `npm run start:api:2:prod` | Run built api-gateway, 2nd instance (`:3002`) |
| `npm run start:api:3:prod` | Run built api-gateway, 3rd instance (`:3003`) |
| `npm run start:matching:prod` | Run built matching-service |
| `npm run start:chat:prod` | Run built chat-service |
| `npm run test` | Run unit tests |
| `npm run lint` | Run ESLint |

> See [Horizontal Scaling](#horizontal-scaling-multi-instance) for how the `:2`/`:3` scripts fit together with nginx.

---

## API & Socket Events

### REST (api-gateway)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/session/init` | Create anonymous session, return `{ sessionId, userId }` | None |
| `POST` | `/upload` | Upload image, return `{ imageUrl }` | Session |
| `GET` | `/files/:filename` | Serve uploaded image | None |
| `GET` | `/health` | Health check | None |

### Socket.IO — Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `user:join` | `{ gender, interest, sessionId }` | Join matchmaking queue — `gender` is the user's own gender (`'male' \| 'female'`), `interest` is who they want to match with (`'everyone' \| 'male' \| 'female'`) |
| `user:cancel` | — | Leave matchmaking queue |
| `chat:message` | `{ text, roomId }` | Send text message |
| `chat:image` | `{ imageUrl, roomId }` | Send image message |
| `chat:typing` | `{ roomId, typing }` | Typing indicator |
| `chat:reaction` | `{ roomId, messageId, emoji }` | React to a message — empty `emoji` clears the reaction (max 8 chars) |
| `chat:next` | `{ roomId }` | Skip to next stranger |
| `chat:report` | `{ roomId, reason? }` | Report and leave |

### Socket.IO — Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `match:found` | `{ roomId, stranger }` | Match successful |
| `chat:message` | `{ message }` | New message from stranger |
| `chat:image` | `{ imageUrl, time }` | Image from stranger |
| `chat:typing` | `{ typing }` | Stranger typing state |
| `chat:reaction` | `{ messageId, emoji }` | Stranger reacted to a message — `emoji` is `null` to clear |
| `chat:stranger_left` | — | Stranger disconnected |
| `error:no_match` | `{ reason }` | No match found (30s timeout) |

For full flow details on each event, see [FLOW.md](./FLOW.md).

---

## Kafka Topics

Defined in `libs/shared/src/events/kafka-events.ts`:

| Topic | Producer | Consumer | Purpose |
|-------|----------|----------|---------|
| `user.join-queue` | api-gateway | matching-service | User joins matchmaking |
| `user.leave-queue` | api-gateway | matching-service | User cancels queue |
| `match.found` | matching-service | chat-service | Two users matched |
| `chat.message` | api-gateway | chat-service | Text message relay |
| `chat.image` | api-gateway | chat-service | Image message relay |
| `chat.user-left` | api-gateway | chat-service | User left room / disconnected |
| `gateway.broadcast` | chat/matching-service | api-gateway | Push events to browser sockets |

---

## Redis Keys

| Key | Type | Value |
|-----|------|-------|
| `session:{sessionId}` | String (JSON) | `{ userId, socketId, interest, createdAt }` — TTL 24h |
| `socket:{socketId}` | String | `sessionId` — reverse lookup |
| `queue:male` | List | JSON `QueueEntry` objects (users whose own gender is male) |
| `queue:female` | List | JSON `QueueEntry` objects (users whose own gender is female) |
| `room:{roomId}` | Hash | `{ roomId, user1Id, user1SocketId, user2Id, user2SocketId, status, ... }` |
| `userRoom:{userId}` | String | `roomId` — reverse lookup for disconnect |

---

## Troubleshooting

### Quick checklist if chat doesn't work

| Check | Command / what to look for |
|-------|----------------------------|
| Docker running? | `docker ps` shows redis + kafka |
| API up? | `http://localhost:3001/health` → `{ "status": "ok" }` |
| All 3 Nest apps running? | api-gateway, matching-service, chat-service |
| FE pointing to BE? | `NEXT_PUBLIC_BE_URL=http://localhost:3001` or default |
| Testing with 2 users? | Need 2 tabs/windows to match |

### Kafka "leadership election" error on startup

If you see `There is no leader for this topic-partition` right after `docker compose up`, wait 5–10 seconds and restart the NestJS apps. Kafka needs a moment to elect leaders after first boot.

### Redis connection refused

Make sure Docker is running and Redis container is up:

```powershell
docker ps
docker logs funni-redis
```

### WebSocket connects but no match

- Ensure **matching-service** is running (not just api-gateway)
- Open a **second browser tab** — one user alone stays in the queue
- Check matching-service logs for `User ... (male/female, wants ...) joined queue:male/female`

### Messages not delivered

- Ensure **chat-service** is running
- Check that both users received `match:found` (room was created)
- Check chat-service logs for `Room ... created`

### Image upload fails

- Create the upload directory: `C:\tmp\uploads` (Windows) or `/tmp/uploads` (Linux/macOS)
- Max file size is 5 MB; only `image/*` MIME types are accepted

---

## Horizontal Scaling (Multi-Instance)

A single `api-gateway` process holds every WebSocket connection in its own memory. Realistic ceiling on one machine:

| Tuning | ~Max concurrent sockets |
|--------|------------------------|
| Default (no OS tuning) | ~10k (hits `ulimit -n` / default fd limits) |
| Tuned (`ulimit -n 1000000`, raised Node heap) | ~50k–100k |
| Heavily tuned, beefy single box | ~150k–200k (GC pauses start hurting latency for everyone) |

To go beyond that — and to get to ~1M concurrent users — you run **multiple `api-gateway` instances** behind a load balancer. `matching-service` and `chat-service` scale too, but only for Kafka throughput; they don't affect the socket ceiling.

### What changed to make this possible

`api-gateway` now uses a **Socket.IO Redis adapter** (`apps/api-gateway/src/redis-io.adapter.ts`). Without it, `server.to(roomId).emit(...)` / `server.to(socketId).emit(...)` only reach sockets connected to *that same process* — a message routed to instance A would never reach a user connected to instance B. The adapter makes all instances share room/broadcast state via Redis pub/sub, so it doesn't matter which instance holds the Kafka `gateway.broadcast` message or which instance holds the target socket.

### Step 1 — Run multiple api-gateway instances

Each instance needs its own `PORT` (the Kafka `clientId` is auto-suffixed with the port, so logs/metrics stay distinguishable). Open one terminal per instance:

```powershell
# Terminal 1
npm run start:api      # :3001

# Terminal 2
npm run start:api:2    # :3002

# Terminal 3 (optional)
npm run start:api:3    # :3003
```

All instances connect to the same Redis (adapter) and the same Kafka consumer group `api-gateway-consumer` — Kafka assigns the `gateway.broadcast` partition(s) to whichever instance(s) are in the group, and the Redis adapter relays the resulting `emit()` to whichever instance actually holds the target socket.

To add a 4th+ instance, copy a script in `package.json`:

```json
"start:api:4": "cross-env PORT=3004 nest start api-gateway --watch"
```

### Step 2 — Point nginx at all instances

`nginx/nginx.conf` already lists multiple upstream servers:

```nginx
upstream api_gateway {
  ip_hash;             # sticky sessions — keeps a client on one instance
  server localhost:3001;
  server localhost:3002;
  # server localhost:3003;
}
```

Uncomment/add a `server` line per running instance, then reload:

```powershell
nginx -t      # validate config
nginx -s reload
```

`ip_hash` is just an optimization (fewer cross-instance Redis adapter round-trips on reconnect) — correctness doesn't depend on it because of the Redis adapter.

### Step 3 — Scale matching-service / chat-service (optional, for throughput)

These are stateless Kafka consumers — just run more processes with the same group:

```powershell
npm run start:matching:2
npm run start:chat:2
```

**Catch:** Kafka topics auto-create with **1 partition**, so only one consumer per group actually receives messages — extra instances sit idle until you add partitions:

```powershell
docker exec -it funni-kafka kafka-topics --alter --topic user.join-queue --partitions 3 --bootstrap-server localhost:9092
docker exec -it funni-kafka kafka-topics --alter --topic user.leave-queue --partitions 3 --bootstrap-server localhost:9092
docker exec -it funni-kafka kafka-topics --alter --topic match.found --partitions 3 --bootstrap-server localhost:9092
docker exec -it funni-kafka kafka-topics --alter --topic chat.message --partitions 3 --bootstrap-server localhost:9092
docker exec -it funni-kafka kafka-topics --alter --topic chat.image --partitions 3 --bootstrap-server localhost:9092
docker exec -it funni-kafka kafka-topics --alter --topic chat.user-left --partitions 3 --bootstrap-server localhost:9092
```

### Step 4 — Verify cross-instance broadcast works

1. Start 2 api-gateway instances (Step 1) + matching-service + chat-service.
2. Point nginx at both (Step 2), or connect two browser tabs directly to `:3001` and `:3002`.
3. Open two tabs, each connecting to a **different** gateway instance, and start chatting.
4. If messages relay correctly between the two tabs, the Redis adapter is working — without it, the conversation would silently break whenever the two users land on different instances.

Each instance logs `[RedisIoAdapter] Socket.IO Redis adapter connected` on boot — confirm this appears for every instance.

### What this does NOT solve at 1M scale

- **Single Redis** becomes a bottleneck (sessions + queues + adapter pub/sub) → needs Redis Cluster.
- **Single nginx** becomes a bottleneck → needs multiple LBs / a cloud LB / DNS round-robin.
- Each `api-gateway` instance still caps out per the table above — 1M users needs roughly 10–50+ instances depending on tuning.

---

## Further Reading

- **[FLOW.md](./FLOW.md)** — Detailed step-by-step flows for every user action (session init, matchmaking, messaging, disconnect, etc.). Start here if you are new to NestJS.
- **[../documents/BACKEND_REQUIREMENTS.md](../documents/BACKEND_REQUIREMENTS.md)** — Full architecture spec, scaling strategy, and NestJS concept explanations.
