import type { AdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

const log = logger('call-alerts')

/**
 * Parse coach_actions text (bullet points starting with "•") into individual items.
 */
function parseCoachActions(coachActions: string): string[] {
  return coachActions
    .split('\n')
    .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
    .filter(line => line.length > 0 && !line.toLowerCase().includes('sin acciones pendientes'))
}

/**
 * After AI generates coach_actions from a call transcript,
 * create corresponding alerts so the coach sees them in their alert feed.
 *
 * Skips creation if alerts of type 'call_followup' already exist for this call.
 */
export async function createAlertsFromCoachActions(
  supabase: AdminClient,
  clientId: string,
  callId: string,
  coachActions: string,
  clientName?: string
): Promise<number> {
  if (!coachActions || !clientId) return 0

  const items = parseCoachActions(coachActions)
  if (items.length === 0) return 0

  // Check if we already created alerts for this call (avoid duplicates)
  const { data: existing } = await supabase
    .from('alerts')
    .select('id')
    .eq('client_id', clientId)
    .eq('type', 'call_followup')
    .like('message', `%[call:${callId}]%`)
    .limit(1)

  if (existing && existing.length > 0) {
    log.info('Alerts already exist for this call, skipping', { callId, clientId })
    return 0
  }

  const displayName = clientName || 'Cliente'

  const alerts = items.map(item => ({
    client_id: clientId,
    type: 'call_followup',
    severity: 'medium',
    message: `${displayName}: ${item} [call:${callId}]`,
  }))

  const { error } = await supabase.from('alerts').insert(alerts)
  if (error) {
    log.error('Failed to create call followup alerts', { callId, clientId, error: error.message })
    return 0
  }

  log.info('Created call followup alerts', { callId, clientId, count: alerts.length })
  return alerts.length
}
