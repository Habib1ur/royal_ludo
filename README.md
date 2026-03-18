# Royal Ludo

A polished browser-based **Ludo game** built with **React**, **TypeScript**, and **Vite**.
It is designed for local play, smooth fullscreen sessions, clean animations, and lightweight performance modes for smaller devices.

---

## Overview

Royal Ludo is a frontend-only board game experience with:

- local multiplayer for **2, 3, or 4 players**
- support for **human and AI seats**
- a responsive animated board
- fullscreen play for phones, tablets, and desktop
- persistent saved matches using `localStorage`

No backend is required.

---

## Highlights

### Gameplay

- Standard Ludo movement rules
- Roll a `6` to leave home
- Exact roll required to finish
- Safe cells protect tokens from capture
- Captures send opponents back home
- First player to finish all four tokens wins

### Match Tools

- Undo last turn
- Move history
- Live match stats
- Resume saved game
- Manual/offline dice entry
- Turn timer options

### Visual Experience

- Premium-looking board layout
- Fullscreen board mode
- Responsive UI for mobile and tablet
- Dark and light theme support
- Performance modes for weaker devices

### Audio and Feedback

- Dice, step, capture, and win sound hooks
- Optional vibration feedback on supported devices

---

## Feature Set

| Area | Included |
| --- | --- |
| Player count | `2`, `3`, `4` players |
| Player type | Human and AI |
| Dice modes | Normal roll and manual dice input |
| Save system | Browser `localStorage` |
| Performance | `Off`, `basic`, `ultra` |
| Timer | `Off`, `15s`, `30s` |
| Themes | Dark and Light |
| Platform | Frontend-only Vite app |

---

## Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Framer Motion**
- **Zustand**
- **Lucide React**

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

---

## How To Play

1. Start a match from the lobby.
2. Choose player count and configure seats.
3. Roll the dice or enter the value manually in offline dice mode.
4. Move a valid token.
5. Capture opponents, race through the board, and finish all four tokens.

### Core Rules

- A token can only leave home on a roll of `6`
- Safe cells cannot be captured
- Illegal moves are blocked automatically
- A player must roll the exact value needed to finish
- The first player to finish all four tokens wins

---

## Match Options

### Auto Move
Automatically moves a token when there is only one legal move.

### Move Hints
Highlights selectable tokens more clearly.

### Performance Modes

- `Off`: full effects and visuals
- `basic`: lighter styling and reduced effects
- `ultra`: minimal rendering for low-end devices

### Turn Timer

- `Off`
- `15 seconds`
- `30 seconds`

### Sounds
Enables built-in game sound effects.

### Offline Dice
Lets players enter the real dice value manually instead of rolling digitally.

---

## Fullscreen Experience

Royal Ludo is optimized for fullscreen board play.

- **Desktop:** large centered board with floating controls
- **Phone and tablet:** fullscreen board with landscape-friendly play
- **Compact widths:** icon-first controls to save space

Note: automatic orientation lock depends on browser/device support.

---

## Project Structure

```text
src/
  components/   Reusable UI pieces
  constants/    Static board and player data
  hooks/        Sound and interaction hooks
  store/        Zustand game state
  types/        TypeScript models
  utils/        Rule and board helpers
```

---

## Deployment

This project works well on **Vercel** or any static hosting platform.

### Recommended Vercel settings

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

---

## Notes

- Match progress is saved in the browser
- No backend or database is required
- The current architecture is suitable for future additions like:
  - stronger AI
  - online multiplayer
  - custom rule presets
  - player profiles

---

## Status

Royal Ludo is currently a **frontend game project** focused on local multiplayer, responsive fullscreen play, and clean game-state management.
