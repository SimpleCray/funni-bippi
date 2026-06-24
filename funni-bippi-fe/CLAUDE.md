@AGENTS.md

# CLAUDE.md — funni-bippi-fe

Next.js 16 (App Router) · React 19 · TypeScript · Zustand · socket.io-client · Tailwind 4 · Framer Motion.

> ⚠️ AGENTS.md above: this Next.js (16.2.7) has breaking changes vs training data. Check `node_modules/next/dist/docs/` before using Next APIs.
> Backend contract + flows: `../funni-bippi-be/FLOW.md`. Theme system: `THEME_SYSTEM.md`.

---

## Structure

```
app/         # App Router: layout.tsx, page.tsx, globals.css (35k — all CSS vars/themes)
components/   # brand/ chat/ screens/ ui/ + AppShell.tsx, Providers.tsx
hooks/       # useSocket, useChat, useMatching, useTheme, useIsMobile
lib/         # socket.ts, api.ts, constants.ts, icebreakers.ts, imageFile.ts
store/       # chatStore.ts, settingsStore.ts (Zustand)
types/       # index.ts — shared TS types
```

Import alias: `@/*` → repo root (e.g. `@/lib/socket`, `@/store/chatStore`). Use it.

---

## State (Zustand, not Context/Redux)

- `store/chatStore.ts` — runtime chat state: `screen`, `stranger`, `messages`, `roomId`, `sessionId`, `userId`, `isConnected`, `typing`. NOT persisted.
- `store/settingsStore.ts` — `persist` middleware → localStorage key `funni-bippi-settings` (theme, accent, notify flags).
- Read in effects/non-React via `useChatStore.getState()`. Mutate only through defined actions (`addMessage`, `setScreen`, `resetChat`, ...). Don't set fields directly.

---

## Socket layer (single shared instance)

- One client: `lib/socket.ts` — `autoConnect: false`, `transports: ['websocket']`. Import the default, don't `io()` again.
- **No hardcoded event strings.** Always use `SOCKET_EVENTS` from `@/lib/socketEvents` — never a literal like `'chat:message'` in `socket.on`/`socket.emit`. That file MIRRORS BE `libs/shared/src/events/socket-events.ts`; change both together (the apps don't share code).
- All inbound listeners registered in `hooks/useSocket.ts`; cleanup with `socket.removeAllListeners()`. Add new server→client events there, route into the store.
- Outbound emits live in feature hooks (`useChat`, `useMatching`). Event names from `SOCKET_EVENTS`, payloads must match BE `chat.gateway.ts`.
- Optimistic UI: sender adds own message locally with a `uuid` id; BE excludes sender from broadcast. Keep `messageId` for dedup.

---

## REST

`lib/api.ts` only. `NEXT_PUBLIC_BE_URL` (default `http://localhost:3001`). `resolveImageUrl()` prefixes relative `/files/...` paths. Upload sends `Authorization: sessionId`.

---

## Styling / theme — read THEME_SYSTEM.md

- **Never hardcode colors.** Use CSS vars: `var(--bg)`, `var(--text)`, `var(--accent)`, `var(--accent-grad)`, etc.
- Theme = `data-theme` + `data-accent` on `<html>`, set by `useTheme` from settings store. All themes/accents defined in `app/globals.css`.
- New accent: add to `AccentColor` in `types/index.ts` → CSS block in `globals.css` → picker in `SettingsModal.tsx`.

---

## Conventions

- Client components need `'use client'` (hooks/store/socket all client-side).
- `strict: true`. No untyped `any`. Shared shapes in `types/index.ts`.
- These types mirror BE (`Gender`, `Interest`, `Stranger`, `Message`) — change BE side too when editing.
- `npm run dev` (:3000) · `npm run build` · `npm run lint` (eslint --fix). Needs BE running for real chat.
