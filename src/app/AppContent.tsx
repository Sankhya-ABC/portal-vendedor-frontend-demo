import { TrocarSenhaModal } from '@/components/auth/TrocarSenhaModal'
import { useAuth } from '@/contexts/AuthContext'
import { AppRoutes } from './routes'

/**
 * Orquestra rotas e modal de troca de senha no primeiro acesso.
 * Sessão é mantida via token em localStorage (segurança: token com expiração no back; use HTTPS em produção).
 */
export function AppContent() {
  const { user } = useAuth()
  const showTrocarSenha = user?.trocarSenhaProximoAcesso === true

  return (
    <>
      <AppRoutes />
      {showTrocarSenha && <TrocarSenhaModal />}
    </>
  )
}
