/**
 * Card definitions - the complete card library
 */

import type { CardDefinition } from "../types/core.js";

/**
 * Player Units - persistent pieces
 */
export const PLAYER_UNITS: CardDefinition[] = [
  {
    id: "scrapper_kid",
    name: "Scrapper Kid",
    manaCost: 1,
    type: "unit",
    attack: 1,
    health: 3,
    description: "Resilient orphan, solid defender",
  },
  {
    id: "nimble_runner",
    name: "Nimble Runner",
    manaCost: 1,
    type: "unit",
    attack: 2,
    health: 2,
    description: "Fast and eager to advance",
  },
  {
    id: "big_sister",
    name: "Big Sister",
    manaCost: 2,
    type: "unit",
    attack: 2,
    health: 4,
    description: "Strong protector, excellent at holding",
  },
  {
    id: "sleepwalker_bruiser",
    name: "Sleepwalker Bruiser",
    manaCost: 2,
    type: "unit",
    attack: 3,
    health: 3,
    description: "Heavy hitter in a daze",
  },
  {
    id: "dog",
    name: "Dog",
    manaCost: 2,
    type: "unit",
    attack: 3,
    health: 2,
    description: "Loyal companion, fierce bite",
  },
  {
    id: "cat",
    name: "Cat",
    manaCost: 1,
    type: "unit",
    attack: 1,
    health: 2,
    description: "Nimble and evasive",
  },
  {
    id: "rat",
    name: "Rat",
    manaCost: 1,
    type: "unit",
    attack: 1,
    health: 1,
    description: "Swarms with other rats",
  },
];

/**
 * Player Attacks - temporary offensive pieces
 */
export const PLAYER_ATTACKS: CardDefinition[] = [
  {
    id: "chair_smash",
    name: "Chair Smash",
    manaCost: 2,
    type: "attack",
    attack: 4,
    health: 1,
    description: "Heavy swing with furniture",
  },
  {
    id: "broom_jab",
    name: "Broom Jab",
    manaCost: 1,
    type: "attack",
    attack: 2,
    health: 1,
    description: "Quick poke with a cleaning tool",
  },
  {
    id: "pocket_sand",
    name: "Pocket Sand",
    manaCost: 1,
    type: "attack",
    attack: 1,
    health: 1,
    description: "Irritating distraction",
  },
  {
    id: "lantern_swing",
    name: "Lantern Swing",
    manaCost: 2,
    type: "attack",
    attack: 3,
    health: 1,
    description: "Burning arc of light",
  },
  {
    id: "scalding_tea",
    name: "Scalding Tea",
    manaCost: 1,
    type: "attack",
    attack: 2,
    health: 1,
    description: "Hot liquid assault",
  },
];

/**
 * CPU Units - enemy creatures
 */
export const CPU_UNITS: CardDefinition[] = [
  {
    id: "slick_finling",
    name: "Slick Finling",
    manaCost: 1,
    type: "unit",
    attack: 2,
    health: 2,
    description: "Basic fish-creature invader",
  },
  {
    id: "drowned_leech",
    name: "Drowned Leech",
    manaCost: 2,
    type: "unit",
    attack: 1,
    health: 4,
    description: "Bloated parasite, hard to kill",
  },
  {
    id: "gasping_choirboy",
    name: "Gasping Choirboy",
    manaCost: 2,
    type: "unit",
    attack: 2,
    health: 3,
    description: "Corrupted innocent",
  },
  {
    id: "kelp_crawler",
    name: "Kelp Crawler",
    manaCost: 1,
    type: "unit",
    attack: 1,
    health: 3,
    description: "Tangled aquatic horror",
  },
  {
    id: "tide_caller",
    name: "Tide Caller",
    manaCost: 3,
    type: "unit",
    attack: 3,
    health: 3,
    description: "Empowered servant of the deep",
  },
];

/**
 * CPU Attacks - enemy offensive actions
 */
export const CPU_ATTACKS: CardDefinition[] = [
  {
    id: "tentacle_lash",
    name: "Tentacle Lash",
    manaCost: 1,
    type: "attack",
    attack: 2,
    health: 1,
    description: "Whipping appendage",
  },
  {
    id: "water_burst",
    name: "Water Burst",
    manaCost: 2,
    type: "attack",
    attack: 3,
    health: 1,
    description: "Pressurized aquatic blast",
  },
  {
    id: "drowning_grasp",
    name: "Drowning Grasp",
    manaCost: 2,
    type: "attack",
    attack: 4,
    health: 1,
    description: "Suffocating hold",
  },
];

/**
 * Get all player cards
 */
export function getPlayerCards(): CardDefinition[] {
  return [...PLAYER_UNITS, ...PLAYER_ATTACKS];
}

/**
 * Get all CPU cards
 */
export function getCpuCards(): CardDefinition[] {
  return [...CPU_UNITS, ...CPU_ATTACKS];
}

/**
 * Find card by ID
 */
export function getCardById(id: string): CardDefinition | undefined {
  return [...getPlayerCards(), ...getCpuCards()].find((card) => card.id === id);
}

/**
 * Build a starter player deck
 */
export function buildPlayerDeck(): CardDefinition[] {
  return [
    ...Array(2).fill(PLAYER_UNITS[0]), // 2x Scrapper Kid
    ...Array(2).fill(PLAYER_UNITS[1]), // 2x Nimble Runner
    ...Array(1).fill(PLAYER_UNITS[2]), // 1x Big Sister
    ...Array(1).fill(PLAYER_UNITS[3]), // 1x Sleepwalker Bruiser
    ...Array(1).fill(PLAYER_UNITS[4]), // 1x Dog
    ...Array(2).fill(PLAYER_UNITS[5]), // 2x Cat
    ...Array(2).fill(PLAYER_UNITS[6]), // 2x Rat
    ...Array(2).fill(PLAYER_ATTACKS[0]), // 2x Chair Smash
    ...Array(2).fill(PLAYER_ATTACKS[1]), // 2x Broom Jab
    ...Array(1).fill(PLAYER_ATTACKS[2]), // 1x Pocket Sand
    ...Array(1).fill(PLAYER_ATTACKS[3]), // 1x Lantern Swing
    ...Array(1).fill(PLAYER_ATTACKS[4]), // 1x Scalding Tea
  ];
}

/**
 * Build a basic CPU deck (Finlings archetype)
 */
export function buildCpuDeck(): CardDefinition[] {
  return [
    ...Array(4).fill(CPU_UNITS[0]), // 4x Slick Finling
    ...Array(2).fill(CPU_UNITS[1]), // 2x Drowned Leech
    ...Array(2).fill(CPU_UNITS[2]), // 2x Gasping Choirboy
    ...Array(2).fill(CPU_UNITS[3]), // 2x Kelp Crawler
    ...Array(1).fill(CPU_UNITS[4]), // 1x Tide Caller
    ...Array(3).fill(CPU_ATTACKS[0]), // 3x Tentacle Lash
    ...Array(2).fill(CPU_ATTACKS[1]), // 2x Water Burst
    ...Array(1).fill(CPU_ATTACKS[2]), // 1x Drowning Grasp
  ];
}

/**
 * Get card definition by ID
 */
export function getCardById(cardId: string): CardDefinition | null {
  const allCards = [
    ...PLAYER_UNITS,
    ...PLAYER_ATTACKS,
    ...CPU_UNITS,
    ...CPU_ATTACKS,
  ];
  return allCards.find((card) => card.id === cardId) || null;
}
