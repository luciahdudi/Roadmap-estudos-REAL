// Envio imediato (botões "Enviar teste" e "Enviar a mensagem acima por API" da página).
const { igual, cors, corpo } = require("../lib/auth");
const { enviarCanais } = require("../lib/enviar");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ erro: "método não permitido" });
  const b = corpo(req);
  if (!b) return res.status(400).json({ erro: "corpo inválido" });
  if (!igual(b.token, process.env.ENVIO_TOKEN)) return res.status(401).json({ erro: "não autorizado" });

  const texto = String(b.texto || ""), assunto = String(b.assunto || "Lembrete de estudos").slice(0, 120);
  const canais = Array.isArray(b.canais) ? b.canais.filter(c => c === "email" || c === "whatsapp") : [];
  if (!texto.trim() || texto.length > 1500) return res.status(400).json({ erro: "texto vazio ou maior que 1500 caracteres" });
  if (!canais.length) return res.status(400).json({ erro: "nenhum canal escolhido" });

  const { out, detalhe } = await enviarCanais(texto, assunto, canais);
  return res.status(200).json({ ...out, ...(Object.keys(detalhe).length ? { detalhe } : {}) });
};
