# Funni Bippi — Backend Requirements

> **Purpose:** Production-grade NestJS backend designed to scale to 1M+ concurrent users.
> **Current mode:** Local dev + ngrok demo. No persistent storage for chat (in-memory). Architecture is microservice-ready.

---

## Table of Contents

1. [Why NestJS](#1-why-nestjs)
2. [Architecture Overview](#2-architecture-overview)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [NestJS Concepts Explained](#5-nestjs-concepts-explained)
6. [Microservices Breakdown](#6-microservices-breakdown)
7. [Kafka Topics & Message Flows](#7-kafka-topics--message-flows)
8. [Redis Usage](#8-redis-usage)
9. [Socket.IO Gateway](#9-socketio-gateway)
10. [Matchmaking Algorithm](#10-matchmaking-algorithm)
11. [API Endpoints](#11-api-endpoints)
12. [Rate Limiting & Security](#12-rate-limiting--security)
13. [Scaling Strategy](#13-scaling-strategy)
14. [Detailed Flow Walkthroughs](#14-detailed-flow-walkthroughs)
15. [Setup Instructions](#15-setup-instructions)

---

## 1. Why NestJS

NestJS is a Node.js framework built on top of Express/Fastify. It is chosen for:

- **Structure:** Uses modules, controllers, services, and gateways — familiar if you know Angular or Spring Boot. Forces good separation of concerns.
- **Microservice-native:** Has built-in support for microservice transport layers (Kafka, NATS, Redis). You don't need to wire this manually.
- **Socket.IO native:** `@nestjs/websockets` makes WebSocket gateways first-class citizens — no boilerplate.
- **TypeScript-first:** Full type safety across the whole backend.
- **Decorator-driven:** Routes, validation, guards, and events are declared with decorators — clean and readable.

**Mental model for NestJS:**
```
HTTP Request  → Guard → Controller → Service → (Database / Redis / Kafka)
Socket Event  → Guard → Gateway   → Service → (Redis / Kafka / broadcast)
```

---

## 2. Architecture Overview

```
                    ┌─────────────────────┐
                    │  Load Balancer       │
                    │  Nginx               │
                    │  Sticky sessions     │
                    │  Rate limiting       │
                    │  SSL termination     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   API Gateway        │
                    │   NestJS app         │
                    │   Auth validation    │
                    │   Request routing    │
                    │   WebSocket upgrade  │
                    └──┬───┬───┬───┬───┬──┘
                       │   │   │   │   │
           ┌───────────┘   │   │   │   └───────────┐
           ▼               ▼   ▼   ▼               ▼
      ┌─────────┐  ┌──────────┐ ┌──────┐ ┌──────────────┐
      │  Auth   │  │ Matching │ │ Chat │ │    Upload    │
      │ Service │  │ Service  │ │ Svc  │ │   Service    │
      └────┬────┘  └────┬─────┘ └──┬───┘ └──────┬───────┘
           │            │          │             │
           └────────────┴──────────┴─────────────┘
                                │
                    ┌───────────▼──────────┐
                    │   Apache Kafka        │
                    │   Message Broker      │
                    │   Topics:             │
                    │   - match.found       │
                    │   - chat.message      │
                    │   - user.connected    │
                    │   - image.uploaded    │
                    └───────────┬──────────┘
                                │
              ┌─────────────────┴──────────────────┐
              ▼                                     ▼
    ┌─────────────────┐                   ┌──────────────────┐
    │     Redis        │                   │   In-memory       │
    │  Sessions        │                   │   Chat state      │
    │  Match queue     │                   │   Active rooms    │
    │  Socket adapter  │                   │   (per process)   │
    └─────────────────┘                   └──────────────────┘
```

---

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | **Node.js 22** | Latest LTS, best performance, native fetch |
| Framework | **NestJS 10** | Microservice-native, structured, Socket.IO support |
| Transport | **Kafka (KafkaJS)** | Industry-standard message broker, persistent, partitioned |
| Socket | **Socket.IO + @nestjs/websockets** | Real-time bidirectional, reconnection handling |
| Cache / Queue | **Redis (ioredis)** | Match queue, session store, Socket.IO multi-instance adapter |
| Load balancer | **Nginx** | Sticky sessions, rate limiting, reverse proxy |
| Validation | **class-validator + class-transformer** | NestJS standard DTO validation |
| Config | **@nestjs/config** | Environment variable management |
| File storage | **Local /tmp** | Temporary image storage, auto-cleared on session end |
| Language | **TypeScript** | Full type safety |

---

## 4. Project Structure

```
funni-bippi-be/
├── apps/
│   ├── api-gateway/              # Entry point — HTTP + WebSocket
│   │   ├── src/
│   │   │   ├── main.ts           # Bootstrap — Fastify/Express adapter
│   │   │   ├── app.module.ts     # Root module
│   │   │   ├── gateway/
│   │   │   │   └── chat.gateway.ts   # Socket.IO gateway (WebSocket events)
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts  # POST /session/init
│   │   │   │   └── auth.service.ts     # Create/validate anonymous sessions
│   │   │   └── upload/
│   │   │       ├── upload.module.ts
│   │   │       ├── upload.controller.ts  # POST /upload
│   │   │       └── upload.service.ts     # Save to /tmp, serve static
│   │
│   ├── matching-service/         # Matchmaking microservice
│   │   └── src/
│   │       ├── main.ts           # Kafka microservice bootstrap
│   │       ├── matching.module.ts
│   │       ├── matching.controller.ts  # Kafka message handlers
│   │       └── matching.service.ts     # Queue logic, gender filter, pairing
│   │
│   ├── chat-service/             # Chat room microservice
│   │   └── src/
│   │       ├── main.ts
│   │       ├── chat.module.ts
│   │       ├── chat.controller.ts  # Kafka message handlers
│   │       └── chat.service.ts     # Room management, message routing
│   │
│   └── notification-service/     # Optional — in-app events
│       └── src/
│           ├── main.ts
│           ├── notification.module.ts
│           └── notification.service.ts
│
├── libs/
│   └── shared/                   # Shared across all apps
│       ├── dto/
│       │   ├── join-queue.dto.ts
│       │   ├── send-message.dto.ts
│       │   └── upload-image.dto.ts
│       ├── events/
│       │   └── kafka-events.ts   # Kafka topic name constants
│       ├── types/
│       │   └── index.ts          # Shared types: Room, Stranger, Message
│       └── guards/
│           ├── session.guard.ts  # Validates session token on socket connect
│           └── throttle.guard.ts
│
├── nginx/
│   └── nginx.conf                # Load balancer + sticky session config
│
├── docker-compose.yml            # Kafka + Zookeeper + Redis local setup
└── .env                          # Environment variables
```

---

## 5. NestJS Concepts Explained

Since you are new to NestJS, here is a plain-English explanation of each concept used in this project.

### Module
A module groups related code together. Think of it as a feature folder with a registration file.

```ts
@Module({
  imports: [RedisModule, KafkaModule],
  controllers: [MatchingController],
  providers: [MatchingService],
})
export class MatchingModule {}
```

Every NestJS app has one root `AppModule` that imports all feature modules.

### Controller
Handles incoming requests (HTTP or Kafka messages). Calls services, returns results. No business logic here.

```ts
@Controller('session')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('init')
  async initSession(@Body() dto: InitSessionDto) {
    return this.authService.createSession(dto)
  }
}
```

### Service
Where all business logic lives. Called by controllers and gateways. Can be injected anywhere via NestJS dependency injection.

```ts
@Injectable()
export class MatchingService {
  async joinQueue(userId: string, gender: string) {
    // add to Redis queue, try to pair
  }
}
```

### Gateway (Socket.IO)
NestJS's equivalent of a Socket.IO server. Handles WebSocket events with decorators.

```ts
@WebSocketGateway({ cors: true })
export class ChatGateway {
  @SubscribeMessage('chat:message')
  handleMessage(@MessageBody() dto: SendMessageDto) {
    // handle incoming message
  }
}
```

### Guard
Runs before a controller/gateway method. Used to validate sessions, auth tokens, or rate limits. Returns `true` to allow, throws exception to deny.

```ts
@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const socket = context.switchToWs().getClient()
    return !!socket.handshake.auth.sessionId
  }
}
```

### DTO (Data Transfer Object)
A class that defines the shape of incoming data. Uses `class-validator` decorators for automatic validation.

```ts
export class SendMessageDto {
  @IsString()
  @MaxLength(2000)
  text: string

  @IsUUID()
  roomId: string
}
```

### Microservice Transport
NestJS has built-in Kafka transport. A microservice listens on Kafka topics instead of HTTP routes.

```ts
// main.ts — microservice bootstrap
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: { brokers: ['localhost:9092'] },
    consumer: { groupId: 'matching-consumer' },
  },
})
```

---

## 6. Microservices Breakdown

### API Gateway
**Role:** The only service exposed to the outside world.
- Accepts HTTP requests (session init, file upload)
- Accepts WebSocket connections (Socket.IO)
- Validates session tokens via `SessionGuard`
- Routes socket events to appropriate microservices via Kafka
- Does NOT do business logic

### Matching Service
**Role:** Manages the matchmaking queue and pairs users.
- Listens on Kafka topic `user.join-queue`
- Maintains two Redis sorted sets: `queue:everyone`, `queue:male`, `queue:female`
- When two compatible users are found: publishes `match.found` to Kafka
- Handles cancellations and timeouts

### Chat Service
**Role:** Manages active chat rooms and message delivery.
- Listens on `match.found` — creates a room, stores in Redis
- Listens on `chat.message` — validates, publishes back to gateway for broadcast
- Manages "stranger left" events when a socket disconnects
- Tracks active rooms in Redis hash: `room:{roomId}`

### Upload Service
**Role:** Handles image uploads.
- Receives `POST /upload` via REST (proxied through API gateway)
- Saves to `/tmp/uploads/{uuid}.{ext}`
- Registers a cleanup job (delete after session ends)
- Returns public URL: `/files/{uuid}.{ext}`
- NestJS `ServeStaticModule` serves `/tmp/uploads` as static files

### Notification Service
**Role:** In-app events (match found, stranger left, etc.)
- Subscribes to relevant Kafka topics
- Emits Socket.IO events back through the gateway
- Can be extended later with push notifications

---

## 7. Kafka Topics & Message Flows

### Topic Definitions

```ts
// libs/shared/events/kafka-events.ts
export const KafkaTopics = {
  USER_JOIN_QUEUE:    'user.join-queue',
  USER_LEAVE_QUEUE:   'user.leave-queue',
  MATCH_FOUND:        'match.found',
  CHAT_MESSAGE:       'chat.message',
  CHAT_IMAGE:         'chat.image',
  CHAT_TYPING:        'chat.typing',
  CHAT_USER_LEFT:     'chat.user-left',
  IMAGE_UPLOADED:     'image.uploaded',
} as const
```

### Message Payloads

```ts
// user.join-queue
{ userId: string, gender: 'everyone' | 'male' | 'female', socketId: string }

// match.found
{ roomId: string, user1: { userId, socketId }, user2: { userId, socketId }, stranger: StrangerProfile }

// chat.message
{ roomId: string, fromUserId: string, text: string, messageId: string, timestamp: number }

// chat.image
{ roomId: string, fromUserId: string, imageUrl: string, messageId: string, timestamp: number }
```

### Why Kafka over direct service calls?

With direct calls (Service A calls Service B's HTTP endpoint), if Service B is down, the request fails. With Kafka:
- Messages are **persisted** — if a service restarts, it picks up where it left off
- Services are **decoupled** — Matching Service doesn't know Chat Service exists
- **Horizontal scaling** — multiple instances of Chat Service can consume the same topic with a consumer group, Kafka distributes the work

---

## 8. Redis Usage

### Match Queue

```
Key: queue:everyone   (Redis List — LPUSH / BRPOP)
Key: queue:male       (Redis List)
Key: queue:female     (Redis List)

Value: JSON string { userId, socketId, joinedAt }
```

When a user joins, pushed to the appropriate queue. Matching Service pops two users from the same queue and pairs them.

### Active Rooms

```
Key: room:{roomId}    (Redis Hash)
Fields:
  user1Id, user1SocketId
  user2Id, user2SocketId
  createdAt, status: 'active' | 'ended'
```

Used by Chat Service to know which two sockets are in a room, and by the gateway to route messages.

### Sessions

```
Key: session:{sessionId}   (Redis String, TTL: 24h)
Value: JSON string { userId, socketId, gender, createdAt }
```

Created on `POST /session/init`, validated on every socket connection.

### Socket.IO Adapter

When running multiple API Gateway instances, Socket.IO needs a shared state so that a message from User A (connected to Instance 1) can reach User B (connected to Instance 2).

```ts
// main.ts
import { createAdapter } from '@socket.io/redis-adapter'

const pubClient = new Redis(redisUrl)
const subClient = pubClient.duplicate()
io.adapter(createAdapter(pubClient, subClient))
```

This makes all instances share the same Socket.IO room state via Redis Pub/Sub.

---

## 9. Socket.IO Gateway

```ts
@WebSocketGateway({
  cors: { origin: process.env.FE_URL, credentials: true },
  transports: ['websocket'],
})
@UseGuards(SessionGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server

  // User connects → emit to Kafka: user.connected
  handleConnection(client: Socket) { ... }

  // User disconnects → emit to Kafka: chat.user-left
  handleDisconnect(client: Socket) { ... }

  @SubscribeMessage('user:join')
  handleJoinQueue(@ConnectedSocket() client: Socket, @MessageBody() dto: JoinQueueDto) {
    // Publish to Kafka: user.join-queue
  }

  @SubscribeMessage('chat:message')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() dto: SendMessageDto) {
    // Validate user is in the room they claim
    // Publish to Kafka: chat.message
  }

  @SubscribeMessage('chat:typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() dto: TypingDto) {
    // Directly broadcast to room (no Kafka needed — fire and forget)
    client.to(dto.roomId).emit('chat:typing', { typing: dto.typing })
  }

  // Called by Chat Service (via Kafka consumer) to broadcast message to room
  broadcastMessage(roomId: string, message: MessagePayload) {
    this.server.to(roomId).emit('chat:message', { message })
  }
}
```

---

## 10. Matchmaking Algorithm

```
User A joins with filter = "everyone"
  → LPUSH queue:everyone { userId: A, socketId: A, joinedAt: now }
  → Check if queue:everyone has >= 2 users

  If queue has another user:
    → RPOP queue:everyone → User B
    → Generate roomId (uuid)
    → Generate stranger profile for each user:
        { name: "FrostyQuokka89", gender: detected, grad: [color1, color2], interests: [] }
    → HSET room:{roomId} user1Id=A user1SocketId=A user2Id=B user2SocketId=B status=active
    → Publish to Kafka: match.found
    → Chat Service consumes: joins both sockets to Socket.IO room {roomId}
    → Gateway emits to both: match:found { roomId, stranger }

  If queue is empty:
    → Stay in queue, wait for next user
    → Timeout after 30s: emit error:no_match
```

### Gender Filtering

```
User A filter = "female"
  → LPUSH queue:female { userId: A }
  → Check queue:female for another user

User B filter = "everyone"
  → Check queue:everyone AND queue:female AND queue:male
  → "everyone" users can match with anyone
```

---

## 11. API Endpoints

### REST (via API Gateway)

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/session/init` | Create anonymous session, return `sessionId` | None |
| `POST` | `/upload` | Upload image, return `{ imageUrl }` | Session token |
| `GET` | `/files/:filename` | Serve image from /tmp | None |
| `GET` | `/health` | Health check for load balancer | None |

### Socket.IO Events

**Client → Server:**

| Event | Payload | Description |
|---|---|---|
| `user:join` | `{ gender, sessionId }` | Join matchmaking queue |
| `user:cancel` | — | Leave matchmaking queue |
| `chat:message` | `{ text, roomId }` | Send text message |
| `chat:image` | `{ imageUrl, roomId }` | Send image message |
| `chat:typing` | `{ roomId, typing }` | Typing indicator |
| `chat:next` | `{ roomId }` | Disconnect from current, re-join queue |
| `chat:report` | `{ roomId, reason }` | Report current stranger |

**Server → Client:**

| Event | Payload | Description |
|---|---|---|
| `match:found` | `{ roomId, stranger }` | Match successful |
| `chat:message` | `{ message }` | New message from stranger |
| `chat:image` | `{ imageUrl, time }` | Image from stranger |
| `chat:typing` | `{ typing }` | Stranger typing state |
| `chat:stranger_left` | — | Stranger disconnected |
| `error:no_match` | `{ reason }` | No match found (timeout) |

---

## 12. Rate Limiting & Security

### Nginx rate limiting (edge level)

```nginx
# nginx.conf
limit_req_zone $binary_remote_addr zone=global:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=upload:10m rate=5r/m;

server {
  location / {
    limit_req zone=global burst=10 nodelay;
  }
  location /upload {
    limit_req zone=upload burst=3 nodelay;
    client_max_body_size 5m;
  }
}
```

### NestJS throttle guard (application level)

```ts
// Protect REST endpoints with @nestjs/throttler
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 10, ttl: 60000 } })
@Post('session/init')
```

### Socket.IO connection guard

- Every socket connection must present a valid `sessionId` in `handshake.auth`
- Session validated against Redis on connect
- Invalid sessions are immediately disconnected

### Message validation

All incoming Socket.IO payloads validated via DTOs with `class-validator`:
- Max text message length: 2000 characters
- Image URLs validated against trusted `/files/` path pattern
- Room IDs validated as UUID format
- Users can only send to rooms they are members of (checked against Redis)

### CORS

```ts
// main.ts
app.enableCors({
  origin: process.env.FE_URL,
  credentials: true,
})
```

---

## 13. Scaling Strategy

### Phase 1 — Current (Local + ngrok)

Single instance of everything. Redis and Kafka run via Docker Compose. This is your current setup.

```
Nginx → API Gateway (×1) → Kafka → Matching (×1) + Chat (×1)
```

### Phase 2 — Horizontal Scaling (Future)

Add more instances of the API Gateway and Chat Service. Kafka distributes work across consumer groups. Redis adapter syncs Socket.IO rooms across gateway instances.

```
Nginx (sticky sessions)
    ├── API Gateway instance 1
    ├── API Gateway instance 2
    └── API Gateway instance 3
           ↕ Redis Socket.IO adapter
           ↕ Kafka
    ├── Matching Service (×2, same consumer group)
    └── Chat Service (×3, same consumer group)
```

**Key: sticky sessions** — Nginx must always route the same user to the same API Gateway instance using their IP or a cookie. This ensures their socket stays alive.

### Phase 3 — Full Microservice Scale (1M+ users)

- Each service in its own Kubernetes deployment with HPA (auto-scaling)
- Kafka partitioned by `roomId` — all messages for a room always go to the same partition, same consumer
- Redis Cluster (sharded) for high-availability
- CDN for serving images instead of `/tmp`
- PostgreSQL added for user preferences and analytics

---

## 14. Detailed Flow Walkthroughs

### Flow 1: User Connects for the First Time

```
1. Browser loads Funni Bippi FE (Next.js)
2. FE calls POST /session/init
3. API Gateway creates sessionId (UUID), stores in Redis with TTL 24h
4. Returns { sessionId } to FE
5. FE stores sessionId in memory (Zustand store)
6. User sees Landing screen
```

### Flow 2: User Starts Matchmaking

```
1. User clicks "Start Chatting" with filter = "everyone"
2. FE connects Socket.IO with { auth: { sessionId } }
3. API Gateway SessionGuard validates sessionId against Redis ✓
4. Socket connected → Gateway emits to Kafka: user.connected
5. FE emits: user:join { gender: 'everyone', sessionId }
6. Gateway publishes to Kafka: user.join-queue { userId, socketId, gender }
7. Matching Service consumes user.join-queue
8. Adds user to Redis queue: LPUSH queue:everyone { userId, socketId }
9. Checks if another user is waiting:
   - Queue is empty → wait (user sees radar animation)
   - Queue has user B → proceed to Flow 3
```

### Flow 3: Match Found

```
1. Matching Service POPs user B from queue
2. Generates roomId (UUID)
3. Generates stranger profiles for both A (sees B's profile) and B (sees A's profile)
4. Stores room in Redis: HSET room:{roomId} ...
5. Publishes to Kafka: match.found { roomId, user1: A, user2: B, strangerForA, strangerForB }
6. Chat Service consumes match.found
7. Chat Service joins both sockets to Socket.IO room: server.in(A.socketId).socketsJoin(roomId)
8. Chat Service tells Gateway to emit to both users
9. Gateway emits to A: match:found { roomId, stranger: strangerForA }
10. Gateway emits to B: match:found { roomId, stranger: strangerForB }
11. FE for both users: fires confetti, shows toast "✨ You matched!", transitions to Chat screen
```

### Flow 4: Sending a Message

```
1. User A types a message and hits Send
2. FE emits: chat:message { text: "hey!", roomId }
3. API Gateway validates:
   - sessionId valid ✓
   - user A is in room {roomId} (check Redis) ✓
   - text passes DTO validation (max length, not empty) ✓
4. Gateway publishes to Kafka: chat.message { roomId, fromUserId: A, text, messageId, timestamp }
5. Chat Service consumes chat.message
6. Chat Service broadcasts via Gateway: server.to(roomId).emit('chat:message', { message })
7. Both A and B receive chat:message
8. A's FE: message bubble already shown (optimistic) — deduplicates by messageId
9. B's FE: new message bubble appears with pop-in animation
```

### Flow 5: Image Upload and Send

```
1. User A attaches or pastes an image in the composer
2. FE sends POST /upload (multipart/form-data) with file
3. API Gateway Upload Controller receives file
4. Validates: type is image/*, size < 5MB
5. Saves to /tmp/uploads/{uuid}.{ext}
6. Registers cleanup: delete file when room ends
7. Returns { imageUrl: '/files/{uuid}.{ext}' }
8. FE emits: chat:image { imageUrl, roomId }
9. Same flow as Flow 4 from step 3 onward
10. B's FE renders image bubble: <img src={imageUrl} />
```

### Flow 6: Stranger Disconnects

```
1. User B closes their tab or loses connection
2. Socket.IO detects disconnect
3. API Gateway handleDisconnect fires
4. Gateway looks up roomId for B's socketId in Redis
5. Publishes to Kafka: chat.user-left { roomId, userId: B }
6. Chat Service consumes chat.user-left
7. Chat Service updates room status in Redis: HSET room:{roomId} status=ended
8. Chat Service triggers image cleanup for roomId
9. Gateway emits to A: chat:stranger_left
10. A's FE shows system message: "Stranger has left the chat 👋"
11. A can click "Next stranger" to re-enter matchmaking
```

### Flow 7: User Clicks "Next Stranger"

```
1. User A clicks "Next stranger"
2. FE emits: chat:next { roomId }
3. Gateway:
   - Marks old room as ended in Redis
   - Removes A from Socket.IO room
   - Emits chat:stranger_left to the other user (if still connected)
4. Gateway emits user:join internally → back to Flow 2 step 6
5. FE transitions back to matching screen (radar animation)
```

---

## 15. Setup Instructions

### Prerequisites

- Node.js 22+
- Docker + Docker Compose (for Kafka + Redis)
- pnpm

### Step 1 — Clone and Install

```bash
# Create NestJS monorepo
npx @nestjs/cli new funni-bippi-be --package-manager pnpm
cd funni-bippi-be

# Generate microservice apps
nest generate app api-gateway
nest generate app matching-service
nest generate app chat-service
nest generate app notification-service

# Generate shared library
nest generate library shared

# Install dependencies
pnpm add @nestjs/microservices @nestjs/websockets @nestjs/platform-socket.io
pnpm add @nestjs/config @nestjs/throttler @nestjs/serve-static
pnpm add kafkajs socket.io @socket.io/redis-adapter
pnpm add ioredis uuid class-validator class-transformer
pnpm add multer @types/multer
pnpm add -D @types/uuid @types/multer
```

### Step 2 — Start Kafka + Redis via Docker

```yaml
# docker-compose.yml
version: '3.8'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    depends_on: [zookeeper]
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

```bash
docker-compose up -d
# Verify: docker-compose ps (all 3 should be running)
```

### Step 3 — Environment Variables

```bash
# .env
NODE_ENV=development
PORT=3001

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092

# Frontend
FE_URL=http://localhost:3000

# File storage
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE_MB=5

# Session
SESSION_TTL_SECONDS=86400
```

### Step 4 — Run Services

```bash
# Terminal 1 — API Gateway (HTTP + WebSocket)
pnpm run start:dev api-gateway

# Terminal 2 — Matching Service
pnpm run start:dev matching-service

# Terminal 3 — Chat Service
pnpm run start:dev chat-service

# Optional Terminal 4 — Notification Service
pnpm run start:dev notification-service
```

### Step 5 — Nginx (Load Balancer)

For local demo, Nginx is optional — you can hit the API Gateway directly. When you want to simulate scaling:

```bash
brew install nginx   # macOS
# or
sudo apt install nginx  # Ubuntu
```

```nginx
# /etc/nginx/nginx.conf (or nginx/nginx.conf in project)
events {}

http {
  upstream api_gateway {
    ip_hash;  # sticky sessions — same IP always hits same instance
    server localhost:3001;
    server localhost:3002;  # second instance when scaling
  }

  limit_req_zone $binary_remote_addr zone=global:10m rate=30r/s;

  server {
    listen 80;

    location / {
      limit_req zone=global burst=10 nodelay;
      proxy_pass http://api_gateway;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";  # required for WebSocket
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }

    location /upload {
      client_max_body_size 5m;
      proxy_pass http://api_gateway;
    }
  }
}
```

```bash
nginx -t          # test config
nginx             # start (or: sudo systemctl start nginx)
```

### Step 6 — Expose with ngrok

```bash
brew install ngrok   # or download from ngrok.com
ngrok authtoken YOUR_TOKEN

ngrok http 80   # if using Nginx
# or
ngrok http 3001  # if hitting API Gateway directly
```

Copy the `https://xxxx.ngrok.io` URL and set it as `NEXT_PUBLIC_BE_URL` in the FE `.env.local`.

### Step 7 — Verify Everything Works

```bash
# Check Kafka topics were created
docker exec -it <kafka-container-id> kafka-topics --list --bootstrap-server localhost:9092

# Check Redis is alive
redis-cli ping   # → PONG

# Health check
curl http://localhost:3001/health   # → { "status": "ok" }
```

---

## Why We Chose Each Technology

| Choice | Reason |
|---|---|
| **NestJS** | Forces structure (modules/services/controllers) that scales from 1 to 100 engineers. Built-in support for everything we need. |
| **Kafka** | Unlike Redis Pub/Sub, Kafka persists messages — if a service restarts during a match, no data is lost. Consumer groups let multiple instances share load automatically. Real-world: Discord, Uber, LinkedIn all use Kafka at scale. |
| **Redis** | The Swiss Army knife of this architecture — sessions, match queues, and Socket.IO multi-instance coordination all in one. Sub-millisecond latency. |
| **Socket.IO** | WebSocket with fallbacks, built-in room concept (perfect for chat pairs), automatic reconnection, and native NestJS support. |
| **Nginx** | The industry-standard proxy. Sticky sessions are essential for Socket.IO — without them, a user might reconnect to a different backend instance and lose their socket room. |
| **TypeScript** | Catches bugs at compile time. With a complex event-driven system (Kafka → Socket.IO), shared types in `libs/shared` prevent subtle payload mismatches. |
