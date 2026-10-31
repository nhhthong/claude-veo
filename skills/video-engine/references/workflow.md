# Workflow: from storyboard to MP4

## 0. Requirements
- Node 18+, Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`), ffmpeg and ffprobe on PATH.
- Set `ENGINE` to this skill's folder (the folder that holds `kit/`, `scripts/`, `templates/`).

## 1. Set up a working folder
```bash
mkdir -p video && cp -r "$ENGINE/kit" video/ && cp "$ENGINE/templates/product-demo.html" video/demo.html
```
Put images the video shows in `video/assets/` and reference them relatively. Keep everything local: the page must render offline.

## 2. Write the storyboard first
A table, one row per scene: start, end, what is on screen, the panel text (step, title, one or two lines), the motion. Add the timing to `S` at the top of the page. Show the storyboard to the user before building when the request leaves room for choice.

## 3. Build the page
- Every element is created once at load; `setT(t)` only changes opacity, transforms, widths and text. No timers, no CSS transitions or animations, no `Date.now()`, no random numbers (use a seeded function of the index if you need variety).
- Time every element against the scene bounds in `S`, so moving a scene is one edit.
- Fonts and images must be loaded before frames are taken; the scripts wait for `document.fonts.ready` and network idle.

## 4. Look before you render
```bash
node "$ENGINE/scripts/shots.mjs" video/demo.html video/sheet.jpg 2 6 9.5 14 21 27 33
```
Open the sheet. Check: nothing clipped or overflowing, text readable, every scene has its panel, arrows land on their targets, no two ideas fight for attention. Fix and repeat. Pick times in the middle and at the end of each animation, not only at rest.

## 5. Render
```bash
node "$ENGINE/scripts/render.mjs" --html video/demo.html --out video/demo-silent.mp4 --workers 4 --poster 20
```
`--from 10 --to 18` renders a part for a quick look. About 1 to 2 minutes for 35 s at 1080p with 4 workers.

## 6. Sound
```bash
node "$ENGINE/scripts/mix.mjs" --video video/demo-silent.mp4 --out video/demo.mp4 \
  --music music.mp3 --music-volume 0.5 \
  --voice 0.3:vo/01.mp3 --voice 3.6:vo/02.mp3
```
Music only with rights the user confirmed. Voice clips start 0.2 to 0.4 s after their scene begins; the music ducks under them.

## 7. Check and deliver
```bash
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height -of compact video/demo.mp4
ffmpeg -v error -i video/demo.mp4 -vf "select='not(mod(n\,150))',scale=640:-1,tile=3x3" -frames:v 1 video/contact.jpg
```
Look at the contact sheet of the encoded file. For the web: `ffmpeg -i demo.mp4 -vf scale=1280:720 -c:v libx264 -preset slow -crf 24 -c:a aac -b:a 96k -movflags +faststart demo-720.mp4` (about 2 to 3 MB for 45 s). For a README or social preview, a GIF: `ffmpeg -ss 18 -t 8 -i demo.mp4 -vf "fps=12,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse" preview.gif`.

Deliver: the MP4, the poster, the HTML source, and the voice-over script when there is narration. Say what you checked and what you did not (for example, that you watched only the contact sheet, not the whole video with sound).
