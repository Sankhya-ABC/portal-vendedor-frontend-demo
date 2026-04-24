import { ROUTES } from '@/constants'
import { NavLink, Outlet } from 'react-router-dom'
import { VendasWorkspaceProvider } from './vendas/VendasWorkspaceContext'

const TABS = [
  { to: ROUTES.VENDAS_CLIENTES, label: 'Clientes', end: false },
  { to: ROUTES.VENDAS_CATALOGO, label: 'Produtos', end: false },
  { to: ROUTES.VENDAS_PEDIDO, label: 'Pedido de venda', end: false },
] as const

export function VendasPage() {
  return (
    <VendasWorkspaceProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pedido de Venda</h1>
          <p className="mt-1 text-slate-500">Busque cliente e produtos e monte o pedido de venda</p>
          <p className="mt-2 text-sm">
            <NavLink
              to={ROUTES.VENDAS_CONSULTAR}
              className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
            >
              Consultar pedidos
            </NavLink>
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <div className="flex flex-wrap gap-1">
            {TABS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex-1 basis-[calc(50%-0.125rem)] rounded-md px-3 py-2 text-center text-sm font-medium transition-colors sm:basis-auto sm:px-4 ${
                    isActive ? 'bg-primary-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
        <Outlet />
      </div>
    </VendasWorkspaceProvider>
  )
}
