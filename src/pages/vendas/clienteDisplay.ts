import type { Cliente } from '@/types'

/** CDs de referência quando o cadastro Sankhya não traz filial explícita (mock). */
const CD_FILIAIS_SANKHYA = [
  'CD Barueri — Av. Dr. Charles Schneider, 3100 — Galpão 02 — Barueri/SP',
  'CD Guarulhos — Av. Guarulhos, 2240 — Módulo C — Guarulhos/SP',
  'CD Suzano — Rod. Eng. Cândido Mariano da Silva, 3655 — Pátio 4 — Suzano/SP',
] as const

/** Endereço padrão (cadastro principal) para entrega / nota. */
export function enderecoPadraoEntrega(c: Cliente): string {
  if (c.enderecoPadraoSankhya?.trim()) return c.enderecoPadraoSankhya.trim()
  if (c.enderecoResumo?.trim()) return c.enderecoResumo.trim()
  if (c.cep?.trim()) return `CEP ${c.cep}`
  return 'Endereço não informado no cadastro'
}

/** Endereço de filial / CD Sankhya para entrega alternativa. */
export function enderecoFilialEntrega(c: Cliente): string {
  if (c.enderecoFilialSankhya?.trim()) return c.enderecoFilialSankhya.trim()
  const i = Math.abs(c.id) % CD_FILIAIS_SANKHYA.length
  return CD_FILIAIS_SANKHYA[i] ?? CD_FILIAIS_SANKHYA[0]
}

/** Garante `enderecoResumo` + campos Sankhya padrão/filial preenchidos para o mock. */
export function normalizarEnderecosSankhya(c: Cliente): Cliente {
  const padrao = enderecoPadraoEntrega(c)
  const fi = Math.abs(c.id) % CD_FILIAIS_SANKHYA.length
  const filial = c.enderecoFilialSankhya?.trim()
    ? c.enderecoFilialSankhya.trim()
    : (CD_FILIAIS_SANKHYA[fi] ?? CD_FILIAIS_SANKHYA[0])
  return {
    ...c,
    enderecoResumo: c.enderecoResumo?.trim() || padrao,
    enderecoPadraoSankhya: padrao,
    enderecoFilialSankhya: filial,
  }
}

/** Enriquece dados para exibição no workspace quando a API não envia todos os campos do legado. */
export function clienteParaExibicao(c: Cliente) {
  const enderecoResumo =
    c.enderecoResumo?.trim() ||
    enderecoPadraoEntrega(c) ||
    (c.cep ? `CEP ${c.cep}` : 'Endereço não informado no cadastro')

  return {
    nomeContato: c.nomeContato?.trim() || '—',
    enderecoResumo,
    ultimaVenda: c.ultimaVenda?.trim() || '—',
    limiteCredito: c.limiteCredito != null ? c.limiteCredito : 0,
  }
}

export function codigoParceiroParaPedido(c: Cliente): string {
  if (c.codParc != null) return String(c.codParc)
  return String(c.id)
}
