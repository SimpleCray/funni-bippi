# Funni Bippi — Project Master README

> **"World without strangers."**
> A real-time anonymous chat-with-strangers web app.
> Stack: Next.js 16 (FE) + NestJS microservices + Kafka + Redis + Socket.IO

---

## For Claude Code

You are implementing Funni Bippi from scratch. This README is your entry point. Read all linked documents before writing any code.

### Read in this order:

1. **This file** — project overview, goals, constraints
2. **`/design/README.md`** — pixel-precise UI specs (fonts, colors, animations, components)
3. **`/design/Funni Bippi.html`** — open in browser for live visual reference
4. **`FRONTEND_REQUIREMENTS.md`** — FE stack, structure, Socket.IO events, state machine
5. **`BACKEND_REQUIREMENTS.md`** — BE architecture, NestJS concepts, Kafka flows, setup

---

## Project Goal

Funni Bippi lets strangers chat anonymously. One tap matches you with a random online user. No accounts, no profiles — just conversation. The design is warm, playful, bubbly (Poppins + DM Sans, coral accent, rounded everything).

---

## Constraints & Decisions

| Decision | Value |
|---|---|
| Chat persistence | ❌ None — in-memory only, gone on session end |
| Image persistence | ❌ Local `/tmp` only, auto-cleared |
| User accounts | ❌ Anonymous sessions only (sessionId in Redis, TTL 24h) |
| Current deployment | Local machine + ngrok |
| Architecture | Production-grade microservices (for learning + future scale) |
| Target scale (theoretical) | 1M+ concurrent users |

---

## Repository Layout

```
funni-bippi/
├── design/                      # Claude Design handoff — DO NOT EDIT, reference only
│   ├── Funni Bippi.html         # Open in browser for live prototype
│   ├── README.md                # Full UI spec — read this
│   ├── styles.css               # Design tokens to port to globals.css
│   ├── components.jsx           # Component JSX structure reference
│   ├── app.jsx                  # State machine reference
│   ├── icons.jsx                # SVG mascot + logo — copy paths as-is
│   ├── screens.jsx              # Screen layouts reference
│   └── data.jsx                 # Name generator, icebreakers — port to FE lib/
│
├── funni-bippi-fe/              # Next.js 16 frontend
│   └── (see FRONTEND_REQUIREMENTS.md)
│
├── funni-bippi-be/              # NestJS microservices backend
│   └── (see BACKEND_REQUIREMENTS.md)
│
├── FRONTEND_REQUIREMENTS.md     # ← Read this for FE implementation
├── BACKEND_REQUIREMENTS.md      # ← Read this for BE implementation
└── README.md                    # ← You are here
```

---

## Quick Start

### 1. Start infrastructure

```bash
cd funni-bippi-be
docker-compose up -d    # Starts Kafka + Zookeeper + Redis
```

### 2. Start backend services

```bash
# 4 separate terminals
pnpm run start:dev api-gateway
pnpm run start:dev matching-service
pnpm run start:dev chat-service
pnpm run start:dev notification-service
```

### 3. Start frontend

```bash
cd funni-bippi-fe
pnpm dev    # http://localhost:3000
```

### 4. Expose with ngrok (for demo)

```bash
ngrok http 3001
# Copy the https URL → set as NEXT_PUBLIC_BE_URL in funni-bippi-fe/.env.local
```

---

## Key Technical Decisions

### Why microservices for a demo app?
The app currently runs as a monolith would be fine — but the goal is learning production patterns. Each NestJS app (matching, chat, etc.) is a real independently-deployable service. Kafka is the backbone. When you want to scale, you just run more instances.

### Why Kafka over REST between services?
- **Decoupling:** Matching Service doesn't know Chat Service exists
- **Resilience:** If Chat Service restarts mid-match, Kafka replays the message
- **Scale:** Multiple Chat Service instances share a consumer group — Kafka distributes work

