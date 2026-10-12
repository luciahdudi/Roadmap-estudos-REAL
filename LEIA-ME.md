# Roadmap com alertas automáticos por e-mail e WhatsApp

## Como funciona
1. Você abre o app (site na Vercel) e configura: "1º alerta 1 dia antes, 2º alerta 30 min antes".
2. O app manda ao seu servidor a lista dos próximos dias (título, horário e canais de cada alerta).
3. Um agendador gratuito (cron-job.org) chama o servidor a cada minuto.
4. O servidor envia o e-mail (Resend) e o WhatsApp (API oficial da Meta) na hora certa, **com o app fechado**.

Cada alerta sai uma única vez. Se um canal falhar, o servidor tenta de novo até 3 vezes. Se atrasar demais, descarta.

---

## Passo 1. Colocar os arquivos no GitHub
1. Crie uma conta em github.com (grátis) e um repositório novo, por exemplo `roadmap-alertas`. Pode ser **privado**.
2. Descompacte o zip. Em "Add file → Upload files", arraste **o conteúdo** da pasta (index.html, api, lib, vercel.json, package.json) e confirme.

## Passo 2. Publicar na Vercel
1. Em vercel.com → **Add New → Project** → escolha o repositório → **Deploy** (framework: Other).
2. Anote o endereço, por exemplo `https://roadmap-alertas.vercel.app`. É por ele que você vai usar o app daqui para a frente.

## Passo 3. Banco para guardar os alertas (Upstash Redis)
1. No projeto da Vercel → **Storage** → **Create** → **Upstash Redis** (plano gratuito) → conecte ao projeto.
2. As variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN` são criadas sozinhas.

## Passo 4. E-mail (Resend)
1. Crie conta em resend.com → **API Keys** → crie uma chave.
2. Para testar sem domínio, use o remetente de teste `onboarding@resend.dev`; segundo a documentação do Resend, ele só entrega para o e-mail da sua própria conta (confira lá). Para enviar para outro endereço, verifique um domínio no Resend.

## Passo 5. WhatsApp (API oficial da Meta)
1. Em developers.facebook.com → **Meus apps → Criar app** (tipo Business) → adicione o produto **WhatsApp**.
2. Em **API Setup**: copie o **Phone number ID** e cadastre o **seu número** na lista de destinatários (o número de teste da Meta só envia para números cadastrados, até 5).
3. **Token permanente**: o token temporário expira em cerca de 24 h. Em Business Settings → **Usuários do sistema**, crie um usuário, atribua o app e gere um token com as permissões `whatsapp_business_messaging` e `whatsapp_business_management`.
4. **Modelo de mensagem** (WhatsApp Manager → Modelos): nome `lembrete_estudo`, categoria **Utilidade**, idioma **Português (BR)**, corpo com **uma variável**:
   `Lembrete do seu Roadmap de estudos: {{1}}`
   Exemplo da variável: `Em 30 min: MBA em IA - 1h | hoje às 19:00`. Espere a aprovação.
5. Para uso contínuo, a Meta pede um número próprio (que não esteja no WhatsApp comum) e forma de pagamento. Mensagens com modelo são cobradas por mensagem entregue; confira a tabela de preços atual da Meta.

## Passo 6. Variáveis de ambiente (Vercel → Settings → Environment Variables)
| Nome | O que colocar |
|---|---|
| `ENVIO_TOKEN` | Texto longo e secreto inventado por você (24+ caracteres). É o que você digita no app. |
| `CRON_SECRET` | Outro texto longo e secreto. É usado só pelo agendador. |
| `ORIGEM_PERMITIDA` | O endereço do seu site, sem barra no fim: `https://roadmap-alertas.vercel.app` |
| `RESEND_API_KEY` | A chave do Resend |
| `EMAIL_FROM` | Ex.: `Roadmap <onboarding@resend.dev>` |
| `EMAIL_TO` | O e-mail que recebe os alertas |
| `WA_TOKEN` | Token permanente da Meta |
| `WA_PHONE_ID` | Phone number ID |
| `WA_TO` | Seu número com país e DDD, só dígitos: `5551999999999` |
| `WA_TEMPLATE` | (opcional) nome do modelo; padrão `lembrete_estudo` |
| `WA_LANG` | (opcional) idioma do modelo; padrão `pt_BR` |

