const px = (g, x, y, w, h, color) => { g.fillStyle = color; g.fillRect(x, y, w, h); };
export default function AvatarDetails(g, L, dir, mood, frame, kind) {
  if (dir === 2) return;
  const front = dir === 0, left = dir === 3, eye = left ? 25 : 39, mouth = left ? 24 : 38;
  if (mood === 'talk') { px(g, mouth, 33, 3, 2, '#592b31'); px(g, mouth, 33, 2, 1, '#e3c3ac'); }
  if (mood === 'smile' || mood === 'win') { px(g, mouth, 34, 3, 1, '#703b39'); px(g, mouth + 1, 35, 1, 1, '#703b39'); }
  if (mood === 'angry' || L.face === 2) { px(g, eye - 1, 21, 3, 1, '#25191c'); px(g, eye + (left ? -1 : 1), 22, 2, 1, '#25191c'); }
  if (mood === 'sad') px(g, mouth + 1, 32, 2, 1, '#8f5151');
  if (L.face === 3) { [[eye - 3, 29], [eye - 1, 30], [eye + 2, 29]].forEach(([x, y]) => px(g, x, y, 1, 1, '#9d6952')); }
  const acc = L.acc || 'none';
  if (acc === 'glasses' || L.glasses === 1) {
    px(g, eye - 3, 23, 7, 1, '#232636'); px(g, eye - 3, 26, 7, 1, '#232636');
    px(g, eye - 3, 24, 1, 2, '#232636'); px(g, eye + 3, 24, 1, 2, '#232636'); px(g, eye - 2, 24, 2, 1, '#abd5df');
    if (front) { px(g, 30, 23, 7, 1, '#232636'); px(g, 30, 26, 7, 1, '#232636'); px(g, 30, 24, 1, 2, '#232636'); px(g, 36, 24, 3, 1, '#232636'); }
  }
  if (acc === 'beard') { px(g, mouth - 2, 36, 6, 2, HAIRS[L.hc] || '#30201c'); px(g, mouth, 38, 3, 1, '#342323'); }
  if (acc === 'earrings' || L.jewel === 1) { px(g, left ? 39 : 24, 34, 1, 4, '#d0a457'); px(g, left ? 38 : 23, 35, 3, 1, '#f4dc91'); }
  if (acc === 'necklace' || L.jewel === 2) { px(g, 28, 43, 2, 1, '#e9c36b'); px(g, 30, 44, 5, 1, '#c99c47'); px(g, 32, 45, 1, 2, '#ffe29a'); }
  if (acc === 'tie') { px(g, 33, 44, 2, 2, '#872d3e'); px(g, 33, 46, 2, 8, '#b7424e'); px(g, 34, 46, 1, 7, '#d86364'); }
  if (acc === 'bowtie' || kind === 'smoking') { px(g, 29, 44, 3, 2, '#251e2a'); px(g, 34, 44, 3, 2, '#251e2a'); px(g, 32, 44, 2, 2, '#503044'); }
  if (acc === 'scarf') { px(g, 27, 42, 12, 2, '#ba4a43'); px(g, 35, 44, 3, 7, '#d57963'); px(g, 36, 44, 1, 6, '#efac82'); }
  if (L.jewel === 3) { px(g, left ? 44 : 18, 76, 4, 2, '#202835'); px(g, left ? 45 : 19, 76, 2, 1, '#cdb36d'); }
  if (kind === 'turtleneck') { px(g, 27, 41, 11, 4, OUTFITS[L.outfit] || '#344153'); px(g, 28, 42, 9, 1, '#6e7d8a'); }
}