### Why Redis?
Three separate jobs: (1) match queue storage, (2) session validation, (3) Socket.IO multi-instance synchronization. All sub-millisecond.

### Why no database?
Chat content is ephemeral by design — strangers don't get history. Anonymous sessions don't need persistence. PostgreSQL is stubbed in the architecture for future user preferences but not needed now.

### Why Socket.IO over raw WebSocket?
Built-in room concept (perfect for two-person chat), automatic reconnection, fallback transports, and native NestJS gateway support via `@nestjs/websockets`.

---

## Implementation Order

### Phase 1 — FE Foundation
- [ ] Design token CSS setup (`globals.css`)
- [ ] Font imports (`@fontsource`)
- [ ] `Logo` and `Mascot` SVG components (copy from `/design/icons.jsx`)
- [ ] Theme + accent switching (Zustand + `data-theme` / `data-accent` on `<html>`)

### Phase 2 — FE Screens (static first)
- [ ] `LandingScreen` — hero, gender filter, CTA button
- [ ] `MatchmakingScreen` — radar animation, cycling copy
- [ ] `ChatScreen` — 3-column layout skeleton
- [ ] All chat components: `MessageBubble`, `TypingIndicator`, `ComposerBar`, `Avatar`
- [ ] `SettingsModal`

### Phase 3 — BE Foundation
- [ ] NestJS monorepo setup + Docker Compose
- [ ] `AuthService` — `POST /session/init`, Redis session storage
- [ ] `SessionGuard` — validate on socket connect
- [ ] Kafka + Redis connection modules

### Phase 4 — BE Core Logic
- [ ] `MatchingService` — queue logic, gender filter, pairing
- [ ] `ChatGateway` — Socket.IO event handlers
- [ ] `ChatService` — room management, message routing
- [ ] `UploadService` — image save to `/tmp`, serve static

### Phase 5 — FE + BE Integration
- [ ] `useSocket.ts` hook — connect, all event handlers
- [ ] Wire `LandingScreen` → emit `user:join`
- [ ] Wire `ChatPanel` → emit `chat:message`, receive + render
- [ ] Wire confetti + toast on `match:found`
- [ ] Image upload flow end-to-end

### Phase 6 — Polish
- [ ] All Framer Motion animations (pop-in, confetti, toast, modal)
- [ ] Mobile responsive layout (< 720px)
- [ ] Nginx config for local load balancer testing
- [ ] ngrok setup and demo walkthrough

---

## Socket.IO Event Reference

| Direction | Event | Payload |
|---|---|---|
| C→S | `user:join` | `{ gender, sessionId }` |
| C→S | `user:cancel` | — |
| C→S | `chat:message` | `{ text, roomId }` |
| C→S | `chat:image` | `{ imageUrl, roomId }` |
| C→S | `chat:typing` | `{ roomId, typing }` |
| C→S | `chat:next` | `{ roomId }` |
| C→S | `chat:report` | `{ roomId, reason }` |
| S→C | `match:found` | `{ roomId, stranger }` |
| S→C | `chat:message` | `{ message }` |
| S→C | `chat:typing` | `{ typing }` |
| S→C | `chat:stranger_left` | — |
| S→C | `error:no_match` | `{ reason }` |

---

## Kafka Topics Reference

| Topic | Producer | Consumer | Payload |
|---|---|---|---|
| `user.join-queue` | API Gateway | Matching Service | `{ userId, socketId, gender }` |
| `user.leave-queue` | API Gateway | Matching Service | `{ userId }` |
| `match.found` | Matching Service | Chat Service | `{ roomId, user1, user2, strangers }` |
| `chat.message` | API Gateway | Chat Service | `{ roomId, fromUserId, text, messageId, timestamp }` |
| `chat.image` | API Gateway | Chat Service | `{ roomId, fromUserId, imageUrl, messageId, timestamp }` |
| `chat.user-left` | API Gateway | Chat Service | `{ roomId, userId }` |
| `image.uploaded` | Upload Service | Chat Service | `{ imageUrl, roomId }` |
