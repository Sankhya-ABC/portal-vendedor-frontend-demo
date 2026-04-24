import { Button, Card, CardHeader, Input, PageHeader } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { adminService } from '@/services'
import type { CriarUsuarioRequest, Usuario } from '@/types'
import { useCallback, useEffect, useState } from 'react'

export function AdminUsuariosPage() {
  const { token } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [syncLoading, setSyncLoading] = useState(false)
  const [form, setForm] = useState<CriarUsuarioRequest>({ nomeUsuario: '', email: '', codusu: '' })
  const [criando, setCriando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucessoCriar, setSucessoCriar] = useState<{ senhaTemporaria: string } | null>(null)
  const [sucessoSync, setSucessoSync] = useState('')

  const carregar = useCallback(() => {
    if (!token) return
    setLoading(true)
    adminService
      .listarUsuarios(token)
      .then(setUsuarios)
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    carregar()
  }, [carregar])

  const handleCriar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setErro('')
    setSucessoCriar(null)
    setSucessoSync('')
    setCriando(true)
    adminService
      .criarUsuario(token, {
        nomeUsuario: form.nomeUsuario.trim(),
        email: form.email.trim(),
        codusu: form.codusu?.trim() || undefined,
      })
      .then((res) => {
        setSucessoCriar({ senhaTemporaria: res.senhaTemporaria })
        setForm({ nomeUsuario: '', email: '', codusu: '' })
        carregar()
      })
      .catch((err) => setErro(err instanceof Error ? err.message : 'Erro ao criar usuário'))
      .finally(() => setCriando(false))
  }

  const handleSincronizar = () => {
    if (!token) return
    setSyncLoading(true)
    setErro('')
    setSucessoSync('')
    adminService
      .sincronizarCodusu(token)
      .then((r) => {
        setSucessoSync(r.mensagem)
        carregar()
      })
      .catch((err) => setErro(err instanceof Error ? err.message : 'Erro ao sincronizar'))
      .finally(() => setSyncLoading(false))
  }


  const semCodusu = usuarios.filter((u) => u.role !== 'ADMIN' && !u.codusu).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastro de usuários"
        description="Admin: criar usuários e sincronizar CODUSU (referência em outro sistema)."
      />

      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-800">Novo usuário</h2>
        <p className="mt-1 text-sm text-slate-500">
          Senha inicial é gerada automaticamente. No primeiro acesso o usuário deverá trocá-la.
        </p>
        <form onSubmit={handleCriar} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Nome de usuário</label>
            <Input
              value={form.nomeUsuario}
              onChange={(e) => setForm((f) => ({ ...f, nomeUsuario: e.target.value }))}
              placeholder="Ex.: joao.silva"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">E-mail</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="email@exemplo.com"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">CODUSU</label>
            <Input
              value={form.codusu ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, codusu: e.target.value }))}
              placeholder="Código no outro sistema (opcional)"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="primary" disabled={criando} className="w-full sm:w-auto">
              {criando ? 'Criando...' : 'Criar usuário'}
            </Button>
          </div>
        </form>
        {sucessoCriar && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <p className="font-medium">Usuário criado com sucesso.</p>
            <p className="mt-1">
              Senha temporária: <strong className="tabular-nums">{sucessoCriar.senhaTemporaria}</strong> — envie ao
              colaborador para o primeiro acesso; ele será orientado a trocar a senha ao entrar.
            </p>
          </div>
        )}
        {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
      </Card>

      {sucessoSync ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {sucessoSync}
        </div>
      ) : null}

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <h2 className="text-lg font-semibold text-slate-800">Usuários cadastrados</h2>
        <Button
          variant="secondary"
          onClick={handleSincronizar}
          disabled={syncLoading || semCodusu === 0}
          type="button"
          className="w-full sm:w-auto"
        >
          {syncLoading ? 'Sincronizando...' : `Sincronizar CODUSU (${semCodusu} sem código)`}
        </Button>
      </div>
      <p className="text-sm text-slate-500">
        Busca pelos usuários sem CODUSU e preenche com o código do sankhya.
      </p>

      <Card>
        <CardHeader>
          <div className="text-sm text-slate-500">Total: {usuarios.length} usuário(s)</div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-[680px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-4 py-3 font-medium text-slate-600">Nome de usuário</th>
                <th className="px-4 py-3 font-medium text-slate-600">E-mail</th>
                <th className="px-4 py-3 font-medium text-slate-600">CODUSU</th>
                <th className="px-4 py-3 font-medium text-slate-600">Perfil</th>
                <th className="px-4 py-3 font-medium text-slate-600">Trocar senha 1º acesso</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Carregando...
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800">{u.nomeUsuario}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-slate-600">{u.codusu ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">{u.trocarSenhaProximoAcesso ? 'Sim' : 'Não'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
