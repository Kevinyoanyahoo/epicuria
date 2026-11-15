import { canvas, recolor } from '@/components/world/PixelAssets';
export default function FurnitureRenderer(assets) {
  const cache = new Map();
  Object.entries(assets.manifest.furniture).forEach(([type, def]) => {
    if (!FDEF[type]) return;
    const original = FDEF[type].draw, nativeW = FDEF[type].w, nativeD = FDEF[type].d;
    FDEF[type].draw = (c, R, f, t) => {
      const key = `${type}|${f.c || ''}|${f.scr || ''}`, [x, y, w, h] = def.crop;
      let image = cache.get(key);
      if (!image) {
        image = canvas(w, h); image.getContext('2d').drawImage(assets.sheets[def.atlas].image, def.col * 256 + x, def.row * 256 + y, w, h, 0, 0, w, h);
        if (f.c && ['sofa', 'armchair', 'chair', 'massage'].includes(type)) image = recolor(image, f.c,
          (r, g, b, px, py) => py < h * .88 && (type === 'sofa' ? r > g * 1.35 && g > b * 1.2 : type === 'armchair' ? g >= r && g > b * 1.25 : b > r * 1.2),
          type === 'sofa' ? [184, 88, 40] : type === 'armchair' ? [64, 88, 24] : [32, 56, 88]);
        if (f.scr) image = recolor(image, f.scr, (r, g, b) => b > r * 1.8 && g > r * 1.8, [24, 136, 168]);
        cache.set(key, image);
      }
      const fw = f.w || nativeW, fd = f.d || nativeD, ratio = (fw + fd) / (nativeW + nativeD);
      const scale = R.tw / 64, [px, py] = IP(R, f.i + fw / 2, f.j + fd / 2);
      const width = w * scale * ratio, height = h * scale * ratio;
      c.save(); c.imageSmoothingEnabled = false;
      [.38, .52, .64, .52, .38].forEach((spread, row) => {
        c.fillStyle = row === 2 ? 'rgba(25,16,26,.16)' : 'rgba(25,16,26,.08)';
        c.fillRect(Math.round(px - width * spread / 2), Math.round(py + (row - 2) * scale), width * spread, Math.max(1, scale));
      });
      c.drawImage(image, Math.round(px - width / 2), Math.round(py + (fw + fd) * 8 * scale - height), width, height); c.restore();
    };
    FDEF[type].draw.originalPixelRenderer = original;
  });
}