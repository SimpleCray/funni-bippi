# Handoff: Funni Bippi — "World without strangers."

## Overview

Funni Bippi is a chat-with-strangers web app. One tap matches you with a random online stranger for an anonymous conversation. No profiles, no photos, no real names — just vibes. The experience is warm, playful, and fast.

**Tagline:** *World without strangers.*  
**Core flow:** Landing → Matchmaking → Active Chat → (optional) Settings

---

## About the Design Files

The files in this bundle (`*.html`, `*.jsx`, `*.css`) are **design references built as interactive HTML prototypes** — they show exactly what the UI looks like and how it behaves, but they are NOT production code.

Your task is to **recreate these designs in your existing codebase** (React, Next.js, Vue, etc.) using its established component libraries, routing, and patterns. If you are starting a new project, we recommend **React + Vite** (or Next.js). Do **not** ship the prototype HTML files directly.

**Fidelity: High-fidelity.** These are pixel-precise mockups. Recreate colors, typography, spacing, animations, and interaction states exactly as specified.

---

## Quick Reference — Key Files

| File | Contents |
|---|---|
| `Funni Bippi.html` | Entry point — loads all scripts |
| `styles.css` | All design tokens and component CSS classes |
| `icons.jsx` | SVG icon components + `Mascot` blob + `Logo` |
| `data.jsx` | Stranger name generator, auto-reply pool, icebreakers |
| `components.jsx` | Avatar, Bubble, Composer, Sidebar, ProfilePanel, Toast |
| `screens.jsx` | Landing, Matchmaking, Settings screens |
| `app.jsx` | App state machine, routing, tweaks wiring |

Open `Funni Bippi.html` in a browser to interact with the full prototype.

---

## Design Tokens

### Typography

| Role | Font | Weight | Size | Notes |
|---|---|---|---|---|
| Display / headings | Poppins | 800 | varies | letter-spacing -0.03em |
| Subheadings / labels | Poppins | 700 | varies | |
| UI labels | Poppins | 600 | 13–16px | |
| Body / messages | DM Sans | 400–500 | 14–16px | |

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap
```

### Color — Light Mode (default)

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#FBF5EF` | Page background (warm cream) |
| `--bg-elev` | `#FFFFFF` | Cards, panels, elevated surfaces |
| `--bg-sunken` | `#F1E8DF` | Sidebar, inputs, segmented controls |
| `--text` | `#2B2520` | Primary text |
| `--text-soft` | `#756758` | Secondary text, placeholders |
| `--text-faint` | `#A99B8C` | Timestamps, labels, hints |
| `--border` | `rgba(43,37,32,0.09)` | Default border |
| `--border-2` | `rgba(43,37,32,0.06)` | Subtle dividers |
| `--bubble-them` | `#FFFFFF` | Stranger chat bubble bg |
| `--bubble-them-text` | `#2B2520` | Stranger chat bubble text |
| `--online` | `#34C77B` | Online status dot |

### Color — Dark Mode

| Token | Value |
|---|---|
| `--bg` | `#181410` |
| `--bg-elev` | `#241E19` |
| `--bg-sunken` | `#120F0C` |
| `--text` | `#F4EDE5` |
| `--text-soft` | `#B4A89B` |
| `--text-faint` | `#7C7064` |
| `--border` | `rgba(255,255,255,0.08)` |
| `--bubble-them` | `#2C251F` |
| `--bubble-them-text` | `#F0E8DF` |

**Implementation:** Apply `data-theme="dark"` on the root element. All `var(--token)` values cascade automatically. **Important:** Set `color: var(--text)` on the root element itself (not just body) so inherited text colors respect the active theme in all subtrees.

### Accent Colors (user-selectable)

Apply `data-accent="coral|teal|yellow|blue|pink"` on root. CSS `var()` tokens update accordingly.

