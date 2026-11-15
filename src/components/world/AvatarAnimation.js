import { canvas } from '@/components/world/PixelAssets';
import AvatarDetails from '@/components/world/AvatarDetails';
function section(g, image, x, y, w, h, dx = 0, dy = 0) { g.drawImage(image, x, y, w, h, x + dx, y + dy, w, h); }
export default function AvatarAnimation(getLayers) {
  const frames = new Map();
  return function sprite(L, dir, frame = 0, mood = 'neutral', stance = 'idle') {
    const key = JSON.stringify([L, dir, frame, mood, stance]); if (frames.has(key)) return frames.get(key);
    const parts = getLayers(L, dir), cv = canvas(), g = cv.getContext('2d');
    const phase = frame * Math.PI / 4, swing = stance === 'walk' ? Math.round(Math.sin(phase) * 3) : 0;
    const liftA = stance === 'walk' ? Math.max(0, Math.round(Math.cos(phase) * 3)) : 0;
    const liftB = stance === 'walk' ? Math.max(0, Math.round(-Math.cos(phase) * 3)) : 0;
    const side = dir === 1 || dir === 3;
    // Two articulated legs. The planted foot stays at the ground anchor; no floating torso.
    [[15, 18, -swing, liftA], [33, 20, swing, liftB]].forEach(([x, w, dx, lift]) => {
      const move = side ? dx : Math.round(dx / 2);
      section(g, parts.base, x, 68, w, 28, move, stance === 'sit' ? -9 : 0);
      section(g, parts.base, x, 96, w, 23, move + (lift ? 1 : 0), -lift + (stance === 'sit' ? -9 : 0));
    });
    section(g, parts.base, 23, 42, 20, 29);
    if (parts.dress) {
      g.clearRect(13, 70, 41, 38);
      const legs = canvas(), lg = legs.getContext('2d'); lg.drawImage(parts.base, 0, 0);
      const pixels = lg.getImageData(0, 96, 64, 12);
      const tone = parts.skin.match(/\w\w/g).map(v => parseInt(v, 16));
      for (let i = 0; i < pixels.data.length; i += 4) if (pixels.data[i + 3]) {
        const v = (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 150;
        for (let k = 0; k < 3; k++) pixels.data[i + k] = Math.min(255, Math.round(tone[k] * Math.max(.55, Math.min(1.05, v))));
      }
      lg.putImageData(pixels, 0, 96); section(g, legs, 15, 96, 38, 12);
    }
    const drawClothing = image => {
      section(g, image, 22, 36, 22, 69);
      section(g, image, 0, 36, 22, 64, swing ? -1 : 0, Math.round(swing / 2));
      if (stance === 'greet') {
        g.save(); g.translate(44, 44); g.rotate(-Math.PI * .65);
        g.drawImage(image, 44, 44, 20, 42, 0, 0, 20, 42); g.restore();
      } else section(g, image, 44, 36, 20, 64, swing ? 1 : 0, -Math.round(swing / 2));
    };
    if (parts.under) drawClothing(parts.under);
    drawClothing(parts.top); if (parts.outer) drawClothing(parts.outer);
    if (parts.skirt) section(g, parts.skirt, 16, 66, 38, 32);
    section(g, parts.face, 0, 0, 64, 44);
    section(g, parts.hair, 0, 0, 64, 70);
    AvatarDetails(g, L, dir, mood, frame, parts.kind);
    if (frames.size >= 768) frames.clear(); frames.set(key, cv); return cv;
  };
}