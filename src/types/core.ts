/**
 * Core type definitions for the Murk board game
 */

export type Side = "player" | "cpu";

export type PieceType = "unit" | "attack";

export type LaneOrder = "none" | "advance" | "hold";

/**
 * Depth ranges from 1 (player edge) to 5 (CPU edge)
 */
export type Depth = 1 | 2 | 3 | 4 | 5;

/**
 * Lane index: 0, 1, or 2 (left, middle, right)
 */
export type LaneIndex = 0 | 1 | 2;

/**
 * Position on the board
 */
export interface Position {
  lane: LaneIndex;
  depth: Depth;
}

/**
 * Card definition - the blueprint for creating pieces
 */
export interface CardDefinition {
  id: string;
  name: string;
  manaCost: number;
  type: PieceType;
  attack: number;
  health: number;
  description?: string;
  keywords?: string[];
}

/**
 * Piece on the board - an instance of a card
 */
export interface Piece {
  id: string; // Unique instance ID
  cardId: string; // Reference to CardDefinition
  side: Side;
  type: PieceType;
  attack: number;
  health: number;
  maxHealth: number;
  position: Position;
}

/**
 * Board state - 3 lanes × 5 depths
 * Cell can be null (empty) or contain a Piece
 */
export type Board = (Piece | null)[][];

/**
 * Player state
 */
export interface PlayerState {
  side: Side;
  mana: number;
  maxMana: number;
  ritual: number;
  hand: CardDefinition[];
  deck: CardDefinition[];
  discard: CardDefinition[];
}

/**
 * Lane state with its current order
 */
export interface LaneState {
  index: LaneIndex;
  order: LaneOrder;
}

/**
 * Complete game state
 */
export interface GameState {
  board: Board;
  player: PlayerState;
  cpu: PlayerState;
  lanes: [LaneState, LaneState, LaneState];
  turn: number;
  currentSide: Side;
  phase: GamePhase;
  winner: Side | null;
}

/**
 * Game phases in order
 */
export type GamePhase =
  | "ritual"
  | "main"
  | "march"
  | "combat"
  | "end";

/**
 * Action types that can be performed
 */
export type GameAction =
  | { type: "play_card"; cardIndex: number; lane: LaneIndex }
  | { type: "set_lane_order"; lane: LaneIndex; order: LaneOrder }
  | { type: "advance_phase" }
  | { type: "end_turn" };

/**
 * Combat result for logging/animation
 */
export interface CombatResult {
  lane: LaneIndex;
  attacker: Piece;
  defender: Piece;
  attackerDied: boolean;
  defenderDied: boolean;
}

/**
 * Event log entry
 */
export interface GameEvent {
  type: string;
  message: string;
  data?: unknown;
}
