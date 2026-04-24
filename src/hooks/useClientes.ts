import { useCallback, useEffect, useState } from 'react'
import type { Cliente } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { clienteService, type ListarClientesParams } from '@/services/clienteService'

export function useClientes(params: ListarClientesParams = {}) {
  const { token } = useAuth()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!token) {
      setClientes([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    clienteService
      .listar(token, params)
      .then((data) => {
        if (!cancelled) setClientes(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token, params.busca, params.status, refreshKey])

  return { clientes, loading, error, refetch }
}
