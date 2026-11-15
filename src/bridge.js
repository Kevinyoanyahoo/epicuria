// EpicurIA × Base44 : couche de connexion.
// Le jeu parle à « window.claude.use(nom) » (user, db, room, sample, tts).
// Ce fichier fournit les mêmes fonctions en s'appuyant sur Base44 : comptes, données, salle temps réel, IA.
import { createClient } from '@base44/sdk';

const base44 = createClient({ appId: import.meta.env.VITE_BASE44_APP_ID });
window.base44 = base44;
const done = () => window.__bridgeResolve && window.__bridgeResolve();

/* ---------- Écran de connexion ---------- */
const GOOGLE_SVG = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.7 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-2.8-.4-4.1H24v8.2h12.5c-.3 2.1-1.6 5.2-4.6 7.3l7.6 5.9c4.5-4.2 6.6-10.3 6.6-17.3z"/><path fill="#FBBC05" d="M10.4 28.7A14.7 14.7 0 0 1 9.6 24c0-1.6.3-3.2.8-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2 1.4-4.7 2.4-8.3 2.4-6.4 0-11.7-3.7-13.6-9l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
const FACEBOOK_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M15.6 12.6h-2.3V21h-3.4v-8.4H8.2V9.7h1.7V8.2c0-2.2 1-3.6 3.6-3.6h2v2.9h-1.3c-.9 0-.9.3-.9.9v1.3h2.3l-.3 2.9z"/></svg>';

const AUTH_CSS = `
#b44gate{position:fixed;inset:0;z-index:99999;overflow-y:auto;padding:18px 16px calc(24px + env(safe-area-inset-bottom));background:radial-gradient(ellipse at 50% -10%,#3a1f4f 0%,#171a33 45%,#0d0f1c 80%);color:#f5f0e4;font-family:'Barlow',system-ui,sans-serif}
#b44gate *{box-sizing:border-box}
#b44gate .wrap{width:100%;max-width:400px;margin:0 auto;display:flex;flex-direction:column;gap:11px;padding-top:max(6px,3vh)}
#b44gate .logo{font-family:'Bangers',Impact,sans-serif;font-size:52px;line-height:.9;text-align:center;letter-spacing:3px;background:linear-gradient(#fff6b0 10%,#ffc928 45%,#ff6a2b 75%,#c2261b);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 3px 0 #120c1a)}
#b44gate .sub{text-align:center;color:#cdd3ff;font-size:14.5px;line-height:1.45;margin:0}
#b44gate .card{background:linear-gradient(180deg,#22264a,#1a1d36);border:2px solid #353b6a;border-radius:18px;padding:15px;display:flex;flex-direction:column;gap:10px}
#b44gate .tabs{display:flex;gap:5px;background:#12152b;border-radius:12px;padding:4px}
#b44gate .tabs button{flex:1;padding:9px 4px;border:0;border-radius:9px;background:transparent;color:#a7a2b8;font-family:'Barlow Condensed',system-ui,sans-serif;font-weight:800;font-size:14.5px;letter-spacing:1px;text-transform:uppercase;cursor:pointer}
#b44gate .tabs button.on{background:linear-gradient(#ffd84a,#ff9a1f);color:#120c1a}
#b44gate label{display:block;font-family:'Barlow Condensed',system-ui,sans-serif;font-weight:700;font-size:12.5px;letter-spacing:1.4px;text-transform:uppercase;color:#a7a2b8}
#b44gate input{width:100%;margin-top:5px;padding:12px;border-radius:11px;border:2px solid #353b6a;background:#141830;color:#fff;font-family:'Barlow',system-ui,sans-serif;font-size:16px;-webkit-user-select:text;user-select:text}
#b44gate input:focus{outline:0;border-color:#ffc928}
#b44gate .go{width:100%;margin-top:2px;padding:13px;border:3px solid #120c1a;border-radius:12px;background:linear-gradient(#ffd84a,#ff9a1f);color:#120c1a;font-family:'Barlow Condensed',system-ui,sans-serif;font-weight:800;font-size:18px;letter-spacing:1.2px;text-transform:uppercase;cursor:pointer;box-shadow:0 4px 0 #8a3b06}
#b44gate .go:disabled{opacity:.62;cursor:progress}
#b44gate .alt{width:100%;padding:11px;border:2px solid #353b6a;border-radius:12px;background:#1c2040;color:#eee9ff;font-family:'Barlow Condensed',system-ui,sans-serif;font-weight:700;font-size:15.5px;letter-spacing:.4px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px}
#b44gate .alt svg{flex:none}
#b44gate .sep{display:flex;align-items:center;gap:10px;color:#6f6a86;font-size:12.5px;text-transform:uppercase;letter-spacing:1.5px}
#b44gate .sep::before,#b44gate .sep::after{content:'';flex:1;height:1px;background:#353b6a}
#b44gate .err{display:none;background:#3a1520;border:1px solid #e5483a;color:#ffd8d2;border-radius:10px;padding:8px 10px;font-size:13.5px;line-height:1.35}
#b44gate .ok{display:none;background:#12301f;border:1px solid #35c76a;color:#c8ffdb;border-radius:10px;padding:8px 10px;font-size:13.5px}
#b44gate .note{font-size:12.5px;color:#8d88a6;text-align:center;line-height:1.4}
#b44gate .otp{font-size:26px;letter-spacing:10px;text-align:center;font-weight:700}
#b44gate .link{border:0;background:transparent;color:#ffc928;font-size:13.5px;cursor:pointer;padding:3px}
#b44gate .solo{border:0;background:transparent;color:#9f9ab6;font-size:13px;text-decoration:underline;cursor:pointer;padding:6px}
`;

