import { Button, Card, CardHeader, Input } from '@/components/ui'
import { ROUTES } from '@/constants'
import { useProdutos } from '@/hooks'
import type { Produto } from '@/types'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVendasWorkspace } from './VendasWorkspaceContext'

function fmtPreco(v: number | null | undefined): string {
  if (v == null) return '—'
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

export function VendasProdutosTabPage() {
  const navigate = useNavigate()
  const workspace = useVendasWorkspace()
  const [busca, setBusca] = useState('')
  const [aplicada, setAplicada] = useState('')
  const [grupoFiltro, setGrupoFiltro] = useState('')
  const [qtdPorId, setQtdPorId] = useState<Record<number, string>>({})

  const { produtos, loading } = useProdutos({ busca: aplicada })

  const grupos = useMemo(() => {
    const s = new Set<string>()
    produtos.forEach((p) => {
      if (p.grupo) s.add(p.grupo)
    })
    return [...s].sort()
  }, [produtos])

  const filtrados = useMemo(() => {
    return produtos.filter((p) => {
      if (grupoFiltro && p.grupo !== grupoFiltro) return false
      return true
    })
  }, [produtos, grupoFiltro])

  function qtdPara(p: Produto) {
    return qtdPorId[p.id] ?? '1'
  }

  function setQtd(p: Produto, v: string) {
    setQtdPorId((prev) => ({ ...prev, [p.id]: v }))
  }

  function adicionarAoPedido(p: Produto) {
    const q = qtdPara(p).trim() || '1'
    workspace?.enqueueCatalogAdd(p, q)
    navigate(ROUTES.VENDAS_PEDIDO)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
            <Input
              type="search"
              placeholder="Código, nome ou referência"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="min-w-0 flex-1 lg:min-w-[200px]"
            />
            <select
              value={grupoFiltro}
              onChange={(e) => setGrupoFiltro(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 lg:w-auto"
            >
              <option value="">Grupo: todos</option>
              {grupos.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setAplicada(busca)}
              className="w-full lg:w-auto"
            >
              <span className="inline-flex items-center gap-2">
                <Search className="h-4 w-4" />
                Pesquisar
              </span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Carregando produtos...</p>
      ) : filtrados.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          {aplicada ? 'Nenhum produto encontrado.' : 'Sincronize os produtos para exibir o catálogo.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtrados.map((p) => {
            const emPaletePromocional = /PROMOCIONAL/i.test(p.nome)
            return (
            <li key={p.id}>
              <Card className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-800">
                        {p.codProd ?? p.id} — {p.nome}
                      </h3>
                      {emPaletePromocional ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900">
                          Promoção
                        </span>
                      ) : null}
                    </div>
                    {emPaletePromocional ? (
                      <p className="text-xs text-amber-800">
                        Campanha ativa: PSV especial em fardo (FD) até 30/04 — veja também Mensagens e Consultas →
                        Produtos em promoção.
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                      {p.grupo && <span>Grupo: {p.grupo}</span>}
                      {p.un && <span>Un.: {p.un}</span>}
                      {p.referencia && <span>Ref.: {p.referencia}</span>}
                      {p.marca && <span>Marca: {p.marca}</span>}
                      {p.psv != null && <span>PSV: R$ {fmtPreco(p.psv)}</span>}
                      {p.pmv != null && <span>PMV: R$ {fmtPreco(p.pmv)}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="sm:w-36">
                      <label className="mb-1 block text-xs font-medium text-slate-500">Quantidade</label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={qtdPara(p)}
                        onChange={(e) => setQtd(p, e.target.value)}
                        placeholder="1"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      className="w-full sm:w-auto"
                      onClick={() => adicionarAoPedido(p)}
                    >
                      + Adicionar ao pedido
                    </Button>
                  </div>
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
