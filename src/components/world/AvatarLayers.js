import { cell, canvas, recolor } from '@/components/world/PixelAssets';
import GameEngine from '@/components/world/GameEngine';
const skinPixel = (r, g, b) => r > g * 1.15 && g > b * 1.15;
const trousers = ['#293447', '#746049', '#d4c9ac', '#171e27'];
const shoes = ['#24212a', '#855030', '#dbd4c3', '#682c3c'];
const HAIR_ROWS = [['hair', 0], ['hair', 1], ['hair', 2], ['hair', 3], ['hair', 4], ['hair', 5], ['hairExtra', 0], ['hairExtra', 1], ['hairExtra', 2], ['hairExtra', 3], ['hairExtra', 4]];
const garment = { suit: ['rig', 3], blazer: ['rig', 3], shirt: ['rig', 2], turtleneck: ['rig', 2], dress: ['wardrobe', 1], evening: ['wardrobe', 1], blouse: ['wardrobe', 3], boubou: ['wardrobe', 0], polo: ['rig', 2], trench: ['wardrobe', 2], vest: ['rig', 3], smoking: ['rig', 3] };
export default function AvatarLayers(assets) {
  const { SKINS, HAIRS, OUTFITS, GARMS } = GameEngine.catalog;
  const cache = new Map();
  const tintTop = (cv, L, color, kind) => {
    let result = recolor(cv, color, (r, g, b, x, y) => !(y > 70 && (x < 24 || x > 42) && skinPixel(r, g, b)) && !(r > 140 && g > 120 && b < g * .65), kind === 'blazer' || kind === 'suit' || kind === 'smoking' || kind === 'vest' ? [56, 72, 104] : kind === 'dress' || kind === 'evening' ? [136, 48, 24] : kind === 'boubou' ? [16, 80, 48] : [208, 192, 160]);
    return recolor(result, SKINS[L.skin] || SKINS[3], (r, g, b, x, y) => y > 70 && (x < 24 || x > 42) && skinPixel(r, g, b));
  };
  return function layers(L, dir) {
    const key = JSON.stringify([L, dir]); if (cache.has(key)) return cache.get(key);
    const female = L.gender === 'f', skin = SKINS[L.skin] || SKINS[3], color = OUTFITS[L.outfit] || OUTFITS[0];
    let base = cell(assets, 'rig', female ? 1 : 0, dir);
    base = recolor(base, skin, (r, g, b, x, y) => (y < 44 && skinPixel(r, g, b)) || (y < 94 && (x < 25 || x > 43) && skinPixel(r, g, b)));
    base = recolor(base, trousers[L.trousers || 0], (r, g, b, x, y) => y >= 66 && y < 108 && !(r > g * 1.2), [48, 48, 56]);
    base = recolor(base, shoes[L.shoes || 0], (r, g, b, x, y) => y >= 108, [56, 40, 32]);
    const face = canvas(), fg = face.getContext('2d');
    let faceBase = L.face === 1 ? cell(assets, 'rig', female ? 0 : 1, dir) : base;
    if (L.face === 1) faceBase = recolor(faceBase, skin, (r, g, b, x, y) => y < 44 && skinPixel(r, g, b));
    fg.drawImage(faceBase, 0, 0, 64, 44, 0, 0, 64, 44);
    const kind = (GARMS[L.garm || 0] || GARMS[0]).k;
    const shirtKinds = ['shirt', 'turtleneck', 'polo', 'blouse', 'boubou'];
    const chosenShirt = Number.isInteger(L.shirt) ? shirtKinds[L.shirt] || 'shirt' : Number.isInteger(L.jacket) && !['dress', 'evening', 'boubou', 'blouse'].includes(kind) ? 'shirt' : kind;
    const [sheet, row] = garment[chosenShirt] || garment[kind];
    let top = tintTop(cell(assets, sheet, row, dir), L, OUTFITS[L.shirtColor] || color, chosenShirt);
    let outer = null;
    if (Number.isInteger(L.jacket) && L.jacket >= 0) {
      const outerKinds = [null, 'blazer', 'suit', 'vest', 'trench'], outerKind = outerKinds[L.jacket];
      if (outerKind) {
        const [s, r] = garment[outerKind], layer = cell(assets, s, r, dir), lg = layer.getContext('2d');
        if (outerKind !== 'trench') {
          const data = lg.getImageData(0, 0, 64, 128), p = data.data;
          for (let y = 40; y < 64; y++) for (let x = 25; x < 42; x++) {
            const i = (y * 64 + x) * 4; if (p[i] > 145 && p[i + 1] > 130 && p[i + 2] > 105 && p[i] - p[i + 2] < 80) p[i + 3] = 0;
          }
          lg.putImageData(data, 0, 0);
        }
        outer = tintTop(layer, L, OUTFITS[L.jacketColor] || color, outerKind);
      }
    }
    if (kind === 'vest' || L.jacket === 3) { const vg = (outer || top).getContext('2d'); vg.clearRect(0, 44, 22, 50); vg.clearRect(44, 44, 20, 50); }
    const [hs, hr] = HAIR_ROWS[L.hs || 0] || HAIR_ROWS[0];
    let hair = cell(assets, hs, hr, dir);
    if (L.hs !== 8) hair = recolor(hair, HAIRS[L.hc] || HAIRS[0], () => true, [48, 24, 8]);
    const hg = hair.getContext('2d');
    // The art atlas includes an empty mannequin outline: clear only its face opening.
    if (dir === 0) hg.clearRect(28, 24, 18, 21);
    if (dir === 1) hg.clearRect(35, 24, 18, 21);
    if (dir === 3) hg.clearRect(11, 24, 18, 21);
    const dress = chosenShirt === 'dress' || chosenShirt === 'evening' || L.bottom === 'skirt';
    const skirt = dress && !['dress', 'evening'].includes(chosenShirt) ? tintTop(cell(assets, 'wardrobe', 1, dir), L, color, 'dress') : null;
    const under = kind === 'vest' && !Number.isInteger(L.jacket) ? tintTop(cell(assets, 'rig', 2, dir), L, OUTFITS[L.shirtColor] || '#e9dfca', 'shirt') : null;
    const result = { base, face, top, outer, hair, skirt, under, kind: chosenShirt, dress, skin, color };
    if (cache.size >= 256) cache.clear(); cache.set(key, result); return result;
  };
}