function gate() {
  return new Promise((resolve) => {
    const host = document.createElement('div');
    host.id = 'b44gate';
    host.innerHTML = `
<style>${AUTH_CSS}</style>
<div class="wrap">
  <div class="logo">EPICURIA</div>
  <p class="sub">Ton compte garde ta progression et te relie aux autres joueurs.</p>
  <div class="card" id="b44form">
    <div class="tabs"><button type="button" id="b44T1" class="on">Se connecter</button><button type="button" id="b44T2">Créer un compte</button></div>
    <div><label for="b44email">Adresse e-mail</label><input id="b44email" type="email" inputmode="email" autocomplete="email" placeholder="toi@exemple.com"></div>
    <div><label for="b44pass">Mot de passe</label><input id="b44pass" type="password" autocomplete="current-password" placeholder="••••••••"></div>
    <div class="err" id="b44err"></div>
    <button type="button" class="go" id="b44go">Se connecter</button>
    <div class="note">Ta progression est enregistrée dans ton compte et rechargée à chaque connexion.</div>
  </div>
  <div class="card" id="b44code" style="display:none">
    <div style="font-family:'Barlow Condensed',system-ui,sans-serif;font-weight:800;font-size:18px;letter-spacing:1px;text-transform:uppercase;color:#ffc928">Vérifie ton adresse</div>
    <div class="note" style="text-align:left">Un code à 6 chiffres vient d’être envoyé à <b id="b44mail"></b>. Il est valable 10 minutes.</div>
    <input id="b44otp" class="otp" inputmode="numeric" maxlength="6" placeholder="000000" autocomplete="one-time-code">
    <div class="err" id="b44cerr"></div>
    <div class="ok" id="b44cok"></div>
    <button type="button" class="go" id="b44verify">Vérifier mon code</button>
    <button type="button" class="link" id="b44resend">Renvoyer le code</button>
    <button type="button" class="link" id="b44back" style="color:#9f9ab6">Changer d’adresse</button>
  </div>
  <div class="sep">ou</div>
  <button type="button" class="alt" id="b44google">${GOOGLE_SVG}Continuer avec Google</button>
  <button type="button" class="alt" id="b44fb">${FACEBOOK_SVG}Continuer avec Facebook</button>
  <button type="button" class="solo" id="b44solo">Jouer sans compte (progression sur cet appareil)</button>
</div>`;
    document.body.appendChild(host);

    const q = (s) => host.querySelector(s);
    let mode = 'login';
    let email = '';

    const show = (id, on) => { const e = q(id); if (e) e.style.display = on ? 'block' : 'none'; };
    const msg = (id, text) => { const e = q(id); if (!e) return; e.textContent = text || ''; e.style.display = text ? 'block' : 'none'; };
    const lock = (id, on, label) => { const b = q(id); if (!b) return; b.disabled = on; if (label) b.textContent = label; };
    const fail = (e) => {
      const m = String((e && e.message) || e || '').trim();
      if (/verif/i.test(m)) return 'Vérifie d’abord ton adresse : un code t’a été envoyé par e-mail.';
      if (/invalid|incorrect|credential|401|403/i.test(m)) return 'Adresse e-mail ou mot de passe incorrect.';
      if (/exist/i.test(m)) return 'Un compte existe déjà avec cette adresse : connecte-toi.';
      return m || 'Une erreur est survenue. Réessaie dans un instant.';
    };
    const val = () => ({ mail: q('#b44email').value.trim(), pass: q('#b44pass').value });

    function setMode(next) {
      mode = next;
      q('#b44T1').classList.toggle('on', mode === 'login');
      q('#b44T2').classList.toggle('on', mode === 'signup');
      q('#b44go').textContent = mode === 'login' ? 'Se connecter' : 'Créer mon compte';
      q('#b44pass').setAttribute('autocomplete', mode === 'login' ? 'current-password' : 'new-password');
      msg('#b44err', '');
      show('#b44form', true);
      show('#b44code', false);
    }

    const submit = async () => {
      const { mail, pass } = val();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return msg('#b44err', 'Saisis une adresse e-mail valide.');
      if (pass.length < 8) return msg('#b44err', 'Ton mot de passe doit faire au moins 8 caractères.');
      msg('#b44err', '');
      lock('#b44go', true, mode === 'login' ? 'Connexion…' : 'Création…');
      try {
        if (mode === 'login') {
          const r = await base44.auth.loginViaEmailPassword(mail, pass);
          if (r && r.mfa_required) {
            lock('#b44go', false, 'Se connecter');
            return msg('#b44err', 'La double authentification est activée sur ce compte : désactive-la depuis ton profil pour jouer ici.');
          }
          window.location.reload();
        } else {
          await base44.auth.register({ email: mail, password: pass });
          email = mail;
          q('#b44mail').textContent = mail;
          q('#b44otp').value = '';
          msg('#b44cerr', '');
          msg('#b44cok', '');
          show('#b44form', false);
          show('#b44code', true);
          lock('#b44go', false, 'Créer mon compte');
          setTimeout(() => q('#b44otp').focus(), 80);
        }
      } catch (e) {
        const raw = String((e && e.message) || '');
        lock('#b44go', false, mode === 'login' ? 'Se connecter' : 'Créer mon compte');
        if (mode === 'login' && /verif/i.test(raw)) {
          email = mail;
          q('#b44mail').textContent = mail;
          q('#b44otp').value = '';
          show('#b44form', false);
          show('#b44code', true);
          msg('#b44cerr', 'Ton adresse n’est pas encore validée : saisis le code reçu par e-mail.');
          try { await base44.auth.resendOtp(mail); } catch (err) {}
          return;
        }
        if (mode === 'signup' && /exist/i.test(raw)) {
          setMode('login');
          q('#b44email').value = mail;
          return msg('#b44err', 'Un compte existe déjà avec cette adresse : connecte-toi.');
        }
        msg('#b44err', fail(e));
      }
    };

    const verify = async () => {
      const code = (q('#b44otp').value || '').replace(/\D/g, '');
      if (code.length !== 6) return msg('#b44cerr', 'Le code contient 6 chiffres.');
      msg('#b44cerr', '');
      msg('#b44cok', '');
      lock('#b44verify', true, 'Vérification…');
      try {
        const r = await base44.auth.verifyOtp({ email, otpCode: code });
        const token = r && (r.access_token || r.accessToken);
        if (token) base44.auth.setToken(token);
        msg('#b44cok', 'Compte vérifié : on charge ta progression…');
        window.location.reload();
      } catch (e) {
        lock('#b44verify', false, 'Vérifier mon code');
        const m = String((e && e.message) || '');
        msg('#b44cerr', /code|expired|invalid/i.test(m) ? 'Ce code n’est pas valide ou a expiré. Demande-en un nouveau.' : fail(e));
      }
    };

    q('#b44T1').onclick = () => setMode('login');
    q('#b44T2').onclick = () => setMode('signup');
    q('#b44go').onclick = submit;
    q('#b44pass').addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    q('#b44email').addEventListener('keydown', (e) => { if (e.key === 'Enter') q('#b44pass').focus(); });
    q('#b44verify').onclick = verify;
    q('#b44otp').addEventListener('keydown', (e) => { if (e.key === 'Enter') verify(); });
    q('#b44resend').onclick = async () => {
      msg('#b44cerr', '');
      try {
        await base44.auth.resendOtp(email);
        msg('#b44cok', 'Nouveau code envoyé à ' + email + '.');
      } catch (e) {
        msg('#b44cerr', fail(e));
      }
    };
    q('#b44back').onclick = () => setMode('signup');
    q('#b44google').onclick = () => base44.auth.loginWithProvider('google', window.location.pathname || '/');
    q('#b44fb').onclick = () => base44.auth.loginWithProvider('facebook', window.location.pathname || '/');
    q('#b44solo').onclick = () => { host.remove(); resolve(false); };

    setMode('login');
    setTimeout(() => q('#b44email').focus(), 120);
  });
}

