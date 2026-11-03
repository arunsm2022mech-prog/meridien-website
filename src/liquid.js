// "Liquid meridians": glossy liquid-glass ribbons that flow toward one direction.
// Ribbons merge like liquid where they touch, catch an iridescent rim light,
// gather toward the cursor, and pour in from the left on load.

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  uRes;       // drawing buffer size, px
uniform float uTime;
uniform vec2  uMouse;     // cursor in scene units
uniform float uMouseOn;   // 0..1
uniform float uReveal;    // 0..1 pour-in
uniform float uScroll;    // 0..1 hero exit
uniform vec4  uPath;      // x0, x1, yStart, yEnd
uniform float uSpread;
uniform float uScale;

#define NR 6
const float T  = 0.1353;  // exp(-2): surface threshold

// thin-film colours, tuned to the brand: spark orange, pink, violet, sky, gold
vec3 film(float x) {
  float s = fract(x) * 5.0;
  float f = smoothstep(0.0, 1.0, fract(s));
  vec3 c0 = vec3(0.98, 0.40, 0.10);
  vec3 c1 = vec3(1.00, 0.36, 0.60);
  vec3 c2 = vec3(0.55, 0.38, 1.00);
  vec3 c3 = vec3(0.32, 0.72, 1.00);
  vec3 c4 = vec3(1.00, 0.80, 0.45);
  if (s < 1.0) return mix(c0, c1, f);
  if (s < 2.0) return mix(c1, c2, f);
  if (s < 3.0) return mix(c2, c3, f);
  if (s < 4.0) return mix(c3, c4, f);
  return mix(c4, c0, f);
}

// warm-weighted spectrum for the light the ribbons spill on the background
vec3 ribbonHue(float i) {
  if (i < 0.5) return vec3(0.96, 0.38, 0.11);   // spark orange
  if (i < 1.5) return vec3(1.00, 0.36, 0.55);   // pink
  if (i < 2.5) return vec3(0.55, 0.36, 1.00);   // violet
  if (i < 3.5) return vec3(0.25, 0.50, 1.00);   // electric blue
  if (i < 4.5) return vec3(0.97, 0.79, 0.58);   // sand
  return vec3(0.20, 0.80, 0.85);                // cyan
}

float ribY(float x, float fi, float t) {
  float c = mix(uPath.z, uPath.w, smoothstep(uPath.x, uPath.y, x));
  float off = (fi - 2.5) * 0.082 * uSpread;
  off *= 0.7 + 0.45 * sin(x * 1.15 + t * 0.21 + fi * 1.3);
  float wave = 0.050 * sin(x * (1.7 + 0.23 * fi) - t * (0.30 + 0.045 * fi) + fi * 2.1)
             + 0.018 * sin(x * (4.1 + 0.5 * fi) + t * 0.52 + fi * 0.7);
  // calmer and tighter on the left, behind the text; fanning out toward the right
  float side = smoothstep(-0.6, 0.85, x);
  float y = c + off * mix(0.55, 1.0, side) + wave * uSpread * mix(0.35, 1.0, side);
  // ribbons gather toward the cursor
  float pull = exp(-pow((x - uMouse.x) / 0.24, 2.0)) * exp(-pow((y - uMouse.y) / 0.5, 2.0)) * uMouseOn;
  y = mix(y, uMouse.y + (y - uMouse.y) * 0.22, pull * 0.6);
  return y + uScroll * 0.16;
}

float ribR(float x, float fi, float t) {
  float base = 0.010 + 0.021 * fract(fi * 0.618 + 0.31);
  float r = base * (0.72 + 0.42 * sin(x * 1.6 + fi * 2.7 + t * 0.27));
  float head = mix(-1.7, 2.3, uReveal) - fi * 0.11;
  r *= 1.0 - smoothstep(head - 0.5, head, x);   // pours in from the left
  r *= 1.0 - 0.5 * uScroll;
  return max(r * uScale, 1e-4);
}

