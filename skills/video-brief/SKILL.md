---
name: video-brief
description: Make a short animated video (MP4) from the user's own brief - an explainer ("what is Docker?"), a concept or process diagram, a feature announcement, a tutorial step, a social clip - using the claude-veo look with smooth motion, dashed arrows and clean typography. Use when the user describes the video they want rather than asking to demo a codebase.
---

# Video from a brief

This skill uses the engine in `../video-engine/` (kit, templates, scripts). Read `../video-engine/SKILL.md` first.

## 1. Pin down the brief
Settle these, asking only what the request leaves open, each with a recommended default:
| Item | Default |
|---|---|
| Purpose and audience | from the request |
| Length | explainer 15 s; announcement 20 to 30 s; tutorial up to 60 s |
| Format | 16:9, 1920 x 1080 (for social, 1080 x 1920 or 1080 x 1080: write `<div id="stage" style="width:1080px;height:1920px">` and render with `--width 1080 --height 1920`; then re-lay out the scenes, since the templates are composed for 16:9) |
| Language of on-screen text | the user's language |
| Theme | dark for technical topics, light for business and HR |
| Sound | silent, unless the user provides music they have rights to; offer a voice-over script |
Facts in the video must be correct: check anything you are not sure of, and keep claims general rather than invented (no made-up benchmarks).

## 2. Storyboard
Three beats for a 15 s explainer (problem, idea, result), one beat per point for longer videos. Each beat: one visual change and one caption or panel. Write the table (seconds, visual, text) before building.

## 3. Build
Start from the closest template in `../video-engine/templates/`:
- `explainer.html`: title, one diagram that grows, a caption per beat, an end line.
- `product-demo.html`: window mocks with a side panel, for step-by-step flows.
Reuse the kit components and motion recipes (`../video-engine/references/style.md`): `arrow()` for every connection, `fx()` for every entrance, `count()` for numbers, `type()` for text that appears. Draw diagrams with SVG paths in the 1920 x 1080 space and reveal them with `arrow(..., { dash: "1 0", head: false })` for solid lines.

## 4. Check, render, deliver
Follow `../video-engine/references/workflow.md`. Deliver the MP4, the poster, the HTML source, and, when useful, a GIF preview and a voice-over script (`../video-engine/references/voiceover.md`). Say what you checked.

## Do not
- No stock-looking clutter: one idea on screen at a time, generous space, two or three colours.
- No logos or trademarks of others beyond plain names used to refer to them.
- No real people's likeness or voice.
