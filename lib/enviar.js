// Envia o texto por e-mail (Resend) e/ou WhatsApp (API oficial da Meta).
// Devolve { out: { email: true|false, whatsapp: true|false }, detalhe: { ... } }.
async function comTempo(url, opcoes, ms = 7000) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms);
  try { return await fetch(url, { ...opcoes, signal: ctl.signal }); } finally { clearTimeout(t); }
}

// Modelos do WhatsApp não aceitam quebra de linha, tabulação nem muitos espaços seguidos nas variáveis.
const paraWhats = t => String(t).replace(/\s*[\r\n\t]+\s*/g, " | ").replace(/ {2,}/g, " ").trim().slice(0, 1000);

async function enviarCanais(texto, assunto, canais) {
  const out = {}, detalhe = {};
  const tarefas = [];

  if (canais.includes("email")) tarefas.push((async () => {
    try {
      const r = await comTempo("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [process.env.EMAIL_TO], subject: assunto, text: texto }),
      });
      out.email = r.ok; if (!r.ok) detalhe.email = (await r.text()).slice(0, 200);
    } catch (e) { out.email = false; detalhe.email = e && e.name === "AbortError" ? "o serviço de e-mail demorou demais" : "falha de rede ao chamar o serviço de e-mail"; }
  })());

  if (canais.includes("whatsapp")) tarefas.push((async () => {
    try {
      // Se a Meta lançar uma versão nova da Graph API, troque o v21.0 abaixo (veja a documentação da Meta).
      const r = await comTempo(`https://graph.facebook.com/${process.env.WA_API_VERSION || "v21.0"}/${process.env.WA_PHONE_ID}/messages`, {
        method: "POST", headers: { Authorization: `Bearer ${process.env.WA_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp", to: process.env.WA_TO, type: "template",
          template: { name: process.env.WA_TEMPLATE || "lembrete_estudo", language: { code: process.env.WA_LANG || "pt_BR" },
            components: [{ type: "body", parameters: [{ type: "text", text: paraWhats(texto) }] }] },
        }),
      });
      out.whatsapp = r.ok; if (!r.ok) detalhe.whatsapp = (await r.text()).slice(0, 200);
    } catch (e) { out.whatsapp = false; detalhe.whatsapp = e && e.name === "AbortError" ? "o WhatsApp demorou demais" : "falha de rede ao chamar o WhatsApp"; }
  })());

  await Promise.all(tarefas);
  return { out, detalhe };
}

module.exports = { enviarCanais, paraWhats };
