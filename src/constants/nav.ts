import {
  ClipboardList,
  LayoutDashboard,
  Mail,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from './routes'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  adminOnly?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.HOME, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.ADMIN_USUARIOS, label: 'Usuários (Admin)', icon: Shield, adminOnly: true },
  { to: ROUTES.ADMIN_CONFIGURACAO_NOTA, label: 'Configuração Nota', icon: Settings, adminOnly: true },
  { to: ROUTES.CLIENTES, label: 'Clientes', icon: Users },
  { to: ROUTES.PRODUTOS, label: 'Produtos', icon: Package },
  { to: ROUTES.VENDAS, label: 'Pedido de Venda', icon: ShoppingCart },
  { to: ROUTES.CONSULTAS, label: 'Consultas', icon: ClipboardList },
  { to: ROUTES.MENSAGENS, label: 'Mensagens', icon: Mail },
]
