export interface ConfiguracaoNota {
  id: number
  descricao: string
  codEmp: number | null
  codNat: number | null
  codVend: number | null
  codCencus: number | null
  codProj: number | null
  codTipOper: number | null
  codTipVenda: number | null
  cifFob: string | null
  tipmov: string | null
}

export interface ConfiguracaoNotaRequest {
  descricao: string
  codEmp?: number | null
  codNat?: number | null
  codVend?: number | null
  codCencus?: number | null
  codProj?: number | null
  codTipOper?: number | null
  codTipVenda?: number | null
  cifFob?: string | null
  tipmov?: string | null
}
