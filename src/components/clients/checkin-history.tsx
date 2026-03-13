'use client'

import { useState } from 'react'
import { ClipboardCheck, Download, Camera, X, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { CheckIn } from '@/lib/types'

interface CheckinHistoryProps {
  checkIns: CheckIn[]
}

function ScoreBar({ value, max = 10, label }: { value: number; max?: number; label: string }) {
  const pct = (value / max) * 100
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function TrendIndicator({ current, previous }: { current: number | null; previous: number | null }) {
  if (current === null || previous === null) return null
  const diff = current - previous
  if (Math.abs(diff) < 0.1) return <Minus className="h-3 w-3 text-muted-foreground" />
  if (diff > 0) return <TrendUp value={diff} />
  return <TrendDown value={diff} />
}

function TrendUp({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-red-500">
      <TrendingUp className="h-3 w-3" />
      +{value.toFixed(1)}
    </span>
  )
}

function TrendDown({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-emerald-500">
      <TrendingDown className="h-3 w-3" />
      {value.toFixed(1)}
    </span>
  )
}

function PhotoGallery({ photos, date }: { photos: string[]; date: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (photos.length === 0) return null

  return (
    <>
      <div className="mt-3">
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <Camera className="h-3 w-3" />
          Fotos de progreso ({photos.length})
        </p>
        <div className="flex gap-2 flex-wrap">
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="relative group rounded-lg overflow-hidden border hover:border-primary transition-colors"
            >
              <img
                src={url}
                alt={`Progreso ${date} - ${i + 1}`}
                className="h-24 w-24 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxIndex(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[lightboxIndex]}
              alt={`Progreso ${date} - ${lightboxIndex + 1}`}
              className="max-h-[85vh] rounded-lg object-contain"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <a
                href={photos[lightboxIndex]}
                download={`progreso-${date}-${lightboxIndex + 1}.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white/90 p-2 hover:bg-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="h-4 w-4 text-gray-700" />
              </a>
              <button
                onClick={() => setLightboxIndex(null)}
                className="rounded-full bg-white/90 p-2 hover:bg-white transition-colors"
              >
                <X className="h-4 w-4 text-gray-700" />
              </button>
            </div>
            {photos.length > 1 && (
              <>
                {lightboxIndex > 0 && (
                  <button
                    onClick={() => setLightboxIndex(lightboxIndex - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                  </button>
                )}
                {lightboxIndex < photos.length - 1 && (
                  <button
                    onClick={() => setLightboxIndex(lightboxIndex + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 hover:bg-white transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-700" />
                  </button>
                )}
              </>
            )}
            <p className="text-center text-white/70 text-sm mt-2">
              {lightboxIndex + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </>
  )
}

function CheckinCard({ checkIn, previousCheckIn }: { checkIn: CheckIn; previousCheckIn: CheckIn | null }) {
  const dateStr = new Date(checkIn.submitted_at).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const hasMetrics = checkIn.weight || checkIn.body_fat_percentage || checkIn.waist_measurement
  const hasScores = checkIn.energy_level || checkIn.sleep_quality || checkIn.mood || checkIn.nutrition_adherence || checkIn.training_adherence
  const photos = checkIn.photo_urls || []

  return (
    <div className="rounded-lg border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium capitalize">{dateStr}</p>
        </div>
        {checkIn.phase && (
          <span className="text-xs rounded-full border px-2 py-0.5 text-muted-foreground">
            Fase {checkIn.phase}
          </span>
        )}
      </div>

      {/* Body metrics */}
      {hasMetrics && (
        <div className="flex flex-wrap gap-4 text-sm">
          {checkIn.weight && (
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <div>
                <p className="text-xs text-muted-foreground">Peso</p>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{checkIn.weight} kg</span>
                  <TrendIndicator current={checkIn.weight} previous={previousCheckIn?.weight ?? null} />
                </div>
              </div>
            </div>
          )}
          {checkIn.body_fat_percentage && (
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <div>
                <p className="text-xs text-muted-foreground">% Grasa</p>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{checkIn.body_fat_percentage}%</span>
                  <TrendIndicator current={checkIn.body_fat_percentage} previous={previousCheckIn?.body_fat_percentage ?? null} />
                </div>
              </div>
            </div>
          )}
          {checkIn.waist_measurement && (
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <div>
                <p className="text-xs text-muted-foreground">Cintura</p>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{checkIn.waist_measurement} cm</span>
                  <TrendIndicator current={checkIn.waist_measurement} previous={previousCheckIn?.waist_measurement ?? null} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Score bars */}
      {hasScores && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {checkIn.energy_level && <ScoreBar value={checkIn.energy_level} label="Energía" />}
          {checkIn.sleep_quality && <ScoreBar value={checkIn.sleep_quality} label="Sueño" />}
          {checkIn.mood && <ScoreBar value={checkIn.mood} label="Ánimo" />}
          {checkIn.nutrition_adherence && <ScoreBar value={checkIn.nutrition_adherence} label="Adherencia nutrición" />}
          {checkIn.training_adherence && <ScoreBar value={checkIn.training_adherence} label="Adherencia entrenamiento" />}
        </div>
      )}

      {/* Qualitative data */}
      {(checkIn.protocol_adherence || checkIn.daily_energy || checkIn.cravings || checkIn.digestion || checkIn.difficulties) && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          {checkIn.protocol_adherence && (
            <div className="rounded-lg bg-muted/30 px-3 py-2">
              <p className="text-xs text-muted-foreground">Adhesión al protocolo</p>
              <p className="font-medium">{checkIn.protocol_adherence}</p>
            </div>
          )}
          {checkIn.daily_energy && (
            <div className="rounded-lg bg-muted/30 px-3 py-2">
              <p className="text-xs text-muted-foreground">Energía diaria</p>
              <p className="font-medium">{checkIn.daily_energy}</p>
            </div>
          )}
          {checkIn.cravings && (
            <div className="rounded-lg bg-muted/30 px-3 py-2">
              <p className="text-xs text-muted-foreground">Antojos</p>
              <p className="font-medium">{checkIn.cravings === 'TRUE' ? 'Sí' : checkIn.cravings === 'FALSE' ? 'No' : checkIn.cravings}</p>
            </div>
          )}
          {checkIn.digestion && (
            <div className="rounded-lg bg-muted/30 px-3 py-2">
              <p className="text-xs text-muted-foreground">Digestión</p>
              <p className="font-medium">{checkIn.digestion}</p>
            </div>
          )}
          {checkIn.difficulties && (
            <div className="rounded-lg bg-muted/30 px-3 py-2 sm:col-span-2">
              <p className="text-xs text-muted-foreground">Dificultades</p>
              <p className="font-medium">{checkIn.difficulties}</p>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {checkIn.notes && (
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <p className="text-xs text-muted-foreground mb-1">Notas</p>
          <p className="text-sm">{checkIn.notes}</p>
        </div>
      )}

      {/* Photo gallery */}
      <PhotoGallery
        photos={photos}
        date={new Date(checkIn.submitted_at).toISOString().split('T')[0]}
      />
    </div>
  )
}

export function CheckinHistory({ checkIns }: CheckinHistoryProps) {
  if (checkIns.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
        No hay check-ins registrados aún
      </div>
    )
  }

  // Check-ins come sorted by submitted_at DESC from the server
  const allPhotos = checkIns.flatMap((ci) => (ci.photo_urls || []).map((url) => ({
    url,
    date: ci.submitted_at,
  })))

  return (
    <div className="space-y-6">
      {/* Photo timeline (all photos across check-ins) */}
      {allPhotos.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Galería de Progreso ({allPhotos.length} fotos)
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {allPhotos.map((photo, i) => (
              <div key={i} className="shrink-0">
                <a
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg overflow-hidden border hover:border-primary transition-colors"
                >
                  <img
                    src={photo.url}
                    alt={`Progreso ${i + 1}`}
                    className="h-32 w-32 object-cover"
                  />
                </a>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {new Date(photo.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check-in cards */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Historial de Check-ins ({checkIns.length})
        </h3>
        <div className="space-y-4">
          {checkIns.map((ci, index) => (
            <CheckinCard
              key={ci.id}
              checkIn={ci}
              previousCheckIn={index < checkIns.length - 1 ? checkIns[index + 1] : null}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
