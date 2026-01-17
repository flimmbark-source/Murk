/**
 * Client-side game controller
 */

import { GameEngine } from "../engine/game-engine.js";
import { buildPlayerDeck, buildCpuDeck } from "../cards/definitions.js";
import { BoardRenderer } from "./renderer.js";
import type { CardDefinition, LaneIndex } from "../types/core.js";

class GameClient {
  private engine: GameEngine;
  private renderer: BoardRenderer;
  private selectedCard: number | null = null;

  constructor() {
    const playerDeck = buildPlayerDeck();
    const cpuDeck = buildCpuDeck();
    this.engine = new GameEngine(playerDeck, cpuDeck);

    const canvas = document.getElementById("board-canvas") as HTMLCanvasElement;
    this.renderer = new BoardRenderer(canvas);

    this.setupEventListeners();
    this.start();
  }

  /**
   * Start the game
   */
  private start(): void {
    this.engine.start();
    this.startRenderLoop();
    this.update();
  }

  /**
   * Start continuous render loop for smooth rendering
   */
  private startRenderLoop(): void {
    const render = () => {
      const state = this.engine.getState();
      this.renderer.render(state, this.selectedCard);
      requestAnimationFrame(render);
    };
    render();
  }

  /**
   * Main update loop (UI updates)
   */
  private update(): void {
    const state = this.engine.getState();

    // Update UI
    this.updateHeader(state);
    this.updateHand(state);
    this.updateLaneControls(state);
    this.updateActionButtons(state);
    this.updateEventLog();

    // Check for game over
    if (state.winner) {
      this.showGameOver(state.winner);
      return;
    }

    // Auto-advance CPU turns
    if (state.currentSide === "cpu") {
      setTimeout(() => {
        this.engine.processAction({ type: "advance_phase" });
        this.update();
      }, 1000);
      return;
    }

    // Auto-advance non-main phases for player
    if (state.currentSide === "player" && state.phase !== "main") {
      const delay = state.phase === "ritual" ? 1500 : 2000;
      setTimeout(() => {
        this.engine.processAction({ type: "advance_phase" });
        this.update();
      }, delay);
    }
  }

  /**
   * Update header UI
   */
  private updateHeader(state: any): void {
    // Ritual track
    const playerRitualFill = document.getElementById("player-ritual-fill")!;
    const cpuRitualFill = document.getElementById("cpu-ritual-fill")!;
    const playerRitualText = document.getElementById("player-ritual-text")!;
    const cpuRitualText = document.getElementById("cpu-ritual-text")!;

    playerRitualFill.style.width = `${(state.player.ritual / 10) * 100}%`;
    cpuRitualFill.style.width = `${(state.cpu.ritual / 10) * 100}%`;
    playerRitualText.textContent = String(state.player.ritual);
    cpuRitualText.textContent = String(state.cpu.ritual);

    // Turn and phase
    document.getElementById("turn-number")!.textContent = String(state.turn);
    document.getElementById("phase-name")!.textContent = state.phase.toUpperCase();

    // Mana
    const currentPlayer = state.currentSide === "player" ? state.player : state.cpu;
    document.getElementById("mana-current")!.textContent = String(currentPlayer.mana);
    document.getElementById("mana-max")!.textContent = String(currentPlayer.maxMana);
  }

  /**
   * Update hand display
   */
  private updateHand(state: any): void {
    const handCards = document.getElementById("hand-cards")!;
    handCards.innerHTML = "";

    if (state.currentSide !== "player") {
      return;
    }

    state.player.hand.forEach((card: CardDefinition, index: number) => {
      const cardEl = this.createCardElement(card, index, state.player.mana);
      handCards.appendChild(cardEl);
    });
  }

  /**
   * Create a card element
   */
  private createCardElement(card: CardDefinition, index: number, mana: number): HTMLElement {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.dataset.index = String(index);

    const canAfford = card.manaCost <= mana;
    if (!canAfford) {
      cardEl.classList.add("disabled");
    }

    if (this.selectedCard === index) {
      cardEl.classList.add("selected");
    }

    cardEl.innerHTML = `
      <div class="card-cost">${card.manaCost}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-type">${card.type}</div>
      <div class="card-stats">
        <div class="card-stat stat-attack">⚔ ${card.attack}</div>
        <div class="card-stat stat-health">❤ ${card.health}</div>
      </div>
      <div class="card-description">${card.description || ""}</div>
    `;

    if (canAfford) {
      cardEl.addEventListener("click", () => this.selectCard(index));
    }

    return cardEl;
  }

