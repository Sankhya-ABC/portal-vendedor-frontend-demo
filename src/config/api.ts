/**
 * Base URL do backend (deve terminar em /api quando atrás do proxy Nginx).
 * Em dev usa '' (proxy do Vite em /api → localhost:8082).
 * Em produção: VITE_API_URL=/api (proxy) ou http://host:8082/api (direto).
 */
export const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : ((import.meta.env.VITE_API_URL as string) ?? 'http://localhost:8082/api')

export const API_ENDPOINTS = {
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_ALTERAR_SENHA: `${API_BASE_URL}/auth/alterar-senha`,
  ADMIN_USUARIOS: `${API_BASE_URL}/admin/usuarios`,
  ADMIN_USUARIOS_SEM_CODUSU: `${API_BASE_URL}/admin/usuarios/sem-codusu`,
  ADMIN_SINCRONIZAR_CODUSU: `${API_BASE_URL}/admin/usuarios/sincronizar-codusu`,
  ADMIN_CONFIGURACAO_NOTA: `${API_BASE_URL}/admin/configuracao-nota`,
  CONFIGURACAO_NOTA: `${API_BASE_URL}/configuracao-nota`,
  CLIENTES: `${API_BASE_URL}/parceiros`,
  CLIENTES_CONSULTAR_CNPJ: `${API_BASE_URL}/parceiros/buscar-por-cpf-cnpj`,
  CLIENTES_CADASTRAR: `${API_BASE_URL}/parceiros/cadastrar`,
  CLIENTES_SINCRONIZAR: `${API_BASE_URL}/parceiros/sincronizar`,
  PEDIDOS_CONFIRMAR: `${API_BASE_URL}/pedidos/confirmar`,
  PRODUTOS: `${API_BASE_URL}/produtos`,
  PRODUTOS_SINCRONIZAR: `${API_BASE_URL}/produtos/sincronizar`,
} as const
