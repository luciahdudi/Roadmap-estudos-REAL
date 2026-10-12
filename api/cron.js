// Chamado a cada minuto por um agendador externo (cron-job.org) com o cabeçalho
//   Authorization: Bearer <CRON_SECRET>
// Envia o que está na hora e remove da fila. Cada alerta só é enviado uma vez, mesmo se duas chamadas se cruzarem
// (o ZREM só devolve 1 para quem removeu primeiro).
const redis = require("../lib/redis");
const { igual } = require("../lib/auth");
const { enviarCanais } = require("../lib/enviar");

const LOTE = 10, TENTATIVAS = 3, ESPERA_S = 120;

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const cab = String(req.headers.authorization || "");
  if (!cab.startsWith("Bearer ") || !igual(cab.slice(7), process.env.CRON_SECRET)) return res.status(401).json({ erro: "não autorizado" });
  if (!redis.configurado()) return res.status(500).json({ erro: "Redis não configurado" });

  const r = { vencidos: 0, enviados: 0, expirados: 0, falhas: 0, tentarDeNovo: 0 };
  try {
    const agora = Math.floor(Date.now() / 1000);
    const devidos = await redis.cmd(["ZRANGEBYSCORE", redis.CHAVE, "-inf", agora, "LIMIT", 0, LOTE]);
    r.vencidos = devidos.length;

    await Promise.all(devidos.map(async membro => {
      const removeu = await redis.cmd(["ZREM", redis.CHAVE, membro]);
      if (removeu !== 1) return;                                   // outra chamada já pegou este alerta
      let a; try { a = JSON.parse(membro); } catch (e) { return; }
      if (agora - a.w > a.tol * 60) { r.expirados++; return; }     // atrasou demais: não faz sentido avisar
      const { out, detalhe } = await enviarCanais(a.t, a.s, a.c);
      const falhou = a.c.filter(c => out[c] !== true);
      r.enviados += a.c.length - falhou.length;
      if (!falhou.length) return;
      console.error("[cron] falha", a.i, JSON.stringify(detalhe));
      a.n = (a.n || 0) + 1; a.c = falhou;
      if (a.n <= TENTATIVAS) { await redis.cmd(["ZADD", redis.CHAVE, agora + ESPERA_S, JSON.stringify(a)]); r.tentarDeNovo++; }
      else r.falhas++;
    }));
    return res.status(200).json({ ok: true, ...r });
  } catch (e) {
    console.error("[cron]", e && e.message);
    return res.status(500).json({ erro: String(e && e.message).slice(0, 160), ...r });
  }
};
