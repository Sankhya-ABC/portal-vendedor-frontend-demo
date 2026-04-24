import type { LoginResponse, Usuario } from '@/types'

const STORAGE_TOKEN = 'portal_vendedor_token'
const STORAGE_USER = 'portal_vendedor_user'

/** Acesso seguro ao localStorage (evita erro em ambientes restritos). */
function safeGetItem(key: string): string | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value)
  } catch {
    // ignorar falha de quota ou localStorage desabilitado
  }
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key)
  } catch {
    // ignorar
  }
}

export function getStoredToken(): string | null {
  return safeGetItem(STORAGE_TOKEN)
}

export function getStoredUser(): Usuario | null {
  const raw = safeGetItem(STORAGE_USER)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && 'id' in parsed && 'email' in parsed) {
      return parsed as Usuario
    }
    return null
  } catch {
    return null
  }
}

export function setStoredAuth(token: string, usuario: Usuario): void {
  safeSetItem(STORAGE_TOKEN, token)
  safeSetItem(STORAGE_USER, JSON.stringify(usuario))
}

export function clearStoredAuth(): void {
  safeRemoveItem(STORAGE_TOKEN)
  safeRemoveItem(STORAGE_USER)
}

async function mockDelay(ms = 80): Promise<void> {
  await new Promise((r) => setTimeout(r, ms))
}

const MOCK_USUARIO: Usuario = {
  id: 'user-demo-1',
  email: 'vendedor@demo.local',
  nomeUsuario: 'Vendedor Demo',
  codusu: '99',
  role: 'USUARIO',
  trocarSenhaProximoAcesso: false,
}

const MOCK_ADMIN: Usuario = {
  id: 'u-admin-1',
  email: 'admin@demo.local',
  nomeUsuario: 'Administrador Demo',
  codusu: '0',
  role: 'ADMIN',
  trocarSenhaProximoAcesso: false,
}

export async function login(loginValue: string, senha: string): Promise<LoginResponse> {
  await mockDelay(100)
  const loginTrim = loginValue.trim()

  // Credencial fixa para acessar telas ADMIN no demo
  if ((loginTrim === 'admin123' || loginTrim === MOCK_ADMIN.email) && senha === 'admin123') {
    return {
      token: `portal-session-${encodeURIComponent(loginTrim || 'admin')}`,
      usuario: { ...MOCK_ADMIN },
    }
  }

  return {
    token: `portal-session-${encodeURIComponent(loginTrim || 'demo')}`,
    usuario: {
      ...MOCK_USUARIO,
      email: loginTrim || MOCK_USUARIO.email,
    },
  }
}

export async function alterarSenha(_token: string, _senhaAtual: string, _novaSenha: string): Promise<void> {
  await mockDelay(100)
}
