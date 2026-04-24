import { PageHeader } from '@/components/ui'
import { ROUTES } from '@/constants'
import { useAuth } from '@/contexts/AuthContext'
import { configuracaoNotaService, pedidoService, produtoService, registrarPedidoConfirmado } from '@/services'
import type { ConfiguracaoNota, ItemPedido, Produto } from '@/types'
import { ArrowLeft, PackagePlus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  clienteParaExibicao,
  codigoParceiroParaPedido,
  enderecoFilialEntrega,
  enderecoPadraoEntrega,
} from './vendas/clienteDisplay'
import { useVendasWorkspace, type CabecalhoPedido, type DadosComerciais } from './vendas/VendasWorkspaceContext'

type ItemLinha = ItemPedido & { observacao?: string; un?: string }

function recalcLinhaTotais(item: ItemLinha): ItemLinha {
  const q = parseFloat(String(item.qtd).replace(',', '.')) || 0
  const u = item.unitario
  const m = Number(item.margem) || 0
  let total: number
  if (item.descontoTipo === 'R$') {
    total = Math.max(0, q * u - m)
  } else {
    total = q * u * (1 - m / 100)
  }
  const pmv = item.pmv ?? 0
  const margemPercentual = pmv > 0 ? ((u - pmv) / pmv) * 100 : item.margemPercentual ?? 0
  return { ...item, total, margemPercentual }
}

function mockEstoqueDisponivelLabel(estoque: number | undefined): string {
  const base = estoque ?? 3364.293
  const disp = Math.round(base * 0.8505 * 10000) / 10000
  return `${disp.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} disponíveis`
}

function mockQtdPesoFromProduto(qtd: number, p: Produto | undefined): string {
  if (p?.id === 2904) return (qtd * 4.301).toFixed(3)
  if (p?.unSecundaria) return (qtd * 2.151).toFixed(3)
  return (qtd * 1.75).toFixed(3)
}

function fmtPrecoRef(n: number | null | undefined, frac: number): string {
  if (n == null) return '—'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: frac, maximumFractionDigits: frac })
}


const inputCls =
  'w-full min-h-[2.5rem] rounded border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/30'

/** Destaque vermelho à esquerda como no ERP de referência (campos editáveis importantes). */
const inputHighlightCls = `${inputCls} border-l-[3px] border-l-red-500 pl-2`

const inputReadonlyCls =
  'w-full min-h-[2.5rem] rounded border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-700'

const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'

/** Grade de itens — densidade próxima ao ERP de referência (~11px, linhas baixas). */
const cellInputCls =
  'h-7 min-h-[1.625rem] w-full min-w-0 rounded border border-slate-300 bg-white px-1 py-0 text-[11px] leading-none tabular-nums text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/25'

const cellInputHighlightCls = `${cellInputCls} border-l-[2px] border-l-red-500 pl-0.5`

function onlyDigits(s: string): string {
  return s.replace(/\D/g, '')
}

const TIPO_OPER_PEDIDO_VENDAS = 'Pedido de Vendas'
const TIPO_OPER_ORCAMENTO = 'Orçamento'

/** Texto antigo do select “filial” — migrado para `enderecoFilialSankhya` do cliente. */
const LEGACY_FILIAL_TEXTO =
  'Entrega em filial / CD — combinar horário com o expediente comercial.'

function normalizeTipoOperacao(raw: string): typeof TIPO_OPER_PEDIDO_VENDAS | typeof TIPO_OPER_ORCAMENTO {
  const t = raw.trim()
  if (t === TIPO_OPER_ORCAMENTO) return TIPO_OPER_ORCAMENTO
  if (t === 'Pedido de Venda' || t === TIPO_OPER_PEDIDO_VENDAS) return TIPO_OPER_PEDIDO_VENDAS
  return TIPO_OPER_PEDIDO_VENDAS
}

