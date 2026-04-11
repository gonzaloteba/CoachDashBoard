import Anthropic from '@anthropic-ai/sdk'
import { logger } from '@/lib/logger'
import { ApiKeyMissingError, AnthropicApiError } from '@/lib/transcript-ai'
import type { Client } from '@/lib/types'

const log = logger('routine:ai')

const SYSTEM_PROMPT = `Eres un experto en biohacking, alimentación animal-based y low-carb, y estructuración de rutina diaria para maximizar la flexibilidad metabólica. Tu trabajo es recibir los datos de un cliente, analizar su rutina actual y generar el contenido de las indicaciones de rutina diaria optimizada.

CONTEXTO DEL SISTEMA:
- Fase activa: Fase 1 — Detox y desinflamación
- No se prescriben carbohidratos en Fase 1
- Perfil de cliente: Empresarios y ejecutivos
- Programa: Coaching 1 a 1 de 3 meses
- Pilares: nutrición natural, entrenamiento híbrido, biohacking hormonal
- Marca: ZALUD

FILOSOFÍA BASE (NO NEGOCIABLE):
- El ayuno intermitente se implementa de forma natural, no forzada.
- Objetivo: SOLO 2 comidas al día (desayuno = comida 1, cena = comida 2).
- El snack es opcional, sugerir solo como red de seguridad por si hay hambre.
- Hidratación al despertar con agua, sal de mar y limón.
- No café en Fase 1.

REGLA CRÍTICA SOBRE CONTENIDO:
- NUNCA indicar QUÉ comer (alimentos, macros, composición).
- Solo indicar CUÁNDO comer: horarios, ventana de ayuno, orden.

ENTRENAMIENTO Y ALIMENTACIÓN:
- La hora de entrenamiento que nos indican es FIJA e INAMOVIBLE, pues es el momento de que ellos disponen para entrenar, no podemos moverles la hora de entreno libremente.
- Si entrena antes de las 12h → sugerir entrenar en ayunas y romper ayuno después.
- Si entrena a las 13h o después → romper ayuno ANTES de entrenar, con suficiente tiempo para digerir bien la comida.
- Validación de consistencia obligatoria entre secciones.

VENTANA DE AYUNO:
- Mínimo 14-16 horas de ayuno (no negociable).
- Ajustar horarios de comida para cumplir este mínimo.
- Mínimo 3 horas entre última ingesta y acostarse.

FORMATO DE RESPUESTA:
Responde SOLO con el contenido estructurado, sin markdown, sin encabezados extra. Usa este formato exacto:

ALIMENTACIÓN
> [indicaciones de horarios]

ENTRENAMIENTO
> [solo si hay implicación con alimentación/ayuno]

SUEÑO
> [indicaciones]

[2 líneas de cierre]`

function buildClientDataPrompt(client: Client): string {
  const fields: string[] = []

  fields.push(`Nombre: ${client.first_name} ${client.last_name}`)

  if (client.wake_time) fields.push(`Hora de despertar: ${client.wake_time}`)
  if (client.bed_time) fields.push(`Hora de acostarse: ${client.bed_time}`)
  if (client.sleep_hours_avg) fields.push(`Horas de sueño promedio: ${client.sleep_hours_avg}`)
  if (client.sleep_quality_initial != null) fields.push(`Calidad del sueño (1-10): ${client.sleep_quality_initial}`)
  if (client.wakes_at_night != null) fields.push(`Se despierta durante la noche: ${client.wakes_at_night ? 'Sí' : 'No'}`)
  if (client.feels_rested != null) fields.push(`Se siente descansado al despertar: ${client.feels_rested ? 'Sí' : 'No'}`)

  if (client.work_schedule) fields.push(`Horarios de trabajo: ${client.work_schedule}`)
  if (client.work_modality) fields.push(`Modalidad de trabajo: ${client.work_modality}`)
  if (client.work_activity_level) fields.push(`Nivel de actividad laboral: ${client.work_activity_level}`)

  if (client.has_event) {
    fields.push(`Tiene evento deportivo: Sí`)
    if (client.event_name) fields.push(`Evento: ${client.event_name}`)
    if (client.event_date) fields.push(`Fecha del evento: ${client.event_date}`)
  }
  if (client.training_days_per_week != null) fields.push(`Días de entrenamiento por semana: ${client.training_days_per_week}`)
  if (client.training_time) fields.push(`Momento del día para entrenar: ${client.training_time}`)
  if (client.training_location) fields.push(`Lugar de entrenamiento: ${client.training_location}`)
  if (client.training_level) fields.push(`Nivel de experiencia en gimnasio: ${client.training_level}`)
  if (client.training_cardio) fields.push(`Cardio (carrera/bici/natación): ${client.training_cardio}`)
  if (client.trains_fasted != null) fields.push(`Entrena en ayunas: ${client.trains_fasted ? 'Sí' : 'No'}`)
  if (client.training_notes) fields.push(`Notas de entrenamiento: ${client.training_notes}`)

  if (client.meals_per_day) fields.push(`Comidas al día: ${client.meals_per_day}`)
  if (client.first_meal_time) fields.push(`Hora de primera comida: ${client.first_meal_time}`)
  if (client.dinner_time) fields.push(`Hora de cena/última comida: ${client.dinner_time}`)
  if (client.night_hunger != null) fields.push(`Hambre/ansiedad por las noches: ${client.night_hunger ? 'Sí' : 'No'}`)
  if (client.coffee_intake) fields.push(`Café: ${client.coffee_intake}`)
  if (client.food_intolerances) fields.push(`Intolerancias/alergias: ${client.food_intolerances}`)

  if (client.energy_level_initial != null) fields.push(`Nivel de energía al despertar (1-10): ${client.energy_level_initial}`)
  if (client.energy_dips) fields.push(`Bajones de energía: ${client.energy_dips}`)
  if (client.goals) fields.push(`Objetivo principal: ${client.goals}`)
  if (client.onboarding_notes) fields.push(`Notas adicionales: ${client.onboarding_notes}`)

  return fields.join('\n')
}

export async function generateRoutine(client: Client): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new ApiKeyMissingError()
  }

  try {
    const anthropic = new Anthropic({ apiKey })
    const clientData = buildClientDataPrompt(client)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Genera la rutina diaria optimizada para este cliente:\n\n${clientData}`,
        },
      ],
    })

    const result = message.content[0]
    if (result.type === 'text' && result.text.trim()) {
      log.info('Routine generated successfully', {
        clientName: `${client.first_name} ${client.last_name}`,
        length: result.text.length,
      })
      return result.text.trim()
    }

    throw new Error('La AI no generó contenido de rutina')
  } catch (error) {
    if (error instanceof ApiKeyMissingError) throw error
    if (error instanceof AnthropicApiError) throw error

    // Translate Anthropic SDK errors to user-friendly messages
    if (error instanceof Anthropic.APIError) {
      const status = error.status
      log.error('Anthropic API error generating routine', {
        status,
        message: error.message,
        clientName: `${client.first_name} ${client.last_name}`,
      })
      if (status === 401) {
        throw new AnthropicApiError('La API key de Anthropic es inválida o ha expirado. Revísala en Vercel → Settings → Environment Variables.', status)
      }
      if (status === 429) {
        throw new AnthropicApiError('Demasiadas solicitudes a Anthropic. Espera unos minutos.', status)
      }
      throw new AnthropicApiError(`Error de Anthropic (${status}): ${error.message}`, status)
    }

    log.error('Failed to generate routine', {
      error: (error as Error).message,
      clientName: `${client.first_name} ${client.last_name}`,
    })
    throw error
  }
}
