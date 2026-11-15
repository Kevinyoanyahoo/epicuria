/* global S:readonly, FDEF:readonly, G:readonly, TSC:writable, STAGES:readonly, TITLE_ST:writable */
// The classic Canvas script in index.html owns these lexical bindings.
// Keep this intentional legacy boundary here; art modules import the facade below.
const GameEngine = {
  get catalog() {
    const look = window.HXLOOK;
    return { SKINS: look.SKINS, HAIRS: look.HAIRCOLS, OUTFITS: look.OUTFITS, GARMS: look.GARMS };
  },
  get player() { return S; },
  get furniture() { return FDEF; },
  project(...args) { return window.IP(...args); },
  get sanitizeLook() { return window.sanLook; },
  set sanitizeLook(fn) { window.sanLook = fn; },
  get fillCreate() { return window.fillCreate; },
  set fillCreate(fn) { window.fillCreate = fn; },
  refreshPreview(...args) { return window.refreshPrev(...args); },
  get paintRoomStatic() { return window.paintRoomStatic; },
  set paintRoomStatic(fn) { window.paintRoomStatic = fn; },
  get wallItem() { return window.wallItem; },
  set wallItem(fn) { window.wallItem = fn; },
  set drawAvatar(fn) { window.drawAvatar = fn; },
  set drawPerson(fn) { window.drawPerson = fn; },
  set drawBust(fn) { window.drawBust = fn; },
  set drawPortrait(fn) { window.drawPortrait = fn; },
  get drawPortrait() { return window.drawPortrait; },
  clearArtCaches() {
    if (TSC?.R) TSC.R._c = {};
    if (G?.R) G.R._c = {};
    Object.keys(STAGES).forEach(key => { delete STAGES[key]; });
    TITLE_ST = null;
    TSC = null;
  }
};
export default GameEngine;