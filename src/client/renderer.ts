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

    // Use EXACT same boundary calculations as the grid
    const topY = this.getDepthBoundaryY(1);
    const bottomY = this.getDepthBoundaryY(0);

    // Draw solid yellow outline for each lane segment at depth 1
    ctx.strokeStyle = "#FFD700"; // Gold/yellow color
    ctx.lineWidth = 3;

    for (let lane = 0; lane < 3; lane++) {
      // Use exact same boundary X calculations as the grid
      const leftX = this.getLaneBoundaryX(lane, 1);
      const rightX = this.getLaneBoundaryX(lane + 1, 1);

      ctx.strokeRect(
        leftX,
        topY,
        rightX - leftX,
        bottomY - topY
      );
    }
  }

  /**
   * Get Y position for boundary between two depths
   */
  private getDepthBoundaryY(depth: number): number {
    if (depth === 0) {
      // Bottom edge - extend below depth 1
      const y1 = this.getDepthY(1);
      const y2 = this.getDepthY(2);
      return y1 + (y1 - y2) / 2;
    } else if (depth === 6) {
      // Top edge - extend above depth 6
      const y6 = this.getDepthY(6);
      const y5 = this.getDepthY(5);
      return y6 - (y5 - y6) / 2;
    } else {
      // Midpoint between adjacent depths
      const y1 = this.getDepthY(depth as Depth);
      const y2 = this.getDepthY((depth + 1) as Depth);
      return (y1 + y2) / 2;
    }
  }

  /**
   * Get X position for a vertical lane boundary at a given depth
   * @param boundaryIndex 0-3 for the 4 vertical boundaries (0=left edge, 3=right edge)
   * @param depth The depth at which to calculate the X position
   */
  private getLaneBoundaryX(boundaryIndex: number, depth: number): number {
    const scale = depth === 0 || depth === 6
      ? this.getDepthScale(depth === 0 ? 1 : 6)
      : (this.getDepthScale(depth as Depth) + this.getDepthScale((depth + 1) as Depth)) / 2;
    const centerX = this.canvas.width / 2;
    return centerX + (boundaryIndex - 1.5) * LANE_WIDTH_BASE * scale;
  }

  /**
   * Draw perspective grid lines
   */
  private drawPerspectiveGrid(): void {
    const ctx = this.ctx;
    ctx.strokeStyle = "#3a2817";
    ctx.lineWidth = 2;

    // Draw horizontal boundary lines that define cells
    for (let depth = 6; depth >= 0; depth--) {
      const y = this.getDepthBoundaryY(depth);
      const leftX = this.getLaneBoundaryX(0, depth);
      const rightX = this.getLaneBoundaryX(3, depth);

      ctx.beginPath();
      ctx.moveTo(leftX, y);
      ctx.lineTo(rightX, y);
      ctx.stroke();
    }

    // Draw depth labels at center of each cell
    for (let depth = 6; depth >= 1; depth--) {
      const y = this.getDepthY(depth as Depth);
      const scale = this.getDepthScale(depth as Depth);
      const leftX = this.canvas.width / 2 - (1.5 * LANE_WIDTH_BASE * scale);

      ctx.font = `bold ${9 + scale * 3}px 'Courier New'`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = depth === 6 || depth === 1 ? "#c96969" : "#6a5a4a";
      const label = depth === 6 ? "CPU" : depth === 1 ? "PLR" : String(depth);
      ctx.fillText(label, leftX - 30, y);
    }

    // Draw vertical lane boundaries (4 lines defining 3 lanes)
    // Connect from top boundary (depth 6) to bottom boundary (depth 0)
    for (let i = 0; i <= 3; i++) {
      ctx.beginPath();
      const x1 = this.getLaneBoundaryX(i, 6);
      const y1 = this.getDepthBoundaryY(6);
      const x2 = this.getLaneBoundaryX(i, 0);
      const y2 = this.getDepthBoundaryY(0);

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
      // Use actual boundary Y positions to define cell area
      const topY = this.getDepthBoundaryY(depth);
      const bottomY = this.getDepthBoundaryY(depth - 1);

      // Check if Y is in range
      if (y < topY || y > bottomY) {
        continue;
      }

      // Check each lane using exact same boundary X calculations as the grid
      for (let lane = 0; lane < 3; lane++) {
        const leftX = this.getLaneBoundaryX(lane, depth);
        const rightX = this.getLaneBoundaryX(lane + 1, depth);

        if (x >= leftX && x <= rightX) {
          return { lane: lane as LaneIndex, depth: depth as Depth };
        }
      }
    }

    return null;
  }
}
