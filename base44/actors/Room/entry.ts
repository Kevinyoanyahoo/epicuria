import { Actor } from "base44:runtime/actors";

// Salle temps réel d'EpicurIA : présence des joueurs (position, salle, émote, message de bulle)
// et événements (chat de salle, messages privés, invitations). Une seule instance « lobby ».
type Peer = { peer: string; by: string | null; presence: Record<string, unknown> };
const TOPICS = ["chat", "dm", "inv"];

export default class Room extends Actor {
  peers = new Map<string, Peer>(); // clé : conn.id (jamais diffusée)
  lastSave = 0;

  async handleStart() {
    const saved = await this.storage.get("peers");
    this.peers = new Map(saved ?? []);
    const live = new Set(this.getConnections().map((c: any) => c.id));
    for (const k of [...this.peers.keys()]) if (!live.has(k)) this.peers.delete(k);
  }

  persist(force = false) {
    const now = Date.now();
    if (!force && now - this.lastSave < 2000) return;
    this.lastSave = now;
    this.storage.put("peers", [...this.peers.entries()]);
  }

  list() {
    return [...this.peers.values()];
  }

  async handleConnect(conn: any) {
    const id = conn.identity;
    const by = id?.type === "authenticated" ? String(id.userId) : null;
    let p = this.peers.get(conn.id);
    if (!p) {
      p = { peer: crypto.randomUUID().replace(/-/g, "").slice(0, 12), by, presence: {} };
      this.peers.set(conn.id, p);
    } else p.by = by;
    conn.send({ type: "you", peer: p.peer, by });
    conn.send({ type: "peers", peers: this.list() });
    this.persist(true);
  }

  async handleMessage(conn: any, msg: any) {
    if (!msg || typeof msg !== "object") return;
    const p = this.peers.get(conn.id);
    if (!p) return;
    if (msg.type === "presence") {
      const pr = msg.p && typeof msg.p === "object" && !Array.isArray(msg.p) ? msg.p : {};
      if (JSON.stringify(pr).length > 4000) return;
      p.presence = pr;
      this.broadcast({ type: "pr", peer: p.peer, by: p.by, presence: pr });
      this.persist();
      return;
    }
    if (msg.type === "ev") {
      if (!TOPICS.includes(msg.topic)) return;
      if (JSON.stringify(msg.data ?? null).length > 2000) return;
      const out = { type: "ev", topic: msg.topic, peer: p.peer, by: p.by, data: msg.data };
      if (msg.topic === "chat") { this.broadcast(out); return; }
      // Message privé ou invitation : envoyé seulement au destinataire (et à l'expéditeur).
      const to = msg.data && typeof msg.data.to === "string" ? msg.data.to : "";
      for (const c of this.getConnections() as any[]) {
        const q = this.peers.get(c.id);
        if (!q) continue;
        if (c.id === conn.id || q.peer === to || (q.by && q.by === to)) c.send(out);
      }
    }
  }

  async handleClose(conn: any) {
    const p = this.peers.get(conn.id);
    if (!p) return;
    this.peers.delete(conn.id);
    this.broadcast({ type: "left", peer: p.peer });
    this.persist(true);
  }

  handleTick() {}
}
