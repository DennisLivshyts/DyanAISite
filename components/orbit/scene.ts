/**
 * The gravity assist as a three.js scene.
 *
 * Built from lib/orbit.ts — the same numbers as the logo — so at progress 1
 * the camera looks straight down the orbital plane and the frame IS the mark:
 * body with its lit crescent, the sphere-of-influence ring with the exit gap,
 * the ribbon thickening on the way out, and the head as the lightest thing.
 *
 * Framework-free: React mounts it, GSAP (Phase 3) drives setProgress().
 * Renders on demand only — nothing runs while nothing changes.
 */

import * as THREE from "three";
import {
  GEO, TONES, RBODY, RSOI, S, LIMB, CLEAR,
  TH_FAR, TH_IN, TH_OUT, TH_CROSS,
  frac, width, world, thetaAt, gradT, speed, range, headRFor,
} from "@/lib/orbit";

const T = TONES.bright;

// Exact hex colours, like the SVG: no linear-space conversion anywhere.
THREE.ColorManagement.enabled = false;

/* ── keyframes ──────────────────────────────────────────────────────────────
 * Where the orbit sits on screen, how big, and how tilted, at each phase.
 * x/y are fractions of the viewport (0,0 top-left); size is the ring's radius
 * as a fraction of the viewport's shorter side; tilt in radians.
 * `th` pins the craft's true anomaly to the phase, so sections can own phases.
 */
export type Key = { th: number; x: number; y: number; size: number; tiltX: number; tiltY: number; rotZ: number };

const DESKTOP: Key[] = [
  { th: TH_FAR,         x: 0.70, y: 0.60, size: 0.30, tiltX: -1.00, tiltY: 0.30, rotZ: 0.00 }, // approach
  { th: TH_IN,          x: 0.74, y: 0.52, size: 0.36, tiltX: -0.70, tiltY: 0.22, rotZ: 0.05 }, // capture: crossing the ring
  { th: 0,              x: 0.76, y: 0.50, size: 0.40, tiltX: -0.45, tiltY: 0.12, rotZ: 0.10 }, // periapsis: the whip
  { th: TH_CROSS,       x: 0.72, y: 0.46, size: 0.34, tiltX: -0.20, tiltY: 0.05, rotZ: 0.05 }, // exit: punching out
  { th: TH_OUT,         x: 0.50, y: 0.42, size: 0.22, tiltX: 0.00,  tiltY: 0.00, rotZ: 0.00 }, // resolve: the mark
];

const MOBILE: Key[] = [
  { th: TH_FAR,   x: 0.62, y: 0.26, size: 0.42, tiltX: -1.00, tiltY: 0.25, rotZ: 0.00 },
  { th: TH_IN,    x: 0.62, y: 0.24, size: 0.46, tiltX: -0.70, tiltY: 0.18, rotZ: 0.05 },
  { th: 0,        x: 0.60, y: 0.22, size: 0.52, tiltX: -0.45, tiltY: 0.10, rotZ: 0.08 },
  { th: TH_CROSS, x: 0.56, y: 0.22, size: 0.46, tiltX: -0.20, tiltY: 0.04, rotZ: 0.04 },
  { th: TH_OUT,   x: 0.50, y: 0.30, size: 0.34, tiltX: 0.00,  tiltY: 0.00, rotZ: 0.00 },
];

/** Ribbon width and head size in flight, relative to the mark (1 at resolve). */
const FLIGHT_SCALE = 0.32;

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2); // inOutQuad

/* ── geometry ─────────────────────────────────────────────────────────────── */

const SAMPLES = 260;

/** Ribbon along the whole flight. aS = position along the flight (0..1), aT = the mark's gradient coordinate. */
function ribbonGeometry(extra: number) {
  const pos: number[] = [];
  const off: number[] = [];
  const aS: number[] = [];
  const aT: number[] = [];
  const pts: [number, number][] = [];
  const ths: number[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const th = thetaAt(i / SAMPLES);
    ths.push(th);
    pts.push(world(th));
  }
  for (let i = 0; i <= SAMPLES; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(SAMPLES, i + 1)];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / L;
    const ny = (b[0] - a[0]) / L;
    const th = ths[i];
    // outside the ring the trail is a hairline; inside it thickens exactly like the mark
    const w = (th > TH_IN ? width(0, 1) : width(Math.min(1, frac(th)), 1)) + extra;
    const [x, y] = pts[i];
    for (const s of [1, -1]) {
      const ox = nx * (w / 2) * s;
      const oy = ny * (w / 2) * s;
      pos.push(x, y, 0);              // centreline; the shader adds the offset
      off.push(ox, oy, 0);
      aS.push(i / SAMPLES);
      aT.push(gradT(x + ox, y + oy)); // gradient coordinate of the mark's edge point
    }
  }
  const idx: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const k = i * 2;
    idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aOff", new THREE.Float32BufferAttribute(off, 3));
  g.setAttribute("aS", new THREE.Float32BufferAttribute(aS, 1));
  g.setAttribute("aT", new THREE.Float32BufferAttribute(aT, 1));
  g.setIndex(idx);
  return g;
}