vec3 environment(vec3 R, vec2 lm) {
  // soft studio: navy room, warm light from the lower right, cool light from the upper left
  vec3 col = mix(vec3(0.008, 0.020, 0.090), vec3(0.050, 0.090, 0.320), R.y * 0.5 + 0.5);
  col += vec3(1.00, 0.40, 0.08) * pow(max(dot(R, normalize(vec3(0.70, -0.65, 0.25))), 0.0), 2.0) * 2.2;
  col += vec3(0.35, 0.50, 1.00) * pow(max(dot(R, normalize(vec3(-0.65, 0.55, 0.30))), 0.0), 2.5) * 0.9;
  col += vec3(1.0) * exp(-pow((R.x - 0.20 - lm.x * 0.5) / 0.05, 2.0)) * smoothstep(0.3, 0.9, R.y) * 0.35;
  return col;
}

vec3 tonemap(vec3 c) { return 1.0 - exp(-c * 1.35); }

float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5453); }

void main() {
  float H = uRes.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / H;
  float e = 1.25 / H;
  float t = uTime;

  // metaball-style field: ribbons merge like liquid where they touch
  float F0 = 0.0, Fx = 0.0, Fy = 0.0;
  float R0 = 0.0, Rx = 0.0, Ry = 0.0;   // radius-weighted sums, so height follows thickness
  vec3 spill = vec3(0.0);
  for (int i = 0; i < NR; i++) {
    float fi = float(i);
    float ya = ribY(p.x, fi, t);
    float yb = ribY(p.x + e, fi, t);
    float s = (yb - ya) / e;
    float k = inversesqrt(1.0 + s * s);
    float ra = ribR(p.x, fi, t);
    float rb = ribR(p.x + e, fi, t);
    float da = (p.y - ya) * k / ra;
    float db = (p.y - yb) * k / rb;
    float dc = (p.y + e - ya) * k / ra;
    float fa = exp(-2.0 * da * da), fb = exp(-2.0 * db * db), fc = exp(-2.0 * dc * dc);
    F0 += fa; Fx += fb; Fy += fc;
    R0 += fa * ra; Rx += fb * rb; Ry += fc * ra;
    float g = exp(-da * da * 0.035) * smoothstep(0.0, 0.006, ra);
    // dispersed light: warm below each strand, cool above
    spill += g * mix(vec3(0.42, 0.36, 1.00), vec3(1.00, 0.40, 0.12), smoothstep(1.5, -2.5, da));
  }

  float h  = (R0 / max(F0, 1e-5)) * 1.1 * sqrt(max(F0 - T, 0.0));
  float hx = (Rx / max(Fx, 1e-5)) * 1.1 * sqrt(max(Fx - T, 0.0));
  float hy = (Ry / max(Fy, 1e-5)) * 1.1 * sqrt(max(Fy - T, 0.0));
  vec3 n = normalize(vec3(-(hx - h) / e, -(hy - h) / e, 1.0));

  float fw = abs(Fx - F0) + abs(Fy - F0) + 1e-5;
  float cov = smoothstep(-fw, fw, F0 - T);

  // background: deep navy, coloured light spilling from the ribbons
  vec3 bg = mix(vec3(0.006, 0.022, 0.105), vec3(0.030, 0.070, 0.270),
                smoothstep(-0.7, 0.9, p.x * 0.55 - p.y * 0.45 + 0.25));
  bg += spill * 0.07;
  bg *= 1.0 - 0.35 * smoothstep(T * 0.25, T, F0) * (1.0 - cov);  // contact shadow

  // glass
  vec2 lm = uMouse * 0.35 * uMouseOn;
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 R = reflect(-V, n);
  float edge = 1.0 - clamp(n.z, 0.0, 1.0);
  float fres = pow(edge, 1.9);
  vec3 env = environment(R, lm);

  // colour ordered by which way the edge faces, like light split by a prism
  float ang = atan(n.y, n.x) / 6.28318 + 0.5;
  vec3 filmCol = film(ang - 0.375 + edge * 0.25 + 0.04 * sin(t * 0.25 + p.x * 2.0));

  // refraction: the background seen through the glass, bent by the surface
  vec2 q = p + n.xy * 0.12;
  vec3 seen = mix(vec3(0.006, 0.022, 0.105), vec3(0.060, 0.090, 0.360),
                  smoothstep(-0.7, 0.9, q.x * 0.55 - q.y * 0.45 + 0.25));

  vec3 body = mix(vec3(0.004, 0.012, 0.070), vec3(0.030, 0.080, 0.320), n.z);
  body *= 0.35 + 0.65 * smoothstep(-0.6, 0.3, n.y);   // lower edges stay dark so the warm light reads as orange
  vec3 glass = body + seen * 0.4 + env * (0.06 + 0.94 * fres) + filmCol * fres * 1.6;

  // sharp glints: a white key from the upper left (follows the cursor) and a warm one from the right
  vec3 Lk = normalize(vec3(-0.35 + lm.x, 0.62 + lm.y, 0.70));
  vec3 Lw = normalize(vec3(0.75, -0.35, 0.55));
  glass += vec3(1.0, 0.98, 0.95) * pow(max(dot(R, Lk), 0.0), 110.0) * 3.0;
  glass += vec3(1.0, 0.55, 0.22) * pow(max(dot(R, Lw), 0.0), 60.0) * 1.6;

  vec3 col = mix(bg, glass, cov);
  col = tonemap(col);
  col += (hash(gl_FragCoord.xy) - 0.5) * 0.022;   // fine grain against banding
  gl_FragColor = vec4(col, 1.0);
}
`;

export function createLiquid(canvas, { onFail } = {}) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' });
  const state = { reveal: 0, scroll: 0, ok: !!gl };
  if (!gl) { onFail?.(); return state; }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    console.warn('Hero shader unavailable:', err);
    state.ok = false; onFail?.(); return state;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ['uRes', 'uTime', 'uMouse', 'uMouseOn', 'uReveal', 'uScroll', 'uPath', 'uSpread', 'uScale']
    .forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });

  let W = 0, H = 0, portrait = false, quality = 1, ready = false;
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    portrait = W / H < 0.9;
    const dpr = Math.min(window.devicePixelRatio || 1, portrait ? 1.25 : 1.35) * quality;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (ready) draw(performance.now());   // repaint at once: resizing clears the canvas
  }

  // cursor, smoothed
  const mouse = { x: 0.4, y: 0.0, tx: 0.4, ty: 0.0, on: 0, ton: 0 };
  const host = canvas.parentElement;
  host.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left - r.width / 2) / r.height;
    mouse.ty = (r.height / 2 - (e.clientY - r.top)) / r.height;
    mouse.ton = e.pointerType === 'mouse' ? 1 : 0.7;
  });
  host.addEventListener('pointerleave', () => { mouse.ton = 0; });

  let last = performance.now();
  const start = last;
  function draw(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const k = 1 - Math.exp(-dt * 3.2);
    mouse.x += (mouse.tx - mouse.x) * k;
    mouse.y += (mouse.ty - mouse.y) * k;
    mouse.on += (mouse.ton - mouse.on) * (1 - Math.exp(-dt * 2.2));

    const drop = Math.max(0, W / H - 0.46) * 0.4;   // taller phones vs tablets
    const path = portrait ? [-0.34, 0.34, 0.26 - drop, 0.42 - drop] : [-1.0, 0.9, -0.68, 0.14];
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, reduced ? 12.0 : (now - start) / 1000 + 12.0);
    gl.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl.uniform1f(U.uMouseOn, reduced ? 0 : mouse.on);
    gl.uniform1f(U.uReveal, reduced ? 1 : state.reveal);
    gl.uniform1f(U.uScroll, state.scroll);
    gl.uniform4f(U.uPath, path[0], path[1], path[2], path[3]);
    gl.uniform1f(U.uSpread, portrait ? 0.55 : 1.0);
    gl.uniform1f(U.uScale, portrait ? 0.85 : 1.0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // drop resolution on slow GPUs so the motion stays smooth
  let visible = true, raf = 0, slow = 0, frames = 0, prev = 0;
  function loop(now) {
    raf = 0;
    if (!visible || document.hidden) { prev = 0; return; }
    draw(now);
    if (prev) {
      frames++;
      if (now - prev > 28) slow++;
      if (frames >= 45 && now - start > 2500) {
        if (slow > 18 && quality > 0.55) { quality *= 0.8; resize(); }
        frames = 0; slow = 0;
      }
    }
    prev = now;
    raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf && !reduced) raf = requestAnimationFrame(loop); }

  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); }).observe(canvas);
  document.addEventListener('visibilitychange', kick);
  window.addEventListener('resize', resize);
  ready = true;
  resize();
  if (!reduced) kick();

  // let GSAP-driven changes repaint when the loop is paused (reduced motion)
  state.redraw = () => { if (reduced) draw(performance.now()); };
  return state;
}
