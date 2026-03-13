'use client'

import { useState } from 'react'
import { Phone, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Call } from '@/lib/types'

interface CallsLogProps {
  calls: Call[]
  clientId: string
}

export function CallsLog({ calls, clientId }: CallsLogProps) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleAddCall(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const supabase = createClient()
    await supabase.from('calls').insert({
      client_id: clientId,
      call_date: formData.get('call_date') as string,
      duration_minutes: parseInt(formData.get('duration') as string) || 15,
      notes: (formData.get('notes') as string) || null,
    })

    setShowForm(false)
    setLoading(false)
    router.refresh()
  }

  const inputClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Llamadas ({calls.length})
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-3 w-3" />
          Registrar llamada
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddCall} className="mb-4 space-y-3 rounded-lg border bg-muted/50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium mb-1">Fecha *</label>
              <input
                name="call_date"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Duración (min)</label>
              <input
                name="duration"
                type="number"
                defaultValue={15}
                min={1}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Notas</label>
            <textarea
              name="notes"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Resumen de la llamada..."
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md border px-4 py-2 text-xs font-medium hover:bg-muted"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {calls.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No hay llamadas registradas
          </p>
        ) : (
          calls.map((call) => (
            <div key={call.id} className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted/50">
              <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {new Date(call.call_date).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {call.duration_minutes} min
                  </span>
                </div>
                {call.notes && (
                  <p className="mt-1 text-xs text-muted-foreground">{call.notes}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
