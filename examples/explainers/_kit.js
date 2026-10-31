// Shared helpers for the example animations. Everything is a pure function of time t.
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));          // 0..1 between a and b
const ease = (p) => p * p * (3 - 2 * p);                     // smoothstep
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const lerp = (a, b, p) => a + (b - a) * p;
const stage = document.getElementById("stage");
const NS = "http://www.w3.org/2000/svg";

function fit() { const s = Math.min(innerWidth / 1280, innerHeight / 720); stage.style.transform = `scale(${s})`; }
addEventListener("resize", fit); fit();

/** Create an absolutely positioned element in the stage. */
function box(cls, html, x, y, w, h, extra = "") {
  const e = document.createElement("div");
  e.className = "abs " + cls;
  if (html) e.innerHTML = html;
  e.style.cssText = `${x !== null ? `left:${x}px;` : ""}${y !== null ? `top:${y}px;` : ""}${w ? `width:${w}px;` : ""}${h ? `height:${h}px;` : ""}${extra}`;
  stage.append(e);
  return e;
}
/** Fade and rise: p in 0..1. */
function show(e, p, dy = 14, dx = 0, scale = 1) {
  e.style.opacity = p;
  e.style.transform = `translate(${(1 - p) * dx}px, ${(1 - p) * dy}px) scale(${lerp(scale, 1, p)})`;
}
/** Visible between a and b with fades of f seconds. */
function window01(t, a, b, f = 0.4) { return Math.min(seg(t, a, a + f), 1 - seg(t, b - f, b)); }
function line(x1, y1, x2, y2, color, width = 3, dash = false) {
  let svg = document.querySelector("svg.layer");
  if (!svg) { svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "layer"); stage.append(svg); }
  const p = document.createElementNS(NS, "path");
  p.setAttribute("fill", "none"); p.setAttribute("stroke", color); p.setAttribute("stroke-width", width);
  p.setAttribute("stroke-linecap", "round"); p.setAttribute("pathLength", "1");
  p.setAttribute("d", `M ${x1} ${y1} L ${x2} ${y2}`);
  if (dash) p.setAttribute("stroke-dasharray", "0.02 0.03");
  svg.append(p);
  return p;
}
function curve(d, color, width = 3) {
  let svg = document.querySelector("svg.layer");
  if (!svg) { svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "layer"); stage.append(svg); }
  const p = document.createElementNS(NS, "path");
  p.setAttribute("fill", "none"); p.setAttribute("stroke", color); p.setAttribute("stroke-width", width);
  p.setAttribute("stroke-linecap", "round"); p.setAttribute("pathLength", "1"); p.setAttribute("d", d);
  svg.append(p);
  return p;
}
/** Draw a path progressively: p in 0..1. */
function draw(p, amount) { p.style.strokeDasharray = "1"; p.style.strokeDashoffset = String(1 - amount); p.style.opacity = amount > 0 ? 1 : 0; }
/** Caption pill for the window [a, b]; returns an updater. */
function caption(html, a, b, color) {
  const e = box("cap", `<span><i class="num" style="background:${color}"></i>${html}</span>`, 0, null, null, null);
  return (t) => show(e, window01(t, a, b, 0.5), 10);
}
