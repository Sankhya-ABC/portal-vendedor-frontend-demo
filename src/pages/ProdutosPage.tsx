import { Button, Card, CardHeader, Input, PageHeader } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useProdutos } from '@/hooks'
import { produtoService } from '@/services/produtoService'
import { useState } from 'react'

function fmtPeso(value: number | null | undefined): string {
  if (value == null) return '—'
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
}

export function ProdutosPage() {
  const { token } = useAuth()
  const [busca, setBusca] = useState('')
  const [buscaAplicada, setBuscaAplicada] = useState('')
  const [sincronizando, setSincronizando] = useState(false)

  const { produtos, loading, refetch } = useProdutos({ busca: buscaAplicada })

  const aplicarPesquisa = () => {
    setBuscaAplicada(busca)
  }

  const handleSincronizar = async () => {
    if (!token) return
    setSincronizando(true)
    try {
      const res = await produtoService.sincronizar(token)
      alert(res.mensagem)
      refetch()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao sincronizar')
    } finally {
      setSincronizando(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Catálogo de produtos sincronizado com o ERP"
        action={
          <Button
            variant="secondary"
            onClick={handleSincronizar}
            disabled={sincronizando}
            className="w-full sm:w-auto"
          >
            {sincronizando ? 'Sincronizando...' : 'Sincronizar Sankhya'}
          </Button>
        }
      />

      <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
        <p className="font-semibold text-amber-900">Promoções no catálogo</p>
        <p className="mt-1 text-amber-900/90">
          Campanha em <strong>paletes promocionais infantil</strong> (FD) e condições especiais na linha{' '}
          <strong>FR BOM BEBE MEGA / PRATICA</strong> e <strong>GUTO BABY HIPER</strong>. Preços de referência (PSV)
          vigentes até <strong>30/04/2026</strong> — confira valores na grade e em Mensagens.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="search"
              placeholder="Pesquisar por nome, código ou grupo"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && aplicarPesquisa()}
              className="flex-1"
            />
            <Button variant="secondary" type="button" onClick={aplicarPesquisa} className="w-full sm:w-auto">
              Pesquisar
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-4 py-3 font-medium text-slate-600">Cód. ERP</th>
                <th className="px-4 py-3 font-medium text-slate-600">Nome</th>
                <th className="px-4 py-3 font-medium text-slate-600">Grupo</th>
                <th className="px-4 py-3 font-medium text-slate-600">UN</th>
                <th className="px-4 py-3 font-medium text-slate-600">Referência</th>
                <th className="px-4 py-3 font-medium text-slate-600">Marca</th>
                <th className="px-4 py-3 font-medium text-slate-600 text-right">Peso Bruto</th>
                <th className="px-4 py-3 font-medium text-slate-600">Ativo</th>
                <th className="px-4 py-3 font-medium text-slate-600">Sankhya</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    Carregando...
                  </td>
                </tr>
              ) : produtos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    {buscaAplicada
                      ? 'Nenhum produto encontrado para a pesquisa.'
                      : 'Nenhum produto cadastrado. Clique em "Sincronizar Sankhya" para importar.'}
                  </td>
                </tr>
              ) : (
                produtos.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {p.codProd ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{p.nome}</td>
                    <td className="px-4 py-3 text-slate-600">{p.grupo || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{p.un || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{p.referencia || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{p.marca || '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                      {fmtPeso(p.pesoBruto)}
                    </td>
                    <td className="px-4 py-3">
                      {p.ativo !== false ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Sim
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                          Não
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.sincronizadoSankhya ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Sincronizado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          Pendente
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
          Total de registros: {produtos.length}
        </div>
      </Card>
    </div>
  )
}
