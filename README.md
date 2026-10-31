<div align="center">

<img src=".claude-plugin/icon.png" width="88" alt="">

# claude-veo

**Claude Code makes your product demos, explainers and GIFs, from plain HTML.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![CI](https://github.com/nhhthong/claude-veo/actions/workflows/ci.yml/badge.svg)](https://github.com/nhhthong/claude-veo/actions/workflows/ci.yml)
![Claude Code plugin](https://img.shields.io/badge/Claude%20Code-plugin-7c3aed)

<img src="media/dashboard.gif" width="49%" alt="Analytics dashboard: KPIs count up, a chart draws itself"> <img src="media/pipeline.gif" width="49%" alt="CI/CD pipeline: steps turn green while the log types">
<img src="media/https.gif" width="49%" alt="HTTPS handshake explainer"> <img src="media/launch.gif" width="49%" alt="Launch announcement with kinetic type">

</div>

## Install

```text
/plugin marketplace add nhhthong/claude-veo
/plugin install veo@veo-studio
```

Needs Node 18+, [Playwright](https://playwright.dev) with Chromium, and `ffmpeg`.

## Ask

```text
> Make a 45-second demo video of this app for the landing page.
> 15-second explainer: what is Docker? Dark theme.
> A looping README GIF of our dashboard, under 3 MB.
```

| Skill | Makes |
|---|---|
| `/veo:product-demo` | A 35–55 s demo built from **your codebase**: reads README, UI strings, routes, tests; one scene per step |
| `/veo:video-brief` | A video from **your description**: explainers, diagrams, announcements, vertical clips |
| `/veo:gif-loop` | A **seamless GIF** for READMEs and posts, encoded to a size budget |
| `/veo:video-engine` | The shared kit, templates and scripts the others use |

You get the MP4 or GIF, a poster, the HTML source, and a timed voice-over script for ElevenLabs.

## Gallery

| [<img src="media/sheetstamp-demo.jpg" alt="Sheetstamp demo">](media/sheetstamp-demo.mp4) | [<img src="media/ledgerly.jpg" alt="Ledgerly demo">](media/ledgerly.mp4) | [<img src="media/git.jpg" alt="Git explainer">](media/git.mp4) |
| :-: | :-: | :-: |
| Product demo · 49 s | Template · 34 s | Explainer · 15 s |

Sources: [`examples/`](examples) and [`templates/`](skills/video-engine/templates). Click a poster to play.

## How it works

Each video is one HTML page with a pure `setT(t)`: the same `t` always draws the same frame. Playwright screenshots every frame, ffmpeg encodes it.

```text
brief / codebase → storyboard → HTML + kit → shots.mjs (check) → render.mjs → mix.mjs / gif.mjs
```

| Script | Does |
|---|---|
| `shots.mjs` | Contact sheet of chosen moments, in seconds |
| `render.mjs` | Page → MP4, parallel workers, partial renders, poster |
| `mix.mjs` | Music + voice-over clips, music ducks under the voice |
| `gif.mjs` | Page or MP4 → looping GIF under a size budget |

Style rules and motion recipes: [`style.md`](skills/video-engine/references/style.md).

## Notes

- No music or images are added without rights you confirm. Demo data is made up.
- Without the plugin system: `cp -r skills/* ~/.claude/skills/` (keep the folders together).

## License

[MIT](LICENSE) © 2026 nhhthong
