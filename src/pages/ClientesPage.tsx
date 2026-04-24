import { Badge, Button, Card, CardHeader, Input, PageHeader } from '@/components/ui'
import { ROUTES, STATUS_CLIENTE_CSS } from '@/constants'
import { useClientes } from '@/hooks'
import { useAuth } from '@/contexts/AuthContext'
import { clienteService } from '@/services/clienteService'
import { Link } from 'react-router-dom'
import { useState } from 'react'

function formatCgcCpf(value: string): string {
  if (!value) return '-'
  if (value.length === 14) {
    return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }
  if (value.length === 11) {
    return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
  }
  return value
}

export function ClientesPage() {
  const { token } = useAuth()
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [filtrosAplicados, setFiltrosAplicados] = useState({ busca: '', status: '' })
  const [excluindo, setExcluindo] = useState<number | null>(null)
  const [sincronizando, setSincronizando] = useState(false)

  const { clientes, loading, refetch } = useClientes({
    busca: filtrosAplicados.busca,
    status: filtrosAplicados.status || undefined,
  })

  const aplicarPesquisa = () => {
    setFiltrosAplicados({ busca, status: statusFiltro })
  }

  const handleExcluir = async (id: number, nome: string) => {
    if (!token) return
    if (!window.confirm(`Excluir "${nome}" do banco local?`)) return
    setExcluindo(id)
    try {
      await clienteService.excluir(token, id)
      refetch()
      alert('O cliente foi removido da sua lista com sucesso.')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally {
      setExcluindo(null)
    }
  }

  const handleSincronizar = async () => {
    if (!token) return
    setSincronizando(true)
    try {
      const res = await clienteService.sincronizar(token)
      alert(res.sucesso ? res.mensagem : res.mensagem)
      refetch()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao sincronizar')
    } finally {
      setSincronizando(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Cadastro e consulta de clientes"
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              variant="secondary"
              onClick={handleSincronizar}
              disabled={sincronizando}
              className="w-full sm:w-auto"
            >
              {sincronizando ? 'Sincronizando...' : 'Sincronizar Sankhya'}
            </Button>
            <Link to={ROUTES.CLIENTES_NOVO}>
              <Button variant="primary" className="w-full sm:w-auto">Novo cliente</Button>
            </Link>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="search"
              placeholder="Pesquisar por nome ou código"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1"
            />
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:w-auto"
            >
              <option value="">Status: Todos</option>
              <option value="ativo">Ativo</option>
              <option value="potencial">Potencial</option>
              <option value="inativo">Inativo</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
            <Button variant="secondary" type="button" onClick={aplicarPesquisa} className="w-full sm:w-auto">
              Pesquisar
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-4 py-3 font-medium text-slate-600">Cliente</th>
                <th className="px-4 py-3 font-medium text-slate-600">CNPJ/CPF</th>
                <th className="px-4 py-3 font-medium text-slate-600">E-mail</th>
                <th className="px-4 py-3 font-medium text-slate-600">Telefone</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Sankhya</th>
                <th className="px-4 py-3 font-medium text-slate-600"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Carregando...
                  </td>
                </tr>
              ) : clientes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Nenhum cliente cadastrado
                  </td>
                </tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800">{c.nome}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCgcCpf(c.cgcCpf)}</td>
                    <td className="px-4 py-3 text-slate-600">{c.email || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{c.telefone || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge className={STATUS_CLIENTE_CSS[c.status]}>{c.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {c.sincronizadoSankhya ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Cod: {c.codParc}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleExcluir(c.id, c.nome)}
                        disabled={excluindo === c.id}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        title="Excluir do banco local"
                      >
                        {excluindo === c.id ? '...' : 'Excluir'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
          Total de registros encontrados: {clientes.length}
        </div>
      </Card>
    </div>
  )
}