A sincronização de dados (Passo 10) não precisa de variável nova: usa o mesmo Redis e o mesmo `ENVIO_TOKEN`.

Depois de salvar as variáveis, faça **Redeploy** (Deployments → ⋯ → Redeploy).

## Passo 7. Agendador de 1 minuto (cron-job.org)
A Vercel no plano Hobby só roda tarefa agendada **uma vez por dia**, por isso o disparo por minuto usa um agendador externo gratuito.
1. Crie conta em cron-job.org → **Create cronjob**.
2. URL: `https://SEU-SITE.vercel.app/api/cron` · Execução: **a cada 1 minuto** · Método: GET.
3. Em **Advanced → Headers**, adicione: `Authorization` = `Bearer SEU_CRON_SECRET`.
4. Use **Test run**: a resposta deve ser `{"ok":true,"vencidos":0,...}`. Se vier 401, o segredo está diferente.

## Passo 8. Configurar no app
1. Abra o app **pelo endereço da Vercel** → **Lembretes**.
2. Em "Envio automático por API": endereço `https://SEU-SITE.vercel.app/api/enviar` e o token (`ENVIO_TOKEN`). Toque em **Enviar teste**: o e-mail e o WhatsApp devem chegar na hora.
3. Em "Alertas automáticos": ajuste as antecedências, marque o que quer receber e toque em **Sincronizar agora**. Use **Ver o que está agendado** para conferir.

### Seus dados no novo endereço
O endereço da Vercel começa vazio, porque o app guarda os dados criptografados no navegador de cada endereço. Para trazer os do link do Claude: **Dados ▾ → Backup completo (JSON)** lá, e **"Tenho um backup (.json) para importar"** na tela de criar acesso daqui. O backup não leva o token da API; digite-o de novo. Depois, use só uma das cópias e ligue a sincronização (Passo 10).

## Passo 9 (opcional). Google Calendar pelo login do Google
Fora do Claude, o botão "Criar eventos" usa o login do Google. Os eventos (blocos de estudo, vencimentos, provas) entram na sua agenda com repetição e lembretes de pop-up e e-mail. Você só cria uma credencial gratuita:
1. Abra console.cloud.google.com e crie um projeto (ex.: "Roadmap").
2. **APIs e serviços → Biblioteca**: ative a **Google Calendar API**.
3. **Google Auth Platform**: preencha nome e e-mail do app; em **Público-alvo** escolha **Externo** e adicione o seu e-mail do Google em **Usuários de teste**.
4. **Acesso a dados**: adicione a permissão `https://www.googleapis.com/auth/calendar.events`.
5. **Clientes → Criar cliente → Aplicativo da Web**: em **Origens JavaScript autorizadas** coloque o endereço do seu site (`https://SEU-SITE.vercel.app`, sem barra no fim). Copie o **ID do cliente**.
6. No app: **Lembretes → Lembretes agendados → Conexão com o Google**: cole o Client ID, toque em **Conectar ao Google** e aceite. O Google avisa que o app não foi verificado; é o seu próprio app em modo de teste: **Avançado → Continuar**.
7. Marque o que quer na lista e toque em **Criar eventos no Google Calendar**.

Notas:
- O acesso do Google fica só na memória da aba (some ao fechar). Na próxima vez o Google abre a janela de login de novo, rápido.
- Cada evento leva uma marca interna. Se você repetir, o app não duplica: encontra o evento na agenda e pula. Com **Recriar** marcado, ele apaga os eventos que ele mesmo criou e cria de novo.
- Se não quiser aviso duplicado, use só um dos dois: Calendar ou alertas por WhatsApp/e-mail para o mesmo tipo de evento.
- Em modo de teste, o Google pode pedir para você autorizar de novo de tempos em tempos. É normal.

