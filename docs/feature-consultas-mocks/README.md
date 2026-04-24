# Feature: mocks na tela de Consultas

## O que foi feito

- A tela `Consultas` agora exibe dados mockados para cada item do menu lateral.
- Foram adicionados:
  - cards de resumo (3 indicadores por consulta);
  - tabela com colunas e linhas ficticias por tipo de consulta.

## Por que foi feito

- Permitir validacao visual e navegacao da tela sem depender de backend.
- Substituir o placeholder "em construcao" por conteudo util para homologacao da interface.

## Como funciona

- O menu lateral segue controlado por `ativo`.
- Foi criado um mapa local `consultasMock` indexado pelo `id` da consulta.
- Ao trocar o item do menu:
  - atualiza o cabecalho (titulo/descricao);
  - renderiza os indicadores de resumo;
  - renderiza a tabela correspondente.

## Pontos principais no codigo

- `src/pages/ConsultasPage.tsx`
  - tipos locais: `ConsultaResumo`, `ConsultaTabela`, `ConsultaConteudo`;
  - estrutura de dados mock: `consultasMock`;
  - renderizacao dos cards e da tabela no painel principal.

## Decisoes tecnicas relevantes

- Os mocks ficaram locais na pagina para manter escopo pequeno e isolado.
- Nao foi criado service/hook novo, pois nao houve requisito de reuso entre telas.
- Nenhuma rota ou contrato de API foi alterado.
