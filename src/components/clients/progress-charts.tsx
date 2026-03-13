'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { CheckIn } from '@/lib/types'

interface ProgressChartsProps {
  checkIns: CheckIn[]
}

export function ProgressCharts({ checkIns }: ProgressChartsProps) {
  const sorted = [...checkIns].sort(
    (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
  )

  const data = sorted.map((ci) => ({
    date: new Date(ci.submitted_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
    peso: ci.weight,
    grasa: ci.body_fat_percentage,
    cintura: ci.waist_measurement,
    energia: ci.energy_level,
    sueno: ci.sleep_quality,
    animo: ci.mood,
    nutricion: ci.nutrition_adherence,
    entrenamiento: ci.training_adherence,
  }))

  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
        No hay check-ins registrados aún
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Body metrics */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Métricas Corporales
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="peso" name="Peso (kg)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="grasa" name="Grasa (%)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="cintura" name="Cintura (cm)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Wellbeing metrics */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Bienestar y Adherencia (1-10)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="energia" name="Energía" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="sueno" name="Sueño" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="animo" name="Ánimo" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="nutricion" name="Adherencia Nutrición" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="entrenamiento" name="Adherencia Entrenamiento" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
