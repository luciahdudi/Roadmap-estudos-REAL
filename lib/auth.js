const crypto = require("crypto");

// Compara textos em tempo constante (evita descobrir o token por tentativa e erro de tempo).
function igual(a, b) {
  const x = Buffer.from(String(a || "")), y = Buffer.from(String(b || ""));
  return y.length > 0 && x.length === y.length && crypto.timingSafeEqual(x, y);
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ORIGEM_PERMITIDA || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Cache-Control", "no-store");
}

// Lê o corpo (a página envia JSON como text/plain para evitar a checagem prévia do navegador).
function corpo(req) {
  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { b = null; } }
  return b && typeof b === "object" ? b : null;
}

module.exports = { igual, cors, corpo };
