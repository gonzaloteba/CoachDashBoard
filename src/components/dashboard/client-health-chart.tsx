'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface ClientHealthChartProps {
  green: number
  red: number
  coachId?: string | null
}

const COLORS = {
  green: '#22c55e',
  red: '#ef4444',
}

const LABELS = {
  green: 'Sin pendientes',
  red: 'Con pendientes',
}

export function ClientHealthChart({ green, red, coachId }: ClientHealthChartProps) {
  const data = [
    { name: LABELS.green, value: green, color: COLORS.green },
    { name: LABELS.red, value: red, color: COLORS.red },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border bg-card p-6 text-muted-foreground">
        No hay clientes activos
      </div>
    )
  }

  const coachSuffix = coachId ? `&coach=${coachId}` : ''

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground">
        Salud de Clientes
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} clientes`, '']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      {red > 0 && (
        <Link
          href={`/dashboard/clients?status=active&health=red${coachSuffix}`}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Ver clientes con pendientes
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  )
}