| Accent | `--accent` | `--accent-2` | `--accent-strong` | `--accent-contrast` | Gradient |
|---|---|---|---|---|---|
| **coral** (default) | `#FF6B5E` | `#FF8A5E` | `#EF5446` | `#FFFFFF` | `135deg, #FF8E6B → #FF5E72` |
| **teal** | `#16BFAE` | `#2AD4C0` | `#0FA797` | `#FFFFFF` | `135deg, #2BD9C3 → #11A6C7` |
| **yellow** | `#FFB627` | `#FFC93C` | `#F0A413` | `#4A370E` | `135deg, #FFD25E → #FFA92E` |
| **blue** | `#3C6BFF` | `#6EA8FF` | `#2C57E0` | `#FFFFFF` | `135deg, #6EA8FF → #3C6BFF` |
| **pink** | `#FF5E9E` | `#FF9EC8` | `#EF4789` | `#FFFFFF` | `135deg, #FF9EC8 → #FF5E9E` |

The `--accent-grad` gradient is used for: primary button bg, "me" chat bubbles, send button, logo, sidebar active nav, and avatar fills.

### Spacing & Shape

| Token | Value |
|---|---|
| Border radius SM | `12px` |
| Border radius MD | `18px` |
| Border radius LG | `26px` |
| Border radius XL | `34px` |
| Pills / full round | `9999px` |
| Shadow S | `0 2px 8px rgba(90,66,40,0.06)` |
| Shadow M | `0 8px 26px rgba(90,66,40,0.10)` |
| Shadow L | `0 24px 60px rgba(90,66,40,0.16)` |

Dark mode shadows use `rgba(0,0,0,...)` equivalents (S: 0.30, M: 0.40, L: 0.55).

---

## Screens / Views

### 1 — Landing

**Purpose:** First impression. Introduces the brand, lets users pick a gender filter, and starts a chat.

**Layout:** Full-viewport flex column. No sidebar.

```
┌──────────────────────────────────────────┐
│  Logo + Wordmark        [🌙] [⚙️]        │  ← landing-top: h-auto, px-40, py-26
├──────────────────────────────────────────┤
│  [decorative blobs — coral, blurred]      │  ← position: absolute, z-index: 1
│  [floating "hi there!" speech bubble]     │  ← deco-bubble: absolute, animated
│                                           │
│         Mascot blob (104px)               │  ← bobbing animation (7s ease-in-out)
│    "✨ Meet someone new, right now"       │  ← eyebrow pill: accent-soft bg
│   World without                           │
│       strangers.       ← coral gradient  │  ← hero-title: Poppins 800, clamp(44→88px)
│                                           │
│   [sub-copy, 1–2 lines, text-soft]        │  ← max-width: 46ch
│                                           │
│   [Start Chatting ✨]  ← primary CTA     │  ← btn-primary huge, pill, accent-grad
│   "I'd like to chat with"                 │
│   [Everyone] [Male] [Female]              │  ← seg pill selector
│   theme ● ● ●                            │  ← 22px swatch dots
└──────────────────────────────────────────┘
```

**Decorative blobs:** `position: absolute; border-radius: 50%; filter: blur(2px); opacity: 0.5`. Two blobs: `240px` coral top-left; `180px` accent-2 bottom-right. Both use `floaty` keyframe animation (`translateY(0 ↔ -22px)`, 7s, staggered delays).

**Floating chat-bubble decor:**
- Style: white card, `border-radius: 24px 24px 24px 8px`, `box-shadow: shadow-M`, `padding: 12px 16px`, emoji + text, `font-size: 14px`.
- Three instances at different corners, each with `floaty` animation and different delays.

**"Start Chatting" button:** `padding: 20px 40px; font-size: 21px; border-radius: 9999px`. On hover: `translateY(-2px) scale(1.02)`, stronger shadow. Persistent pulse animation on hover targeting the box-shadow.

**Gender filter pill (`seg`):** Background `--bg-sunken`, `border-radius: 9999px`, inner buttons `padding: 10px 20px`. Active state: `background: --bg-elev; color: --accent-strong; box-shadow: shadow-S`.

---

