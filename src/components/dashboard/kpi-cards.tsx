import Link from 'next/link'
import { Users, ClipboardCheck, TrendingUp, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: number; positive: boolean }
  href?: string
  linkLabel?: string
}

function KpiCard({ title, value, subtitle, icon, trend, href, linkLabel }: KpiCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="rounded-lg bg-muted p-2">{icon}</div>
      </div>
      <div className="mt-3">
        <p className="text-3xl font-bold">{value}</p>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
        {trend && (
          <p
            className={cn(
              'mt-1 text-sm font-medium',
              trend.positive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trend.positive ? '+' : ''}{trend.value}% vs mes anterior
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {linkLabel ?? 'Ver detalle'}
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  )
}

interface KpiCardsProps {
  activeClients: number
  checkinsOnTime: number
  expectedCheckins: number
  retentionRate: number
  coachId?: string | null
}

export function KpiCards({
  activeClients,
  checkinsOnTime,
  expectedCheckins,
  retentionRate,
  coachId,
}: KpiCardsProps) {
  const checkinRate = expectedCheckins > 0
    ? Math.round((checkinsOnTime / expectedCheckins) * 100)
    : 0

  const coachSuffix = coachId ? `&coach=${coachId}` : ''

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        title="Clientes Activos"
        value={activeClients}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />
      <KpiCard
        title="Check-ins al día"
        value={`${checkinsOnTime}/${expectedCheckins}`}
        subtitle={`${checkinRate}% completado`}
        icon={<ClipboardCheck className="h-4 w-4 text-muted-foreground" />}
        href={`/dashboard/clients?status=active&checkin=no${coachSuffix}`}
        linkLabel="Ver check-ins pendientes"
      />
      <KpiCard
        title="Tasa de Retención"
        value={`${retentionRate}%`}
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  )
}
