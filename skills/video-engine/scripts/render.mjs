#!/usr/bin/env node
// Render a deterministic HTML page to MP4, frame by frame.
//
// The page must define window.DURATION (seconds) and window.setT(t), a pure function that draws time t.
//
// Usage:
//   node render.mjs --html page.html --out video.mp4
//        [--fps 30] [--width 1920] [--height 1080] [--crf 18] [--workers 4]
//        [--poster 12.5] [--from 0 --to 5] [--keep-frames]
//
// --from/--to render only part of the timeline (quick previews). --workers splits the frames over pages.
// Needs Playwright with Chromium, and ffmpeg on PATH. CHROMIUM_PATH overrides the browser binary.
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const argv = process.argv.slice(2);
const args = new Map();
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith("--")) continue;
  const next = argv[i + 1];
  args.set(argv[i].slice(2), next === undefined || next.startsWith("--") ? true : argv[++i]);
}
const opt = (k, d) => (args.has(k) ? args.get(k) : d);
const html = opt("html"), out = opt("out");
if (!html || !out) {
  console.error("usage: render.mjs --html page.html --out video.mp4 [--fps 30] [--width 1920] [--height 1080] [--workers 4] [--poster T]");
  process.exit(2);
}
const FPS = Number(opt("fps", 30)), W = Number(opt("width", 1920)), H = Number(opt("height", 1080));
const WORKERS = Math.max(1, Number(opt("workers", 4)));

function loadPlaywright() {
  const here = dirname(fileURLToPath(import.meta.url));
  const roots = [process.cwd(), here, ...(process.env.NODE_PATH ? process.env.NODE_PATH.split(":") : []), "/opt/node-tools"];
  for (const root of roots) {
    try { return createRequire(join(root, "noop.js"))("playwright"); } catch { /* next */ }
  }
  throw new Error("Playwright not found: run `npm i -D playwright && npx playwright install chromium`, or set NODE_PATH.");
}
const { chromium } = loadPlaywright();
const exe = process.env.CHROMIUM_PATH || (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const browser = await chromium.launch({ ...(exe ? { executablePath: exe } : {}), args: ["--no-sandbox"] });
const url = pathToFileURL(resolve(html)).href;

async function open() {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on("pageerror", (e) => console.error("page error:", e.message));
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
  return page;
}

const first = await open();
const duration = await first.evaluate(() => window.DURATION);
if (!Number.isFinite(duration) || duration <= 0) throw new Error("the page must set window.DURATION (seconds)");
if (!(await first.evaluate(() => typeof window.setT === "function"))) throw new Error("the page must define window.setT(t)");

const t0 = Number(opt("from", 0)), t1 = Math.min(duration, Number(opt("to", duration)));
const n = Math.round((t1 - t0) * FPS);
const frames = mkdtempSync(join(tmpdir(), "veo-frames-"));
const pages = [first, ...(await Promise.all(Array.from({ length: Math.min(WORKERS, n) - 1 }, open)))];
let next = 0;
const started = Date.now();
await Promise.all(pages.map(async (page) => {
  for (let i = next++; i < n; i = next++) {
    await page.evaluate((t) => window.setT(t), t0 + i / FPS);
    await page.screenshot({ path: join(frames, `f${String(i).padStart(5, "0")}.jpg`), type: "jpeg", quality: 94 });
    if (i % 150 === 0) console.log(`frame ${i}/${n}`);
  }
}));
if (opt("poster") !== undefined) {
  await first.evaluate((t) => window.setT(t), Number(opt("poster")));
  await first.screenshot({ path: out.replace(/\.mp4$/, "") + "-poster.jpg", type: "jpeg", quality: 90 });
}
await browser.close();

mkdirSync(dirname(resolve(out)), { recursive: true });
const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", join(frames, "f%05d.jpg"),
  "-c:v", "libx264", "-crf", String(opt("crf", 18)), "-preset", "medium", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], { stdio: "inherit" });
if (opt("keep-frames")) console.log("frames kept in", frames); else rmSync(frames, { recursive: true, force: true });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`wrote ${out}: ${n} frames, ${(t1 - t0).toFixed(2)} s at ${FPS} fps, ${pages.length} workers, ${((Date.now() - started) / 1000).toFixed(0)} s`);
