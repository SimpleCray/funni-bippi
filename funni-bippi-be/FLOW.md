# Funni Bippi — Backend Detailed Flow

> This document explains **everything** that happens in the backend, from the moment the frontend makes a request to the moment a response reaches the user. Written for someone new to NestJS.

---

## Table of Contents

1. [How to Read This Document](#1-how-to-read-this-document)
2. [Big Picture: What Each Service Does](#2-big-picture-what-each-service-does)
3. [NestJS Concepts You Need to Know](#3-nestjs-concepts-you-need-to-know)
4. [How Services Talk to Each Other](#4-how-services-talk-to-each-other)
5. [The Three Processes Running at Once](#5-the-three-processes-running-at-once)
6. [Redis: The Shared Memory](#6-redis-the-shared-memory)
7. [Kafka: The Message Bus](#7-kafka-the-message-bus)
8. [Flow 1 — First Visit: Session Initialization](#8-flow-1--first-visit-session-initialization)
9. [Flow 2 — WebSocket Connection](#9-flow-2--websocket-connection)
10. [Flow 3 — Joining the Matchmaking Queue](#10-flow-3--joining-the-matchmaking-queue)
11. [Flow 4 — A Match is Found](#11-flow-4--a-match-is-found)
12. [Flow 5 — Sending a Text Message](#12-flow-5--sending-a-text-message)
13. [Flow 6 — Typing Indicator](#13-flow-6--typing-indicator)
14. [Flow 7 — Uploading and Sending an Image](#14-flow-7--uploading-and-sending-an-image)
15. [Flow 8 — Stranger Disconnects (Tab Closed)](#15-flow-8--stranger-disconnects-tab-closed)
16. [Flow 9 — User Clicks "Next Stranger"](#16-flow-9--user-clicks-next-stranger)
17. [Flow 10 — Matchmaking Timeout (No One Found)](#17-flow-10--matchmaking-timeout-no-one-found)
18. [Flow 11 — Cancelling the Queue](#18-flow-11--cancelling-the-queue)
19. [The `gateway.broadcast` Loop Explained](#19-the-gatewaybroadcast-loop-explained)
20. [File-by-File Reference](#20-file-by-file-reference)

---

## 1. How to Read This Document

Each "Flow" section walks through a user action step-by-step. Every step shows:

- **Who does the work** (Frontend, API Gateway, Kafka, Matching Service, Chat Service, Redis)
- **What code runs** (file name + what it does)
- **What data moves** (exact payloads)

Think of it as a relay race. The baton (data) gets passed from runner to runner. Each runner (service) does one job and passes it along.

```
FE ──► API Gateway ──► Kafka ──► Matching/Chat Service ──► Kafka ──► API Gateway ──► FE
```

---

## 2. Big Picture: What Each Service Does

There are **3 Node.js processes** running at the same time:

| Process | File started | Port | Talks via |
|---------|-------------|------|-----------|
| **api-gateway** | `apps/api-gateway/src/main.ts` | `:3001` | HTTP + WebSocket + Kafka (producer + consumer) |
| **matching-service** | `apps/matching-service/src/main.ts` | no HTTP port | Kafka only |
| **chat-service** | `apps/chat-service/src/main.ts` | no HTTP port | Kafka only |

Plus two external services running in Docker:

| Service | Port | What it stores |
|---------|------|----------------|
| **Redis** | `:6379` | Sessions, socket→session mappings, match queues, room data |
| **Kafka** | `:9092` | Message bus — events flow between services through topics |

### One-line job descriptions

- **api-gateway** — The gatekeeper. All traffic from the browser comes here first. It validates identity, then dispatches events via Kafka. It also listens for outbound broadcasts from Kafka and sends them to the right socket.
- **matching-service** — The matchmaker. Manages Redis queues, pairs two users together, publishes the match.
- **chat-service** — The room manager. Creates rooms in Redis, routes messages to the right people, handles users leaving.

---

## 3. NestJS Concepts You Need to Know

Before reading the flows, understand these 6 concepts. They appear constantly.

### 3.1 Module

A module is like a folder with a registration file. It tells NestJS: "these controllers and services belong together, wire them up."

```typescript
// apps/api-gateway/src/gateway/gateway.module.ts
@Module({
  imports: [AuthModule, ClientsModule.register([...kafka config...])],
  providers: [ChatGateway],        // available for injection inside this module
  controllers: [GatewayBroadcastController],
  exports: [ChatGateway],          // available for other modules to inject
})
export class GatewayModule {}
```

Every app has a root module (`AppModule`) that imports all feature modules. NestJS reads these and builds a dependency graph automatically.

### 3.2 Controller

Handles incoming requests and delegates to a service. Contains no business logic — it's just a router.

**For HTTP:** Uses `@Get()`, `@Post()` decorators.  
**For Kafka:** Uses `@EventPattern('topic.name')` decorators.

```typescript
// apps/matching-service/src/matching.controller.ts
@Controller()
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @EventPattern(KafkaTopics.USER_JOIN_QUEUE)  // "when Kafka sends user.join-queue..."
  async handleJoinQueue(@Payload() data: { userId, socketId, gender, interest }) {
    await this.matchingService.joinQueue(data);  // "...call this service method"
  }
}
```

### 3.3 Service

Where **all business logic lives**. Services are `@Injectable()` — NestJS creates one instance and injects it wherever it's needed.

```typescript
// apps/matching-service/src/matching.service.ts
@Injectable()
export class MatchingService {
  constructor(
    private readonly redis: RedisService,       // injected automatically
    @Inject('KAFKA_CLIENT') private readonly kafka: ClientKafka,  // also injected
  ) {}

  async joinQueue(entry: { userId, socketId, gender, interest }) {
    // This is where the real work happens
    await this.redis.lpush(`queue:${entry.gender}`, JSON.stringify(entry));
    // ... try to match, set timeout, etc.
  }
}
```

### 3.4 Gateway (Socket.IO)

NestJS's special class for WebSocket servers. `@WebSocketGateway()` turns a class into a Socket.IO server. Event handlers use `@SubscribeMessage('event:name')`.

```typescript
// apps/api-gateway/src/gateway/chat.gateway.ts
@WebSocketGateway({ cors: { origin: '...' }, transports: ['websocket'] })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;  // the raw Socket.IO server instance

  handleConnection(client: Socket) { /* called when browser connects */ }
  handleDisconnect(client: Socket) { /* called when browser disconnects */ }

  @SubscribeMessage('user:join')  // "when FE emits 'user:join'..."
  handleJoinQueue(@ConnectedSocket() client, @MessageBody() dto) {
    // ...do something
  }
}
```

### 3.5 Guard

Runs **before** a handler. Returns `true` to allow, throws an exception to deny. Used for auth.

```typescript
// libs/shared/src/guards/session.guard.ts
@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const sessionId = client.handshake?.auth?.sessionId;
    if (!sessionId) throw new WsException('Missing sessionId');
    return true;  // allow the request to proceed
  }
}
```

The `@UseGuards(SessionGuard)` decorator on a handler means the guard runs first.

> **What happens when a guard (or validation) throws?** A global WS exception filter — `libs/shared/src/filters/ws-exception.filter.ts`, applied via `@UseFilters(new WsExceptionFilter())` on `ChatGateway` — catches every throw from a socket guard, `ValidationPipe`, or handler body. Instead of leaking Nest's raw `exception` event, it emits a single predictable event back to that client:
>
> ```
> error:server  { event, message }
>   event:   the socket event that failed (e.g. "user:join"), or "unknown"
>   message: the WsException reason or validation message
> ```
>
> The FE listens for `error:server` in `hooks/useSocket.ts` and shows a toast. The error is also logged server-side (warn + stack). Note: this is gateway-scoped on purpose — registering it as a truly global filter would also wrongly catch HTTP exceptions.

### 3.6 Dependency Injection (DI)

NestJS manages object creation. You declare what you need in the constructor, and NestJS provides it automatically. You never call `new SomeService()` manually.

```typescript
// You write this:
constructor(private readonly redis: RedisService) {}

// NestJS does this for you at startup:
const redis = new RedisService();
const myService = new MyService(redis);
```

This is why services and modules need to be registered — it's how NestJS knows what to create and inject.

### 3.7 Decorator Reference Table

Every decorator actually used in this backend, what it does, and where to see it. The last group (`class-validator`) is not part of NestJS itself — it ships separately and is applied on DTO fields, which NestJS's `ValidationPipe` enforces automatically.

#### Module & DI (wiring)

| Decorator | Package | What it does | Example location |
|-----------|---------|--------------|------------------|
| `@Module()` | `@nestjs/common` | Declares a module: its `imports`, `providers`, `controllers`, `exports` | `apps/api-gateway/src/app.module.ts` |
| `@Global()` | `@nestjs/common` | Marks a module global so its exports inject anywhere without re-importing | `libs/shared/src/redis/redis.module.ts` |
| `@Injectable()` | `@nestjs/common` | Marks a class as a provider that DI can construct and inject | `*.service.ts`, `session.guard.ts` |
| `@Inject(TOKEN)` | `@nestjs/common` | Injects a provider by DI token (used for `KAFKA_CLIENT`) | `chat.gateway.ts`, `matching.service.ts` |

#### HTTP controllers (api-gateway only)

| Decorator | Package | What it does | Example location |
|-----------|---------|--------------|------------------|
| `@Controller()` | `@nestjs/common` | Marks a class as a request/event handler (HTTP routes or Kafka patterns) | `auth.controller.ts` |
| `@Get()` | `@nestjs/common` | Maps an HTTP GET route to a method | `auth.controller.ts` (`/health`) |
| `@Post()` | `@nestjs/common` | Maps an HTTP POST route to a method | `auth.controller.ts` (`/session/init`), `upload.controller.ts` (`/upload`) |
| `@UseInterceptors()` | `@nestjs/common` | Attaches an interceptor — here Multer's `FileInterceptor` for upload parsing | `upload.controller.ts` |
| `@UploadedFile()` | `@nestjs/common` | Extracts the parsed file from a multipart request | `upload.controller.ts` |

#### Kafka microservice (all 3 services)

| Decorator | Package | What it does | Example location |
|-----------|---------|--------------|------------------|
| `@EventPattern(topic)` | `@nestjs/microservices` | Subscribes a method to a Kafka topic (fire-and-forget consumer) | `matching.controller.ts`, `chat.controller.ts`, `gateway-broadcast.controller.ts` |
| `@Payload()` | `@nestjs/microservices` | Extracts the message body from an incoming Kafka event | same files as above |

#### WebSocket gateway (api-gateway only)

| Decorator | Package | What it does | Example location |
|-----------|---------|--------------|------------------|
| `@WebSocketGateway()` | `@nestjs/websockets` | Turns a class into a Socket.IO server (with CORS / transport opts) | `chat.gateway.ts` |
| `@WebSocketServer()` | `@nestjs/websockets` | Injects the raw Socket.IO `Server` instance | `chat.gateway.ts` |
| `@SubscribeMessage(event)` | `@nestjs/websockets` | Handles an inbound socket event (`user:join`, `chat:message`, …) | `chat.gateway.ts` |
| `@ConnectedSocket()` | `@nestjs/websockets` | Injects the connected client socket into the handler | `chat.gateway.ts` |
| `@MessageBody()` | `@nestjs/websockets` | Extracts the event payload (validated against a DTO) | `chat.gateway.ts` |

#### Guards, pipes, filters (cross-cutting)

| Decorator | Package | What it does | Example location |
|-----------|---------|--------------|------------------|
| `@UseGuards(SessionGuard)` | `@nestjs/common` | Runs a guard before the handler — here the sessionId check | `chat.gateway.ts` |
| `@UsePipes(ValidationPipe)` | `@nestjs/common` | Validates/transforms the payload before the handler runs | `chat.gateway.ts` |
| `@UseFilters(WsExceptionFilter)` | `@nestjs/common` | Catches thrown exceptions and emits `error:server` to the client | `chat.gateway.ts` |
| `@Catch()` | `@nestjs/common` | Declares which exception types a filter class handles | `ws-exception.filter.ts` |

#### DTO validation (`class-validator`, enforced by `ValidationPipe`)

| Decorator | What it validates | Example location |
|-----------|-------------------|------------------|
| `@IsString()` | Value is a string | all DTOs |
| `@IsUUID()` | Value is a valid UUID (roomId, sessionId, messageId) | `join-queue.dto.ts`, `send-message.dto.ts` |
| `@IsIn([...])` | Value is one of an allowed set (`gender`, `interest`) | `join-queue.dto.ts` |
| `@MaxLength(n)` | String length ≤ n (message text, emoji) | `send-message.dto.ts` |
| `@Matches(regex)` | String matches a regex pattern | `send-message.dto.ts` |
| `@IsOptional()` | Skips validation when the field is absent | `send-message.dto.ts` |

> Note `@IsUrl()` appears in this doc's image-upload example but the live DTO (`upload-image.dto.ts`) uses `@IsString()` + `@IsUUID()`. Treat the table as the source of truth for what's actually wired.

---

## 4. How Services Talk to Each Other

Services **never call each other directly over HTTP**. Everything goes through **Kafka topics**.

```
Service A                  Kafka                   Service B
─────────                 ───────                 ─────────
kafka.emit(               topic:                  @EventPattern(
  'some.topic',    ──►    some.topic     ──►       'some.topic'
  { data }                               )
)                                        controller.handle(data)
                                         service.doWork(data)
```

Why? Because services don't know each other exist. The matching-service doesn't import anything from the chat-service. This means you can restart, scale, or replace any service without touching the others.

There is one special topic — `gateway.broadcast` — that goes in reverse:

```
Chat/Matching Service  ──►  Kafka: gateway.broadcast  ──►  API Gateway  ──►  Socket.IO  ──►  Browser
```

This is how backend services push events to specific browser sockets.

---

## 5. The Three Processes Running at Once

### api-gateway (`apps/api-gateway/src/main.ts`)

```typescript
const app = await NestFactory.create(AppModule);      // HTTP server
app.connectMicroservice({                              // also a Kafka consumer
  transport: Transport.KAFKA,
  options: { client: { brokers: [...] }, consumer: { groupId: 'api-gateway-consumer' } },
});
await app.startAllMicroservices();  // start Kafka consumer
await app.listen(3001);             // start HTTP server
```

This process is **both** an HTTP/WebSocket server (for browser traffic) AND a Kafka consumer (for `gateway.broadcast` messages from chat/matching services).

### matching-service (`apps/matching-service/src/main.ts`)

```typescript
const app = await NestFactory.createMicroservice(MatchingModule, {
  transport: Transport.KAFKA,
  options: { consumer: { groupId: 'matching-consumer' } },
});
await app.listen();  // only Kafka, no HTTP
```

Pure Kafka microservice. Has no web server. Consumes `user.join-queue` and `user.leave-queue`.

### chat-service (`apps/chat-service/src/main.ts`)

```typescript
const app = await NestFactory.createMicroservice(ChatModule, {
  transport: Transport.KAFKA,
  options: { consumer: { groupId: 'chat-consumer' } },
});
await app.listen();  // only Kafka, no HTTP
```

Pure Kafka microservice. Consumes `match.found`, `chat.message`, `chat.image`, `chat.user-left`.

---

## 6. Redis: The Shared Memory

Redis is the **only shared state** between all three services. Since each service is a separate process, they can't share in-memory variables. Redis is their common database.

### Keys and What They Store

| Key | Type | Value | Who reads/writes |
|-----|------|-------|-----------------|
| `session:{sessionId}` | String (JSON) | `{ userId, socketId, interest, createdAt }` | api-gateway (auth) |
| `socket:{socketId}` | String | `sessionId` | api-gateway (disconnect lookup) |
| `queue:male` | List | JSON array of `QueueEntry` | matching-service |
| `queue:female` | List | JSON array of `QueueEntry` | matching-service |
| `room:{roomId}` | Hash | `{ roomId, user1Id, user1SocketId, user2Id, user2SocketId, createdAt, status }` | chat-service |
| `userRoom:{userId}` | String | `roomId` | chat-service |

> There are only **two** queues now — `queue:male` and `queue:female` — keyed by the user's **own** gender (`Gender = 'male' | 'female'`). The user's `interest` (`'everyone' | 'male' | 'female'`) decides which queue(s) `tryMatch` searches, not which queue they're pushed into.

### QueueEntry shape

```typescript
interface QueueEntry {
  userId: string;
  socketId: string;
  gender: 'male' | 'female';        // the user's own gender
  interest: 'everyone' | 'male' | 'female';  // who they want to be matched with
  joinedAt: number;  // Unix timestamp
}
```

### RoomData shape

```typescript
interface RoomData {
  roomId: string;
  user1Id: string;
  user1SocketId: string;
  user2Id: string;
  user2SocketId: string;
  createdAt: number;
  status: 'active' | 'ended';
}
```

---

## 7. Kafka: The Message Bus

All topics are defined in `libs/shared/src/events/kafka-events.ts`:

```typescript
export const KafkaTopics = {
  USER_JOIN_QUEUE:   'user.join-queue',    // gateway → matching
  USER_LEAVE_QUEUE:  'user.leave-queue',   // gateway → matching
  MATCH_FOUND:       'match.found',        // matching → chat
  CHAT_MESSAGE:      'chat.message',       // gateway → chat
  CHAT_IMAGE:        'chat.image',         // gateway → chat
  CHAT_TYPING:       'chat.typing',        // defined but not used (handled locally)
  CHAT_USER_LEFT:    'chat.user-left',     // gateway → chat
  IMAGE_UPLOADED:    'image.uploaded',     // defined but unused
  GATEWAY_BROADCAST: 'gateway.broadcast', // chat/matching → gateway → browser
}
```

### Topic flow diagram

```
Browser ──► [user:join WS event]
              │
              ▼
        API Gateway ──► user.join-queue ──► Matching Service
                                                │
                                                ▼ (match found)
                                         match.found ──► Chat Service
                                                              │
                                                              ▼ (gateway.broadcast)
                                         gateway.broadcast ──► API Gateway ──► Browser socket
```

---

## 8. Flow 1 — First Visit: Session Initialization

**User action:** Browser loads the app for the first time.

**What the FE does:** Calls `POST /session/init` before showing anything.

### Step-by-step

```
[1] Browser  →  POST /session/init
                  (no body, no auth required)
```

```
[2] NestJS routing: HTTP request arrives at api-gateway (port 3001)
    → AppModule → AuthModule → AuthController → @Post('session/init')
```

**File:** `apps/api-gateway/src/auth/auth.controller.ts`
```typescript
@Post('session/init')
async initSession() {
  return this.authService.createSession();
}
```

```
[3] AuthService.createSession() runs
```

**File:** `apps/api-gateway/src/auth/auth.service.ts`
```typescript
async createSession(): Promise<{ sessionId: string; userId: string }> {
  const sessionId = uuid();   // e.g. "a1b2c3d4-..."
  const userId    = uuid();   // e.g. "e5f6g7h8-..."

  const data: SessionData = {
    userId,
    socketId: null,       // no socket yet
    interest: 'everyone', // default match preference
    createdAt: Date.now(),
  };

  // Write to Redis: key = "session:a1b2c3d4-...", value = JSON, TTL = 24h
  await this.redis.set(`session:${sessionId}`, JSON.stringify(data), 86400);

  return { sessionId, userId };
}
```

```
[4] Redis now contains:
    KEY:   "session:a1b2c3d4-..."
    VALUE: {"userId":"e5f6g7h8-...","socketId":null,"interest":"everyone","createdAt":1234567890}
    TTL:   86400 seconds (24 hours)
```

```
[5] Response sent back to browser:
    { "sessionId": "a1b2c3d4-...", "userId": "e5f6g7h8-..." }
```

```
[6] FE stores sessionId in Zustand state (memory). 
    The browser never loses it until the tab is closed or the FE resets it.
```

> **Why two IDs?** `sessionId` is like a password — it proves you own the session. `userId` is the stable identity of this anonymous user. The FE uses `userId` to identify messages from "you" vs "them".

---

## 9. Flow 2 — WebSocket Connection

**User action:** User clicks "Start Chatting" (or on any page load that requires real-time). The FE opens a WebSocket connection.

**What the FE does:** Calls `io(BE_URL, { auth: { sessionId }, transports: ['websocket'] })`.

### Step-by-step

```
[1] Browser  →  WebSocket upgrade handshake to ws://localhost:3001
                  with { auth: { sessionId: "a1b2c3d4-..." } }
```

```
[2] Socket.IO on the api-gateway accepts the connection
    → ChatGateway.handleConnection(client) fires automatically
```

**File:** `apps/api-gateway/src/gateway/chat.gateway.ts`, `handleConnection` method

```typescript
async handleConnection(client: TypedSocket) {
  // Step 2a: Read sessionId from the handshake (sent by FE)
  const sessionId = client.handshake.auth?.sessionId as string;
  if (!sessionId) {
    client.disconnect();  // reject immediately — no sessionId, no entry
    return;
  }

  // Step 2b: Look up the session in Redis
  const session = await this.authService.getSession(sessionId);
  if (!session) {
    client.disconnect();  // session expired or fake — reject
    return;
  }

  // Step 2c: Update Redis — bind this socket ID to the session
  await this.authService.updateSocketId(sessionId, client.id);
  //  - Updates: session:a1b2c3d4 → { socketId: "ABC123" }
  //  - Creates: socket:ABC123    → "a1b2c3d4-..."

  // Step 2d: Store on the socket object itself for easy access later
  client.data.userId    = session.userId;
  client.data.sessionId = sessionId;

  this.logger.log(`Client connected: ${client.id} (user: ${session.userId})`);
}
```

```
[3] Redis now contains:
    "session:a1b2c3d4-..." → { ..., "socketId": "ABC123" }
    "socket:ABC123"        → "a1b2c3d4-..."   (reverse lookup for disconnect)
```

```
[4] WebSocket connection is now live.
    FE and BE can now send events to each other at any time.
```

> **What is `client.id`?** Socket.IO assigns a unique random string ID to each socket connection (like "ABC123"). This is NOT the userId. The socketId changes every time the browser reconnects. The userId stays the same throughout the session.

> **What is `client.data`?** A plain object stored on the socket that persists for the lifetime of the connection. Setting `client.data.userId` means every future event handler on that socket can read `client.data.userId` without hitting Redis again.

---

## 10. Flow 3 — Joining the Matchmaking Queue

**User action:** FE emits `user:join` with the user's own gender and who they're interested in.

**What the FE does:** `socket.emit('user:join', { gender: 'male', interest: 'everyone', sessionId: '...' })`

### Step-by-step

```
[1] FE  →  WS event "user:join"
           payload: { gender: "male", interest: "everyone", sessionId: "a1b2c3d4-..." }
```

```
[2] ChatGateway.handleJoinQueue() runs
    - @UseGuards(SessionGuard) runs FIRST (the guard)
    - @UsePipes(ValidationPipe) runs SECOND (validates the DTO)
    - then handleJoinQueue() runs
```

**Guard check** — `libs/shared/src/guards/session.guard.ts`:
```typescript
// Checks that client.handshake.auth.sessionId exists.
// The deeper Redis validation was already done in handleConnection().
// This guard is a lightweight fast check on every event.
const sessionId = client.handshake?.auth?.sessionId;
if (!sessionId) throw new WsException('Missing sessionId');
return true;
```

**DTO validation** — `libs/shared/src/dto/join-queue.dto.ts`:
```typescript
export class JoinQueueDto {
  @IsIn(['male', 'female'])  // the user's own gender
  gender: 'male' | 'female';

  @IsIn(['everyone', 'male', 'female'])  // who they want to match with
  interest: 'everyone' | 'male' | 'female';

  @IsString() @IsUUID()
  sessionId: string;
}
```
If `gender` or `interest` had an invalid value, NestJS would throw an error here and the request would be rejected before any business logic runs.

**Gateway handler** — `apps/api-gateway/src/gateway/chat.gateway.ts`:
```typescript
@UseGuards(SessionGuard)
@UsePipes(new ValidationPipe({ whitelist: true }))
@SubscribeMessage('user:join')
handleJoinQueue(@ConnectedSocket() client: TypedSocket, @MessageBody() dto: JoinQueueDto) {
  // Publish to Kafka — the gateway does NOT process this itself
  this.kafka.emit(KafkaTopics.USER_JOIN_QUEUE, {
    userId:   client.data.userId,   // from client.data set during connection
    socketId: client.id,
    gender:   dto.gender,
    interest: dto.interest,
  });
}
```

```
[3] Kafka receives message on topic: "user.join-queue"
    payload: { userId: "e5f6...", socketId: "ABC123", gender: "male", interest: "everyone" }
```

```
[4] matching-service's Kafka consumer picks it up
    → MatchingController.handleJoinQueue() fires
```

**File:** `apps/matching-service/src/matching.controller.ts`
```typescript
@EventPattern(KafkaTopics.USER_JOIN_QUEUE)
async handleJoinQueue(@Payload() data: { userId, socketId, gender, interest }) {
  await this.matchingService.joinQueue(data);
}
```

```
[5] MatchingService.joinQueue() runs
```

**File:** `apps/matching-service/src/matching.service.ts`
```typescript
async joinQueue(entry: { userId, socketId, gender, interest }): Promise<void> {
  const { userId, socketId, gender, interest } = entry;
  const payload: QueueEntry = {
    userId,
    socketId,
    gender,
    interest,
    joinedAt: Date.now(),
  };

  // Push to the queue matching the user's OWN gender (left side = most recent)
  await this.redis.lpush(QUEUES[gender], JSON.stringify(payload));
  // QUEUES = { male: 'queue:male', female: 'queue:female' }

  // Immediately try to find a match
  const match = await this.tryMatch(payload);

  if (!match) {
    // No one waiting — set a 30-second timeout
    const timer = setTimeout(
      () => this.onTimeout(userId, socketId),
      30_000
    );
    this.timeouts.set(userId, timer);
    // FE shows the radar/searching animation
  }
  // If match was found, createMatch() ran inside tryMatch() — see Flow 4
}
```

```
[6] Redis "queue:male" now contains (as a List):
    [ '{"userId":"e5f6...","socketId":"ABC123","gender":"male","interest":"everyone","joinedAt":1234...}' ]
```

```
[7] If no one else is waiting:
    - Timer starts (30 seconds)
    - FE shows "searching..." animation
    - User waits for Flow 4 or Flow 10
```

---

## 11. Flow 4 — A Match is Found

This flow continues directly from Flow 3. It begins when `tryMatch()` finds another user already in the queue.

### How `tryMatch` works

```typescript
private async tryMatch(joiner: QueueEntry): Promise<boolean> {
  // Determine which queue(s) to search based on the joiner's INTEREST
  const searchQueues = this.getSearchQueues(joiner.interest);
  // interest 'everyone' → search [queue:male, queue:female]
  // interest 'male'     → search [queue:male]
  // interest 'female'   → search [queue:female]

  for (const qKey of searchQueues) {
    const entries = await this.redis.lrange(qKey, 0, -1);  // read full queue
    for (const raw of entries) {
      const candidate = JSON.parse(raw) as QueueEntry;
      if (candidate.userId === joiner.userId) continue;  // skip yourself

      // The candidate's interest must also accept the joiner's gender
      // (mutual match — both sides' preferences must be satisfied)
      if (candidate.interest !== 'everyone' && candidate.interest !== joiner.gender) {
        continue;
      }

      // Re-check the candidate is still in the queue (race guard — another
      // tryMatch() running concurrently may have already grabbed them)
      const candidateStillInQueue = await this.redis
        .lrange(qKey, 0, -1)
        .then((list) => list.some((entry) => entry === raw));
      if (!candidateStillInQueue) continue;

      // Found a match candidate!
      // Remove candidate from their queue
      await this.redis.lrem(qKey, 1, raw);
      // Remove joiner from their own queue (they just got matched)
      await this.removeFromQueue(joiner.userId, joiner.gender);

      // Clear both timeout timers (they won't time out now)
      clearTimeout(this.timeouts.get(candidate.userId));
      clearTimeout(this.timeouts.get(joiner.userId));
      this.timeouts.delete(candidate.userId);
      this.timeouts.delete(joiner.userId);

      this.createMatch(joiner, candidate);
      return true;
    }
  }
  return false;  // no match found yet
}

private getSearchQueues(interest: Interest): string[] {
  if (interest === 'everyone') return [QUEUES.male, QUEUES.female];
  return [QUEUES[interest]];
}
```

```
[1] Two users are now matched: User A (the joiner) and User B (from the queue)
    Both have been removed from their Redis queues.
```

### `createMatch` runs

```typescript
private createMatch(user1: QueueEntry, user2: QueueEntry): void {
  const roomId = uuid();  // e.g. "room-xyz-789"

  // Each user sees a randomly-generated "stranger" profile for their partner.
  // The profile carries the PARTNER's gender and interest.
  const strangerForUser1 = makeStranger(user2.gender, user2.interest);
  // → { name: "FrostyQuokka", gender: "female", interest: "everyone", grad: ["#FF6B6B","#FF8E53"], glyph: "F" }
  const strangerForUser2 = makeStranger(user1.gender, user1.interest);

  const payload: MatchFoundPayload = {
    roomId,
    user1: { userId: user1.userId, socketId: user1.socketId },
    user2: { userId: user2.userId, socketId: user2.socketId },
    strangerForUser1,
    strangerForUser2,
  };

  this.kafka.emit(KafkaTopics.MATCH_FOUND, payload);
  // Hands off to chat-service via Kafka
}
```

```
[2] Kafka receives message on topic: "match.found"
    payload: { roomId, user1: {...}, user2: {...}, strangerForUser1, strangerForUser2 }
```

```
[3] chat-service's Kafka consumer picks it up
    → ChatController.handleMatchFound() fires
    → ChatService.handleMatchFound() runs
```

**File:** `apps/chat-service/src/chat.service.ts`, `handleMatchFound`:

```typescript
async handleMatchFound(payload: MatchFoundPayload): Promise<void> {
  const { roomId, user1, user2, strangerForUser1, strangerForUser2 } = payload;

  // Step 3a: Create the room record in Redis
  const room: RoomData = {
    roomId,
    user1Id:        user1.userId,
    user1SocketId:  user1.socketId,
    user2Id:        user2.userId,
    user2SocketId:  user2.socketId,
    createdAt:      Date.now(),
    status:         'active',
  };
  await this.redis.hset(`room:${roomId}`, { ...room, createdAt: String(room.createdAt) });
  // Redis Hash "room:room-xyz-789" now stores all 7 fields

  // Step 3b: Create reverse lookup (user → room) for disconnect handling
  await this.redis.set(`userRoom:${user1.userId}`, roomId);
  await this.redis.set(`userRoom:${user2.userId}`, roomId);

  // Step 3c: Tell the API Gateway to add both sockets to a Socket.IO room
  this.broadcast({
    type:      'join-room',
    socketIds: [user1.socketId, user2.socketId],
    roomId,
  });

  // Step 3d: Tell the API Gateway to emit 'match:found' to User 1
  this.broadcast({
    type:      'emit-to-socket',
    socketIds: [user1.socketId],
    event:     'match:found',
    data:      { roomId, stranger: strangerForUser1 },
  });

  // Step 3e: Tell the API Gateway to emit 'match:found' to User 2
  this.broadcast({
    type:      'emit-to-socket',
    socketIds: [user2.socketId],
    event:     'match:found',
    data:      { roomId, stranger: strangerForUser2 },
  });
}
```

Each `this.broadcast()` call publishes to `gateway.broadcast` on Kafka.

```
[4] Kafka receives 3 messages on topic: "gateway.broadcast"
    Message 1: { type: "join-room",      socketIds: ["ABC123","DEF456"], roomId: "room-xyz-789" }
    Message 2: { type: "emit-to-socket", socketIds: ["ABC123"], event: "match:found", data: {...} }
    Message 3: { type: "emit-to-socket", socketIds: ["DEF456"], event: "match:found", data: {...} }
```

```
[5] api-gateway's Kafka consumer picks them up
    → GatewayBroadcastController.handleBroadcast() fires
    → ChatGateway.handleBroadcast() runs
```

**File:** `apps/api-gateway/src/gateway/chat.gateway.ts`, `handleBroadcast`:

```typescript
handleBroadcast(payload: GatewayBroadcastPayload) {
  if (payload.type === 'join-room' && payload.socketIds && payload.roomId) {
    // Add each socket to the Socket.IO room named by roomId
    for (const sid of payload.socketIds) {
      const sock = this.server.sockets.sockets.get(sid);
      if (sock) sock.join(payload.roomId);
    }
    // Now "this.server.to(roomId)" reaches both users

  } else if (payload.type === 'emit-to-socket' && payload.socketIds && payload.event) {
    // Send a targeted event to specific socket(s)
    for (const sid of payload.socketIds) {
      this.server.to(sid).emit(payload.event, payload.data);
    }

  } else if (payload.type === 'emit-to-room' && payload.roomId && payload.event) {
    // Broadcast to everyone in a room (optionally excluding some sockets)
    const emitter = payload.excludeSocketIds?.length
      ? this.server.to(payload.roomId).except(payload.excludeSocketIds)
      : this.server.to(payload.roomId);
    emitter.emit(payload.event, payload.data);
  }
}
```

```
[6] What happens on the browser:
    User A's socket "ABC123" receives: "match:found" { roomId: "room-xyz-789", stranger: { name: "FrostyQuokka", ... } }
    User B's socket "DEF456" receives: "match:found" { roomId: "room-xyz-789", stranger: { name: "SpicyCapybara", ... } }

[7] FE for both users:
    - Shows confetti animation
    - Shows toast "✨ You matched!"
    - Transitions to the Chat screen
    - Stores roomId in state for future messages
```

---

## 12. Flow 5 — Sending a Text Message

**User action:** User A types a message and hits Send.

**What the FE does:** `socket.emit('chat:message', { text: "hey!", roomId: "room-xyz-789" })`

### Step-by-step

```
[1] FE  →  WS event "chat:message"
           payload: { text: "hey!", roomId: "room-xyz-789" }
```

```
[2] ChatGateway.handleMessage() runs
    (SessionGuard + ValidationPipe run first — see Flow 3 Step 2 for explanation)
```

**DTO validation** — `libs/shared/src/dto/send-message.dto.ts`:
```typescript
export class SendMessageDto {
  @IsString() @MaxLength(2000)   // max 2000 characters
  text: string;

  @IsString() @IsUUID()           // must be a valid UUID
  roomId: string;
}
```

**Gateway handler:**
```typescript
@SubscribeMessage('chat:message')
handleMessage(@ConnectedSocket() client, @MessageBody() dto: SendMessageDto) {
  this.kafka.emit(KafkaTopics.CHAT_MESSAGE, {
    roomId:       dto.roomId,
    fromUserId:   client.data.userId,   // "e5f6..." — User A's ID
    fromSocketId: client.id,            // "ABC123" — used to exclude sender from broadcast
    text:         dto.text,
    messageId:    uuid(),               // unique ID for deduplication in the FE
    timestamp:    Date.now(),
  });
}
```

```
[3] Kafka receives message on topic: "chat.message"
    payload: {
      roomId:       "room-xyz-789",
      fromUserId:   "e5f6...",
      fromSocketId: "ABC123",
      text:         "hey!",
      messageId:    "msg-111-...",
      timestamp:    1234567890
    }
```

```
[4] chat-service picks it up → ChatService.handleMessage() runs
```

```typescript
async handleMessage(payload: MessagePayload): Promise<void> {
  // Check the room still exists and is active
  const room = await this.redis.hgetall(`room:${payload.roomId}`);
  if (!room || room.status !== 'active') return;  // silently drop if room ended

  this.broadcast({
    type:             'emit-to-room',
    roomId:           payload.roomId,
    excludeSocketIds: [payload.fromSocketId],  // DON'T send back to sender
    event:            'chat:message',
    data: {
      message: {
        id:   payload.messageId,
        from: 'them',                          // FE renders this as the stranger's bubble
        text: payload.text,
        time: new Date(payload.timestamp).toLocaleTimeString([], {
          hour: 'numeric', minute: '2-digit'
        }),                                    // e.g. "7:05 PM"
      },
    },
  });
}
```

```
[5] Kafka receives: "gateway.broadcast"
    { type: "emit-to-room", roomId: "room-xyz-789", excludeSocketIds: ["ABC123"],
      event: "chat:message", data: { message: { id, from: "them", text: "hey!", time: "7:05 PM" } } }
```

```
[6] api-gateway.handleBroadcast() runs:
    server.to("room-xyz-789").except(["ABC123"]).emit("chat:message", { message: {...} })
    → Only User B (socket "DEF456") receives the event
    → User A does NOT receive it (they already showed it optimistically)
```

```
[7] User B's FE:
    - New message bubble appears: "hey!" with "7:05 PM" timestamp
    - From: "them" (the stranger)

    User A's FE:
    - Already showed the message optimistically (before the server round-trip)
    - Uses messageId to deduplicate if the server somehow echoes it back
```

---

## 13. Flow 6 — Typing Indicator

**User action:** User A starts typing.

**What the FE does:** `socket.emit('chat:typing', { roomId: "room-xyz-789", typing: true })`

This is the **only event that does NOT go through Kafka**. It's handled entirely in the gateway because typing indicators are fire-and-forget — no persistence needed.

```typescript
// apps/api-gateway/src/gateway/chat.gateway.ts
@SubscribeMessage('chat:typing')
handleTyping(@ConnectedSocket() client, @MessageBody() dto: TypingDto) {
  // client.to(roomId) means: "everyone in this room EXCEPT me"
  client.to(dto.roomId).emit('chat:typing', { typing: dto.typing ?? true });
}
```

```
[1] FE emits: chat:typing { roomId, typing: true }
[2] Gateway: client.to(roomId).emit("chat:typing", { typing: true })
[3] User B's FE receives "chat:typing" { typing: true } → shows "Stranger is typing..."
[4] When User A stops typing, FE emits: chat:typing { roomId, typing: false }
[5] User B's FE receives { typing: false } → hides the indicator
```

No Redis, no Kafka. One line of code. Fast.

### Reactions work the same way

`chat:reaction` is also handled entirely in the gateway — no Kafka, no Redis. When a user reacts to a message, the gateway relays it straight to the other person in the room.

**DTO** — `libs/shared/src/dto/send-message.dto.ts`:
```typescript
export class ReactionDto {
  @IsString() @IsUUID()  messageId: string;  // which message is being reacted to
  @IsString() @IsUUID()  roomId: string;
  @IsString() @MaxLength(8)  emoji: string;  // the emoji, or "" to clear the reaction
}
```

**Gateway handler** — `apps/api-gateway/src/gateway/chat.gateway.ts`:
```typescript
@SubscribeMessage('chat:reaction')
handleReaction(@ConnectedSocket() client, @MessageBody() dto: ReactionDto) {
  // everyone in the room EXCEPT the sender
  client.to(dto.roomId).emit('chat:reaction', {
    messageId: dto.messageId,
    emoji: dto.emoji || null,   // empty string → null = remove the reaction
  });
}
```

```
[1] FE emits: chat:reaction { roomId, messageId, emoji: "❤️" }
[2] Gateway: client.to(roomId).emit("chat:reaction", { messageId, emoji: "❤️" })
[3] Stranger's FE receives it → renders ❤️ on that message bubble
[4] To clear: FE emits emoji: "" → partner receives emoji: null → reaction removed
```

Why fire-and-forget like typing? Reactions are ephemeral UI state — not persisted. If the partner disconnects, there's nothing to clean up. The chat-service never sees this event.

---

## 14. Flow 7 — Uploading and Sending an Image

This flow has **two separate parts**: first upload the file via HTTP, then send the URL via WebSocket.

### Part A: File Upload (HTTP)

```
[1] FE  →  POST /upload
           Content-Type: multipart/form-data
           Body: file data (the image bytes)
           Header: sessionId (for auth, if required)
```

```
[2] NestJS routing: → UploadController (apps/api-gateway/src/upload/upload.controller.ts)
```

The controller uses Multer (a Node.js file upload library integrated into NestJS):
- Validates file type (must be `image/*`)
- Validates file size (max `MAX_FILE_SIZE_MB`, default 5MB)
- Saves the file to `UPLOAD_DIR` (default: `C:/tmp/uploads` on Windows, `/tmp/uploads` on Linux)
- Generates a UUID filename: `{uuid}.{ext}` (e.g. `abc123.jpg`)

```
[3] File saved to disk:
    C:/tmp/uploads/abc123.jpg

[4] Response to FE:
    { "imageUrl": "/files/abc123.jpg" }
```

> **How does `/files/abc123.jpg` get served?** `AppModule` registers `ServeStaticModule` which maps the `UPLOAD_DIR` folder to the `/files` URL path. When any client requests `GET /files/abc123.jpg`, NestJS serves the file directly from disk — no controller needed.

### Part B: Sending the Image URL via WebSocket

```
[5] FE emits: chat:image { imageUrl: "/files/abc123.jpg", roomId: "room-xyz-789" }
```

**DTO validation** — `libs/shared/src/dto/send-message.dto.ts`:
```typescript
export class SendImageDto {
  @IsString() @IsUrl()   // validates it's a valid URL
  imageUrl: string;

  @IsString() @IsUUID()
  roomId: string;
}
```

**Gateway handler:**
```typescript
@SubscribeMessage('chat:image')
handleImage(@ConnectedSocket() client, @MessageBody() dto: SendImageDto) {
  this.kafka.emit(KafkaTopics.CHAT_IMAGE, {
    roomId:       dto.roomId,
    fromUserId:   client.data.userId,
    fromSocketId: client.id,
    imageUrl:     dto.imageUrl,
    messageId:    uuid(),
    timestamp:    Date.now(),
  });
}
```

```
[6] Kafka: "chat.image" → chat-service → ChatService.handleImage()
```

```typescript
async handleImage(payload: MessagePayload): Promise<void> {
  const room = await this.redis.hgetall(`room:${payload.roomId}`);
  if (!room || room.status !== 'active') return;

  this.broadcast({
    type:             'emit-to-room',
    roomId:           payload.roomId,
    excludeSocketIds: [payload.fromSocketId],
    event:            'chat:image',
    data: {
      imageUrl: payload.imageUrl,
      time: new Date(payload.timestamp).toLocaleTimeString([], {
        hour: 'numeric', minute: '2-digit'
      }),
    },
  });
}
```

```
[7] Kafka: "gateway.broadcast" → api-gateway → User B's socket receives:
    "chat:image" { imageUrl: "/files/abc123.jpg", time: "7:10 PM" }

[8] User B's FE renders: <img src="/files/abc123.jpg" />
```

---

## 15. Flow 8 — Stranger Disconnects (Tab Closed)

**User action:** User B closes their browser tab (or loses internet).

**What happens automatically:** Socket.IO detects the connection dropped.

### Step-by-step

```
[1] Socket.IO on the api-gateway detects User B's socket "DEF456" disconnected
    → ChatGateway.handleDisconnect(client) fires automatically
```

**File:** `apps/api-gateway/src/gateway/chat.gateway.ts`, `handleDisconnect`:

```typescript
async handleDisconnect(client: TypedSocket) {
  this.logger.log(`Client disconnected: ${client.id}`);

  // Look up which session this socket belonged to, and delete the reverse lookup
  const sessionId = await this.authService.removeSocket(client.id);
  // removeSocket does: GET socket:DEF456 → "b2c3d4-..." then DEL socket:DEF456

  if (!sessionId) return;  // socket was never properly authenticated

  // Notify the system that this user left
  this.kafka.emit(KafkaTopics.CHAT_USER_LEFT, {
    userId:   client.data.userId,   // "f7g8h9-..." (User B's ID)
    socketId: client.id,            // "DEF456"
    // Note: no roomId here — chat-service will look it up via userRoom:{userId}
  });
}
```

```
[2] Kafka: "chat.user-left"
    payload: { userId: "f7g8h9-...", socketId: "DEF456" }
```

```
[3] chat-service picks it up → ChatService.handleUserLeft() runs
```

```typescript
async handleUserLeft(data: { userId, socketId, roomId?, reason? }): Promise<void> {
  // Find the room this user is in (via Redis reverse lookup)
  const roomId = data.roomId ?? await this.redis.get(`userRoom:${data.userId}`);
  if (!roomId) return;  // user wasn't in a room (e.g. still in queue)

  const room = await this.redis.hgetall(`room:${roomId}`);
  if (!room) return;

  // Mark room as ended in Redis
  await this.redis.hset(`room:${roomId}`, { status: 'ended' });
  await this.redis.del(`userRoom:${data.userId}`);

  // Find the partner
  const partnerSocketId = room.user1SocketId === data.socketId
    ? room.user2SocketId   // if User B was user1, partner is user2
    : room.user1SocketId;

  const partnerId = room.user1Id === data.userId
    ? room.user2Id
    : room.user1Id;

  // Notify the partner
  if (partnerSocketId) {
    this.broadcast({
      type:      'emit-to-socket',
      socketIds: [partnerSocketId],
      event:     'chat:stranger_left',
      data:      {},
    });
  }

  // Clean up partner's room lookup too
  await this.redis.del(`userRoom:${partnerId}`);
  this.logger.log(`Room ${roomId} ended (user ${data.userId} left)`);
}
```

```
[4] Redis updated:
    "room:room-xyz-789" → { ..., status: "ended" }
    "userRoom:f7g8h9-..." → DELETED
    "userRoom:e5f6-..."   → DELETED

[5] Kafka: "gateway.broadcast"
    { type: "emit-to-socket", socketIds: ["ABC123"], event: "chat:stranger_left", data: {} }

[6] api-gateway → User A's socket "ABC123" receives: "chat:stranger_left"

[7] User A's FE:
    - Shows system message: "Stranger has left the chat 👋"
    - Shows "Next Stranger" button
```

---

## 16. Flow 9 — User Clicks "Next Stranger"

**User action:** User A clicks "Next stranger" after a chat ends.

**What the FE does:** `socket.emit('chat:next', { roomId: "room-xyz-789" })`

### Step-by-step

```
[1] FE  →  WS event "chat:next"
           payload: { roomId: "room-xyz-789" }
```

**Gateway handler:**
```typescript
@SubscribeMessage('chat:next')
handleNext(@ConnectedSocket() client, @MessageBody() dto: LeaveRoomDto) {
  this.kafka.emit(KafkaTopics.CHAT_USER_LEFT, {
    userId:   client.data.userId,
    socketId: client.id,
    roomId:   dto.roomId,   // explicit roomId provided this time
    reason:   'next',
  });
}
```

```
[2] Kafka: "chat.user-left"
    payload: { userId: "e5f6...", socketId: "ABC123", roomId: "room-xyz-789", reason: "next" }
```

```
[3] ChatService.handleUserLeft() runs (same as Flow 8)
    - Marks room as ended
    - Notifies partner (if still connected) with chat:stranger_left
    - Cleans up Redis userRoom keys
```

```
[4] After cleanup, User A is now free (no room association)
    FE transitions back to the matching screen
    FE emits: user:join { gender: "male", interest: "everyone", sessionId: "..." }
    → Restarts from Flow 3
```

> **Note:** `chat:next` and a tab-close both emit `chat.user-left`. The difference is `reason: 'next'` vs no reason. Currently, the reason is logged but not used differently in logic. In the future, it could trigger different UX (e.g. showing "Stranger is looking for a new chat" to the partner).

---

## 17. Flow 10 — Matchmaking Timeout (No One Found)

**What happens:** 30 seconds pass after a user joined the queue and no match was found.

```
[1] MatchingService.joinQueue() set a 30-second timer when no immediate match was found:
    const timer = setTimeout(() => this.onTimeout(userId, socketId), 30_000);
    this.timeouts.set(userId, timer);
```

```
[2] 30 seconds later, onTimeout() fires:
```

```typescript
private onTimeout(userId: string, socketId: string): void {
  this.timeouts.delete(userId);

  // Tell the gateway to send an error to this specific socket
  this.kafka.emit(KafkaTopics.GATEWAY_BROADCAST, {
    type:      'emit-to-socket',
    socketIds: [socketId],
    event:     'error:no_match',
    data:      { reason: 'No match found. Try again!' },
  });

  this.logger.log(`Timeout for user ${userId}`);
}
```

```
[3] Kafka: "gateway.broadcast"
    { type: "emit-to-socket", socketIds: ["ABC123"], event: "error:no_match", data: { reason: "..." } }

[4] api-gateway → User A's socket receives: "error:no_match"

[5] User A's FE:
    - Shows error message / toast
    - Shows "Try again" button
```

> **Important:** The user's entry is NOT automatically removed from the Redis queue on timeout. If `leaveQueue()` isn't called, the entry can stay. In practice, the FE should emit `user:cancel` after receiving `error:no_match` to clean up.

---

## 18. Flow 11 — Cancelling the Queue

**User action:** User clicks "Cancel" while waiting for a match.

**What the FE does:** `socket.emit('user:cancel')`

```typescript
// Gateway:
@SubscribeMessage('user:cancel')
handleCancelQueue(@ConnectedSocket() client) {
  this.kafka.emit(KafkaTopics.USER_LEAVE_QUEUE, {
    userId:   client.data.userId,
    socketId: client.id,
  });
}
```

```
[1] Kafka: "user.leave-queue"
    → MatchingController.handleLeaveQueue()
    → MatchingService.leaveQueue(userId)
```

```typescript
async leaveQueue(userId: string): Promise<void> {
  // Cancel the timeout timer (so no error:no_match fires)
  const timer = this.timeouts.get(userId);
  if (timer) {
    clearTimeout(timer);
    this.timeouts.delete(userId);
  }

  // Scan all three queues to find and remove this user's entry
  for (const queue of Object.values(QUEUES)) {
    const entries = await this.redis.lrange(queue, 0, -1);
    for (const raw of entries) {
      const e = JSON.parse(raw) as QueueEntry;
      if (e.userId === userId) {
        await this.redis.lrem(queue, 1, raw);  // remove exactly 1 matching entry
        return;  // found and removed, done
      }
    }
  }
}
```

```
[2] User removed from Redis queue
[3] Timeout cancelled
[4] FE: user is back at the landing/home screen
```

---

## 19. The `gateway.broadcast` Loop Explained

This is the most important design pattern to understand. Chat-service and matching-service have **no direct access to Socket.IO** — they can't emit to browser sockets directly. They have to ask the api-gateway to do it for them.

The pattern works like this:

```
                  ┌──────────────────────────────────────────┐
                  │           chat-service process            │
                  │                                           │
                  │  this.broadcast({                         │
                  │    type: 'emit-to-room',                  │
                  │    roomId: 'room-xyz',                    │
                  │    event: 'chat:message',                 │
                  │    data: { message: {...} }               │
                  │  })                                       │
                  │    │                                      │
                  │    │ kafka.emit('gateway.broadcast', ...) │
                  └────┼─────────────────────────────────────┘
                       │
                       ▼ Kafka topic: gateway.broadcast
                  ┌────┼─────────────────────────────────────┐
                  │    │        api-gateway process           │
                  │    ▼                                      │
                  │  GatewayBroadcastController               │
                  │  @EventPattern('gateway.broadcast')       │
                  │    │                                      │
                  │    ▼                                      │
                  │  ChatGateway.handleBroadcast()            │
                  │    │                                      │
                  │    │ server.to('room-xyz').emit(...)      │
                  └────┼─────────────────────────────────────┘
                       │
                       ▼ WebSocket
                  ┌────┴──────┐
                  │  Browser  │
                  └───────────┘
```

### Three broadcast types

| `type` | What it does | When used |
|--------|-------------|-----------|
| `join-room` | Adds socket(s) to a Socket.IO room so future `emit-to-room` reaches them | On match found |
| `emit-to-socket` | Sends event to specific socket IDs | `match:found`, `chat:stranger_left`, `error:no_match` |
| `emit-to-room` | Broadcasts to all sockets in a room (optionally excluding some) | `chat:message`, `chat:image` |

---

## 20. File-by-File Reference

### `apps/api-gateway/src/main.ts`
Bootstraps the HTTP server (port 3001) AND a Kafka consumer (group `api-gateway-consumer`) in a single process. Attaches global `ValidationPipe` for all HTTP endpoints.

### `apps/api-gateway/src/app.module.ts`
Root module. Imports: `ConfigModule` (env vars), `RedisModule` (shared), `ServeStaticModule` (image serving), `AuthModule`, `GatewayModule`, `UploadModule`.

### `apps/api-gateway/src/auth/auth.controller.ts`
Two HTTP routes: `POST /session/init` and `GET /health`.

### `apps/api-gateway/src/auth/auth.service.ts`
Creates sessions, looks up sessions, binds socket IDs to sessions, removes socket bindings. All state in Redis.

### `apps/api-gateway/src/gateway/chat.gateway.ts`
The WebSocket server. Handles `handleConnection`, `handleDisconnect`, and all 7 socket events. Also receives `gateway.broadcast` instructions via `handleBroadcast()`.

### `apps/api-gateway/src/gateway/gateway-broadcast.controller.ts`
Kafka consumer inside the api-gateway. Listens on `gateway.broadcast` and calls `ChatGateway.handleBroadcast()`.

### `apps/api-gateway/src/upload/upload.controller.ts`
HTTP `POST /upload`. Uses Multer for file parsing. Validates type + size. Returns `{ imageUrl }`.

### `apps/api-gateway/src/upload/upload.service.ts`
Helper to delete uploaded files from disk. Used for cleanup when rooms end.

---

### `apps/matching-service/src/main.ts`
Bootstraps a Kafka-only microservice. No HTTP port. Consumer group: `matching-consumer`.

### `apps/matching-service/src/matching.controller.ts`
Kafka event handlers for `user.join-queue` and `user.leave-queue`. Delegates to `MatchingService`.

### `apps/matching-service/src/matching.service.ts`
Core matchmaking logic: queue management in Redis, `tryMatch()` algorithm, `createMatch()`, 30-second timeout handling.

---

### `apps/chat-service/src/main.ts`
Bootstraps a Kafka-only microservice. Consumer group: `chat-consumer`.

### `apps/chat-service/src/chat.controller.ts`
Kafka event handlers for `match.found`, `chat.message`, `chat.image`, `chat.user-left`. Delegates to `ChatService`.

### `apps/chat-service/src/chat.service.ts`
Room lifecycle management. Creates rooms in Redis, relays messages via `gateway.broadcast`, handles partner notifications on leave.

---

### `libs/shared/src/events/kafka-events.ts`
Single source of truth for all Kafka topic names. All services import from here.

### `libs/shared/src/types/index.ts`
TypeScript interfaces shared across all services: `RoomData`, `SessionData`, `QueueEntry`, `MessagePayload`, `MatchFoundPayload`, `GatewayBroadcastPayload`, `StrangerProfile`.

### `libs/shared/src/dto/*.ts`
DTOs with `class-validator` decorators. NestJS automatically validates incoming payloads against these and returns a 400 error if validation fails.

### `libs/shared/src/guards/session.guard.ts`
WebSocket guard that checks `client.handshake.auth.sessionId` exists. Applied to all socket event handlers.

### `libs/shared/src/redis/redis.service.ts`
Wrapper around `ioredis`. Provides typed methods (`get`, `set`, `lpush`, `rpop`, `hset`, `hgetall`, etc.) used throughout the codebase.

### `libs/shared/src/utils/name-generator.ts`
Generates random stranger profiles: picks a random adjective + animal combo and a gradient color pair. `makeStranger(gender, interest)` returns a `StrangerProfile`.

---

## Complete Event Flow Summary

```
FE Action               Gateway Event    Kafka Topic          Consumer          Result
─────────────────────   ─────────────    ──────────────────   ────────────────  ──────────────────────────
POST /session/init      HTTP POST        (none)               AuthService       { sessionId, userId } returned
io.connect + auth       handleConnection (none)               AuthService       socket ↔ session linked in Redis
socket.emit user:join   handleJoinQueue  user.join-queue      MatchingService   user added to Redis queue
  (match found)         handleBroadcast  match.found          ChatService       room created, match:found emitted
  (no match, 30s)       handleBroadcast  gateway.broadcast    Gateway           error:no_match emitted to socket
socket.emit chat:msg    handleMessage    chat.message         ChatService       message relayed to partner
socket.emit chat:image  handleImage      chat.image           ChatService       image URL relayed to partner
socket.emit chat:typing handleTyping     (none — local)       Gateway           typing state emitted directly
socket.emit chat:reaction handleReaction (none — local)       Gateway           reaction emitted directly to partner
socket.emit chat:next   handleNext       chat.user-left       ChatService       room ended, partner notified
socket.emit user:cancel handleCancelQueue user.leave-queue    MatchingService   removed from queue
tab close               handleDisconnect chat.user-left       ChatService       room ended, partner notified
POST /upload            HTTP POST        (none)               UploadController  { imageUrl } returned
GET /files/:name        HTTP GET         (none)               ServeStaticModule file served from disk
GET /health             HTTP GET         (none)               AuthController    { status: "ok" }
```