### 2 — Matchmaking / Loading

**Purpose:** Animated wait state between tapping "Start Chatting" and the chat opening.

**Layout:** Full-viewport, centered column, `text-align: center`.

```
        [Radar animation]
   ┌──────────────────────────┐
   │   ripple rings × 3       │
   │     [Mascot blob]        │  ← 70px, inside 92px coral circle
   └──────────────────────────┘

  "Looking for someone cool…   ···"   ← cycling copy (4 lines, 1400ms interval)
   "Matching you with anyone friendly who's online"  ← --text-soft
             [Cancel]
```

**Radar:** `220×220px` container. Three `ring` divs: `position: absolute; border-radius: 50%; border: 2px solid --accent`. Each animates from `70×70px opacity:0.7` → `220×220px opacity:0` over 2.4s, staggered by 0.8s. Center core: `92×92px`, `border-radius: 50%`, `background: --accent-grad`, `box-shadow: 0 10px 30px -6px --accent`. Core pulses `scale(1 ↔ 1.08)` on a 2s loop.

**Cycling copy:** Rotate through these 4 strings every 1400ms (fade or instant swap):
1. "Looking for someone cool…"
2. "Tuning into the same wavelength…"
3. "Shaking the friendship snow globe…"
4. "Almost there — they seem nice 👀"

**Animated dots:** Three `7×7px` circles in `--accent`, bouncing via `translateY(0 ↔ -7px)` at 1.3s, staggered by 0.18s.

---

### 3 — Active Chat (3-column desktop)

**Layout:** Full-viewport flex row.

```
┌──────┬────────────────────────────────┬───────────────┐
│ 86px │         flex: 1                │    312px       │
│ Side │         Center                 │    Right Panel │
│ bar  │                                │  (collapsible) │
└──────┴────────────────────────────────┴───────────────┘
```

#### Left Sidebar (86px wide)

`background: --bg-elev; border-right: 1px solid --border`

Top to bottom:
1. **Logo** — 42px SVG speech-bubble logo (clickable → home)
2. **Your avatar** — 46px circular gradient avatar with green online dot (`9px` dot, `2.5px --bg-elev border`)
3. **Nav icons** — 48×48px rounded buttons (r:16px) for Chat, Profile, Settings. Active state: `background: --accent-grad; color: --accent-contrast; box-shadow: 0 6px 16px -5px --accent`
4. **Spacer** (flex: 1)
5. **Accent swatches** — 3 × 22px circles (coral/teal/yellow). Active: `box-shadow: 0 0 0 2.5px --bg-elev, 0 0 0 4.5px currentColor`
6. **1px divider line** (32px wide)
7. **Theme toggle** — sun/moon icon button, `border-radius: 9999px`

#### Center Panel

**Top bar** (`height: 76px; background: --bg-elev; border-bottom: 1px solid --border; padding: 0 22px`):
- 46px stranger avatar (with online dot)
- Name: Poppins 700 17px + gender badge
- Sub: "Connected" (green dot + "Connected" in `--online` color) · "anonymous chat"
- Spacer
- "Next stranger" button: `btn-soft` (accent-soft bg, accent-strong text)
- Panel toggle icon button

**Message area** (`padding: 26px 26px 14px; overflow-y: auto; flex: 1`):
- Day pill: `align-self: center; background: --bg-elev; border: 1px solid --border-2; border-radius: 9999px; font-size: 12px; color: --text-faint; padding: 5px 14px`
- Message rows (see Bubble component below)
- Typing indicator (see below)

**Composer bar** (`padding: 14px 22px 18px; background: --bg-elev; border-top: 1px solid --border`):
- Inner bar: `background: --bg-sunken; border-radius: 9999px; padding: 6px 6px 6px 8px; border: 1.5px solid transparent`
- On focus: `border-color: --accent; box-shadow: 0 0 0 4px --accent-soft`
- Left: emoji icon button + clip icon button (38×38, round)
- Center: `<input>` pill with `font-size: 15px; placeholder: "Say something nice…"`
- Right: send button (44×44 round, `background: --accent-grad`, paper-plane icon)

