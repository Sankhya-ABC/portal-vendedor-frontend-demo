export type StatusCliente = 'Ativo' | 'Potencial' | 'Inativo' | 'Bloqueado'

export interface Cliente {
  id: number
  codParc: number | null
  nome: string
  cgcCpf: string
  email: string | null
  telefone: string | null
  cep: string | null
  status: StatusCliente
  sincronizadoSankhya: boolean
  criadoEm: string
  /** Campos opcionais — podem vir da API ou ser preenchidos só na UI. */
  nomeContato?: string | null
  enderecoResumo?: string | null
  /** Endereço principal de cadastro (matriz / padrão) — Sankhya. */
  enderecoPadraoSankhya?: string | null
  /** Endereço de filial ou CD para entrega alternativa — Sankhya. */
  enderecoFilialSankhya?: string | null
  ultimaVenda?: string | null
  limiteCredito?: number | null
}

/**
 * Dados preenchidos no formulário após consulta por CNPJ.
 * Compatível com ParceiroRetornoDTO / CNPJá (nome, telefone, endereço, etc.).
 */
export interface ClienteConsultaCNPJForm {
  razaoSocial: string
  fantasia: string
  nomeContato: string
  email: string
  telefoneComercial: string
  celular: string
  /** Endereço (preenchido pela consulta quando disponível) */
  cep: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  segmento: string
  ie: string
}


export interface ClienteRequest {
  cliente: {
    cnpjCpf: string
    razaoSocial: string
    fantasia: string
    nomeContato: string
    ie: string
    segmento: string
    email: string
    telefone: string
  }
  endereco: {
    cep: string
    endereco: string
    numero: string
    complemento: string
    bairro: string
    cidade: string
    estado: string
    referencia: string
    municipio: string
  }
  complemento: {
    condicoesPagamento: string
    diasDisponiveis: {
      segunda: boolean
      terca: boolean
      quarta: boolean
      quinta: boolean
      sexta: boolean
      sabado: boolean
    }
    turno: 'diurno' | 'noturno' | ''
    horario: string
  }
  origemCliente: {
    origem: string
    jaEraCliente: string
    empresaAnterior: string
    informacoesAdicionais: string
  }
  observacoesGerais: string
}
