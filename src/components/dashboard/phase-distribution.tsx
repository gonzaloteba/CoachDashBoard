'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PHASE_LABELS } from '@/lib/constants'
import type { NutritionPhase } from '@/lib/types'

interface PhaseDistributionProps {
  distribution: Record<NutritionPhase, number>
}

export function PhaseDistribution({ distribution }: PhaseDistributionProps) {
  const data = ([1, 2, 3] as NutritionPhase[]).map((phase) => ({
    name: PHASE_LABELS[phase],
    clientes: distribution[phase] || 0,
  }))

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground">
        Distribución por Fase
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="clientes" fill="oklch(0.646 0.222 41.116)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
