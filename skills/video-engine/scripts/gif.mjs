#!/usr/bin/env node
// Turn a video page (or an MP4) into a looping GIF that fits a size budget, for READMEs, docs and social posts.
//
// Usage:
//   node gif.mjs --in page.html|video.mp4 --out preview.gif
//        [--from 0 --to 8] [--width 800] [--fps 15] [--colors 128] [--max-mb 3]
//
// A page is rendered first with render.mjs (at twice the GIF width, for sharp downscaling).
// The GIF uses a palette made from its own frames. If it is over --max-mb, the fps and then the width step down.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2), o = {};
for (let i = 0; i < argv.length; i += 2) o[argv[i].replace(/^--/, "")] = argv[i + 1];
if (!o.in || !o.out) { console.error("usage: gif.mjs --in page.html|video.mp4 --out out.gif [--from 0 --to 8 --width 800 --fps 15 --colors 128 --max-mb 3]"); process.exit(2); }
let width = Number(o.width ?? 800), fps = Number(o.fps ?? 15);
const colors = Number(o.colors ?? 128), maxMb = Number(o["max-mb"] ?? 3);
const run = (cmd, args) => { const r = spawnSync(cmd, args, { stdio: "inherit" }); if (r.status !== 0) process.exit(r.status ?? 1); };

const tmp = mkdtempSync(join(tmpdir(), "veo-gif-"));
let src = o.in, ss = [], to = [];
if (/\.html?$/i.test(o.in)) {
  src = join(tmp, "src.mp4");
  const h = Math.round((width * 2 * 9) / 16 / 2) * 2;
  const render = join(dirname(fileURLToPath(import.meta.url)), "render.mjs");
  run("node", [render, "--html", o.in, "--out", src, "--width", String(width * 2), "--height", String(h), "--fps", String(Math.max(fps, 30)),
    ...(o.from ? ["--from", o.from] : []), ...(o.to ? ["--to", o.to] : [])]);
} else {
  if (o.from) ss = ["-ss", o.from];
  if (o.to) to = ["-to", o.to];
}
for (;;) {
  const vf = `fps=${fps},scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=${colors}:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`;
  run("ffmpeg", ["-y", "-loglevel", "error", ...ss, ...to, "-i", src, "-vf", vf, "-loop", "0", o.out]);
  const mb = statSync(o.out).size / 1e6;
  console.log(`${o.out}: ${width}px, ${fps} fps, ${mb.toFixed(2)} MB`);
  if (mb <= maxMb) break;
  if (fps > 12) fps -= 3; else if (width > 480) width -= 80; else { console.log("still over budget at 480px / 12 fps; shorten the clip"); break; }
}
rmSync(tmp, { recursive: true, force: true });
