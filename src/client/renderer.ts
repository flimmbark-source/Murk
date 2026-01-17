/**
 * Canvas-based board renderer with 3D perspective
 */

import type { GameState, Piece, LaneIndex, Depth } from "../types/core.js";
import { getPiece } from "../models/board.js";

// Perspective constants
const LANE_WIDTH_BASE = 200;
const PERSPECTIVE_SCALE_MIN = 0.3; // Scale at depth 5 (CPU edge)
const PERSPECTIVE_SCALE_MAX = 1.0; // Scale at depth 1 (player edge)
const DEPTH_SPACING_BASE = 80;
const DEPTH_SPACING_MIN = 30;

export class BoardRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  /**
   * Get perspective scale for a given depth
   */
  private getDepthScale(depth: Depth): number {
    const t = (6 - depth) / 5; // 0 at depth 6, 1 at depth 1
    return PERSPECTIVE_SCALE_MIN + (PERSPECTIVE_SCALE_MAX - PERSPECTIVE_SCALE_MIN) * t;
  }

  /**
   * Get Y position for a given depth (perspective spacing)
   */
  private getDepthY(depth: Depth): number {
    const baseY = 70; // Adjusted to center board vertically
    let y = baseY;

    for (let d = 6; d >= depth; d--) {
      if (d === 6) continue;
      const scale = this.getDepthScale(d as Depth);
      const spacing = DEPTH_SPACING_MIN + (DEPTH_SPACING_BASE - DEPTH_SPACING_MIN) * scale;
      y += spacing;
    }

    return y;
  }

  /**
   * Get lane X position
   */
  private getLaneX(lane: LaneIndex, depth: Depth): number {
    const scale = this.getDepthScale(depth);
    const centerX = this.canvas.width / 2;
    const laneOffset = (lane - 1) * LANE_WIDTH_BASE * scale; // -1, 0, 1 for lanes 0, 1, 2
    return centerX + laneOffset;
  }

  /**
   * Render the complete board
   */
  render(state: GameState, selectedCard: number | null = null): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw current phase at top center
    this.drawPhaseIndicator(state.phase);

    // Draw perspective grid
    this.drawPerspectiveGrid();

    // Draw placement highlights if card is selected
    if (selectedCard !== null && state.currentSide === "player" && state.phase === "main") {
      this.drawPlacementHighlights();
    }

    // Draw pieces from back to front (depth 6 to 1)
    for (let depth = 6; depth >= 1; depth--) {
      this.drawDepthRow(state, depth as Depth);
    }
  }

  /**
   * Draw phase indicator at top center
   */
  private drawPhaseIndicator(phase: string): void {
    const ctx = this.ctx;
    ctx.font = "12px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#c96969";
    ctx.fillText(`PHASE: ${phase.toUpperCase()}`, this.canvas.width / 2, 10);
  }

  /**
   * Draw placement highlights for depth 1 when card is selected
   */
  private drawPlacementHighlights(): void {
    const ctx = this.ctx;
    const depth = 1 as Depth;
    const scale = this.getDepthScale(depth);
    const y = this.getDepthY(depth);

    // Calculate cell boundaries to match grid lines exactly
    const leftX = this.getLaneX(0, depth) - (LANE_WIDTH_BASE * scale) / 2;
    const rightX = this.getLaneX(2, depth) + (LANE_WIDTH_BASE * scale) / 2;
    const cellWidth = (rightX - leftX) / 3;
    const cardHeight = 60 * scale;

    // Draw solid yellow outline for each lane segment at depth 1
    ctx.strokeStyle = "#FFD700"; // Gold/yellow color
    ctx.lineWidth = 3;

    for (let lane = 0; lane < 3; lane++) {
      const cellX = leftX + lane * cellWidth;

      ctx.strokeRect(
        cellX,
        y - cardHeight / 2,
        cellWidth,
        cardHeight
      );
    }
  }

  /**
   * Draw perspective grid lines
   */
  private drawPerspectiveGrid(): void {
    const ctx = this.ctx;
    ctx.strokeStyle = "#3a2817";
    ctx.lineWidth = 2;

    // Draw horizontal depth lines
    for (let depth = 6; depth >= 1; depth--) {
      const y = this.getDepthY(depth as Depth);
      const scale = this.getDepthScale(depth as Depth);

      const leftX = this.getLaneX(0, depth as Depth) - (LANE_WIDTH_BASE * scale) / 2;
      const rightX = this.getLaneX(2, depth as Depth) + (LANE_WIDTH_BASE * scale) / 2;

      ctx.beginPath();
      ctx.moveTo(leftX, y);
      ctx.lineTo(rightX, y);
      ctx.stroke();

      // Draw depth label
      ctx.font = `bold ${9 + scale * 3}px 'Courier New'`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = depth === 6 || depth === 1 ? "#c96969" : "#6a5a4a";
      const label = depth === 6 ? "CPU" : depth === 1 ? "PLR" : String(depth);
      ctx.fillText(label, leftX - 30, y);
    }

    // Draw vertical lane dividers
    for (let lane = 0; lane < 3; lane++) {
      ctx.beginPath();
      const x1 = this.getLaneX(lane as LaneIndex, 6);
      const y1 = this.getDepthY(6);
      const x2 = this.getLaneX(lane as LaneIndex, 1);
      const y2 = this.getDepthY(1);

      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw lane right borders
    for (let lane = 0; lane < 3; lane++) {
      const scale1 = this.getDepthScale(6);
      const scale2 = this.getDepthScale(1);

      ctx.beginPath();
      const x1 = this.getLaneX(lane as LaneIndex, 6) + (LANE_WIDTH_BASE * scale1) / 2;
      const y1 = this.getDepthY(6);
      const x2 = this.getLaneX(lane as LaneIndex, 1) + (LANE_WIDTH_BASE * scale2) / 2;
      const y2 = this.getDepthY(1);

      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  /**
   * Draw all pieces in a depth row
   */
  private drawDepthRow(state: GameState, depth: Depth): void {
    for (let lane = 0; lane < 3; lane++) {
      const piece = getPiece(state.board, {
        lane: lane as LaneIndex,
        depth: depth,
      });

      if (piece) {
        this.drawPiece(piece, lane as LaneIndex, depth);
      }
    }
  }

  /**
   * Draw a single piece/card with perspective
   */
  private drawPiece(piece: Piece, lane: LaneIndex, depth: Depth): void {
    const ctx = this.ctx;
    const scale = this.getDepthScale(depth);

    const x = this.getLaneX(lane, depth);
    const y = this.getDepthY(depth);

    const cardWidth = 75 * scale;
    const cardHeight = 60 * scale;

    // Card background
    const isPlayer = piece.side === "player";
    const gradient = ctx.createLinearGradient(
      x - cardWidth / 2,
      y - cardHeight / 2,
      x - cardWidth / 2,
      y + cardHeight / 2
    );

    if (isPlayer) {
      gradient.addColorStop(0, "#3a5a4a");
      gradient.addColorStop(1, "#2a3a2a");
    } else {
      gradient.addColorStop(0, "#5a3a3a");
      gradient.addColorStop(1, "#3a2a2a");
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight);

    // Border
    ctx.strokeStyle = isPlayer ? "#4a7c59" : "#8b4049";
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight);

    // Card name
    ctx.font = `bold ${8 * scale}px 'Courier New'`;
    ctx.fillStyle = "#d4c5a9";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const name = this.getCardName(piece.cardId);
    ctx.fillText(name, x, y - cardHeight / 2 + 3 * scale);

    // Type indicator
    ctx.font = `${6 * scale}px 'Courier New'`;
    ctx.fillStyle = "#8a7a5a";
    ctx.fillText(piece.type === "unit" ? "UNIT" : "ATTK", x, y - cardHeight / 2 + 15 * scale);

    // Stats
    ctx.font = `bold ${11 * scale}px 'Courier New'`;

    // Attack (red)
    ctx.fillStyle = "#c96969";
    ctx.textAlign = "left";
    ctx.fillText(`${piece.attack}`, x - cardWidth / 2 + 10 * scale, y + cardHeight / 2 - 18 * scale);

    // Health (green)
    ctx.fillStyle = "#69c969";
    ctx.textAlign = "right";
    ctx.fillText(`${piece.health}`, x + cardWidth / 2 - 10 * scale, y + cardHeight / 2 - 18 * scale);

    // Divider
    ctx.strokeStyle = "#3a2817";
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(x - cardWidth / 2 + 8 * scale, y + cardHeight / 2 - 22 * scale);
    ctx.lineTo(x + cardWidth / 2 - 8 * scale, y + cardHeight / 2 - 22 * scale);
    ctx.stroke();
  }

  /**
   * Get card name from ID
   */
  private getCardName(cardId: string): string {
    const names: Record<string, string> = {
      scrapper_kid: "Scrapper",
      nimble_runner: "Runner",
      big_sister: "Big Sis",
      sleepwalker_bruiser: "Bruiser",
      dog: "Dog",
      cat: "Cat",
      rat: "Rat",
      chair_smash: "Chair",
      broom_jab: "Broom",
      pocket_sand: "Sand",
      lantern_swing: "Lantern",
      scalding_tea: "Tea",
      slick_finling: "Finling",
      drowned_leech: "Leech",
      gasping_choirboy: "Choir",
      kelp_crawler: "Kelp",
      tide_caller: "Tide",
      tentacle_lash: "Tentacle",
      water_burst: "Water",
      drowning_grasp: "Grasp",
    };
    return names[cardId] || cardId;
  }

  /**
   * Get cell at mouse position (with perspective)
   */
  getCellAtPosition(x: number, y: number): { lane: LaneIndex; depth: Depth } | null {
    // Check each depth from front to back
    for (let depth = 1; depth <= 6; depth++) {
      const depthY = this.getDepthY(depth as Depth);
      const scale = this.getDepthScale(depth as Depth);
      const cardHeight = 60 * scale;

      // Make hit area slightly larger for easier clicking (especially at depth 1)
      const hitPadding = depth === 1 ? 15 : 5;

      // Check if Y is in range
      if (Math.abs(y - depthY) > cardHeight / 2 + hitPadding) {
        continue;
      }

      // Check each lane
      for (let lane = 0; lane < 3; lane++) {
        const laneX = this.getLaneX(lane as LaneIndex, depth as Depth);
        const cardWidth = 75 * scale;

        if (Math.abs(x - laneX) <= cardWidth / 2 + hitPadding) {
          return { lane: lane as LaneIndex, depth: depth as Depth };
        }
      }
    }

    return null;
  }
}
