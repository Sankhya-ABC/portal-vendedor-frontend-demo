import { NAV_ITEMS } from '@/constants'
import { useAuth } from '@/contexts/AuthContext'
import { PanelLeftClose } from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  return (
    <>
      {open && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          aria-label="Fechar menu"
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 shrink-0 bg-[var(--color-sidebar)] text-white shadow-xl transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      <div className="flex h-16 items-center justify-between gap-2 border-b border-white/15 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 font-bold text-white">
            S
          </div>
          <span className="font-semibold tracking-tight">Portal Vendedor</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/20 hover:text-white lg:hidden"
          aria-label="Ocultar menu"
        >
          <PanelLeftClose className="h-5 w-5" />
        </button>
      </div>
      <nav className="scrollbar-thin sidebar-scroll flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
      </aside>
    </>
  )
}