/* ---------- Données (profils publics, sauvegarde, offres) ---------- */
// Une offre vient d'un autre joueur : on ne renvoie au jeu que des champs typés et bornés.
const OFFER_STATUSES = ['pending', 'accepted', 'countered', 'refused', 'done', 'failed', 'paid'];
const plain = (v, n) => String(v == null ? '' : v).replace(/[<>&]/g, '').slice(0, n);
const bound = (v, lo, hi, d) => { const n = Math.round(+v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };
const docId = (v) => String(v == null ? '' : v).replace(/[^\w-]/g, '').slice(0, 64);
function safeOffer(raw) {
  return Object.assign({}, raw, {
    from: plain(raw.from, 64), to: plain(raw.to, 64), mission: plain(raw.mission, 32),
    fromName: plain(raw.fromName, 40) || 'Joueur', toName: plain(raw.toName, 40) || 'Joueur',
    fromLv: bound(raw.fromLv, 0, 99, 1), toLv: bound(raw.toLv, 0, 99, 1),
    reward: bound(raw.reward, 0, 10000000, 0), pct: bound(raw.pct, 0, 100, 0),
    counter: raw.counter == null ? null : bound(raw.counter, 0, 100, 0), gf: bound(raw.gf, 0, 1, 0),
    ts: bound(raw.ts, 0, Date.now() + 864e5, 0),
    status: OFFER_STATUSES.includes(raw.status) ? raw.status : 'pending', penalty: !!raw.penalty, bot: raw.bot === true,
  });
}
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
  const snap = (rows, idf, clean) => ({ docs: (rows || []).map((r) => ({ id: clean ? docId(r[idf]) : r[idf], data: () => (clean ? clean(Object.assign({}, r.data || {})) : Object.assign({}, r.data || {})) })) });

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
      // Création côté serveur : l'expéditeur et son nom affiché ne sont jamais choisis par le client.
      set: async (o) => {
        const res = await base44.functions.invoke('sendOffer', {
          oid: m[1], to: o.to, toName: o.toName, toLv: o.toLv, fromLv: o.fromLv,
          mission: o.mission, reward: o.reward, pct: o.pct, penalty: !!o.penalty,
        });
        if (res && res.error) throw new Error(res.error);
        return res && res.data;
      },
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
            if (alive) cb(snap(rows, idf, ent === 'Offer' ? safeOffer : null));
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
    myRoom: () => (mine && mine.rm) || null,
    onPeers: (fn) => { peerFns.push(fn); notify(); return () => {}; },
    emit: async (topic, data) => { conn.send({ type: 'ev', topic, data }); },
    on: (topic, fn) => { (evFns[topic] = evFns[topic] || []).push(fn); return () => {}; },
  };
}

