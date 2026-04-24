import { getPedidosConsultaConteudo, subscribePedidosConsulta } from '@/services/pedidosConsultaStore'
import { useState, useSyncExternalStore } from 'react'

const consultas = [
  { id: 'pedidos', label: 'Pedidos em aberto / Duplicatas', desc: 'Consulte pedidos e títulos em aberto' },
  { id: 'devolucoes', label: 'Devoluções', desc: 'Histórico e solicitações de devolução' },
  { id: 'promocao', label: 'Produtos em promoção', desc: 'Campanhas ativas no catálogo (fraldas e paletes FD)' },
  { id: 'soma', label: 'Soma de pedidos por cliente', desc: 'Totalizador por cliente e período' },
  { id: 'venda-produto', label: 'Venda por produto / subgrupo', desc: 'Relatório de vendas por item' },
  { id: 'boletos', label: 'Boletos em aberto', desc: 'Títulos a receber' },
  { id: 'itinerarios', label: 'Consulta itinerários', desc: 'Rotas e entregas' },
]

type ConsultaResumo = {
  label: string
  value: string
}

type ConsultaTabela = {
  columns: string[]
  rows: string[][]
}

type ConsultaConteudo = {
  resumo: ConsultaResumo[]
  tabela: ConsultaTabela
}

const consultasMock: Record<string, ConsultaConteudo> = {
  devolucoes: {
    resumo: [
      { label: 'Solicitações abertas', value: '3' },
      { label: 'Aguardando coleta', value: '2' },
      { label: 'Valor em análise', value: 'R$ 4.380,00' },
    ],
    tabela: {
      columns: ['Código', 'Cliente', 'Motivo', 'Data', 'Valor', 'Situação'],
      rows: [
        ['DEV-104', 'Distribuidora Sol', 'Avaria no transporte', '13/04/2026', 'R$ 1.920,00', 'Aguardando coleta'],
        ['DEV-107', 'Supermercado Três Irmãos', 'Produto vencido', '15/04/2026', 'R$ 980,00', 'Em análise'],
        ['DEV-109', 'Empório Central', 'Pedido divergente', '17/04/2026', 'R$ 1.480,00', 'Autorizada'],
      ],
    },
  },
  promocao: {
    resumo: [
      { label: 'Itens em campanha', value: '8' },
      { label: 'Média de desconto sobre PSV', value: '8,8%' },
      { label: 'Vigência', value: 'até 30/04/2026' },
    ],
    tabela: {
      columns: ['Produto', 'Subgrupo', 'Preço atual (PSV)', 'Preço promoção', 'Desconto', 'Válido até'],
      rows: [
        ['PALETE PROMOCIONAL INFANTIL G', '—', 'R$ 71,07', 'R$ 64,90', '8,7%', '30/04/2026'],
        ['PALETE PROMOCIONAL INFANTIL XG', '—', 'R$ 72,11', 'R$ 65,90', '8,6%', '30/04/2026'],
        ['PALETE PROMOCIONAL INFANTIL M', '—', 'R$ 21,39', 'R$ 19,50', '8,8%', '30/04/2026'],
        ['FR BOM BEBE MEGA G C/70  - (4X1)', 'MEGA', 'R$ 83,72', 'R$ 76,90', '8,1%', '30/04/2026'],
        ['FR BOM BEBE MEGA XG C/60  - (4X1)', 'MEGA', 'R$ 80,04', 'R$ 73,50', '8,2%', '30/04/2026'],
        ['FR GUTO BABY HIPER M C/70  - (4X1)', 'HIPER', 'R$ 74,99', 'R$ 68,90', '8,1%', '30/04/2026'],
      ],
    },
  },
  soma: {
    resumo: [
      { label: 'Clientes no período', value: '42' },
      { label: 'Ticket médio', value: 'R$ 3.190,00' },
      { label: 'Total de pedidos', value: 'R$ 133.980,00' },
    ],
    tabela: {
      columns: ['Cliente', 'Quantidade pedidos', 'Total bruto', 'Total líquido', 'Último pedido'],
      rows: [
        ['Mercado Aurora', '6', 'R$ 25.600,00', 'R$ 24.880,00', '16/04/2026'],
        ['Atacado Sul', '4', 'R$ 19.300,00', 'R$ 18.910,00', '15/04/2026'],
        ['Casa do Trigo', '5', 'R$ 13.240,00', 'R$ 12.980,00', '12/04/2026'],
      ],
    },
  },
  'venda-produto': {
    resumo: [
      { label: 'Produtos vendidos', value: '96' },
      { label: 'Subgrupos ativos', value: '11' },
      { label: 'Faturamento no período', value: 'R$ 287.440,00' },
    ],
    tabela: {
      columns: ['Produto', 'Subgrupo', 'Qtd. vendida', 'Receita', 'Margem média'],
      rows: [
        ['Arroz Premium 5kg', 'Mercearia', '420 un', 'R$ 78.120,00', '14,3%'],
        ['Feijão Carioca 1kg', 'Mercearia', '390 un', 'R$ 29.250,00', '12,1%'],
        ['Óleo de Soja 900ml', 'Mercearia', '360 un', 'R$ 26.604,00', '10,8%'],
      ],
    },
  },
  boletos: {
    resumo: [
      { label: 'Boletos em aberto', value: '21' },
      { label: 'Vencem hoje', value: '4' },
      { label: 'Valor a receber', value: 'R$ 64.330,00' },
    ],
    tabela: {
      columns: ['Título', 'Cliente', 'Emissão', 'Vencimento', 'Valor', 'Status'],
      rows: [
        ['DUP-8841', 'Mercado Aurora', '08/04/2026', '21/04/2026', 'R$ 5.320,00', 'Vence hoje'],
        ['DUP-8849', 'Atacado Sul', '09/04/2026', '23/04/2026', 'R$ 9.180,00', 'Em aberto'],
        ['DUP-8857', 'Casa do Trigo', '11/04/2026', '18/04/2026', 'R$ 2.650,00', 'Vencido'],
      ],
    },
  },
  itinerarios: {
    resumo: [
      { label: 'Rotas planejadas', value: '7' },
      { label: 'Entregas hoje', value: '18' },
      { label: 'Cidades atendidas', value: '12' },
    ],
    tabela: {
      columns: ['Rota', 'Motorista', 'Veículo', 'Paradas', 'Saída', 'Status'],
      rows: [
        ['Rota Norte 01', 'Carlos Mendes', 'ABC-1D23', '5', '07:30', 'Em rota'],
        ['Rota Sul 03', 'João Pereira', 'QWE-9X87', '4', '08:15', 'Aguardando carregamento'],
        ['Rota Centro 02', 'Renata Silva', 'JKL-4M56', '6', '07:00', 'Concluída'],
      ],
    },
  },
}

