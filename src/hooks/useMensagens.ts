import { useEffect, useState } from 'react'
import type { Mensagem } from '@/types'
import { mensagemService } from '@/services/mensagemService'

export function useMensagens() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    mensagemService
      .listar()
      .then((data) => {
        if (!cancelled) setMensagens(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { mensagens, loading }
}
