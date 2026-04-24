export interface Produto {
  id: number
  nome: string
  grupo?: string | null
  un?: string | null
  referencia?: string | null
  marca?: string | null
  ativo?: boolean
  pesoBruto?: number | null
  /** Código do produto no ERP Sankhya (CODPROD). */
  codProd?: number | null
  /** Indica se o produto foi sincronizado com o Sankhya. */
  sincronizadoSankhya?: boolean
  /** Campos mantidos para compatibilidade com o catálogo de vendas. */
  psv?: number
  pmv?: number
  puv?: number
  estoque?: number
  codigo?: string
  modelo?: string
  subgrupo?: string
  disponivelEstoque?: boolean
  unSecundaria?: string
}

export interface ItemPedido {
  id: number
  nome: string
  qtd: string
  unitario: number
  total: number
  /** Percentual de desconto na linha (enviado como percDesc na API). */
  margem: number
  pmv?: number
  psv?: number
  puv?: number
  /** Subtítulo do item tipo legado, ex.: "2904 | 2904". */
  codigoLinha?: string
  /** Unidade da quantidade principal (ex.: Pç). */
  unidadeVenda?: string
  /** Segunda medida (ex.: peso). */
  qtdPeso?: string
  unidadePeso?: string
  /** Texto de estoque para exibição, ex.: "3.364,2930 disponíveis". */
  estoqueDisponivelLabel?: string
  descontoTipo?: '%' | 'R$'
  /** Data de disponibilidade (YYYY-MM-DD). */
  dataDisponivel?: string
  /** Margem % sobre PMV (exibição). */
  margemPercentual?: number
}
