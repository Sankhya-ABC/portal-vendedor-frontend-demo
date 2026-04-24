import { Button, Card, CardHeader, Input, PageHeader } from '@/components/ui'
import { useMensagens } from '@/hooks'
import { useState } from 'react'

export function MensagensPage() {
  const [filtro, setFiltro] = useState('')
  const [apenasNaoLidas, setApenasNaoLidas] = useState(false)
  const { mensagens, loading } = useMensagens()

  const exibidas = apenasNaoLidas ? mensagens.filter((m) => !m.lida) : mensagens

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mensagens"
        description="Avisos do time e campanhas de produtos (catálogo fraldas / paletes FD)"
        action={<Button variant="primary" className="w-full sm:w-auto">Enviar nova mensagem</Button>}
      />
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              type="search"
              placeholder="Filtro por palavra-chave"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="flex-1"
            />
            <input
              type="date"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:w-auto"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={apenasNaoLidas}
                onChange={(e) => setApenasNaoLidas(e.target.checked)}
                className="rounded border-slate-300"
              />
              Não lidas
            </label>
            <Button variant="secondary" type="button" className="w-full sm:w-auto">
              Pesquisar
            </Button>
          </div>
        </CardHeader>
        <ul className="divide-y divide-slate-100">
          {loading ? (
            <li className="px-4 py-8 text-center text-slate-500">Carregando...</li>
          ) : (
            exibidas.map((m) => (
              <li
                key={m.id}
                className={`flex flex-wrap items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-slate-50/50 sm:flex-nowrap ${
                  !m.lida ? 'bg-primary-50/30' : ''
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked={m.lida}
                    className="rounded border-slate-300"
                    aria-label="Marcar como lida"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">{m.titulo}</p>
                    <p className="text-sm text-slate-500">{m.valor}</p>
                  </div>
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 text-sm text-slate-500 sm:w-auto sm:flex-shrink-0 sm:justify-end sm:gap-4">
                  <span>Envio: {m.data}</span>
                  <span>Origem: {m.origem}</span>
                  <button type="button" className="text-primary-600 hover:underline">
                    Abrir
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </Card>
    </div>
  )
}
