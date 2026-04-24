# Feature: dashboard com graficos mockados

## O que foi feito

- Inclusao de paineis graficos na `DashboardPage` para leitura rapida:
  - faturamento semanal (barras);
  - distribuicao de status de pedidos (donut);
  - top clientes por faturamento (barras horizontais);
  - painel de clientes sincronizados com Sankhya (mock).

## Por que foi feito

- Melhorar a visualizacao executiva da tela inicial e apoiar tomada de decisao sem depender de integracao backend imediata.

## Como funciona

- Os dados sao mockados no proprio arquivo da pagina.
- Os graficos sao renderizados com Tailwind + CSS (sem dependencia nova).
- O painel Sankhya traz status rapido de sincronizacao por cliente.

## Pontos principais no codigo

- `src/pages/DashboardPage.tsx`
  - mocks: `FATURAMENTO_SEMANA`, `TOP_CLIENTES`, `STATUS_PEDIDOS`, `CLIENTES_SANKHYA`;
  - calculos auxiliares para escala visual;
  - blocos de visualizacao em cards com estilo moderno.

## Decisoes tecnicas relevantes

- Mantido escopo local no dashboard para entrega rapida.
- Sem alteracao de rotas, services, hooks ou contratos de API.
