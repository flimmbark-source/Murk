/**
 * Simple test to verify game mechanics
 */

import { GameEngine } from "./engine/game-engine.js";
import { buildPlayerDeck, buildCpuDeck } from "./cards/definitions.js";
import { renderGameState, renderEvents } from "./ui/renderer.js";

function runTest() {
  console.log("=== Testing Murk Game Engine ===\n");

  // Create game
  const playerDeck = buildPlayerDeck();
  const cpuDeck = buildCpuDeck();
  const engine = new GameEngine(playerDeck, cpuDeck);

  engine.start();

  console.log("Initial State:");
  console.log(renderGameState(engine.getState()));
  console.log("\n" + "=".repeat(60) + "\n");

  // Test: Advance through ritual phase
  console.log("Advancing through ritual phase...");
  engine.processAction({ type: "advance_phase" });
  console.log(renderEvents(engine.getEvents()));

  // Test: Play a card
  console.log("\nAttempting to play card 0 in lane 1...");
  const state = engine.getState();
  console.log(`Hand: ${state.player.hand.map((c) => c.name).join(", ")}`);
  const success = engine.processAction({
    type: "play_card",
    cardIndex: 0,
    lane: 1,
  });
  console.log(`Play card result: ${success}`);
  console.log(renderEvents(engine.getEvents()));

  // Test: Set lane order
  console.log("\nSetting lane 1 to Advance...");
  engine.processAction({ type: "set_lane_order", lane: 1, order: "advance" });
  console.log(renderEvents(engine.getEvents()));

  // Show final state
  console.log("\nFinal State:");
  console.log(renderGameState(engine.getState()));

  console.log("\n=== Test Complete ===");
}

runTest();
