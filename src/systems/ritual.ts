/**
 * Ritual system - pressure/win condition tracking
 */

import type { GameState, PlayerState, Side } from "../types/core.js";
import { getPiecesOnOpponentSide } from "../models/board.js";

const BREAKTHROUGH_RITUAL = 2;

/**
 * Execute ritual phase - award ritual for units on opponent side
 */
export function executeRitualPhase(state: GameState): void {
  const currentPlayer = state.currentSide === "player" ? state.player : state.cpu;

  // Count units on opponent side
  const unitsOnOpponentSide = getPiecesOnOpponentSide(
    state.board,
    state.currentSide
  );

  if (unitsOnOpponentSide.length > 0) {
    addRitual(currentPlayer, unitsOnOpponentSide.length);
  }
}

/**
 * Add ritual points
 */
export function addRitual(player: PlayerState, amount: number): void {
  player.ritual += amount;
}

/**
 * Award ritual for breakthrough
 */
export function awardBreakthrough(player: PlayerState): void {
  addRitual(player, BREAKTHROUGH_RITUAL);
}

/**
 * Get ritual for a side
 */
export function getRitual(state: GameState, side: Side): number {
  return side === "player" ? state.player.ritual : state.cpu.ritual;
}
