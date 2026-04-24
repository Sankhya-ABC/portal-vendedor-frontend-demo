import type { CriarUsuarioRequest, CriarUsuarioResponse, Usuario } from '@/types'

async function mockDelay(): Promise<void> {
  await new Promise((r) => setTimeout(r, 80))
}

const MOCK_USUARIOS: Usuario[] = [
  {
    id: 'u-admin-1',
    email: 'admin@demo.local',
    nomeUsuario: 'Administrador Demo',
    codusu: '0',
    role: 'ADMIN',
    trocarSenhaProximoAcesso: false,
  },
  {
    id: 'u-vend-1',
    email: 'maria.silva@demo.local',
    nomeUsuario: 'Maria Silva',
    codusu: '12',
    role: 'USUARIO',
    trocarSenhaProximoAcesso: false,
  },
  {
    id: 'u-vend-2',
    email: 'joao.pereira@demo.local',
    nomeUsuario: 'João Pereira',
    codusu: null,
    role: 'USUARIO',
    trocarSenhaProximoAcesso: true,
  },
]

export async function listarUsuarios(_token: string): Promise<Usuario[]> {
  await mockDelay()
  return [...MOCK_USUARIOS]
}

export async function criarUsuario(_token: string, body: CriarUsuarioRequest): Promise<CriarUsuarioResponse> {
  await mockDelay()
  const novo: Usuario = {
    id: `u-${Date.now()}`,
    email: body.email,
    nomeUsuario: body.nomeUsuario,
    codusu: body.codusu ?? null,
    role: 'USUARIO',
    trocarSenhaProximoAcesso: true,
  }
  MOCK_USUARIOS.push(novo)
  return {
    usuario: novo,
    senhaTemporaria: 'Demo@2026',
  }
}

export interface SincronizarCodusuResult {
  mensagem: string
  vinculados: number
}

export async function sincronizarCodusu(_token: string): Promise<SincronizarCodusuResult> {
  await mockDelay()
  let vinculados = 0
  let seq = 77100
  for (const u of MOCK_USUARIOS) {
    if (u.role === 'ADMIN') continue
    if (u.codusu == null || u.codusu === '') {
      u.codusu = String(seq)
      seq += 1
      vinculados += 1
    }
  }

  const mensagem =
    vinculados > 0
      ? `CODUSU vinculado para ${vinculados} usuário(s). Os cadastros estão alinhados ao Sankhya e prontos para uso.`
      : 'Nenhum usuário pendente: todos já possuem CODUSU vinculado ao Sankhya.'

  return { mensagem, vinculados }
}

export const adminService = {
  listarUsuarios,
  criarUsuario,
  sincronizarCodusu,
}
