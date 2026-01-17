/**
 * Game engine - orchestrates game flow and phases
 */

import type {
  GameState,
  GameAction,
  GameEvent,
  LaneIndex,
  LaneOrder,
  CardDefinition,
} from "../types/core.js";
import {
  createGameState,
  getCurrentPlayer,
  advancePhase,
  resetLaneOrders,
  checkWinCondition,
  drawCards,
} from "../models/game-state.js";
import { getDeployDepth, isEmpty, setPiece } from "../models/board.js";
import { createPiece } from "../models/piece.js";
import { refillMana, spendMana, canAfford, increaseMaxMana } from "../systems/mana.js";
import { executeRitualPhase } from "../systems/ritual.js";
import { executeMarchPhase } from "../systems/march.js";
import { executeCombatPhase } from "../systems/combat.js";
import { decideCpuMainPhase } from "../ai/cpu.js";

/**
 * Main game engine class
 */
export class GameEngine {
  private state: GameState;
  private events: GameEvent[] = [];

  constructor(playerDeck: CardDefinition[], cpuDeck: CardDefinition[]) {
    this.state = createGameState(playerDeck, cpuDeck);
  }

  /**
   * Get current game state (readonly)
   */
  getState(): Readonly<GameState> {
    return this.state;
  }

  /**
   * Get and clear events
   */
  getEvents(): GameEvent[] {
    const events = [...this.events];
    this.events = [];
    return events;
  }

  /**
   * Start the game
   */
  start(): void {
    this.logEvent("game_start", "Game begins!");
  }

  /**
   * Process a player action
   */
  processAction(action: GameAction): boolean {
    switch (action.type) {
      case "play_card":
        return this.playCard(action.cardIndex, action.lane);

      case "set_lane_order":
        return this.setLaneOrder(action.lane, action.order);

      case "advance_phase":
        return this.advanceToNextPhase();

      case "end_turn":
        return this.endTurn();

      default:
        return false;
    }
  }

  /**
   * Play a card from hand
   */
  private playCard(cardIndex: number, lane: LaneIndex): boolean {
    if (this.state.phase !== "main") {
      this.logEvent("error", "Can only play cards during main phase");
      return false;
    }

    const player = getCurrentPlayer(this.state);
    const card = player.hand[cardIndex];

    if (!card) {
      this.logEvent("error", "Invalid card index");
      return false;
    }

    if (!canAfford(player, card.manaCost)) {
      this.logEvent("error", `Not enough mana (need ${card.manaCost}, have ${player.mana})`);
      return false;
    }

    const deployDepth = getDeployDepth(this.state.currentSide);
    const position = { lane, depth: deployDepth };

    if (!isEmpty(this.state.board, position)) {
      this.logEvent("error", `Lane ${lane} is occupied`);
      return false;
    }

    // Play the card
    spendMana(player, card.manaCost);
    const piece = createPiece(card, this.state.currentSide, position);
    setPiece(this.state.board, position, piece);
    player.hand.splice(cardIndex, 1);
    player.discard.push(card);

    this.logEvent("play_card", `${this.state.currentSide} plays ${card.name} in lane ${lane}`, {
      card,
      lane,
      piece,
    });

    return true;
  }

  /**
   * Set lane order
   */
  private setLaneOrder(lane: LaneIndex, order: LaneOrder): boolean {
    if (order === "none") {
      this.logEvent("error", "Cannot set lane order to 'none'");
      return false;
    }
    if (this.state.phase !== "main") {
      this.logEvent("error", "Can only set lane orders during main phase");
      return false;
    }

    // Reset all lanes first (only one lane order per turn)
    resetLaneOrders(this.state);
    this.state.lanes[lane].order = order;

    this.logEvent("set_lane_order", `Lane ${lane} set to ${order}`, { lane, order });
    return true;
  }

  /**
   * Advance to next phase
   */
  private advanceToNextPhase(): boolean {
    const currentPhase = this.state.phase;

    // Execute current phase logic before advancing
    switch (currentPhase) {
      case "ritual":
        this.executeRitual();
        break;

      case "main":
        // Player must manually advance
        break;

      case "march":
        this.executeMarch();
        break;

      case "combat":
        this.executeCombat();
        break;

      case "end":
        this.executeEnd();
        break;
    }

    // Check win condition
    const winner = checkWinCondition(this.state);
    if (winner) {
      this.state.winner = winner;
      this.logEvent("game_end", `${winner} wins!`, { winner });
      return true;
    }

    // Advance phase
    advancePhase(this.state);
    this.logEvent("phase_change", `Phase: ${this.state.phase}`, { phase: this.state.phase });

    // Auto-execute certain phases
    if (this.state.currentSide === "cpu" && this.state.phase === "main") {
      this.executeCpuMainPhase();
      this.advanceToNextPhase();
    }

    return true;
  }

  /**
   * End current turn
   */
  private endTurn(): boolean {
    while (this.state.phase !== "ritual") {
      if (!this.advanceToNextPhase()) {
        return false;
      }
    }
    return true;
  }

  /**
   * Execute ritual phase
   */
  private executeRitual(): void {
    executeRitualPhase(this.state);
    this.logEvent("ritual_phase", `Ritual: Player ${this.state.player.ritual}, CPU ${this.state.cpu.ritual}`);

    // Refill mana and increase max mana at start of main phase
    const player = getCurrentPlayer(this.state);
    increaseMaxMana(player);
    refillMana(player);
  }

  /**
   * Execute march phase
   */
  private executeMarch(): void {
    const events = executeMarchPhase(this.state);
    this.events.push(...events);
  }

  /**
   * Execute combat phase
   */
  private executeCombat(): void {
    const events = executeCombatPhase(this.state);
    this.events.push(...events);
  }

  /**
   * Execute end phase
   */
  private executeEnd(): void {
    const player = getCurrentPlayer(this.state);

    // Draw 1 card at end of turn
    drawCards(player, 1);
    this.logEvent("draw", `${this.state.currentSide} draws 1 card`);

    // Reset lane orders
    resetLaneOrders(this.state);
  }

  /**
   * Execute CPU main phase (AI decision making)
   */
  private executeCpuMainPhase(): void {
    const decision = decideCpuMainPhase(this.state);

    // Play cards
    for (const { cardIndex, lane } of decision.cardsToPlay) {
      // Need to recalculate index after each play since array shrinks
      const adjustedIndex = Math.min(cardIndex, this.state.cpu.hand.length - 1);
      this.playCard(adjustedIndex, lane);
    }

    // Set lane order
    if (decision.laneOrder) {
      this.setLaneOrder(decision.laneOrder.lane, decision.laneOrder.order);
    }
  }

  /**
   * Log an event
   */
  private logEvent(type: string, message: string, data?: unknown): void {
    this.events.push({ type, message, data });
  }

  /**
   * Get available actions for current state
   */
  getAvailableActions(): string[] {
    const actions: string[] = [];

    if (this.state.currentSide === "cpu") {
      return ["advance_phase"]; // CPU is automated
    }

    switch (this.state.phase) {
      case "main":
        actions.push("play_card", "set_lane_order", "end_turn");
        break;

      case "ritual":
      case "march":
      case "combat":
      case "end":
        actions.push("advance_phase");
        break;
    }

    return actions;
  }
}