#### Right Panel (312px, collapsible)

`background: --bg-elev; border-left: 1px solid --border`

Collapse: animate `width: 312px → 0; opacity: 1 → 0` on a `0.32s cubic-bezier(.4,0,.2,1)`.

Contents (scrollable inner container, `padding: 22px 20px`):

**Profile card:**
- `background: --bg; border: 1px solid --border; border-radius: 26px; padding: 22px 20px; text-align: center`
- 84px avatar + online dot
- Name: Poppins 800 20px
- Gender badge (pill with icon)
- Location/status: 13px --text-soft
- Interest chips: `background: --accent-soft; color: --accent-strong; border-radius: 9999px; padding: 5px 11px; font-size: 12px; font-weight: 600`

**Action buttons row:**
- Next: `btn-soft` (accent-soft bg)
- Report: `btn-danger` (white bg, red text `#E8604E`, hover: red-tinted bg)

**Icebreaker cards:**
- `background: --bg; border: 1px solid --border; border-radius: 18px; padding: 14px 16px`
- Emoji icon (20px) + text: regular + **bold coral** highlight
- Hover: `translateY(-2px) rotate(-0.4deg); border-color: --accent; box-shadow: shadow-S`
- Clicking an icebreaker sends its text as a message

---

### 4 — Settings Modal

**Trigger:** Settings icon in sidebar or landing header.

**Scrim:** `position: fixed; inset: 0; background: rgba(20,12,6,0.42); backdrop-filter: blur(4px)`. Click outside to close.

**Modal:** `width: min(520px, 100%); background: --bg-elev; border-radius: 34px; box-shadow: shadow-L`. Spring entrance: `scale(0.92) translateY(14px) → none`, 0.32s cubic-bezier(.34,1.56,.64,1).

**Sections:**

1. **Theme color** — 5-cell grid of gradient swatches (coral, teal, yellow, blue, pink). Each: `aspect-ratio: 1; border-radius: 18px`. Active: `box-shadow: 0 0 0 3px --bg-elev, 0 0 0 5.5px currentColor` + checkmark overlay.

2. **Appearance** — Two cards (Light / Dark) side by side. Each: `flex: 1; border: 1.5px solid --border; border-radius: 18px; padding: 16px`. Active: `border-color: --accent; background: --accent-soft; color: --accent-strong`. Shows a color swatch preview rectangle.

3. **Notifications** — Three `set-row` rows (space-between):
   - New match alerts (with subtitle)
   - Message sounds
   - Show typing indicator
   - Each has a custom toggle: `50×29px pill; background: --bg-sunken → --accent when on`. Knob: `23×23px white circle`, transitions `translateX(0 → 21px)` with spring easing.

---

### 5 — Mobile Responsive Layout

**Breakpoint:** `< 720px` viewport width collapses to single-column.

In Tweaks panel, "Device: mobile" renders the layout inside an iPhone frame (402×874px) for design preview.

**Mobile chat layout:**

```
┌─────────────────────┐
│ ← [Avatar] Name  🔀🚩│  ← m-topbar (back, stranger avatar, name, next, report)
├─────────────────────┤
│                     │
│  [message bubbles]  │  ← m-msgs (flex-col, scroll)
│                     │
├─────────────────────┤
│ [ice1] [ice2] [ice3]│  ← scrollable icebreaker chip row (no scrollbar)
│ [😊] [📎] input [→] │  ← m-composer
├─────────────────────┤
│ 💬Chat  👤Profile ⚙️│  ← m-nav (bottom tab bar, height ~64px)
└─────────────────────┘
```

Mobile tab bar: `background: --bg-elev; border-top: 1px solid --border`. Each tab: flex-col, centered, Poppins 600 10.5px. Active: `color: --accent-strong`.

---

## Key Components

### Chat Bubble

