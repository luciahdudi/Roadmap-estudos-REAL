// Recebe da página a lista de alertas dos próximos dias e guarda no Redis.
// Ações: "substituir" (padrão: troca tudo o que estava agendado), "listar" e "limpar".
const { igual, cors, corpo } = require("../lib/auth");
const redis = require("../lib/redis");

const MAX_ALERTAS = 400, MAX_TEXTO = 900, MAX_DIAS = 45;

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ erro: "método não permitido" });
  const b = corpo(req);
  if (!b) return res.status(400).json({ erro: "corpo inválido" });
  if (!igual(b.token, process.env.ENVIO_TOKEN)) return res.status(401).json({ erro: "não autorizado" });
  if (!redis.configurado()) return res.status(500).json({ erro: "Redis não configurado: conecte o Upstash ao projeto na Vercel" });

  try {
    const acao = b.acao || "substituir";

    if (acao === "limpar") { await redis.cmd(["DEL", redis.CHAVE]); return res.status(200).json({ ok: true, agendados: 0 }); }

    if (acao === "listar") {
      const total = await redis.cmd(["ZCARD", redis.CHAVE]);
      const bruto = await redis.cmd(["ZRANGE", redis.CHAVE, 0, 49, "WITHSCORES"]);
      const itens = [];
      for (let i = 0; i + 1 < bruto.length; i += 2) { try { const a = JSON.parse(bruto[i]); itens.push({ id: a.i, quando: new Date(a.w * 1000).toISOString(), texto: a.t, canais: a.c }); } catch (e) {} }
      return res.status(200).json({ ok: true, total, itens });
    }

    if (acao !== "substituir") return res.status(400).json({ erro: "ação desconhecida" });
    const lista = Array.isArray(b.alertas) ? b.alertas : null;
    if (!lista) return res.status(400).json({ erro: "lista de alertas ausente" });
    if (lista.length > MAX_ALERTAS) return res.status(400).json({ erro: `no máximo ${MAX_ALERTAS} alertas por sincronização` });

    const agora = Date.now(), vistos = new Set(), pares = [];
    for (const a of lista) {
      const w = Math.floor(new Date(a && a.quando).getTime() / 1000);
      const texto = String((a && a.texto) || "").slice(0, MAX_TEXTO);
      const canais = Array.isArray(a && a.canais) ? a.canais.filter(c => c === "email" || c === "whatsapp") : [];
      const id = String((a && a.id) || "").slice(0, 120);
      if (!id || vistos.has(id) || !Number.isFinite(w) || !texto.trim() || !canais.length) continue;
      if (w * 1000 < agora - 60000 || w * 1000 > agora + MAX_DIAS * 86400000) continue;   // só futuro próximo
      vistos.add(id);
      const tol = Math.min(720, Math.max(5, Math.floor(Number(a.tolerancia) || 30)));
      pares.push(w, JSON.stringify({ i: id, w, t: texto, s: String(a.assunto || "Alerta do Roadmap").slice(0, 120), c: canais, tol, n: 0 }));
    }
    const cmds = [["DEL", redis.CHAVE]];
    if (pares.length) cmds.push(["ZADD", redis.CHAVE, ...pares]);
    await redis.transacao(cmds);
    return res.status(200).json({ ok: true, agendados: pares.length / 2, descartados: lista.length - pares.length / 2 });
  } catch (e) {
    console.error("[agendar]", e && e.message);
    return res.status(500).json({ erro: "falha ao falar com o Redis: " + String(e && e.message).slice(0, 120) });
  }
};
