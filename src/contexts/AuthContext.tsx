import {
  alterarSenha as apiAlterarSenha,
  clearStoredAuth,
  getStoredToken,
  getStoredUser,
  login as apiLogin,
  setStoredAuth,
} from '@/services/authService'
import type { Usuario } from '@/types'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface AuthContextValue {
  user: Usuario | null
  token: string | null
  loading: boolean
  login: (login: string, senha: string) => Promise<void>
  logout: () => void
  alterarSenha: (senhaAtual: string, novaSenha: string) => Promise<void>
  refreshUser: (usuario: Usuario) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    try {
      const t = getStoredToken()
      const u = getStoredUser()
      if (mounted && t && u) {
        setToken(t)
        setUser(u)
      }
    } catch {
      // localStorage indisponível ou dados inválidos: mantém não logado
    } finally {
      if (mounted) setLoading(false)
    }
    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (loginValue: string, senha: string) => {
    const res = await apiLogin(loginValue, senha)
    setStoredAuth(res.token, res.usuario)
    setToken(res.token)
    setUser(res.usuario)
  }, [])

  const logout = useCallback(() => {
    clearStoredAuth()
    setToken(null)
    setUser(null)
  }, [])

  const alterarSenha = useCallback(
    async (senhaAtual: string, novaSenha: string) => {
      if (!token) throw new Error('Não autenticado')
      await apiAlterarSenha(token, senhaAtual, novaSenha)
      const next = user ? { ...user, trocarSenhaProximoAcesso: false } : null
      setUser(next)
      if (next) setStoredAuth(token, next)
    },
    [token, user]
  )

  const refreshUser = useCallback((usuario: Usuario) => {
    setUser(usuario)
    const t = getStoredToken()
    if (t) setStoredAuth(t, usuario)
  }, [])

  const value = useMemo(
    () => ({ user, token, loading, login, logout, alterarSenha, refreshUser }),
    [user, token, loading, login, logout, alterarSenha, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
