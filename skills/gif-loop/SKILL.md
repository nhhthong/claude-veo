---
name: gif-loop
description: Make a short, seamless, looping GIF (4 to 10 s) for a README, docs page, release note or social post - a product moment, a dashboard coming alive, a process diagram, a launch title - built as a deterministic HTML page and encoded to fit a size budget. Use when the user asks for a GIF, an animated preview, a hero animation for a README, or to turn part of a claude-veo video into a GIF.
---

# Looping GIF

Uses the engine in `../video-engine/` (kit and scripts). Read `../video-engine/SKILL.md` first. Working examples: `examples/gifs/` in this repository (dashboard, HTTPS handshake, CI/CD pipeline, launch title).

## Design for a loop
- **One moment, 6 to 8 s.** A GIF shows one idea: numbers counting up, a chart drawing, messages travelling, steps turning green, a title assembling. No storyboard of many scenes.
- **Seamless loop**: wrap everything in `win(t, 0, DURATION, 0.5)` so the frame fades from and back to the bare background; the first and last frames then match.
- **Readable small**: it will be seen at 600 to 800 px wide. Titles 60 px or more and body text 24 px or more in the 1920 design space; few words; strong contrast.
- **GIF-friendly colours**: flat fills and soft gradients compress well; avoid full-screen noise, photos and long blurred motion. The drifting blobs are fine.
- Same style and motion rules as the videos (`../video-engine/references/style.md`).

## Make it
```bash
E=../video-engine   # this skill's sibling folder
node $E/scripts/shots.mjs loop.html sheet.jpg 1 3 5 7 --cols 4 --tile 480   # check
node $E/scripts/gif.mjs --in loop.html --out preview.gif --width 800 --fps 15 --max-mb 3
```
`gif.mjs` also takes an MP4 (`--in demo.mp4 --from 18 --to 25`) to cut a GIF from a finished video. It renders the page at twice the GIF width, builds a palette from the clip, and steps the fps and then the width down until the file fits `--max-mb`.

## Check and deliver
Look at two or three frames of the GIF itself (`ffmpeg -i preview.gif -vf "select='eq(n\,60)'" -frames:v 1 f.png`): banding, dithering noise and unreadable text show only there. Report the size, width and fps. For GitHub READMEs keep each GIF under about 3 MB, or link a poster to the MP4 instead.
