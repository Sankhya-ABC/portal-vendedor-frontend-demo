import { Button, Input } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

interface TrocarSenhaModalProps {
  onSuccess?: () => void
}

export function TrocarSenhaModal({ onSuccess }: TrocarSenhaModalProps) {
  const { alterarSenha } = useAuth()
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    if (novaSenha !== confirmar) {
      setErro('Nova senha e confirmação não conferem.')
      return
    }
    if (novaSenha.length < 6) {
      setErro('Nova senha deve ter no mínimo 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      await alterarSenha(senhaAtual, novaSenha)
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmar('')
      onSuccess?.()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao alterar senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">Alterar senha</h2>
        <p className="mt-1 text-sm text-slate-500">
          É seu primeiro acesso. Defina uma nova senha para continuar.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Senha atual (temporária)
            </label>
            <Input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="••••••••"
              required
              className="border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Nova senha</label>
            <Input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              className="border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Confirmar nova senha
            </label>
            <Input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Repita a nova senha"
              required
              className="border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400"
            />
          </div>
          {erro && <p className="text-sm text-red-500">{erro}</p>}
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Alterando...' : 'Alterar senha'}
          </Button>
        </form>
      </div>
    </div>
  )
}
