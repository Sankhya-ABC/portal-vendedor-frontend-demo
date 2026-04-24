import type { Mensagem } from '@/types'

const MOCK_MENSAGENS: Mensagem[] = [
  {
    id: 1,
    titulo: 'Campanha — Paletes promocionais infantil (G, XG, M, SXG)',
    valor: 'PSV diferenciado em fardo (FD) até 30/04. Itens já disponíveis no catálogo Produtos / Vendas.',
    lida: false,
    data: '23/04/2026',
    origem: 'Marketing',
  },
  {
    id: 2,
    titulo: 'Promoção — Linha FR BOM BEBE MEGA e PRATICA',
    valor: 'Condição especial em volume: combine MEGA + PRATICA no mesmo pedido e consulte desconto em faturamento.',
    lida: false,
    data: '23/04/2026',
    origem: 'Comercial',
  },
  {
    id: 3,
    titulo: 'Destaque — FR GUTO BABY HIPER e ECO',
    valor: 'Novos blends de preço (PSV/PMV/PUV) na linha infantil; priorize HIPER em rotas com meta de cobertura.',
    lida: true,
    data: '22/04/2026',
    origem: 'Produtos',
  },
]

export const mensagemService = {
  async listar(): Promise<Mensagem[]> {
    await new Promise((r) => setTimeout(r, 80))
    return [...MOCK_MENSAGENS]
  },
}
