/**
 * Game state initialization and management
 */

import type {
  GameState,
  PlayerState,
  Side,
  CardDefinition,
  LaneState,
} from "../types/core.js";
import { createBoard } from "./board.js";

/**
 * Create initial player state
 */
export function createPlayerState(
  side: Side,
  deck: CardDefinition[]
): PlayerState {
  const shuffledDeck = shuffleDeck([...deck]);
  const hand: CardDefinition[] = [];

  // Draw initial hand (5 cards)
  for (let i = 0; i < 5 && shuffledDeck.length > 0; i++) {
    hand.push(shuffledDeck.pop()!);
  }

  return {
    side,
    mana: 1,
    maxMana: 1,
    ritual: 0,
    hand,
    deck: shuffledDeck,
    discard: [],
  };
}

/**
 * Shuffle deck
 */
export function shuffleDeck(deck: CardDefinition[]): CardDefinition[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Draw cards from deck
 */
export function drawCards(player: PlayerState, count: number): void {
  for (let i = 0; i < count; i++) {
    if (player.deck.length === 0) {
      // Reshuffle discard into deck
      if (player.discard.length > 0) {
        player.deck = shuffleDeck([...player.discard]);
        player.discard = [];
      } else {
        break; // No more cards
      }
    }

    if (player.deck.length > 0) {
      player.hand.push(player.deck.pop()!);
    }
  }
}

/**
 * Create initial lane states
 */
export function createLaneStates(): [LaneState, LaneState, LaneState] {
  return [
    { index: 0, order: "none" },
    { index: 1, order: "none" },
    { index: 2, order: "none" },
  ];
}

/**
 * Create initial game state
 */
export function createGameState(
  playerDeck: CardDefinition[],
  cpuDeck: CardDefinition[]
): GameState {
  return {
    board: createBoard(),
    player: createPlayerState("player", playerDeck),
    cpu: createPlayerState("cpu", cpuDeck),
    lanes: createLaneStates(),
    turn: 1,
    currentSide: "player",
    phase: "ritual",
    winner: null,
  };
}

/**
 * Get current active player
 */
export function getCurrentPlayer(state: GameState): PlayerState {
  return state.currentSide === "player" ? state.player : state.cpu;
}

/**
 * Get opponent player
 */
export function getOpponent(state: GameState): PlayerState {
  return state.currentSide === "player" ? state.cpu : state.player;
}

/**
 * Switch to next side
 */
export function switchSide(state: GameState): void {
  state.currentSide = state.currentSide === "player" ? "cpu" : "player";
}

/**
 * Advance to next phase
 */
export function advancePhase(state: GameState): void {
  const phases: GameState["phase"][] = ["ritual", "main", "march", "combat", "end"];
  const currentIndex = phases.indexOf(state.phase);
  const nextIndex = (currentIndex + 1) % phases.length;

  state.phase = phases[nextIndex];

  // If we cycle back to ritual, switch sides
  if (state.phase === "ritual" && currentIndex === phases.length - 1) {
    switchSide(state);
    if (state.currentSide === "player") {
      state.turn++;
    }
  }
}

/**
 * Reset lane orders at end of turn
 */
export function resetLaneOrders(state: GameState): void {
  state.lanes.forEach(lane => {
    lane.order = "none";
  });
}

/**
 * Check win condition
 */
export function checkWinCondition(state: GameState): Side | null {
  const RITUAL_WIN_THRESHOLD = 10;

  if (state.player.ritual >= RITUAL_WIN_THRESHOLD) {
    return "player";
  }

  if (state.cpu.ritual >= RITUAL_WIN_THRESHOLD) {
    return "cpu";
  }

  return null;
}
