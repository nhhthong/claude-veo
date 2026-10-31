# Style: what makes these videos look good

The house style comes from real product demos made with this kit. Keep it unless the user asks for another look.

## Frame
- Design space 1920 x 1080. Render at 1920 x 1080; make 1280 x 720 web copies from that.
- Product demo layout: the **visual on the left** (x 70 to 1150), the **explanation panel on the right** (x 1200 to 1820, top 300), the **brand mark top left**, the **step tracker at the bottom**. The eye always knows where to look.
- Explainer layout: title top left, one diagram in the middle, one caption pill at the bottom per beat.
- Leave air: at least 60 px from every edge for anything that matters. Nothing may overflow its window or the frame.

## Look
- Light theme by default: off-white background `#f4f7fc`, two large blurred colour blobs that drift slowly, white paper windows with a soft long shadow. Dark theme (`<body class="dark">`) for explainers and developer topics.
- One accent colour (blue by default) for steps, tags and arrows; green only for success (ticks, filled values, progress); warm orange only for files and image fields.
- Type: Inter (or the system sans) for UI, 800 weight for titles with tight letter spacing (-0.02em), muted grey for body text. Monospace for tags, file names and code. A serif only inside documents.
- Real-looking content: realistic names, dates, amounts and file names. Made-up but believable; never "Lorem ipsum", never "Item 1".

## Motion (all of it from `veo.js`)
| What | How | Typical timing |
|---|---|---|
| Scene enters | `fx(e, ease(win(t, a, b, 0.7)), -60, 0, 0.97)`: slide 60 px from the left, slight scale | 0.7 s in, 0.7 s out |
| Panel enters | same from the right (`60, 0`), 0.4 to 0.5 s after the visual | 0.7 s |
| List rows | stagger 0.12 to 0.35 s per row, `eo` ease-out, 30 px slide | 0.5 s each |
| Dashed arrow | `arrow(layer, curve(...))`, drawn over 0.6 s, one after another every 0.6 s, a tick pops 0.55 s after each | 0.6 s each |
| Placeholder becomes a value | `.slot` with `.blank` and `.tag`/`.fill` stacked, cross-fade with a 1.4 to 1 scale and a pulse ring | 0.45 s |
| Slow scroll | `translateY(-ease(seg(t, a, b)) * px)` over 3 to 4 s | slow, never jumpy |
| Numbers | `count(e, 0, total, ease(seg(...)))` | 1.5 to 2.5 s |
| Typing | `type(e, text, seg(...))` | about 15 to 25 characters a second |
| Fan out, then gather | cards spread with a small rotation, then shrink into a file icon that bounces once | 1.2 s out, 1 s in |
| Background | blobs drift with `sin`/`cos` of t / 5 to 8 | always |

Rules: ease every move (`ease`, `eo`); never linear except progress bars. One new idea on screen at a time. Exits are faster than entrances. Cross-fade scenes with about 0.2 s of overlap; no hard cuts, no flashy wipes.

## Pace
- Product demo: 35 to 55 s. Intro 3 to 3.5 s, then one scene per step of 6 to 8 s, outro 4 to 5 s. Under 60 s.
- Explainer: 12 to 20 s, three beats.
- A viewer must be able to read every panel twice while it is on screen: about 3 words a second at most.

## Ending
The outro repeats the name, three short benefit pills and the link. Hold the final frame at least 2 s.
