---
name: product-demo
description: Make a short, polished product demo video (MP4) for a tool, app or library by reading the project itself - README, docs, UI strings, routes, CLI help, sample files - and turning its main workflow into animated HTML mock scenes with smooth transitions and dashed arrows. Use when the user asks for a demo, promo, walkthrough, launch or "how it works" video of their product, or for a hero video for a landing page.
---

# Product demo from the codebase

Goal: a 35 to 55 s video that shows **what the tool does**, step by step, so a new user understands every main feature in one watch. It demonstrates functions, not the interface: scenes are clean mocks of the idea (a document, a table, a list, a result), not screenshots.

This skill uses the engine in `../video-engine/` (kit, templates, scripts). Read `../video-engine/SKILL.md` first.

## 1. Read the tool
Find out, from the project and not from guesses:
- **What it is for and who uses it**: README, landing page, `package.json`/`pyproject` description, docs, spec.
- **The main workflow**: the steps a user goes through, in order. Look at the UI routes or wizard steps, menu items, CLI commands and their `--help`, i18n string files (they hold every visible label), tests that walk the happy path (e2e tests are gold).
- **Inputs and outputs**: file types, sample or fixture files, what gets produced (names, formats, where).
- **What makes it different**: offline, speed, privacy, price, platforms. Only claims the project states; check licence and supported platforms before you write them.
- **Brand**: the name, the logo or app icon file, the main colour, the site URL.
Write down the sources for each fact. Anything you could not confirm stays out of the video, or you ask.

## 2. Plan
- One scene per main step, three to six steps. Merge minor options into a panel line ("Missing one? Pick it by hand").
- For each step pick the **visual metaphor**: a document whose blanks become tags, a table whose rows slide in, chips joined by dashed arrows, numbers that count up, cards that fan out and fly into a ZIP or PDF, an image with dashed field boxes, a result filled in by typing.
- Sample data: the project's own fixtures if suitable, otherwise realistic made-up data for the target audience (names, dates, amounts). Use the audience's language for the on-screen text; English for an international audience.
- Show the storyboard (scene, seconds, visual, panel text) to the user when choices are open: audience, language, length, music. Recommend defaults instead of asking open questions.

## 3. Build
Copy `../video-engine/kit/` and `../video-engine/templates/product-demo.html` into a `video/` folder (or where the user wants it). Replace the made-up "Ledgerly" content scene by scene. Keep: the left visual / right panel layout, the brand mark, the step tracker, intro and outro, and the motion recipes in `../video-engine/references/style.md`. Use the project's logo and colour (`--accent`) when it has them.

## 4. Check, render, sound
Follow `../video-engine/references/workflow.md`: `shots.mjs` loop, `render.mjs`, then `mix.mjs`.
- Music: only a file the user provides and has rights to. Otherwise deliver silent and say so.
- Voice-over: write the timed script with `../video-engine/references/voiceover.md` and offer it; mix the clips when the user sends them.

## 5. Deliver
The MP4 (1080p), a 720p web copy if it goes on a site, the poster frame, the HTML source, and the voice-over script. If the video goes into the project (landing page hero, README), follow that repository's rules for branches and pull requests, and check the page where it plays (aspect ratio, size, poster).

## Do not
- Do not invent features, numbers, platforms or prices. Do not show real people's personal data.
- Do not use screenshots of other companies' products or their logos.
- Do not exceed 60 s; cut a step before you speed up the pace.