/** Linha estilo legado: rótulo à esquerda (negrito), campo à direita. */
function DatagramRow({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[minmax(7rem,8.5rem)_1fr] sm:items-start sm:gap-3">
      <span className="pt-2 text-xs font-bold leading-snug text-slate-800">{label}</span>
      <div className="min-w-0">
        {children}
        {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
  )
}

function FormField({
  label,
  required,
  hint,
  children,
  className = '',
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <span className={labelCls}>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  )
}

export function NovoPedidoPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const workspace = useVendasWorkspace()
  const setClienteWorkspace = workspace?.setClienteSelecionado
  const lastClienteSincronizado = useRef<number | null>(null)
  const pendingProcessado = useRef<object | null>(null)

  // Estado persistente vem do contexto (sobrevive à troca de abas)
  const itens = workspace?.itensPedido ?? []
  const setItens = workspace?.setItensPedido ?? (() => {})
  const cabecalho = workspace?.cabecalhoPedido ?? {
    parceiro: '',
    dtNeg: '',
    tipoNegociacao: '',
    tipoOperacao: TIPO_OPER_PEDIDO_VENDAS,
    empresa: '',
    natureza: '',
    centroResultado: '',
    vendedor: '',
  }
  const setCabecalho = workspace?.setCabecalhoPedido ?? (() => {})
  const comercial = workspace?.comercialPedido ?? { modoEntrega: 'entrega', enderecoEntrega: '', frete: 'sem', transportadora: '', tabelaPreco: 'A', cupom: '', condicaoVenda: '', observacaoNfe: '', observacaoSeparacao: '', dataEntrega: '', turnoEntrega: 'diurno', freteValor: '', descontoFaturamento: '', referencia: '', horarioEntrega: '', cnpjCpf: '' }
  const setComercial = workspace?.setComercialPedido ?? (() => {})
  const configSelecionada = workspace?.configSelecionada ?? null
  const setConfigSelecionada = workspace?.setConfigSelecionada ?? (() => {})

  // Estado local da UI (não precisa persistir)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoNota[]>([])
  const [produtoSearch, setProdutoSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const [isConfirmando, setIsConfirmando] = useState(false)
  const [erroConfirmacao, setErroConfirmacao] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<{ nunota?: number | null; mensagem?: string } | null>(null)

  useEffect(() => {
    if (!token) return
    produtoService.listar(token).then(setProdutos).catch(() => null)
  }, [token])

  useEffect(() => {
    if (!token) return
    configuracaoNotaService.listarPublico(token).then(setConfiguracoes).catch(() => null)
  }, [token])

  /** Migra valores antigos (ex.: código numérico do ERP) para Pedido de Vendas / Orçamento. */
  useEffect(() => {
    const t = cabecalho.tipoOperacao?.trim() ?? ''
    if (t === TIPO_OPER_ORCAMENTO || t === TIPO_OPER_PEDIDO_VENDAS) return
    setCabecalho((prev) => ({ ...prev, tipoOperacao: normalizeTipoOperacao(t) }))
  }, [cabecalho.tipoOperacao, setCabecalho])

  function aplicarConfig(cfg: ConfiguracaoNota) {
    setConfigSelecionada(cfg)
    setCabecalho((prev: CabecalhoPedido) => ({
      ...prev,
      tipoNegociacao: cfg.codTipVenda != null ? String(cfg.codTipVenda) : '',
      tipoOperacao: normalizeTipoOperacao(prev.tipoOperacao || TIPO_OPER_PEDIDO_VENDAS),
      empresa: cfg.codEmp != null ? String(cfg.codEmp) : '',
      natureza: cfg.codNat != null ? String(cfg.codNat) : '',
      centroResultado: cfg.codCencus != null ? String(cfg.codCencus) : '',
      vendedor: cfg.codVend != null ? String(cfg.codVend) : '',
    }))
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const c = workspace?.clienteSelecionado
    if (!c) {
      lastClienteSincronizado.current = null
      return
    }
    if (lastClienteSincronizado.current === c.id) return
    lastClienteSincronizado.current = c.id
    setCabecalho((prev: CabecalhoPedido) => ({
      ...prev,
      parceiro: codigoParceiroParaPedido(c),
    }))
    const padrao = enderecoPadraoEntrega(c)
    setComercial((prev: DadosComerciais) => ({
      ...prev,
      enderecoEntrega:
        padrao !== 'Endereço não informado no cadastro' ? padrao : prev.enderecoEntrega,
      cnpjCpf: c.cgcCpf?.trim() ? c.cgcCpf : prev.cnpjCpf,
    }))
  }, [workspace?.clienteSelecionado])

  const appendProdutoComoLinha = useCallback((p: Produto, opts?: { qtdInicial?: string; observacao?: string }) => {
    const qtdStr = opts?.qtdInicial?.trim() || '1'
    const qtdNum = parseFloat(qtdStr) || 1
    const unit = p.psv ?? 0
    const codigo = p.codProd != null ? String(p.codProd) : (p.codigo ?? String(p.id))
    const unV = p.un?.trim() || 'Pç'
    const unPes = p.unSecundaria ?? 'KG'
    const pmv0 = p.pmv ?? 0
    const margemPerc0 = pmv0 > 0 ? ((unit - pmv0) / pmv0) * 100 : 7.8398

    const novo: ItemLinha = recalcLinhaTotais({
      id: p.id,
      nome: p.nome,
      qtd: qtdStr,
      unitario: unit,
      total: 0,
      margem: 0,
      observacao: opts?.observacao ?? '',
      un: unV,
      pmv: p.pmv,
      psv: p.psv,
      puv: p.puv,
      codigoLinha: `${codigo} | ${codigo}`,
      unidadeVenda: unV,
      unidadePeso: unPes,
      qtdPeso: mockQtdPesoFromProduto(qtdNum, p),
      estoqueDisponivelLabel: mockEstoqueDisponivelLabel(p.estoque),
      descontoTipo: '%',
      dataDisponivel: '2025-11-03',
      margemPercentual: margemPerc0,
    })
    setItens((prev: ItemPedido[]) => [...prev, novo])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setItens])

  useEffect(() => {
    const pending = workspace?.pendingCatalogAdd
    if (!pending) return
    if (pendingProcessado.current === pending) return
    pendingProcessado.current = pending
    appendProdutoComoLinha(pending.produto, { qtdInicial: pending.qtd.trim() || '1' })
    setProdutoSearch('')
    workspace?.clearPendingCatalogAdd()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace?.pendingCatalogAdd])

  function setCom<K extends keyof DadosComerciais>(field: K, value: DadosComerciais[K]) {
    setComercial((prev: DadosComerciais) => ({ ...prev, [field]: value }))
  }

  /** Corrige valores legados do select (códigos / texto fixo antigo). */
  useEffect(() => {
    const raw = comercial.enderecoEntrega
    const c = workspace?.clienteSelecionado
    if (raw === 'end-filial' || raw === LEGACY_FILIAL_TEXTO) {
      if (c) setComercial((p) => ({ ...p, enderecoEntrega: enderecoFilialEntrega(c) }))
      return
    }
    if (raw === 'end-cadastral') {
      const ed = c ? enderecoPadraoEntrega(c) : ''
      setComercial((p) => ({ ...p, enderecoEntrega: ed || p.enderecoEntrega }))
    }
  }, [comercial.enderecoEntrega, workspace?.clienteSelecionado])

  const filteredProdutos = produtos.filter(
    (p) =>
      produtoSearch.length >= 1 &&
      (p.nome.toLowerCase().includes(produtoSearch.toLowerCase()) ||
        String(p.id).includes(produtoSearch)),
  )

  function selectProduto(p: Produto) {
    appendProdutoComoLinha(p)
    setProdutoSearch('')
    setShowSuggestions(false)
  }

  function patchItemLinha(idx: number, patch: Partial<ItemLinha>) {
    setItens((prev) => {
      const next = [...prev]
      const cur = { ...(next[idx] as ItemLinha), ...patch }
      next[idx] = recalcLinhaTotais(cur)
      return next
    })
  }

  function updateItemQtdPrincipal(idx: number, newQ: string) {
    setItens((prev) => {
      const cur = prev[idx] as ItemLinha
      const oldQn = parseFloat(String(cur.qtd)) || 0
      const newQn = parseFloat(newQ) || 0
      let qtdPeso = cur.qtdPeso
      if (oldQn > 0 && cur.qtdPeso) {
        const oldP = parseFloat(String(cur.qtdPeso).replace(',', '.')) || 0
        qtdPeso = ((oldP / oldQn) * newQn).toFixed(3)
      }
      const next = [...prev]
      next[idx] = recalcLinhaTotais({ ...cur, qtd: newQ, qtdPeso })
      return next
    })
  }

  function removeItem(idx: number) {
    setItens((prev) => prev.filter((_, i) => i !== idx))
  }

  function setCab(field: keyof CabecalhoPedido, value: string) {
    setCabecalho((prev: CabecalhoPedido) => ({ ...prev, [field]: value }))
  }

  const totalPedido = itens.reduce((s, i) => s + i.total, 0)

  const pesoEstimadoKg = itens.reduce((s, i) => {
    const p = i.qtdPeso != null ? parseFloat(String(i.qtdPeso).replace(',', '.')) || 0 : 0
    return s + p
  }, 0)
  const margemMediaPedido = itens.length
    ? itens.reduce((acc, i) => acc + (i.margemPercentual ?? 0), 0) / itens.length
    : 0
  const limiteCreditoExibicao =
    workspace?.clienteSelecionado != null
      ? clienteParaExibicao(workspace.clienteSelecionado).limiteCredito
      : 0

  async function handleConfirmar() {
    setErroConfirmacao(null)

    if (!cabecalho.parceiro.trim()) {
      setErroConfirmacao('Informe o código do parceiro.')
      return
    }
    if (configuracoes.length === 0) {
      setErroConfirmacao('Não há configuração de nota cadastrada. Cadastre uma em Configuração de nota (admin).')
      return
    }
    if (!configSelecionada) {
      setErroConfirmacao('Selecione a configuração da nota (Sankhya).')
      return
    }
    if (!cabecalho.tipoOperacao.trim()) {
      setErroConfirmacao('Informe o tipo de operação.')
      return
    }

    const cfg = configSelecionada
    const empresa =
      cabecalho.empresa.trim() || (cfg.codEmp != null ? String(cfg.codEmp) : '')
    const natureza =
      cabecalho.natureza.trim() || (cfg.codNat != null ? String(cfg.codNat) : '')
    const centroResultado =
      cabecalho.centroResultado.trim() || (cfg.codCencus != null ? String(cfg.codCencus) : '')
    const vendedor =
      cabecalho.vendedor.trim() || (cfg.codVend != null ? String(cfg.codVend) : '')

    if (!empresa) {
      setErroConfirmacao(
        'A configuração da nota não define empresa (CODEMP). Ajuste em Configuração Nota (admin) ou escolha outra configuração.',
      )
      return
    }
    if (!natureza) {
      setErroConfirmacao(
        'A configuração da nota não define natureza (CODNAT). Ajuste em Configuração Nota (admin) ou escolha outra configuração.',
      )
      return
    }
    if (!centroResultado) {
      setErroConfirmacao(
        'A configuração da nota não define centro de resultado (CODCENCUS). Ajuste em Configuração Nota (admin) ou escolha outra configuração.',
      )
      return
    }
    if (!vendedor) {
      setErroConfirmacao(
        'A configuração da nota não define vendedor (CODVEND). Ajuste em Configuração Nota (admin) ou escolha outra configuração.',
      )
      return
    }
    if (itens.length === 0) {
      setErroConfirmacao('Adicione pelo menos um item ao pedido.')
      return
    }

    if (!token) {
      setErroConfirmacao('Sessão expirada. Faça login novamente.')
      return
    }

    setIsConfirmando(true)
    try {
      const codTipVenda =
        cfg.codTipVenda != null ? String(cfg.codTipVenda) : cabecalho.tipoNegociacao.trim()
      const resultado = await pedidoService.confirmar(token, {
        codParc: cabecalho.parceiro.trim(),
        dtNeg: cabecalho.dtNeg,
        codTipOper: cabecalho.tipoOperacao.trim(),
        codTipVenda,
        codEmp: empresa,
        codNat: natureza,
        codCencus: centroResultado,
        codVend: vendedor,
        observacao: (() => {
          const partes = [comercial.observacaoNfe, comercial.observacaoSeparacao].filter((s) => s?.trim())
          return partes.length ? partes.join('\n\n') : undefined
        })(),
        itens: itens.map((item) => {
          const i = item as ItemLinha
          const percDesc =
            i.descontoTipo === 'R$'
              ? undefined
              : i.margem != null && i.margem > 0
                ? String(i.margem)
                : undefined
          const codVol = i.unidadeVenda?.trim() || i.un?.trim()
          return {
            codProd: String(i.id),
            qtdNeg: String(i.qtd),
            vlrUnit: i.unitario > 0 ? String(i.unitario) : undefined,
            percDesc,
            codVol: codVol !== '' ? codVol : undefined,
          }
        }),
      })

      if (resultado.sucesso) {
        const nomeCliente = clienteSel?.nome?.trim() || (cabecalho.parceiro.trim() ? `Parceiro ${cabecalho.parceiro.trim()}` : 'Cliente')
        registrarPedidoConfirmado({
          clienteNome: nomeCliente,
          dtNeg: cabecalho.dtNeg,
          valorTotal: totalEstimadoVenda,
          tipoOperacao: cabecalho.tipoOperacao,
        })
        setSucesso({ nunota: resultado.nunota, mensagem: resultado.mensagem })
        workspace?.resetPedido()
      } else {
        setErroConfirmacao(resultado.mensagem ?? 'Erro ao confirmar pedido.')
      }
    } catch (err) {
      setErroConfirmacao(err instanceof Error ? err.message : 'Erro inesperado ao confirmar pedido.')
    } finally {
      setIsConfirmando(false)
    }
  }

  const clienteSel = workspace?.clienteSelecionado
  const enderecoPadraoCliente = clienteSel ? enderecoPadraoEntrega(clienteSel) : ''
  const enderecoFilialCliente = clienteSel ? enderecoFilialEntrega(clienteSel) : ''
  const enderecoEntregaSelectValue = (() => {
    const raw = comercial.enderecoEntrega
    if (!raw) return ''
    if (raw === 'end-filial' || raw === LEGACY_FILIAL_TEXTO) return enderecoFilialCliente
    if (raw === 'end-cadastral' || raw === enderecoPadraoCliente) return enderecoPadraoCliente
    if (enderecoFilialCliente && raw === enderecoFilialCliente) return enderecoFilialCliente
    return raw
  })()
  const freteNum = parseFloat(comercial.freteValor.replace(',', '.')) || 0
  const totalEstimadoVenda = totalPedido + freteNum

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Link
            to={ROUTES.VENDAS}
            className="mt-1 flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <PageHeader title="Novo pedido de venda" />
        </div>
        <nav className="flex flex-wrap items-center gap-2 sm:justify-end" aria-label="Atalhos do pedido">
          <Link
            to={ROUTES.VENDAS_CLIENTES}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-primary-200 hover:bg-primary-50/50 hover:text-primary-800"
          >
            Escolher cliente
          </Link>
          <Link
            to={ROUTES.VENDAS_CATALOGO}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-primary-200 hover:bg-primary-50/50 hover:text-primary-800"
          >
            Catálogo
          </Link>
        </nav>
      </div>

      {!clienteSel ? (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 px-4 py-3 text-sm text-amber-900">
          <span className="font-medium">Dica:</span> selecione um cliente na aba <strong>Clientes</strong> para preencher nome, documento e endereço.
        </div>
      ) : null}

      {/* Cabeçalho do pedido — duas colunas (referência Datagram) */}
      <section
        className="rounded-xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm ring-1 ring-slate-900/[0.04] lg:p-5"
        aria-label="Dados do cliente e logística"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Cabeçalho do pedido</h2>
          {clienteSel ? (
            <Link
              to={ROUTES.VENDAS_CLIENTES}
              className="text-xs font-semibold text-primary-700 underline-offset-2 hover:underline"
            >
              Trocar cliente
            </Link>
          ) : null}
        </div>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="flex min-w-0 flex-col gap-3.5">
            <DatagramRow label="Cliente">
              <div>
                <input
                  className={inputHighlightCls}
                  value={cabecalho.parceiro}
                  onChange={(e) => {
                    const v = e.target.value
                    setCab('parceiro', v)
                    const sel = workspace?.clienteSelecionado
                    if (sel && v.trim() !== String(codigoParceiroParaPedido(sel)).trim()) {
                      setClienteWorkspace?.(null)
                      setComercial((prev) => ({ ...prev, cnpjCpf: '' }))
                    }
                  }}
                  placeholder="Código do cliente (parceiro)"
                  autoComplete="off"
                  aria-label="Código do cliente ou parceiro"
                />
                {clienteSel ? (
                  <p className="mt-1.5 break-words text-xs font-semibold uppercase leading-snug text-slate-800">{clienteSel.nome}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-500">
                    Ou{' '}
                    <Link to={ROUTES.VENDAS_CLIENTES} className="font-medium text-primary-700 underline-offset-2 hover:underline">
                      escolha na aba Clientes
                    </Link>{' '}
                    para preencher automaticamente.
                  </p>
                )}
              </div>
            </DatagramRow>
            <DatagramRow label="CNPJ/CPF">
              <div>
                <input
                  className={inputCls + ' tabular-nums'}
                  value={comercial.cnpjCpf}
                  onChange={(e) => {
                    const v = e.target.value
                    setCom('cnpjCpf', v)
                    const sel = workspace?.clienteSelecionado
                    const vd = onlyDigits(v)
                    const sd = onlyDigits(sel?.cgcCpf ?? '')
                    if (sel && vd.length > 0 && vd !== sd) {
                      setClienteWorkspace?.(null)
                    }
                  }}
                  placeholder="Opcional — preenchido ao escolher o cliente na aba"
                  autoComplete="off"
                  aria-label="CNPJ ou CPF do cliente"
                />
                {clienteSel ? (
                  <p className="mt-1 text-xs text-slate-500">Dados do cadastro; você pode ajustar manualmente.</p>
                ) : null}
              </div>
            </DatagramRow>
            <DatagramRow label="Referência">
              <input
                className={inputCls}
                value={comercial.referencia}
                onChange={(e) => setCom('referencia', e.target.value)}
                placeholder="Referência"
                maxLength={40}
              />
            </DatagramRow>
            <DatagramRow label="Data negociação">
              <input type="date" className={inputCls} value={cabecalho.dtNeg} onChange={(e) => setCab('dtNeg', e.target.value)} />
            </DatagramRow>
            <DatagramRow
              label="Tipo de operação"
              hint="Escolha entre venda (Pedido de Vendas) ou cotação sem faturamento (Orçamento). É diferente da configuração Sankhya abaixo."
            >
              <select
                className={inputCls}
                value={cabecalho.tipoOperacao === TIPO_OPER_ORCAMENTO ? TIPO_OPER_ORCAMENTO : TIPO_OPER_PEDIDO_VENDAS}
                onChange={(e) => setCab('tipoOperacao', e.target.value)}
                aria-label="Tipo de operação"
              >
                <option value={TIPO_OPER_PEDIDO_VENDAS}>{TIPO_OPER_PEDIDO_VENDAS}</option>
                <option value={TIPO_OPER_ORCAMENTO}>{TIPO_OPER_ORCAMENTO}</option>
              </select>
            </DatagramRow>
            <DatagramRow label="Configuração da nota (Sankhya)">
              <select
                className={inputCls}
                value={configSelecionada?.id ?? ''}
                onChange={(e) => {
                  const cfg = configuracoes.find((c) => String(c.id) === e.target.value)
                  if (cfg) aplicarConfig(cfg)
                }}
                aria-label="Configuração de nota fiscal no Sankhya"
              >
                <option value="">Selecione</option>
                {configuracoes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.descricao}
                  </option>
                ))}
              </select>
            </DatagramRow>
            <DatagramRow label="Entrega">
              <div className="flex flex-wrap gap-4 pt-1.5">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                  <input
                    type="radio"
                    name="modo-entrega"
                    className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                    checked={comercial.modoEntrega === 'entrega'}
                    onChange={() => setCom('modoEntrega', 'entrega')}
                  />
                  Entrega
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                  <input
                    type="radio"
                    name="modo-entrega"
                    className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                    checked={comercial.modoEntrega === 'retira'}
                    onChange={() => setCom('modoEntrega', 'retira')}
                  />
                  Retira
                </label>
              </div>
            </DatagramRow>
            <DatagramRow label="Cupom">
              <select className={inputCls} value={comercial.cupom} onChange={(e) => setCom('cupom', e.target.value)}>
                <option value="">(Não selecionado)</option>
                <option value="cupom-130">Cupom de desconto — R$ 130,17</option>
              </select>
            </DatagramRow>
          </div>

          <div className="flex min-w-0 flex-col gap-3.5">
            <DatagramRow label="Endereço">
              <select
                className={inputCls}
                value={enderecoEntregaSelectValue}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === enderecoFilialCliente) setCom('enderecoEntrega', enderecoFilialCliente)
                  else if (v === enderecoPadraoCliente) setCom('enderecoEntrega', enderecoPadraoCliente)
                  else setCom('enderecoEntrega', v)
                }}
              >
                <option value="">
                  {clienteSel ? 'Selecione o endereço de entrega' : 'Selecione um cliente (aba Clientes)'}
                </option>
                {clienteSel && enderecoPadraoCliente !== enderecoFilialCliente ? (
                  <>
                    <option value={enderecoPadraoCliente}>
                      Endereço cadastral (padrão Sankhya)
                      {enderecoPadraoCliente
                        ? ` — ${
                            enderecoPadraoCliente.length > 72
                              ? `${enderecoPadraoCliente.slice(0, 72)}…`
                              : enderecoPadraoCliente
                          }`
                        : ''}
                    </option>
                    <option value={enderecoFilialCliente}>
                      Filial / CD (Sankhya)
                      {enderecoFilialCliente
                        ? ` — ${
                            enderecoFilialCliente.length > 72
                              ? `${enderecoFilialCliente.slice(0, 72)}…`
                              : enderecoFilialCliente
                          }`
                        : ''}
                    </option>
                  </>
                ) : clienteSel ? (
                  <option value={enderecoPadraoCliente}>
                    Endereço (cadastro único)
                    {enderecoPadraoCliente
                      ? ` — ${
                          enderecoPadraoCliente.length > 80
                            ? `${enderecoPadraoCliente.slice(0, 80)}…`
                            : enderecoPadraoCliente
                        }`
                      : ''}
                  </option>
                ) : null}
              </select>
            </DatagramRow>
            <DatagramRow label="Frete">
              <div className="flex flex-wrap gap-3 pt-1.5">
                {(
                  [
                    { v: 'emitente' as const, l: 'Emitente' },
                    { v: 'destinatario' as const, l: 'Destinatário' },
                    { v: 'sem' as const, l: 'Sem frete' },
                  ] as const
                ).map(({ v, l }) => (
                  <label key={v} className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                    <input
                      type="radio"
                      name="frete-tipo"
                      className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                      checked={comercial.frete === v}
                      onChange={() => setCom('frete', v)}
                    />
                    {l}
                  </label>
                ))}
              </div>
            </DatagramRow>
            <DatagramRow label="Transportadora">
              <select className={inputCls} value={comercial.transportadora} onChange={(e) => setCom('transportadora', e.target.value)}>
                <option value="">(Não selecionado)</option>
                <option value="transp-a">Transportadora A</option>
                <option value="transp-b">Transportadora B</option>
              </select>
            </DatagramRow>
            <DatagramRow label="Tabela de preço">
              <div className="flex flex-wrap gap-2 pt-1">
                {(['A', 'B', 'C', 'D'] as const).map((t) => (
                  <label
                    key={t}
                    className={`inline-flex min-h-[2.5rem] min-w-[2.75rem] cursor-pointer items-center justify-center rounded border px-3 text-sm font-bold transition-all ${
                      comercial.tabelaPreco === t
                        ? 'border-primary-500 bg-primary-500 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tabela-preco"
                      className="sr-only"
                      checked={comercial.tabelaPreco === t}
                      onChange={() => setCom('tabelaPreco', t)}
                    />
                    {t}
                  </label>
                ))}
              </div>
            </DatagramRow>
          </div>
        </div>
      </section>

      {/* Itens da venda */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/[0.04]" aria-label="Itens do pedido">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-100/90 px-4 py-2.5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Itens da venda</h2>
          <p className="text-xs font-medium text-slate-600">
            Total de itens: <span className="tabular-nums text-slate-900">{itens.length}</span>
          </p>
        </div>

        <div className="border-b border-slate-100 p-4 sm:p-5">
          <p className={labelCls}>Buscar produto</p>
          <p className="mt-1 max-w-2xl text-xs text-slate-500">
            Digite código ou nome e clique no produto: ele entra na lista abaixo com quantidade inicial <strong>1</strong> e preço <strong>PSV</strong>. Ajuste quantidade, peso, desconto, unitário e demais campos diretamente na linha da grade.
          </p>
          <div className="relative mt-2" ref={suggestionsRef}>
            <input
              className={inputCls}
              value={produtoSearch}
              onChange={(e) => {
                setProdutoSearch(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Código ou nome do produto"
              aria-label="Buscar produto para incluir no pedido"
            />
            {showSuggestions && filteredProdutos.length > 0 ? (
              <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5">
                {filteredProdutos.slice(0, 8).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-slate-50"
                    onClick={() => selectProduto(p)}
                  >
                    <span className="truncate font-medium text-slate-800">{p.nome}</span>
                    <span className="shrink-0 font-mono text-xs text-slate-500">
                      {p.codProd ?? p.id}{p.psv != null ? ` · R$ ${p.psv.toFixed(2)}` : ''}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="w-full max-w-full overflow-x-auto">
          {itens.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
              <PackagePlus className="h-9 w-9 text-slate-300" aria-hidden />
              <p className="text-sm font-medium text-slate-600">Nenhum item na lista</p>
              <p className="max-w-md text-xs text-slate-500">Use a busca acima ou adicione pelo catálogo na aba Produtos.</p>
            </div>
          ) : (
            <table className="min-w-[1180px] w-full text-[11px] leading-tight">
              <thead>
                <tr className="border-b border-slate-200 bg-[#f5f0e8]/90 text-left text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  <th className="min-w-[8.25rem] max-w-[11rem] px-1.5 py-1">Item</th>
                  <th className="w-14 px-1 py-1 text-right">PMV</th>
                  <th className="w-14 px-1 py-1 text-right">PSV</th>
                  <th className="w-14 px-1 py-1 text-right">PUV</th>
                  <th className="min-w-[7rem] px-1 py-1">Quantidade</th>
                  <th className="min-w-[4.5rem] px-1 py-1">Desconto</th>
                  <th className="min-w-[4.5rem] px-1 py-1 text-right">Unitário (R$)</th>
                  <th className="min-w-[4.25rem] px-1 py-1 text-right">Total (R$)</th>
                  <th className="w-[4.25rem] px-1 py-1 text-right">Margem (%)</th>
                  <th className="min-w-[6.5rem] px-1 py-1">Disponível</th>
                  <th className="w-7 px-0.5 py-1 sticky right-0 bg-[#f5f0e8] shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {itens.map((item, idx) => {
                  const i = item as ItemLinha
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="max-w-[11rem] min-w-[8.25rem] px-1.5 py-1 align-middle">
                        <div className="line-clamp-2 text-[11px] font-normal leading-[1.2] text-slate-900">{i.nome}</div>
                        {i.codigoLinha ? (
                          <div className="mt-px font-mono text-[9px] leading-none text-slate-500">{i.codigoLinha}</div>
                        ) : null}
                      </td>
                      <td className="px-1 py-1 align-middle text-right text-[11px] tabular-nums text-slate-800">{fmtPrecoRef(i.pmv, 2)}</td>
                      <td className="px-1 py-1 align-middle text-right text-[11px] tabular-nums text-slate-800">{fmtPrecoRef(i.psv, 2)}</td>
                      <td className="px-1 py-1 align-middle text-right text-[11px] tabular-nums text-slate-800">{fmtPrecoRef(i.puv, 2)}</td>
                      <td className="px-1 py-1 align-middle">
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <div className="flex items-center gap-0.5">
                            <input
                              type="number"
                              min="0"
                              step="0.001"
                              className={cellInputHighlightCls + ' w-11'}
                              value={i.qtd}
                              onChange={(e) => updateItemQtdPrincipal(idx, e.target.value)}
                              aria-label="Quantidade principal"
                            />
                            <span className="shrink-0 text-[9px] font-medium text-slate-600">{i.unidadeVenda ?? i.un ?? 'Pç'}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <input
                              type="text"
                              inputMode="decimal"
                              className={cellInputHighlightCls + ' w-[3.85rem]'}
                              value={i.qtdPeso ?? ''}
                              onChange={(e) => patchItemLinha(idx, { qtdPeso: e.target.value })}
                              aria-label="Quantidade peso"
                            />
                            <span className="shrink-0 text-[9px] font-medium text-slate-600">{i.unidadePeso ?? 'KG'}</span>
                          </div>
                          {i.estoqueDisponivelLabel ? (
                            <span className="text-[9px] leading-tight text-slate-500">{i.estoqueDisponivelLabel}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-1 py-1 align-middle">
                        <div className="flex items-center gap-px">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={cellInputHighlightCls + ' w-9'}
                            value={i.margem}
                            onChange={(e) => patchItemLinha(idx, { margem: parseFloat(e.target.value) || 0 })}
                            aria-label="Desconto"
                          />
                          <select
                            className={cellInputCls + ' max-w-[2.35rem] shrink-0 !px-0.5 !py-0 text-[9px]'}
                            value={i.descontoTipo ?? '%'}
                            onChange={(e) => patchItemLinha(idx, { descontoTipo: e.target.value as '%' | 'R$' })}
                            aria-label="Tipo de desconto"
                          >
                            <option value="%">%</option>
                            <option value="R$">R$</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-1 py-1 align-middle">
                        <input
                          type="number"
                          min="0"
                          step="0.0001"
                          className={cellInputHighlightCls + ' text-right'}
                          value={i.unitario}
                          onChange={(e) => patchItemLinha(idx, { unitario: parseFloat(e.target.value) || 0 })}
                          aria-label="Preço unitário"
                        />
                      </td>
                      <td className="px-1 py-1 align-middle">
                        <input
                          readOnly
                          tabIndex={-1}
                          className={cellInputCls + ' bg-slate-50 text-right font-semibold text-slate-900'}
                          value={i.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        />
                      </td>
                      <td className="px-1 py-1 align-middle text-right">
                        <span className="text-[11px] tabular-nums text-slate-800">
                          {i.margemPercentual != null
                            ? i.margemPercentual.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
                            : '—'}
                        </span>
                      </td>
                      <td className="px-1 py-1 align-middle">
                        <input
                          type="date"
                          className={cellInputCls + ' text-[10px]'}
                          value={i.dataDisponivel ?? ''}
                          onChange={(e) => patchItemLinha(idx, { dataDisponivel: e.target.value })}
                          aria-label="Data disponível"
                        />
                      </td>
                      <td className="px-0.5 py-1 align-middle text-right sticky right-0 bg-white shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                          aria-label="Remover item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={7} className="px-1.5 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Total dos itens
                  </td>
                  <td className="px-1 py-2 text-right text-sm font-bold tabular-nums text-slate-900">
                    R$ {totalPedido.toFixed(2)}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </section>

      {/* Rodapé: entrega / observações | condição e totais */}
      <section
        className="grid gap-6 rounded-xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm ring-1 ring-slate-900/[0.04] lg:grid-cols-2 lg:gap-10 lg:p-5"
        aria-label="Entrega, observações e totais"
      >
        <div className="flex min-w-0 flex-col gap-4">
          <h2 className="border-b border-slate-200/80 pb-2 text-sm font-bold uppercase tracking-wide text-slate-700">Entrega e observações</h2>
          <DatagramRow label="Data">
            <input type="date" className={inputCls} value={comercial.dataEntrega} onChange={(e) => setCom('dataEntrega', e.target.value)} />
          </DatagramRow>
          <DatagramRow label="Turno">
            <div className="flex flex-wrap gap-3 pt-1.5">
              {(
                [
                  { v: 'diurno' as const, l: 'Diurno' },
                  { v: 'noturno' as const, l: 'Noturno' },
                  { v: 'qualquer' as const, l: 'Qualquer' },
                ] as const
              ).map(({ v, l }) => (
                <label key={v} className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                  <input
                    type="radio"
                    name="turno-entrega"
                    className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                    checked={comercial.turnoEntrega === v}
                    onChange={() => setCom('turnoEntrega', v)}
                  />
                  {l}
                </label>
              ))}
            </div>
          </DatagramRow>
          <DatagramRow label="Janela / horário">
            <select className={inputCls} value={comercial.horarioEntrega} onChange={(e) => setCom('horarioEntrega', e.target.value)}>
              <option value="">Selecione</option>
              <option value="manha">Manhã (08h–12h)</option>
              <option value="tarde">Tarde (13h–18h)</option>
              <option value="integral">Dia inteiro</option>
            </select>
          </DatagramRow>
          <div className="flex flex-col gap-4">
            <FormField label="Obs. pedido / NF-e" className="mb-0">
              <textarea
                rows={4}
                className={inputCls + ' resize-y min-h-[6rem]'}
                value={comercial.observacaoNfe}
                onChange={(e) => setCom('observacaoNfe', e.target.value)}
                placeholder="Observação para pedido de venda e NF-e"
              />
            </FormField>
            <FormField label="Obs. separação" className="mb-0">
              <textarea
                rows={4}
                className={inputCls + ' resize-y min-h-[6rem]'}
                value={comercial.observacaoSeparacao}
                onChange={(e) => setCom('observacaoSeparacao', e.target.value)}
                placeholder="Observação para separação"
              />
            </FormField>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <h2 className="border-b border-slate-200/80 pb-2 text-sm font-bold uppercase tracking-wide text-slate-700">Condição e totais</h2>
          <DatagramRow label="Condição de venda">
            <select className={inputCls} value={comercial.condicaoVenda} onChange={(e) => setCom('condicaoVenda', e.target.value)}>
              <option value="avista">À vista</option>
              <option value="boleto_padrao">Boleto 10 dias (padrão)</option>
              <option value="boleto_14">Boleto 14 dias</option>
            </select>
          </DatagramRow>
          <DatagramRow label="Total dos itens">
            <input className={inputReadonlyCls} readOnly value={`R$ ${totalPedido.toFixed(2)}`} />
          </DatagramRow>
          <DatagramRow label="Peso (kg)">
            <input className={inputReadonlyCls} readOnly value={pesoEstimadoKg.toFixed(3)} />
          </DatagramRow>
          <DatagramRow label="Margem do pedido">
            <input
              className={`${inputReadonlyCls} font-semibold text-primary-700`}
              readOnly
              value={`${margemMediaPedido.toFixed(2)} %`}
            />
          </DatagramRow>
          <DatagramRow label="Limite crédito (R$)">
            <input
              className={inputReadonlyCls}
              readOnly
              value={limiteCreditoExibicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            />
          </DatagramRow>
          <DatagramRow label="Frete (R$)">
            <input
              type="text"
              className={inputCls}
              value={comercial.freteValor}
              onChange={(e) => setCom('freteValor', e.target.value)}
              placeholder="0,00"
            />
          </DatagramRow>
          <DatagramRow label="Desc. faturamento (%)">
            <input
              type="text"
              className={inputCls}
              value={comercial.descontoFaturamento}
              onChange={(e) => setCom('descontoFaturamento', e.target.value)}
              placeholder="0"
            />
          </DatagramRow>
          <DatagramRow label="Total da venda">
            <input
              className={`${inputReadonlyCls} border-primary-200 bg-primary-50/80 text-base font-bold text-primary-800`}
              readOnly
              value={`R$ ${totalEstimadoVenda.toFixed(2)}`}
            />
          </DatagramRow>
          <p className="text-xs text-slate-500">Valores conforme tabela de preço e condições selecionadas.</p>
        </div>
      </section>

      {erroConfirmacao ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm" role="alert">
          {erroConfirmacao}
        </div>
      ) : null}

      {sucesso ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-green-900 shadow-sm">
          <p className="font-semibold">{sucesso.mensagem ?? 'Pedido confirmado com sucesso!'}</p>
          {sucesso.nunota != null ? (
            <p className="mt-1 text-sm text-green-800">Número único da nota: {sucesso.nunota}</p>
          ) : null}
          <button
            type="button"
            onClick={() => navigate(ROUTES.VENDAS)}
            className="mt-3 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Voltar para vendas
          </button>
        </div>
      ) : null}

      {!sucesso ? (
        <div className="sticky bottom-0 z-10 -mx-1 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-1 pt-4 shadow-[0_-8px_30px_rgba(15,23,42,0.06)] sm:static sm:mx-0 sm:flex-row sm:items-center sm:justify-end sm:border-0 sm:bg-transparent sm:px-0 sm:pt-0 sm:shadow-none">
          <Link
            to={ROUTES.VENDAS}
            className="w-full rounded-xl border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:w-auto"
          >
            Cancelar
          </Link>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={isConfirmando}
            className="w-full rounded-xl bg-primary-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isConfirmando ? 'Enviando…' : 'Confirmar pedido'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
