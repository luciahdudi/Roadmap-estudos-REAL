// Sincronização dos dados entre aparelhos.
// O servidor guarda só o que o app já mandou CRIPTOGRAFADO (AES-256 no seu aparelho). Ele não conhece a sua senha
// nem consegue abrir os dados. O acesso ao "cofre" é provado por uma chave derivada da senha (no aparelho),
// da qual o servidor guarda apenas o resumo (SHA-256).
//
// Ações (POST, corpo JSON enviado como text/plain):
//   ping                        -> { ok, sync }                           (sem senha; o app usa para saber se a nuvem existe)
//   estado   {cofre, chave}     -> { existe, autorizado, rev, ts }
//   ler      {cofre, chave}     -> { rev, ts, main, imgs }
//   gravar   {cofre, chave, base, main, imgs, token?}   (criar o cofre exige o token de envio)
//   trocar   {cofre, chave, nova}                       (troca de senha)
//   substituir {cofre, chave, token, main, imgs}        (recomeçar: exige o token de envio)
//   excluir  {cofre, token}                             (apaga tudo: exige o token de envio)
const crypto = require("crypto");
const { igual, cors, corpo } = require("../lib/auth");
const redis = require("../lib/redis");

const HEX64 = /^[0-9a-f]{64}$/, IMGS = ["cover", "photo", "bg"];
const MAX_MAIN = 900000, MAX_IMG = 450000, MAX_FALHAS = 8, BLOQUEIO_S = 900;
const k = (id, s) => `roadmap:cofre:${id}:${s}`;
const sha = s => crypto.createHash("sha256").update(s).digest("hex");
const erro = (res, st, msg, extra) => res.status(st).json({ erro: msg, ...(extra || {}) });

// Confere a chave do cofre. Depois de várias tentativas erradas, bloqueia por 15 minutos.
async function conferir(id, chave, h) {
  const fk = k(id, "falhas"), f = Number(await redis.cmd(["GET", fk])) || 0;
  if (f >= MAX_FALHAS) { const e = new Error("Muitas tentativas. Aguarde 15 minutos."); e.status = 429; throw e; }
  if (HEX64.test(String(chave || "")) && igual(sha(chave), h)) { if (f) await redis.cmd(["DEL", fk]); return true; }
  const n = await redis.cmd(["INCR", fk]); if (n === 1) await redis.cmd(["EXPIRE", fk, BLOQUEIO_S]);
  return false;
}

function validarDados(b) {
  if (typeof b.main !== "string" || !b.main || b.main.length > MAX_MAIN) return "dados principais ausentes ou grandes demais";
  const imgs = b.imgs && typeof b.imgs === "object" ? b.imgs : {};
  for (const n of Object.keys(imgs)) {
    if (!IMGS.includes(n)) return "imagem desconhecida";
    if (imgs[n] !== null && (typeof imgs[n] !== "string" || imgs[n].length > MAX_IMG)) return "imagem grande demais";
  }
  return "";
}

