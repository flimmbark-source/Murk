/**
 * Board manipulation and query utilities
 */

import type {
  Board,
  Piece,
  Position,
  LaneIndex,
  Depth,
  Side,
} from "../types/core.js";

export const LANES = 3;
export const DEPTHS = 5;

/**
 * Create an empty board
 */
export function createBoard(): Board {
  return Array.from({ length: LANES }, () =>
    Array.from({ length: DEPTHS }, () => null)
  );
}

/**
 * Get piece at position
 */
export function getPiece(board: Board, pos: Position): Piece | null {
  return board[pos.lane][pos.depth - 1] ?? null;
}

/**
 * Set piece at position
 */
export function setPiece(
  board: Board,
  pos: Position,
  piece: Piece | null
): void {
  board[pos.lane][pos.depth - 1] = piece;
}

/**
 * Check if position is valid
 */
export function isValidPosition(pos: Position): boolean {
  return pos.lane >= 0 && pos.lane < LANES && pos.depth >= 1 && pos.depth <= 5;
}

/**
 * Check if position is empty
 */
export function isEmpty(board: Board, pos: Position): boolean {
  return getPiece(board, pos) === null;
}

/**
 * Get all pieces for a side
 */
export function getPiecesForSide(board: Board, side: Side): Piece[] {
  const pieces: Piece[] = [];
  for (let lane = 0; lane < LANES; lane++) {
    for (let depth = 1; depth <= DEPTHS; depth++) {
      const piece = getPiece(board, { lane: lane as LaneIndex, depth: depth as Depth });
      if (piece && piece.side === side) {
        pieces.push(piece);
      }
    }
  }
  return pieces;
}

/**
 * Get all pieces in a lane
 */
export function getPiecesInLane(board: Board, lane: LaneIndex): Piece[] {
  const pieces: Piece[] = [];
  for (let depth = 1; depth <= DEPTHS; depth++) {
    const piece = getPiece(board, { lane, depth: depth as Depth });
    if (piece) {
      pieces.push(piece);
    }
  }
  return pieces;
}

/**
 * Check if position is on the player side (depths 1-2)
 */
export function isPlayerSide(depth: Depth): boolean {
  return depth <= 2;
}

/**
 * Check if position is on the CPU side (depths 4-5)
 */
export function isCpuSide(depth: Depth): boolean {
  return depth >= 4;
}

/**
 * Get next position in march direction for a side
 */
export function getNextPosition(pos: Position, side: Side): Position | null {
  const nextDepth = side === "player" ? pos.depth + 1 : pos.depth - 1;

  if (nextDepth < 1 || nextDepth > 5) {
    return null; // Would go off board (breakthrough)
  }

  return {
    lane: pos.lane,
    depth: nextDepth as Depth,
  };
}

/**
 * Move piece from one position to another
 */
export function movePiece(
  board: Board,
  from: Position,
  to: Position
): boolean {
  const piece = getPiece(board, from);
  if (!piece || !isEmpty(board, to)) {
    return false;
  }

  setPiece(board, from, null);
  piece.position = to;
  setPiece(board, to, piece);
  return true;
}

/**
 * Remove piece from board
 */
export function removePiece(board: Board, pos: Position): void {
  setPiece(board, pos, null);
}

/**
 * Get deployment depth for a side
 */
export function getDeployDepth(side: Side): Depth {
  return side === "player" ? 1 : 5;
}

/**
 * Find all pieces on opponent's side (for ritual scoring)
 * Player side = depths 1-2, CPU side = depths 4-5
 */
export function getPiecesOnOpponentSide(
  board: Board,
  side: Side
): Piece[] {
  const pieces: Piece[] = [];
  const targetSide = side === "player" ? "cpu" : "player";

  for (let lane = 0; lane < LANES; lane++) {
    for (let depth = 1; depth <= DEPTHS; depth++) {
      const piece = getPiece(board, { lane: lane as LaneIndex, depth: depth as Depth });

      if (!piece || piece.side !== side || piece.type !== "unit") {
        continue;
      }

      // Player scores for being on CPU side (depths 4-5)
      // CPU scores for being on player side (depths 1-2)
      const isOnOpponentSide = targetSide === "cpu" ? isCpuSide(depth as Depth) : isPlayerSide(depth as Depth);

      if (isOnOpponentSide) {
        pieces.push(piece);
      }
    }
  }

  return pieces;
}

/**
 * Clone board (deep copy)
 */
export function cloneBoard(board: Board): Board {
  return board.map(lane =>
    lane.map(piece => (piece ? { ...piece, position: { ...piece.position } } : null))
  );
}
