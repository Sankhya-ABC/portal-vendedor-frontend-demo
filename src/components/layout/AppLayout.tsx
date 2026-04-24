import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const syncSidebarState = (matches: boolean) => setSidebarOpen(matches)

    syncSidebarState(mediaQuery.matches)
    const handleChange = (event: MediaQueryListEvent) => syncSidebarState(event.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 overflow-hidden bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${
          sidebarOpen ? 'lg:pl-64' : 'pl-0'
        }`}
      >
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
        {/*
          Scroll só aqui (não no documento). Evita bug de “linha invisível” que distorce texto ao rolar
          com header position:sticky sobre o mesmo compositor do Chrome/Edge (GPU).
        */}
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-3 py-4 sm:px-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
