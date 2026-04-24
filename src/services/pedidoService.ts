async function mockDelay(): Promise<void> {
  await new Promise((r) => setTimeout(r, 120))
}

export interface ItemPedidoPayload {
  codProd: string
  qtdNeg: string
  vlrUnit?: string
  percDesc?: string
  codVol?: string
}

export interface ConfirmarPedidoPayload {
  codParc: string
  dtNeg: string
  codTipOper: string
  codTipVenda: string
  codEmp: string
  codNat: string
  codCencus: string
  codVend: string
  observacao?: string
  itens: ItemPedidoPayload[]
}

export interface PedidoConfirmadoResponse {
  sucesso: boolean
  mensagem: string
  nunota?: number | null
}

async function confirmar(_token: string, _payload: ConfirmarPedidoPayload): Promise<PedidoConfirmadoResponse> {
  await mockDelay()
  const nunota = 100_001 + Math.floor(Math.random() * 900)
  return {
    sucesso: true,
    mensagem: 'Pedido registrado no Sankhya com sucesso. A nota já está disponível para faturamento e acompanhamento.',
    nunota,
  }
}

export const pedidoService = { confirmar }
