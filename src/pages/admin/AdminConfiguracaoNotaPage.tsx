import { Button, Card, CardHeader, Input, PageHeader } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { configuracaoNotaService } from '@/services'
import type { ConfiguracaoNota, ConfiguracaoNotaRequest } from '@/types'
import { useCallback, useEffect, useState } from 'react'

const CIF_FOB_OPCOES = [
  { value: '', label: '—' },
  { value: 'C', label: 'CIF - Remetente' },
  { value: 'F', label: 'FOB - Destinatário' },
  { value: 'S', label: 'Sem Frete' },
] as const

const TIPMOV_OPCOES = [
  { value: '', label: '—' },
  { value: 'O', label: 'O — Pedido de compra' },
  { value: 'P', label: 'P — Pedido de venda' },
] as const

const selectCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]'

const initialForm: ConfiguracaoNotaRequest = {
  descricao: '',
  codEmp: null,
  codNat: null,
  codVend: null,
  codCencus: null,
  codProj: null,
  codTipOper: null,
  codTipVenda: null,
  cifFob: null,
  tipmov: null,
}

function numOrNull(v: string): number | null {
  const n = parseInt(v, 10)
  return Number.isNaN(n) ? null : n
}

export function AdminConfiguracaoNotaPage() {
  const { token } = useAuth()
  const [lista, setLista] = useState<ConfiguracaoNota[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<ConfiguracaoNotaRequest>(initialForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [excluindo, setExcluindo] = useState<number | null>(null)
  const [erro, setErro] = useState('')
  const [feedbackOk, setFeedbackOk] = useState('')

  const carregar = useCallback(() => {
    if (!token) return
    setLoading(true)
    configuracaoNotaService
      .listar(token)
      .then(setLista)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    carregar()
  }, [carregar])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setErro('')
    setFeedbackOk('')
    setSaving(true)
    const body: ConfiguracaoNotaRequest = {
      descricao: form.descricao.trim(),
      codEmp: form.codEmp ?? null,
      codNat: form.codNat ?? null,
      codVend: form.codVend ?? null,
      codCencus: form.codCencus ?? null,
      codProj: form.codProj ?? null,
      codTipOper: form.codTipOper ?? null,
      codTipVenda: form.codTipVenda ?? null,
      cifFob: form.cifFob && form.cifFob.length > 0 ? form.cifFob : null,
      tipmov: form.tipmov && form.tipmov.length > 0 ? form.tipmov : null,
    }
    const promise = editId
      ? configuracaoNotaService.atualizar(token, editId, body)
      : configuracaoNotaService.criar(token, body)
    promise
      .then(() => {
        setFeedbackOk(editId ? 'Alterações salvas com sucesso.' : 'Nova configuração incluída com sucesso.')
        setForm(initialForm)
        setEditId(null)
        carregar()
      })
      .catch((err) => {
        setFeedbackOk('')
        setErro(err instanceof Error ? err.message : 'Erro ao salvar')
      })
      .finally(() => setSaving(false))
  }

  const handleEditar = (row: ConfiguracaoNota) => {
    setFeedbackOk('')
    setForm({
      descricao: row.descricao,
      codEmp: row.codEmp ?? null,
      codNat: row.codNat ?? null,
      codVend: row.codVend ?? null,
      codCencus: row.codCencus ?? null,
      codProj: row.codProj ?? null,
      codTipOper: row.codTipOper ?? null,
      codTipVenda: row.codTipVenda ?? null,
      cifFob: row.cifFob ?? null,
      tipmov: row.tipmov ?? null,
    })
    setEditId(row.id)
  }

  const handleExcluir = (id: number, descricao: string) => {
    if (!token) return
    if (!window.confirm(`Excluir a configuração "${descricao}"?`)) return
    setExcluindo(id)
    setFeedbackOk('')
    configuracaoNotaService
      .excluir(token, id)
      .then(() => {
        setFeedbackOk('Configuração removida com sucesso.')
        carregar()
      })
      .catch((err) => setErro(err instanceof Error ? err.message : 'Erro ao excluir'))
      .finally(() => setExcluindo(null))
  }

  const cancelarEdicao = () => {
    setForm(initialForm)
    setEditId(null)
    setFeedbackOk('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuração Nota"
        description="Referência Sankhya para criação de pedido de venda / nota de venda."
      />

      {feedbackOk ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {feedbackOk}
        </div>
      ) : null}

      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-800">
          {editId ? 'Editar configuração' : 'Nova configuração'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Códigos (Empresa, Natureza, Vendedor, etc.) referenciam o Sankhya (Conf. CAB/ITE).
        </p>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Descrição</label>
            <Input
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              placeholder="Ex.: Config padrão venda"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Cód. Empresa (CODEMP)</label>
            <Input
              type="number"
              value={form.codEmp ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, codEmp: numOrNull(e.target.value) }))}
              placeholder="—"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Natureza (CODNAT)</label>
            <Input
              type="number"
              value={form.codNat ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, codNat: numOrNull(e.target.value) }))}
              placeholder="—"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Vendedor (CODVEND)</label>
            <Input
              type="number"
              value={form.codVend ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, codVend: numOrNull(e.target.value) }))}
              placeholder="—"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Centro Resultado (CODCENCUS)</label>
            <Input
              type="number"
              value={form.codCencus ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, codCencus: numOrNull(e.target.value) }))}
              placeholder="—"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Projeto (CODPROJ)</label>
            <Input
              type="number"
              value={form.codProj ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, codProj: numOrNull(e.target.value) }))}
              placeholder="—"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Tipo Operação (CODTIPOPER)</label>
            <Input
              type="number"
              value={form.codTipOper ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, codTipOper: numOrNull(e.target.value) }))}
              placeholder="—"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Tipo Negociação (CODTIPVENDA)</label>
            <Input
              type="number"
              value={form.codTipVenda ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, codTipVenda: numOrNull(e.target.value) }))}
              placeholder="—"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">CIF / FOB</label>
            <select
              className={selectCls}
              value={form.cifFob ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, cifFob: e.target.value || null }))}
            >
              {CIF_FOB_OPCOES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Tipo Movimento (TIPMOV)
            </label>
            <select
              className={selectCls}
              value={form.tipmov ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, tipmov: e.target.value || null }))}
            >
              {TIPMOV_OPCOES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row lg:col-span-3">
            <Button type="submit" variant="primary" disabled={saving} className="w-full sm:w-auto">
              {saving ? 'Salvando...' : editId ? 'Atualizar' : 'Criar'}
            </Button>
            {editId && (
              <Button type="button" variant="secondary" onClick={cancelarEdicao} className="w-full sm:w-auto">
                Cancelar
              </Button>
            )}
          </div>
        </form>
        {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-slate-800">Configurações cadastradas</h2>
        <p className="text-sm text-slate-500">Use na criação de pedido/nota de venda no Sankhya.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="text-sm text-slate-500">Total: {lista.length} configuração(ões)</div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-4 py-3 font-medium text-slate-600">Descrição</th>
                <th className="px-4 py-3 font-medium text-slate-600">CODEMP</th>
                <th className="px-4 py-3 font-medium text-slate-600">CODNAT</th>
                <th className="px-4 py-3 font-medium text-slate-600">CODVEND</th>
                <th className="px-4 py-3 font-medium text-slate-600">CODCENCUS</th>
                <th className="px-4 py-3 font-medium text-slate-600">CODPROJ</th>
                <th className="px-4 py-3 font-medium text-slate-600">CODTIPOPER</th>
                <th className="px-4 py-3 font-medium text-slate-600">CODTIPVENDA</th>
                <th className="px-4 py-3 font-medium text-slate-600">CIF/FOB</th>
                <th className="px-4 py-3 font-medium text-slate-600">TIPMOV</th>
                <th className="px-4 py-3 font-medium text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                    Carregando...
                  </td>
                </tr>
              ) : lista.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                    Nenhuma configuração. Crie uma acima.
                  </td>
                </tr>
              ) : (
                lista.map((row) => (
                  <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800">{row.descricao}</td>
                    <td className="px-4 py-3 text-slate-600">{row.codEmp ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{row.codNat ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{row.codVend ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{row.codCencus ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{row.codProj ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{row.codTipOper ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{row.codTipVenda ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{row.cifFob ?? '—'}</td>
                    <td className="px-4 py-3">
                      {row.tipmov ? (
                        <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">
                          {row.tipmov}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleEditar(row)}
                          className="!py-1 !text-xs"
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleExcluir(row.id, row.descricao)}
                          disabled={excluindo === row.id}
                          className="!py-1 !text-xs text-red-600 hover:bg-red-50"
                        >
                          {excluindo === row.id ? 'Excluindo...' : 'Excluir'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