  /**
   * Select a card from hand
   */
  private selectCard(index: number): void {
    console.log("selectCard called with index:", index);
    console.log("Current selectedCard:", this.selectedCard);
    if (this.selectedCard === index) {
      this.selectedCard = null;
      console.log("Deselected card", index);
    } else {
      this.selectedCard = index;
      console.log("Selected card", index);
    }
    console.log("New selectedCard value:", this.selectedCard);
    this.update();
  }

  /**
   * Update lane controls
   */
  private updateLaneControls(state: any): void {
    const isMainPhase = state.phase === "main" && state.currentSide === "player";

    document.querySelectorAll(".lane-control").forEach((control) => {
      const laneIndex = parseInt(control.getAttribute("data-lane")!);
      const laneState = state.lanes[laneIndex];
      const statusEl = control.querySelector(".lane-status")!;

      statusEl.textContent = laneState.order.toUpperCase();
      if (laneState.order !== "none") {
        statusEl.classList.add("active");
      } else {
        statusEl.classList.remove("active");
      }

      // Enable/disable buttons
      control.querySelectorAll(".lane-btn").forEach((btn) => {
        (btn as HTMLButtonElement).disabled = !isMainPhase;
      });
    });
  }

  /**
   * Update action buttons
   */
  private updateActionButtons(state: any): void {
    const advanceBtn = document.getElementById("advance-phase-btn") as HTMLButtonElement;
    const endTurnBtn = document.getElementById("end-turn-btn") as HTMLButtonElement;

    const isPlayerTurn = state.currentSide === "player";
    const isMainPhase = state.phase === "main";

    advanceBtn.disabled = !isPlayerTurn || state.winner !== null;
    endTurnBtn.disabled = !isPlayerTurn || !isMainPhase || state.winner !== null;
  }

  /**
   * Update event log
   */
  private updateEventLog(): void {
    const events = this.engine.getEvents();
    if (events.length === 0) return;

    const logContent = document.getElementById("log-content")!;

    events.forEach((event) => {
      const entry = document.createElement("div");
      entry.className = "log-entry";

      if (["combat", "breakthrough", "game_end"].includes(event.type)) {
        entry.classList.add("important");
      }

      entry.textContent = `• ${event.message}`;
      logContent.insertBefore(entry, logContent.firstChild);
    });

    // Keep log size manageable
    while (logContent.children.length > 50) {
      logContent.removeChild(logContent.lastChild!);
    }
  }

  /**
   * Show game over modal
   */
  private showGameOver(winner: string): void {
    const modal = document.getElementById("game-over-modal")!;
    const winnerText = document.getElementById("winner-text")!;

    winnerText.textContent = `${winner.toUpperCase()} WINS!`;
    modal.classList.remove("hidden");
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Board click for placing cards
    const canvas = document.getElementById("board-canvas") as HTMLCanvasElement;
    canvas.addEventListener("click", (e) => this.handleBoardClick(e));

    // Lane order buttons
    document.querySelectorAll(".lane-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const laneControl = target.closest(".lane-control")!;
        const lane = parseInt(laneControl.getAttribute("data-lane")!) as LaneIndex;
        const order = target.getAttribute("data-order") as "advance" | "hold";

        this.engine.processAction({ type: "set_lane_order", lane, order });
        this.update();
      });
    });

    // Action buttons
    document.getElementById("advance-phase-btn")!.addEventListener("click", () => {
      this.engine.processAction({ type: "advance_phase" });
      this.update();
    });

    document.getElementById("end-turn-btn")!.addEventListener("click", () => {
      this.engine.processAction({ type: "end_turn" });
      this.selectedCard = null;
      this.update();
    });

    // Restart button
    document.getElementById("restart-btn")!.addEventListener("click", () => {
      location.reload();
    });
  }

  /**
   * Handle board click
   */
  private handleBoardClick(e: MouseEvent): void {
    const state = this.engine.getState();

    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cell = this.renderer.getCellAtPosition(x, y);
    console.log("Board click:", { x, y, cell, selectedCard: this.selectedCard, phase: state.phase, side: state.currentSide });

    if (state.currentSide !== "player" || state.phase !== "main" || this.selectedCard === null) {
      console.log("Cannot place card - not player's main phase or no card selected");
      return;
    }

    if (cell && cell.depth === 1) {
      console.log("Attempting to place card at lane", cell.lane);
      // Try to play card
      const success = this.engine.processAction({
        type: "play_card",
        cardIndex: this.selectedCard,
        lane: cell.lane,
      });

      console.log("Card placement success:", success);

      if (success) {
        this.selectedCard = null;
      }

      this.update();
    } else {
      console.log("Click not at depth 1 or no cell detected");
    }
  }
}

// Start the game when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new GameClient();
});