/** Where along the flight (0..1) the craft is at true anomaly th. */
function sAt(th: number) {
  // thetaAt is monotone decreasing, so bisect
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (thetaAt(mid) > th) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

const glsl = (s: TemplateStringsArray) => s.join("");
const hex = (h: string) => new THREE.Color(h);

/* ── materials ────────────────────────────────────────────────────────────── */

const ribbonVert = glsl`
  uniform float uWidth;    // 1 = the mark's width; slimmer in flight
  attribute vec3 aOff;
  attribute float aS;
  attribute float aT;
  varying float vS;
  varying float vT;
  varying float vViewZ;
  void main() {
    vS = aS;
    vT = aT;
    vec4 mv = modelViewMatrix * vec4(position + aOff * uWidth, 1.0);
    vViewZ = mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const ribbonFrag = glsl`
  uniform float uHead;     // flight position of the craft, 0..1
  uniform float uResolve;  // 0 in flight, 1 = exactly the mark
  uniform float uCarve;    // 1 for the clearance pass
  uniform float uBodyZ;    // view-space z of the body centre
  uniform float uStart;    // flight position of the inbound ring crossing, where the mark's path begins
  uniform vec3 uG1; uniform vec3 uG2; uniform vec3 uG3;
  varying float vS;
  varying float vT;
  varying float vViewZ;
  void main() {
    if (vS > uHead) discard;                       // the path is drawn by the craft, never ahead of it
    if (uCarve > 0.5) {
      if (vViewZ < uBodyZ) discard;                // only carve where the path is in front of the body
      gl_FragColor = vec4(0.0);
      return;
    }
    // the mark's gradient: transparent until .2, g1 by .42, g2 at .76, g3 at 1
    vec3 c = vT < 0.76 ? mix(uG1, uG2, clamp((vT - 0.42) / 0.34, 0.0, 1.0))
                       : mix(uG2, uG3, clamp((vT - 0.76) / 0.24, 0.0, 1.0));
    float markA = clamp((vT - 0.2) / 0.22, 0.0, 1.0);
    // in flight: a trail that fades behind the craft, brightest at the head
    float trail = smoothstep(uHead - 0.45, uHead, vS);
    vec3 flightC = mix(uG1, uG3, trail);
    float flightA = 0.12 + 0.88 * trail;
    // resolving into the mark: the approach outside the ring fades away
    float inMark = step(uStart, vS);
    gl_FragColor = vec4(mix(flightC, c, uResolve), mix(flightA, markA, uResolve) * mix(1.0, inMark, uResolve));
  }
`;

const bodyVert = glsl`
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// The crescent is the mark's limb mask done in screen space: lit where the
// pixel is outside a copy of the disc pushed down-right. From any angle a
// sphere projects to a disc, so this always reads as the logo's body.
const bodyFrag = glsl`
  uniform vec2 uCenterPx;
  uniform float uRadiusPx;
  uniform vec2 uLimbPx;
  uniform float uResolve;
  uniform vec3 uDark; uniform vec3 uLimb;
  varying vec3 vNormal;
  void main() {
    vec2 d = gl_FragCoord.xy - uCenterPx;
    float edge = length(d - uLimbPx) - uRadiusPx;
    float lit = smoothstep(-0.75, 0.75, edge);
    vec3 c = mix(uDark, uLimb * 0.95 + uDark * 0.05, lit);
    // in flight, a soft rim so it reads as a body rather than a sticker
    float rim = pow(1.0 - max(vNormal.z, 0.0), 2.5) * 0.35;
    c += mix(uLimb * rim, vec3(0.0), uResolve);
    gl_FragColor = vec4(c, 1.0);
  }
`;

const ringFrag = glsl`
  uniform vec2 uGapCenter;   // object-space point where the exit crosses the ring
  uniform float uGapRadius;  // 0 until the craft punches through
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vPos;
  void main() {
    if (distance(vPos.xy, uGapCenter) < uGapRadius) discard;
    gl_FragColor = vec4(uColor, uOpacity);
  }
`;

const ringVert = glsl`
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function discTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(64, 64, 63, 0, Math.PI * 2);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

/* ── the scene ────────────────────────────────────────────────────────────── */

export type Telemetry = { phase: string; velocity: number; range: number };

export type OrbitScene = {
  setProgress: (p: number) => void;
  setGap: (g: number) => void;       // 0..1 ring punch-through
  resize: () => void;
  telemetry: () => Telemetry;
  dispose: () => void;
};

export function createOrbitScene(canvas: HTMLCanvasElement, opts: { mobile: boolean }): OrbitScene {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, stencil: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 1, 2000);
  camera.position.set(0, 0, 400);

  const orbit = new THREE.Group();     // positioned/tilted per keyframe
  scene.add(orbit);

  const rBody = RBODY * S;
  const rSoi = RSOI * S;

  // clearance: writes stencil where the path passes in front of the body
  const ribbonUniforms = {
    uHead: { value: 0 }, uResolve: { value: 0 }, uCarve: { value: 0 }, uBodyZ: { value: 0 }, uStart: { value: sAt(TH_IN) }, uWidth: { value: 1 },
    uG1: { value: hex(T.g1) }, uG2: { value: hex(T.g2) }, uG3: { value: hex(T.g3) },
  };
  const clearMat = new THREE.ShaderMaterial({
    vertexShader: ribbonVert, fragmentShader: ribbonFrag,
    uniforms: { ...ribbonUniforms, uCarve: { value: 1 } },
    colorWrite: false, depthWrite: false, depthTest: false, side: THREE.DoubleSide,
    stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp,
  });
  const clearance = new THREE.Mesh(ribbonGeometry(CLEAR * S), clearMat);
  clearance.renderOrder = 0;
  orbit.add(clearance);

  const bodyMat = new THREE.ShaderMaterial({
    vertexShader: bodyVert, fragmentShader: bodyFrag,
    uniforms: {
      uCenterPx: { value: new THREE.Vector2() }, uRadiusPx: { value: 1 }, uLimbPx: { value: new THREE.Vector2() },
      uResolve: { value: 0 }, uDark: { value: hex(T.dark) }, uLimb: { value: hex(T.limb) },
    },
    stencilWrite: true, stencilRef: 1, stencilFunc: THREE.NotEqualStencilFunc,
    stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.KeepStencilOp,
  });
  const body = new THREE.Mesh(new THREE.SphereGeometry(rBody, 64, 48), bodyMat);
  body.renderOrder = 1;
  orbit.add(body);

  const cross = world(TH_CROSS);
  const ringMat = new THREE.ShaderMaterial({
    vertexShader: ringVert, fragmentShader: ringFrag,
    uniforms: {
      uGapCenter: { value: new THREE.Vector2(cross[0], cross[1]) }, uGapRadius: { value: 0 },
      uColor: { value: hex(T.ring) }, uOpacity: { value: T.ringOp },
    },
    transparent: true, depthWrite: false,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(rSoi, GEO.ringW / 2, 10, 220), ringMat);
  ring.renderOrder = 2;
  orbit.add(ring);

  const ribbonMat = new THREE.ShaderMaterial({
    vertexShader: ribbonVert, fragmentShader: ribbonFrag, uniforms: ribbonUniforms,
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
  });
  const ribbonMesh = new THREE.Mesh(ribbonGeometry(0), ribbonMat);
  ribbonMesh.renderOrder = 3;
  orbit.add(ribbonMesh);

  // the planned course, faint, only while approaching
  const coursePts = Array.from({ length: 200 }, (_, i) => {
    const [x, y] = world(TH_FAR + (TH_OUT - TH_FAR) * (i / 199));
    return new THREE.Vector3(x, y, 0);
  });
  const courseMat = new THREE.LineDashedMaterial({ color: hex(T.g2), dashSize: 1.6, gapSize: 2.4, transparent: true, opacity: 0.14, depthWrite: false });
  const course = new THREE.Line(new THREE.BufferGeometry().setFromPoints(coursePts), courseMat);
  course.computeLineDistances();
  course.renderOrder = 2;
  orbit.add(course);

  // head + glow: flat discs like the mark, sprites so they face the camera in flight
  const disc = discTexture();
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: disc, color: hex(T.g2), transparent: true, opacity: T.glowOp, depthWrite: false }));
  glow.scale.setScalar(GEO.glowR * 2);
  glow.renderOrder = 4;
  const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: disc, color: hex(T.g3), transparent: true, depthWrite: false }));
  head.scale.setScalar(headRFor(1) * 2);
  head.renderOrder = 5;
  orbit.add(glow, head);

  /* ── state ── */
  let progress = 0;
  let gap = 0;
  let w = 1, h = 1;
  let th = TH_FAR;
  const keys = opts.mobile ? MOBILE : DESKTOP;
  const sKeys = keys.map((k) => sAt(k.th));

  function keyAt(p: number): Key {
    // p is the flight position (0..1); find the keyframe segment it falls in
    const s = p;
    let i = 0;
    while (i < sKeys.length - 2 && s > sKeys[i + 1]) i++;
    const a = keys[i], b = keys[i + 1];
    const t = ease(Math.min(1, Math.max(0, (s - sKeys[i]) / (sKeys[i + 1] - sKeys[i]))));
    const L = (x: number, y: number) => x + (y - x) * t;
    return { th: 0, x: L(a.x, b.x), y: L(a.y, b.y), size: L(a.size, b.size), tiltX: L(a.tiltX, b.tiltX), tiltY: L(a.tiltY, b.tiltY), rotZ: L(a.rotZ, b.rotZ) };
  }

  const v3 = new THREE.Vector3();
  const v3b = new THREE.Vector3();

  function render() {
    const k = keyAt(progress);
    // place the orbit: size → distance-independent scale via the frustum height at the orbit's depth
    const dist = camera.position.z;
    const frustumH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const pxPerUnit = h / frustumH;
    const ringPx = k.size * Math.min(w, h);
    orbit.scale.setScalar(ringPx / pxPerUnit / rSoi);
    orbit.position.set((k.x - 0.5) * w / pxPerUnit, -(k.y - 0.5) * h / pxPerUnit, 0);
    orbit.rotation.set(k.tiltX, k.tiltY, k.rotZ);
    orbit.updateMatrixWorld(true);

    // the craft
    th = thetaAt(progress);
    const [hx, hy] = world(th);
    head.position.set(hx, hy, 0);
    glow.position.set(hx, hy, 0);
    ribbonUniforms.uHead.value = progress + 0.5 / SAMPLES;

    // resolve: the last stretch flattens everything into the exact mark
    const resolve = THREE.MathUtils.smoothstep(progress, 0.94, 1.0);
    ribbonUniforms.uResolve.value = resolve;
    // at screen size the mark's proportions are heavy: fly slim, grow into the mark at the end
    const slim = THREE.MathUtils.lerp(FLIGHT_SCALE, 1, resolve);
    ribbonUniforms.uWidth.value = slim;
    head.scale.setScalar(headRFor(1) * 2 * slim);
    glow.scale.setScalar(GEO.glowR * 2 * slim);
    bodyMat.uniforms.uResolve.value = resolve;
    courseMat.opacity = 0.14 * (1 - THREE.MathUtils.smoothstep(progress, 0.08, 0.3));
    glow.material.opacity = T.glowOp * (0.6 + 0.4 * resolve) + 0.15 * (1 - resolve);

    ringMat.uniforms.uGapRadius.value = GEO.knock * gap;

    // body crescent + carve depth, in screen space
    body.getWorldPosition(v3);
    v3b.copy(v3).applyMatrix4(camera.matrixWorldInverse);
    clearMat.uniforms.uBodyZ.value = v3b.z - 0.001;
    v3.project(camera);
    const dpr = renderer.getPixelRatio();
    bodyMat.uniforms.uCenterPx.value.set((v3.x * 0.5 + 0.5) * w * dpr, (v3.y * 0.5 + 0.5) * h * dpr);
    const rPx = rBody * orbit.scale.x * (h / (2 * -v3b.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))) * dpr;
    bodyMat.uniforms.uRadiusPx.value = rPx;
    const limbPx = (LIMB * S / rBody) * rPx;
    bodyMat.uniforms.uLimbPx.value.set(limbPx, -limbPx); // SVG pushes the mask down-right; GL y is up

    renderer.clear(true, true, true);
    renderer.render(scene, camera);
  }

  let raf = 0;
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); });
  };

  function resize() {
    w = canvas.clientWidth || window.innerWidth;
    h = canvas.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    schedule();
  }

  resize();

  return {
    setProgress(p) {
      const next = Math.min(1, Math.max(0, p));
      if (next !== progress) { progress = next; schedule(); }
    },
    setGap(g) {
      const next = Math.min(1, Math.max(0, g));
      if (next !== gap) { gap = next; schedule(); }
    },
    resize,
    telemetry() {
      const phase = th > TH_IN ? "Approach" : th > 0 ? "Capture" : th > TH_CROSS ? "Periapsis" : progress < 0.97 ? "Exit" : "Escape";
      return { phase, velocity: speed(th), range: range(th) };
    },
    dispose() {
      cancelAnimationFrame(raf);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      disc.dispose();
      renderer.dispose();
    },
  };
}

/** Progress (0..1) at which the craft reaches each phase anchor — for mapping page sections. */
export const PHASE_PROGRESS = {
  approach: 0,
  ringIn: sAt(TH_IN),
  periapsis: sAt(0),
  ringOut: sAt(TH_CROSS),
  resolve: 1,
};
