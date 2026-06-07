# Theme System

Funni Bippi uses a flexible theming system built on CSS custom properties (variables) and data attributes. It supports two modes (light/dark) and multiple accent colors.

## Architecture

```
Settings Store (Zustand)
    ↓ persists to localStorage
    ↓
useTheme() hook
    ↓ syncs to DOM
    ↓
data-theme & data-accent attributes
    ↓ triggers CSS selectors
    ↓
CSS variables update
    ↓
UI re-renders with new colors
```

## Components

### 1. Settings Store (`store/settingsStore.ts`)

Zustand store with `persist` middleware. Saves to `localStorage` under key `funni-bippi-settings`.

**State:**
- `theme`: `'light'` | `'dark'` (default: `'light'`)
- `accent`: accent color ID (default: `'coral'`)
- `notifyMatch`, `notifySound`, `showTyping`: other settings

**Persisted:** Yes (survives page reload)

### 2. useTheme Hook (`hooks/useTheme.ts`)

Syncs store state to DOM. Runs on every theme/accent change:

```tsx
useEffect(() => {
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  html.setAttribute('data-accent', accent);
}, [theme, accent]);
```

Sets attributes on `<html>` so CSS selectors can apply different colors.

### 3. CSS System (`app/globals.css`)

#### Base Variables (`:root`)
Light mode defaults. Applied when no `data-theme` is set.

```css
:root {
  --bg: #fbf5ef;           /* light cream background */
  --text: #2b2520;         /* dark text */
  --accent: #ff6b5e;       /* coral (default) */
  --accent-grad: linear-gradient(135deg, #ff8e6b 0%, #ff5e72 100%);
  /* ... more variables ... */
}
```

#### Dark Mode (`[data-theme='dark']`)
Overrides base variables for dark mode:

```css
[data-theme='dark'] {
  --bg: #181410;           /* dark background */
  --text: #f4ede5;         /* light text */
  --bubble-them: #2c251f;
  /* ... */
}
```

#### Accent Colors
Each accent has its own selector that overrides `--accent` variables:

```css
[data-accent='teal'] {
  --accent: #16bfae;
  --accent-grad: linear-gradient(135deg, #2bd9c3 0%, #11a6c7 100%);
  /* ... */
}

[data-accent='yellow'] {
  --accent: #ffb627;
  --accent-contrast: #4a370e;  /* yellow text needs darker contrast */
  /* ... */
}
```

#### Combining Theme + Accent
CSS specificity handles both:

```css
[data-theme='dark'][data-accent='yellow'] {
  --accent-soft: rgba(255, 182, 39, 0.16);  /* tweaked for dark yellow */
}
```

## Usage

### In Components

```tsx
import { useTheme } from '@/hooks/useTheme';

export function MyComponent() {
  const { theme, accent, setTheme, setAccent } = useTheme();

  return (
    <>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        Toggle theme
      </button>
      <button onClick={() => setAccent('teal')}>
        Switch to teal
      </button>
    </>
  );
}
```

### In CSS

Always use CSS variables, never hardcoded colors:

```css
.my-component {
  background: var(--bg);
  color: var(--text);
  border-color: var(--border);
  box-shadow: var(--shadow-m);
}

.highlight {
  color: var(--accent-strong);
  background: var(--accent-soft);
}
```

## Available Themes

- `light` (default)
- `dark`

## Available Accents

- `coral` (default) — `#ff6b5e`
- `teal` — `#16bfae`
- `yellow` — `#ffb627` (note: different text contrast)
- `blue` — `#3c6bff`
- `pink` — `#ff5e9e`

## CSS Variables Reference

### Colors
- `--bg` — main background
- `--bg-elev` — elevated surface (cards, modals)
- `--bg-sunken` — depressed surface
- `--text` — primary text
- `--text-soft` — secondary text (lighter)
- `--text-faint` — tertiary text (faintest)
- `--border`, `--border-2` — border colors (1, 2 = strength)

### Accents
- `--accent` — primary accent
- `--accent-2` — secondary/lighter accent
- `--accent-strong` — darker variant (for text on light backgrounds)
- `--accent-soft` — very light tint (for backgrounds)
- `--accent-contrast` — text color that contrasts with `--accent-grad`
- `--accent-grad` — gradient for buttons

### Shadows
- `--shadow-s` — small shadow (hover states)
- `--shadow-m` — medium shadow (cards)
- `--shadow-l` — large shadow (modals)

### Radius
- `--r-sm` — 12px (buttons)
- `--r-md` — 18px (cards)
- `--r-lg` — 26px (modals)
- `--r-xl` — 34px (large modals)

### Misc
- `--online` — online indicator color (`#34c77b`)

## Storage

Settings persist to browser localStorage under `funni-bippi-settings`:

```json
{
  "theme": "dark",
  "accent": "teal",
  "notifyMatch": true,
  "notifySound": false,
  "showTyping": true
}
```

Persists across browser sessions automatically via Zustand middleware.

## Performance

- **No runtime style injection** — all CSS is static
- **Instant theme switch** — just DOM attribute update (no re-render needed)
- **GPU-accelerated** — CSS transitions on theme change
- **Mobile-friendly** — respects `prefers-color-scheme` for system defaults (future)

## Adding New Colors

1. Add new accent to `AccentColor` type (`types/index.ts`)
2. Add CSS block to `globals.css`:
   ```css
   [data-accent='mycolor'] {
     --accent: #hexcode;
     --accent-2: #hexcode;
     --accent-strong: #hexcode;
     --accent-soft: rgba(r, g, b, 0.14);
     --accent-contrast: #hexcode;
     --accent-grad: linear-gradient(...);
   }
   ```
3. Update UI picker options in `SettingsModal.tsx`

## Known Limitations

- Accent colors are CSS-driven only (no per-component override)
- Theme switch is global (no per-page themes)
- System theme detection not yet implemented (could auto-detect `prefers-color-scheme`)
