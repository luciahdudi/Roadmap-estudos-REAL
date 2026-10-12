# Variáveis de ambiente (Vercel → Settings → Environment Variables)

Depois de criar ou alterar, faça **Redeploy**. Nunca coloque estes valores no código nem no GitHub.

| Variável | Obrigatória | Uso |
|---|---|---|
| `ENVIO_TOKEN` | sim | Token que você digita no app. Usado por `enviar.js`, `agendar.js` e pelas ações restritas de `dados.js`. 24+ caracteres. |
| `CRON_SECRET` | sim | Segredo do cron-job.org para `cron.js`. Diferente do `ENVIO_TOKEN`. |
| `ORIGEM_PERMITIDA` | sim | Endereço do site, sem barra no fim (CORS). Ex.: `https://roadmap-alertas.vercel.app` |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | sim (sinc. e alertas) | Criadas sozinhas ao conectar o Upstash Redis ao projeto. O código também aceita `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`. |
| `RESEND_API_KEY` | e-mail | Chave do Resend. |
| `EMAIL_FROM`, `EMAIL_TO` | e-mail | Remetente (ex.: `Roadmap <onboarding@resend.dev>`) e destinatário. |
| `WA_TOKEN` | WhatsApp | Token **permanente** da Meta (o temporário expira em ~24 h). |
| `WA_PHONE_ID` | WhatsApp | Phone number ID. |
| `WA_TO` | WhatsApp | Número com país e DDD, só dígitos (`5551999999999`). |
| `WA_TEMPLATE` | opcional | Nome do modelo aprovado. Padrão `lembrete_estudo`. |
| `WA_LANG` | opcional | Idioma do modelo. Padrão `pt_BR`. |
| `WA_API_VERSION` | opcional | Versão da API da Meta, se quiser fixar. |

O modelo do WhatsApp precisa ter **uma variável**: `Lembrete do seu Roadmap de estudos: {{1}}`.

Gerar um segredo: `openssl rand -hex 24`.
