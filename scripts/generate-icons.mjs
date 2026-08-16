#!/usr/bin/env node
/**
 * Rasterize public/icon.svg into public/icon-192.png and public/icon-512.png.
 *
 * The SVG is the source of truth. PWA manifests reference the SVG as the
 * primary icon, but Android still wants raster fallbacks for older
 * contexts (lock screen, notification badges, share sheet). Run this
 * whenever the SVG changes:
 *
 *     npm run icons
 *
 * No-op-safe: re-running produces byte-identical output.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, "..", "public");

const SIZES = [
  { out: "icon-192.png", size: 192 },
  { out: "icon-512.png", size: 512 },
];

async function main() {
  const svgPath = resolve(PUBLIC_DIR, "icon.svg");
  const svg = await readFile(svgPath);

  for (const { out, size } of SIZES) {
    const outPath = resolve(PUBLIC_DIR, out);
    await sharp(svg, { density: Math.ceil((size / 64) * 96) })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`wrote ${outPath} (${size}x${size})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
