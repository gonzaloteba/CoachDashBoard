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
}

export function OnboardingChecklist({
  clientId,
  trainingpeaks,
  whatsappGroup,
  communityGroup,
}: OnboardingChecklistProps) {
  const router = useRouter()

  const items = [
    { key: 'onboarding_trainingpeaks', label: 'Cuenta TrainingPeaks creada', done: trainingpeaks },
    { key: 'onboarding_whatsapp_group', label: 'Grupo WhatsApp 1:1 creado', done: whatsappGroup },
    { key: 'onboarding_community_group', label: 'Añadido a comunidad WhatsApp', done: communityGroup },
  ]

  const allDone = items.every((i) => i.done)

  async function toggle(field: string, current: boolean) {
    const supabase = createClient()
    await supabase
      .from('clients')
      .update({ [field]: !current })
      .eq('id', clientId)
    router.refresh()
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Onboarding {allDone && <span className="text-green-600 ml-1">Completado</span>}
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
