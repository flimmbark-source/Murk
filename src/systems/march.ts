/**
 * March system - piece movement
 */

import type { GameState, Piece, LaneIndex, GameEvent } from "../types/core.js";
import {
  getPiece,
  getNextPosition,
  isEmpty,
  movePiece,
  removePiece,
  DEPTHS,
} from "../models/board.js";
import { awardBreakthrough } from "./ritual.js";

/**
 * Execute march phase
 */
export function executeMarchPhase(state: GameState): GameEvent[] {
  const events: GameEvent[] = [];
  const currentPlayer = state.currentSide === "player" ? state.player : state.cpu;

  // Process each lane
  for (let lane = 0; lane < 3; lane++) {
    const laneIndex = lane as LaneIndex;
    const laneState = state.lanes[laneIndex];

    // Get pieces in this lane that belong to current side
    const piecesInLane: Piece[] = [];
    for (let depth = 1; depth <= DEPTHS; depth++) {
      const piece = getPiece(state.board, {
        lane: laneIndex,
        depth: depth as any,
      });
      if (piece && piece.side === state.currentSide) {
        piecesInLane.push(piece);
      }
    }

    // Sort pieces by depth (furthest from destination first to avoid collisions)
    // Player marches 1->5, so sort descending
    // CPU marches 5->1, so sort ascending
    piecesInLane.sort((a, b) => {
      if (state.currentSide === "player") {
        return b.position.depth - a.position.depth;
      } else {
        return a.position.depth - b.position.depth;
      }
    });

    // March each piece
    for (const piece of piecesInLane) {
      // Check if this piece can march based on lane order
      const canMarch = shouldPieceMarch(piece, laneState.order);

      if (!canMarch) {
        events.push({
          type: "march_hold",
          message: `${piece.cardId} holds in lane ${lane}`,
          data: { piece, lane },
        });
        continue;
      }

      // Calculate steps (1 normal, +1 if Advance)
      const steps = laneState.order === "advance" ? 2 : 1;

      for (let step = 0; step < steps; step++) {
        const nextPos = getNextPosition(piece.position, state.currentSide);

        if (!nextPos) {
          // Breakthrough!
          events.push({
            type: "breakthrough",
            message: `${piece.cardId} breaks through!`,
            data: { piece, lane },
          });
          removePiece(state.board, piece.position);
          awardBreakthrough(currentPlayer);
          break;
        }

        if (isEmpty(state.board, nextPos)) {
          // Move
          movePiece(state.board, piece.position, nextPos);
          events.push({
            type: "march",
            message: `${piece.cardId} marches to depth ${nextPos.depth}`,
            data: { piece, from: piece.position, to: nextPos },
          });
        } else {
          // Collision - stop
          events.push({
            type: "march_blocked",
            message: `${piece.cardId} blocked at depth ${piece.position.depth}`,
            data: { piece, blocker: getPiece(state.board, nextPos) },
          });
          break;
        }
      }
    }
  }

  return events;
}

/**
 * Determine if a piece should march based on lane order
 */
function shouldPieceMarch(
  piece: Piece,
  laneOrder: "none" | "advance" | "hold"
): boolean {
  // Attacks cannot hold
  if (piece.type === "attack") {
    return true;
  }

  // Units respect Hold order
  if (laneOrder === "hold") {
    return false;
  }

  return true;
}
