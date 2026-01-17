# Murk

A lane-based board game prototype set in a Victorian orphanage where orphans defend against otherworldly intrusions.

## Game Overview

- **Board**: 3 lanes × 6 depth spaces
- **Players**: Player vs CPU
- **Win Condition**: First to reach 10 Ritual wins
- **Theme**: Victorian orphanage with mundane objects, pets, and weird fish-monster enemies

## Core Mechanics

1. **Mana System**: Resource that refills each turn, increases max by +1 per turn
2. **Ritual Track**: Pressure system - gain ritual by pushing units deep into enemy territory
3. **March Phase**: All pieces advance toward opponent
4. **Lane Orders**: Choose Advance or Hold for one lane per turn
5. **Combat**: Frontline engagement between adjacent opposing pieces

## Quick Start

### Play the Web Version (Recommended)

**For Development (with auto-reload):**
```bash
npm install
npm run dev
```

**For Production:**
```bash
npm install
npm run dev:web
```

Then open your browser to `http://localhost:3000`

**Features:**
- Visual card-based graphics with Inscryption-inspired aesthetics
- 3D perspective board view with depth-based scaling
- Interactive card placement with visual highlights
- Auto-advancing phases (stops at main phase for player input)
- Current phase displayed at top of board
- Real-time ritual tracking and mana display
- Atmospheric Victorian dark theme
- Event log showing game actions
- **Dev mode**: Auto-reload on file changes (use `npm run dev`)

### Play the CLI Version

```bash
npm install
npm run dev:cli
```

## Development

```bash
npm run dev           # Development mode with auto-reload (recommended)
npm run build         # Compile TypeScript
npm run build:watch   # Watch mode for TypeScript compilation
npm run type-check    # Type checking without compilation
npm test              # Run tests
npm run dev:web       # Run web version (no auto-reload)
npm run dev:cli       # Run CLI version
```

### Development Mode

Run `npm run dev` for the best development experience:
- TypeScript compiler watches for file changes and rebuilds automatically
- Server automatically restarts when files change
- Browser automatically reloads when server restarts
- No need to manually refresh after making code changes

After running `npm run dev`, just open http://localhost:3000 and start coding. When you save changes, the browser will auto-reload within a few seconds.

## Architecture

- `src/types/` - Core type definitions
- `src/models/` - Game entities and data structures
- `src/systems/` - Game systems (Mana, Ritual, March, Combat)
- `src/engine/` - Turn controller and game engine
- `src/cards/` - Card definitions
- `src/ai/` - CPU behavior
- `src/ui/` - CLI interface
- `src/client/` - Web graphics renderer and UI
- `src/server/` - Web server
- `public/` - HTML, CSS, and static assets
