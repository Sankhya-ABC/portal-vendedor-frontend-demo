import { useCallback, useEffect, useState } from 'react'
import type { Produto } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { produtoService, type ListarProdutosParams } from '@/services/produtoService'

export function useProdutos(params: ListarProdutosParams = {}) {
  const { token } = useAuth()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!token) {
      setProdutos([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    produtoService
      .listar(token, params)
      .then((data) => {
        if (!cancelled) setProdutos(data)
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
  }, [token, params.busca, refreshKey])

  return { produtos, loading, error, refetch }
}
