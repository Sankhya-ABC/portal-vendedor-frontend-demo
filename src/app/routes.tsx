import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { ROUTES } from '@/constants'
import { AdminConfiguracaoNotaPage } from '@/pages/admin/AdminConfiguracaoNotaPage'
import { AdminUsuariosPage } from '@/pages/admin/AdminUsuariosPage'
import { ClientesPage } from '@/pages/ClientesPage'
import { ProdutosPage } from '@/pages/ProdutosPage'
import { ConsultasPage } from '@/pages/ConsultasPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { MensagensPage } from '@/pages/MensagensPage'
import { NovoClientePage } from '@/pages/NovoClientePage'
import { NovoPedidoPage } from '@/pages/NovoPedidoPage'
import { VendasClientesTabPage } from '@/pages/vendas/VendasClientesTabPage'
import { VendasProdutosTabPage } from '@/pages/vendas/VendasProdutosTabPage'
import { VendasConsultaPage } from '@/pages/VendasConsultaPage'
import { VendasPage } from '@/pages/VendasPage'
import { Navigate, Route, Routes } from 'react-router-dom'

export function AppRoutes() {
  return (
    <Routes>
      {/* Login público — sem proteção; sempre acessível */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      {/* Rotas protegidas: exigem autenticação; sessão persiste via localStorage */}
      <Route
        path={ROUTES.HOME}
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="admin/usuarios" element={<ProtectedRoute adminOnly><AdminUsuariosPage /></ProtectedRoute>} />
        <Route path="admin/configuracao-nota" element={<ProtectedRoute adminOnly><AdminConfiguracaoNotaPage /></ProtectedRoute>} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="clientes/novo" element={<NovoClientePage />} />
        <Route path="produtos" element={<ProdutosPage />} />
        <Route path="vendas" element={<VendasPage />}>
          <Route index element={<Navigate to={ROUTES.VENDAS_CLIENTES} replace />} />
          <Route path="clientes" element={<VendasClientesTabPage />} />
          <Route path="catalogo" element={<VendasProdutosTabPage />} />
          <Route path="pedido" element={<NovoPedidoPage />} />
          <Route path="consultar" element={<VendasConsultaPage />} />
        </Route>
        <Route path="consultas" element={<ConsultasPage />} />
        <Route path="mensagens" element={<MensagensPage />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}
