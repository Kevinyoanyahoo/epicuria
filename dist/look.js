/* EpicurIA · garde-robe et coiffures des personnages
   Fournit : les catalogues de personnalisation (teints, coiffures, tenues, accessoires),
   le corps animé (marche avec appuis au sol) et les vêtements dessinés pour
   la silhouette du monde, le portrait et la grande silhouette des scènes. */
(function () {
  const OUT = '#140c1c';
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  function sh(hex, p) {
    let n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = (v) => cl(Math.round(p < 0 ? v * (1 + p) : v + (255 - v) * p), 0, 255);
    return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }

  /* ---------------- catalogues ---------------- */
  const SKINS = ['#f8dcc0', '#eab98f', '#c98c5c', '#a0663b', '#7a4826', '#553019', '#d9a273', '#8d5730', '#f2c9a4', '#3d2314'];
  const HAIRCOLS = ['#1c1410', '#4a2e18', '#8a5a2b', '#d6ad4c', '#9e2f24', '#d8d8d8', '#2b1b12', '#6d4630', '#b8743a', '#efe8da'];
  const OUTFITS = ['#2a5bd7', '#c8322b', '#1f8f5a', '#6a3fc0', '#e0901f', '#2c3142', '#14909e', '#d9d4c5', '#c9a227', '#151b2b', '#7a2846', '#2f6f7a', '#8a6b3d', '#3f4a63'];
  const STYLES = [
    { n: 'Court', sex: 'u' }, { n: 'Afro', sex: 'u' }, { n: 'Long', sex: 'f' }, { n: 'Chignon', sex: 'f' },
    { n: 'Locks', sex: 'u' }, { n: 'Ras', sex: 'm' }, { n: 'Carré', sex: 'f' }, { n: 'Tresses', sex: 'u' },
    { n: 'Foulard', sex: 'f' }, { n: 'Dégradé', sex: 'm' }, { n: 'Queue', sex: 'f' },
  ];
  const GARMS = [
    { n: 'Costume', k: 'suit', sex: 'u' }, { n: 'Blazer', k: 'blazer', sex: 'u' }, { n: 'Chemise', k: 'shirt', sex: 'u' },
    { n: 'Col roulé', k: 'turtleneck', sex: 'u' }, { n: 'Robe tailleur', k: 'dress', sex: 'f' }, { n: 'Robe de soirée', k: 'evening', sex: 'f' },
    { n: 'Blouse', k: 'blouse', sex: 'f' }, { n: 'Wax chic', k: 'boubou', sex: 'u' }, { n: 'Polo', k: 'polo', sex: 'u' },
    { n: 'Trench', k: 'trench', sex: 'u' }, { n: 'Gilet', k: 'vest', sex: 'u' }, { n: 'Smoking', k: 'smoking', sex: 'u' },
  ];
  const ACCS = [
    { id: 'none', n: 'Aucun' }, { id: 'glasses', n: 'Lunettes' }, { id: 'beard', n: 'Barbe', sex: 'm' },
    { id: 'tie', n: 'Cravate' }, { id: 'bowtie', n: 'Nœud pap' }, { id: 'earrings', n: 'Boucles', sex: 'f' },
    { id: 'necklace', n: 'Collier', sex: 'f' }, { id: 'scarf', n: 'Foulard' },
  ];
  const BOTTOMS = [{ id: 'pants', n: 'Pantalon' }, { id: 'skirt', n: 'Jupe' }];

  const keep = (sex, g) => sex === 'u' || (g === 'f' ? sex === 'f' : sex === 'm');
  const idx = (list, g) => list.map((x, i) => (keep(x.sex || 'u', g) ? i : -1)).filter((i) => i >= 0);
  const styleIdx = (g) => idx(STYLES, g), styleLbl = (g) => styleIdx(g).map((i) => STYLES[i].n);
  const garmIdx = (g) => idx(GARMS, g), garmLbl = (g) => garmIdx(g).map((i) => GARMS[i].n);
  const accIdx = (g) => idx(ACCS, g), accLbl = (g) => accIdx(g).map((i) => ACCS[i].n);
  const G = (L) => GARMS[L.garm || 0] || GARMS[0];
  const frocky = (L) => { const k = G(L).k; return k === 'dress' || k === 'evening'; };

  /* ---------------- cheveux (styles 6 → 10) ---------------- */
  function hair(c, hx, hy, hairCol, hs, F, phase) {
    const d = sh(hairCol, -0.22), l = sh(hairCol, 0.24);
    c.strokeStyle = OUT; c.lineWidth = 3;
    if (hs === 6) { /* carré lisse */
      if (phase === 'back') {
        c.fillStyle = hairCol; c.beginPath();
        c.moveTo(hx - 19, hy - 12); c.quadraticCurveTo(hx, hy - 30, hx + 19, hy - 12);
        c.lineTo(hx + 20, hy + 20); c.quadraticCurveTo(hx, hy + 26, hx - 20, hy + 20); c.closePath();
        c.fill(); c.stroke();
      } else {
        c.fillStyle = hairCol; c.beginPath();
        c.moveTo(hx + 18, hy - 6); c.quadraticCurveTo(hx + 14, hy - 26, hx - 4, hy - 26);
        c.quadraticCurveTo(hx - 22, hy - 24, hx - 21, hy - 2); c.lineTo(hx - 16, hy - 4);
        c.quadraticCurveTo(hx + 2, hy - 14, hx + 18, hy - 6); c.closePath(); c.fill(); c.stroke();
        c.strokeStyle = l; c.lineWidth = 1.4; c.beginPath(); c.moveTo(hx - 14, hy - 12); c.quadraticCurveTo(hx - 4, hy - 22, hx + 12, hy - 16); c.stroke();
      }
    }
    if (hs === 7) { /* tresses / cornrows */
      c.save();
      for (let k = 0; k < 5; k++) {
        const y0 = hy - 24 + k * 3.4, o = (k - 2) * 1.6;
        c.strokeStyle = OUT; c.lineWidth = 4.4;
        c.beginPath(); c.moveTo(hx - 17 + o, y0 + 2); c.quadraticCurveTo(hx - 2, hy - 27 + k * 2, hx + 16 + o, y0); c.stroke();
        c.strokeStyle = k % 2 ? hairCol : l; c.lineWidth = 2.2;
        c.beginPath(); c.moveTo(hx - 17 + o, y0 + 2); c.quadraticCurveTo(hx - 2, hy - 27 + k * 2, hx + 16 + o, y0); c.stroke();
      }
      if (phase === 'top') { c.fillStyle = sh(hairCol, -0.1); c.beginPath(); c.ellipse(hx - 2, hy - 6, 17, 6, 0, 0, 7); c.fill(); }
      c.restore();
    }
    if (hs === 8) { /* foulard */
      if (phase === 'back') {
        c.fillStyle = '#c0392b'; c.beginPath();
        c.moveTo(hx - 21, hy - 8); c.quadraticCurveTo(hx, hy - 34, hx + 21, hy - 8);
        c.quadraticCurveTo(hx + 12, hy + 22, hx - 6, hy + 18); c.closePath(); c.fill();
        c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
      } else {
        c.fillStyle = '#d94f3d'; c.beginPath();
        c.moveTo(hx + 19, hy - 9); c.quadraticCurveTo(hx + 12, hy - 30, hx - 6, hy - 29);
        c.quadraticCurveTo(hx - 24, hy - 26, hx - 20, hy - 4); c.lineTo(hx - 13, hy - 8);
        c.quadraticCurveTo(hx + 4, hy - 20, hx + 19, hy - 9); c.closePath(); c.fill();
        c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
        c.strokeStyle = '#f2c14e'; c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(hx - 15, hy - 16); c.quadraticCurveTo(hx - 2, hy - 26, hx + 12, hy - 18); c.stroke();
        c.beginPath(); c.moveTo(hx + 16, hy - 14); c.quadraticCurveTo(hx + 22, hy - 6, hx + 18, hy + 4); c.lineTo(hx + 10, hy - 2); c.fillStyle = '#d94f3d'; c.fill(); c.stroke();
      }
    }
    if (hs === 9) { /* dégradé */
      if (phase === 'back') {
        c.fillStyle = sh(hairCol, -0.15); c.beginPath(); c.ellipse(hx - 1, hy - 12, 17, 13, 0, 0, 7); c.fill(); c.stroke();
      } else {
        c.fillStyle = hairCol; c.beginPath();
        c.moveTo(hx + 17, hy - 12); c.quadraticCurveTo(hx + 10, hy - 27, hx - 5, hy - 26);
        c.quadraticCurveTo(hx - 20, hy - 24, hx - 19, hy - 12); c.lineTo(hx - 15, hy - 13);
        c.quadraticCurveTo(hx + 1, hy - 21, hx + 17, hy - 12); c.closePath(); c.fill(); c.stroke();
        c.strokeStyle = l; c.lineWidth = 1.3; c.beginPath(); c.moveTo(hx - 12, hy - 15); c.quadraticCurveTo(hx + 2, hy - 23, hx + 14, hy - 16); c.stroke();
      }
    }
    if (hs === 10) { /* queue de cheval */
      if (phase === 'back') {
        c.fillStyle = d; c.strokeStyle = OUT; c.lineWidth = 3;
        c.beginPath(); c.moveTo(hx - 16, hy - 14); c.quadraticCurveTo(hx - 30, hy + 10, hx - 22, hy + 34);
        c.quadraticCurveTo(hx - 12, hy + 20, hx - 9, hy - 6); c.closePath(); c.fill(); c.stroke();
      } else {
        c.fillStyle = hairCol; c.beginPath();
        c.moveTo(hx + 18, hy - 8); c.quadraticCurveTo(hx + 14, hy - 27, hx - 4, hy - 26);
        c.quadraticCurveTo(hx - 22, hy - 24, hx - 20, hy - 4); c.lineTo(hx - 14, hy - 7);
        c.quadraticCurveTo(hx + 2, hy - 15, hx + 18, hy - 8); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = d; c.beginPath(); c.arc(hx - 17, hy - 13, 6, 0, 7); c.fill(); c.stroke();
      }
    }
  }

  /* ---------------- silhouette du monde (marche avec appuis) ---------------- */
  function world(c, x, y, u, L, dir, t, moving, jump, head) {
    const front = dir === 0 || dir === 1, flip = dir === 1 || dir === 3;
    const skin = SKINS[L.skin] || SKINS[3], col = OUTFITS[L.outfit] || OUTFITS[0];
    const g = G(L), F = L.gender === 'f', kind = g.k;
    const P = moving ? t * 7.6 : 0;
    const sleeve = (kind === 'shirt' || kind === 'polo' || kind === 'turtleneck' || kind === 'boubou' || kind === 'dress' || kind === 'evening' || kind === 'blouse') ? col : col;
    const bare = kind === 'dress' || kind === 'evening' || L.bottom === 'skirt';
    const pantCol = bare ? sh(skin, -0.08) : (kind === 'smoking' ? '#1b1f2c' : '#2a3046');
    const hipY = -30 * u;
    const dress = frocky(L) || L.bottom === 'skirt';

    c.save();
    c.translate(x, y);
    c.fillStyle = 'rgba(0,0,0,.26)'; c.beginPath(); c.ellipse(0, 1 * u, 14 * u, 5 * u, 0, 0, 7); c.fill();
    if (flip) c.scale(-1, 1);
    const bob = (moving ? -Math.abs(Math.sin(P)) * 1.1 * u : Math.sin(t * 2) * 0.35 * u) - (jump ? Math.abs(Math.sin(t * 9)) * 6 * u : 0);
    c.translate(0, bob);
    c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = OUT;

    /* jambes : cuisse + tibia, pied posé au sol, genou fléchi pendant le pas */
    const leg = (hx, ph) => {
      const a = Math.sin(ph) * 0.5;
      const lift = Math.max(0, Math.cos(ph));
      const kx = hx + Math.sin(a) * 13 * u, ky = hipY + Math.cos(a) * 13 * u;
      const b = a - lift * 0.72;
      const fx = kx + Math.sin(b) * 13.5 * u, fy = ky + Math.cos(b) * 13.5 * u;
      c.beginPath(); c.moveTo(hx, hipY); c.lineTo(kx, ky); c.lineTo(fx, fy);
      c.strokeStyle = OUT; c.lineWidth = 7.6 * u; c.stroke();
      c.strokeStyle = pantCol; c.lineWidth = 5.4 * u; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 1.6 * u;
      c.beginPath(); c.moveTo(hx + 1.2 * u, hipY); c.lineTo(kx + 1.2 * u, ky); c.stroke();
      c.fillStyle = '#1b1b24'; c.strokeStyle = OUT; c.lineWidth = 1.3 * u;
      c.beginPath(); c.ellipse(fx + (front ? 1 * u : 0), Math.min(0, fy + 1.4 * u), 4.6 * u, 2.6 * u, 0, 0, 7);
      c.fill(); c.stroke();
    };
    leg(-4.5 * u, P + Math.PI); leg(5 * u, P);

    /* robe / jupe */
    if (dress) {
      const long = kind === 'evening';
      const hem = long ? -4 * u : (kind === 'dress' ? -13 * u : -15 * u);
      c.beginPath();
      c.moveTo(-10 * u, -33 * u); c.lineTo(10 * u, -33 * u);
      c.quadraticCurveTo(15 * u, hem * 0.6, (long ? 17 : 14) * u, hem);
      c.quadraticCurveTo(0, hem + 4 * u, -(long ? 17 : 14) * u, hem);
      c.quadraticCurveTo(-15 * u, hem * 0.6, -10 * u, -33 * u); c.closePath();
      const gg = c.createLinearGradient(-14 * u, 0, 14 * u, 0);
      gg.addColorStop(0, sh(col, -0.25)); gg.addColorStop(.5, col); gg.addColorStop(1, sh(col, 0.1));
      c.fillStyle = gg; c.fill(); c.strokeStyle = OUT; c.lineWidth = 1.5 * u; c.stroke();
      if (long) { c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.moveTo(0, -26 * u); c.lineTo(5 * u, hem + 2 * u); c.lineTo(-2 * u, hem + 2 * u); c.closePath(); c.fill(); }
    }

    /* bras */
    const arm = (sx, ph, back) => {
      const a = (back ? 1 : -1) * Math.sin(P) * 0.42 + (moving ? 0 : 0.06);
      const ex = sx + Math.sin(a) * 11 * u, ey = -50 * u + Math.cos(a) * 11 * u;
      const b = a - 0.36;
      const hx2 = ex + Math.sin(b) * 10.5 * u, hy2 = ey + Math.cos(b) * 10.5 * u;
      c.beginPath(); c.moveTo(sx, -49 * u); c.lineTo(ex, ey); c.lineTo(hx2, hy2);
      c.strokeStyle = OUT; c.lineWidth = 6.6 * u; c.stroke();
      c.strokeStyle = back ? sh(sleeve, -0.22) : sleeve; c.lineWidth = 4.6 * u; c.stroke();
      c.fillStyle = sh(skin, back ? -0.15 : 0); c.strokeStyle = OUT; c.lineWidth = 1.1 * u;
      c.beginPath(); c.arc(hx2, hy2 + 0.6 * u, 2.6 * u, 0, 7); c.fill(); c.stroke();
    };
    arm(-9 * u, P, true);

    /* torse */
    c.beginPath();
    c.moveTo(-9.5 * u, -29 * u); c.lineTo(9.5 * u, -29 * u);
    c.lineTo(12 * u, -50 * u); c.quadraticCurveTo(0, -55 * u, -12 * u, -50 * u); c.closePath();
    const tg = c.createLinearGradient(-12 * u, 0, 12 * u, 0);
    tg.addColorStop(0, sh(col, -0.3)); tg.addColorStop(.45, col); tg.addColorStop(1, sh(col, 0.12));
    c.fillStyle = tg; c.fill();

    /* détail du vêtement */
    const cream = '#f4f1ea', tie = '#b8242b';
    const lapel = (side) => {
      c.fillStyle = sh(col, 0.16); c.strokeStyle = OUT; c.lineWidth = 1 * u;
      c.beginPath(); c.moveTo(side * 11.6 * u, -50 * u); c.lineTo(side * 2.4 * u, -47 * u); c.lineTo(side * 6.4 * u, -30 * u); c.lineTo(side * 10.4 * u, -38 * u); c.closePath();
      c.fill(); c.stroke();
    };
    if (kind === 'suit' || kind === 'blazer' || kind === 'vest' || kind === 'trench') {
      c.fillStyle = cream; c.beginPath(); c.moveTo(-5 * u, -52 * u); c.lineTo(5 * u, -52 * u); c.lineTo(0, -34 * u); c.closePath(); c.fill();
      lapel(-1); lapel(1);
      if (L.acc === 'tie' || L.acc === 'bowtie') {
        if (L.acc === 'bowtie') { c.fillStyle = OUT; c.beginPath(); c.moveTo(-3.4 * u, -49 * u); c.lineTo(0, -47.6 * u); c.lineTo(3.4 * u, -49 * u); c.lineTo(0, -50.6 * u); c.closePath(); c.fill(); }
        else { c.fillStyle = tie; c.beginPath(); c.moveTo(-1.4 * u, -50 * u); c.lineTo(1.4 * u, -50 * u); c.lineTo(2 * u, -38 * u); c.lineTo(0, -35 * u); c.lineTo(-2 * u, -38 * u); c.closePath(); c.fill(); }
      }
      c.fillStyle = 'rgba(255,255,255,.55)';
      c.beginPath(); c.arc(0, -42 * u, 0.9 * u, 0, 7); c.fill();
      c.beginPath(); c.arc(0, -37 * u, 0.9 * u, 0, 7); c.fill();
      if (kind === 'trench') { c.fillStyle = sh(col, -0.35); c.fillRect(-10 * u, -33 * u, 20 * u, 2.4 * u); c.fillStyle = '#d9c27a'; c.fillRect(-1.6 * u, -33.6 * u, 3.2 * u, 3.6 * u); }
      if (kind === 'vest') { c.strokeStyle = sh(col, -0.4); c.lineWidth = 1 * u; c.beginPath(); c.moveTo(0, -34 * u); c.lineTo(0, -29 * u); c.stroke(); }
    } else if (kind === 'smoking') {
      c.fillStyle = '#f6f4ef'; c.beginPath(); c.moveTo(-5 * u, -52 * u); c.lineTo(5 * u, -52 * u); c.lineTo(0, -35 * u); c.closePath(); c.fill();
      c.fillStyle = sh(col, 0.3); c.beginPath(); c.moveTo(-11.6 * u, -50 * u); c.lineTo(-2 * u, -46 * u); c.lineTo(-5.6 * u, -31 * u); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(11.6 * u, -50 * u); c.lineTo(2 * u, -46 * u); c.lineTo(5.6 * u, -31 * u); c.closePath(); c.fill();
      c.fillStyle = '#0d0f18'; c.beginPath(); c.moveTo(-3.6 * u, -50 * u); c.lineTo(0, -48.4 * u); c.lineTo(3.6 * u, -50 * u); c.lineTo(0, -51.6 * u); c.closePath(); c.fill();
    } else if (kind === 'shirt' || kind === 'polo') {
      c.strokeStyle = OUT; c.lineWidth = 1 * u;
      c.fillStyle = cream; c.beginPath(); c.moveTo(-4.4 * u, -53 * u); c.lineTo(0, -47 * u); c.lineTo(4.4 * u, -53 * u); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = sh(col, -0.3); c.beginPath(); c.moveTo(0, -47 * u); c.lineTo(0, -30 * u); c.stroke();
      if (kind === 'polo') { c.fillStyle = sh(col, -0.18); c.beginPath(); c.moveTo(-4 * u, -52 * u); c.lineTo(0, -47 * u); c.lineTo(-5.4 * u, -45 * u); c.closePath(); c.fill(); c.beginPath(); c.moveTo(4 * u, -52 * u); c.lineTo(0, -47 * u); c.lineTo(5.4 * u, -45 * u); c.closePath(); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(0.6 * u, -42 * u, 0.8 * u, 0, 7); c.fill(); c.beginPath(); c.arc(0.6 * u, -37 * u, 0.8 * u, 0, 7); c.fill();
    } else if (kind === 'turtleneck') {
      c.fillStyle = sh(col, 0.2); c.beginPath(); c.moveTo(-5.4 * u, -55 * u); c.lineTo(5.4 * u, -55 * u); c.lineTo(4.6 * u, -48 * u); c.lineTo(-4.6 * u, -48 * u); c.closePath(); c.fill();
      c.strokeStyle = OUT; c.lineWidth = 1 * u; c.stroke();
    } else if (kind === 'blouse') {
      c.fillStyle = sh(col, 0.28); c.beginPath(); c.moveTo(-5 * u, -52 * u); c.lineTo(0, -44 * u); c.lineTo(5 * u, -52 * u); c.closePath(); c.fill();
      c.fillStyle = sh(col, 0.1); c.beginPath(); c.arc(0, -46 * u, 1.7 * u, 0, 7); c.fill();
      c.strokeStyle = OUT; c.lineWidth = 0.9 * u; c.beginPath(); c.moveTo(0, -44 * u); c.lineTo(0, -30 * u); c.stroke();
    } else if (kind === 'boubou') {
      c.fillStyle = 'rgba(255,255,255,.16)';
      c.beginPath(); c.moveTo(-6 * u, -53 * u); c.quadraticCurveTo(0, -44 * u, 6 * u, -53 * u); c.lineTo(0, -56 * u); c.closePath(); c.fill();
      c.strokeStyle = '#f2c14e'; c.lineWidth = 1.3 * u;
      c.beginPath(); c.moveTo(-9.6 * u, -46 * u); c.lineTo(-9.6 * u, -31 * u); c.stroke();
      c.beginPath(); c.moveTo(9.6 * u, -46 * u); c.lineTo(9.6 * u, -31 * u); c.stroke();
      c.fillStyle = '#f2c14e';
      for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(0, -42 * u + k * 4 * u, 0.8 * u, 0, 7); c.fill(); }
    } else if (kind === 'dress' || kind === 'evening') {
      c.fillStyle = sh(col, 0.22);
      c.beginPath(); c.moveTo(-7 * u, -53 * u); c.quadraticCurveTo(0, -45 * u, 7 * u, -53 * u); c.lineTo(0, -57 * u); c.closePath(); c.fill();
      if (F) { c.strokeStyle = OUT; c.lineWidth = 0.9 * u; c.beginPath(); c.moveTo(-7 * u, -52 * u); c.lineTo(-4 * u, -56 * u); c.stroke(); c.beginPath(); c.moveTo(7 * u, -52 * u); c.lineTo(4 * u, -56 * u); c.stroke(); }
      c.fillStyle = sh(col, -0.28); c.fillRect(-9.5 * u, -33 * u, 19 * u, 2 * u);
    }
    c.strokeStyle = OUT; c.lineWidth = 1.4 * u;
    c.beginPath(); c.moveTo(-9.5 * u, -29 * u); c.lineTo(9.5 * u, -29 * u); c.lineTo(12 * u, -50 * u); c.quadraticCurveTo(0, -55 * u, -12 * u, -50 * u); c.closePath(); c.stroke();
    if (L.acc === 'necklace' && front) {
      c.strokeStyle = '#e6c463'; c.lineWidth = 1.1 * u;
      c.beginPath(); c.moveTo(-3.6 * u, -53 * u); c.quadraticCurveTo(0, -47 * u, 3.6 * u, -53 * u); c.stroke();
      c.fillStyle = '#f0d67f'; c.beginPath(); c.arc(0, -48 * u, 1 * u, 0, 7); c.fill();
    }

    /* cou + tête */
    c.fillStyle = sh(skin, -0.1); c.strokeStyle = OUT; c.lineWidth = 1.2 * u;
    c.beginPath(); c.moveTo(-4.2 * u, -52 * u); c.lineTo(4.2 * u, -52 * u); c.lineTo(3.6 * u, -62 * u); c.lineTo(-3.6 * u, -62 * u); c.closePath(); c.fill(); c.stroke();
    const hs = 0.6 * u, hy = -71 * u;
    if (head) head(c, 0, hy, hs, front);
    else if (front) headFrontFallback(c, 0, hy, hs, L, skin);
    arm(9 * u, P, false);
    c.restore();
  }
  function headFrontFallback() {}

  /* ---------------- buste (portraits, fiches, cartes) ---------------- */
  function bustTorso(c, L) {
    const skin = SKINS[L.skin] || SKINS[3], col = OUTFITS[L.outfit] || OUTFITS[0];
    const g = G(L), kind = g.k, F = L.gender === 'f';
    const st = (w) => { c.strokeStyle = OUT; c.lineWidth = w || 1.7; c.stroke(); };
    const cream = '#f6f3ec';
    /* cou */
    c.fillStyle = sh(skin, -0.08); c.beginPath(); c.moveTo(-9, 12); c.lineTo(9, 12); c.lineTo(11, 40); c.quadraticCurveTo(0, 45, -11, 40); c.closePath(); c.fill(); st(1.4);
    c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.moveTo(-9, 16); c.quadraticCurveTo(0, 24, 9, 16); c.lineTo(9, 12); c.lineTo(-9, 12); c.fill();
    /* épaules */
    c.beginPath(); c.moveTo(-58, 80); c.bezierCurveTo(-56, 52, -46, 42, -14, 36); c.lineTo(14, 36); c.bezierCurveTo(46, 42, 56, 52, 58, 80); c.closePath();
    const gr = c.createLinearGradient(-50, 0, 50, 0);
    gr.addColorStop(0, sh(col, 0.12)); gr.addColorStop(.55, col); gr.addColorStop(1, sh(col, -0.3));
    c.fillStyle = gr; c.fill(); st(1.8);
    if (kind === 'suit' || kind === 'blazer' || kind === 'vest' || kind === 'trench') {
      c.fillStyle = cream; c.beginPath(); c.moveTo(-11, 36); c.lineTo(11, 36); c.lineTo(0, 68); c.closePath(); c.fill(); st(1.2);
      c.fillStyle = sh(col, 0.18);
      c.beginPath(); c.moveTo(-14, 36); c.lineTo(-2, 68); c.lineTo(-24, 54); c.closePath(); c.fill(); st(1.1);
      c.beginPath(); c.moveTo(14, 36); c.lineTo(2, 68); c.lineTo(24, 54); c.closePath(); c.fill(); st(1.1);
      if (L.acc === 'tie') { c.fillStyle = '#b8242b'; c.beginPath(); c.moveTo(-3.4, 40); c.lineTo(3.4, 40); c.lineTo(5, 64); c.lineTo(0, 71); c.lineTo(-5, 64); c.closePath(); c.fill(); st(1.1); }
      if (L.acc === 'bowtie') { c.fillStyle = '#0d0f18'; c.beginPath(); c.moveTo(-8, 44); c.lineTo(0, 47); c.lineTo(8, 44); c.lineTo(0, 41); c.closePath(); c.fill(); st(1); }
      c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(0, 56, 1.5, 0, 7); c.fill(); c.beginPath(); c.arc(0, 64, 1.5, 0, 7); c.fill();
      if (kind === 'trench') { c.fillStyle = '#d9c27a'; c.fillRect(-7, 74, 14, 5); st(1); }
    } else if (kind === 'smoking') {
      c.fillStyle = '#f6f4ef'; c.beginPath(); c.moveTo(-11, 36); c.lineTo(11, 36); c.lineTo(0, 64); c.closePath(); c.fill(); st(1.2);
      c.fillStyle = sh(col, 0.34);
      c.beginPath(); c.moveTo(-14, 36); c.lineTo(-2, 64); c.lineTo(-26, 52); c.closePath(); c.fill(); st(1.1);
      c.beginPath(); c.moveTo(14, 36); c.lineTo(2, 64); c.lineTo(26, 52); c.closePath(); c.fill(); st(1.1);
      c.fillStyle = '#0d0f18'; c.beginPath(); c.moveTo(-9, 43); c.lineTo(0, 47); c.lineTo(9, 43); c.lineTo(0, 39); c.closePath(); c.fill(); st(1);
    } else if (kind === 'shirt' || kind === 'polo') {
      c.fillStyle = cream; c.beginPath(); c.moveTo(-11, 36); c.lineTo(0, 52); c.lineTo(11, 36); c.closePath(); c.fill(); st(1.2);
      c.strokeStyle = sh(col, -0.3); c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, 52); c.lineTo(0, 80); c.stroke();
      if (kind === 'polo') { c.fillStyle = sh(col, -0.15); c.beginPath(); c.moveTo(-11, 36); c.lineTo(0, 52); c.lineTo(-15, 45); c.closePath(); c.fill(); c.beginPath(); c.moveTo(11, 36); c.lineTo(0, 52); c.lineTo(15, 45); c.closePath(); c.fill(); st(1.1); }
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(1.5, 60, 1.4, 0, 7); c.fill(); c.beginPath(); c.arc(1.5, 68, 1.4, 0, 7); c.fill();
    } else if (kind === 'turtleneck') {
      c.fillStyle = sh(col, 0.22); c.beginPath(); c.moveTo(-13, 34); c.quadraticCurveTo(0, 28, 13, 34); c.lineTo(11, 48); c.quadraticCurveTo(0, 54, -11, 48); c.closePath(); c.fill(); st(1.4);
      c.strokeStyle = sh(col, 0.4); c.lineWidth = 1.2; c.beginPath(); c.moveTo(-9, 42); c.quadraticCurveTo(0, 47, 9, 42); c.stroke();
    } else if (kind === 'blouse') {
      c.fillStyle = sh(col, 0.3); c.beginPath(); c.moveTo(-16, 36); c.quadraticCurveTo(0, 60, 16, 36); c.lineTo(0, 30); c.closePath(); c.fill(); st(1.3);
      c.fillStyle = sh(col, 0.12); c.beginPath(); c.arc(0, 58, 5, 0, 7); c.fill(); st(1.1);
      c.strokeStyle = sh(col, -0.2); c.lineWidth = 1.3; c.beginPath(); c.moveTo(-2, 60); c.lineTo(-8, 72); c.moveTo(2, 60); c.lineTo(8, 72); c.stroke();
    } else if (kind === 'boubou') {
      c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(0, 40, 16, 9, 0, 0, 7); c.fill(); st(1.2);
      c.strokeStyle = '#f2c14e'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(-20, 40); c.quadraticCurveTo(0, 54, 20, 40); c.stroke();
      c.beginPath(); c.moveTo(-27, 60); c.lineTo(-24, 80); c.moveTo(27, 60); c.lineTo(24, 80); c.stroke();
      c.fillStyle = '#f2c14e';
      for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(0, 58 + k * 7, 1.8, 0, 7); c.fill(); }
    } else if (kind === 'dress' || kind === 'evening') {
      c.fillStyle = sh(col, 0.24); c.beginPath(); c.moveTo(-18, 36); c.quadraticCurveTo(0, 62, 18, 36); c.lineTo(0, 28); c.closePath(); c.fill(); st(1.3);
      c.strokeStyle = OUT; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(-15, 36); c.lineTo(-8, 30); c.stroke();
      c.beginPath(); c.moveTo(15, 36); c.lineTo(8, 30); c.stroke();
      if (kind === 'evening') { c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(-10, 50, 1.6, 0, 7); c.fill(); c.beginPath(); c.arc(9, 56, 1.3, 0, 7); c.fill(); }
    }
    if (L.acc === 'scarf') { c.fillStyle = '#d94f3d'; c.beginPath(); c.moveTo(-12, 34); c.quadraticCurveTo(0, 42, 12, 34); c.lineTo(11, 42); c.quadraticCurveTo(0, 50, -11, 42); c.closePath(); c.fill(); st(1.2); }
    if (L.acc === 'earrings') {
      [-1, 1].forEach((sd) => {
        c.fillStyle = '#e6c463'; c.strokeStyle = OUT; c.lineWidth = 1;
        c.beginPath(); c.moveTo(sd * 22, 5); c.lineTo(sd * 22, 12); c.stroke();
        c.beginPath(); c.arc(sd * 22, 14.5, 2.8, 0, 7); c.fill(); c.stroke();
      });
    }
    if (L.acc === 'necklace') {
      c.strokeStyle = '#e6c463'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-9, 37); c.quadraticCurveTo(0, 52, 9, 37); c.stroke();
      c.fillStyle = '#f0d67f'; c.beginPath(); c.arc(0, 46, 2.6, 0, 7); c.fill(); st(1);
    }
  }

  /* ---------------- silhouette des scènes (grande) ---------------- */
  function torsoDetail(c, L, col, skin, F) {
    const kind = G(L).k, cream = '#f4f1ea';
    c.strokeStyle = OUT; c.lineWidth = 2.6;
    const lapel = (side) => {
      c.fillStyle = sh(col, 0.16);
      c.beginPath(); c.moveTo(side * 17, -58); c.lineTo(side * 3, -50); c.lineTo(side * 10, -6); c.lineTo(side * 17.5, -34); c.closePath();
      c.fill(); c.stroke();
    };
    if (kind === 'suit' || kind === 'blazer' || kind === 'vest' || kind === 'trench') {
      c.fillStyle = cream; c.beginPath(); c.moveTo(-8, -62); c.lineTo(8, -62); c.lineTo(2, -18); c.closePath(); c.fill(); c.stroke();
      lapel(-1); lapel(1);
      if (L.acc === 'tie') { c.fillStyle = '#b8242b'; c.beginPath(); c.moveTo(-3, -58); c.lineTo(5, -58); c.lineTo(7, -18); c.lineTo(1, -10); c.lineTo(-5, -18); c.closePath(); c.fill(); c.stroke(); }
      if (L.acc === 'bowtie') { c.fillStyle = OUT; c.beginPath(); c.moveTo(-8, -56); c.lineTo(1, -51); c.lineTo(10, -56); c.lineTo(1, -61); c.closePath(); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(3, -34, 1.5, 0, 7); c.fill(); c.beginPath(); c.arc(3, -22, 1.5, 0, 7); c.fill();
      if (kind === 'trench') { c.fillStyle = sh(col, -0.35); c.fillRect(-16, -6, 33, 4); c.fillStyle = '#d9c27a'; c.fillRect(-3, -7, 7, 6); c.strokeRect(-3, -7, 7, 6); }
    } else if (kind === 'smoking') {
      c.fillStyle = '#f6f4ef'; c.beginPath(); c.moveTo(-8, -62); c.lineTo(8, -62); c.lineTo(1, -20); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = sh(col, 0.32);
      c.beginPath(); c.moveTo(-18, -58); c.lineTo(-2, -50); c.lineTo(-9, -8); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(18, -58); c.lineTo(2, -50); c.lineTo(9, -8); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#0d0f18'; c.beginPath(); c.moveTo(-8, -56); c.lineTo(1, -51); c.lineTo(10, -56); c.lineTo(1, -61); c.closePath(); c.fill();
    } else if (kind === 'shirt' || kind === 'polo') {
      c.fillStyle = cream; c.beginPath(); c.moveTo(-8, -62); c.lineTo(2, -48); c.lineTo(12, -62); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = sh(col, -0.3); c.lineWidth = 2; c.beginPath(); c.moveTo(2, -48); c.lineTo(4, 2); c.stroke();
      if (kind === 'polo') { c.fillStyle = sh(col, -0.16); c.beginPath(); c.moveTo(-9, -61); c.lineTo(3, -49); c.lineTo(-11, -44); c.closePath(); c.fill(); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(5, -30, 1.6, 0, 7); c.fill(); c.beginPath(); c.arc(5.6, -16, 1.6, 0, 7); c.fill();
    } else if (kind === 'turtleneck') {
      c.fillStyle = sh(col, 0.22); c.beginPath(); c.moveTo(-10, -70); c.quadraticCurveTo(0, -64, 10, -70); c.lineTo(9, -52); c.quadraticCurveTo(0, -46, -9, -52); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = sh(col, 0.45); c.lineWidth = 1.6; c.beginPath(); c.moveTo(-8, -60); c.quadraticCurveTo(0, -55, 8, -60); c.stroke();
    } else if (kind === 'blouse') {
      c.fillStyle = sh(col, 0.3); c.beginPath(); c.moveTo(-14, -62); c.quadraticCurveTo(2, -30, 16, -62); c.lineTo(2, -68); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = sh(col, 0.1); c.beginPath(); c.arc(2, -34, 5, 0, 7); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(0, -31); c.lineTo(-6, -18); c.moveTo(4, -31); c.lineTo(10, -18); c.stroke();
    } else if (kind === 'boubou') {
      c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.ellipse(0, -60, 16, 8, 0, 0, 7); c.fill(); c.stroke();
      c.strokeStyle = '#f2c14e'; c.lineWidth = 2.6;
      c.beginPath(); c.moveTo(-16, -58); c.quadraticCurveTo(1, -40, 18, -58); c.stroke();
      c.beginPath(); c.moveTo(-19, -30); c.lineTo(-17, 2); c.moveTo(19, -30); c.lineTo(17, 2); c.stroke();
      c.fillStyle = '#f2c14e'; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(2, -34 + k * 9, 2.2, 0, 7); c.fill(); }
    } else if (kind === 'dress' || kind === 'evening') {
      c.fillStyle = sh(col, 0.24); c.beginPath(); c.moveTo(-17, -62); c.quadraticCurveTo(2, -30, 20, -62); c.lineTo(2, -70); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(12, -62); c.lineTo(22, -70); c.moveTo(-15, -62); c.lineTo(-22, -70); c.stroke();
      if (kind === 'evening') { c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(-10, -34, 2, 0, 7); c.fill(); c.beginPath(); c.arc(12, -22, 1.6, 0, 7); c.fill(); }
    }
    if (L.acc === 'scarf') { c.fillStyle = '#d94f3d'; c.beginPath(); c.moveTo(-12, -72); c.quadraticCurveTo(0, -62, 13, -72); c.lineTo(11, -60); c.quadraticCurveTo(0, -50, -11, -60); c.closePath(); c.fill(); c.stroke(); }
    if (L.acc === 'necklace') { c.strokeStyle = '#e6c463'; c.lineWidth = 2; c.beginPath(); c.moveTo(-10, -64); c.quadraticCurveTo(1, -48, 12, -64); c.stroke(); c.fillStyle = '#f0d67f'; c.beginPath(); c.arc(1, -52, 3, 0, 7); c.fill(); c.strokeStyle = OUT; c.lineWidth = 1.4; c.stroke(); }
  }

  /* ---------------- variété garantie : deux figurants ne se ressemblent jamais ---------------- */
  function uidLook(look, used) {
    const l = Object.assign({}, look || {});
    const g = l.gender === 'f' ? 'f' : 'h';
    const gs = garmIdx(g), ss = styleIdx(g);
    if (gs.indexOf(l.garm || 0) < 0) l.garm = gs[0];
    if (ss.indexOf(l.hs || 0) < 0) l.hs = ss[0];
    let key = [l.gender, l.skin, l.hs, l.hc, l.outfit, l.garm || 0, l.bottom, l.acc].join('|');
    let k = 0;
    while (used.has(key) && k < 60) {
      k++;
      const m = k % 4;
      if (m === 0) l.outfit = ((l.outfit || 0) + 3) % OUTFITS.length;
      else if (m === 1) l.garm = gs[(gs.indexOf(l.garm || 0) + 1) % gs.length];
      else if (m === 2) l.hs = ss[(ss.indexOf(l.hs || 0) + 1) % ss.length];
      else l.hc = ((l.hc || 0) + 4) % HAIRCOLS.length;
      key = [l.gender, l.skin, l.hs, l.hc, l.outfit, l.garm || 0, l.bottom, l.acc].join('|');
    }
    used.add(key);
    return l;
  }

  window.HXLOOK = {
    SKINS, HAIRCOLS, OUTFITS, STYLES, GARMS, ACCS, BOTTOMS,
    HSN: STYLES.map((s) => s.n), GARMNAMES: GARMS.map((g) => g.n),
    styleIdx, styleLbl, garmIdx, garmLbl, accIdx, accLbl, frocky, uidLook,
    hair, world, bustTorso, torsoDetail, shade: sh,
  };
})();
