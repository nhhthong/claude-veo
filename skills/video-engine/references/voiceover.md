# Voice-over script (for ElevenLabs or any text-to-speech)

Write the script **after** the storyboard timing is fixed, one line per scene, and hand it to the user as a table. The user makes the audio; you place it with `mix.mjs`.

## Rules
- One file per scene: `01.mp3`, `02.mp3`, ... so each line can be placed at its scene start.
- Each line must fit its scene with 0.5 to 1 s to spare. Budget about 2.5 words a second in English (a little less for languages with longer words).
- Say what the viewer sees, in the same order, with the same words as the panel. Do not read the panel verbatim; add the "why".
- Spell out what a voice would stumble on: no `{{braces}}`, no file extensions unless needed, product names written as they should sound.

## Table format
| File | Scene (s) | Max | Line |
|---|---|---|---|
| 01.mp3 | 0 – 3.4 | 3 s | Ledgerly: from a bank export to an expense report in a minute. |
| 02.mp3 | 3.2 – 10.2 | 6.5 s | Step one: drop in your bank export. Ledgerly reads CSV and Excel, so there is nothing to retype. |

## Settings to suggest
- A natural, warm voice from the provider's library. Never clone a real person's voice without their consent.
- Stability around 50 to 55 %, similarity about 75 %, little or no style exaggeration, speed 1.0 (0.95 if it rushes).
- MP3, 44.1 kHz, 128 kbps.
- Licence: check the provider's terms for the user's plan. Free plans often require attribution or forbid commercial use; say so, do not decide for the user.

## Placing the clips
`node mix.mjs --video v.mp4 --out out.mp4 --music m.mp3 --voice 0.3:01.mp3 --voice 3.5:02.mp3 ...`
Start each clip 0.2 to 0.4 s after its scene starts. If a clip runs past its scene, shorten the line; do not speed up the audio.
