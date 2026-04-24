export function VendasConsultaPage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-3 sm:p-4">
        <input
          type="search"
          placeholder="Pesquisar pedidos"
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:max-w-md"
        />
      </div>
      <div className="p-5 text-center text-slate-500 sm:p-8">
        <p>Nenhum registro encontrado.</p>
        <p className="mt-1 text-sm">Os pedidos em aberto aparecerão aqui.</p>
      </div>
    </div>
  )
}
