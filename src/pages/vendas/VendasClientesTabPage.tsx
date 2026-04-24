import { Badge, Button, Card, CardHeader, Input } from '@/components/ui'
import { ROUTES, STATUS_CLIENTE_CSS } from '@/constants'
import { useClientes } from '@/hooks'
import type { Cliente } from '@/types'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clienteParaExibicao, codigoParceiroParaPedido } from './clienteDisplay'
import { useVendasWorkspace } from './VendasWorkspaceContext'

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

export function VendasClientesTabPage() {
  const navigate = useNavigate()
  const workspace = useVendasWorkspace()
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [filtrosAplicados, setFiltrosAplicados] = useState({ busca: '', status: '' })

  const { clientes, loading } = useClientes({
    busca: filtrosAplicados.busca,
    status: filtrosAplicados.status || undefined,
  })

  const aplicarPesquisa = () => setFiltrosAplicados({ busca, status: statusFiltro })

  function selecionarCliente(c: Cliente) {
    workspace?.setClienteSelecionado(c)
    navigate(ROUTES.VENDAS_PEDIDO)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input
              type="search"
              placeholder="Código, nome ou CNPJ/CPF"
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
              <span className="inline-flex items-center gap-2">
                <Search className="h-4 w-4" />
                Pesquisar
              </span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Carregando clientes...</p>
      ) : clientes.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">Nenhum cliente encontrado.</p>
      ) : (
        <ul className="space-y-3">
          {clientes.map((c) => {
            const ex = clienteParaExibicao(c)
            return (
              <li key={c.id}>
                <Card className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-800">{c.nome}</h3>
                        <Badge className={STATUS_CLIENTE_CSS[c.status]}>{c.status}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium text-slate-500">Cód. parceiro: </span>
                        {codigoParceiroParaPedido(c)}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium text-slate-500">CNPJ/CPF: </span>
                        {formatCgcCpf(c.cgcCpf.replace(/\D/g, ''))}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium text-slate-500">Endereço: </span>
                        {ex.enderecoResumo}
                      </p>
                      <div className="grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
                        <p>
                          <span className="font-medium text-slate-500">Telefone: </span>
                          {c.telefone ?? '—'}
                        </p>
                        <p>
                          <span className="font-medium text-slate-500">Contato: </span>
                          {ex.nomeContato}
                        </p>
                        <p>
                          <span className="font-medium text-slate-500">Última venda: </span>
                          {ex.ultimaVenda}
                        </p>
                        <p>
                          <span className="font-medium text-slate-500">Limite disponível: </span>
                          R$ {ex.limiteCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      className="w-full shrink-0 sm:w-auto"
                      onClick={() => selecionarCliente(c)}
                    >
                      Selecionar cliente
                    </Button>
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
