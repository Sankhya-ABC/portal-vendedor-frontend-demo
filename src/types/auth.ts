export type Role = 'ADMIN' | 'USUARIO'

export interface Usuario {
  id: string
  email: string
  nomeUsuario: string
  codusu: string | null
  role: Role
  trocarSenhaProximoAcesso: boolean
}

export interface LoginResponse {
  token: string
  usuario: Usuario
}

export interface CriarUsuarioRequest {
  nomeUsuario: string
  email: string
  codusu?: string
}

export interface CriarUsuarioResponse {
  usuario: Usuario
  senhaTemporaria: string
}
