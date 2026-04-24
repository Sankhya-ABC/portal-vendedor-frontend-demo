import type { StatusCliente } from '@/types'

/** Classes Tailwind por status para badges */
export const STATUS_CLIENTE_CSS: Record<StatusCliente, string> = {
  Ativo: 'bg-emerald-100 text-emerald-800',
  Potencial: 'bg-amber-100 text-amber-800',
  Inativo: 'bg-slate-100 text-slate-600',
  Bloqueado: 'bg-red-100 text-red-800',
}
