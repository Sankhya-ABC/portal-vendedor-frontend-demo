import { type ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  className?: string
}

/** Badge de status — use com classes Tailwind (ex.: STATUS_CLIENTE_CSS[status]) */
export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`.trim()}
    >
      {children}
    </span>
  )
}
