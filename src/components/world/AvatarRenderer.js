import { ART } from '@/components/world/PixelAssets';
import AvatarLayers from '@/components/world/AvatarLayers';
import AvatarAnimation from '@/components/world/AvatarAnimation';
export default function AvatarRenderer(assets) {
  const sprite = AvatarAnimation(AvatarLayers(assets));
  const pose = p => /walk/i.test(p || '') ? 'walk' : /sit/i.test(p || '') ? 'sit' : 'idle';
  const draw = (c, x, y, scale, L, dir, t, moving, mood, jump) => {
    const fi = moving ? Math.floor(t * 10) % 8 : 0, image = sprite(L || {}, ((dir | 0) + 4) % 4, fi, mood || 'neutral', moving ? 'walk' : 'idle');
    const lift = jump ? Math.round(Math.abs(Math.sin(t * 9)) * 7) : 0;
    c.save(); c.imageSmoothingEnabled = false;
    [18, 26, 20].forEach((width, row) => {
      c.fillStyle = row === 1 ? 'rgba(19,13,25,.24)' : 'rgba(19,13,25,.12)';
      c.fillRect(Math.round(x - width * scale / 2), Math.round(y + row * scale), width * scale, scale);
    });
    c.drawImage(image, Math.round(x - ART.anchorX * scale), Math.round(y - (ART.anchorY + lift) * scale), 64 * scale, 128 * scale); c.restore();
  };
  drawAvatar = (c, x, y, u, L, dir, t, moving, mood, jump) => draw(c, x, y, u, L, dir, t || 0, moving, mood, jump);
  drawPerson = (c, x, y, scale, L, p, t, face) => {
    const s = pose(p); draw(c, x, y, scale * 1.1, L, face < 0 ? 3 : 0, t || 0, s === 'walk', /smile|win/.test(p || '') ? 'smile' : /talk/.test(p || '') ? 'talk' : 'neutral', false);
  };
  drawBust = (c, x, y, scale, L, mood) => {
    const image = sprite(L || {}, 0, 0, mood || 'neutral'); c.save(); c.imageSmoothingEnabled = false;
    c.drawImage(image, 12, 0, 42, 68, Math.round(x - 21 * scale), Math.round(y - 34 * scale), 42 * scale, 68 * scale); c.restore();
  };
  drawPortrait = (cv, L, p = 'idle', bg) => {
    if (!cv) return; const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, cv.width, cv.height); c.fillStyle = bg?.[0] || '#e8dfcf'; c.fillRect(0, 0, cv.width, cv.height);
    const image = sprite(L || {}, 0, 0, /smile|win/.test(p) ? 'smile' : /talk/.test(p) ? 'talk' : 'neutral', pose(p));
    const scale = Math.min(cv.width / 48, cv.height / 112), x = Math.round((cv.width - 64 * scale) / 2);
    c.drawImage(image, x, Math.round(cv.height - 119 * scale), 64 * scale, 128 * scale);
  };
  return sprite;
}