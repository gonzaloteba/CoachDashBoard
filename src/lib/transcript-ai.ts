import Anthropic from '@anthropic-ai/sdk'
import { logger } from '@/lib/logger'

const log = logger('transcript:ai')

/** Error thrown when ANTHROPIC_API_KEY is not configured */
export class ApiKeyMissingError extends Error {
  constructor() {
    super('ANTHROPIC_API_KEY no está configurada en las variables de entorno de Vercel')
    this.name = 'ApiKeyMissingError'
  }
}

/** Error thrown when the Anthropic API call fails (auth, credits, rate limit, etc.) */
export class AnthropicApiError extends Error {
  public statusCode?: number
  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = 'AnthropicApiError'
    this.statusCode = statusCode
  }
}

/**
 * Translates Anthropic SDK errors into user-friendly Spanish messages.
 */
function translateAnthropicError(error: unknown): AnthropicApiError {
  if (error instanceof Anthropic.APIError) {
    const status = error.status
    if (status === 401) {
      return new AnthropicApiError('La API key de Anthropic es inválida o ha expirado. Revísala en Vercel → Settings → Environment Variables.', status)
    }
    if (status === 403) {
      return new AnthropicApiError('La API key de Anthropic no tiene permisos suficientes.', status)
    }
    if (status === 429) {
      return new AnthropicApiError('Demasiadas solicitudes a la API de Anthropic. Espera unos minutos e intenta de nuevo.', status)
    }
    if (status === 400) {
      const msg = error.message || ''
      if (msg.includes('credit') || msg.includes('billing')) {
        return new AnthropicApiError('Sin créditos en Anthropic. Recarga en console.anthropic.com/settings/billing.', status)
      }
      return new AnthropicApiError(`Error de la API de Anthropic: ${msg}`, status)
    }
    if (status === 529 || status === 500) {
      return new AnthropicApiError('La API de Anthropic está temporalmente sobrecargada. Reintenta en unos minutos.', status)
    }
    // Generic API error with real message
    return new AnthropicApiError(`Error de Anthropic (${status}): ${error.message}`, status)
  }
  // Unknown error
  const message = error instanceof Error ? error.message : String(error)
  return new AnthropicApiError(`Error inesperado al llamar a Anthropic: ${message}`)
}

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new ApiKeyMissingError()
  }
  return new Anthropic({ apiKey })
}

/**
 * Generate a brief summary of a coaching call transcript.
 * The summary gives the coach quick context about what was discussed,
 * so the client feels remembered on the next call.
 */
export async function generateTranscriptSummary(
  transcript: string,
  clientName?: string
): Promise<string | null> {
  const client = getAnthropicClient()

  try {
    const clientContext = clientName
      ? `El cliente se llama ${clientName}.`
      : 'No se conoce el nombre del cliente.'

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Eres un asistente para un coach de salud y nutrición. Genera un resumen breve y útil de la siguiente llamada de coaching.

${clientContext}

Reglas:
- El resumen debe ser de 3-5 líneas máximo
- Incluye los temas principales discutidos, decisiones tomadas y compromisos del cliente
- Escribe en tercera persona (ej: "Se revisó...", "Se acordó...")
- El objetivo es que el coach tenga contexto rápido para la próxima llamada
- No incluyas saludos ni despedidas de la llamada
- Sé conciso y directo
- Responde SOLO con el resumen, sin títulos ni introducción

Transcript:
${transcript.substring(0, 15000)}`,
        },
      ],
    })

    const result = message.content[0]
    if (result.type === 'text' && result.text.trim()) {
      log.info('Transcript summary generated successfully', {
        clientName,
        summaryLength: result.text.length,
      })
      return result.text.trim()
    }

    return null
  } catch (error) {
    if (error instanceof ApiKeyMissingError) throw error
    log.error('Failed to generate transcript summary', {
      error: (error as Error).message,
      clientName,
    })
    throw translateAnthropicError(error)
  }
}

/**
 * Extract positive highlights from a coaching call transcript.
 * These are things the client is doing well, positive progress, or wins
 * that the coach can mention when following up via WhatsApp.
 */
export async function generatePositiveHighlights(
  transcript: string,
  clientName?: string
): Promise<string | null> {
  const client = getAnthropicClient()

  try {
    const clientContext = clientName
      ? `El cliente se llama ${clientName}.`
      : 'No se conoce el nombre del cliente.'

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Eres un asistente para un coach de salud y nutrición. Analiza la siguiente llamada de coaching y extrae las COSAS POSITIVAS que se mencionaron sobre el progreso del cliente.

${clientContext}

Reglas:
- Extrae solo logros, avances, mejoras, buenos hábitos o cualquier cosa positiva que el cliente esté haciendo bien
- Formato: una cosa positiva por línea, empezando con "✓"
- Ejemplos: bajó de peso, mejoró su energía, cumplió el plan alimenticio, entrenó consistentemente, mejoró su sueño, etc.
- Si no hay cosas positivas claras, escribe "✓ Sesión de seguimiento general — sin logros específicos mencionados"
- Sé conciso y específico, máximo 5 puntos
- El objetivo es que el coach pueda mencionar estas cosas positivas cuando haga seguimiento por WhatsApp para motivar al cliente
- Responde SOLO con la lista de cosas positivas, sin introducción ni explicación

Transcript:
${transcript.substring(0, 15000)}`,
        },
      ],
    })

    const result = message.content[0]
    if (result.type === 'text' && result.text.trim()) {
      log.info('Positive highlights generated successfully', {
        clientName,
        highlightsLength: result.text.length,
      })
      return result.text.trim()
    }

    return null
  } catch (error) {
    if (error instanceof ApiKeyMissingError) throw error
    log.error('Failed to generate positive highlights', {
      error: (error as Error).message,
      clientName,
    })
    throw translateAnthropicError(error)
  }
}

/**
 * Analyze a coaching call transcript and extract actionable items for the coach.
 * Returns a string with the coach actions, or null if analysis fails.
 */
export async function generateCoachActions(
  transcript: string,
  clientName?: string
): Promise<string | null> {
  const client = getAnthropicClient()

  try {
    const clientContext = clientName
      ? `El cliente se llama ${clientName}.`
      : 'No se conoce el nombre del cliente.'

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Eres un asistente para un coach de salud y nutrición. Analiza el siguiente transcript de una llamada de coaching y extrae las acciones concretas que el coach debe tomar después de la llamada.

${clientContext}

Reglas:
- Lista solo acciones concretas y accionables para el coach (NO para el cliente)
- Formato: una acción por línea, empezando con "•"
- Ejemplos de acciones: enviar plan de alimentación, ajustar macros, programar siguiente llamada, enviar recetas, revisar progreso de peso, etc.
- Si no hay acciones claras, escribe "• Sin acciones pendientes"
- Sé conciso, máximo 5 acciones
- Responde SOLO con la lista de acciones, sin introducción ni explicación

Transcript:
${transcript.substring(0, 15000)}`,
        },
      ],
    })

    const result = message.content[0]
    if (result.type === 'text' && result.text.trim()) {
      log.info('Coach actions generated successfully', {
        clientName,
        actionsLength: result.text.length,
      })
      return result.text.trim()
    }

    return null
  } catch (error) {
    if (error instanceof ApiKeyMissingError) throw error
    log.error('Failed to generate coach actions', {
      error: (error as Error).message,
      clientName,
    })
    throw translateAnthropicError(error)
  }
}
