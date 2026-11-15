import { loadPixelAssets } from '@/components/world/PixelAssets';
import AvatarRenderer from '@/components/world/AvatarRenderer';
import FurnitureRenderer from '@/components/world/FurnitureRenderer';
import SurfaceTextures from '@/components/world/SurfaceTextures';
import AppearanceControls from '@/components/world/AppearanceControls';
export default async function WorldArt() {
  const status = document.createElement('div'); status.className = 'mut'; status.setAttribute('role', 'status');
  status.textContent = 'Préparation des sprites pixel art…'; document.getElementById('sTitle')?.append(status);
  try {
    const assets = await loadPixelAssets();
    AvatarRenderer(assets); FurnitureRenderer(assets);
    window.EPICURIA_ART = { ...SurfaceTextures(), standard: assets.manifest.standard, sources: assets.manifest.atlases };
    AppearanceControls();
    if (typeof TSC !== 'undefined' && TSC?.R) TSC.R._c = {};
    if (typeof G !== 'undefined' && G?.R) G.R._c = {};
    if (typeof STAGES !== 'undefined') Object.keys(STAGES).forEach(key => { delete STAGES[key]; });
    if (typeof TITLE_ST !== 'undefined') TITLE_ST = null;
    if (typeof TSC !== 'undefined') TSC = null;
    if (typeof TST !== 'undefined') TST = null;
    document.querySelectorAll('#pbC, #prC, #hxTR canvas').forEach(cv => { if (typeof S !== 'undefined') drawPortrait(cv, S.look, 'smile'); });
    status.remove();
  } catch (error) {
    status.textContent = 'Les sprites n’ont pas pu être chargés. Recharge la page.';
    console.error('Pixel artwork loading:', error);
  }
}