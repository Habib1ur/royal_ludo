# Royal Ludo

A frontend-only Ludo game built with React, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, and Zustand.

## Features

- 2, 3, and 4 player local play
- Standard Ludo rules
- Realistic Ludo board layout
- Fullscreen board mode
- Normal dice and offline/manual dice mode
- Move history and match stats
- Local save with `localStorage`
- Sound hooks and lightweight performance modes
- `Performance mode 1` and `Performance mode 2`

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Zustand
- Lucide React

## Getting Started

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Production build

```bash
npm run build
```

## How to Play

- Roll a `6` to bring a pawn out of home.
- Rolling `6` gives an extra turn.
- Capturing an opponent sends that pawn back home.
- Safe cells cannot be captured.
- Exact roll is required to finish.
- First player to finish all 4 pawns wins.

## Match Options

### Auto move
Automatically moves a pawn when only one legal move exists.

### Performance mode
- `Off`: full visuals
- `Performance mode 1`: lighter UI and reduced effects
- `Performance mode 2`: ultra-light flat UI for weaker devices

### Move hints
Shows movable pawns more clearly.

### Turn timer
- Off
- 15 seconds
- 30 seconds

### Sounds
Enables dice, move, capture, and win sounds.

### Offline dice
Lets you enter the real dice number manually.

## Fullscreen Behavior

- Desktop: fullscreen board with floating dice
- Mobile: icon-only fullscreen controls
- `Performance mode 2`: fixed lightweight fullscreen dice dock

## Project Structure

```text
src/
  components/
  constants/
  hooks/
  store/
  types/
  utils/
```

## Deployment

This is a frontend-only Vite app and works well on Vercel.

Recommended Vercel settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

## Notes

- Saved matches are stored in the browser.
- No backend is required.
- The project is designed for future expansion such as AI or online multiplayer.
