/**
 * Murk - A lane-based board game
 * Entry point
 */

import { GameEngine } from "./engine/game-engine.js";
import { GameCLI } from "./ui/cli.js";
import { buildPlayerDeck, buildCpuDeck } from "./cards/definitions.js";

async function main() {
  console.log("=".repeat(60));
  console.log("MURK - Victorian Orphanage Defense");
  console.log("=".repeat(60));
  console.log("");
  console.log("Defend the orphanage from otherworldly intrusions!");
  console.log("Push your units deep into enemy territory to gain Ritual.");
  console.log("First to 10 Ritual wins!");
  console.log("");
  console.log("Press Enter to start...");

  // Wait for Enter
  await new Promise((resolve) => {
    process.stdin.once("data", resolve);
  });

  // Create game
  const playerDeck = buildPlayerDeck();
  const cpuDeck = buildCpuDeck();
  const engine = new GameEngine(playerDeck, cpuDeck);

  // Start CLI
  const cli = new GameCLI(engine);
  await cli.start();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
