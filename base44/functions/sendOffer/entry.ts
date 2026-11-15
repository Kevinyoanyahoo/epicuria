import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const txt = (v: unknown, n: number) => String(v == null ? '' : v).replace(/[<>&]/g, '').trim().slice(0, n);
const num = (v: unknown, lo: number, hi: number, d: number) => {
  const x = Math.round(Number(v));
  return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : d;
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const oid = String(body.oid == null ? '' : body.oid).replace(/[^\w-]/g, '').slice(0, 64);
    const to = String(body.to == null ? '' : body.to).replace(/[^\w-]/g, '').slice(0, 64);
    const mission = txt(body.mission, 32);
    if (!oid || !to || !mission) return Response.json({ error: 'Missing offer fields' }, { status: 400 });
    if (to === user.id) return Response.json({ error: 'Cannot offer to yourself' }, { status: 400 });

    // Le nom affiché vient du profil du joueur, jamais du client qui envoie l'offre.
    const players = await base44.entities.Player.filter({ uid: user.id });
    const me = players && players[0];
    const pseudo = txt(me && me.data ? me.data.pseudo : '', 16) || txt(user.full_name, 16) || 'Joueur';

    const data = {
      id: oid,
      from: user.id,
      fromName: pseudo,
      fromLv: num(body.fromLv, 0, 99, 1),
      to,
      toName: txt(body.toName, 16) || 'Joueur',
      toLv: num(body.toLv, 0, 99, 1),
      mission,
      reward: num(body.reward, 0, 1000000, 0),
      pct: num(body.pct, 0, 90, 10),
      counter: null,
      penalty: body.penalty === true,
      status: 'pending',
      ts: Date.now(),
    };

    const existing = await base44.asServiceRole.entities.Offer.filter({ oid });
    const found = existing && existing[0];
    if (found && found.data && found.data.from !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const saved = found
      ? await base44.asServiceRole.entities.Offer.update(found.id, { from: user.id, to, data })
      : await base44.asServiceRole.entities.Offer.create({ oid, from: user.id, to, data });

    return Response.json({ ok: true, id: saved.id, offer: data });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}