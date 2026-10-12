# Pendências

Estado em 12/10/2026.

## Para colocar no ar
- [ ] **Importar o repositório na Vercel** (Add New → Project). A conexão que o Claude usa não tem permissão para criar projetos (erro 403), então este passo é manual.
  - A Vercel estava ligada ao GitHub `luciahdudi`; o código foi enviado para `luciahdudi1/roadmap-alertas`. Se o repositório não aparecer na importação, autorize a conta correta em "Add GitHub Account".
- [ ] Criar `ENVIO_TOKEN`, `CRON_SECRET` e `ORIGEM_PERMITIDA` na Vercel (ver `VARIAVEIS.md`) e fazer Redeploy.
- [ ] Conectar o **Upstash Redis** ao projeto (Storage).
- [ ] Configurar o **cron-job.org** (GET `/api/cron` a cada 1 minuto com `Authorization: Bearer CRON_SECRET`).

## Opcionais, conforme o uso
- [ ] Resend: chave e e-mail de destino verificado (alertas por e-mail).
- [ ] WhatsApp (Meta): modelo `lembrete_estudo` aprovado com 1 variável e **token permanente**.
- [ ] Google Agenda: criar o Client ID no Google Cloud (~10 min) e adicionar-se como usuário de teste.

## Não testado em ambiente real
- Sincronização entre dois aparelhos com Redis de verdade.
- Envio real por Resend e por WhatsApp.
- Disparo real do cron-job.org.
- Criação de eventos reais no Google Agenda pelo login do site.

Tudo isso foi coberto apenas por testes automáticos com simulações (ver `TESTES.md`).
