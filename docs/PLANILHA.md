# Planilha do app (baixar e enviar)

Gerada no navegador com ExcelJS (carregado da internet no clique). Sem internet, o app gera uma versão simples (sem cores, listas e fórmulas) e avisa.

## Abas (nesta ordem)
`Leia-me` · `Resumo` · `Pós-graduação` · `Concurso` · `Livros` · `Cursos IA` · `Renda Extra` · `Radar de Aquisições` · `Diário de Estudo` · `Plano de Estudos` · `Metas` · `Configurações` · `Listas`

## Formatação
- Cabeçalho colorido com a paleta escolhida, primeira linha e coluna congeladas, filtros, bordas.
- Datas `dd/mm/aaaa` (gravadas como número de série do Excel), valores em R$, porcentagem.
- Cores automáticas: Status, Prioridade Alta, saldo a pagar > 0, vencimento do acesso (vencido/perto de vencer), barra de % andamento.
- Cada aba traz linhas em branco já formatadas (40; 60 no Diário; 30 no Plano) para acrescentar itens.

## Listas suspensas e validações
Status, Prioridade, Certificado, Formato, Categoria do livro, Gênero (34), Repetição, Dia da semana e Categoria vêm da aba `Listas` (não altere). Datas, números inteiros, valores e nota (1 a 5) são validados.

## Fórmulas
- **Saldo a pagar** e **% andamento** nas categorias (colunas cinza-claro, não digite nelas).
- **Resumo:** itens, valor total, já pago, saldo e progresso médio por categoria, com total geral. Atualiza sozinho ao editar as outras abas.

## Enviar de volta
1. Toque em **⬆ Enviar planilha** e escolha o arquivo `.xlsx`.
2. O app mostra uma prévia do que encontrou e você escolhe **Mesclar** (atualiza e acrescenta, sem duplicar nem apagar) ou **Substituir** (deixa o app igual à planilha).
3. Não apague a coluna cinza **ID interno** das linhas existentes: é ela que evita duplicar. Em linhas novas, deixe em branco.

Compatibilidade: lê também as planilhas antigas (incluindo "Valor pago" e a planilha-modelo com banners). Arquivo sem a aba Radar não apaga o radar existente. Textos que começam com `=` são tratados como texto, nunca como fórmula.

## Arquivos em `planilhas/`
- `Roadmap_Planilha_Formatada_Exemplo.xlsx`: exemplo gerado pelo app.
- `Roadmap_Cursos_SageDreams*.xlsx`: planilhas-modelo anteriores (a v3 ainda é importável).
