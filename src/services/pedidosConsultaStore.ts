/**
 * Registros de pedidos confirmados exibidos em Consultas → Pedidos em aberto / Duplicatas.
 * Estado em memória (demo): persiste na sessão até recarregar a página.
 */

export type ConsultaPedidosResumo = { label: string; value: string }

export type ConsultaPedidosConteudo = {
  resumo: ConsultaPedidosResumo[]
  tabela: { columns: string[]; rows: string[][] }
}

const listeners = new Set<() => void>()

function emit(): void {
  conteudoCache = null
  listeners.forEach((cb) => cb())
}

export function subscribePedidosConsulta(onChange: () => void): () => void {
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

const BASE_RESUMO_ABERTOS = 14
const BASE_RESUMO_DUPLICATAS = 5
const BASE_VALOR_PENDENTE = 48_920

const BASE_ROWS: string[][] = [
  ['PV-01984', 'Mercado Aurora', 'Pedido de Vendas', '10/04/2026', '22/04/2026', 'R$ 8.450,00', 'Em aberto'],
  ['PV-01990', 'Casa do Trigo', 'Pedido de Vendas', '12/04/2026', '20/04/2026', 'R$ 3.210,00', 'Vencido'],
  ['PV-02011', 'Atacado Sul', 'Orçamento', '16/04/2026', '26/04/2026', 'R$ 12.780,00', 'Em aberto'],
]

type ExtraPedido = {
  pedido: string
  cliente: string
  tipoOperacao: string
  emissao: string
  vencimento: string
  valorStr: string
  valorNum: number
  status: string
}

const extras: ExtraPedido[] = []
let seqPedido = 20_012

/** Cache do snapshot: useSyncExternalStore exige referência estável entre emissões do store. */
let conteudoCache: ConsultaPedidosConteudo | null = null

function fmtDataBR(iso: string): string {
  const p = iso.trim().slice(0, 10)
  const [y, m, d] = p.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

function addDaysBr(iso: string, days: number): string {
  const t = new Date(`${iso.trim().slice(0, 10)}T12:00:00`)
  if (Number.isNaN(t.getTime())) return fmtDataBR(iso)
  t.setDate(t.getDate() + days)
  const dd = String(t.getDate()).padStart(2, '0')
  const mm = String(t.getMonth() + 1).padStart(2, '0')
  const yyyy = t.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function formatBrl(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function buildPedidosConsultaConteudo(): ConsultaPedidosConteudo {
  const rows: string[][] = [
    ...extras.map((e) => [e.pedido, e.cliente, e.tipoOperacao, e.emissao, e.vencimento, e.valorStr, e.status]),
    ...BASE_ROWS,
  ]
  const somaExtras = extras.reduce((s, e) => s + e.valorNum, 0)
  const valorTotal = BASE_VALOR_PENDENTE + somaExtras

  return {
    resumo: [
      { label: 'Pedidos em aberto', value: String(BASE_RESUMO_ABERTOS + extras.length) },
      { label: 'Duplicatas vencidas', value: String(BASE_RESUMO_DUPLICATAS) },
      { label: 'Valor total pendente', value: formatBrl(valorTotal) },
    ],
    tabela: {
      columns: ['Pedido', 'Cliente', 'Tipo de operação', 'Emissão', 'Vencimento', 'Valor', 'Status'],
      rows,
    },
  }
}

export function getPedidosConsultaConteudo(): ConsultaPedidosConteudo {
  if (conteudoCache === null) {
    conteudoCache = buildPedidosConsultaConteudo()
  }
  return conteudoCache
}

export function registrarPedidoConfirmado(p: {
  clienteNome: string
  dtNeg: string
  valorTotal: number
  tipoOperacao: string
}): void {
  const pedido = `PV-${seqPedido++}`
  const emissao = fmtDataBR(p.dtNeg)
  const vencimento = addDaysBr(p.dtNeg, 10)
  const valorStr = formatBrl(p.valorTotal)
  const tipo =
    p.tipoOperacao === 'Orçamento'
      ? 'Orçamento'
      : p.tipoOperacao === 'Pedido de Vendas' || p.tipoOperacao === 'Pedido de Venda'
        ? 'Pedido de Vendas'
        : p.tipoOperacao || 'Pedido de Vendas'
  const status = tipo === 'Orçamento' ? 'Orçamento' : 'Em aberto'

  extras.unshift({
    pedido,
    cliente: p.clienteNome.trim() || 'Cliente',
    tipoOperacao: tipo,
    emissao,
    vencimento,
    valorStr,
    valorNum: p.valorTotal,
    status,
  })
  emit()
}
