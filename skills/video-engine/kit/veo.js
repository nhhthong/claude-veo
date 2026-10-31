// claude-veo kit: helpers for deterministic video pages.
// Rule: everything on screen is a pure function of t (seconds). No timers, no CSS animations or transitions.
// The page sets window.DURATION and window.setT(t); scripts/render.mjs steps t frame by frame.
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const stage = document.getElementById("stage");
  // The stage is 1920x1080 by default; give #stage another width/height inline for vertical or square videos.
  const fit = () => { const k = Math.min(innerWidth / stage.offsetWidth, innerHeight / stage.offsetHeight); stage.style.transform = `scale(${k})`; };
  addEventListener("resize", fit); fit();

  // ---- time
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));            // 0 -> 1 between a and b
  const ease = (p) => p * p * (3 - 2 * p);                       // smoothstep: in and out
  const eo = (p) => 1 - Math.pow(1 - p, 3);                      // ease out: entrances
  const ei = (p) => p * p * p;                                   // ease in: exits
  const lerp = (a, b, p) => a + (b - a) * p;
  const win = (t, a, b, f = 0.6) => Math.min(seg(t, a, a + f), 1 - seg(t, b - f, b)); // on between a and b, fades f

  // ---- elements
  /** Make a div. cls "a" = absolute. css is a style string. */
  function el(cls, html = "", css = "", parent = stage) {
    const e = document.createElement("div");
    e.className = cls; e.innerHTML = html; e.style.cssText = css; parent.append(e); return e;
  }
  /** Entrance/exit: p 0 -> 1. Slides from (dx, dy), scales from sc. Hidden at 0 so it costs nothing. */
  function fx(e, p, dx = 0, dy = 24, sc = 1) {
    e.style.opacity = p;
    e.style.transform = `translate(${(1 - p) * dx}px,${(1 - p) * dy}px) scale(${lerp(sc, 1, p)})`;
    e.style.visibility = p > 0.001 ? "visible" : "hidden";
  }
  function layer() { const s = document.createElementNS(NS, "svg"); s.setAttribute("class", "layer"); stage.append(s); return s; }
  function svg(parent, tag, attrs) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.append(e); return e; }

  /** Dashed arrow that draws itself along path d. Returns draw(p, alpha). */
  function arrow(parent, d, color = "var(--accent)", { width = 3.5, dash = "10 9", head = true } = {}) {
    const guide = svg(parent, "path", { d, fill: "none", stroke: "none" });
    const line = svg(parent, "path", { fill: "none", stroke: color, "stroke-width": width, "stroke-dasharray": dash, "stroke-linecap": "round" });
    const tip = svg(parent, "path", { d: "M -14 -8 L 0 0 L -14 8", fill: "none", stroke: color, "stroke-width": width, "stroke-linecap": "round", "stroke-linejoin": "round" });
    const L = guide.getTotalLength();
    return (p, alpha = 1) => {
      if (p <= 0 || alpha <= 0) { line.setAttribute("d", ""); tip.style.opacity = 0; return; }
      const pts = [];
      for (let i = 0; i <= 48; i++) { const q = guide.getPointAtLength((L * p * i) / 48); pts.push(`${q.x.toFixed(1)} ${q.y.toFixed(1)}`); }
      line.setAttribute("d", "M " + pts.join(" L ")); line.style.opacity = alpha;
      const a = guide.getPointAtLength(Math.max(0, L * p - 2)), b = guide.getPointAtLength(L * p);
      tip.setAttribute("transform", `translate(${b.x} ${b.y}) rotate(${(Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI})`);
      tip.style.opacity = head ? alpha : 0;
    };
  }
  /** A smooth S curve between two points, for arrow(). */
  const curve = (x1, y1, x2, y2) => { const mx = (x1 + x2) / 2; return `M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`; };

  /** Typewriter: shows the first part of text for p 0 -> 1. */
  function type(e, text, p) { e.textContent = text.slice(0, Math.round(text.length * clamp(p))); }
  /** Counter from a to b, formatted. */
  function count(e, a, b, p, fmt = (n) => Math.round(n).toLocaleString("en-US")) { e.textContent = fmt(lerp(a, b, clamp(p))); }
  /** Pulse ring 0 -> 1 -> 0 for emphasis (box-shadow). */
  function pulse(e, p, color = "#2563eb") { const k = Math.sin(clamp(p) * Math.PI); e.style.boxShadow = `0 0 0 ${k * 10}px ${color}33`; }

  // ---- building blocks
  function blobs() {
    const a = el("blob", "", "width:720px;height:720px;background:var(--blob-a);left:-200px;top:-260px");
    const b = el("blob", "", "width:640px;height:640px;background:var(--blob-b);right:-160px;bottom:-240px");
    return (t) => {
      a.style.transform = `translate(${Math.sin(t / 6) * 60}px,${Math.cos(t / 7) * 40}px)`;
      b.style.transform = `translate(${Math.cos(t / 5) * 50}px,${Math.sin(t / 8) * 50}px)`;
    };
  }
  function brand(name, logoHtml) { return el("brand", `${logoHtml || ""}${name}`); }
  function panel(step, title, body) {
    return el("panel", `<div class="step">${step}</div><div class="ptitle">${title}</div><div class="pbody">${body}</div>`);
  }
  /** App window mock. icon: {letter, color} or null for traffic lights. Returns {win, body}. */
  function windowMock(title, { x, y, w, h, icon = null, bodyHeight } = {}) {
    const lead = icon ? `<span class="fileicon" style="background:${icon.color}">${icon.letter}</span>` : `<span class="dots"><i></i><i></i><i></i></span>`;
    const win = el("window", `<div class="winbar">${lead}${title}</div><div class="winbody" style="height:${bodyHeight ?? (h ? h - 58 : "auto")}px"></div>`,
      `left:${x}px;top:${y}px;width:${w}px;${h ? `height:${h}px;` : ""}`);
    return { win, body: win.querySelector(".winbody") };
  }
  /** Bottom tracker for scenes [[start, end], ...]. Returns update(t). */
  function tracker(scenes) {
    const root = el("tracker", scenes.map(() => "<span><i></i></span>").join(""));
    const bars = [...root.querySelectorAll("i")];
    const first = scenes[0][0], last = scenes[scenes.length - 1][1];
    return (t) => {
      fx(root, win(t, first, last, 0.6), 0, 10);
      scenes.forEach(([a, b], i) => (bars[i].style.width = (t >= b - 0.3 ? 100 : seg(t, a, b - 0.3) * 100) + "%"));
    };
  }

  window.Veo = { stage, clamp, seg, ease, eo, ei, lerp, win, el, fx, layer, svg, arrow, curve, type, count, pulse, blobs, brand, panel, windowMock, tracker };
})();
