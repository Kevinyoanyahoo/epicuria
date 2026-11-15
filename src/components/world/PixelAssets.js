// Static original PNG artwork; no generation or image filters run during gameplay.
export const ART = { tile: 64, cellW: 64, cellH: 128, anchorX: 32, anchorY: 117 };
export function canvas(w = 64, h = 128) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  cv.getContext('2d').imageSmoothingEnabled = false; return cv;
}
export async function loadPixelAssets() {
  const manifest = await fetch('/art/manifest.json').then(r => { if (!r.ok) throw new Error('Artwork unavailable'); return r.json(); });
  const entries = await Promise.all(Object.entries(manifest.atlases).map(async ([name, def]) => {
    const image = new Image(); image.src = def.url;
    await image.decode(); return [name, { image, ...def }];
  }));
  return { manifest, sheets: Object.fromEntries(entries) };
}
export function cell(assets, name, row, dir) {
  const sheet = assets.sheets[name], [w, h] = sheet.cell, cv = canvas(w, h);
  cv.getContext('2d').drawImage(sheet.image, dir * w, row * h, w, h, 0, 0, w, h); return cv;
}
export function rgb(hex) { return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); }
export function recolor(source, color, predicate, reference = [144, 88, 48]) {
  const cv = canvas(source.width, source.height), g = cv.getContext('2d'); g.drawImage(source, 0, 0);
  const data = g.getImageData(0, 0, cv.width, cv.height), target = rgb(color);
  for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) {
    const i = (y * cv.width + x) * 4, p = data.data;
    if (!p[i + 3] || !predicate(p[i], p[i + 1], p[i + 2], x, y)) continue;
    const luminance = (p[i] + p[i + 1] + p[i + 2]) / (reference[0] + reference[1] + reference[2]);
    for (let k = 0; k < 3; k++) p[i + k] = Math.min(255, Math.round(target[k] * luminance));
  }
  g.putImageData(data, 0, 0); return cv;
}
export function blit(g, cv, x, y, scale = 1) {
  g.imageSmoothingEnabled = false;
  g.drawImage(cv, Math.round(x), Math.round(y), cv.width * scale, cv.height * scale);
}