# Funni Bippi — Frontend Requirements

> **Tagline:** World without strangers.
> **Purpose:** Chat-with-strangers web app. One tap matches you with a random anonymous stranger for a real-time conversation. No profiles, no real names — just vibes.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Structure](#2-project-structure)
3. [Design System](#3-design-system)
4. [Screens & Layouts](#4-screens--layouts)
5. [Key Components](#5-key-components)
6. [State Management](#6-state-management)
7. [Socket.IO Integration](#7-socketio-integration)
8. [Animations & Motion](#8-animations--motion)
9. [Image Upload Flow](#9-image-upload-flow)
10. [Setup Instructions](#10-setup-instructions)

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16.2** (App Router) | Latest stable, ~400% faster dev server via Turbopack, PPR support |
| Language | **TypeScript** | Type safety, better DX, fewer runtime bugs |
| Bundler | **Turbopack** | Default in Next.js 16, 5–10× faster HMR than Webpack |
| Styling | **Tailwind CSS v4** | Utility-first, pairs well with CSS variables from design tokens |
| Realtime | **Socket.IO client** | Matches NestJS backend gateway, handles reconnection gracefully |
| State (server) | **TanStack Query v5** | Async state, caching, loading/error states |
| State (client) | **Zustand** | Lightweight, simple — for theme, accent, chat session state |
| Animations | **Framer Motion** | Declarative spring animations, layout transitions |
| Emoji picker | **emoji-mart v5** | Industry standard, headless, matches our bubble UI |
| Icons | **Inline SVG** | Per design spec — no icon library, all SVGs from `icons.jsx` |
| Fonts | **@fontsource/poppins + @fontsource/dm-sans** | Self-hosted, no Google Fonts runtime dependency |
| Forms | **React Hook Form + Zod** | Settings form validation |
| File upload | **Local /tmp via REST** | For now — images POSTed to BE, served temporarily |

---

## 2. Project Structure

```
funni-bippi-fe/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout — fonts, theme provider, socket provider
│   ├── page.tsx                  # Entry — renders <AppShell />
│   └── globals.css               # Design tokens (CSS custom properties from styles.css)
│
├── components/
│   ├── screens/
│   │   ├── LandingScreen.tsx     # Full-viewport hero, gender filter, CTA
│   │   ├── MatchmakingScreen.tsx # Radar animation, cycling copy
│   │   └── ChatScreen.tsx        # 3-column layout (desktop), single-col (mobile)
│   │
│   ├── chat/
│   │   ├── Sidebar.tsx           # Left 86px nav sidebar
│   │   ├── ChatPanel.tsx         # Center message area + composer
│   │   ├── ProfilePanel.tsx      # Right collapsible panel
│   │   ├── MessageBubble.tsx     # me/them bubble with reactions
│   │   ├── TypingIndicator.tsx   # Animated 3-dot bubble
│   │   ├── ComposerBar.tsx       # Input + emoji + attach + send
│   │   └── EmojiPicker.tsx       # emoji-mart wrapper
│   │
│   ├── ui/
│   │   ├── Avatar.tsx            # Gradient circle + online dot
│   │   ├── GenderBadge.tsx       # Male / Female / Any pill badge
│   │   ├── Toast.tsx             # "✨ You matched!" notification
│   │   ├── Confetti.tsx          # Match moment particle burst
│   │   └── SettingsModal.tsx     # Accent + theme + notifications
│   │
│   ├── brand/
│   │   ├── Logo.tsx              # SVG speech bubble logo
│   │   └── Mascot.tsx            # SVG blob mascot with bob animation
│   │
│   └── AppShell.tsx              # App state machine — routes between screens
│
├── hooks/
│   ├── useSocket.ts              # Socket.IO connection, event handlers
│   ├── useMatching.ts            # Start/cancel match logic
│   ├── useChat.ts                # Send message, receive message, typing state
│   └── useTheme.ts               # Theme + accent switching, localStorage persist
│
├── store/
│   ├── chatStore.ts              # Zustand — messages, stranger, typing, screen
│   └── settingsStore.ts          # Zustand — theme, accent, notifications prefs
│
├── lib/
│   ├── socket.ts                 # Socket.IO client singleton
│   ├── nameGenerator.ts          # Ported from data.jsx — generates "FrostyQuokka89"
│   └── constants.ts              # Event names, accent list, gender options
│
└── types/
    └── index.ts                  # Shared TS types: Message, Stranger, Screen, etc.
```

---

## 3. Design System

All tokens must be ported as CSS custom properties in `globals.css`, mirroring the design handoff `styles.css` exactly.

### Typography

```css
--font-display: "Poppins", system-ui, sans-serif;   /* headings, labels, UI */
--font-body:    "DM Sans", system-ui, sans-serif;    /* body text, messages */
```

| Role | Font | Weight | Size |
|---|---|---|---|
| Display / headings | Poppins | 800 | clamp(44px → 88px) |
| Subheadings | Poppins | 700 | 17–20px |
| UI labels | Poppins | 600 | 13–16px |
| Body / messages | DM Sans | 400–500 | 14–16px |

### Color Tokens — Light Mode (default)

```css
--bg:           #FBF5EF;   /* page background, warm cream */
--bg-elev:      #FFFFFF;   /* cards, panels, elevated surfaces */
--bg-sunken:    #F1E8DF;   /* sidebar, inputs, segmented controls */
--text:         #2B2520;   /* primary text */
--text-soft:    #756758;   /* secondary text, placeholders */
--text-faint:   #A99B8C;   /* timestamps, hints */
--border:       rgba(43,37,32,0.09);
--border-2:     rgba(43,37,32,0.06);
--bubble-them:  #FFFFFF;
--online:       #34C77B;
```

### Color Tokens — Dark Mode

Apply `data-theme="dark"` on `<html>`:

```css
--bg:           #181410;
--bg-elev:      #241E19;
--bg-sunken:    #120F0C;
--text:         #F4EDE5;
--text-soft:    #B4A89B;
--text-faint:   #7C7064;
--border:       rgba(255,255,255,0.08);
--bubble-them:  #2C251F;
```

### Accent Colors

Apply `data-accent="coral|teal|yellow|blue|pink"` on `<html>`:

| Accent | `--accent` | `--accent-grad` |
|---|---|---|
| coral (default) | `#FF6B5E` | `135deg, #FF8E6B → #FF5E72` |
| teal | `#16BFAE` | `135deg, #2BD9C3 → #11A6C7` |
| yellow | `#FFB627` | `135deg, #FFD25E → #FFA92E` |
| blue | `#3C6BFF` | `135deg, #6EA8FF → #3C6BFF` |
| pink | `#FF5E9E` | `135deg, #FF9EC8 → #FF5E9E` |

The `--accent-grad` is used for: primary button, "me" chat bubbles, send button, logo, active nav icon.

### Spacing & Shape

```css
--r-sm: 12px;
--r-md: 18px;
--r-lg: 26px;
--r-xl: 34px;
--shadow-s: 0 2px 8px rgba(90,66,40,0.06);
--shadow-m: 0 8px 26px rgba(90,66,40,0.10);
--shadow-l: 0 24px 60px rgba(90,66,40,0.16);
```

---

## 4. Screens & Layouts

### Screen 1 — Landing

Full-viewport flex column, no sidebar.

```
┌─────────────────────────────────────────────┐
│ Logo + "Funni Bippi"        [🌙] [⚙️]       │
├─────────────────────────────────────────────┤
│ [decorative blobs — absolute, blurred]       │
│ [floating speech bubble decor — animated]    │
│                                              │
│            Mascot (104px, bobbing)           │
│    ✨ Meet someone new, right now            │
│   World without                              │
│       strangers.      ← coral gradient       │
│                                              │
│   [Start Chatting ✨]  ← pill CTA button    │
│   I'd like to chat with                      │
│   [Everyone]  [Male]  [Female]               │
│   theme ● ● ●                               │
└─────────────────────────────────────────────┘
```

Key implementation notes:
- Hero title: `font-size: clamp(44px, 8vw, 88px); font-weight: 800; letter-spacing: -0.03em`
- "strangers." word: `background: --accent-grad; -webkit-background-clip: text; color: transparent`
- CTA button: `padding: 20px 40px; font-size: 21px; border-radius: 9999px; background: --accent-grad`
- Decorative blobs: `border-radius: 50%; filter: blur(2px); opacity: 0.5; position: absolute`
- Gender filter: pill-shaped segmented control, active item gets `bg: --bg-elev; color: --accent-strong; box-shadow: --shadow-s`

### Screen 2 — Matchmaking

Full-viewport centered, text-align center.

- Radar: 220×220px container, 3 rings animating from 70px → 220px with `opacity: 0.7 → 0` over 2.4s, staggered 0.8s apart
- Center core: 92×92px, `background: --accent-grad`, pulses `scale(1 ↔ 1.08)` on 2s loop
- Cycling copy rotates every 1400ms through 4 messages (see `lib/constants.ts`)
- Animated dots: 3 × 8px circles bouncing with `translateY(0 ↔ -7px)`, staggered 0.18s

### Screen 3 — Active Chat (Desktop: 3-column)

```
┌────────┬──────────────────────────┬──────────────┐
│  86px  │        flex: 1           │    312px      │
│Sidebar │     Chat panel           │ Profile panel │
│        │                          │ (collapsible) │
└────────┴──────────────────────────┴──────────────┘
```

**Left sidebar (86px):**
- Logo (42px), your avatar (46px + online dot)
- Nav icons: Chat, Profile, Settings — active state: `background: --accent-grad`
- Accent swatches (3 × 22px dots)
- Dark/light toggle

**Center panel:**
- Top bar (76px): stranger avatar + name + gender badge + "Next stranger" button
- Message area: scrollable, `padding: 26px`
- Composer bar: pill input + emoji + attach + send (round, `background: --accent-grad`)

**Right panel (312px, collapsible):**
- Stranger profile card (avatar, name, gender, interests)
- "Next stranger" + "Report" buttons
- Icebreaker cards (click to send as message)
- Collapse animates `width: 312px → 0; opacity: 1 → 0` in `0.32s cubic-bezier(.4,0,.2,1)`

### Screen 4 — Settings Modal

- Scrim: `rgba(20,12,6,0.42)` + `backdrop-filter: blur(4px)`
- Modal: `border-radius: 34px`, spring entrance animation
- Sections: Theme accent swatches (5 colors), Appearance (Light/Dark cards), Notifications (3 toggles)

### Screen 5 — Mobile (< 720px)

Single column, bottom nav bar.

```
┌──────────────────────┐
│ ← [Avatar] Name  🔀🚩│  ← top bar
├──────────────────────┤
│   [message bubbles]  │
├──────────────────────┤
│ [ice1] [ice2] [ice3] │  ← scrollable icebreakers
│ [😊][📎] input  [→]  │  ← composer
├──────────────────────┤
│ 💬Chat  👤Me  ⚙️      │  ← bottom nav (64px)
└──────────────────────┘
```

---

## 5. Key Components

### MessageBubble

```tsx
// "me" bubble
align-self: flex-end
background: var(--accent-grad)
color: var(--accent-contrast)
border-radius: 22px 22px 7px 22px

// "them" bubble
align-self: flex-start
background: var(--bubble-them)
color: var(--bubble-them-text)
border-radius: 22px 22px 22px 7px
```

- Entrance: `opacity:0; transform: translateY(8px) scale(0.92)` → normal, 0.34s `cubic-bezier(.34,1.56,.64,1)`
- Hover reveals: timestamp (11px, `--text-faint`) + reaction bar
- Reaction bar: `❤️ 😂 👍 😮 🔥 🙌`, appears with spring animation above bubble

### TypingIndicator

Three 8px dots in `--text-faint`, inside a "them"-styled bubble. Each dot bounces `translateY(0 ↔ -7px)` at 1.3s, staggered 0.18s.

### Avatar

- `border-radius: 50%`
- Background: `linear-gradient(135deg, color1, color2)` — deterministic per stranger name
- First letter of display name as text
- Online dot: `#34C77B`, 9px, `border: 2.5px solid var(--bg-elev)`, bottom-right

### GenderBadge

| Value | Background | Color |
|---|---|---|
| male | `rgba(74,144,255,0.14)` | `#4A90FF` |
| female | `rgba(255,107,158,0.16)` | `#F0609E` |
| any | `--accent-soft` | `--accent-strong` |

Includes inline SVG mars/venus/globe icon. Pill shape, `font-size: 12px; font-weight: 600`.

### Mascot

SVG bobbing blob from `icons.jsx` — copy the paths as-is. Animation: `translateY(0 ↔ -8px) rotate(-1deg ↔ 1.5deg)`, 3.4s ease-in-out infinite.

---

## 6. State Management

### Zustand — `chatStore.ts`

```ts
type Screen = 'landing' | 'matching' | 'chat'

type Stranger = {
  name: string       // e.g. "FrostyQuokka89"
  gender: 'male' | 'female' | 'any'
  grad: [string, string]   // gradient colors for avatar
  country: string
  interests: string[]
}

type Message = {
  id: string
  from: 'me' | 'them'
  text?: string
  imageUrl?: string
  time: string
  reaction?: string
}

interface ChatStore {
  screen: Screen
  stranger: Stranger | null
  messages: Message[]
  typing: boolean
  filter: 'everyone' | 'male' | 'female'
  setScreen: (s: Screen) => void
  setStranger: (s: Stranger) => void
  addMessage: (m: Message) => void
  setTyping: (t: boolean) => void
  setFilter: (f: string) => void
  resetChat: () => void
}
```

### Zustand — `settingsStore.ts`

```ts
interface SettingsStore {
  theme: 'light' | 'dark'
  accent: 'coral' | 'teal' | 'yellow' | 'blue' | 'pink'
  notifyMatch: boolean
  notifySound: boolean
  showTyping: boolean
  setTheme: (t: string) => void
  setAccent: (a: string) => void
}
```

Theme and accent are persisted to `localStorage`. On mount, apply `data-theme` and `data-accent` to `document.documentElement`.

### App State Machine

```
landing ──[Start Chatting]──▶ matching ──[~2.6s / socket match]──▶ chat
   ▲                                                                   │
   └──────────────────────[Logo click / Cancel]──────────────────────┘
                                                                       │
                          chat ◀──[Next Stranger / Report]────────────┘
                                    (briefly re-enters matching)
```

---

## 7. Socket.IO Integration

### Connection

```ts
// lib/socket.ts
import { io } from 'socket.io-client'

const socket = io(process.env.NEXT_PUBLIC_BE_URL!, {
  transports: ['websocket'],
  autoConnect: false,
})

export default socket
```

Connect on "Start Chatting" click, disconnect on logo/cancel.

### Events (Client → Server)

| Event | Payload | When |
|---|---|---|
| `user:join` | `{ gender: filter, sessionId }` | User clicks Start Chatting |
| `user:cancel` | — | User cancels matchmaking |
| `chat:message` | `{ text, roomId }` | User sends a text message |
| `chat:image` | `{ imageUrl, roomId }` | User sends an image |
| `chat:typing` | `{ roomId, typing: boolean }` | Debounced on input change |
| `chat:next` | `{ roomId }` | User clicks "Next stranger" |
| `chat:report` | `{ roomId, reason }` | User reports stranger |

### Events (Server → Client)

| Event | Payload | Action |
|---|---|---|
| `match:found` | `{ roomId, stranger: Stranger }` | Transition to chat screen, fire confetti + toast |
| `chat:message` | `{ message: Message }` | Append to messages array |
| `chat:image` | `{ imageUrl, time }` | Append image message |
| `chat:typing` | `{ typing: boolean }` | Show/hide typing indicator |
| `chat:stranger_left` | — | Show "Stranger has left" system message |
| `error:no_match` | `{ reason }` | Show error toast |

### `useSocket.ts` hook

```ts
export function useSocket() {
  const { setScreen, setStranger, addMessage, setTyping, resetChat } = useChatStore()

  useEffect(() => {
    socket.on('match:found', ({ roomId, stranger }) => {
      setStranger(stranger)
      setScreen('chat')
      triggerConfetti()
      showToast('✨ You matched! Say hi 👋')
    })

    socket.on('chat:message', ({ message }) => addMessage(message))
    socket.on('chat:typing', ({ typing }) => setTyping(typing))
    socket.on('chat:stranger_left', () => {
      addMessage({ id: uuid(), from: 'them', text: '👋 Stranger has left the chat.', time: now() })
    })

    return () => { socket.removeAllListeners() }
  }, [])
}
```

---

## 8. Animations & Motion

All animations use Framer Motion or CSS keyframes. All respect `prefers-reduced-motion`.

| Animation | Element | Keyframes | Duration | Easing |
|---|---|---|---|---|
| `pop-in` | Chat bubbles (enter) | `opacity:0 scale:0.92 y:8px → normal` | 0.34s | `[.34,1.56,.64,1]` spring |
| `floaty` | Deco blobs, speech bubbles | `translateY(0 ↔ -22px)` | 7s | ease-in-out |
| `bob` | Mascot blob | `translateY(0 ↔ -8px) rotate(-1 ↔ 1.5deg)` | 3.4s | ease-in-out |
| `bounce` | Typing indicator dots | `translateY(0 ↔ -7px), opacity 0.5↔1` | 1.3s | ease |
| `radar` | Matchmaking rings | `70px opacity:0.7 → 220px opacity:0` | 2.4s | ease-out |
| `blip` | Online dot | `box-shadow 0→7px, opacity 1→0` | 1.8s | ease |
| `toast-in` | Toast notification | `opacity:0 scale:0.85 y:-20px → normal` | 0.5s | `[.34,1.56,.64,1]` |
| `confetti-fall` | 70 confetti particles | `translateY(105vh) rotate(var(--rot))` | 2–3.6s | `[.3,.6,.5,1]` |
| `spring-in` | Emoji picker popup | `opacity:0 scale:0.7 y:10px → normal` | 0.26s | `[.34,1.56,.64,1]` |
| `modal-in` | Settings modal | `opacity:0 scale:0.92 y:14px → normal` | 0.32s | `[.34,1.56,.64,1]` |

**Confetti particles:** ~70 pieces, `position: fixed; top: -16px`, random `left: 0–100vw`. Colors: `#FF8E6B, #16BFAE, #FFB627, #4A90FF, #FF6F9E, #3CC97B`. Each falls independently with random rotation.

---

## 9. Image Upload Flow

```
User pastes / attaches image
        │
        ▼
FE reads as base64 (FileReader API)
        │
        ▼
POST /api/upload (multipart/form-data)
        │
        ▼
BE saves to /tmp, returns { imageUrl: '/tmp/abc123.jpg' }
        │
        ▼
FE emits socket event: chat:image { imageUrl, roomId }
        │
        ▼
BE broadcasts to room → both users see image bubble
```

- Max file size: 5MB
- Accepted types: `image/jpeg, image/png, image/gif, image/webp`
- Images are served by NestJS static file middleware from `/tmp`
- Auto-cleared after session ends (BE handles cleanup)

---

## 10. Setup Instructions

### Prerequisites

- Node.js 22+
- pnpm (recommended) or npm

### Install

```bash
# Create Next.js 16 project
npx create-next-app@latest funni-bippi-fe \
  --typescript \
  --tailwind \
  --app \
  --turbopack

cd funni-bippi-fe

# Install dependencies
pnpm add socket.io-client zustand @tanstack/react-query framer-motion
pnpm add emoji-mart @emoji-mart/react @emoji-mart/data
pnpm add react-hook-form zod @hookform/resolvers
pnpm add @fontsource/poppins @fontsource/dm-sans
pnpm add uuid
pnpm add -D @types/uuid
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_BE_URL=http://localhost:3001
```

### Running

```bash
pnpm dev        # http://localhost:3000 (Turbopack)
pnpm build      # Production build
pnpm start      # Serve production build
```

### Design Handoff Usage

1. Unzip `Funni_Bippi.zip` into a `/design` folder at project root
2. Open `/design/Funni Bippi.html` in browser as the visual reference
3. Read `/design/README.md` for exact component specs
4. Port CSS tokens from `/design/styles.css` to `app/globals.css`
5. Copy SVG paths from `/design/icons.jsx` into `components/brand/`
6. Reference `/design/components.jsx` for exact JSX hierarchy of each component
7. Reference `/design/app.jsx` for the state machine logic
8. **Do NOT ship** `/design/tweaks-panel.jsx` or `ios-frame.jsx` — prototype only

---

## Implementation Order (Recommended)

1. Set up design tokens in `globals.css`
2. Implement `Logo` and `Mascot` SVG components
3. Build `LandingScreen` — static first, then animations
4. Build `MatchmakingScreen` — radar animation
5. Build `ChatScreen` — layout skeleton first, then fill in components
6. Wire up `useSocket.ts` with mock events
7. Connect to real NestJS backend
8. Add `SettingsModal`, theme/accent switching
9. Mobile responsive pass
10. Polish animations, confetti, toast
