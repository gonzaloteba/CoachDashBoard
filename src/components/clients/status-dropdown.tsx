'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import { useToast } from '@/components/ui/toast'
import type { ClientStatus } from '@/lib/types'

interface StatusDropdownProps {
  clientId: string
  currentStatus: ClientStatus
  size?: 'sm' | 'md'
}

const ALL_STATUSES: ClientStatus[] = ['active', 'paused', 'completed', 'cancelled']

export function StatusDropdown({ clientId, currentStatus, size = 'sm' }: StatusDropdownProps) {
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setStatus(currentStatus)
  }, [currentStatus])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function changeStatus(newStatus: ClientStatus) {
    if (newStatus === status) {
      setOpen(false)
      return
    }

    setLoading(true)
    const previousStatus = status
    setStatus(newStatus)
    setOpen(false)

    const supabase = createClient()

    // When pausing: save today's date as paused_at
    if (newStatus === 'paused') {
      const today = new Date().toISOString().split('T')[0]
      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus, paused_at: today })
        .eq('id', clientId)

      if (error) {
        setStatus(previousStatus)
        toast(`Error al cambiar el estado: ${error.message}`, 'error')
      } else {
        toast(`Estado cambiado a ${STATUS_LABELS[newStatus]}`, 'success')
        router.refresh()
      }
      setLoading(false)
      return
    }

    // When reactivating from paused: extend end_date by paused days
    if (previousStatus === 'paused' && newStatus === 'active') {
      const { data: client, error: fetchError } = await supabase
        .from('clients')
        .select('paused_at, end_date')
        .eq('id', clientId)
        .single()

      if (fetchError || !client?.paused_at) {
        // Fallback: just update status without extending dates
        const { error } = await supabase
          .from('clients')
          .update({ status: newStatus, paused_at: null })
          .eq('id', clientId)

        if (error) {
          setStatus(previousStatus)
          toast(`Error al cambiar el estado: ${error.message}`, 'error')
        } else {
          toast(`Estado cambiado a ${STATUS_LABELS[newStatus]}`, 'success')
          router.refresh()
        }
        setLoading(false)
        return
      }

      const pausedAt = new Date(client.paused_at + 'T00:00:00')
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const pausedDays = Math.max(1, Math.round((today.getTime() - pausedAt.getTime()) / (1000 * 60 * 60 * 24)))

      let updateData: Record<string, unknown> = { status: newStatus, paused_at: null }

      if (client.end_date) {
        const endDate = new Date(client.end_date + 'T00:00:00')
        endDate.setDate(endDate.getDate() + pausedDays)
        updateData.end_date = endDate.toISOString().split('T')[0]
      }

      const { error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', clientId)

      if (error) {
        setStatus(previousStatus)
        toast(`Error al cambiar el estado: ${error.message}`, 'error')
      } else {
        toast(`Reactivado. Programa extendido ${pausedDays} día${pausedDays !== 1 ? 's' : ''} por la pausa.`, 'success')
        router.refresh()
      }
      setLoading(false)
      return
    }

    // Default: just update status (for other transitions like active -> completed)
    const { error } = await supabase
      .from('clients')
      .update({ status: newStatus, paused_at: null })
      .eq('id', clientId)

    if (error) {
      setStatus(previousStatus)
      toast(`Error al cambiar el estado: ${error.message}`, 'error')
    } else {
      toast(`Estado cambiado a ${STATUS_LABELS[newStatus]}`, 'success')
      router.refresh()
    }
    setLoading(false)
  }

  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-0.5 text-xs'
    : 'px-3 py-1 text-sm'

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => {
          if (!open && ref.current) {
            const rect = ref.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            setOpenUp(spaceBelow < 200)
          }
          setOpen(!open)
        }}
        disabled={loading}
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-medium transition-opacity cursor-pointer',
          sizeClasses,
          STATUS_COLORS[status],
          loading && 'opacity-50'
        )}
      >
        {STATUS_LABELS[status]}
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className={cn(
          'absolute left-0 z-50 min-w-[160px] rounded-lg border bg-popover p-1 shadow-lg',
          openUp ? 'bottom-full mb-1' : 'top-full mt-1'
        )}>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => changeStatus(s)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors hover:bg-muted',
                s === status && 'bg-muted font-medium'
              )}
            >
              <span className={cn('inline-block h-2 w-2 rounded-full', STATUS_COLORS[s].split(' ')[0])} />
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
