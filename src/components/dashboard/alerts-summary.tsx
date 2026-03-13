import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ALERT_TYPE_LABELS, SEVERITY_COLORS } from '@/lib/constants'
import type { Alert } from '@/lib/types'

interface AlertsSummaryProps {
  alerts: (Alert & { client?: { first_name: string; last_name: string } })[]
}

export function AlertsSummary({ alerts }: AlertsSummaryProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Alertas Recientes
        </h3>
        <Link
          href="/dashboard/alerts"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Ver todas <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {alerts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay alertas pendientes
          </p>
        ) : (
          alerts.map((alert) => (
            <Link
              key={alert.id}
              href={`/dashboard/clients/${alert.client_id}`}
              className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
            >
              <AlertTriangle
                className={cn(
                  'mt-0.5 h-4 w-4 shrink-0',
                  alert.severity === 'high'
                    ? 'text-red-500'
                    : alert.severity === 'medium'
                      ? 'text-yellow-500'
                      : 'text-blue-500'
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {alert.client?.first_name} {alert.client?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ALERT_TYPE_LABELS[alert.type]}
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                  SEVERITY_COLORS[alert.severity]
                )}
              >
                {alert.severity === 'high' ? 'Alta' : alert.severity === 'medium' ? 'Media' : 'Baja'}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
