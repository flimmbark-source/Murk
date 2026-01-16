/**
 * Canvas-based board renderer
 */

import type { GameState, Piece, LaneIndex, Depth } from "../types/core.js";
import { getPiece } from "../models/board.js";

const LANE_WIDTH = 280;
const CELL_HEIGHT = 90;
const PADDING = 30;
const CARD_WIDTH = 75;
const CARD_HEIGHT = 60;

export class BoardRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  /**
   * Render the complete board
   */
  render(state: GameState): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background grid
    this.drawGrid();

    // Draw depth labels
    this.drawDepthLabels();

    // Draw pieces
    this.drawPieces(state);

    // Draw lane orders
    this.drawLaneOrders(state);
  }

  /**
   * Draw the board grid
   */
  private drawGrid(): void {
    const ctx = this.ctx;

    // Draw vertical lane dividers
    for (let lane = 0; lane <= 3; lane++) {
      const x = PADDING + lane * LANE_WIDTH;
      ctx.strokeStyle = "#3a2817";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, PADDING);
      ctx.lineTo(x, PADDING + 5 * CELL_HEIGHT);
      ctx.stroke();
    }

    // Draw horizontal depth dividers
    for (let depth = 0; depth <= 5; depth++) {
      const y = PADDING + depth * CELL_HEIGHT;
      ctx.strokeStyle = "#3a2817";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(PADDING, y);
      ctx.lineTo(PADDING + 3 * LANE_WIDTH, y);
      ctx.stroke();
    }

    // Highlight middle contested zone
    ctx.fillStyle = "rgba(139, 64, 73, 0.05)";
    ctx.fillRect(PADDING, PADDING + 2 * CELL_HEIGHT, 3 * LANE_WIDTH, CELL_HEIGHT);
  }

  /**
   * Draw depth labels
   */
  private drawDepthLabels(): void {
    const ctx = this.ctx;
    ctx.font = "bold 11px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const labels = ["CPU", "4", "3", "2", "PLR"];

    for (let i = 0; i < 5; i++) {
      const y = PADDING + i * CELL_HEIGHT + CELL_HEIGHT / 2;
      ctx.fillStyle = i === 0 || i === 4 ? "#c96969" : "#6a5a4a";
      ctx.fillText(labels[i], 10, y);
      ctx.fillText(labels[i], this.canvas.width - 10, y);
    }
  }

  /**
   * Draw all pieces on the board
   */
  private drawPieces(state: GameState): void {
    for (let lane = 0; lane < 3; lane++) {
      for (let depth = 1; depth <= 5; depth++) {
        const piece = getPiece(state.board, {
          lane: lane as LaneIndex,
          depth: depth as Depth,
        });

        if (piece) {
          this.drawPiece(piece, lane as LaneIndex, depth as Depth);
        }
      }
    }
  }

  /**
   * Draw a single piece/card on the board
   */
  private drawPiece(piece: Piece, lane: LaneIndex, depth: Depth): void {
    const ctx = this.ctx;

    // Calculate position
    const x = PADDING + lane * LANE_WIDTH + (LANE_WIDTH - CARD_WIDTH) / 2;
    const y = PADDING + (depth - 1) * CELL_HEIGHT + (CELL_HEIGHT - CARD_HEIGHT) / 2;

    // Card background
    const isPlayer = piece.side === "player";
    const gradient = ctx.createLinearGradient(x, y, x, y + CARD_HEIGHT);

    if (isPlayer) {
      gradient.addColorStop(0, "#3a5a4a");
      gradient.addColorStop(1, "#2a3a2a");
    } else {
      gradient.addColorStop(0, "#5a3a3a");
      gradient.addColorStop(1, "#3a2a2a");
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, CARD_WIDTH, CARD_HEIGHT);

    // Border
    ctx.strokeStyle = isPlayer ? "#4a7c59" : "#8b4049";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, CARD_WIDTH, CARD_HEIGHT);

    // Card name
    ctx.font = "bold 8px 'Courier New'";
    ctx.fillStyle = "#d4c5a9";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const name = this.getCardName(piece.cardId);
    this.drawWrappedText(ctx, name, x + CARD_WIDTH / 2, y + 3, CARD_WIDTH - 8, 9);

    // Type indicator
    ctx.font = "6px 'Courier New'";
    ctx.fillStyle = "#8a7a5a";
    ctx.fillText(piece.type === "unit" ? "UNIT" : "ATTK", x + CARD_WIDTH / 2, y + 20);

    // Stats
    ctx.font = "bold 11px 'Courier New'";

    // Attack (red)
    ctx.fillStyle = "#c96969";
    ctx.fillText(`${piece.attack}`, x + 15, y + CARD_HEIGHT - 14);

    // Health (green)
    ctx.fillStyle = "#69c969";
    ctx.fillText(`${piece.health}`, x + CARD_WIDTH - 15, y + CARD_HEIGHT - 14);

    // Divider
    ctx.strokeStyle = "#3a2817";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + CARD_HEIGHT - 22);
    ctx.lineTo(x + CARD_WIDTH - 8, y + CARD_HEIGHT - 22);
    ctx.stroke();
  }

  /**
   * Draw lane orders
   */
  private drawLaneOrders(state: GameState): void {
    const ctx = this.ctx;

    for (let lane = 0; lane < 3; lane++) {
      const order = state.lanes[lane].order;
      if (order === "none") continue;

      const x = PADDING + lane * LANE_WIDTH + LANE_WIDTH / 2;
      const y = this.canvas.height - 20;

      ctx.font = "bold 10px 'Courier New'";
      ctx.textAlign = "center";
      ctx.fillStyle = order === "advance" ? "#c9a961" : "#8b8b8b";
      ctx.fillText(order.toUpperCase(), x, y);
    }
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
   * Draw wrapped text
   */
  private drawWrappedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): void {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x, currentY);
        line = words[i] + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  /**
   * Get cell at mouse position
   */
  getCellAtPosition(x: number, y: number): { lane: LaneIndex; depth: Depth } | null {
    const relX = x - PADDING;
    const relY = y - PADDING;

    if (relX < 0 || relY < 0) return null;

    const lane = Math.floor(relX / LANE_WIDTH);
    const depth = Math.floor(relY / CELL_HEIGHT) + 1;

    if (lane < 0 || lane > 2 || depth < 1 || depth > 5) {
      return null;
    }

    return { lane: lane as LaneIndex, depth: depth as Depth };
  }
}
