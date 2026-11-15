/* EpicurIA · personnages illustrés
   Remplace le petit bonhomme pixelisé par les personnages du design validé :
   illustrations 3D peintes, fond transparent, palette crème / brun / vert. */
(function () {
  const SRC = [
    'https://media.base44.com/images/public/6af8f74f0cdae61f0ade2dc8/12c56a5b0_generated_366cae4e.png',
    'https://media.base44.com/images/public/6af8f74f0cdae61f0ade2dc8/ef8d5beb9_generated_3eca2e81.png',
    'https://media.base44.com/images/public/6af8f74f0cdae61f0ade2dc8/477274153_generated_41a1ab63.png',
    'https://media.base44.com/images/public/6af8f74f0cdae61f0ade2dc8/59138b47d_generated_24f2c2cd.png',
    'https://media.base44.com/images/public/6af8f74f0cdae61f0ade2dc8/2c37000bc_generated_431d619a.png',
    'https://media.base44.com/images/public/6af8f74f0cdae61f0ade2dc8/eb9f08017_generated_9d1d1ab7.png',
  ];

  /* hauteur du personnage en unités du monde (alignée sur AV_H du jeu) */
  const H_WORLD = 108;

  const imgs = SRC.map(function (u) {
    const im = new Image();
    im.onload = function () { im._ok = true; };
    im.src = u;
    return im;
  });

  function ready(img) { return !!(img && img._ok && img.naturalWidth > 0); }

  function pick(L) {
    const l = L || {};
    const s = Math.abs(+l.skin || 0), o = Math.abs(+l.outfit || 0), h = Math.abs(+l.hair || 0);
    return imgs[(s * 2 + o * 3 + h) % imgs.length] || null;
  }

  function standing(c, cx, baseY, height, img, flip, sway) {
    const w = height * (img.naturalWidth / img.naturalHeight);
    c.save();
    c.translate(cx, baseY - height / 2);
    if (flip) c.scale(-1, 1);
    if (sway) c.rotate(sway);
    c.drawImage(img, -w / 2, -height / 2, w, height);
    c.restore();
  }

  /* personnage dans le monde : pieds en (x, y) */
  function draw(c, x, y, u, L, dir, t, moving, jump) {
    const img = pick(L);
    if (!ready(img)) return false;
    const h = H_WORLD * u;
    const flip = dir === 1 || dir === 3;
    const bob = (moving ? Math.sin(t * 7) * 1.7 * u : Math.sin(t * 1.7) * 0.7 * u)
      - (jump ? Math.abs(Math.sin(t * 9)) * 7 * u : 0);
    const sway = moving ? Math.sin(t * 7) * 0.028 : 0;
    c.save();
    c.translate(x, y);
    c.fillStyle = 'rgba(0,0,0,.26)';
    c.beginPath();
    c.ellipse(0, 0, 17 * u, 6.5 * u, 0, 0, 7);
    c.fill();
    standing(c, 0, bob, h, img, flip, sway);
    c.restore();
    return true;
  }

  /* portrait carré (fiches joueurs, profil) */
  function portrait(c, w, ratio, L) {
    const img = pick(L);
    if (!ready(img)) return false;
    const h = w * (ratio || 0.94);
    standing(c, w / 2, w - (w - h) / 2, h, img, false, 0);
    return true;
  }

  /* illustration posée en bas d'une zone donnée */
  function fit(c, cx, bottomY, height, L, flip) {
    const img = pick(L);
    if (!ready(img)) return false;
    standing(c, cx, bottomY, height, img, !!flip, 0);
    return true;
  }

  window.HXCHAR = { draw: draw, portrait: portrait, fit: fit, pick: pick, imgs: imgs, H: H_WORLD };
})();
