import type { ConfiguracaoNota, ConfiguracaoNotaRequest } from '@/types'

async function mockDelay(): Promise<void> {
  await new Promise((r) => setTimeout(r, 80))
}

let mockSeq = 100
const MOCK_CONFIGS: ConfiguracaoNota[] = [
  {
    id: 1,
    descricao: 'Venda padrão B2B',
    codEmp: 1,
    codNat: 101,
    codVend: 5,
    codCencus: 1,
    codProj: null,
    codTipOper: 1001,
    codTipVenda: 2001,
    cifFob: 'CIF',
    tipmov: 'P',
  },
  {
    id: 2,
    descricao: 'Pedido de Compra',
    codEmp: 1,
    codNat: 101,
    codVend: 5,
    codCencus: 1,
    codProj: null,
    codTipOper: 1001,
    codTipVenda: 2003,
    cifFob: 'CIF',
    tipmov: 'O',
  },
  {
    id: 3,
    descricao: 'Bonificação',
    codEmp: 1,
    codNat: 205,
    codVend: 5,
    codCencus: 2,
    codProj: null,
    codTipOper: 1002,
    codTipVenda: 2002,
    cifFob: 'FOB',
    tipmov: 'P',
  },
  {
    id: 5,
    descricao: 'Orçamento de Venda',
    codEmp: 1,
    codNat: 101,
    codVend: 5,
    codCencus: 1,
    codProj: null,
    codTipOper: 1001,
    codTipVenda: 2005,
    cifFob: 'CIF',
    tipmov: 'P',
  },
]

export async function listar(_token: string): Promise<ConfiguracaoNota[]> {
  await mockDelay()
  return [...MOCK_CONFIGS]
}

/** Leitura pública (qualquer usuário autenticado) — usada no formulário de pedido. */
export async function listarPublico(_token: string): Promise<ConfiguracaoNota[]> {
  await mockDelay()
  return [...MOCK_CONFIGS]
}

export async function criar(_token: string, body: ConfiguracaoNotaRequest): Promise<ConfiguracaoNota> {
  await mockDelay()
  mockSeq += 1
  const created: ConfiguracaoNota = {
    id: mockSeq,
    descricao: body.descricao,
    codEmp: body.codEmp ?? null,
    codNat: body.codNat ?? null,
    codVend: body.codVend ?? null,
    codCencus: body.codCencus ?? null,
    codProj: body.codProj ?? null,
    codTipOper: body.codTipOper ?? null,
    codTipVenda: body.codTipVenda ?? null,
    cifFob: body.cifFob ?? null,
    tipmov: body.tipmov ?? null,
  }
  MOCK_CONFIGS.push(created)
  return created
}

export async function atualizar(
  _token: string,
  id: number,
  body: ConfiguracaoNotaRequest
): Promise<ConfiguracaoNota> {
  await mockDelay()
  const idx = MOCK_CONFIGS.findIndex((c) => c.id === id)
  const updated: ConfiguracaoNota = {
    id,
    descricao: body.descricao,
    codEmp: body.codEmp ?? null,
    codNat: body.codNat ?? null,
    codVend: body.codVend ?? null,
    codCencus: body.codCencus ?? null,
    codProj: body.codProj ?? null,
    codTipOper: body.codTipOper ?? null,
    codTipVenda: body.codTipVenda ?? null,
    cifFob: body.cifFob ?? null,
    tipmov: body.tipmov ?? null,
  }
  if (idx >= 0) MOCK_CONFIGS[idx] = updated
  else MOCK_CONFIGS.push(updated)
  return updated
}

export async function excluir(_token: string, id: number): Promise<void> {
  await mockDelay()
  const idx = MOCK_CONFIGS.findIndex((c) => c.id === id)
  if (idx >= 0) MOCK_CONFIGS.splice(idx, 1)
}

export const configuracaoNotaService = {
  listar,
  listarPublico,
  criar,
  atualizar,
  excluir,
}
