// Cliente mínimo do Upstash Redis (API REST). Não precisa instalar nada.
// As variáveis são criadas sozinhas quando você conecta o Upstash ao projeto na Vercel.
const URL_ = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const CHAVE = "roadmap:alertas";

function configurado() { return !!(URL_() && TOKEN()); }

async function chamar(caminho, corpo) {
  if (!configurado()) throw new Error("Redis não configurado (conecte o Upstash ao projeto na Vercel)");
  const r = await fetch(URL_().replace(/\/$/, "") + caminho, {
    method: "POST", headers: { Authorization: `Bearer ${TOKEN()}`, "Content-Type": "application/json" }, body: JSON.stringify(corpo),
  });
  let j = null; try { j = await r.json(); } catch (e) {}
  if (!r.ok) throw new Error((j && j.error) || `Redis respondeu ${r.status}`);
  return j;
}

async function cmd(args) { const j = await chamar("", args); if (j && j.error) throw new Error(j.error); return j.result; }

// Executa vários comandos de uma vez, de forma atômica (tudo ou nada).
async function transacao(cmds) {
  const j = await chamar("/multi-exec", cmds);
  if (!Array.isArray(j)) throw new Error("resposta inesperada do Redis");
  const e = j.find(x => x && x.error); if (e) throw new Error(e.error);
  return j.map(x => x.result);
}

module.exports = { CHAVE, configurado, cmd, transacao };
