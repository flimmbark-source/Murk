/**
 * CLI renderer - displays game state in terminal
 */

import type { GameState, Piece, LaneIndex } from "../types/core.js";
import { getPiece } from "../models/board.js";

/**
 * Render the complete game state
 */
export function renderGameState(state: GameState): string {
  const lines: string[] = [];

  lines.push("=".repeat(60));
  lines.push(`Turn ${state.turn} - ${state.currentSide.toUpperCase()} - Phase: ${state.phase.toUpperCase()}`);
  lines.push("=".repeat(60));
  lines.push("");

  // Ritual track
  lines.push(renderRitualTrack(state));
  lines.push("");

  // Mana
  lines.push(renderMana(state));
  lines.push("");

  // Board
  lines.push(renderBoard(state));
  lines.push("");

  // Lane orders
  lines.push(renderLaneOrders(state));
  lines.push("");

  // Hand (player only)
  if (state.currentSide === "player") {
    lines.push(renderHand(state));
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Render ritual track
 */
function renderRitualTrack(state: GameState): string {
  const playerRitual = state.player.ritual;
  const cpuRitual = state.cpu.ritual;

  return [
    "RITUAL TRACK:",
    `  Player: ${"█".repeat(playerRitual)}${"░".repeat(10 - playerRitual)} [${playerRitual}/10]`,
    `  CPU:    ${"█".repeat(cpuRitual)}${"░".repeat(10 - cpuRitual)} [${cpuRitual}/10]`,
  ].join("\n");
}

/**
 * Render mana
 */
function renderMana(state: GameState): string {
  const player = state.currentSide === "player" ? state.player : state.cpu;
  return `MANA: ${player.mana}/${player.maxMana}`;
}

/**
 * Render board (3 lanes × 5 depths)
 */
function renderBoard(state: GameState): string {
  const lines: string[] = [];

  lines.push("BOARD:");
  lines.push("      Lane 0        Lane 1        Lane 2");
  lines.push("   ┌──────────┬──────────┬──────────┐");

  // Render depths from 5 (CPU edge) to 1 (player edge)
  for (let depth = 5; depth >= 1; depth--) {
    const cells: string[] = [];

    for (let lane = 0; lane < 3; lane++) {
      const piece = getPiece(state.board, {
        lane: lane as LaneIndex,
        depth: depth as any,
      });

      const cell = piece ? renderPiece(piece) : "          ";
      cells.push(cell);
    }

    const depthLabel = depth === 5 ? "[CPU]" : depth === 1 ? "[PLR]" : `  ${depth}  `;
    lines.push(`${depthLabel}│${cells.join("│")}│`);

    if (depth > 1) {
      lines.push("   ├──────────┼──────────┼──────────┤");
    }
  }

  lines.push("   └──────────┴──────────┴──────────┘");

  return lines.join("\n");
}

/**
 * Render a single piece
 */
function renderPiece(piece: Piece): string {
  const symbol = piece.side === "player" ? "P" : "C";
  const typeChar = piece.type === "unit" ? "U" : "A";
  const stats = `${piece.attack}/${piece.health}`;

  // Format: "P-U 3/4" (max 10 chars)
  return `${symbol}-${typeChar} ${stats.padStart(4)}`;
}

/**
 * Render lane orders
 */
function renderLaneOrders(state: GameState): string {
  const orders = state.lanes
    .map((lane, i) => `Lane ${i}: ${lane.order.toUpperCase()}`)
    .join(" | ");

  return `LANE ORDERS: ${orders}`;
}

/**
 * Render player hand
 */
function renderHand(state: GameState): string {
  const lines: string[] = [];
  lines.push("HAND:");

  if (state.player.hand.length === 0) {
    lines.push("  (empty)");
  } else {
    state.player.hand.forEach((card, index) => {
      const typeLabel = card.type === "unit" ? "UNIT" : "ATTK";
      lines.push(
        `  [${index}] ${card.name.padEnd(20)} (${card.manaCost}) ${typeLabel} ${card.attack}/${card.health}`
      );
    });
  }

  return lines.join("\n");
}

/**
 * Render events log
 */
export function renderEvents(events: any[]): string {
  if (events.length === 0) {
    return "";
  }

  const lines: string[] = ["EVENTS:"];
  events.forEach((event) => {
    lines.push(`  • ${event.message}`);
  });

  return lines.join("\n");
}
