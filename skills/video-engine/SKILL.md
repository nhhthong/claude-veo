---
name: video-engine
description: The rendering engine behind claude-veo videos - a CSS/JS kit for deterministic HTML animations, templates, and scripts that screenshot every frame with Playwright and encode with ffmpeg, then mix music and voice-over with ducking. Use it whenever you build, preview, render or add sound to a claude-veo video; product-demo and video-brief call it.
---

# Video engine

A video is one HTML page that draws any moment exactly: the page sets `window.DURATION` and a pure `window.setT(t)`. The scripts step `t` frame by frame, screenshot each frame and encode an MP4. Because nothing depends on real time, every render is identical and any frame can be inspected.

`ENGINE` below means this skill's folder (the one this file is in).

## What is here
| Path | What |
|---|---|
| `kit/veo.css` | The look: tokens (light, and dark via `body.dark`), window mock, panel, chips, tags, tables, tracker, captions |
| `kit/veo.js` | Helpers on `window.Veo`: time (`seg`, `ease`, `eo`, `win`), `el`, `fx` (enter/exit), `arrow` (dashed arrow that draws itself), `curve`, `type`, `count`, `pulse`, `blobs`, `brand`, `panel`, `windowMock`, `tracker` |
| `templates/product-demo.html` | 34 s product demo: intro, four steps (import, match with arrows, report with counters, export into a file), outro |
| `templates/explainer.html` | 15 s dark explainer: title, a diagram that builds in three beats with captions, end line |
| `scripts/shots.mjs` | Contact sheet of chosen times, without rendering: the fast feedback loop |
| `scripts/render.mjs` | Page to MP4 (`--workers`, `--poster`, `--from/--to`) |
| `scripts/mix.mjs` | Music (trim, fades, level) and voice clips at given times, music ducked under the voice |
| `scripts/gif.mjs` | Page or MP4 to a looping GIF under a size budget (palette, fps/width step-down) |
| `references/style.md` | The house style: layout, colours, motion recipes with timings, pace |
| `references/workflow.md` | Step by step from storyboard to delivered MP4, with commands |
| `references/voiceover.md` | How to write a timed voice-over script for ElevenLabs or another TTS |

## Steps
1. Read `references/style.md` and `references/workflow.md` once per task.
2. Copy `kit/` and the closest template into the working folder. Start from the template; do not start from a blank page.
3. Storyboard with timings, then edit the page. Keep the layout grid and the motion recipes from `style.md`.
4. Loop on `shots.mjs` until every sampled frame is clean. Then `render.mjs`, then `mix.mjs` if there is sound.
5. Check the encoded file (`ffprobe`, a contact sheet of the MP4) before you hand it over.

## Rules
- Deterministic only: no timers, CSS animations or transitions, `Date.now()` or `Math.random()` in the page.
- Everything local: fonts, images and the kit load from files, so the render works offline.
- Never ship music or images without rights the user confirmed. Use clearly fictional data unless the user gives real sample data.
- Report what you checked. A contact sheet is not watching the video; say which one you did.
