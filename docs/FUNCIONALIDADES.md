# Funcionalidades

## Acesso e segurança
- Cria acesso com nome, login e senha (mínimo 8 caracteres). Dados criptografados com AES-256-GCM; a chave deriva da senha (PBKDF2, 210.000 iterações).
- A senha **não pode ser recuperada**. Mantenha um backup (Dados ▾ → Backup completo JSON).
- Opção "Manter conectado nesta aba". Histórico dos últimos 15 acessos.
- **Modo demonstração:** botão nas telas de acesso. Entra sem senha com dados de exemplo; **nada é gravado** (nem no navegador, nem na nuvem, nem alertas ou Google). Faixa fixa avisa e há botão "Sair da demonstração". Se já existe conta real no navegador, ela não é tocada. Minha conta e Sincronização ficam bloqueadas na demo.

## Categorias
Pós-graduação, Concurso, Livros, Cursos IA e Renda Extra. Cada item tem status, prioridade, datas (compra, início, término previsto, vencimento do acesso), progresso (aulas/disciplinas/páginas), certificado, login, link e observações.

### Valores e parcelas
- Campos: valor total (R$), nº de parcelas (vazio = à vista) e parcelas pagas.
- Saldo = valor − parcelas pagas × valor da parcela, com arredondamento exato. Tag "Quitado".
- Dashboard: Já pago, Saldo a pagar, Parcelas pagas, Cursos quitados.

### Livros
Título, autor(a), edição, editora, categoria do livro, gênero, tema, formato, nota. 4 categorias e 34 gêneros em lista suspensa em cascata (escolher a categoria filtra os gêneros; escolher só o gênero preenche a categoria). Filtro por categoria ou gênero na tela.

## Radar de próximas aquisições
Itens que você pretende comprar (nome, instituição, valor estimado, previsão, prioridade, link, motivo; livros com autor e edição). Botão **✔ Comprei** pré-preenche o cadastro e remove do radar.

## Planejador, Roadmap e Metas
- Blocos de estudo com repetição (semanal, diária, quinzenal, mensal, única), sessões, sessões extras e conclusão que avança o curso.
- Excluir uma sessão desfaz também a marcação e o avanço do curso.
- Roadmap (Gantt) de 12 meses com linha de hoje; botões de editar e excluir sempre visíveis.
- Metas mensais de horas por categoria, Diário de Estudo, hábitos.
- Dashboard com indicadores (o número encolhe para caber inteiro no quadro e todos de uma fileira usam o mesmo tamanho).

## Avisos de segurança do usuário
- Janela do próprio app (não `confirm()` do navegador) antes de salvar em formulários de dados, com "Continuar / Descartar / Salvar" ao sair com alterações. Dados ▾ → "Perguntar antes de salvar" liga/desliga.
- Lixeira 🗑 com confirmação em tabelas, Roadmap, planejador, hábitos, modais, Diário e Dashboard. Bloco recorrente avisa que todas as ocorrências serão apagadas.

## Planilha (baixar e enviar)
Ver `PLANILHA.md`. Botões **⬇ Baixar planilha** e **⬆ Enviar planilha** no cartão do Dashboard e no menu Dados.

## Lembretes
- **Envio imediato por API** (e-mail e WhatsApp): botões "Enviar mensagem" e "Enviar teste".
- **Alertas automáticos:** até 4 regras de antecedência (minutos, horas, dias); tipos: blocos, vencimento, prova, registro diário, planejar semana; horizonte de 7 a 30 dias. O app envia a lista ao servidor, que dispara na hora certa mesmo com o app fechado.
- **Google Agenda:**
  - Dentro do Claude usa o conector do Claude.
  - No site usa login do Google (Client ID próprio), cria eventos com marca interna para não duplicar; "Recriar" apaga e recria só os que o app criou.

## Sincronização entre aparelhos
Dados já criptografados no Redis do próprio servidor; entrada pela tela "Entrar com a nuvem"; atualização ao salvar, ao voltar para a aba, ao ficar online e a cada 1 minuto; combinação automática de alterações feitas em dois aparelhos; troca de senha propaga; bloqueio de 15 minutos após 8 tentativas erradas. Só existe no site da Vercel.

## Aparência
Paletas de cores (inclui Sage Dreams), modo claro/escuro, capa e foto de perfil personalizáveis. Layout testado sem rolagem lateral em 320, 360, 390, 768 e 1280 px; contraste de cores verificado.
