'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingChecklistProps {
  clientId: string
  trainingpeaks: boolean
  whatsappGroup: boolean
  communityGroup: boolean
  initialAudit: boolean
  mealPlanSent: boolean
}

export function OnboardingChecklist({
  clientId,
  trainingpeaks,
  whatsappGroup,
  communityGroup,
  initialAudit,
  mealPlanSent,
}: OnboardingChecklistProps) {
  const router = useRouter()

  const items = [
    { key: 'onboarding_trainingpeaks', label: 'Cuenta TrainingPeaks creada', done: trainingpeaks },
    { key: 'onboarding_whatsapp_group', label: 'Grupo WhatsApp 1:1 creado', done: whatsappGroup },
    { key: 'onboarding_community_group', label: 'Añadido a comunidad WhatsApp', done: communityGroup },
    { key: 'onboarding_initial_audit', label: 'Auditoría inicial completada', done: initialAudit },
    { key: 'onboarding_meal_plan_sent', label: 'Plan de alimentación enviado', done: mealPlanSent },
  ]

  const allDone = items.every((i) => i.done)
  const completedCount = items.filter((i) => i.done).length

  async function toggle(field: string, current: boolean) {
    const supabase = createClient()
    const newValue = !current

    await supabase
      .from('clients')
      .update({ [field]: newValue })
      .eq('id', clientId)

    // Check if all items will be done after this toggle
    const updatedItems = items.map((item) =>
      item.key === field ? { ...item, done: newValue } : item
    )
    const willBeAllDone = updatedItems.every((i) => i.done)

    // Auto-resolve onboarding_incomplete alert when all items are done
    if (willBeAllDone) {
      await supabase
        .from('alerts')
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq('client_id', clientId)
        .eq('type', 'onboarding_incomplete')
        .eq('is_resolved', false)
    }

    router.refresh()
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Onboarding{' '}
        {allDone ? (
          <span className="text-green-600 ml-1">Completado</span>
        ) : (
          <span className="text-muted-foreground ml-1">({completedCount}/{items.length})</span>
        )}
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => toggle(item.key, item.done)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm transition-colors hover:bg-muted/50',
              item.done && 'text-muted-foreground'
            )}
          >
            {item.done ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={cn(item.done && 'line-through')}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