export function ConsultasPage() {
  const [ativo, setAtivo] = useState('pedidos')
  const consultaAtiva = consultas.find((c) => c.id === ativo)
  const conteudoPedidos = useSyncExternalStore(
    subscribePedidosConsulta,
    getPedidosConsultaConteudo,
    getPedidosConsultaConteudo,
  )
  const conteudo: ConsultaConteudo =
    ativo === 'pedidos' ? conteudoPedidos : (consultasMock[ativo] ?? consultasMock.devolucoes!)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Consultas</h1>
        <p className="mt-1 text-slate-500">Pedidos, duplicatas, devoluções e relatórios</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-4">
        <nav className="lg:col-span-1">
          <ul className="space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            {consultas.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setAtivo(c.id)}
                  className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    ativo === c.id
                      ? 'bg-primary-500 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3 sm:p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-800">{consultaAtiva?.label}</h2>
          <p className="mt-1 text-sm text-slate-500">{consultaAtiva?.desc}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {conteudo.resumo.map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {conteudo.tabela.columns.map((column) => (
                    <th key={column} className="whitespace-nowrap px-4 py-3 text-left font-medium text-slate-600">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {conteudo.tabela.rows.map((row, rowIndex) => (
                  <tr key={`${ativo}-${row[0] ?? 'r'}-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${ativo}-${rowIndex}-${cellIndex}`} className="whitespace-nowrap px-4 py-3 text-slate-700">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
