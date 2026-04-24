import { ROUTES } from '@/constants'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, token, user, loading: authLoading } = useAuth()
  const [loginValue, setLoginValue] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? ROUTES.HOME

  // Se já tem sessão, mantém e redireciona para a área logada
  useEffect(() => {
    if (!authLoading && token && user) {
      navigate(from, { replace: true })
    }
  }, [authLoading, token, user, from, navigate])

  if (authLoading || (token && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Carregando...</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await login(loginValue.trim(), senha)
      navigate(from, { replace: true })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500 text-2xl font-bold text-white shadow-lg shadow-primary-500/25">
            S
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Portal Vendedor</h1>
          <p className="mt-1 text-slate-500">E-mail ou nome de usuário e senha</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="space-y-5">
            <div>
              <label htmlFor="login" className="mb-1.5 block text-sm font-medium text-slate-600">
                E-mail ou nome de usuário
              </label>
              <input
                id="login"
                type="text"
                autoComplete="username"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                placeholder="seu@email.com ou nome.usuario"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="senha" className="mb-1.5 block text-sm font-medium text-slate-600">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>
            {erro && <p className="text-sm text-red-500">{erro}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary-500 py-2.5 font-medium text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">
          Sistema desenvolvido para gestão de vendas e clientes
        </p>
      </div>
    </div>
  )
}
