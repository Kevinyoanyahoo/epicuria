import { loadPixelAssets } from '@/components/world/PixelAssets';
import GameEngine from '@/components/world/GameEngine';
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
    document.querySelectorAll('canvas').forEach(cv => { cv.style.imageRendering = 'pixelated'; });
    window.EPICURIA_ART = { ...SurfaceTextures(), standard: assets.manifest.standard, sources: assets.manifest.atlases };
    AppearanceControls();
    GameEngine.clearArtCaches();
    document.querySelectorAll('#pbC, #prC, #hxTR canvas').forEach(cv => GameEngine.drawPortrait(cv, GameEngine.player.look, 'smile'));
    status.remove();
  } catch (error) {
    status.textContent = 'Les sprites n’ont pas pu être chargés. Recharge la page.';
    console.error('Pixel artwork loading:', error);
  }
}