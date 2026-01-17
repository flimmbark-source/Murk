/**
 * Test march and combat mechanics
 */

import { GameEngine } from "./engine/game-engine.js";
import { buildPlayerDeck, buildCpuDeck } from "./cards/definitions.js";
import { renderGameState, renderEvents } from "./ui/renderer.js";

function runCombatTest() {
  console.log("=== Testing March & Combat ===\n");

  const playerDeck = buildPlayerDeck();
  const cpuDeck = buildCpuDeck();
  const engine = new GameEngine(playerDeck, cpuDeck);

  engine.start();

  // Skip ritual phase
  engine.processAction({ type: "advance_phase" });
  engine.getEvents(); // Clear

  console.log("Playing cards to set up combat scenario...");

  // Player plays in lanes 0, 1
  engine.processAction({ type: "play_card", cardIndex: 0, lane: 0 });
  engine.processAction({ type: "play_card", cardIndex: 0, lane: 1 });

  // Set lane 0 to advance
  engine.processAction({ type: "set_lane_order", lane: 0, order: "advance" });

  console.log(renderGameState(engine.getState()));
  console.log("\n" + "=".repeat(60) + "\n");

  // Advance to CPU turn
  engine.processAction({ type: "end_turn" });
  engine.getEvents(); // Clear

  console.log("CPU turn...");
  console.log(renderGameState(engine.getState()));
  console.log("\n" + "=".repeat(60) + "\n");

  // CPU main phase is auto-executed, advance through
  engine.processAction({ type: "end_turn" });

  console.log("After CPU turn:");
  console.log(renderGameState(engine.getState()));
  console.log("\n" + "=".repeat(60) + "\n");

  // Player turn again - advance to march
  engine.processAction({ type: "advance_phase" }); // ritual
  engine.processAction({ type: "advance_phase" }); // main
  console.log("Main phase, checking march phase next...");

  engine.processAction({ type: "advance_phase" }); // march
  const marchEvents = engine.getEvents();
  console.log("March phase events:");
  console.log(renderEvents(marchEvents));

  console.log("\nAfter march:");
  console.log(renderGameState(engine.getState()));
  console.log("\n" + "=".repeat(60) + "\n");

  // Combat phase
  engine.processAction({ type: "advance_phase" }); // combat
  const combatEvents = engine.getEvents();
  console.log("Combat phase events:");
  console.log(renderEvents(combatEvents));

  console.log("\nAfter combat:");
  console.log(renderGameState(engine.getState()));

  console.log("\n=== Combat Test Complete ===");
}

runCombatTest();
