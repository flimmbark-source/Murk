/**
 * Piece creation and management
 */

import type { Piece, CardDefinition, Position, Side } from "../types/core.js";

let pieceIdCounter = 0;

/**
 * Create a piece instance from a card definition
 */
export function createPiece(
  card: CardDefinition,
  side: Side,
  position: Position
): Piece {
  return {
    id: `piece_${++pieceIdCounter}`,
    cardId: card.id,
    side,
    type: card.type,
    attack: card.attack,
    health: card.health,
    maxHealth: card.health,
    position,
  };
}

/**
 * Deal damage to a piece
 */
export function damagePiece(piece: Piece, damage: number): void {
  piece.health = Math.max(0, piece.health - damage);
}

/**
 * Check if piece is dead
 */
export function isDead(piece: Piece): boolean {
  return piece.health <= 0;
}

/**
 * Heal a piece
 */
export function healPiece(piece: Piece, amount: number): void {
  piece.health = Math.min(piece.maxHealth, piece.health + amount);
}

/**
 * Reset piece ID counter (useful for testing)
 */
export function resetPieceIdCounter(): void {
  pieceIdCounter = 0;
}
