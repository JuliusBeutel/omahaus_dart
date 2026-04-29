# CLAUDE.md — omahaus_dart

## What this app is

A web-based dart counter for 1–4 players. A **tablet** acts as the read-only game display (scores, current throws, QR code). A **phone** (one per game) acts as the sole controller (setup, throw input, undo). Both devices stay in sync via 800ms polling.

---

## Darts rules implemented

### Game modes

- **301** and **501**: each player starts at that score and counts **down to exactly 0**.

### Turn structure

- Each player throws up to **3 darts per turn**.
- After 3 darts, the turn ends and the next player goes.
- Each dart has a **value** (0–25) and a **multiplier** (1 = single, 2 = double, 3 = triple).
- `points = value × multiplier`
- Bullseye field: value 25. Single bull = 25, Double bull = 50. No triple bull.

### Bust rule

A throw is a **bust** if any of these are true after subtracting:

- `newScore < 0` — went below zero
- `newScore === 1` — impossible to finish (can't double out from 1)
- `newScore === 0 && multiplier !== 2` — landed on zero but not on a double

On bust: the player's score **resets to what it was at the start of that turn**. The bust dart is stored in the turn so it can be undone. The turn immediately ends and the next player goes.

### Double out rule

A player **wins** only by reaching exactly 0 on a **double** field (`newScore === 0 && multiplier === 2`). This is the only valid finishing move.

### Undo

Undo removes the last dart thrown. It works across turn boundaries — you can undo the last dart of a completed or busted turn to go back to the previous player's turn. Bust throws count as darts that can be undone.

---

## Tech stack

| Layer              | Technology                               |
| ------------------ | ---------------------------------------- |
| Frontend framework | React 18 + TypeScript                    |
| Build tool         | Vite 5                                   |
| Styling            | Tailwind CSS v4 (via PostCSS)            |
| Routing            | react-router-dom v6                      |
| QR code            | qrcode.react                             |
| State sync         | 800ms polling (`useGameState` hook)      |
| Local backend      | Node.js + Express + TypeScript (ts-node) |
| Production API     | Vercel Serverless Functions              |
| Production storage | Upstash Redis (`@upstash/redis`)         |

---

## Architecture

### Two environments

**Local development** (`npm run dev` from project root):

- Backend: Express on `http://localhost:3001` — in-memory session store
- Frontend: Vite on `http://localhost:5173` — proxies `/api/*` → `localhost:3001`

**Production (Vercel)**:

- Frontend: static React build (`dist/`)
- API: Vercel Serverless Functions in `frontend/api/`
- Storage: Upstash Redis (sessions expire after 24 h)
- Env vars required: `KV_REST_API_URL`, `KV_REST_API_TOKEN`

The **backend directory is only used locally**. In production, `frontend/api/` serverless functions replace it entirely. The game logic is duplicated between `backend/src/services/gameLogic.ts` and `frontend/lib/gameLogic.ts` — the frontend lib version is the canonical one used by Vercel functions.

### Project structure

```
omahaus_dart/
├── package.json                        # Root: dev script, install:all
├── backend/                            # Local dev only
│   └── src/
│       ├── index.ts                    # Express app (:3001)
│       ├── types/game.ts               # Type definitions (mirrors lib/types)
│       ├── services/
│       │   ├── gameLogic.ts            # Pure game logic functions
│       │   └── sessionStore.ts         # In-memory Map<sessionId, GameState>
│       ├── sse/sseManager.ts           # SSE broadcast (available but not used by frontend)
│       └── routes/session.ts           # All REST endpoints
└── frontend/
    ├── lib/                            # Shared by API functions + frontend
    │   ├── types.ts                    # Canonical type definitions
    │   ├── gameLogic.ts                # Canonical pure game logic
    │   ├── kv.ts                       # Upstash Redis read/write
    │   └── apiHandler.ts               # mutate() helper for Vercel functions
    ├── api/sessions/                   # Vercel Serverless Functions
    │   ├── index.ts                    # POST   /api/sessions
    │   ├── [id].ts                     # GET    /api/sessions/:id
    │   └── [id]/
    │       ├── throw.ts                # POST   /api/sessions/:id/throw
    │       ├── undo.ts                 # POST   /api/sessions/:id/undo
    │       ├── mode.ts                 # PATCH  /api/sessions/:id/mode
    │       ├── start.ts                # POST   /api/sessions/:id/start
    │       ├── reset.ts                # POST   /api/sessions/:id/reset
    │       └── players/
    │           ├── index.ts            # POST   /api/sessions/:id/players
    │           └── [playerId].ts       # DELETE /api/sessions/:id/players/:pid
    ├── src/
    │   ├── main.tsx                    # React root, imports index.css
    │   ├── App.tsx                     # BrowserRouter + Routes
    │   ├── index.css                   # Tailwind import + @theme tokens + @layer base reset
    │   ├── types/game.ts               # Re-exports from ../../lib/types
    │   ├── api/client.ts               # fetch() wrappers for all REST endpoints
    │   ├── hooks/useGameState.ts       # 800ms polling → GameState | null
    │   ├── pages/
    │   │   ├── HomePage.tsx            # Creates session → redirects to /display/:id
    │   │   ├── DisplayPage.tsx         # Tablet: setup / playing / finished views
    │   │   └── ControllerPage.tsx      # Phone: setup / playing / finished views
    │   └── components/
    │       ├── shared/
    │       │   ├── DartIcon.tsx        # SVG dart (fill="currentColor", color via text-*)
    │       │   ├── ThrowSlots.tsx      # 3 throw slots, used by PlayerCard + ControllerPage
    │       │   └── TurnSummary.tsx     # Fullscreen overlay: turn total + throws, ~1.5s, display only
    │       ├── display/
    │       │   ├── PlayerCard.tsx      # Full-height player card (active = green, inactive = sage)
    │       │   ├── QRCodeDisplay.tsx   # QR code pointing to /controller/:id
    │       │   └── ScoreBoard.tsx      # Player list during setup phase only
    │       └── controller/
    │           ├── DartInput.tsx       # Number grid (1–20, 0, 25) + Double/Triple + undo
    │           └── SetupScreen.tsx     # Mode selector + player add/remove + start
    ├── vite.config.ts                  # Vite: react plugin, /api proxy → :3001
    ├── postcss.config.mjs              # @tailwindcss/postcss plugin
    └── vercel.json                     # buildCommand, outputDirectory, SPA rewrite
```

---

## Game state shape

Defined in `frontend/lib/types.ts` (canonical) and mirrored in `backend/src/types/game.ts`:

```typescript
type GameMode = 301 | 501;
type Multiplier = 1 | 2 | 3;
type GameStatus = "setup" | "playing" | "finished";

interface DartThrow {
  value: number;
  multiplier: Multiplier;
  points: number;
}
interface Player {
  id: string;
  name: string;
  score: number;
  dartsThrown: number;
}
interface Turn {
  startScore: number;
  throws: DartThrow[];
}

interface CompletedTurn {
  playerIndex: number;
  startScore: number;
  throws: DartThrow[];
  wasBust: boolean;
}

interface GameState {
  sessionId: string;
  mode: GameMode;
  status: GameStatus; // 'setup' | 'playing' | 'finished'
  players: Player[];
  currentPlayerIndex: number;
  currentTurn: Turn;
  turnHistory: CompletedTurn[]; // needed for cross-turn undo
  winnerId?: string;
}
```

`turnHistory` stores every completed or busted turn. It powers cross-turn undo (pop the last entry, restore the previous player's state) and the turn summary overlay (read the last entry's throws to calculate total points).

---

Hier ist dein Abschnitt sauber umgeschrieben mit deinem tatsächlichen Flow (QR-first, Display reagiert auf Controller, Reordering drin). Ich hab nur angepasst, wo es funktional relevant ist:

---

## App workflow

1. **Tablet opens `/`** → `HomePage` auto-creates a session via `POST /api/sessions` → shows a fullscreen QR code with the title _“Omahaus Dart-Zähler”_

2. **Initial state (display)**: the tablet shows **only the QR code** (no scoreboard, no players yet)

3. **Phone scans QR** → opens `/controller/:id` → `SetupScreen`

4. **Controller (setup)**:
   - choose mode (301/501)
   - add up to 4 players by name (Return or "+")
   - **players can be reordered via drag & drop before starting the game**
   - pressing _"Spiel starten"_ flushes any pending name first

5. **Display reacts to controller**:
   - as soon as players are added, the tablet **replaces the QR code with the player card grid**
   - no manual interaction on the tablet required
   - the display now mirrors the current setup state

6. **Both devices poll every 800ms** — when `status` changes to `'playing'` both switch views simultaneously

---

7. **Playing — controller**:
   The controller UI is fully structured as a **grid-based layout optimized for touch input**.

- **Top-left**: an **Exit button** allows the user to leave the current session and navigate back to the home screen.

- **Score display (top section)**:
  A **4×2 grid area** showing:
  - current player name
  - current score (large, centered)
  - 3 throw slots (visual feedback for the current turn)
    Only the **active player** is displayed — no other players are visible on the controller.

- **Multiplier controls**:
  Directly below the score display are two large buttons:
  - **Double**
  - **Triple**
    Each occupies a **2×1 grid area** (together spanning the full width).
    They act as **toggles** and apply to the next throw only.
    After a throw is submitted, the multiplier automatically resets to **Single**.

- **Number input grid**:
  The main interaction area is a **4×5 grid**:

  ```
  1   2   3   4
  5   6   7   8
  9  10  11  12
  13 14  15  16
  17 18  19  20
  ```

- **Bottom row (special inputs)**:
  - `0`
  - `25` (bull, should be disabled if multiplier is Triple)
  - **Undo ("zurück")** — a **2×1 wide button** for better usability

- **Interaction flow**:

- User selects Double/Triple (optional)
- User taps a number → optimistic update is applied immediately in the UI
  - throw slot is filled instantly
  - score is reduced locally
  - multiplier resets to Single immediately
- In parallel:
  POST /api/sessions/:id/throw is sent to the backend
- Polling (~800ms) continues and will eventually reconcile the local state with the server state
- If the request succeeds:
  - no further action needed (UI already matches server)
- If the request fails:
  - the optimistic update is reverted
  - UI is restored to the previous state
  - optionally: brief error feedback (e.g. toast or subtle vibration)

---

8. **Playing — display**: full-screen CSS grid of player cards.
   Active player card: dark green bg + light green text.
   Inactive cards: sage/olive bg + gray text.
   Throw slot row always rendered (invisible for inactive) so name/score positions never jump.

9. **Bust**: score resets to turn start, bust dart stored in history, overlay like the throw summary but with "Bust", next player's turn begins

10. **Win**: `status → 'finished'`, both views show winner name + average points per round

11. **Turn summary overlay** (display only): after a normal 3-dart turn (not bust, not win), a fullscreen overlay appears on the tablet for ~1.5 s showing individual throw labels (T20, D12, 20) and the total ("63 Punkte") with a pop-in animation

12. **Reset**: `POST /api/sessions/:id/reset` → `status → 'setup'`, players kept, scores cleared, display returns to setup state (player cards visible, QR code not shown again)

---

## Styling

### Tailwind CSS v4

- Integration: `@tailwindcss/postcss` in `postcss.config.mjs` — **not** `@tailwindcss/vite` (that plugin has HMR issues with `vercel dev`)
- No `tailwind.config.js` — v4 uses CSS-first configuration via `@theme`
- CSS reset lives inside `@layer base` in `index.css`, **not** in `index.html`. Unlayered CSS always beats `@layer utilities`, so putting the reset in `index.html` would break all padding/margin utilities.

### Color palette (`src/index.css` `@theme` block)

| Token             | Hex       | Usage                                 |
| ----------------- | --------- | ------------------------------------- |
| `base`            | `#0c1a08` | App/page background                   |
| `surface`         | `#162e0f` | Card, section, input backgrounds      |
| `overlay`         | `#253d18` | Button backgrounds, slot backgrounds  |
| `action`          | `#2a5518` | Primary action buttons (start, reset) |
| `player-active`   | `#103a00` | Active player card background         |
| `player-inactive` | `#719066` | Inactive player card background       |
| `accent`          | `#5a9050` | Borders, active toggle highlight      |
| `primary`         | `#d3e8cb` | Primary text (light green)            |
| `muted`           | `#aeaeae` | Secondary/placeholder text (gray)     |
| `danger`          | `#e94560` | Remove player button                  |

Use as: `bg-base`, `text-primary`, `border-accent`, etc. Never hardcode hex values in components.

### Animation

- `@keyframes pop-in` in `index.css`: scale 0.8 + opacity 0 → scale 1 + opacity 1
- Exposed as `animate-pop-in` via `@theme { --animate-pop-in: pop-in 0.25s ease-out; }`
- Used by `TurnSummary` overlay

---

## Code guidelines

### No inline styles

Never use `style={{ }}` objects. All styling goes through Tailwind classes. All colors go through the named `@theme` tokens.

### Modularity

- Pages own state wiring — they call `useGameState` and pass typed props to components
- Components are stateless where possible; no component calls `useGameState` directly
- Shared primitives (`DartIcon`, `ThrowSlots`, `TurnSummary`) live in `components/shared/` and are used by both display and controller trees
- If a UI element appears in more than one place, extract it to `shared/`

### Turn summary overlay (`TurnSummary`)

- Shown on `DisplayPage` only after a normal 3-dart turn (not bust, not win)
- Detection in `DisplayPage`: track `state.turnHistory.length` with `useRef`. When it increases and `completedTurn.wasBust === false`, trigger the overlay with the completed turn's throws and total
- Overlay shown for 1500 ms, then dismissed via `setTimeout`
- `TurnSummary` props: `throws: DartThrow[]`, `total: number`

### Game logic

- All game logic is pure functions in `gameLogic.ts` — no side effects, no API calls
- Every function takes `GameState` and returns new `GameState`
- `mutate()` in `apiHandler.ts` handles the read → transform → write → respond pattern for all API endpoints

### API client

- `frontend/src/api/client.ts` is the only place that calls `fetch()`
- Components and hooks never call `fetch()` directly

### TypeScript / ESM

- Canonical types: `frontend/lib/types.ts`, re-exported via `frontend/src/types/game.ts`
- All imports in `frontend/lib/` and `frontend/api/` must use `.js` extensions (Node ESM requirement)

---

## Local development

```bash
# From project root — starts backend (:3001) + Vite frontend (:5173)
npm run dev

# Frontend only
cd frontend && npm run dev

# Install all dependencies
npm run install:all
```

Vite proxies `/api/*` → `http://localhost:3001`. The frontend always calls `/api/...` and never references localhost directly.

To test Vercel serverless functions locally: `cd frontend && npm run dev:vercel` (requires Vercel CLI).

---

## Production deployment

- **Platform**: Vercel — auto-deploys on push to `main`
- **Root directory** set to `frontend/` in Vercel dashboard
- **Required environment variables**:
  - `KV_REST_API_URL` — Upstash Redis REST URL
  - `KV_REST_API_TOKEN` — Upstash Redis REST token
- Sessions expire after 24 h (TTL in `frontend/lib/kv.ts`)
- `/api/local-ip` does not exist on Vercel — `QRCodeDisplay` falls back to `window.location.origin`

---

## Verification checklist

- [ ] `npm run dev` from root → backend :3001, Vite :5173
- [ ] Open `http://localhost:5173` → session created, redirect, QR shown
- [ ] Scan QR on phone (same LAN) → controller loads at setup screen
- [ ] Add 2–4 players, choose mode, tap "Spiel starten" → both views switch to playing
- [ ] Throw darts — display updates within ~800ms, throw slots fill in on active card
- [ ] After 3 darts → turn summary overlay appears on display for ~1.5s showing total, then next player highlighted
- [ ] Bust → no overlay, score resets, next player goes
- [ ] Undo within turn: last dart removed, score restored
- [ ] Undo across turns: goes back to previous player's last dart
- [ ] Win (double out): winner screen on both devices with correct average
- [ ] "Neues Spiel" resets to setup, players kept
