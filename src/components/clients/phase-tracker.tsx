import { cn } from '@/lib/utils'
import { PHASE_LABELS } from '@/lib/constants'
import type { NutritionPhase } from '@/lib/types'

interface PhaseTrackerProps {
  currentPhase: NutritionPhase
  startDate: string
  endDate: string
  phaseChangeDate: string | null
}

export function PhaseTracker({ currentPhase, startDate, endDate, phaseChangeDate }: PhaseTrackerProps) {
  const phases: NutritionPhase[] = [1, 2, 3]
  const totalDays = Math.max(1, Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  ))
  const elapsed = Math.max(0, Math.round(
    (new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  ))
  const progress = Math.min(100, Math.round((elapsed / totalDays) * 100))

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Progreso del Programa</h3>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Día {elapsed} de {totalDays}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Phase indicators */}
      <div className="flex gap-2">
        {phases.map((phase) => (
          <div
            key={phase}
            className={cn(
              'flex-1 rounded-lg border p-3 text-center text-xs',
              phase === currentPhase
                ? 'border-primary bg-primary/5 font-medium'
                : phase < currentPhase
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'text-muted-foreground'
            )}
          >
            {PHASE_LABELS[phase]}
            {phase === currentPhase && phaseChangeDate && (
              <p className="mt-1 text-muted-foreground">
                Cambio: {new Date(phaseChangeDate).toLocaleDateString('es-ES')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
