# Testes

Os testes rodam o `index.html` real em um navegador simulado (jsdom + Node) ou em um Chromium (Playwright), com a rede simulada. **Nenhum deles fala com Vercel, Redis, Resend, Meta ou Google de verdade.**

## O que está neste repositório
| Arquivo | O que faz |
|---|---|
| `testes/demo-login.test.js` | 14 verificações do modo demonstração: entra sem senha, faixa de aviso, nada gravado em `localStorage`/`sessionStorage`, Minha conta e Sincronização bloqueadas, sair, conta real intacta antes e depois. |
| `testes/demo-captura-tela.js` | Captura de tela da tela de acesso e da faixa da demo em 390 px (Playwright). |

Como rodar (a partir da pasta `testes/`):
```
npm install
node demo-login.test.js
```
Resultado esperado: 14 linhas com ✓ e "sem erros de página".

## Histórico das suítes da fase anterior
Estas suítes existiram e passaram na época, mas **os arquivos não foram preservados** no ambiente e não estão aqui. Ficam como registro do que foi coberto:

| Suíte | Verificações | Cobertura |
|---|---|---|
| smoke2 | 11 | login, senha, paletas |
| smoke3 | 23 | entrada, planejador, lembretes (3 falhas conhecidas por dia da semana dos blocos de exemplo) |
| smoke4 | 40 | recorrência, Excel ida e volta |
| smoke5 | 19 | modais de edição |
| smoke6 | 21 | API de envio imediato |
| smoke7 | 22 | parcelas e saldo |
| smoke8 | 32 | radar de aquisições |
| smoke9 | 19 | campos de Livros |
| smoke10 | 34 | categoria e gênero de Livros |
| smoke11 | 31 | avisos antes de salvar |
| smoke12 | 43 | alertas automáticos |
| smoke13 | 27 | Google Agenda direto |
| smoke14 | 40 | lixeiras e confirmação de exclusão |
| smoke15 | 62 | sincronização entre dois aparelhos |
| smoke16 | 25 | planilha formatada: baixar, editar, enviar |
| smoke17 / demo | 14 | login demonstração (este é o que está no repositório) |
| dados.test.js | 43 | servidor de sincronização (`api/dados.js`) |
| servidor.test.js | 34 | servidor de envio (`api/enviar.js`) |
| contraste | 0 pares abaixo do mínimo | contraste de cores das paletas |
| overflow | 5 larguras × 5 telas | sem rolagem lateral (320, 360, 390, 768, 1280 px) |

## Recomendação
Antes de uma mudança grande, recriar ao menos: login real, ida e volta da planilha, sincronização entre dois aparelhos simulados e o servidor (`api/*.js` com Redis simulado).
