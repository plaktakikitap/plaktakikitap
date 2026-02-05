#!/usr/bin/env node
/**
 * Creates minimal placeholder image assets under public/.
 * Run: node scripts/create-placeholder-assets.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "public");

// Minimal 1x1 pixel JPEG (brown-ish for leather)
const LEATHER_JPEG_BASE64 =
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUG/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQACEQADAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8Q/9k=";

// Minimal 1x1 pixel JPEG (beige for paper)
const PAPER_JPEG_BASE64 =
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUG/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQACEQADAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8Q/9k=";

// Minimal 1x1 transparent PNG (68 bytes)
const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// textures/leather.jpg, textures/paper.jpg
const texturesDir = path.join(ROOT, "textures");
ensureDir(texturesDir);
fs.writeFileSync(path.join(texturesDir, "leather.jpg"), Buffer.from(LEATHER_JPEG_BASE64, "base64"));
fs.writeFileSync(path.join(texturesDir, "paper.jpg"), Buffer.from(PAPER_JPEG_BASE64, "base64"));
console.log("Created public/textures/leather.jpg, paper.jpg");

// stickers/*.png (3–5 placeholders)
const stickersDir = path.join(ROOT, "stickers");
ensureDir(stickersDir);
const stickerNames = ["star", "heart", "moon", "flower", "check"];
const tinyPng = Buffer.from(TINY_PNG_BASE64, "base64");
for (const name of stickerNames) {
  fs.writeFileSync(path.join(stickersDir, `${name}.png`), tinyPng);
}
console.log("Created public/stickers/" + stickerNames.map((n) => n + ".png").join(", "));

console.log("Placeholder assets done. sfx/page-turn.mp3 should already exist.");