```
me:    align-self: flex-end;  bg: --accent-grad; color: --accent-contrast
                              border-radius: 22px 22px 7px 22px
them:  align-self: flex-start; bg: --bubble-them; color: --bubble-them-text
                              border-radius: 22px 22px 22px 7px
```

- **Entrance animation:** `pop-in` — `opacity:0; transform: translateY(8px) scale(0.92)` → normal. Duration 0.34s, `cubic-bezier(.34,1.56,.64,1)`.
- **Hover → shows:** timestamp (`font-size: 11px; color: --text-faint`) + reaction bar
- **Reaction bar:** absolute positioned (top:-16px), contains 6 quick-react emojis (`❤️😂👍😮🔥🙌`). `background: --bg-elev; border: 1px solid --border; border-radius: 9999px; box-shadow: shadow-M`. Animates in with `opacity: 0 → 1; transform: translateY(4px) scale(0.9) → none`.

### Typing Indicator

Three `8×8px` dots in `--text-faint`, inside a "them"-styled bubble. Each dot: `translateY(0 ↔ -7px)` bounce, 1.3s loop, staggered 0.18s.

### Avatar

- `border-radius: 50%`
- Background: each stranger has a generated `linear-gradient(135deg, color1, color2)` from a fixed palette of 10 colors.
- Shows first letter of display name
- Online dot: `--online (#34C77B)`, positioned bottom-right, `border: 2.5px solid --bg-elev`

### Gender Badges

| Value | Class | Background | Color |
|---|---|---|---|
| `male` | `gb-male` | `rgba(74,144,255,0.14)` | `#4A90FF` |
| `female` | `gb-female` | `rgba(255,107,158,0.16)` | `#F0609E` |
| `any` | `gb-any` | `--accent-soft` | `--accent-strong` |

Pill shape, includes small inline SVG icon (mars/venus/globe), `font-size: 12px; font-weight: 600`.

### Mascot Blob

Pure SVG, `100×100 viewBox`. No external assets. Key elements:
- Body: organic rounded `<path>` with vertical `linear-gradient(--accent-2 → --accent)`
- Eyes: white circles + dark pupils with white highlight dots
- Blush: semi-transparent white ellipses
- Smile: `stroke: #2B2520; stroke-width: 3.2; stroke-linecap: round`
- Antenna: small circle + line at top
- Bobbing: `translateY(0 ↔ -8px) rotate(-1deg ↔ 1.5deg)`, 3.4s ease-in-out infinite

### Logo

SVG speech bubble with gradient fill + concentric circle "bloop" ripple effect (3 rings at decreasing opacity). Used at 40–48px in sidebar/landing.

---

## State & Interactions

### App State Machine

```
landing  ──[Start Chatting]──▶  matching  ──[~2.6s]──▶  chat
  ▲                                                         │
  └──────────────────────[Logo / Cancel]───────────────────┘
                                                            │
                               chat ◀──[Next/Report]──────┘
                                         (brief re-matching)
```

| State var | Type | Notes |
|---|---|---|
| `screen` | `'landing' \| 'matching' \| 'chat'` | App-level routing |
| `stranger` | object | `{name, gender, grad, glyph, country, interests}` |
| `messages` | array | `{id, from:'me'\|'them', text, time, stranger, reaction}` |
| `typing` | boolean | Stranger is composing — shows typing indicator |
| `filter` | `'everyone' \| 'male' \| 'female'` | Gender preference for matching |
| `theme` | `'light' \| 'dark'` | Persisted |
| `accent` | string | One of the 5 accent IDs. Persisted. |

### Message Flow

1. User sends → append `{from:'me'}` message immediately
2. After 550ms → set `typing: true`, show typing indicator
3. After 900–1800ms → append `{from:'them'}` reply, `typing: false`
4. Scroll to bottom on every `messages` or `typing` change

### Match Moment

