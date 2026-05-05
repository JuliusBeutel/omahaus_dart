# Omahaus Dart-Zähler

A web-based dart score tracker for 1–4 players, built for a two-device setup: a **tablet** as the read-only game display and a **phone** as the sole controller. Both stay in sync via polling.

## How it works

1. Open the app on a tablet — a session is created automatically and a QR code is shown
2. Scan the QR code on a phone to open the controller
3. Add players, choose a mode (301 / 501), and start the game
4. The tablet mirrors the game state in real time; the phone is the only input device

## Features

- **301 and 501** game modes — count down to exactly zero
- **Double-out rule** — win only by landing on a double
- **Bust detection** — score resets to turn start on bust
- **Undo** — remove the last dart thrown, works across turn boundaries
- **Drag-and-drop player reordering** before the game starts
- **Optimistic UI** on the controller — throws are reflected instantly, reconciled with the server on the next poll
- **Turn summary overlay** on the tablet after each completed turn
- **Washing machine detection** — special callout for 1, 5, 20

## Tech stack

| Layer              | Technology                    |
| ------------------ | ----------------------------- |
| Frontend           | React 18 + TypeScript, Vite 5 |
| Styling            | Tailwind CSS v4               |
| Routing            | react-router-dom v6           |
| QR code            | qrcode.react                  |
| State sync         | 800 ms polling                |
| Local backend      | Node.js + Express + ts-node   |
| Production API     | Vercel Serverless Functions   |
| Production storage | Upstash Redis (24 h TTL)      |

## Local development

```bash
# Install all dependencies (root + frontend + backend)
npm run install:all

# Start backend (:3001) + Vite frontend (:5173)
npm run dev
```

Open `http://localhost:5173` on the tablet device. Scan the QR code (or open the `/controller/:id` URL manually) on the phone. Both devices must be on the same local network.

To test Vercel serverless functions locally:

```bash
cd frontend && npm run dev:vercel
```

## Production deployment (Vercel)

The `frontend/` directory is the Vercel root. Set these environment variables in the Vercel dashboard:

| Variable            | Description              |
| ------------------- | ------------------------ |
| `KV_REST_API_URL`   | Upstash Redis REST URL   |
| `KV_REST_API_TOKEN` | Upstash Redis REST token |

Pushing to `main` triggers an automatic deploy. The backend directory is only used locally — in production, `frontend/api/` serverless functions take its place entirely.

## Project structure

```
omahaus_dart/
├── backend/                     # Local dev Express server (:3001)
│   └── src/
│       ├── index.ts
│       ├── routes/session.ts    # All REST endpoints
│       ├── services/
│       │   ├── gameLogic.ts
│       │   └── sessionStore.ts  # In-memory session store
│       └── types/game.ts
└── frontend/
    ├── lib/                     # Shared by API functions + frontend components
    │   ├── types.ts             # Canonical type definitions
    │   ├── gameLogic.ts         # Pure game logic (no side effects)
    │   ├── kv.ts                # Upstash Redis read/write
    │   └── apiHandler.ts        # mutate() helper for Vercel functions
    ├── api/sessions/            # Vercel Serverless Functions
    └── src/
        ├── pages/
        │   ├── HomePage.tsx     # Creates session → redirects to /display/:id
        │   ├── DisplayPage.tsx  # Tablet view (setup / playing / finished)
        │   ├── ControllerPage.tsx # Phone view (setup / playing / finished)
        │   └── ScanPage.tsx     # Fallback scan screen
        ├── components/
        │   ├── display/         # PlayerCard, QRCodeDisplay, ScoreBoard
        │   ├── controller/      # DartInput, SetupScreen
        │   └── shared/          # DartIcon, ThrowSlots, TurnSummary
        ├── hooks/useGameState.ts
        └── api/client.ts        # All fetch() calls live here
```

## Game rules

- Each turn: up to 3 darts, `points = value × multiplier`
- **Bust** if result goes below 0, lands on 1, or hits 0 on anything other than a double → score resets to turn start, turn ends immediately
- **Win** by reaching exactly 0 on a double field
- Bull counts as value 25 (single bull = 25 pts, double bull = 50 pts, no triple bull)
