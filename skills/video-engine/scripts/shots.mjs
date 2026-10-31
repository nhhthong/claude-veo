#!/usr/bin/env node
// Screenshot a video page at given times and tile them into one contact sheet, without rendering the video.
// Use it after every change: it is the fastest way to see the layout, overflow and timing.
//
// Usage: node shots.mjs page.html out-sheet.jpg 2 8.5 15 22 [--width 1920 --height 1080 --cols 2 --tile 800]
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const argv = process.argv.slice(2);
const flags = {}, pos = [];
for (let i = 0; i < argv.length; i++) argv[i].startsWith("--") ? (flags[argv[i].slice(2)] = argv[++i]) : pos.push(argv[i]);
const [html, sheet, ...times] = pos;
if (!html || !sheet || !times.length) { console.error("usage: shots.mjs page.html sheet.jpg T1 T2 ... [--cols 2] [--tile 800]"); process.exit(2); }
const W = Number(flags.width ?? 1920), H = Number(flags.height ?? 1080), cols = Number(flags.cols ?? 2), tile = Number(flags.tile ?? 800);

const here = dirname(fileURLToPath(import.meta.url));
let pw;
for (const root of [process.cwd(), here, ...(process.env.NODE_PATH ? process.env.NODE_PATH.split(":") : []), "/opt/node-tools"]) {
  try { pw = createRequire(join(root, "noop.js"))("playwright"); break; } catch { /* next */ }
}
if (!pw) throw new Error("Playwright not found");
const exe = process.env.CHROMIUM_PATH || (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const browser = await pw.chromium.launch({ ...(exe ? { executablePath: exe } : {}), args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto(pathToFileURL(resolve(html)).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState("networkidle");
const dir = mkdtempSync(join(tmpdir(), "veo-shots-"));
for (const [i, t] of times.entries()) {
  await page.evaluate((t) => window.setT(t), Number(t));
  await page.screenshot({ path: join(dir, `s${String(i).padStart(3, "0")}.png`) });
}
await browser.close();
const rows = Math.ceil(times.length / cols);
const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", "1", "-i", join(dir, "s%03d.png"),
  "-vf", `scale=${tile}:-1,tile=${cols}x${rows}:padding=6:color=white`, "-frames:v", "1", "-q:v", "3", sheet], { stdio: "inherit" });
rmSync(dir, { recursive: true, force: true });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`wrote ${sheet}: ${times.join(", ")} s`);
