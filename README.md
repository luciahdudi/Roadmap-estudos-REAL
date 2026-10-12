# Roadmap de Cursos & Aprendizado

App web pessoal (um único `index.html`) para planejar cursos, concursos, livros e renda extra, com planejador de estudos, controle de valores e parcelas, lembretes por e-mail/WhatsApp, Google Agenda e sincronização entre aparelhos. Os dados ficam **criptografados** (AES-256-GCM) e protegidos por senha.

> Lucia Dias — Soluções que Conectam

## O que tem aqui

| Pasta / arquivo | Conteúdo |
|---|---|
| `index.html` | O app completo (HTML + CSS + JS, sem build). É o que a Vercel publica. |
| `api/` | Funções do servidor (Vercel): `dados.js` (sincronização), `enviar.js` (envio imediato), `agendar.js` (guarda alertas), `cron.js` (dispara na hora certa). |
| `lib/` | Código comum do servidor: `auth.js`, `enviar.js`, `redis.js`. |
| `vercel.json`, `package.json` | Configuração da Vercel (cabeçalhos de segurança, Node 20+). |
| `LEIA-ME.md` | Passo a passo de implantação (Passos 1 a 10). |
| `docs/` | Documentação detalhada (veja abaixo). |
| `planilhas/` | Planilhas de modelo e exemplo que abastecem o app. |
| `testes/` | Scripts de teste que ainda existem (veja `docs/TESTES.md`). |

## Documentação

1. [`LEIA-ME.md`](LEIA-ME.md): como colocar no ar (GitHub, Vercel, Redis, e-mail, WhatsApp, cron, Google Agenda, sincronização).
2. [`docs/FUNCIONALIDADES.md`](docs/FUNCIONALIDADES.md): tudo o que o app faz.
3. [`docs/PLANILHA.md`](docs/PLANILHA.md): a planilha formatada (baixar e enviar), abas, listas e fórmulas.
4. [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md): criptografia, sincronização, combinação de alterações, alertas.
5. [`docs/VARIAVEIS.md`](docs/VARIAVEIS.md): variáveis de ambiente da Vercel.
6. [`docs/TESTES.md`](docs/TESTES.md): o que foi testado e como.
7. [`docs/HISTORICO.md`](docs/HISTORICO.md): evolução do app.
8. [`docs/PENDENCIAS.md`](docs/PENDENCIAS.md): o que falta fazer.

## Começo rápido

- **Só usar, sem servidor:** abra `index.html` no navegador (Chrome, Edge, Firefox ou Safari). Crie seu acesso (login e senha) ou toque em **Entrar no modo demonstração** para só ver (nada é salvo).
- **Com alertas, Google Agenda e sincronização:** publique este repositório na Vercel e siga o `LEIA-ME.md`. O site funciona logo após o primeiro deploy; o Redis e as variáveis liberam o restante.

## Privacidade em uma linha

A senha nunca sai do navegador, os dados sobem já criptografados e o servidor guarda só blocos ilegíveis para ele. Detalhes em `docs/ARQUITETURA.md`.
