/**
 * Simple web server to serve the game
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../../public")));

// Serve compiled client code
app.use("/dist", express.static(path.join(__dirname, "../../dist")));

// Serve index.html for root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
});

app.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log("MURK - Victorian Orphanage Defense");
  console.log("=".repeat(60));
  console.log(`\nServer running at: http://localhost:${PORT}`);
  console.log("\nOpen your browser and visit the URL above to play!");
  console.log("=".repeat(60));
});
