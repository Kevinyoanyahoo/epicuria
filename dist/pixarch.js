/* EpicurIA · architecture pixel-art des salles
   Détaille les murs et les sols dans la même grille de pixels que le mobilier :
   plinthes, soubassement, panneaux muraux, ombre de plafond et liseré de sol.
   Appelé par pixroom.js à l'intérieur du calque basse résolution. */
(function () {
  window.PIXARCH = function (g, R) {
    if (!R || typeof wallQuad !== 'function' || typeof IP !== 'function') return;
    const s = R.u || 1;
    const wc = R.wallc || ['#e7dcc6', '#d3c5a8'];
    const base = typeof shade === 'function' ? shade(wc[0], -0.42) : '#3a3440';
    const baseL = typeof shade === 'function' ? shade(wc[0], -0.18) : '#8a8496';
    const seam = 'rgba(30,22,40,.16)';
    const poly = (pts, fill) => {
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length; k++) g.lineTo(pts[k][0], pts[k][1]);
      g.closePath(); g.fillStyle = fill; g.fill();
    };
    const wall = (side, p0, p1, z0, z1, fill) => poly(wallQuad(R, side, p0, p1, z0 * s, z1 * s), fill);

    /* plinthes + soubassement */
    wall('R', 0, R.w, 0, 7, base);
    wall('R', 0, R.w, 7, 9, baseL);
    wall('L', 0, R.h, 0, 7, typeof shade === 'function' ? shade(wc[1], -0.46) : base);
    wall('L', 0, R.h, 7, 9, typeof shade === 'function' ? shade(wc[1], -0.22) : baseL);

    /* panneaux muraux : refends verticaux tous les 2 mètres */
    for (let i = 1; i < R.w; i += 2) wall('R', i - 0.03, i + 0.03, 9, 62, seam);
    for (let j = 1; j < R.h; j += 2) wall('L', j - 0.03, j + 0.03, 9, 62, seam);
    wall('R', 0, R.w, 60, 63, seam);
    wall('L', 0, R.h, 60, 63, seam);

    /* ombre douce sous le plafond */
    wall('R', 0, R.w, 196, 206, 'rgba(20,14,32,.18)');
    wall('L', 0, R.h, 196, 206, 'rgba(20,14,32,.22)');

    /* liseré de sol : cadre intérieur discret */
    const lw = Math.max(1.5, 2 * (R.tw || 64) / 32);
    g.lineWidth = lw;
    g.strokeStyle = 'rgba(255,255,255,.10)';
    g.beginPath();
    const a = IP(R, 0.12, 0.12, 0), b = IP(R, R.w - 0.12, 0.12, 0);
    const c2 = IP(R, R.w - 0.12, R.h - 0.12, 0), d = IP(R, 0.12, R.h - 0.12, 0);
    g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c2[0], c2[1]); g.lineTo(d[0], d[1]); g.closePath();
    g.stroke();
  };
})();
