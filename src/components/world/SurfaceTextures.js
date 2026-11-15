import { canvas, rgb } from '@/components/world/PixelAssets';
import GameEngine from '@/components/world/GameEngine';
const IP = GameEngine.project;
const cache = new Map();
const mix = (col, value) => { const v = rgb(col).map(n => Math.max(0, Math.min(255, n + value))); return `rgb(${v.join(',')})`; };
const hash = (x, y, seed) => { const n = Math.imul(x + seed * 19, 374761393) ^ Math.imul(y + seed * 7, 668265263); return ((n ^ (n >>> 13)) >>> 0) % 100; };
function tile(type, color, seed) {
  const key = `${type}|${color}|${seed % 7}`; if (cache.has(key)) return cache.get(key);
  const cv = canvas(64, 33), g = cv.getContext('2d');
  for (let y = 0; y < 32; y++) for (let x = 0; x < 64; x++) {
    const i = (x - 32) / 64 + y / 32, j = y / 32 - (x - 32) / 64;
    if (i < 0 || i >= 1 || j < 0 || j >= 1) continue;
    const n = hash(x, y, seed), edge = i < .025 || j < .025 || i > .975 || j > .975;
    let value = edge ? -17 : Math.floor(n / 25) - 2;
    if (type === 'wood') {
      const plank = Math.floor(j * 4), grain = Math.sin(i * 36 + plank * 2 + seed) + Math.sin(i * 13 + j * 8);
      value = (plank % 2 ? 2 : -2) + Math.round(grain * 2) + (n < 8 ? -4 : 0);
      if ((j * 4) % 1 < .06) value = -19;
      if ((j * 4) % 1 > .93) value = 8;
      if (Math.abs(i - .38 - (plank % 2) * .31) < .015) value -= 12;
    } else if (type === 'carpet') value = ((x + y) % 3 ? 0 : -7) + (n < 20 ? 3 : 0);
    else if (type === 'stone') value += n < 13 ? -7 : n > 94 ? 7 : 0;
    else if (type === 'tile' && !edge) value += i < .045 || j < .045 ? 8 : i > .95 || j > .95 ? -8 : 0;
    g.fillStyle = mix(color, value + (seed % 5) - 2); g.fillRect(x, y, 1, 1);
  }
  cache.set(key, cv); return cv;
}
function paintFloor(c, R, i, j) {
  const F = R.floor, color = F.type === 'wood' || F.type === 'carpet' ? F.c1 : (i + j) % 2 ? F.c1 : F.c2;
  let light = R.light === 'night' ? -3 : 0;
  (R.wall || []).filter(w => w.type === 'window').forEach(w => {
    const along = w.side === 'R' ? i : j, depth = w.side === 'R' ? j : i;
    if (along >= w.p - 1 && along < w.p + w.n + 1 && depth < 5 && R.light !== 'night') light += Math.max(0, 9 - depth * 2);
  });
  const litColor = '#' + rgb(color).map(v => Math.max(0, Math.min(255, v + light)).toString(16).padStart(2, '0')).join('');
  const image = tile(F.type, litColor, i * 7 + j * 13), [x, y] = IP(R, i, j), scale = R.tw / 64;
  c.save(); c.imageSmoothingEnabled = false; c.drawImage(image, x - 32 * scale, y, 64 * scale, 33 * scale); c.restore();
}
function paintWalls(c, R) {
  const scale = R.tw / 64, wh = Math.round(R.wh / scale);
  ['L', 'R'].forEach((side, n) => {
    const count = side === 'L' ? R.h : R.w, color = R.wallc[n];
    for (let p = 0; p < count; p++) {
      const key = `wall|${color}|${p % 3}|${wh}`, cv = cache.get(key) || canvas(32, wh), g = cv.getContext('2d');
      if (!cache.has(key)) {
        for (let y = 0; y < wh; y++) for (let x = 0; x < 32; x++) {
          const noise = hash(x, y, p % 3), panel = y < 35, seam = panel && (x === 2 || x === 29 || y === 8 || y === 32);
          const offset = y > wh - 5 ? -13 : seam ? -14 : panel ? -8 : noise < 14 ? -3 : noise > 93 ? 2 : 0;
          g.fillStyle = mix(color, offset); g.fillRect(x, y, 1, 1);
        }
        cache.set(key, cv);
      }
      const origin = side === 'R' ? IP(R, p, 0) : IP(R, 0, p + 1);
      c.save(); c.imageSmoothingEnabled = false; c.translate(origin[0], origin[1]);
      c.transform(scale, side === 'R' ? scale / 2 : -scale / 2, 0, -scale, 0, 0); c.drawImage(cv, 0, 0); c.restore();
    }
  });
}
function rug(c, R, f) {
  const scale = R.tw / 64, w = f.w || 3, d = f.d || 2, color = f.c || '#7a3546';
  const a = IP(R, f.i, f.j), W = Math.ceil((w + d) * 32), H = Math.ceil((w + d) * 16);
  const key = `rug|${w}|${d}|${color}`; let cv = cache.get(key);
  if (!cv) {
    cv = canvas(W, H + 1); const g = cv.getContext('2d');
    for (let y = 0; y <= H; y++) for (let x = 0; x < W; x++) {
      const i = (x - d * 32) / 64 + y / 32, j = y / 32 - (x - d * 32) / 64;
      if (i < 0 || i >= w || j < 0 || j >= d) continue;
      const border = Math.min(i, j, w - i, d - j), pattern = (Math.floor(i * 8) + Math.floor(j * 8)) % 4;
      g.fillStyle = border < .08 ? '#3e2536' : border < .2 ? '#c9a978' : pattern === 0 ? mix(color, 13) : mix(color, (x + y) % 3 ? 0 : -9);
      g.fillRect(x, y, 1, 1);
    }
    cache.set(key, cv);
  }
  c.save(); c.imageSmoothingEnabled = false; c.drawImage(cv, a[0] - d * 32 * scale, a[1], W * scale, (H + 1) * scale); c.restore();
}
export default function SurfaceTextures() {
  const FDEF = GameEngine.furniture;
  // Replace the old geometric detail pass, not the room shell or its fixture layout.
  window.PIXARCH = null;
  if (FDEF.rug) FDEF.rug.draw = rug;
  if (FDEF.goldrug) FDEF.goldrug.draw = (c, R, f) => rug(c, R, { ...f, c: f.c || '#a98343' });
  const originalPaint = GameEngine.paintRoomStatic, originalWall = GameEngine.wallItem;
  let active = null;
  GameEngine.wallItem = (c, R, w) => {
    if (active && active.room === R && !active.painted) { paintWalls(c, R); active.painted = true; }
    originalWall(c, R, w);
  };
  GameEngine.paintRoomStatic = (c, R) => {
    active = { room: R, painted: false }; originalPaint(c, R); active = null;
    for (let i = 0; i < R.w; i++) for (let j = 0; j < R.h; j++) paintFloor(c, R, i, j);
    c.save(); c.fillStyle = 'rgba(24,16,32,.16)';
    c.beginPath(); [IP(R, 0, 0), IP(R, R.w, 0), IP(R, R.w, .35), IP(R, .35, .35), IP(R, .35, R.h), IP(R, 0, R.h)].forEach(([x, y], n) => n ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); c.restore();
    R.furni.filter(f => FDEF[f.t]?.flat).forEach(f => FDEF[f.t].draw(c, R, f, 0));
  };
  return { paintFloor, paintWalls };
}