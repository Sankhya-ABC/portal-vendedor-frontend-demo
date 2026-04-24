# Feature: exibicao de boas-vindas no header

## O que foi feito

- O texto `Bem-vindo(a), ...` no `Header` agora aparece apenas na rota inicial (`/`).
- Nas demais telas, o header nao exibe a saudacao.

## Por que foi feito

- Atender ao requisito de mostrar a mensagem de boas-vindas somente na tela inicial.

## Como funciona

- O componente `Header` passou a usar `useLocation`.
- Foi criada a condicao `showWelcome = pathname === ROUTES.HOME`.
- A renderizacao do titulo de boas-vindas ocorre apenas quando `showWelcome` for `true`.

## Pontos principais no codigo

- `src/components/layout/Header.tsx`
  - import de `useLocation`;
  - verificacao da rota atual;
  - renderizacao condicional do texto de boas-vindas.

## Decisoes tecnicas relevantes

- Solucao aplicada no proprio `Header` para manter a regra centralizada.
- Sem alteracoes em rotas, layout principal ou demais paginas.
