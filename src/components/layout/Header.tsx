import { ROUTES } from '@/constants'
import { useAuth } from '@/contexts/AuthContext'
import { Menu } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

interface HeaderProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const showWelcome = pathname === ROUTES.HOME

  const handleSair = () => {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <header className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:px-4 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
          aria-label={sidebarOpen ? 'Ocultar menu' : 'Abrir menu'}
        >
          <Menu className="h-5 w-5" />
        </button>
        {showWelcome ? (
          <h1 className="truncate text-sm font-semibold text-slate-800 sm:text-base lg:text-lg">
            Bem-vindo(a), {user?.nomeUsuario ?? user?.email ?? 'Usuário'}
          </h1>
        ) : null}
        <span className="hidden rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 sm:inline-flex">
          Mensagens não lidas (3)
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleSair}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 sm:px-3 sm:text-sm"
        >
          Sair
        </button>
      </div>
    </header>
  )
}
