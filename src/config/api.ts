/**
 * Referência de endpoints do portal (paridade com o front oficial).
 * Neste repositório DEMO as chamadas HTTP foram substituídas por mocks nos
 * `services/*`; este arquivo não é importado pelo app.
 */
export const API_BASE_URL = '/api'

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