## Passo 10. Sincronizar os dados entre aparelhos (celular, computador...)
Usa o mesmo Redis do Passo 3 e o arquivo `api/dados.js` (já vem no zip).
1. No aparelho principal, abra o app pelo site da Vercel: **Dados ▾ → Sincronização entre aparelhos**. Confirme a senha (e o token de envio, se ainda não estiver salvo) e toque em **Ativar sincronização**.
2. Nos outros aparelhos: abra o site da Vercel e, na tela de entrada, toque em **Entrar com a nuvem**. Use o mesmo login e a mesma senha.
3. Pronto: o que você salva num aparelho aparece nos outros em cerca de 1 minuto (ou ao voltar para a aba). O cabeçalho mostra ☁ sincronizado.

Como funciona e o que esperar:
- Só dados já criptografados sobem. O servidor não recebe a sua senha e não consegue abrir nada; ele guarda apenas um resumo de uma chave derivada da senha. O login e o nome ficam visíveis no registro, como já ficam no navegador.
- Se você editar em dois aparelhos ao mesmo tempo (ou um deles estiver sem internet), o app **combina sozinho**: itens novos dos dois lados ficam, campos diferentes do mesmo item valem os dois. Se o mesmo campo mudou nos dois, vale a versão do aparelho que está combinando, e o app avisa. Só pergunta (usar a da nuvem, manter a deste aparelho ou decidir depois) quando não há como combinar.
- Uma cópia do que foi substituído fica guardada neste navegador (chave `roadmap-sync-previous`).
- **Trocar a senha**: faça em um aparelho. Nos outros, saia e use **Entrar com a nuvem** com a senha nova.
- **Esqueci a senha**: os dados da nuvem não podem ser abertos sem ela. Crie um novo acesso e, em **Sincronização → Ativar**, escolha **Substituir** (exige o token de envio): isso apaga os dados antigos da nuvem.
- Depois de 8 tentativas erradas de senha na nuvem, há um bloqueio de 15 minutos.
- Para parar: **Desligar neste aparelho** (os dados continuam aqui e na nuvem) ou **Apagar da nuvem** (exige o token).
- Limites: dados principais até cerca de 900 KB e cada imagem até cerca de 450 KB. Confira os limites do plano gratuito do Upstash.
- A sincronização só existe no site da Vercel. No link do Claude e no arquivo offline ela não aparece.

## Como atualizar o app depois
Quando eu entregar uma versão nova, baixe o `index.html` (e qualquer arquivo novo de `api/` ou `lib/` que eu avisar) e troque no repositório do GitHub (**Add file → Upload files**). A Vercel republica sozinha em cerca de um minuto.

## Segurança e privacidade
- As chaves (Resend, Meta) ficam só nas variáveis da Vercel, nunca no site.
- O servidor só aceita pedidos com o token certo. O token da página e o segredo do agendador são diferentes e não servem um no lugar do outro.
- O servidor guarda, até enviar, só o título, o horário e os canais de cada alerta. Depois de enviado, sai do Redis.
- O site da Vercel é público (qualquer pessoa com o endereço abre o app vazio), mas seus dados não estão lá: ficam criptografados no seu navegador.

## Limites e custos (confira nos sites antes de depender)
- Vercel Hobby: grátis. Upstash e cron-job.org: planos gratuitos. O agendador faz cerca de 1.500 comandos por dia no Redis.
- Resend grátis: 3.000 e-mails por mês e 100 por dia.
- WhatsApp (Meta): modelo de utilidade cobrado por mensagem entregue. Com 2 alertas por dia são cerca de 60 mensagens por mês.
- O servidor só conhece os próximos N dias (padrão 14, máximo 30). Abra o app dentro desse intervalo para renovar a lista.

## Problemas comuns
- **"Não consegui falar com o servidor"**: `ORIGEM_PERMITIDA` diferente do endereço da página, ou página aberta dentro do Claude.
- **"Token incorreto"**: o token do app não é igual ao `ENVIO_TOKEN`.
- **"Redis não configurado"**: o Passo 3 não foi concluído ou faltou o Redeploy.
- **E-mail não chega**: remetente não verificado no Resend (veja o detalhe no teste).
- **WhatsApp não chega**: modelo ainda não aprovado, nome/idioma diferentes de `WA_TEMPLATE`/`WA_LANG`, número fora da lista de destinatários do modo de teste, ou token expirado.
- **Alertas não saem na hora**: confira o histórico do cron-job.org (deve rodar a cada minuto e responder 200).
