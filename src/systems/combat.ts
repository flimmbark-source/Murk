/**
 * Combat system - frontline engagement
 */

import type {
  GameState,
  Piece,
  LaneIndex,
  CombatResult,
  GameEvent,
} from "../types/core.js";
import { getPiece, removePiece, DEPTHS } from "../models/board.js";
import { damagePiece, isDead } from "../models/piece.js";

/**
 * Execute combat phase
 */
export function executeCombatPhase(state: GameState): GameEvent[] {
  const events: GameEvent[] = [];

  // Process each lane left to right
  for (let lane = 0; lane < 3; lane++) {
    const laneIndex = lane as LaneIndex;
    const combatPair = findForemostEngagement(state, laneIndex);

    if (combatPair) {
      const result = resolveCombat(state, combatPair.player, combatPair.cpu);
      events.push({
        type: "combat",
        message: `Combat in lane ${lane}: ${combatPair.player.cardId} vs ${combatPair.cpu.cardId}`,
        data: result,
      });

      // Remove Attacks after combat (they expire after dealing damage)
      if (combatPair.player.type === "attack" && !isDead(combatPair.player)) {
        removePiece(state.board, combatPair.player.position);
        events.push({
          type: "attack_expire",
          message: `${combatPair.player.cardId} expires after attacking`,
          data: { piece: combatPair.player },
        });
      }

      if (combatPair.cpu.type === "attack" && !isDead(combatPair.cpu)) {
        removePiece(state.board, combatPair.cpu.position);
        events.push({
          type: "attack_expire",
          message: `${combatPair.cpu.cardId} expires after attacking`,
          data: { piece: combatPair.cpu },
        });
      }
    }
  }

  return events;
}

/**
 * Find the foremost adjacent opposing pair in a lane
 */
function findForemostEngagement(
  state: GameState,
  lane: LaneIndex
): { player: Piece; cpu: Piece } | null {
  // Scan from middle outward to find closest opposing pieces
  for (let depth = 1; depth <= DEPTHS; depth++) {
    const piece = getPiece(state.board, { lane, depth: depth as any });

    if (piece && piece.side === "player") {
      // Found player piece, check if CPU piece is adjacent
      const nextDepth = depth + 1;
      if (nextDepth <= DEPTHS) {
        const adjacent = getPiece(state.board, {
          lane,
          depth: nextDepth as any,
        });
        if (adjacent && adjacent.side === "cpu") {
          return { player: piece, cpu: adjacent };
        }
      }
    } else if (piece && piece.side === "cpu") {
      // Found CPU piece, check if player piece is adjacent
      const prevDepth = depth - 1;
      if (prevDepth >= 1) {
        const adjacent = getPiece(state.board, {
          lane,
          depth: prevDepth as any,
        });
        if (adjacent && adjacent.side === "player") {
          return { player: adjacent, cpu: piece };
        }
      }
    }
  }

  return null;
}

/**
 * Resolve combat between two pieces
 */
function resolveCombat(
  state: GameState,
  player: Piece,
  cpu: Piece
): CombatResult {
  // Simultaneous damage
  damagePiece(player, cpu.attack);
  damagePiece(cpu, player.attack);

  const playerDied = isDead(player);
  const cpuDied = isDead(cpu);

  // Remove dead pieces
  if (playerDied) {
    removePiece(state.board, player.position);
  }

  if (cpuDied) {
    removePiece(state.board, cpu.position);
  }

  return {
    lane: player.position.lane,
    attacker: player,
    defender: cpu,
    attackerDied: playerDied,
    defenderDied: cpuDied,
  };
}
