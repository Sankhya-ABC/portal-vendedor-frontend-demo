import type { Cliente, ConfiguracaoNota, ItemPedido, Produto } from '@/types'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export interface PendingCatalogAdd {
  produto: Produto
  qtd: string
}

export interface CabecalhoPedido {
  parceiro: string
  dtNeg: string
  tipoNegociacao: string
  tipoOperacao: string
  empresa: string
  natureza: string
  centroResultado: string
  vendedor: string
}

export interface DadosComerciais {
  modoEntrega: 'entrega' | 'retira'
  enderecoEntrega: string
  frete: 'emitente' | 'destinatario' | 'sem'
  transportadora: string
  tabelaPreco: 'A' | 'B' | 'C' | 'D'
  cupom: string
  condicaoVenda: string
  observacaoNfe: string
  observacaoSeparacao: string
  dataEntrega: string
  turnoEntrega: 'diurno' | 'noturno' | 'qualquer'
  freteValor: string
  descontoFaturamento: string
  referencia: string
  horarioEntrega: string
  cnpjCpf: string
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export const defaultCabecalho: CabecalhoPedido = {
  parceiro: '',
  dtNeg: today(),
  tipoNegociacao: '',
  tipoOperacao: 'Pedido de Vendas',
  empresa: '',
  natureza: '',
  centroResultado: '',
  vendedor: '',
}

export const defaultComercial: DadosComerciais = {
  modoEntrega: 'entrega',
  enderecoEntrega: '',
  frete: 'sem',
  transportadora: '',
  tabelaPreco: 'A',
  cupom: '',
  condicaoVenda: 'boleto_padrao',
  observacaoNfe: '',
  observacaoSeparacao: '',
  dataEntrega: today(),
  turnoEntrega: 'diurno',
  freteValor: '',
  descontoFaturamento: '',
  referencia: '',
  horarioEntrega: '',
  cnpjCpf: '',
}

export interface VendasWorkspaceContextValue {
  clienteSelecionado: Cliente | null
  setClienteSelecionado: (c: Cliente | null) => void
  pendingCatalogAdd: PendingCatalogAdd | null
  enqueueCatalogAdd: (produto: Produto, qtd: string) => void
  clearPendingCatalogAdd: () => void
  /** Estado persistente do pedido em edição */
  itensPedido: ItemPedido[]
  setItensPedido: React.Dispatch<React.SetStateAction<ItemPedido[]>>
  cabecalhoPedido: CabecalhoPedido
  setCabecalhoPedido: React.Dispatch<React.SetStateAction<CabecalhoPedido>>
  comercialPedido: DadosComerciais
  setComercialPedido: React.Dispatch<React.SetStateAction<DadosComerciais>>
  configSelecionada: ConfiguracaoNota | null
  setConfigSelecionada: (c: ConfiguracaoNota | null) => void
  resetPedido: () => void
}

const VendasWorkspaceContext = createContext<VendasWorkspaceContextValue | null>(null)

export function VendasWorkspaceProvider({ children }: { children: ReactNode }) {
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [pendingCatalogAdd, setPendingCatalogAdd] = useState<PendingCatalogAdd | null>(null)
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([])
  const [cabecalhoPedido, setCabecalhoPedido] = useState<CabecalhoPedido>(defaultCabecalho)
  const [comercialPedido, setComercialPedido] = useState<DadosComerciais>(defaultComercial)
  const [configSelecionada, setConfigSelecionada] = useState<ConfiguracaoNota | null>(null)

  const enqueueCatalogAdd = useCallback((produto: Produto, qtd: string) => {
    setPendingCatalogAdd({ produto, qtd })
  }, [])

  const clearPendingCatalogAdd = useCallback(() => setPendingCatalogAdd(null), [])

  const resetPedido = useCallback(() => {
    setItensPedido([])
    setCabecalhoPedido({ ...defaultCabecalho, dtNeg: today() })
    setComercialPedido({ ...defaultComercial, dataEntrega: today() })
    setConfigSelecionada(null)
    setClienteSelecionado(null)
  }, [])

  const value = useMemo(
    () => ({
      clienteSelecionado,
      setClienteSelecionado,
      pendingCatalogAdd,
      enqueueCatalogAdd,
      clearPendingCatalogAdd,
      itensPedido,
      setItensPedido,
      cabecalhoPedido,
      setCabecalhoPedido,
      comercialPedido,
      setComercialPedido,
      configSelecionada,
      setConfigSelecionada,
      resetPedido,
    }),
    [
      clienteSelecionado,
      pendingCatalogAdd,
      enqueueCatalogAdd,
      clearPendingCatalogAdd,
      itensPedido,
      cabecalhoPedido,
      comercialPedido,
      configSelecionada,
      resetPedido,
    ],
  )

  return <VendasWorkspaceContext.Provider value={value}>{children}</VendasWorkspaceContext.Provider>
}

export function useVendasWorkspace(): VendasWorkspaceContextValue | null {
  return useContext(VendasWorkspaceContext)
}