/* ---------- Chat de la salle (temps réel) ---------- */
const ROOM_NAMES = { hall: 'Le Hall', library: 'La Bibliothèque', shop: 'La Boutique', vip: 'Le Salon VIP', bureau: 'Mon bureau', visit: 'une visite' };

function chatStyles() {
  return `
#epzChat{position:fixed;z-index:9500;right:max(10px,calc((100vw - 584px)/2 + 10px));bottom:calc(104px + env(safe-area-inset-bottom));display:none;font-family:'Barlow',system-ui,sans-serif}
#epzChatFab{position:relative;width:52px;height:52px;border-radius:50%;border:3px solid #120c1a;background:linear-gradient(#ffd84a,#ff9a1f);color:#120c1a;font-size:21px;line-height:1;cursor:pointer;box-shadow:0 5px 0 #8a3b06,0 8px 20px #0008}
#epzChatFab b{position:absolute;top:-8px;right:-8px;min-width:22px;height:22px;padding:0 4px;border-radius:11px;background:#e23a3a;border:2px solid #120c1a;color:#fff;font-size:12.5px;font-weight:800;line-height:19px;display:none}
#epzChatBox{display:none;position:absolute;right:0;bottom:62px;width:min(330px,86vw);height:min(44vh,380px);background:#161a33;border:2px solid #4a5188;border-radius:16px;box-shadow:0 20px 44px #000c;flex-direction:column;overflow:hidden}
#epzChat.open #epzChatBox{display:flex}
#epzChat.open #epzChatFab{background:linear-gradient(#ffe680,#ffb347)}
#epzChatHead{display:flex;align-items:center;gap:8px;padding:9px 11px;background:#20264f;border-bottom:2px solid #353b6a}
#epzChatHead span{flex:1;font-family:'Barlow Condensed',system-ui,sans-serif;font-weight:800;font-size:13.5px;letter-spacing:1.2px;text-transform:uppercase;color:#ffc928;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#epzChatHead button{border:0;background:#2b3160;color:#fff;border-radius:9px;width:28px;height:28px;cursor:pointer;font-size:14px}
#epzChatList{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:7px}
#epzChatList .hint{font-size:12.5px;color:#8d88a6;line-height:1.4;text-align:center;padding:8px 4px}
#epzChatList .r{display:flex}
#epzChatList .r.me{justify-content:flex-end}
#epzChatList .b{background:#2a3166;border-radius:13px;padding:7px 11px;max-width:84%;font-size:14.5px;line-height:1.35;color:#f0ecff;word-break:break-word}
#epzChatList .r.me .b{background:#3d438f}
#epzChatList .w{font-family:'Barlow Condensed',system-ui,sans-serif;font-size:11.5px;font-weight:700;letter-spacing:.6px;color:#a9b0ff;margin-bottom:2px}
#epzChatFoot{display:flex;gap:6px;padding:8px;border-top:2px solid #353b6a;background:#20264f}
#epzChatFoot input{flex:1;min-width:0;padding:10px 11px;border-radius:11px;border:2px solid #353b6a;background:#141830;color:#fff;font-size:15px;font-family:'Barlow',system-ui,sans-serif}
#epzChatFoot button{border:0;border-radius:11px;background:linear-gradient(#ffd84a,#ff9a1f);color:#120c1a;font-weight:800;font-size:16px;padding:0 15px;cursor:pointer}
#epzChatPing{position:fixed;right:max(10px,calc((100vw - 584px)/2 + 10px));bottom:calc(166px + env(safe-area-inset-bottom));max-width:270px;background:#20264f;border:2px solid #4a5188;border-radius:13px;padding:9px 12px;color:#f0ecff;font-size:14px;line-height:1.35;box-shadow:0 10px 26px #000a;z-index:9501;cursor:pointer}
`;
}

