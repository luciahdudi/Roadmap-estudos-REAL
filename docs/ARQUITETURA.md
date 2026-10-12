# Arquitetura e segurança

## Visão geral
- **Front-end:** um único `index.html`, sem build nem framework. Estado em memória, salvo criptografado.
- **Servidor (opcional):** funções serverless na Vercel em `api/`, com Redis (Upstash) para sincronização e alertas.
- **Agendador:** cron-job.org chama `GET /api/cron` a cada minuto (o plano Hobby da Vercel só permite 1 cron por dia).

```
Navegador (index.html)
   │  dados já criptografados / lista de alertas
   ▼
Vercel  /api/dados  /api/enviar  /api/agendar  /api/cron ──► Upstash Redis
                                       │
                          Resend (e-mail) · Meta Cloud API (WhatsApp)
cron-job.org ──► /api/cron (Authorization: Bearer CRON_SECRET), a cada 1 min
```

## Criptografia dos dados
- AES-256-GCM no aparelho; chave derivada da senha por PBKDF2 (210.000 iterações, salt próprio).
- A senha nunca sai do navegador. Imagens (capa, foto, fundo) também são guardadas criptografadas.
- O backup JSON não inclui o token da API nem expõe a chave do cofre.

## Sincronização entre aparelhos (zero-knowledge)
- **Identificador do cofre:** `SHA-256("roadmap-cofre|login")` (público).
- **Chave de acesso:** PBKDF2(senha, "roadmap-chave|login", 210.000), 256 bits. O servidor guarda só o `SHA-256` dessa chave.
- **`api/dados.js`**, ações: `ping`, `estado`, `ler`, `gravar` (com controle de revisão), `trocar` (senha), `substituir` e `excluir` (exigem o token de envio).
- Trava distribuída (`SET NX EX 10`) evita gravações simultâneas. Bloqueio de 15 minutos após 8 falhas.
- **Versão base** guardada no navegador (`roadmap-sync-base`) após cada envio/recebimento.
- **Quando sincroniza:** ao salvar, ao voltar para a aba, ao ficar online e a cada 1 minuto. Não atualiza com janela aberta ou campo em foco.

### Combinação automática (3 vias: base × este aparelho × nuvem)
- Objetos: campo a campo. Item adicionado num lado e não tocado no outro entra; adicionado nos dois entra dos dois.
- Listas com `id`: itens novos dos dois lados ficam; editado num e excluído no outro vale o editado; mesmo campo mudado nos dois vale o local (avisa e conta).
- Listas com `ts` (histórico de login): união, ordenação, máximo 15.
- Sem versão base (primeiro conflito): o app pergunta: usar a da nuvem, manter a deste ou decidir depois.
- Cópia do que foi substituído fica em `roadmap-sync-previous`.

## Alertas automáticos
1. O app monta a lista de alertas (id, quando, texto, assunto, canais, tolerância) e envia a `POST /api/agendar` (`substituir`, `listar`, `limpar`).
2. `agendar.js` valida (id de 64 hex, canais, datas futuras até 45 dias, até 400 alertas por sincronização) e grava em transação atômica no Redis, ordenado por horário.
3. `cron.js` processa os vencidos em lote de 10, tenta até 3 vezes se um canal falhar e descarta o que atrasou demais. Cada alerta sai uma vez e some do Redis depois de enviado.
4. O servidor guarda só título, horário e canais, nada do conteúdo dos cursos.

## Envio imediato
`api/enviar.js` valida o token com `timingSafeEqual`, chama Resend e a API da Meta (timeout de 7 s) e devolve `{email, whatsapp, detalhe}`.

## Decisões importantes
- O app envia `POST` com `Content-Type: text/plain` (corpo JSON) para evitar preflight de CORS.
- Dois segredos separados: `ENVIO_TOKEN` (página → servidor) e `CRON_SECRET` (cron → servidor). Um não serve no lugar do outro.
- Cron externo em vez do cron da Vercel Hobby.
- Cabeçalhos de segurança em `vercel.json`: `nosniff`, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, `Cache-Control: no-store` em `/api`.
- Google Agenda no site: OAuth direto com Client ID próprio, escopo `calendar.events`; o acesso fica só na memória da aba. Cada evento leva `extendedProperties.private.roadmapKey = SHA-256(chave)` para evitar duplicatas.
- O modo demonstração não escreve em `localStorage`, `sessionStorage`, nuvem, alertas nem Google.
