/**
 * CLI interface for the game
 */

import * as readline from "readline/promises";
import { GameEngine } from "../engine/game-engine.js";
import { renderGameState, renderEvents } from "./renderer.js";
import type { LaneIndex, LaneOrder } from "../types/core.js";

/**
 * CLI game controller
 */
export class GameCLI {
  private engine: GameEngine;
  private rl: readline.Interface;

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Start the game loop
   */
  async start(): Promise<void> {
    this.engine.start();
    console.clear();
    this.displayState();

    await this.gameLoop();

    this.rl.close();
  }

  /**
   * Main game loop
   */
  private async gameLoop(): Promise<void> {
    while (!this.engine.getState().winner) {
      const state = this.engine.getState();

      if (state.currentSide === "cpu") {
        // CPU turn - auto-advance
        await this.waitForEnter("CPU turn - Press Enter to continue...");
        this.engine.processAction({ type: "advance_phase" });
        this.displayState();
      } else {
        // Player turn
        await this.handlePlayerTurn();
      }
    }

    // Game over
    const winner = this.engine.getState().winner;
    console.log("\n" + "=".repeat(60));
    console.log(`GAME OVER! ${winner?.toUpperCase()} WINS!`);
    console.log("=".repeat(60));
  }

  /**
   * Handle player turn input
   */
  private async handlePlayerTurn(): Promise<void> {
    const state = this.engine.getState();

    if (state.phase === "main") {
      await this.handleMainPhase();
    } else {
      // Auto-advance through other phases
      await this.waitForEnter(`Press Enter to advance to next phase...`);
      this.engine.processAction({ type: "advance_phase" });
      this.displayState();
    }
  }

  /**
   * Handle main phase (playing cards and setting orders)
   */
  private async handleMainPhase(): Promise<void> {
    console.log("\nActions:");
    console.log("  [p] Play a card");
    console.log("  [o] Set lane order");
    console.log("  [e] End turn");
    console.log("  [q] Quit");

    const action = await this.rl.question("\nChoose action: ");

    switch (action.toLowerCase().trim()) {
      case "p":
        await this.handlePlayCard();
        break;

      case "o":
        await this.handleSetLaneOrder();
        break;

      case "e":
        this.engine.processAction({ type: "end_turn" });
        this.displayState();
        break;

      case "q":
        console.log("Quitting...");
        process.exit(0);

      default:
        console.log("Invalid action");
        await this.handleMainPhase();
    }
  }

  /**
   * Handle playing a card
   */
  private async handlePlayCard(): Promise<void> {
    const cardIndexStr = await this.rl.question("Card index: ");
    const cardIndex = parseInt(cardIndexStr, 10);

    if (isNaN(cardIndex)) {
      console.log("Invalid card index");
      return;
    }

    const laneStr = await this.rl.question("Lane (0, 1, 2): ");
    const lane = parseInt(laneStr, 10) as LaneIndex;

    if (![0, 1, 2].includes(lane)) {
      console.log("Invalid lane");
      return;
    }

    const success = this.engine.processAction({
      type: "play_card",
      cardIndex,
      lane,
    });

    this.displayState();

    if (success) {
      await this.handleMainPhase();
    } else {
      console.log("\nFailed to play card. Try again.");
      await this.handleMainPhase();
    }
  }

  /**
   * Handle setting lane order
   */
  private async handleSetLaneOrder(): Promise<void> {
    const laneStr = await this.rl.question("Lane (0, 1, 2): ");
    const lane = parseInt(laneStr, 10) as LaneIndex;

    if (![0, 1, 2].includes(lane)) {
      console.log("Invalid lane");
      return;
    }

    const orderStr = await this.rl.question("Order (advance/hold): ");
    const order = orderStr.toLowerCase().trim() as LaneOrder;

    if (!["advance", "hold"].includes(order)) {
      console.log("Invalid order");
      return;
    }

    const success = this.engine.processAction({
      type: "set_lane_order",
      lane,
      order,
    });

    this.displayState();

    if (success) {
      await this.handleMainPhase();
    } else {
      console.log("\nFailed to set lane order. Try again.");
      await this.handleMainPhase();
    }
  }

  /**
   * Display current game state
   */
  private displayState(): void {
    console.clear();
    console.log(renderGameState(this.engine.getState()));

    const events = this.engine.getEvents();
    if (events.length > 0) {
      console.log("\n" + renderEvents(events));
    }
  }

  /**
   * Wait for Enter key
   */
  private async waitForEnter(message: string): Promise<void> {
    await this.rl.question(`\n${message} `);
  }
}
