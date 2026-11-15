/* EpicurIA · rendu pixel-art isométrique (esprit Habbo)
   - la coque de la salle (sol, murs, fenêtres) est rendue à basse résolution puis agrandie sans lissage
   - chaque meuble est un sprite pixel-art dessiné sur sa propre grille de pixels, alignée sur les cases */
(function () {
  if (!window.FDEF || typeof paintRoomStatic !== 'function' || typeof IP !== 'function' || typeof shade !== 'function') return;

  const AT = 32, AH = 16;                 // pixels d'art par case (largeur / hauteur isométrique)
  const apxOf = (R) => (R.tw || 64) / AT; // px monde par pixel d'art
  const rt = (v) => Math.round(v);
  const cache = new Map();

  /* ---------- primitives pixel ---------- */
  function cv2(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    return [c, g];
  }
  function face(g, pts, col, line) {
    g.beginPath(); g.moveTo(rt(pts[0][0]), rt(pts[0][1]));
    for (let k = 1; k < pts.length; k++) g.lineTo(rt(pts[k][0]), rt(pts[k][1]));
    g.closePath(); g.fillStyle = col; g.fill();
    if (line) { g.strokeStyle = line; g.lineWidth = 1; g.stroke(); }
  }
  function rect(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(rt(x), rt(y), Math.max(1, rt(w)), Math.max(1, rt(h))); }
  function disk(g, cx, cy, r, col) {
    g.fillStyle = col;
    for (let y = -Math.round(r); y <= Math.round(r); y++) {
      const w = Math.round(Math.sqrt(Math.max(0, r * r - y * y)));
      if (w > 0) g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2, 1);
    }
  }
  function box(g, P, i, j, w, d, z0, z1, col) {
    if (z1 - z0 <= 0 || w <= 0 || d <= 0) return;
    const a = P(i, j, z1), b = P(i + w, j, z1), c = P(i + w, j + d, z1), dd = P(i, j + d, z1);
    const b0 = P(i + w, j, z0), c0 = P(i + w, j + d, z0), d0 = P(i, j + d, z0);
    face(g, [dd, c, c0, d0], shade(col, -0.10), shade(col, -0.40));
    face(g, [b, c, c0, b0], shade(col, -0.32), shade(col, -0.52));
    face(g, [a, b, c, dd], col, shade(col, -0.36));
    g.strokeStyle = shade(col, 0.30); g.lineWidth = 1;
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  }
  /* panneau vertical côté "j" (face avant visible) */
  function qj(g, P, i0, i1, j, z0, z1, col) {
    face(g, [P(i0, j, z1), P(i1, j, z1), P(i1, j, z0), P(i0, j, z0)], col, shade(col, -0.42));
  }
  /* panneau vertical côté "i" */
  function qi(g, P, j0, j1, i, z0, z1, col) {
    face(g, [P(i, j0, z1), P(i, j1, z1), P(i, j1, z0), P(i, j0, z0)], col, shade(col, -0.48));
  }
  function plat(g, P, i0, i1, j0, j1, z, col) {
    face(g, [P(i0, j0, z), P(i1, j0, z), P(i1, j1, z), P(i0, j1, z)], col, shade(col, -0.3));
  }
  function shadow(g, P, w, d, a) {
    face(g, [P(0.03, 0.03, 0), P(w - 0.03, 0.03, 0), P(w - 0.03, d - 0.03, 0), P(0.03, d - 0.03, 0)], 'rgba(12,8,20,' + (a || 0.24) + ')');
  }

  /* ---------- sprites ---------- */
  function make(type, w, d, h, paint, f) {
    const key = type + '|' + w + '|' + d + '|' + (f && f.c ? f.c : '') + '|' + (f && f.scr ? f.scr : '') + '|' + ((f && f.goods) ? 1 : 0);
    if (cache.has(key)) return cache.get(key);
    const H = Math.ceil((w + d) * AH / 2 + h + 4);
    const W = Math.ceil((w + d) * AT / 2 + 4);
    const [cvv, g] = cv2(W, H);
    const ox = Math.round(d * AT / 2 + 2), oy = Math.round(H - 2 - (w + d) * AH / 2);
    const P = (i, j, z) => [ox + (i - j) * AT / 2, oy + (i + j) * AH / 2 - z];
    shadow(g, P, w, d);
    paint(g, P, f || {}, w, d);
    const s = { cv: cvv, ox, oy, w: W, h: H };
    cache.set(key, s);
    return s;
  }

  const WOOD = '#8a5a34', WOOD_D = '#5d3a20', METAL = '#4a5060', CREAM = '#efe6d4';

  const PIX = {
    /* ---------- bureau ---------- */
    desk: { w: 2, d: 1, h: 42, paint(g, P, f, w, d) {
      const top = f.c || '#b07a48';
      [[0.10, 0.14], [w - 0.24, 0.14], [0.10, d - 0.26], [w - 0.24, d - 0.26]].forEach(p => box(g, P, p[0], p[1], 0.12, 0.12, 0, 22, '#42301e'));
      box(g, P, 0.08, 0.10, w - 0.16, d - 0.20, 14, 24, shade(top, -0.18));
      box(g, P, 0.04, 0.06, w - 0.08, d - 0.12, 24, 29, top);
      box(g, P, w * 0.5 - 0.30, d * 0.5 - 0.26, 0.10, 0.10, 29, 33, '#20232e');
      qj(g, P, w * 0.5 - 0.34, w * 0.5 + 0.34, d * 0.5 - 0.24, 33, 41, '#181b26');
      const a = P(w * 0.5 - 0.29, d * 0.5 - 0.26, 40);
      rect(g, a[0], a[1] + 2, 18, 6, '#5fd0e6');
      rect(g, a[0] + 2, a[1] + 4, 7, 2, '#a9f2ff');
      box(g, P, 0.22, 0.42, 0.42, 0.24, 29, 30, '#2b2f3a');
      box(g, P, w - 0.72, d - 0.34, 0.16, 0.16, 29, 32, '#f2f2f2');
    } },
    /* ---------- assises ---------- */
    chair: { w: 1, d: 1, h: 32, paint(g, P, f) {
      const col = f.c || '#2a3046';
      [[0.16, 0.16], [0.72, 0.16], [0.16, 0.72], [0.72, 0.72]].forEach(p => box(g, P, p[0], p[1], 0.10, 0.10, 0, 12, '#20242f'));
      box(g, P, 0.14, 0.14, 0.72, 0.72, 12, 17, col);
      box(g, P, 0.14, 0.14, 0.72, 0.14, 17, 31, shade(col, -0.06));
      box(g, P, 0.14, 0.26, 0.10, 0.10, 17, 24, shade(col, -0.2));
      box(g, P, 0.76, 0.26, 0.10, 0.10, 17, 24, shade(col, -0.2));
      rect(g, P(0.3, 0.15, 29)[0], P(0.3, 0.15, 29)[1], 16, 2, shade(col, 0.22));
    } },
    sofa: { w: 2, d: 1, h: 34, paint(g, P, f, w, d) {
      const col = f.c || '#2a5bd7';
      [[0.10, 0.20], [w - 0.22, 0.20], [0.10, d - 0.30], [w - 0.22, d - 0.30]].forEach(p => box(g, P, p[0], p[1], 0.12, 0.12, 0, 5, '#241a12'));
      box(g, P, 0.04, 0.10, w - 0.08, d - 0.20, 5, 16, shade(col, -0.08));
      const n = Math.max(2, Math.round(w * 2));
      for (let k = 0; k < n; k++) {
        const cw = (w - 0.10) / n;
        box(g, P, 0.05 + k * cw, 0.26, cw - 0.04, d - 0.40, 16, 20, shade(col, k % 2 ? 0.06 : 0.12));
      }
      box(g, P, 0.04, 0.10, w - 0.08, 0.26, 16, 33, col);
      box(g, P, 0.10, 0.14, w - 0.20, 0.06, 24, 27, shade(col, 0.16));
      box(g, P, 0.02, 0.10, 0.16, d - 0.20, 5, 25, shade(col, -0.16));
      box(g, P, w - 0.18, 0.10, 0.16, d - 0.20, 5, 25, shade(col, -0.16));
      plat(g, P, 0.02, 0.18, 0.10, d - 0.10, 25, shade(col, 0.1));
      plat(g, P, w - 0.18, w - 0.02, 0.10, d - 0.10, 25, shade(col, 0.1));
    } },
    armchair: { w: 1, d: 1, h: 34, paint(g, P, f) {
      const col = f.c || '#6a3fc0';
      [[0.12, 0.20], [0.74, 0.20], [0.12, 0.72], [0.74, 0.72]].forEach(p => box(g, P, p[0], p[1], 0.12, 0.12, 0, 5, '#241a12'));
      box(g, P, 0.06, 0.12, 0.88, 0.78, 5, 16, shade(col, -0.08));
      box(g, P, 0.16, 0.34, 0.68, 0.50, 16, 20, shade(col, 0.10));
      box(g, P, 0.06, 0.12, 0.88, 0.24, 16, 33, col);
      box(g, P, 0.04, 0.12, 0.16, 0.78, 5, 24, shade(col, -0.16));
      box(g, P, 0.80, 0.12, 0.16, 0.78, 5, 24, shade(col, -0.16));
      plat(g, P, 0.04, 0.20, 0.12, 0.90, 24, shade(col, 0.1));
      plat(g, P, 0.80, 0.96, 0.12, 0.90, 24, shade(col, 0.1));
      rect(g, P(0.3, 0.13, 31)[0], P(0.3, 0.13, 31)[1], 12, 2, shade(col, 0.24));
    } },
    bench: { w: 2, d: 1, h: 22, paint(g, P, f, w) {
      box(g, P, 0.10, 0.28, 0.12, 0.44, 0, 14, '#3a3a42');
      box(g, P, w - 0.22, 0.28, 0.12, 0.44, 0, 14, '#3a3a42');
      box(g, P, 0.02, 0.20, w - 0.04, 0.60, 14, 19, '#9a6633');
      box(g, P, 0.02, 0.20, w - 0.04, 0.10, 19, 22, '#b07a48');
    } },
    /* ---------- tables ---------- */
    table: { w: 2, d: 2, h: 24, paint(g, P, f, w, d) {
      [[0.24, 0.24], [w - 0.34, 0.24], [0.24, d - 0.34], [w - 0.34, d - 0.34]].forEach(p => box(g, P, p[0], p[1], 0.12, 0.12, 0, 18, '#4a3020'));
      box(g, P, 0.06, 0.06, w - 0.12, d - 0.12, 18, 23, f.c || '#e9e4da');
      box(g, P, 0.28, 0.34, 0.30, 0.26, 23, 25, '#ffffff');
      box(g, P, w - 0.66, d - 0.62, 0.24, 0.22, 23, 26, '#2a5bd7');
      box(g, P, w - 0.40, 0.30, 0.18, 0.16, 23, 25, '#c8322b');
    } },
    longtable: { w: 4, d: 2, h: 26, paint(g, P, f, w, d) {
      [[0.20, 0.24], [w - 0.32, 0.24], [0.20, d - 0.36], [w - 0.32, d - 0.36]].forEach(p => box(g, P, p[0], p[1], 0.14, 0.14, 0, 20, '#3a2010'));
      box(g, P, 0.04, 0.06, w - 0.08, d - 0.12, 20, 25, f.c || '#6b4426');
      for (let k = 0; k < w - 1; k++) {
        box(g, P, 0.5 + k, d * 0.5 - 0.14, 0.34, 0.24, 25, 26, '#f4f1ea');
        box(g, P, 0.66 + k, d * 0.5 + 0.24, 0.10, 0.10, 25, 28, '#d8d4c8');
      }
    } },
    /* ---------- rangements ---------- */
    shelf: { w: 1, d: 1, h: 62, paint(g, P) {
      box(g, P, 0.06, 0.06, 0.88, 0.88, 0, 4, '#3a2414');
      box(g, P, 0.06, 0.06, 0.88, 0.10, 4, 60, '#6e4a2a');
      box(g, P, 0.06, 0.84, 0.88, 0.10, 4, 60, '#7d5531');
      box(g, P, 0.06, 0.06, 0.10, 0.88, 4, 60, '#5a3a20');
      qj(g, P, 0.14, 0.86, 0.16, 6, 58, '#3a2414');
      const bc = ['#c8433a', '#2f5fb3', '#e0a030', '#2f8f5b', '#6b4bb3', '#e8e2d2', '#14909e'];
      let n = 0;
      [8, 24, 40, 50].forEach((z, ri) => {
        plat(g, P, 0.14, 0.86, 0.16, 0.86, z, '#8a5f38');
        for (let k = 0; k < 5; k++) {
          const w = 0.10 + (k % 3) * 0.015, h = 9 + ((k + ri) % 3) * 2;
          box(g, P, 0.18 + k * 0.14, 0.30, w, 0.16, z + 1, z + 1 + h, bc[(k + ri * 2) % bc.length]);
          n++;
        }
      });
      box(g, P, 0.06, 0.06, 0.88, 0.10, 60, 62, '#a8763f');
    } },
    counter: { w: 3, d: 1, h: 30, paint(g, P, f, w, d) {
      box(g, P, 0, 0.08, w, d - 0.16, 0, 20, f.c || '#7a4a26');
      box(g, P, 0.04, 0.12, w - 0.08, d - 0.24, 6, 8, '#c9a24a');
      box(g, P, 0.04, 0.12, w - 0.08, d - 0.24, 14, 16, '#c9a24a');
      box(g, P, -0.04, 0.02, w + 0.08, d + 0.04, 20, 25, '#c9a24a');
      box(g, P, -0.02, 0.04, w + 0.04, d - 0.02, 25, 27, '#7a4a26');
      if (f.goods) {
        const cols = ['#2a5bd7', '#ffc928', '#1f8f5a', '#c8322b', '#6b4bb3'];
        for (let k = 0; k < Math.round(w * 2); k++) {
          box(g, P, 0.2 + k * (w - 0.4) / Math.round(w * 2), 0.34, 0.22, 0.22, 27, 27 + 6 + (k % 3) * 4, cols[k % 5]);
        }
      } else {
        box(g, P, 0.3, 0.36, 0.18, 0.18, 27, 32, '#d8d4c8');
        box(g, P, w - 0.6, 0.42, 0.16, 0.16, 27, 30, '#2a5bd7');
      }
    } },
    bar: { w: 2, d: 1, h: 32, paint(g, P, f, w, d) {
      box(g, P, 0, 0.06, w, d - 0.12, 0, 22, '#2a1838');
      box(g, P, 0.06, 0.12, w - 0.12, d - 0.24, 8, 10, '#c9a24a');
      box(g, P, 0.06, 0.12, w - 0.12, d - 0.24, 16, 18, '#c9a24a');
      box(g, P, -0.04, 0.02, w + 0.08, d + 0.02, 22, 26, '#3a2448');
      plat(g, P, -0.02, w + 0.02, 0.04, d, 26, '#c9a24a');
      [['#7a1f2a', 0.3], ['#2a6a3a', 0.55], ['#c9a24a', 0.8], ['#bfe6ff', 1.05], ['#e0901f', 1.3]].forEach(b => {
        box(g, P, b[1], 0.42, 0.10, 0.10, 27, 33, b[0]);
        box(g, P, b[1] + 0.02, 0.44, 0.06, 0.06, 33, 34, shade(b[0], 0.4));
      });
    } },
    cooler: { w: 1, d: 1, h: 34, paint(g, P) {
      box(g, P, 0.28, 0.28, 0.44, 0.44, 0, 18, '#dfe6ec');
      box(g, P, 0.26, 0.26, 0.48, 0.48, 18, 21, '#c3ccd6');
      box(g, P, 0.40, 0.40, 0.20, 0.20, 21, 30, 'rgba(120,190,255,.9)');
      box(g, P, 0.36, 0.36, 0.28, 0.28, 21, 22, '#8fc4ea');
      rect(g, P(0.42, 0.42, 16)[0], P(0.42, 0.42, 16)[1], 4, 3, '#5be3c9');
    } },
    /* ---------- luminaires & déco ---------- */
    lamp: { w: 1, d: 1, h: 60, paint(g, P) {
      box(g, P, 0.34, 0.34, 0.32, 0.32, 0, 4, '#2f3540');
      box(g, P, 0.45, 0.45, 0.10, 0.10, 4, 46, '#3a4150');
      box(g, P, 0.26, 0.26, 0.48, 0.48, 46, 52, '#e8d6a8');
      box(g, P, 0.30, 0.30, 0.40, 0.40, 52, 54, '#ffe9b8');
      box(g, P, 0.22, 0.22, 0.56, 0.56, 44, 46, '#c9b284');
    } },
    trophy: { w: 1, d: 1, h: 48, paint(g, P) {
      box(g, P, 0.12, 0.12, 0.76, 0.76, 0, 26, '#2a2440');
      box(g, P, 0.10, 0.10, 0.80, 0.80, 26, 29, '#4a4066');
      qj(g, P, 0.14, 0.86, 0.18, 29, 46, 'rgba(150,210,255,.22)');
      qi(g, P, 0.14, 0.86, 0.86, 29, 46, 'rgba(150,210,255,.16)');
      box(g, P, 0.40, 0.40, 0.20, 0.20, 29, 32, '#c9a24a');
      box(g, P, 0.44, 0.44, 0.12, 0.12, 32, 36, '#e0b64a');
      disk(g, ...P(0.5, 0.5, 40), 6, '#ffc928');
      disk(g, ...P(0.5, 0.5, 40), 4, '#ffe680');
    } },
    globe: { w: 1, d: 1, h: 40, paint(g, P) {
      box(g, P, 0.30, 0.30, 0.40, 0.40, 0, 4, '#8a6a2a');
      box(g, P, 0.45, 0.45, 0.10, 0.10, 4, 20, '#c9a24a');
      disk(g, ...P(0.5, 0.5, 32), 11, '#1f6fa8');
      const p0 = P(0.5, 0.5, 32);
      rect(g, p0[0] - 7, p0[1] - 6, 5, 6, '#3fae6a');
      rect(g, p0[0] + 1, p0[1] - 3, 6, 5, '#3fae6a');
      rect(g, p0[0] - 3, p0[1] + 2, 4, 4, '#2f9b4a');
      rect(g, p0[0] - 8, p0[1] - 8, 3, 2, '#7fe6a0');
    } },
    plant: { w: 1, d: 1, h: 34, paint(g, P) {
      box(g, P, 0.28, 0.28, 0.44, 0.44, 0, 14, '#b5653a');
      box(g, P, 0.26, 0.26, 0.48, 0.48, 14, 16, '#c4794b');
      rect(g, P(0.34, 0.34, 15)[0] - 1, P(0.34, 0.34, 15)[1], 18, 3, '#5b3a22');
      const c = P(0.5, 0.5, 16);
      disk(g, c[0], c[1] - 10, 9, '#2c8a3e');
      disk(g, c[0] - 4, c[1] - 13, 6, '#3fae55');
      disk(g, c[0] + 5, c[1] - 8, 5, '#56c46a');
      disk(g, c[0] - 2, c[1] - 17, 4, '#4cbb63');
    } },
    bigplant: { w: 1, d: 1, h: 62, paint(g, P) {
      box(g, P, 0.24, 0.24, 0.52, 0.52, 0, 18, '#e8e2d2');
      box(g, P, 0.22, 0.22, 0.56, 0.56, 18, 20, '#cfc7b3');
      const c = P(0.5, 0.5, 20);
      box(g, P, 0.47, 0.47, 0.06, 0.06, 20, 34, '#4a3020');
      disk(g, c[0], c[1] - 34, 11, '#2c8a3e');
      disk(g, c[0] - 8, c[1] - 30, 7, '#3fae55');
      disk(g, c[0] + 9, c[1] - 28, 7, '#2f9b4a');
      disk(g, c[0] - 2, c[1] - 44, 8, '#56c46a');
      disk(g, c[0] + 10, c[1] - 40, 5, '#4cbb63');
      disk(g, c[0] - 11, c[1] - 40, 5, '#3fae55');
    } },
    palm: { w: 1, d: 1, h: 84, paint(g, P) {
      box(g, P, 0.28, 0.28, 0.44, 0.44, 0, 14, '#b5653a');
      box(g, P, 0.26, 0.26, 0.48, 0.48, 14, 16, '#c4794b');
      for (let k = 0; k < 7; k++) box(g, P, 0.46 + k * 0.008, 0.46, 0.08, 0.08, 16 + k * 9, 25 + k * 9, k % 2 ? '#6a4a2a' : '#7d5a33');
      const c = P(0.52, 0.52, 80);
      const fr = [[-22, -4, 16, 5], [22, -4, 16, 5], [-14, -14, 12, 5], [14, -14, 12, 5], [-4, -20, 9, 6], [4, -18, 8, 6]];
      fr.forEach((v, k) => rect(g, c[0] + v[0], c[1] + v[1], v[2], v[3], k % 2 ? '#2c8a3e' : '#46b45c'));
      rect(g, c[0] - 4, c[1] - 24, 8, 4, '#56c46a');
    } },
    /* ---------- écrans & panneaux ---------- */
    screen: { w: 1, d: 1, h: 62, paint(g, P, f) {
      const sc = f.scr || '#0b2531';
      box(g, P, 0.40, 0.40, 0.20, 0.20, 0, 22, '#2f3540');
      box(g, P, 0.28, 0.34, 0.44, 0.34, 22, 26, '#1a1d26');
      box(g, P, 0.04, 0.42, 0.92, 0.16, 26, 62, '#0a0c14');
      qj(g, P, 0.10, 0.90, 0.56, 30, 58, sc);
      const x0 = P(0.12, 0.57, 32), x1 = P(0.88, 0.57, 32);
      const cols = sc === '#3a0a10' ? ['#ff6b5a', '#e23a3a', '#ffb0a0'] : ['#5be3c9', '#ffc928', '#7fd48a'];
      for (let k = 0; k < 5; k++) {
        const bx = x0[0] + 3 + k * 5;
        const hh = 5 + ((k * 7) % 12);
        rect(g, bx, x1[1] - 2 - hh, 3, hh, cols[k % 3]);
      }
      rect(g, x0[0], x0[1] + 2, 24, 1, 'rgba(255,255,255,.35)');
    } },
    board: { w: 1, d: 1, h: 56, paint(g, P) {
      box(g, P, 0.14, 0.44, 0.10, 0.10, 0, 30, '#33363f');
      box(g, P, 0.78, 0.44, 0.10, 0.10, 0, 30, '#33363f');
      box(g, P, 0.06, 0.34, 0.88, 0.16, 26, 54, '#1b1a26');
      qj(g, P, 0.10, 0.90, 0.50, 29, 51, '#f6f2e6');
      const x0 = P(0.14, 0.51, 31);
      [['#e23a3a', 6], ['#ffc928', 10], ['#2f8f5b', 4], ['#2a5bd7', 8]].forEach((v, k) => rect(g, x0[0] + 2 + k * 6, x0[1] + 18 - v[1], 4, v[1], v[0]));
      rect(g, x0[0] + 2, x0[1] + 4, 26, 1, '#8a8a96');
      rect(g, x0[0] + 2, x0[1] + 8, 20, 1, '#8a8a96');
    } },
    kiosk: { w: 1, d: 1, h: 40, paint(g, P) {
      box(g, P, 0.26, 0.26, 0.48, 0.48, 0, 24, '#2a2f45');
      box(g, P, 0.24, 0.24, 0.52, 0.52, 24, 27, '#14121e');
      box(g, P, 0.20, 0.24, 0.60, 0.20, 27, 38, '#1a1d2a');
      qj(g, P, 0.24, 0.76, 0.44, 30, 36, '#5be3c9');
      rect(g, P(0.44, 0.30, 34)[0], P(0.44, 0.30, 34)[1], 6, 1, '#0d1420');
    } },
    server: { w: 1, d: 1, h: 58, paint(g, P) {
      box(g, P, 0.06, 0.14, 0.88, 0.72, 0, 56, '#1d2130');
      qj(g, P, 0.10, 0.90, 0.86, 4, 54, '#151824');
      for (let r = 0; r < 8; r++) {
        const z = 8 + r * 6;
        rect(g, P(0.16, 0.87, z)[0], P(0.16, 0.87, z)[1], 24, 1, '#2a3046');
        rect(g, P(0.72, 0.87, z + 1)[0], P(0.72, 0.87, z + 1)[1], 3, 2, r % 3 ? '#5be37a' : '#e23a3a');
      }
    } },
    tv: { w: 2, d: 1, h: 66, paint(g, P, f, w, d) {
      box(g, P, 0.66, 0.30, 0.68, 0.28, 0, 8, '#15171f');
      box(g, P, 0.30, 0.30, 1.40, 0.30, 8, 12, '#1d1b26');
      box(g, P, 0.04, 0.36, w - 0.08, 0.22, 12, 64, '#08090f');
      qj(g, P, 0.10, w - 0.10, 0.57, 16, 60, '#2a3a7a');
      const c0 = P(0.12, 0.58, 20);
      ['#ff8a3a', '#ffd23a', '#5be3c9', '#c86bff'].forEach((c, k) => rect(g, c0[0] + 3 + k * 8, c0[1] + 8 - (k % 2) * 6, 6, 14 + (k % 3) * 6, c));
      rect(g, c0[0] + 2, c0[1] + 2, w * 15 - 6, 2, 'rgba(255,255,255,.5)');
    } },
    aquarium: { w: 2, d: 1, h: 48, paint(g, P, f, w, d) {
      box(g, P, 0.02, 0.14, w - 0.04, 0.72, 0, 24, '#2a2440');
      box(g, P, 0.02, 0.14, w - 0.04, 0.72, 24, 26, '#3a3156');
      box(g, P, 0.06, 0.18, w - 0.12, 0.64, 26, 46, 'rgba(79,179,232,.75)');
      box(g, P, 0.06, 0.18, w - 0.12, 0.10, 26, 46, 'rgba(160,230,255,.55)');
      rect(g, P(0.3, 0.5, 30)[0], P(0.3, 0.5, 30)[1], 5, 2, '#ff8a3a');
      rect(g, P(1.2, 0.4, 36)[0], P(1.2, 0.4, 36)[1], 4, 2, '#ffd23a');
      rect(g, P(1.5, 0.6, 32)[0], P(1.5, 0.6, 32)[1], 4, 2, '#ff4f7a');
      box(g, P, 0.22, 0.30, 0.10, 0.10, 26, 34, '#2c8a3e');
      box(g, P, 1.5, 0.55, 0.08, 0.08, 26, 32, '#3fae55');
      plat(g, P, 0.06, w - 0.06, 0.18, 0.82, 27, '#c9b78a');
    } },
    arcade: { w: 1, d: 1, h: 62, paint(g, P) {
      box(g, P, 0.12, 0.12, 0.76, 0.76, 0, 56, '#2a1858');
      box(g, P, 0.10, 0.10, 0.80, 0.80, 56, 60, '#3b2575');
      qj(g, P, 0.18, 0.82, 0.86, 30, 52, '#0d0a20');
      qj(g, P, 0.22, 0.78, 0.85, 33, 49, '#5be3c9');
      rect(g, P(0.34, 0.84, 42)[0], P(0.34, 0.84, 42)[1], 8, 4, '#ff6ad5');
      box(g, P, 0.16, 0.60, 0.68, 0.26, 24, 30, '#3b2575');
      box(g, P, 0.24, 0.66, 0.10, 0.10, 30, 32, '#e23a3a');
      box(g, P, 0.42, 0.66, 0.10, 0.10, 30, 32, '#ffc928');
    } },
    /* ---------- spécial ---------- */
    fountain: { w: 2, d: 2, h: 34, paint(g, P, f, w, d) {
      box(g, P, 0, 0, w, d, 0, 12, '#b8b0c8');
      box(g, P, 0.10, 0.10, w - 0.20, d - 0.20, 12, 13, '#3a7bd5');
      plat(g, P, 0.14, w - 0.14, 0.14, d - 0.14, 12, '#56a8ee');
      box(g, P, 0.40, 0.40, 0.20, 0.20, 12, 26, '#c8c0d8');
      disk(g, ...P(0.5, 0.5, 28), 7, '#d8d2e4');
      disk(g, ...P(0.5, 0.5, 30), 4, 'rgba(190,230,255,.9)');
      rect(g, P(0.5, 0.9, 14)[0] - 2, P(0.5, 0.9, 14)[1], 3, 6, 'rgba(210,240,255,.85)');
      rect(g, P(1.1, 0.5, 14)[0], P(1.1, 0.5, 14)[1], 3, 5, 'rgba(210,240,255,.7)');
    } },
    fireplace: { w: 2, d: 1, h: 46, paint(g, P, f, w, d) {
      box(g, P, 0, 0.14, w, 0.72, 0, 34, '#b8ac9a');
      box(g, P, -0.04, 0.10, w + 0.08, 0.80, 34, 38, '#8a7e6c');
      box(g, P, -0.04, 0.10, w + 0.08, 0.14, 38, 42, '#cbbfab');
      box(g, P, 0.42, 0.14, w - 0.84, 0.34, 6, 30, '#160e0c');
      box(g, P, 0.42, 0.16, w - 0.84, 0.10, 30, 31, '#3a2018');
      for (let k = 0; k < 4; k++) box(g, P, 0.55 + k * 0.28, 0.30, 0.16, 0.10, 6, 10, '#5a3a22');
      const c = P(w / 2, 0.35, 10);
      disk(g, c[0], c[1], 8, '#e2561f');
      disk(g, c[0], c[1] - 3, 5, '#ff9a2a');
      disk(g, c[0], c[1] - 5, 3, '#ffd75a');
    }, anim(c, R, f, time, apx) {
      const wpx = 6 * apx;
      for (let k = 0; k < 3; k++) {
        const z = (12 + Math.abs(Math.sin(time * 7 + k * 1.7)) * 10) * apx;
        const a = IP(R, f.i + 0.72 + k * 0.28, f.j + 0.34, z);
        c.fillStyle = k === 1 ? '#ffd75a' : '#ff9a2a';
        c.fillRect(Math.round(a[0]), Math.round(a[1]), Math.max(1, Math.round(wpx * 0.4)), Math.max(1, Math.round(wpx * 0.5)));
      }
    } },
    piano: { w: 2, d: 1, h: 40, paint(g, P, f, w, d) {
      [[0.20, 0.24], [w - 0.34, 0.24], [w / 2 - 0.07, 0.72]].forEach(p => box(g, P, p[0], p[1], 0.14, 0.14, 0, 18, '#15151c'));
      box(g, P, 0.02, 0.12, w - 0.04, 0.72, 18, 30, '#0d0d12');
      qj(g, P, 0.06, w - 0.06, 0.84, 18, 26, '#05050a');
      box(g, P, 0.06, 0.62, w - 0.12, 0.26, 18, 20, '#f4f1ea');
      const k0 = P(0.10, 0.78, 20);
      for (let k = 0; k < 11; k++) rect(g, k0[0] + k * 3, k0[1] - 1, 1, 3, '#1a1a22');
      box(g, P, 0.08, 0.10, w - 0.16, 0.14, 30, 34, '#1a1a22');
      plat(g, P, 0.08, w - 0.08, 0.10, 0.24, 34, '#26262f');
    } },
    billard: { w: 3, d: 2, h: 28, paint(g, P, f, w, d) {
      [[0.20, 0.24], [w - 0.34, 0.24], [0.20, d - 0.38], [w - 0.34, d - 0.38]].forEach(p => box(g, P, p[0], p[1], 0.18, 0.18, 0, 18, '#4a2a14'));
      box(g, P, 0, 0, w, d, 18, 24, '#5a3018');
      plat(g, P, 0.14, w - 0.14, 0.14, d - 0.14, 24, '#2f8f4f');
      plat(g, P, 0.14, w - 0.14, 0.14, 0.24, 24, '#256f3e');
      box(g, P, 0.1, 0.1, 0.1, 0.1, 24, 25, '#1a1208');
      [['#ffffff', 1.1, 0.7], ['#ffd23a', 1.7, 1.0], ['#c8322b', 2.1, 0.6], ['#2a5bd7', 1.4, 1.3], ['#111111', 2.3, 1.2]].forEach(b => {
        const p = P(b[1], b[2], 25); disk(g, p[0], p[1], 2, b[0]);
      });
    } },
    massage: { w: 1, d: 1, h: 38, paint(g, P) {
      box(g, P, 0.10, 0.10, 0.80, 0.80, 0, 5, '#1a1a1a');
      box(g, P, 0.10, 0.10, 0.80, 0.80, 5, 16, '#22222a');
      box(g, P, 0.06, 0.06, 0.88, 0.26, 16, 34, '#2a2a34');
      box(g, P, 0.06, 0.06, 0.88, 0.26, 34, 36, '#c9a24a');
      box(g, P, 0.04, 0.06, 0.14, 0.88, 5, 22, '#c9a24a');
      box(g, P, 0.82, 0.06, 0.14, 0.88, 5, 22, '#c9a24a');
    } },
    statue: { w: 1, d: 1, h: 46, paint(g, P) {
      box(g, P, 0.18, 0.18, 0.64, 0.64, 0, 14, '#f2efe8');
      box(g, P, 0.14, 0.14, 0.72, 0.72, 14, 17, '#c9a24a');
      box(g, P, 0.38, 0.38, 0.24, 0.24, 17, 30, '#e8b93a');
      disk(g, ...P(0.5, 0.5, 36), 6, '#f0c84a');
      rect(g, P(0.5, 0.5, 26)[0] - 9, P(0.5, 0.5, 26)[1] - 2, 5, 3, '#f0c84a');
      rect(g, P(0.5, 0.5, 26)[0] + 5, P(0.5, 0.5, 26)[1] - 6, 5, 3, '#f0c84a');
    } },
    jacuzzi: { w: 2, d: 2, h: 24, paint(g, P, f, w, d) {
      box(g, P, 0, 0, w, d, 0, 18, '#8a6a4a');
      box(g, P, 0.16, 0.16, w - 0.32, d - 0.32, 18, 19, '#2f9fc9');
      plat(g, P, 0.20, w - 0.20, 0.20, d - 0.20, 19, '#4fd0e8');
      plat(g, P, 0.34, w - 0.34, 0.34, d - 0.34, 19, '#7fe4f5');
      rect(g, P(0.6, 0.6, 20)[0], P(0.6, 0.6, 20)[1], 4, 2, 'rgba(255,255,255,.85)');
      rect(g, P(1.3, 1.1, 20)[0], P(1.3, 1.1, 20)[1], 3, 2, 'rgba(255,255,255,.7)');
    } },
    pool: { w: 4, d: 3, h: 16, paint(g, P, f, w, d) {
      box(g, P, 0, 0, w, d, 0, 7, '#e8e2d2');
      plat(g, P, 0.22, w - 0.22, 0.22, d - 0.22, 7, '#2fa8e0');
      for (let k = 0; k < 5; k++) rect(g, P(0.35, 0.4 + k * 0.5, 7)[0], P(0.35, 0.4 + k * 0.5, 7)[1], w * 12, 1, 'rgba(190,240,255,.6)');
      box(g, P, w - 0.5, 0.4, 0.08, 0.08, 7, 20, '#c9ccd4');
      box(g, P, w - 0.5, 0.7, 0.08, 0.08, 7, 20, '#c9ccd4');
      box(g, P, 0.3, d - 0.5, 0.4, 0.22, 7, 9, '#ff6a2b');
    } },
    podium: { w: 1, d: 1, h: 34, paint(g, P) {
      box(g, P, 0.20, 0.20, 0.60, 0.60, 0, 26, '#5a3520');
      box(g, P, 0.14, 0.14, 0.72, 0.72, 26, 30, '#7a4a26');
      qj(g, P, 0.24, 0.76, 0.80, 8, 22, '#ffc928');
      box(g, P, 0.46, 0.30, 0.08, 0.08, 30, 34, '#2a2a32');
    } },
    flag: { w: 1, d: 1, h: 78, paint(g, P) {
      box(g, P, 0.36, 0.36, 0.28, 0.28, 0, 5, '#5a5a64');
      box(g, P, 0.46, 0.46, 0.08, 0.08, 5, 76, '#c9ccd4');
      const cols = ['#1f8f5a', '#ffc928', '#2a5bd7'];
      cols.forEach((c, b) => {
        for (let k = 0; k < 5; k++) {
          const p = P(0.5 + k * 0.12, 0.5, 74 - b * 6);
          rect(g, p[0], p[1] - (k % 2), 5, 5, c);
        }
      });
    } },
    ropes: { w: 1, d: 1, h: 30, paint(g, P) {
      box(g, P, 0.14, 0.44, 0.12, 0.12, 0, 26, '#c9a24a');
      box(g, P, 0.74, 0.44, 0.12, 0.12, 0, 26, '#c9a24a');
      box(g, P, 0.12, 0.40, 0.16, 0.20, 26, 30, '#e0b64a');
      box(g, P, 0.72, 0.40, 0.16, 0.20, 26, 30, '#e0b64a');
      const a = P(0.26, 0.50, 22), b = P(0.74, 0.50, 22);
      for (let k = 0; k <= 10; k++) {
        const x = a[0] + (b[0] - a[0]) * k / 10, y = a[1] + (b[1] - a[1]) * k / 10 + Math.sin(k / 10 * Math.PI) * 3;
        rect(g, x, y, 2, 2, '#b01028');
      }
    } }
  };

  /* ---------- branchement sur le moteur de jeu ---------- */
  Object.keys(PIX).forEach((type) => {
    const D = FDEF[type];
    if (!D) return;
    const def = PIX[type];
    const fallback = D.draw;
    D.draw = function (c, R, f, time) {
      const w = f.w || def.w, d = f.d || def.d;
      let s;
      try { s = make(type, w, d, def.h, def.paint, f); }
      catch (e) { return fallback.call(D, c, R, f, time); }
      const Zk = (c.getTransform && c.getTransform().a) || 1;
      const apx = apxOf(R);
      const step = Math.max(1, Math.round(apx * Zk)) / Zk;
      const [x, y] = IP(R, f.i, f.j, 0);
      const px = Math.round(x / step) * step, py = Math.round(y / step) * step;
      c.save();
      c.imageSmoothingEnabled = false;
      c.drawImage(s.cv, px - s.ox * step, py - s.oy * step, s.cv.width * step, s.cv.height * step);
      c.restore();
      if (def.anim) { try { def.anim(c, R, f, time || 0, apx); } catch (e) {} }
    };
  });

  /* ---------- coque de la salle : sol, murs et motifs en pixels ---------- */
  const basePaint = paintRoomStatic;
  paintRoomStatic = function (c, R) {
    try {
      const pf = apxOf(R);
      const W = Math.max(1, Math.round(VW / pf)), H = Math.max(1, Math.round(VH / pf));
      const [tmp, g] = cv2(W, H);
      const k = (c.getTransform && c.getTransform().a) || 1;
      g.setTransform(k / pf, 0, 0, k / pf, 0, 0);
      basePaint(g, R);
      c.save();
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.imageSmoothingEnabled = false;
      c.drawImage(tmp, 0, 0, W, H, 0, 0, c.canvas.width, c.canvas.height);
      c.restore();
    } catch (e) { basePaint(c, R); }
  };
})();
