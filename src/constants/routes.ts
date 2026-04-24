/**
 * Paths da aplicação — única fonte de verdade para URLs.
 * Use em Link, useNavigate, redirect e rotas.
 */
export const ROUTES = {
  LOGIN: '/login',
  HOME: '/',
  ADMIN_USUARIOS: '/admin/usuarios',
  ADMIN_CONFIGURACAO_NOTA: '/admin/configuracao-nota',
  CLIENTES: '/clientes',
  CLIENTES_NOVO: '/clientes/novo',
  PRODUTOS: '/produtos',
  VENDAS: '/vendas',
  VENDAS_CLIENTES: '/vendas/clientes',
  VENDAS_CATALOGO: '/vendas/catalogo',
  VENDAS_PEDIDO: '/vendas/pedido',
  VENDAS_CONSULTAR: '/vendas/consultar',
  CONSULTAS: '/consultas',
  MENSAGENS: '/mensagens',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
