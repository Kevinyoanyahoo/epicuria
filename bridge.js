// EpicurIA × Base44 : couche de connexion.
// Le jeu parle à « window.claude.use(nom) » (user, db, room, sample, tts).
// Ce fichier fournit les mêmes fonctions en s'appuyant sur Base44 : comptes, données, salle temps réel, IA.
import { createClient } from '@base44/sdk';

const base44 = createClient({ appId: import.meta.env.VITE_BASE44_APP_ID });
window.base44 = base44;
const done = () => window.__bridgeResolve && window.__bridgeResolve();

/* ---------- Écran de connexion ---------- */
function gate() {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.id = 'b44gate';
    el.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(14,16,36,.94);font-family:system-ui,sans-serif;padding:24px';
    el.innerHTML = `<div style="max-width:380px;width:100%;background:#20264F;border:2px solid #353b6a;border-radius:20px;padding:24px;color:#fff;text-align:center">
      <div style="font-size:30px;font-weight:800;letter-spacing:2px;color:#FFC928">EPICUR<span style="color:#7FD48A">IA</span></div>
      <p style="color:#cdd3ff;line-height:1.45;margin:14px 0 20px">Connecte-toi pour retrouver ta progression sur tous tes appareils et retrouver les autres joueurs en ligne.</p>
      <button id="b44in" style="width:100%;padding:14px;border:0;border-radius:14px;background:#FFC928;color:#151832;font-size:17px;font-weight:800;cursor:pointer">Se connecter ou créer un compte</button>
      <button id="b44solo" style="width:100%;margin-top:10px;padding:12px;border:2px solid #353b6a;border-radius:14px;background:transparent;color:#cdd3ff;font-size:15px;cursor:pointer">Jouer sans compte (sur cet appareil)</button></div>`;
    document.body.appendChild(el);
    el.querySelector('#b44in').onclick = () => base44.auth.redirectToLogin(window.location.href);
    el.querySelector('#b44solo').onclick = () => { el.remove(); resolve(false); };
  });
}

/* ---------- Données (profils publics, sauvegarde, offres) ---------- */
function makeDb(uid) {
  const E = base44.entities;
  const ids = {}; // cache des identifiants d'enregistrement
  async function findOne(ent, key, val) {
    const k = ent + ':' + key + ':' + val;
    const rows = await E[ent].filter({ [key]: val });
    const r = rows && rows[0];
    if (r) ids[k] = r.id;
    return r || null;
  }
  async function upsert(ent, key, val, fields) {
    const k = ent + ':' + key + ':' + val;
    let id = ids[k];
    if (!id) { const r = await findOne(ent, key, val); id = r && r.id; }
    if (id) return E[ent].update(id, fields);
    const r = await E[ent].create(Object.assign({ [key]: val }, fields));
    ids[k] = r.id;
    return r;
  }
  const snap = (rows, idf) => ({ docs: (rows || []).map((r) => ({ id: r[idf], data: () => Object.assign({}, r.data || {}) })) });

  function doc(path) {
    let m;
    if ((m = path.match(/^players\/(.+)$/))) return {
      set: (d) => upsert('Player', 'uid', m[1], { xp: +d.xp || 0, data: d }),
    };
    if ((m = path.match(/^data\/users\/(.+)\/save$/))) return {
      get: async () => { const r = await findOne('Save', 'uid', m[1]); return { exists: !!r, data: () => (r ? r.data : null) }; },
      set: (v) => upsert('Save', 'uid', m[1], { ts: +v.ts || Date.now(), data: v }),
    };
    if ((m = path.match(/^offers\/(.+)$/))) return {
      set: (o) => upsert('Offer', 'oid', m[1], { from: o.from || '', to: o.to || '', data: o }),
      update: async (patch) => { const r = await findOne('Offer', 'oid', m[1]); const data = Object.assign({}, r ? r.data : {}, patch); return upsert('Offer', 'oid', m[1], { data }); },
    };
    throw new Error('Chemin non pris en charge : ' + path);
  }

  function collection(name) {
    const q = { name, where: null, order: null, lim: 50 };
    const api = {
      where(f, op, v) { q.where = [f, v]; return api; },
      orderBy(f, dir) { q.order = (dir === 'desc' ? '-' : '') + f; return api; },
      limit(n) { q.lim = n; return api; },
      doc(id) { return doc(name + '/' + id); },
      onSnapshot(cb, onErr) {
        const ent = name === 'players' ? 'Player' : name === 'offers' ? 'Offer' : null;
        if (!ent) { onErr && onErr(new Error('collection inconnue')); return () => {}; }
        const idf = ent === 'Player' ? 'uid' : 'oid';
        let t = 0, alive = true;
        const run = async () => {
          try {
            const rows = q.where ? await E[ent].filter({ [q.where[0]]: q.where[1] }, q.order || '-updated_date', q.lim)
                                 : await E[ent].list(q.order || '-updated_date', q.lim);
            if (alive) cb(snap(rows, idf));
          } catch (e) { onErr && onErr(e); }
        };
        const soon = () => { clearTimeout(t); t = setTimeout(run, 800); };
        run();
        let unsub = () => {};
        try { unsub = E[ent].subscribe(soon) || (() => {}); } catch (e) {}
        const iv = setInterval(run, 30000);
        return () => { alive = false; clearInterval(iv); try { unsub(); } catch (e) {} };
      },
    };
    return api;
  }
  return { doc, collection };
}