function comandosDeDados(id, b, rev, h, ts) {
  const c = [["SET", k(id, "main"), b.main], ["SET", k(id, "rev"), String(rev)], ["SET", k(id, "ts"), String(ts)]];
  if (h) c.push(["SET", k(id, "h"), h]);
  const imgs = b.imgs && typeof b.imgs === "object" ? b.imgs : {};
  for (const n of Object.keys(imgs)) c.push(imgs[n] === null ? ["DEL", k(id, "img:" + n)] : ["SET", k(id, "img:" + n), imgs[n]]);
  return c;
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return erro(res, 405, "método não permitido");
  const b = corpo(req); if (!b) return erro(res, 400, "corpo inválido");
  const acao = String(b.acao || "");
  if (acao === "ping") return res.status(200).json({ ok: true, sync: redis.configurado() });
  if (!redis.configurado()) return erro(res, 500, "Redis não configurado: conecte o Upstash ao projeto na Vercel");
  const id = String(b.cofre || ""); if (!HEX64.test(id)) return erro(res, 400, "cofre inválido");

  try {
    const h = await redis.cmd(["GET", k(id, "h")]);

    if (acao === "estado") {
      if (!h) return res.status(200).json({ ok: true, existe: false });
      if (!(await conferir(id, b.chave, h))) return res.status(200).json({ ok: true, existe: true, autorizado: false });
      const [rev, ts] = await redis.cmd(["MGET", k(id, "rev"), k(id, "ts")]);
      return res.status(200).json({ ok: true, existe: true, autorizado: true, rev: Number(rev) || 0, ts: Number(ts) || 0 });
    }

    if (acao === "ler") {
      if (!h) return erro(res, 404, "nuvem não encontrada");
      if (!(await conferir(id, b.chave, h))) return erro(res, 401, "não autorizado");
      const v = await redis.cmd(["MGET", k(id, "rev"), k(id, "ts"), k(id, "main"), ...IMGS.map(n => k(id, "img:" + n))]);
      return res.status(200).json({ ok: true, rev: Number(v[0]) || 0, ts: Number(v[1]) || 0, main: v[2], imgs: Object.fromEntries(IMGS.map((n, i) => [n, v[3 + i] || null])) });
    }

    if (acao === "gravar") {
      const msg = validarDados(b); if (msg) return erro(res, 413, msg);
      let novo = false;
      if (!h) {
        if (!igual(b.token, process.env.ENVIO_TOKEN)) return erro(res, 401, "criar a nuvem exige o token de envio");
        if (!HEX64.test(String(b.chave || ""))) return erro(res, 400, "chave inválida");
        novo = true;
      } else if (!(await conferir(id, b.chave, h))) return erro(res, 401, "não autorizado");

      const lk = k(id, "trava");
      if ((await redis.cmd(["SET", lk, "1", "NX", "EX", 10])) !== "OK") return erro(res, 409, "outro aparelho está salvando agora; tente de novo", { ocupado: true });
      try {
        const rev = Number(await redis.cmd(["GET", k(id, "rev")])) || 0;
        if (rev !== (Number(b.base) || 0)) return erro(res, 409, "conflito", { conflito: true, rev });
        const ts = Date.now();
        await redis.transacao(comandosDeDados(id, b, rev + 1, novo ? sha(b.chave) : null, ts));
        return res.status(200).json({ ok: true, rev: rev + 1, ts });
      } finally { await redis.cmd(["DEL", lk]).catch(() => {}); }
    }

    if (acao === "trocar") {
      if (!h) return erro(res, 404, "nuvem não encontrada");
      if (!(await conferir(id, b.chave, h))) return erro(res, 401, "não autorizado");
      if (!HEX64.test(String(b.nova || ""))) return erro(res, 400, "chave nova inválida");
      await redis.cmd(["SET", k(id, "h"), sha(b.nova)]);
      return res.status(200).json({ ok: true });
    }

    if (acao === "substituir") {
      if (!igual(b.token, process.env.ENVIO_TOKEN)) return erro(res, 401, "substituir exige o token de envio");
      if (!HEX64.test(String(b.chave || ""))) return erro(res, 400, "chave inválida");
      const msg = validarDados(b); if (msg) return erro(res, 413, msg);
      const rev = (Number(await redis.cmd(["GET", k(id, "rev")])) || 0) + 1, ts = Date.now();
      const cmds = comandosDeDados(id, { ...b, imgs: Object.fromEntries(IMGS.map(n => [n, (b.imgs && b.imgs[n]) || null])) }, rev, sha(b.chave), ts);
      cmds.push(["DEL", k(id, "falhas")]);
      await redis.transacao(cmds);
      return res.status(200).json({ ok: true, rev, ts });
    }

    if (acao === "excluir") {
      if (!igual(b.token, process.env.ENVIO_TOKEN)) return erro(res, 401, "excluir exige o token de envio");
      await redis.transacao([["DEL", ...["h", "rev", "ts", "main", "falhas", "trava", ...IMGS.map(n => "img:" + n)].map(s => k(id, s))]]);
      return res.status(200).json({ ok: true });
    }

    return erro(res, 400, "ação desconhecida");
  } catch (e) {
    if (e && e.status === 429) return erro(res, 429, e.message);
    console.error("[dados]", e && e.message);
    return erro(res, 500, "falha ao falar com o Redis");
  }
};
