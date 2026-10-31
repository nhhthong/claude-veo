#!/usr/bin/env node
// Put sound on a rendered video: background music (trimmed, faded, levelled) and optional voice-over clips
// placed at given times. While a voice clip plays, the music ducks under it.
//
// Usage:
//   node mix.mjs --video in.mp4 --out out.mp4
//        [--music song.mp3 --music-start 0 --music-volume 0.5 --fade-in 1.2 --fade-out 2.5]
//        [--voice 0.3:01.mp3 --voice 3.6:02.mp3 ... --voice-volume 1.0]
//        [--bitrate 128k]
//
// The video stream is copied, not re-encoded. With voice clips, ducking uses ffmpeg's sidechaincompress.
import { spawnSync } from "node:child_process";

const argv = process.argv.slice(2);
const one = {}, voices = [];
for (let i = 0; i < argv.length; i++) {
  const k = argv[i].replace(/^--/, ""), v = argv[i + 1];
  if (k === "voice") voices.push(v); else one[k] = v;
  i++;
}
if (!one.video || !one.out || (!one.music && !voices.length)) {
  console.error("usage: mix.mjs --video in.mp4 --out out.mp4 [--music m.mp3] [--voice T:clip.mp3 ...]");
  process.exit(2);
}
const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", one.video], { encoding: "utf8" });
const dur = Number(probe.stdout.trim());
if (!Number.isFinite(dur)) { console.error("cannot read the video duration"); process.exit(1); }

const inputs = ["-i", one.video];
const graph = [];
let idx = 1, music = null;
if (one.music) {
  inputs.push("-ss", String(one["music-start"] ?? 0), "-i", one.music);
  const fin = Number(one["fade-in"] ?? 1.2), fout = Number(one["fade-out"] ?? 2.5);
  graph.push(`[${idx}:a]atrim=0:${dur},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=${fin},afade=t=out:st=${Math.max(0, dur - fout)}:d=${fout},volume=${one["music-volume"] ?? 0.5}[m]`);
  music = "[m]"; idx++;
}
const vlabels = [];
for (const spec of voices) {
  const at = spec.indexOf(":");
  const t = Number(spec.slice(0, at)), file = spec.slice(at + 1);
  if (!Number.isFinite(t) || !file) { console.error(`bad --voice ${spec}; use T:file.mp3`); process.exit(2); }
  inputs.push("-i", file);
  const ms = Math.round(t * 1000);
  graph.push(`[${idx}:a]aresample=44100,aformat=channel_layouts=stereo,adelay=${ms}|${ms},volume=${one["voice-volume"] ?? 1}[v${idx}]`);
  vlabels.push(`[v${idx}]`); idx++;
}
let outLabel;
if (vlabels.length) {
  graph.push(`${vlabels.join("")}amix=inputs=${vlabels.length}:normalize=0:duration=longest,apad,atrim=0:${dur}[vo]`);
  if (music) {
    graph.push(`[vo]asplit=2[vo1][vo2]`);
    graph.push(`${music}[vo1]sidechaincompress=threshold=0.03:ratio=8:attack=30:release=500[md]`);
    graph.push(`[md][vo2]amix=inputs=2:normalize=0:duration=first[out]`);
  } else graph.push(`[vo]anull[out]`);
  outLabel = "[out]";
} else outLabel = music;

const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", graph.join(";"),
  "-map", "0:v", "-map", outLabel, "-c:v", "copy", "-c:a", "aac", "-b:a", one.bitrate ?? "128k", "-shortest", "-movflags", "+faststart", one.out], { stdio: "inherit" });
if (r.status !== 0) process.exit(r.status ?? 1);
const vd = spawnSync("ffmpeg", ["-hide_banner", "-i", one.out, "-af", "volumedetect", "-vn", "-f", "null", "-"], { encoding: "utf8" });
const lv = (vd.stderr.match(/(mean|max)_volume: [-\d.]+ dB/g) || []).join(", ");
console.log(`wrote ${one.out}: ${dur.toFixed(2)} s, ${voices.length} voice clip(s)${music ? ", music" : ""}; ${lv}`);
