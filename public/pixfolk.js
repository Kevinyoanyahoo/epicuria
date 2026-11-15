/* EpicurIA · avatars pixel-art modulaires
   Remplace intégralement les anciens personnages vectoriels par de vrais sprites pixel-art.
   Lecture du MÊME format de personnalisation (skin, hs, hc, outfit, garm, bottom, acc, gender) :
   aucune migration de données, les sauvegardes existantes restent valides.
   Couches : corps, vêtement, cheveux (avant/arrière), accessoires, chaussures.
   Orientations : 0 bas, 1 droite, 2 haut, 3 gauche. États : idle, walk, talk, greet, sit. */
(function () {
  if (typeof SKINS === 'undefined' || typeof drawAvatar !== 'function') return;

  const OUT = '#140d1a';
  const BW = 48, BH = 64, OX = 24, OY = 60;
  const HIP = -13, TT = -27, HT = -43;      // hanche, haut du torse, haut du crâne
  const LEG = 13;
  const cache = new Map();

  const buf = () => {
    const c = document.createElement('canvas');
    c.width = BW; c.height = BH;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    return [c, g];
  };
  const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const sh = (c, p) => (typeof shade === 'function' ? shade(c, p) : c);

  /* ---------------- cheveux (vue de face et de dos) ---------------- */
  function hairFront(g, hs, T, hc, hD, hL) {
    const C = 'rgba(0,0,0,0)';
    if (hs === 0) {                                   // court
      R(g, -7, T + 1, 14, 4, hc); R(g, -8, T + 4, 16, 2, hc);
      R(g, -5, T + 6, 3, 1, hc); R(g, -4, T + 2, 6, 1, hL); R(g, -8, T + 6, 2, 3, hc);
    } else if (hs === 1) {                             // afro
      R(g, -9, T - 1, 18, 9, hc); R(g, -8, T + 8, 16, 2, hc); R(g, -10, T + 3, 2, 6, hc);
      R(g, 8, T + 3, 2, 6, hc); R(g, -6, T + 1, 5, 2, hL); R(g, 3, T + 5, 3, 1, hL);
    } else if (hs === 2) {                             // long
      R(g, -7, T, 14, 5, hc); R(g, -9, T + 4, 2, 18, hc); R(g, 7, T + 4, 2, 18, hc);
      R(g, -1, T + 1, 6, 1, hL); R(g, -9, T + 18, 2, 4, hD);
    } else if (hs === 3) {                             // chignon
      R(g, -7, T + 1, 14, 5, hc); R(g, -4, T - 4, 8, 5, hc); R(g, -3, T - 3, 4, 2, hL);
      R(g, -6, T + 5, 12, 2, hc);
    } else if (hs === 4) {                             // locks
      R(g, -8, T, 16, 6, hc);
      for (let k = 0; k < 7; k++) { R(g, -8 + k * 2 + (k % 2), T + 5, 2, 7 + (k % 3) * 2, k % 2 ? hD : hc); }
    } else if (hs === 5) {                             // rasé
      R(g, -6, T + 2, 12, 2, sh(hc, -0.32)); R(g, -5, T + 4, 10, 1, sh(hc, -0.42));
    } else if (hs === 6) {                             // carré
      R(g, -7, T, 14, 5, hc); R(g, -9, T + 4, 2, 12, hc); R(g, 7, T + 4, 2, 12, hc);
      R(g, 5, T + 2, 3, 1, hL);
    } else if (hs === 7) {                             // tresses
      R(g, -8, T, 16, 5, hc);
      for (let k = 0; k < 6; k++) { R(g, -8 + k * 3, T + 4, 1, 8, hD); R(g, -7 + k * 3, T + 4, 1, 6, hL); }
    } else if (hs === 8) {                             // foulard
      R(g, -8, T - 1, 16, 8, '#c0392b'); R(g, -8, T + 5, 16, 2, '#e05a3a');
      R(g, -6, T + 1, 10, 1, '#f2c14e'); R(g, 7, T + 6, 3, 7, '#c0392b'); R(g, 8, T + 12, 2, 3, '#a02a22');
    } else if (hs === 9) {                             // dégradé
      R(g, -6, T + 1, 12, 4, hc); R(g, -8, T + 4, 3, 4, hD); R(g, 6, T + 4, 3, 4, hD);
      R(g, -3, T + 1, 5, 1, hL);
    } else {                                           // queue de cheval
      R(g, -7, T + 1, 14, 5, hc); R(g, -8, T + 4, 4, 3, hc);
      R(g, -2, T + 1, 5, 1, hL);
    }
  }

  function hairBack(g, hs, T, hc, hD, hL) {
    if (hs === 5) { R(g, -6, T + 3, 12, 3, sh(hc, -0.34)); return; }
    if (hs === 8) { R(g, -9, T - 1, 18, 11, '#a82a22'); R(g, -7, T + 1, 14, 1, '#f2c14e'); return; }
    if (hs === 2) { R(g, -8, T, 16, 13, hc); R(g, -9, T + 9, 18, 9, hc); R(g, -3, T + 2, 6, 1, hL); return; }
    if (hs === 6) { R(g, -8, T, 16, 12, hc); R(g, -3, T + 1, 6, 1, hL); return; }
    if (hs === 10) {
      R(g, -7, T, 14, 11, hc); R(g, -10, T + 8, 5, 12, hc); R(g, -10, T + 18, 4, 3, hD);
      R(g, -2, T + 1, 5, 1, hL); return;
    }
    R(g, -7, T + 1, 14, 10, hc); R(g, -2, T + 2, 6, 1, hL);
    if (hs === 4 || hs === 7) for (let k = 0; k < 5; k++) R(g, -6 + k * 3, T + 3, 1, 7, hD);
  }

  /* ---------------- vêtement du torse ---------------- */
  function top(g, kind, oc, oD, oL, TTx) {
    const cream = '#f2ece0';
    R(g, -6, TTx, 12, 15, oc);
    R(g, -6, TTx, 12, 2, oL);
    R(g, -6, TTx + 2, 1, 12, oD); R(g, 5, TTx + 2, 1, 12, oD);
    const jacket = kind === 'suit' || kind === 'blazer' || kind === 'trench' || kind === 'vest' || kind === 'smoking';
    if (jacket) {
      R(g, -3, TTx + 1, 6, 7, cream);
      R(g, -5, TTx + 1, 2, 6, oL); R(g, 3, TTx + 1, 2, 6, oL);
      R(g, -3, TTx + 8, 6, 7, sh(oc, -0.35));
      R(g, -1, TTx + 2, 2, 2, sh(oc, -0.5));
      if (kind === 'trench') { R(g, -6, TTx + 10, 12, 1, sh(oc, -0.42)); R(g, -1, TTx + 9, 2, 3, '#d9c27a'); }
    } else if (kind === 'shirt' || kind === 'polo') {
      R(g, -3, TTx, 6, 2, cream);
      R(g, -1, TTx + 2, 1, 12, oD);
      if (kind === 'polo') { R(g, -4, TTx + 1, 3, 2, oL); R(g, 1, TTx + 1, 3, 2, oL); }
    } else if (kind === 'turtleneck') {
      R(g, -4, TTx - 2, 8, 3, oL); R(g, -4, TTx - 2, 8, 1, sh(oc, 0.3));
    } else if (kind === 'blouse') {
      R(g, -3, TTx, 6, 2, cream); R(g, -1, TTx + 1, 2, 2, '#e6c463');
    } else if (kind === 'boubou') {
      R(g, -7, TTx, 14, 15, oc); R(g, -7, TTx + 1, 14, 1, '#f2c14e');
      R(g, -4, TTx + 2, 8, 2, sh(oc, 0.24)); R(g, -7, TTx + 13, 14, 1, '#f2c14e');
    } else if (kind === 'dress' || kind === 'evening') {
      R(g, -4, TTx, 8, 3, sh(oc, 0.26));
      R(g, -1, TTx + 3, 2, 9, sh(oc, -0.24));
    } else {
      R(g, -3, TTx, 6, 2, cream);
    }
  }

  /* ---------------- accessoires ---------------- */
  function accs(g, acc, skin, sD, hair, kind, TTx, ey) {
    if (acc === 'glasses') {
      R(g, -5, ey - 1, 4, 3, '#2a2a36'); R(g, 2, ey - 1, 4, 3, '#2a2a36');
      R(g, -4, ey, 2, 1, 'rgba(190,230,255,.9)'); R(g, 3, ey, 2, 1, 'rgba(190,230,255,.9)');
      R(g, -1, ey, 3, 1, '#2a2a36');
    }
    if (acc === 'beard') {
      R(g, -4, ey + 6, 7, 1, hair); R(g, -2, ey + 7, 4, 10 - 8, hair); R(g, -1, ey + 5, 3, 1, hair);
    }
    if (acc === 'earrings') { R(g, -9, ey + 2, 1, 2, '#e6c463'); R(g, 8, ey + 2, 1, 2, '#e6c463'); }
    if (acc === 'necklace') { R(g, -3, TTx - 1, 6, 1, '#e6c463'); R(g, -1, TTx, 2, 1, '#f0d67f'); }
    if (acc === 'scarf') { R(g, -5, TTx - 2, 10, 2, '#d94f3d'); R(g, 1, TTx - 1, 2, 5, '#b03a2a'); }
    if (acc === 'tie' && (kind === 'suit' || kind === 'blazer' || kind === 'vest' || kind === 'trench')) {
      R(g, -1, TTx + 3, 2, 5, '#b8242b'); R(g, -1, TTx + 2, 2, 1, '#8f1a22');
    }
    if (acc === 'bowtie') { R(g, -3, TTx + 2, 2, 2, '#141018'); R(g, 1, TTx + 2, 2, 2, '#141018'); R(g, -1, TTx + 2, 2, 2, '#2a2232'); }
  }

  /* ---------------- personnage complet ---------------- */
  function paint(g, L, dir, fi, stance) {
    const F = L.gender === 'f';
    const side = dir === 1 || dir === 3, back = dir === 2;
    const skin = SKINS[L.skin] || SKINS[3];
    const sD = sh(skin, -0.18), sL = sh(skin, 0.14), sDD = sh(skin, -0.34);
    const hair = HAIRS[L.hc] || HAIRS[0], hD = sh(hair, -0.24), hL = sh(hair, 0.22);
    const oc = OUTFITS[L.outfit] || OUTFITS[0], oD = sh(oc, -0.26), oL = sh(oc, 0.18);
    const kind = (GARMS[L.garm || 0] || GARMS[0]).k;
    const dress = kind === 'dress' || kind === 'evening' || kind === 'boubou';
    const bare = dress || L.bottom === 'skirt';
    const pcol = bare ? sh(skin, -0.04) : (kind === 'smoking' ? '#161b28' : '#2b3148');
    const pcolD = sh(pcol, -0.22);
    const shoe = '#1a1c28';
    const walk = stance === 'walk', sit = stance === 'sit', greet = stance === 'greet';
    const step = walk ? fi % 4 : 0;
    const bob = walk ? (step === 1 || step === 3 ? -1 : 0) : (stance === 'idle' ? (fi % 2 ? 0 : -1) : 0);
    const T = HT + bob, TP = TT + bob, HIPY = HIP + (sit ? 0 : bob);
    const shortSleeve = kind === 'shirt' || kind === 'polo' || kind === 'blouse';

    /* ombre au sol */
    R(g, -6, 0, 13, 1, 'rgba(12,8,20,.34)');
    R(g, -7, 1, 15, 1, 'rgba(12,8,20,.22)');
    R(g, -4, 2, 9, 1, 'rgba(12,8,20,.14)');

    if (back || side) hairBack(g, L.hs, T, hair, hD, hL);

    const legF = (x, lift) => {
      R(g, x, HIPY, 4, LEG - lift - 1, pcol);
      R(g, x, HIPY, 1, LEG - lift - 1, pcolD);
      R(g, x - 1, -2 - lift, 6, 2, shoe);
      R(g, x - 1, -2 - lift, 6, 1, sh(shoe, 0.25));
    };

    if (!sit) {
      if (side) {
        const sw = [0, 2, 0, -2][step];
        R(g, -3 - sw, HIPY, 4, LEG - 2, pcolD); R(g, -4 - sw, -2, 6, 2, sh(shoe, -0.3));
        R(g, 0 + sw, HIPY, 4, LEG - 2, pcol); R(g, -1 + sw, -2, 6, 2, shoe);
      } else {
        legF(-4, step === 1 ? 2 : 0);
        legF(1, step === 3 ? 2 : 0);
      }
    } else {
      R(g, -5, HIPY, 11, 5, pcol); R(g, -1, HIPY + 5, 4, 6, pcol);
      R(g, -5, HIPY + 11, 8, 2, shoe);
    }

    /* jambes nues sous jupe / robe */
    if (bare && !sit) {
      if (side) { R(g, 0, HIP - 1, 4, 9, skin); R(g, -1, -3, 6, 2, sh(skin, -0.32)); }
      else { R(g, -4, HIP - 1, 3, 9, skin); R(g, 1, HIP - 1, 3, 9, skin); R(g, -3, HIP - 1, 1, 9, sD); }
    }

    /* robe / jupe */
    if (dress || L.bottom === 'skirt') {
      const long = kind === 'evening';
      const len = long ? 12 : 7;
      const w0 = dress ? 12 : 11;
      for (let r = 0; r < len; r++) {
        const w = w0 + Math.round(r * 1.15);
        R(g, -Math.round(w / 2) + 1, HIPY + r, w, 1, r % 3 === 2 ? oD : oc);
      }
      const wl = w0 + Math.round(len * 1.15);
      R(g, -Math.round(wl / 2) + 1, HIPY + len - 1, wl, 1, long ? '#f2e6c8' : oL);
      if (long) R(g, 0, HIPY + 2, 1, len - 2, oL);
    }

    if (side) {
      /* corps de profil */
      R(g, -4, TP, 9, 16, oc);
      R(g, -4, TP, 9, 2, oL);
      R(g, -4, TP + 2, 1, 13, oD);
      R(g, -1, TP + 1, 1, 13, sh(oc, -0.12));
      if (kind === 'suit' || kind === 'blazer' || kind === 'trench' || kind === 'vest') R(g, 1, TP + 1, 3, 6, '#f2ece0');
    } else {
      top(g, kind, oc, oD, oL, TP);
    }

    /* bras */
    const armSw = walk ? (step === 1 ? 1 : step === 3 ? -1 : 0) : 0;
    const drawArm = (x, col, handCol, up) => {
      if (up) { R(g, x, TP - 7, 3, 9, col); R(g, x, TP - 10, 3, 3, handCol); return; }
      const y = TP + 2 + (armSw > 0 ? 1 : 0);
      R(g, x, y, 3, shortSleeve ? 5 : 9, col);
      if (shortSleeve) { R(g, x, y + 5, 3, 4, skin); R(g, x, y + 9, 3, 2, handCol); }
      else R(g, x, y + 9, 3, 2, handCol);
    };
    if (side) {
      drawArm(2, oc, skin, false);
    } else {
      drawArm(-8, oD, sD, false);
      drawArm(5, oc, skin, greet);
    }

    /* tête */
    if (side) {
      const hw = [4, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 4, 3];
      for (let r = 0; r < 15; r++) R(g, -hw[r] + 1, T + r, hw[r] * 2, 1, r === 0 || r === 14 ? skin : skin);
      R(g, -5, T + 2, 1, 12, sD);
      R(g, 4, T + 7, 2, 2, sL);                                  // nez
      R(g, 5, T + 9, 1, 1, sDD);
      R(g, 1, T + 7, 2, 2, '#f7f4ee'); R(g, 2, T + 7, 1, 2, '#241826');
      R(g, 0, T + 11, 3, 1, '#8a4a4a');
    } else {
      const hw = [5, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 6, 5, 4];
      for (let r = 0; r < 15; r++) R(g, -hw[r], T + r, hw[r] * 2 + 1, 1, skin);
      R(g, -8, T + 7, 1, 3, sD); R(g, 7, T + 7, 1, 3, sD);        // oreilles
      for (let r = 1; r < 14; r++) R(g, -hw[r], T + r, 1, 1, sh(skin, -0.12));
      R(g, 3, T + 2, 3, 1, sL);
      if (!back) {
        const ey = T + 7;
        /* sourcils */
        R(g, -5, ey - 3, 3, 1, hD); R(g, 2, ey - 3, 3, 1, hD);
        /* yeux */
        R(g, -4, ey, 3, 2, '#f7f4ee'); R(g, -3, ey, 2, 2, '#241826');
        R(g, 2, ey, 3, 2, '#f7f4ee'); R(g, 3, ey, 2, 2, '#241826');
        R(g, -3, ey, 1, 1, '#7fd0ff'); R(g, 3, ey, 1, 1, '#7fd0ff');
        /* nez */
        R(g, -1, ey + 4, 2, 1, sD);
        /* bouche selon l'humeur */
        const mo = stance === 'talk' ? '#5a2230' : '#8a4a4a';
        R(g, -2, ey + 6, 4, 1, mo);
        if (stance === 'talk') R(g, -1, ey + 7, 2, 1, '#5a2230');
        if (F) { R(g, -6, ey + 3, 2, 1, 'rgba(220,120,120,.35)'); R(g, 5, ey + 3, 2, 1, 'rgba(220,120,120,.35)'); }
      }
      if (back) { R(g, -6, T + 4, 13, 8, hair); R(g, -2, T + 5, 5, 1, hL); }
    }

    if (back) hairBack(g, L.hs, T, hair, hD, hL);
    else if (side) {
      R(g, -5, T - 1, 11, 6, hair); R(g, -6, T + 4, 3, 8, hair); R(g, -3, T, 4, 1, hL);
      if (L.hs === 0 || L.hs === 9) R(g, 3, T + 2, 3, 1, hD);
      if (L.hs === 1) { R(g, -6, T - 3, 12, 5, hair); }
      if (L.hs === 4) { R(g, -6, T + 3, 2, 9, hair); R(g, 2, T + 3, 2, 7, hD); }
    } else {
      hairFront(g, L.hs, T, hair, hD, hL);
    }

    if (!back) accs(g, L.acc, skin, sD, hair, kind, TP, T + 7);
    if (back && L.acc === 'scarf') R(g, -5, TP - 2, 10, 2, '#d94f3d');
  }

  function sprite(L, dir, fi, stance) {
    const d = dir === 3 ? 1 : dir;
    const key = [L.skin, L.hs, L.hc, L.outfit, L.garm || 0, L.bottom, L.acc, L.gender, d, fi, stance, dir === 3 ? 'm' : ''].join('|');
    let s = cache.get(key);
    if (s) return s;
    const [cv, g] = buf();
    g.save();
    g.translate(OX, OY);
    if (dir === 3) g.scale(-1, 1);
    try { paint(g, L, d, fi, stance); } catch (e) {}
    g.restore();
    s = { cv };
    if (cache.size > 400) cache.clear();
    cache.set(key, s);
    return s;
  }

  /* ---------------- monde ---------------- */
  const apxOf = (R) => ((R && R.tw ? R.tw : 64) / 32);

  drawAvatar = function (c, x, y, u, L, dir, t, moving, mood, jump) {
    try {
      const Rr = (typeof G !== 'undefined' && G && G.R) || null;
      const apx = apxOf(Rr);
      const k = Rr && Rr.u ? u / Rr.u : u;
      const Z = (c.getTransform && c.getTransform().a) || 1;
      const ps = Math.max(1, Math.round(apx * k * Z)) / Z;
      const stance = moving ? 'walk' : (mood === 'talk' ? 'talk' : 'idle');
      const fi = moving ? Math.floor(t * 8) % 4 : Math.floor(t * 2) % 2;
      const s = sprite(L || {}, (dir | 0) % 4, fi, stance);
      const px = Math.round(x / ps) * ps, py = Math.round(y / ps) * ps;
      c.save();
      c.imageSmoothingEnabled = false;
      c.drawImage(s.cv, px - OX * ps, py - OY * ps, BW * ps, BH * ps);
      c.restore();
    } catch (e) {
      const s = sprite(L || {}, (dir | 0) % 4, 0, 'idle');
      c.drawImage(s.cv, x - OX * 2, y - OY * 2, BW * 2, BH * 2);
    }
  };

  /* ---------------- portraits & vignettes ---------------- */
  const POSE_STANCE = (pose) => {
    const p = String(pose || '');
    if (/walk/i.test(p)) return 'walk';
    if (/wave|greet|hello|salut/i.test(p)) return 'greet';
    if (/talk|speak|parle/i.test(p)) return 'talk';
    if (/sit/i.test(p)) return 'sit';
    return 'idle';
  };

  drawPortrait = function (cv, L, pose, bg) {
    if (!cv || !cv.getContext) return;
    const w = cv.width, h = cv.height, c = cv.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, w, h);
    const c1 = (bg && bg[0]) || '#e9e4d8', c2 = (bg && bg[1]) || '#cfc7b8';
    for (let y2 = 0; y2 < h; y2 += 4) {
      const p = y2 / h;
      c.fillStyle = p < 0.5 ? c1 : c2;
      c.fillRect(0, y2, w, 4);
    }
    c.fillStyle = 'rgba(255,255,255,.18)';
    for (let y2 = 0; y2 < h; y2 += 8) for (let x2 = (y2 / 8) % 2 ? 4 : 0; x2 < w; x2 += 8) c.fillRect(x2, y2, 4, 4);
    const stance = POSE_STANCE(pose);
    const fi = stance === 'walk' ? 0 : 1;
    const s = sprite(L || {}, 0, fi, stance);
    const ps = Math.max(0.5, h / 50);
    const px = Math.round(w / 2), py = Math.round(h * 0.98);
    c.drawImage(s.cv, px - OX * ps, py - OY * ps, BW * ps, BH * ps);
  };

  /* ---------------- grands personnages (menu, accueil, aperçu) ---------------- */
  drawPerson = function (c, x, y, s, L, pose, t, face) {
    try {
      const stance = POSE_STANCE(pose);
      const fi = stance === 'walk' ? Math.floor(t * 8) % 4 : Math.floor(t * 2) % 2;
      const sp = sprite(L || {}, face < 0 ? 3 : 0, fi, stance);
      const ps = Math.max(1, Math.round(118 * s / 47));
      const px = Math.round(x / ps) * ps, py = Math.round(y / ps) * ps;
      c.save();
      c.imageSmoothingEnabled = false;
      c.drawImage(sp.cv, px - OX * ps, py - OY * ps, BW * ps, BH * ps);
      c.restore();
    } catch (e) {}
  };
})();