function mountChat(room) {
  if (!room || document.getElementById('epzChat')) return;
  const style = document.createElement('style');
  style.textContent = chatStyles();
  document.head.appendChild(style);

  const dock = document.createElement('div');
  dock.id = 'epzChat';
  dock.innerHTML = `<button id="epzChatFab" aria-label="Chat de la salle">💬<b></b></button>
    <div id="epzChatBox" role="dialog" aria-label="Chat de la salle">
      <div id="epzChatHead"><span id="epzChatTitle">Chat de la salle</span><button id="epzChatX" aria-label="Fermer">✕</button></div>
      <div id="epzChatList"></div>
      <div id="epzChatFoot"><input id="epzChatInput" maxlength="120" placeholder="Ton message…" autocomplete="off"><button id="epzChatSend" aria-label="Envoyer">➤</button></div>
    </div>`;
  document.body.appendChild(dock);

  const q = (s) => dock.querySelector(s);
  const state = { open: false, logs: {}, unread: {} };
  const names = {};

  const roomKey = () => {
    let rm = '';
    try { rm = (room.myRoom && room.myRoom()) || ''; } catch (e) {}
    rm = String(rm || '');
    return rm.indexOf('visit:') === 0 ? 'visit' : rm || 'hall';
  };
  const roomLabel = () => ROOM_NAMES[roomKey()] || 'La salle';
  const thread = (k) => { state.logs[k] = state.logs[k] || []; return state.logs[k]; };

  function badge() {
    const n = state.unread[roomKey()] || 0;
    const b = q('#epzChatFab b');
    if (!b) return;
    b.textContent = n > 9 ? '9+' : String(n);
    b.style.display = n ? 'block' : 'none';
  }

  function render() {
    badge();
    const list = q('#epzChatList');
    if (!list || !state.open) return;
    const th = thread(roomKey());
    list.innerHTML = '';
    if (!th.length) {
      const h = document.createElement('div');
      h.className = 'hint';
      h.textContent = 'Aucun message ici pour l’instant. Dis bonjour 👋';
      list.appendChild(h);
      return;
    }
    th.slice(-50).forEach((m) => {
      const row = document.createElement('div');
      row.className = 'r' + (m.me ? ' me' : '');
      const bub = document.createElement('div');
      bub.className = 'b';
      const who = document.createElement('div');
      who.className = 'w';
      const t = new Date(m.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      who.textContent = (m.me ? 'Toi' : m.nm) + ' · ' + t;
      const txt = document.createElement('div');
      txt.textContent = m.t;
      bub.appendChild(who);
      bub.appendChild(txt);
      row.appendChild(bub);
      list.appendChild(row);
    });
    list.scrollTop = list.scrollHeight;
  }

  function ping(text) {
    const old = document.getElementById('epzChatPing');
    if (old) old.remove();
    const p = document.createElement('div');
    p.id = 'epzChatPing';
    p.textContent = text;
    p.onclick = () => { p.remove(); toggle(true); };
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 4500);
  }

  function add(msg) {
    const th = thread(msg.rm);
    if (th.some((m) => m.k === msg.k)) return;
    th.push(msg);
    if (th.length > 80) th.splice(0, th.length - 80);
    const here = msg.rm === roomKey();
    if (!msg.me && !(state.open && here)) {
      state.unread[msg.rm] = (state.unread[msg.rm] || 0) + 1;
      ping('💬 ' + msg.nm + ' : ' + msg.t.slice(0, 48));
    }
    render();
  }

  function toggle(on) {
    const open = on === undefined ? !state.open : !!on;
    state.open = open;
    dock.classList.toggle('open', open);
    if (open) {
      state.unread[roomKey()] = 0;
      render();
      setTimeout(() => { const i = q('#epzChatInput'); if (i) i.focus(); }, 60);
    } else {
      badge();
    }
  }

  function send(text) {
    const t = String(text || '').trim().slice(0, 120);
    if (!t) return;
    const rm = roomKey();
    const ts = Date.now();
    add({ rm, k: rm + '|' + ts + '|' + t, t, ts, me: true, nm: 'Toi' });
    try { room.emit('chat', { rm, t, ts }).catch(() => {}); } catch (e) {}
  }

  try {
    room.onPeers((ch) => {
      (ch.peers || []).forEach((p) => {
        if (p && p.peer && p.presence && p.presence.nm) names[p.peer] = String(p.presence.nm).slice(0, 16);
      });
    });
  } catch (e) {}

  room.on('chat', (m) => {
    const d = (m && m.data) || {};
    if (!d.rm || typeof d.t !== 'string') return;
    if (!m.isMe && String(d.rm) !== roomKey()) return;
    const nm = m.isMe ? 'Toi' : (names[m.peer] || 'Joueur');
    add({ rm: String(d.rm), k: d.rm + '|' + (d.ts || 0) + '|' + d.t, t: d.t.slice(0, 120), ts: +d.ts || Date.now(), me: !!m.isMe, nm });
  });

  q('#epzChatFab').onclick = () => toggle();
  q('#epzChatX').onclick = () => toggle(false);
  const fire = () => {
    const i = q('#epzChatInput');
    if (!i) return;
    send(i.value);
    i.value = '';
  };
  q('#epzChatSend').onclick = fire;
  q('#epzChatInput').addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') fire();
  });

  setInterval(() => {
    const game = document.getElementById('sGame');
    const sheet = document.getElementById('sheet');
    const sheetOpen = !!(sheet && sheet.style.display === 'flex');
    const inGame = !!(game && game.classList.contains('on')) && !sheetOpen;
    dock.style.display = inGame ? 'block' : 'none';
    if (inGame) {
      const t = q('#epzChatTitle');
      if (t) t.textContent = '💬 ' + roomLabel();
      badge();
    }
    if (!inGame && state.open) toggle(false);
  }, 700);
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
  try { mountChat(caps.room); } catch (e) { console.warn('chat', e); }
  try { caps.sample = makeSample(); } catch (e) { console.warn('ia', e); }
  window.claude = { use: async (n) => caps[n] || null };
  window.EPZ_LOGOUT = () => base44.auth.logout();
  done();
})();