/**
 * Mana system - resource management
 */

import type { PlayerState } from "../types/core.js";

const MAX_MANA_CAP = 8;

/**
 * Refill mana to max at start of main phase
 */
export function refillMana(player: PlayerState): void {
  player.mana = player.maxMana;
}

/**
 * Increase max mana (happens each turn)
 */
export function increaseMaxMana(player: PlayerState): void {
  if (player.maxMana < MAX_MANA_CAP) {
    player.maxMana++;
  }
}

/**
 * Spend mana
 */
export function spendMana(player: PlayerState, cost: number): boolean {
  if (player.mana >= cost) {
    player.mana -= cost;
    return true;
  }
  return false;
}

/**
 * Check if player can afford a cost
 */
export function canAfford(player: PlayerState, cost: number): boolean {
  return player.mana >= cost;
}

/**
 * Add mana (for special effects)
 */
export function addMana(player: PlayerState, amount: number): void {
  player.mana = Math.min(player.maxMana, player.mana + amount);
}
