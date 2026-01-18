/**
 * CPU AI behavior
 */

import type {
  GameState,
  CardDefinition,
  LaneIndex,
  LaneOrder,
} from "../types/core.js";
import { getPiecesInLane, isEmpty, getDeployDepth } from "../models/board.js";
import { canAfford } from "../systems/mana.js";

/**
 * CPU decision for main phase
 */
export interface CpuDecision {
  cardsToPlay: Array<{ cardIndex: number; lane: LaneIndex }>;
  laneOrder: { lane: LaneIndex; order: LaneOrder } | null;
}

/**
 * Execute CPU main phase
 */
export function decideCpuMainPhase(state: GameState): CpuDecision {
  const cpu = state.cpu;
  const cardsToPlay: Array<{ cardIndex: number; lane: LaneIndex }> = [];

  // Evaluate each lane threat level
  const laneThreats = evaluateLaneThreats(state);

  // Sort hand by priority: Units first, then Attacks
  const sortedHand = cpu.hand
    .map((card, index) => ({ card, index }))
    .sort((a, b) => {
      if (a.card.type === "unit" && b.card.type === "attack") return -1;
      if (a.card.type === "attack" && b.card.type === "unit") return 1;
      return a.card.manaCost - b.card.manaCost; // Cheaper first
    });

  // Track available mana for planning (don't modify actual state)
  let availableMana = cpu.mana;

  // Play cards while we have mana
  for (const { card, index } of sortedHand) {
    if (card.manaCost > availableMana) {
      continue;
    }

    // Choose lane based on priority
    const lane = chooseLaneForCard(state, card, laneThreats);

    if (lane !== null) {
      cardsToPlay.push({ cardIndex: index, lane });
      availableMana -= card.manaCost; // Track spending for planning only
    }
  }

  // Choose lane order
  const laneOrder = chooseLaneOrder(state, laneThreats);

  return { cardsToPlay, laneOrder };
}

/**
 * Evaluate threat level for each lane (0 = safe, higher = more threatened)
 */
function evaluateLaneThreats(state: GameState): [number, number, number] {
  const threats: [number, number, number] = [0, 0, 0];

  for (let lane = 0; lane < 3; lane++) {
    const laneIndex = lane as LaneIndex;
    const pieces = getPiecesInLane(state.board, laneIndex);

    for (const piece of pieces) {
      if (piece.side === "player") {
        // Player pieces near CPU edge are threatening
        const threatLevel = piece.position.depth; // Closer to 5 = more threatening
        threats[lane] += threatLevel;
      } else {
        // CPU pieces reduce threat
        threats[lane] -= 1;
      }
    }
  }

  return threats;
}

/**
 * Choose best lane to play a card in
 */
function chooseLaneForCard(
  state: GameState,
  card: CardDefinition,
  threats: [number, number, number]
): LaneIndex | null {
  const cpuDeployDepth = getDeployDepth("cpu");

  // Check which lanes have space
  const availableLanes: LaneIndex[] = [];
  for (let lane = 0; lane < 3; lane++) {
    const laneIndex = lane as LaneIndex;
    if (
      isEmpty(state.board, { lane: laneIndex, depth: cpuDeployDepth })
    ) {
      availableLanes.push(laneIndex);
    }
  }

  if (availableLanes.length === 0) {
    return null; // No space
  }

  if (card.type === "unit") {
    // Place units in most threatened lanes
    availableLanes.sort((a, b) => threats[b] - threats[a]);
  } else {
    // Place attacks in threatened lanes with existing pieces
    availableLanes.sort((a, b) => {
      const cpuPiecesA = getPiecesInLane(state.board, a).filter(
        (p) => p.side === "cpu"
      ).length;
      const cpuPiecesB = getPiecesInLane(state.board, b).filter(
        (p) => p.side === "cpu"
      ).length;

      // Prefer lanes with CPU presence and high threat
      const scoreA = threats[a] + cpuPiecesA;
      const scoreB = threats[b] + cpuPiecesB;
      return scoreB - scoreA;
    });
  }

  return availableLanes[0];
}

/**
 * Choose lane order (Advance or Hold)
 */
function chooseLaneOrder(
  state: GameState,
  threats: [number, number, number]
): { lane: LaneIndex; order: LaneOrder } | null {
  // Find lane with most CPU pieces
  let maxCpuPieces = 0;
  let bestLane: LaneIndex = 0;

  for (let lane = 0; lane < 3; lane++) {
    const laneIndex = lane as LaneIndex;
    const cpuPieces = getPiecesInLane(state.board, laneIndex).filter(
      (p) => p.side === "cpu"
    );

    if (cpuPieces.length > maxCpuPieces) {
      maxCpuPieces = cpuPieces.length;
      bestLane = laneIndex;
    }
  }

  if (maxCpuPieces === 0) {
    return null; // No pieces to order
  }

  // If threat is low in that lane, Advance; if high, Hold
  const threat = threats[bestLane];
  const order: LaneOrder = threat > 3 ? "hold" : "advance";

  return { lane: bestLane, order };
}
