# Murk

A lane-based board game prototype set in a Victorian orphanage where orphans defend against otherworldly intrusions.

## Game Overview

- **Board**: 3 lanes × 5 depth spaces
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

```bash
npm install
npm run dev:web
```

Then open your browser to `http://localhost:3000`

**Features:**
- Visual card-based graphics with Inscryption-inspired aesthetics
- Interactive board with click-to-play mechanics
- Real-time ritual tracking and mana display
- Atmospheric Victorian dark theme
- Event log showing game actions

### Play the CLI Version

```bash
npm install
npm run dev:cli
```

## Development

```bash
npm run build         # Compile TypeScript
npm run build:watch   # Watch mode for development
npm run type-check    # Type checking without compilation
npm test              # Run tests
npm run dev:web       # Run web version
npm run dev:cli       # Run CLI version
```

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