/* ---------- Salle temps réel (actor Base44 « Room ») ---------- */
function makeRoom(me) {
  let connId = sessionStorage.getItem('epz_conn');
  if (!connId) { connId = crypto.randomUUID(); sessionStorage.setItem('epz_conn', connId); }
  const conn = base44.actors.Room('lobby').connect({ id: connId });
  let myPeer = null, mine = {};
  const peers = new Map();
  const peerFns = [], evFns = {};
  const notify = () => {
    const list = [{ peer: myPeer || 'me', isMe: true, by: me ? me.id : null, presence: mine }];
    peers.forEach((p) => { if (p.peer !== myPeer) list.push({ peer: p.peer, by: p.by || null, presence: p.presence || {} }); });
    peerFns.forEach((f) => { try { f({ peers: list }); } catch (e) {} });
  };
  conn.subscribe((msg) => {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'you') { myPeer = msg.peer; notify(); }
    else if (msg.type === 'peers') { peers.clear(); (msg.peers || []).forEach((p) => peers.set(p.peer, p)); notify(); }
    else if (msg.type === 'pr') { peers.set(msg.peer, { peer: msg.peer, by: msg.by, presence: msg.presence }); notify(); }
    else if (msg.type === 'left') { peers.delete(msg.peer); notify(); }
    else if (msg.type === 'ev') {
      const isMe = msg.peer === myPeer;
      (evFns[msg.topic] || []).forEach((f) => { try { f({ peer: msg.peer, by: msg.by, data: msg.data, isMe, sameTab: isMe }); } catch (e) {} });
    }
  });
  window.addEventListener('pagehide', () => { try { conn.close(); } catch (e) {} });
  return {
    presence: async (p) => { mine = p || {}; conn.send({ type: 'presence', p: mine }); },
    onPeers: (fn) => { peerFns.push(fn); notify(); return () => {}; },
    emit: async (topic, data) => { conn.send({ type: 'ev', topic, data }); },
    on: (topic, fn) => { (evFns[topic] = evFns[topic] || []).push(fn); return () => {}; },
  };
}

/* ---------- IA (jury, analyse de profil, missions sur mesure) ---------- */
function makeSample() {
  const ask = async (prompt) => {
    const r = await base44.integrations.Core.InvokeLLM({ prompt });
    return typeof r === 'string' ? r : JSON.stringify(r);
  };
  const sample = async (prompt) => ({ text: await ask(prompt) });
  sample.json = async (prompt) => {
    const r = await base44.integrations.Core.InvokeLLM({ prompt: prompt + '\n\nRéponds uniquement avec un objet JSON valide, sans texte autour.' });
    if (r && typeof r === 'object') return r;
    const s = String(r || '');
    return JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1));
  };
  return sample;
}

/* ---------- Démarrage ---------- */
(async () => {
  let me = null;
  try { if (await base44.auth.isAuthenticated()) me = await base44.auth.me(); } catch (e) {}
  if (!me) { await gate(); window.claude = { use: async () => null }; done(); return; }
  const caps = { user: { id: async () => me.id, me: async () => me } };
  try { caps.db = makeDb(me.id); } catch (e) { console.warn('db', e); }
  try { caps.room = makeRoom(me); } catch (e) { console.warn('room', e); }
  try { caps.sample = makeSample(); } catch (e) { console.warn('ia', e); }
  window.claude = { use: async (n) => caps[n] || null };
  window.EPZ_LOGOUT = () => base44.auth.logout();
  done();
})();
