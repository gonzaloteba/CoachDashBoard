import { ClipboardCheck } from 'lucide-react'
import type { CheckIn } from '@/lib/types'

interface CheckinHistoryProps {
  checkIns: CheckIn[]
}

export function CheckinHistory({ checkIns }: CheckinHistoryProps) {
  if (checkIns.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
        No hay check-ins registrados aún
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Historial de Check-ins ({checkIns.length})
      </h3>
      <div className="space-y-3">
        {checkIns.map((ci) => (
          <div key={ci.id} className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">
                {new Date(ci.submitted_at).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              {ci.weight && (
                <div>
                  <span className="text-muted-foreground">Peso:</span>{' '}
                  <span className="font-medium">{ci.weight} kg</span>
                </div>
              )}
              {ci.body_fat_percentage && (
                <div>
                  <span className="text-muted-foreground">Grasa:</span>{' '}
                  <span className="font-medium">{ci.body_fat_percentage}%</span>
                </div>
              )}
              {ci.waist_measurement && (
                <div>
                  <span className="text-muted-foreground">Cintura:</span>{' '}
                  <span className="font-medium">{ci.waist_measurement} cm</span>
                </div>
              )}
              {ci.energy_level && (
                <div>
                  <span className="text-muted-foreground">Energía:</span>{' '}
                  <span className="font-medium">{ci.energy_level}/10</span>
                </div>
              )}
              {ci.sleep_quality && (
                <div>
                  <span className="text-muted-foreground">Sueño:</span>{' '}
                  <span className="font-medium">{ci.sleep_quality}/10</span>
                </div>
              )}
              {ci.mood && (
                <div>
                  <span className="text-muted-foreground">Ánimo:</span>{' '}
                  <span className="font-medium">{ci.mood}/10</span>
                </div>
              )}
              {ci.nutrition_adherence && (
                <div>
                  <span className="text-muted-foreground">Nutrición:</span>{' '}
                  <span className="font-medium">{ci.nutrition_adherence}/10</span>
                </div>
              )}
              {ci.training_adherence && (
                <div>
                  <span className="text-muted-foreground">Entrenamiento:</span>{' '}
                  <span className="font-medium">{ci.training_adherence}/10</span>
                </div>
              )}
            </div>
            {ci.notes && (
              <p className="mt-2 text-sm text-muted-foreground">{ci.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