When a new stranger is found:
1. Dismiss matching screen, show chat
2. Fire **confetti** — ~70 particles (`position: fixed; top: -16px; random left: 0–100vw`) falling with `translateY(105vh) rotate(var(--rot))`. Colors: `["#FF8E6B","#16BFAE","#FFB627","#4A90FF","#FF6F9E","#3CC97B"]`
3. Show **toast** — pill notification centered top: `"✨ You matched! Say hi 👋"`. Spring entrance, auto-dismiss after 2.6s
4. Stranger sends opening message after 700ms delay

---

## Animations Summary

| Name | Element | Keyframes | Duration | Easing |
|---|---|---|---|---|
| `pop-in` | Chat bubbles (enter) | `opacity:0 scale:0.92 y:8px → normal` | 0.34s | `cubic-bezier(.34,1.56,.64,1)` |
| `floaty` | Deco blobs / bubbles | `translateY(0 ↔ -22px)` | 7s | `ease-in-out` |
| `bob` | Mascot blob | `translateY(0 ↔ -8px) rotate(-1 ↔ 1.5deg)` | 3.4s | `ease-in-out` |
| `bounce` | Typing dots | `translateY(0 ↔ -7px), opacity 0.5↔1` | 1.3s | `ease` |
| `radar` | Matchmaking rings | `70px opacity:0.7 → 220px opacity:0` | 2.4s | `ease-out` |
| `blip` | Online status dot | `box-shadow 0→7px, opacity 1→0` | 1.8s | `ease` |
| `toast-in` | Toast notification | `opacity:0 scale:0.85 y:-20px → normal` | 0.5s | `cubic-bezier(.34,1.56,.64,1)` |
| `confetti-fall` | Confetti pieces | `translateY(105vh) rotate(var(--rot))` | 2–3.6s | `cubic-bezier(.3,.6,.5,1)` |
| `spring-in` | Emoji picker popup | `opacity:0 scale:0.7 y:10px → normal` | 0.26s | `cubic-bezier(.34,1.56,.64,1)` |
| `modal-in` | Settings modal | `opacity:0 scale:0.92 y:14px → normal` | 0.32s | `cubic-bezier(.34,1.56,.64,1)` |

**Reduced motion:** all animations respect `@media (prefers-reduced-motion: reduce)` and a `data-motion="calm"` attribute that disables decorative loops.

---

## Stranger Name Generator

Each stranger gets a random name like `"FrostyQuokka89"`:
- Pick from `adjectives[]` (20 options: Blue, Mint, Coral, Sunny, Cosmic…)
- Pick from `animals[]` (17 options: Otter, Panda, Koala, Fox, Penguin, Narwhal, Axolotl…)
- Append a 2-digit number (10–99)

In production, run this on the server and generate a consistent name per session. See `data.jsx` for the full arrays and PRNG.

---

## Assets

All assets are **inline SVG or CSS** — no external image files needed. No external icon libraries. The prototype is fully self-contained except for Google Fonts (which you can self-host via `fontsource` npm packages).

```
npm install @fontsource/poppins @fontsource/dm-sans
```

Then import in your root CSS/JS:
```js
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/dm-sans/variable.css';
```

---

## Implementation Notes for Claude Code

1. **Start from `Funni Bippi.html`** — open it in a browser to see the full interactive prototype. Everything specified in this README is visually present and interactable.

2. **Read `styles.css`** for the exact CSS class definitions, keyframes, and variable declarations. Port the token system as CSS custom properties or a Tailwind config.

3. **Read `components.jsx`** for the exact JSX structure of every UI component. The hierarchy and className usage maps directly to the CSS in `styles.css`.

4. **Port the state machine from `app.jsx`** — the `screen`, `stranger`, `messages`, `typing` state and the timer-based conversation engine are production-ready logic, just wrapped in React prototype code.

5. **The mascot and logo SVG code** lives in `icons.jsx`. Copy the SVG paths as-is into your components.

6. **Tweak controls** are prototype-only — don't port the `tweaks-panel.jsx` to production. The theme/accent switching (driven by `data-theme` / `data-accent` attributes) is real product functionality and should be wired to your persistence layer (localStorage, user settings API, etc.).
