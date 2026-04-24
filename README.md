# Portal Vendedor - Frontend

Frontend do portal do vendedor: React 18 + TypeScript + Vite. Autenticação JWT, área admin, cadastro de clientes (com consulta por CNPJ), vendas, produtos, consultas e mensagens.

---

## Pré-requisitos

- Node.js 20+
- npm ou pnpm

## Setup

```bash
npm install
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173).  
Este DEMO não depende de backend: autenticação, clientes, admin, produtos, pedidos e mensagens usam **mocks** nos `services/*`. Não é necessário `VITE_API_URL`. Deploy em Docker: [docs/DEPLOY-PRODUCAO.md](docs/DEPLOY-PRODUCAO.md).

## Scripts

| Comando            | Descrição                  |
|--------------------|----------------------------|
| `npm run dev`      | Servidor de desenvolvimento |
| `npm run build`    | Build de produção          |
| `npm run preview`  | Preview do build           |

## Deploy em produção

Para subir o frontend DEMO em produção com Docker (build local, sem registry), veja **[docs/DEPLOY-PRODUCAO.md](docs/DEPLOY-PRODUCAO.md)**. Por padrão: porta **8083**, container **`demonstracao`**, imagem **`portal-vendedor-frontend-demonstracao:latest`**. Basta `./scripts/prod/deploy.sh`. Variáveis opcionais: `HOST_PORT`, `CONTAINER_NAME`, `IMAGE_NAME`, `SERVER_HOST_OVERRIDE`.

---

## Estrutura do projeto e o que faz cada diretório

```
src/
├── app/              # Bootstrap da aplicação: App, rotas, estilos globais
├── components/       # Componentes reutilizáveis: layout, UI, auth
├── config/          # Configuração da API (base URL e endpoints)
├── constants/       # Constantes: paths (ROUTES), menu (NAV_ITEMS), estilos de status
├── contexts/        # Contextos React (ex.: AuthContext para login/sessão)
├── hooks/           # Hooks reutilizáveis para dados (useClientes, useProdutos, useMensagens)
├── pages/           # Telas da aplicação (uma por rota)
├── services/        # Camada de dados (neste DEMO: mocks locais)
├── types/           # Tipos e interfaces de domínio (Cliente, Usuario, Produto, etc.)
└── main.tsx         # Ponto de entrada: ErrorBoundary + AuthProvider + App
```

---

## Detalhamento por diretório e arquivo

### `src/main.tsx`

- **Função:** Ponto de entrada da aplicação.
- Renderiza a árvore: `ErrorBoundary` → `AuthProvider` → `App`.
- Carrega os estilos globais (`global.css`).
- **ErrorBoundary:** captura erros não tratados no React e exibe tela de fallback com link para login, evitando tela branca.

---

### `src/app/`

| Arquivo        | Função |
|----------------|--------|
| **App.tsx**    | Envolve a aplicação com `BrowserRouter` e renderiza `AppContent`. |
| **AppContent.tsx** | Orquestra as rotas (`AppRoutes`) e exibe o modal de troca de senha no primeiro acesso (`TrocarSenhaModal`) quando `user.trocarSenhaProximoAcesso === true`. |
| **routes.tsx** | Define todas as rotas: `/login` (pública), rotas protegidas com `ProtectedRoute` e `AppLayout`, e redirecionamento `*` → HOME. |
| **styles/global.css** | Estilos globais: tema Tailwind (cores primary em azul, sidebar), reset básico, scrollbar e variáveis `--color-sidebar`. |

---

### `src/components/`

#### `components/layout/`

| Arquivo       | Função |
|---------------|--------|
| **AppLayout.tsx** | Layout principal após login: estado `sidebarOpen`, renderiza `Sidebar` e área principal (Header + `Outlet`). Conteúdo usa `pl-64` quando a sidebar está aberta e `pl-0` quando fechada. |
| **Sidebar.tsx**   | Menu lateral azul fixo. Lista `NAV_ITEMS` (filtra por `adminOnly` conforme role). Recebe `open` e `onClose`; ao fechar, desliza para fora com `-translate-x-full`. Botão com ícone `PanelLeftClose` para ocultar. |
| **Header.tsx**    | Barra superior: título de boas-vindas, badge de mensagens não lidas, botão “Sair”. Botão com ícone `Menu` para abrir/fechar a sidebar (`onToggleSidebar`). |

#### `components/ui/`

Componentes de interface reutilizáveis, exportados por `components/ui/index.ts`:

| Componente     | Função |
|----------------|--------|
| **Badge**      | Tag de status (ex.: status do cliente) com variantes de cor. |
| **Button**     | Botão com variantes: `primary`, `secondary`, `ghost`, `danger`. |
| **Card, CardHeader, CardContent** | Container com borda, sombra e opcional header/content. |
| **Input**      | Campo de texto com estilos padrão e suporte a `forwardRef`. |
| **PageHeader** | Título e descrição de página, com slot opcional `action` (ex.: botão “Novo cliente”). |

#### `components/auth/`

| Arquivo              | Função |
|----------------------|--------|
| **ProtectedRoute.tsx** | Enquanto `loading`, exibe “Carregando…”. Sem token/usuário, redireciona para `ROUTES.LOGIN`. Se `adminOnly` e usuário não for ADMIN, redireciona para HOME. Caso contrário, renderiza os filhos. |
| **TrocarSenhaModal.tsx** | Modal bloqueante para alterar senha no primeiro acesso. Campos: senha atual, nova senha, confirmar. Chama `alterarSenha` do `AuthContext` e atualiza o contexto em sucesso. |

#### `components/ErrorBoundary.tsx`

- Classe React que implementa `getDerivedStateFromError` e `componentDidCatch`.
- Em erro, mostra mensagem e link para `/login` em vez de tela branca.

---

### `src/config/`

| Arquivo  | Função |
|----------|--------|
| **api.ts** | Referência de paths do backend (paridade com o front oficial). **Não importado** no DEMO — as telas usam mocks em `services/*`. |

---

### `src/constants/`

| Arquivo           | Função |
|-------------------|--------|
| **routes.ts**     | `ROUTES`: objeto com todos os paths da aplicação (LOGIN, HOME, ADMIN_USUARIOS, CLIENTES, CLIENTES_NOVO, VENDAS, etc.). Fonte única de verdade para URLs em `Link`, `navigate` e definição de rotas. |
| **nav.ts**        | `NAV_ITEMS`: array de itens do menu lateral (path, label, ícone Lucide, `adminOnly` opcional). Sidebar usa isso para montar os links. |
| **statusCliente.ts** | `STATUS_CLIENTE_CSS`: mapeamento de `StatusCliente` para classes Tailwind dos badges (Ativo, Potencial, Inativo, Bloqueado). |
| **index.ts**      | Re-exporta `ROUTES`, `NAV_ITEMS`, `STATUS_CLIENTE_CSS` e tipos. |

---

### `src/contexts/`

| Arquivo         | Função |
|-----------------|--------|
| **AuthContext.tsx** | **AuthProvider:** mantém em estado `user`, `token` e `loading`. Na montagem, lê token e usuário do `localStorage` (via `authService`). Expõe: `login`, `logout`, `alterarSenha`, `refreshUser`. **useAuth:** hook para acessar o contexto. Login persiste token e usuário no storage; logout limpa. Alterar senha atualiza usuário no contexto e no storage. |

---

### `src/hooks/`

| Arquivo           | Função |
|-------------------|--------|
| **useClientes.ts**  | Recebe `params` (busca, status). Usa `useAuth` para o token e chama `clienteService.listar(token, params)`. Retorna `{ clientes, loading, error }`. |
| **useProdutos.ts**  | Chama `produtoService.listar(params)` e retorna `{ produtos, loading, error }`. (Hoje ainda usa mock no service.) |
| **useMensagens.ts** | Chama `mensagemService.listar()` e retorna `{ mensagens, loading, error }`. (Hoje ainda usa mock no service.) |
| **index.ts**       | Re-exporta os hooks. |

---

### `src/pages/`

Cada arquivo é a tela (página) correspondente a uma ou mais rotas.

| Página               | Rota(s)              | Função resumida |
|----------------------|-----------------------|------------------|
| **LoginPage.tsx**    | `/login`              | Formulário de login (e-mail ou nome de usuário + senha). Se já houver token/usuário, redireciona. Chama `login` do contexto e, em sucesso, navega para a rota de origem ou HOME. |
| **DashboardPage.tsx**| `/`                   | Dashboard inicial com atalhos (novo cliente, novo pedido, etc.). |
| **AdminUsuariosPage.tsx** | `/admin/usuarios` | Área admin: listagem de usuários, formulário de novo usuário (nome, e-mail, CODUSU), exibição da senha temporária ao criar, botão “Sincronizar CODUSU”. Só acessível para role ADMIN. |
| **ClientesPage.tsx** | `/clientes`          | Listagem de clientes com filtro por busca e status. Usa `useClientes`. Botão “Novo cliente” leva a `/clientes/novo`. |
| **NovoClientePage.tsx** | `/clientes/novo`  | Formulário de novo cliente: campo CNPJ + botão “Consultar CNPJ” (chama `clienteService.consultarPorCnpj`); preenche automaticamente razão social, fantasia, contato, e-mail, telefones. Seção “Origem do cliente” e anexos. |
| **VendasPage.tsx**   | `/vendas`             | Workspace “Pedido de Venda”: abas Clientes, Produtos (catálogo) e Pedido; índice redireciona para `/vendas/clientes`. |
| **VendasClientesTabPage.tsx** | `/vendas/clientes` | Busca e seleção de cliente (integra com contexto do workspace). |
| **VendasProdutosTabPage.tsx** | `/vendas/catalogo` | Catálogo com filtros e “Adicionar ao pedido”. |
| **NovoPedidoPage.tsx** | `/vendas/pedido` | Formulário de novo pedido: cabeçalho, itens (PMV/PSV/PUV), bloco comercial e resumo lateral; confirmação via `pedidoService` mock. |
| **VendasConsultaPage.tsx** | `/vendas/consultar` | Tela de consulta de vendas (link no layout de vendas, fora das três abas). |
| **ProdutosPage.tsx** | *(sem rota ativa)*   | Legado: listagem com `useProdutos`. O fluxo atual de produtos é a aba **Catálogo** em `/vendas/catalogo`. |
| **ConsultasPage.tsx**| `/consultas`          | Opções de consultas (ex.: soma de pedidos por cliente). |
| **MensagensPage.tsx**| `/mensagens`          | Lista de mensagens. Usa `useMensagens`. |

---

### `src/services/`

Camada de dados: neste repositório DEMO as funções simulam latência e retornam dados fictícios. Exportações em `services/index.ts`.

| Arquivo            | Função |
|--------------------|--------|
| **authService.ts** | `login` / `alterarSenha` — mock (token e usuário fictícios). Persistência: `getStoredToken`, `getStoredUser`, `setStoredAuth`, `clearStoredAuth` (localStorage). |
| **adminService.ts**| **listarUsuarios**, **criarUsuario**, **sincronizarCodusu** — mock (lista fixa + criação simulada). |
| **clienteService.ts** | **listar**, **consultarPorCnpj**, cadastro/sincronização — mock com dados fictícios e `mapResponseToForm` para o formulário. |
| **produtoService.ts** | **listar** / **sincronizar** — catálogo mock (lista fixa). |
| **mensagemService.ts** | **listar()** — mensagens mock. |

---

### `src/types/`

Tipos e interfaces de domínio, re-exportados por `types/index.ts`.

| Arquivo     | Conteúdo |
|-------------|----------|
| **auth.ts** | `Role`, `Usuario`, `LoginResponse`, `CriarUsuarioRequest`, `CriarUsuarioResponse`. |
| **cliente.ts** | `StatusCliente`, `Cliente`, `ClienteConsultaCNPJForm` (dados do form após consulta por CNPJ). |
| **produto.ts** | `Produto`, `ItemPedido`. |
| **mensagem.ts** | `Mensagem`. |
| **index.ts** | Re-exporta todos os tipos usados no app. |

---

## Resumo das principais “classes” e responsabilidades

| Onde           | Nome / conceito        | O que faz |
|----------------|------------------------|-----------|
| **main.tsx**   | ErrorBoundary          | Captura erros da árvore React e mostra fallback. |
| **main.tsx**   | AuthProvider           | Fornece estado global de autenticação (user, token, loading) e funções login/logout/alterarSenha. |
| **app/routes.tsx** | Rotas e ProtectedRoute | Define rotas públicas e protegidas; protege por token e, quando aplicável, por role ADMIN. |
| **contexts/AuthContext** | AuthProvider, useAuth | Gerencia sessão (leitura do storage na inicialização, persistência no login/logout). |
| **services/authService** | login, alterarSenha, storage | Mock de auth; lê/escreve token e usuário no localStorage. |
| **services/adminService** | listarUsuarios, criarUsuario, sincronizarCodusu | Operações de admin (usuários e CODUSU). |
| **services/clienteService** | listar, consultarPorCnpj, mapResponseToForm | Listagem de clientes e consulta por CNPJ com mapeamento para o form. |
| **constants/routes** | ROUTES                 | Paths da aplicação em um único lugar. |
| **constants/nav**    | NAV_ITEMS              | Itens do menu lateral (path, label, ícone, adminOnly). |
| **config/api**      | Referência de endpoints (não usada pelo app no DEMO). |

---

## Regras de uso no código

- **Rotas:** usar sempre `ROUTES` de `@/constants` em `Link`, `navigate` e na definição de rotas.
- **Dados:** páginas usam **hooks** (`useClientes`, etc.); hooks chamam **services**; neste DEMO os services retornam dados mockados.
- **UI:** preferir componentes de `@/components/ui` para manter consistência.
- **Tipos:** entidades em `@/types`; páginas e services importam de lá.
- **Dados DEMO:** lógica nos `services/*`; `config/api.ts` serve só como referência de paths do projeto oficial.

---

## Stack

- React 18 + TypeScript  
- Vite + Tailwind CSS  
- React Router, Lucide React (ícones)  
- Alias `@/` → `src/`
