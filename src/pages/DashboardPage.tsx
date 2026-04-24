import { Card, PageHeader } from '@/components/ui'
import { ROUTES } from '@/constants'
import { useAuth } from '@/contexts/AuthContext'
import { clienteService, produtoService } from '@/services'
import type { Cliente, Produto } from '@/types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const FATURAMENTO_SEMANA = [
  { dia: 'Seg', valor: 18800 },
  { dia: 'Ter', valor: 22100 },
  { dia: 'Qua', valor: 19450 },
  { dia: 'Qui', valor: 24780 },
  { dia: 'Sex', valor: 26990 },
  { dia: 'Sáb', valor: 21420 },
]

const STATUS_PEDIDOS = [
  { label: 'Concluídos', valor: 52, cor: '#2563eb' },
  { label: 'Em aberto', valor: 31, cor: '#0ea5e9' },
  { label: 'Atrasados', valor: 17, cor: '#f97316' },
] as const

const maxFaturamentoSemana = Math.max(...FATURAMENTO_SEMANA.map((item) => item.valor))
const totalStatusPedidos = STATUS_PEDIDOS.reduce((acc, item) => acc + item.valor, 0)

function fmtMoeda(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDataCliente(c: Cliente): string {
  if (c.ultimaVenda?.trim()) return `Última venda: ${c.ultimaVenda}`
  try {
    const d = new Date(c.criadoEm)
    if (Number.isNaN(d.getTime())) return '—'
    return `Cadastro: ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
  } catch {
    return '—'
  }
}

function valorBarraCliente(c: Cliente): number {
  if (c.limiteCredito != null && c.limiteCredito > 0) return c.limiteCredito
  const base = (c.codParc ?? c.id) * 397
  return Math.max(3000, base % 45000)
}

export function DashboardPage() {
  const { token } = useAuth()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(() => {
    if (!token) {
      setClientes([])
      setProdutos([])
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([clienteService.listar(token), produtoService.listar(token)])
      .then(([c, p]) => {
        setClientes(c)
        setProdutos(p)
      })
      .catch(() => {
        setClientes([])
        setProdutos([])
      })
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    carregar()
  }, [carregar])

  const totalClientes = clientes.length
  const clientesAtivos = clientes.filter((c) => c.status === 'Ativo').length
  const totalProdutos = produtos.length
  const produtosAtivos = produtos.filter((p) => p.ativo !== false).length
  const clientesSinc = clientes.filter((c) => c.sincronizadoSankhya).length
  const pctSinc =
    totalClientes > 0 ? Math.round((clientesSinc / totalClientes) * 1000) / 10 : 0

  const topClientes = useMemo(() => {
    const sorted = [...clientes].sort(
      (a, b) => (b.limiteCredito ?? 0) - (a.limiteCredito ?? 0) || a.nome.localeCompare(b.nome),
    )
    return sorted.slice(0, 5)
  }, [clientes])

  const maxTopClientes = useMemo(() => {
    const vals = topClientes.map(valorBarraCliente)
    return Math.max(1, ...vals)
  }, [topClientes])

  const painelSankhya = useMemo(() => clientes.slice(0, 6), [clientes])

  const produtosDestaque = useMemo(() => produtos.slice(0, 8), [produtos])
  const maxEstoque = useMemo(() => {
    const m = Math.max(0, ...produtos.map((p) => p.estoque ?? 0))
    return m > 0 ? m : 1
  }, [produtos])

  const cards = [
    { title: 'Vendas do dia', value: 'R$ 12.450', subtitle: '+8% vs ontem', to: ROUTES.VENDAS },
    { title: 'Pedidos em aberto', value: '7', subtitle: 'Aguardando entrega', to: ROUTES.CONSULTAS },
    { title: 'Meta do mês', value: '78%', subtitle: 'R$ 98k de R$ 125k', to: ROUTES.VENDAS },
    {
      title: 'Clientes ativos',
      value: loading ? '…' : String(clientesAtivos),
      subtitle: loading ? 'Carregando…' : `${totalClientes} cadastrados na lista`,
      to: ROUTES.CLIENTES,
    },
    {
      title: 'Produtos no catálogo',
      value: loading ? '…' : String(totalProdutos),
      subtitle: loading ? 'Carregando…' : `${produtosAtivos} ativos`,
      to: ROUTES.PRODUTOS,
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Visão geral da sua performance" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map(({ title, value, subtitle, to }) => (
          <Link key={title} to={to}>
            <Card className="group p-5 transition-all hover:border-primary-200 hover:shadow-md">
              <p className="text-sm font-medium text-slate-500">{title}</p>
              <p className="mt-1 text-2xl font-bold text-slate-800 group-hover:text-primary-600">
                {value}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Faturamento da semana</h2>
              <p className="text-xs text-slate-500">Leitura rápida diária para tomada de decisão comercial</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              +12,4% vs semana anterior
            </span>
          </div>
          <div className="mt-5 grid h-52 grid-cols-6 items-end gap-3">
            {FATURAMENTO_SEMANA.map((item) => {
              const height = Math.max(18, (item.valor / maxFaturamentoSemana) * 100)

              return (
                <div key={item.dia} className="flex flex-col items-center gap-2">
                  <div className="text-[11px] font-medium text-slate-500">
                    {(item.valor / 1000).toFixed(1)}k
                  </div>
                  <div className="relative h-36 w-full max-w-14 rounded-lg bg-slate-100 p-1">
                    <div
                      className="absolute bottom-1 left-1 right-1 rounded-md bg-gradient-to-t from-primary-600 to-cyan-400 shadow-[0_0_18px_rgba(14,165,233,0.35)]"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <div className="text-xs font-medium text-slate-600">{item.dia}</div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-slate-800">Status dos pedidos</h2>
          <p className="text-xs text-slate-500">Distribuicao atual da carteira</p>
          <div className="mt-5 flex items-center justify-center">
            <div
              className="relative h-36 w-36 rounded-full"
              style={{
                background: `conic-gradient(${STATUS_PEDIDOS[0].cor} 0% 52%, ${STATUS_PEDIDOS[1].cor} 52% 83%, ${STATUS_PEDIDOS[2].cor} 83% 100%)`,
              }}
            >
              <div className="absolute inset-3 rounded-full bg-white" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">{totalStatusPedidos}</span>
                <span className="text-[11px] text-slate-500">pedidos</span>
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {STATUS_PEDIDOS.map((status) => (
              <div key={status.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: status.cor }} />
                  <span className="text-slate-600">{status.label}</span>
                </div>
                <span className="font-semibold text-slate-800">{status.valor}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <h2 className="text-base font-semibold text-slate-800">Top clientes (por limite de crédito)</h2>
          <p className="text-xs text-slate-500">Dados da sua lista de clientes</p>
          <div className="mt-5 space-y-4">
            {loading ? (
              <p className="text-sm text-slate-500">Carregando clientes…</p>
            ) : topClientes.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum cliente na lista. Cadastre em Clientes.</p>
            ) : (
              topClientes.map((cliente) => {
                const valor = valorBarraCliente(cliente)
                const width = Math.max(8, (valor / maxTopClientes) * 100)
                const limite =
                  cliente.limiteCredito != null ? fmtMoeda(cliente.limiteCredito) : 'Limite não informado'

                return (
                  <div key={cliente.id}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{cliente.nome}</p>
                        <p className="text-[11px] text-slate-500">
                          {cliente.status} · COD {cliente.codParc ?? '—'}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{limite}</p>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-cyan-400 shadow-[0_0_10px_rgba(37,99,235,0.35)]"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>

        <Card className="border-primary-100 bg-gradient-to-br from-white via-slate-50 to-primary-50 p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Clientes sincronizados</h2>
              <p className="text-xs text-slate-500">Painel Sankhya (lista atual)</p>
            </div>
            <span className="rounded-full bg-primary-500 px-2.5 py-1 text-[11px] font-semibold text-white">
              {loading ? '…' : `${pctSinc}%`}
            </span>
          </div>

          <div className="mt-4 rounded-lg border border-primary-100 bg-white/80 p-3">
            <p className="text-xs text-slate-500">Resumo da lista</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {loading ? 'Carregando…' : `${clientesSinc} de ${totalClientes} com código Sankhya`}
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-600">
              {totalClientes === 0 ? 'Cadastre clientes para ver o painel.' : 'Lista carregada a partir do cadastro local.'}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-xs text-slate-500">Carregando…</p>
            ) : painelSankhya.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhum cliente.</p>
            ) : (
              painelSankhya.map((cliente) => {
                const isPendente = !cliente.sincronizadoSankhya
                const statusClass = isPendente ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                const statusLabel = isPendente ? 'Pendente' : 'Sincronizado'
                const cod = cliente.codParc != null ? String(cliente.codParc) : '—'

                return (
                  <div key={cliente.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{cliente.nome}</p>
                        <p className="text-[11px] text-slate-500">COD Sankhya: {cod}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">{fmtDataCliente(cliente)}</p>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-base font-semibold text-slate-800">Produtos no catálogo (amostra)</h2>
        <p className="text-xs text-slate-500">Primeiros itens da lista de produtos — estoque relativo</p>
        <div className="mt-5 space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500">Carregando produtos…</p>
          ) : produtosDestaque.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum produto na lista.</p>
          ) : (
            produtosDestaque.map((p) => {
              const est = p.estoque ?? 0
              const width = Math.max(6, (est / maxEstoque) * 100)
              const cod = p.codProd != null ? String(p.codProd) : p.codigo ?? '—'
              const sync = p.sincronizadoSankhya !== false

              return (
                <div key={p.id}>
                  <div className="mb-1.5 flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700">{p.nome}</p>
                      <p className="text-[11px] text-slate-500">
                        Cód. ERP {cod}
                        {p.grupo ? ` · ${p.grupo}` : ''}
                        {p.un ? ` · ${p.un}` : ''}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        sync ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {sync ? 'Sankhya' : 'Pendente'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 shrink-0 text-[11px] text-slate-500">Estoque</span>
                    <div className="h-2 min-w-0 flex-1 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-slate-600 to-primary-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="w-14 shrink-0 text-right text-[11px] font-medium text-slate-600">
                      {est.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
        <div className="mt-4 border-t border-slate-100 pt-3 text-right">
          <Link to={ROUTES.PRODUTOS} className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Ver todos os produtos →
          </Link>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-800">Acesso rápido</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            to={ROUTES.VENDAS_PEDIDO}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 sm:w-auto"
          >
            Novo pedido de venda
          </Link>
          <Link
            to={ROUTES.CLIENTES_NOVO}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            Novo cliente
          </Link>
          <Link
            to={ROUTES.CONSULTAS}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            Pedidos em aberto
          </Link>
        </div>
      </Card>
    </div>
  )
}
