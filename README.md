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

```bash
npm install
npm run dev
```

## Development

```bash
npm run build      # Compile TypeScript
npm run type-check # Type checking without compilation
npm test           # Run tests
```

## Architecture

- `src/types/` - Core type definitions
- `src/models/` - Game entities and data structures
- `src/systems/` - Game systems (Mana, Ritual, March, Combat)
- `src/engine/` - Turn controller and game engine
- `src/cards/` - Card definitions
- `src/ai/` - CPU behavior
- `src/ui/` - Interface (CLI for prototype)
