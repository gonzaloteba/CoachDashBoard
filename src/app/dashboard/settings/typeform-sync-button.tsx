'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { syncTypeformNow } from './actions'
import { useToast } from '@/components/ui/toast'

export function TypeformSyncButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const { toast } = useToast()

  async function handleSync() {
    setLoading(true)
    setResult(null)
    try {
      const res = await syncTypeformNow()
      setResult(res.message)
      toast(res.message, res.success ? 'success' : 'error')
    } catch {
      toast('Error al sincronizar con Typeform', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleSync}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Sincronizando...' : 'Sincronizar ahora'}
      </button>
      {result && (
        <p className="text-xs text-muted-foreground">{result}</p>
      )}
    </div>
  )
}
