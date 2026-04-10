import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { generateTranscriptSummary, generatePositiveHighlights, generateCoachActions, AnthropicApiError } from '@/lib/transcript-ai'
import { createAlertsFromCoachActions } from '@/lib/call-alerts'
import { logger } from '@/lib/logger'

export const maxDuration = 300

const log = logger('api:cron:regenerate-call-ai')

/**
 * POST /api/cron/regenerate-call-ai
 *
 * Finds calls that have a transcript but are missing AI-generated content
 * (summary, positive highlights, or coach actions) and regenerates them.
 * After generating coach_actions, auto-creates followup alerts.
 *
 * This is the safety net: if AI generation failed during the initial
 * webhook sync (e.g. API key was missing or transient error),
 * this cron picks up those calls and retries.
 *
 * Runs every 10 minutes via Vercel Cron.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      log.warn('ANTHROPIC_API_KEY not configured, skipping regeneration')
      return NextResponse.json({
        success: false,
        error: 'ANTHROPIC_API_KEY not configured',
      })
    }

    const supabase = getAdminClient()

    // Find ALL calls with transcript but missing summary OR positive highlights OR coach actions
    const { data: calls, error: fetchError } = await supabase
      .from('calls')
      .select('id, transcript, client_id')
      .not('transcript', 'is', null)
      .or('transcript_summary.is.null,positive_highlights.is.null,coach_actions.is.null')
      .order('call_date', { ascending: false })
      .limit(20)

    if (fetchError) {
      log.error('Failed to fetch calls needing AI regeneration', { error: fetchError.message })
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!calls || calls.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: 'No calls need regeneration' })
    }

    log.info(`Found ${calls.length} calls needing AI regeneration`)

    let processed = 0
    let failed = 0
    let alertsCreated = 0

    for (const call of calls) {
      try {
        // Get client name for context
        let clientName: string | undefined
        if (call.client_id) {
          const { data: client } = await supabase
            .from('clients')
            .select('first_name, last_name')
            .eq('id', call.client_id)
            .single()
          if (client) {
            clientName = `${client.first_name} ${client.last_name || ''}`.trim()
          }
        }

        // Use Promise.allSettled so one failure doesn't block the others
        const [summaryResult, highlightsResult, actionsResult] = await Promise.allSettled([
          generateTranscriptSummary(call.transcript, clientName),
          generatePositiveHighlights(call.transcript, clientName),
          generateCoachActions(call.transcript, clientName),
        ])

        const summary = summaryResult.status === 'fulfilled' ? summaryResult.value : null
        const highlights = highlightsResult.status === 'fulfilled' ? highlightsResult.value : null
        const actions = actionsResult.status === 'fulfilled' ? actionsResult.value : null

        // Log any failures with the real error message
        for (const [name, result] of [['summary', summaryResult], ['highlights', highlightsResult], ['actions', actionsResult]] as const) {
          if (result.status === 'rejected') {
            const errMsg = result.reason instanceof AnthropicApiError ? result.reason.message : (result.reason as Error).message
            log.error(`AI ${name} generation failed`, { callId: call.id, error: errMsg })
          }
        }

        const updates: Record<string, unknown> = {}
        if (summary) updates.transcript_summary = summary
        if (highlights) updates.positive_highlights = highlights
        if (actions) {
          updates.coach_actions = actions
          updates.coach_actions_completed = false
          updates.coach_actions_completed_items = []
        }

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('calls')
            .update(updates)
            .eq('id', call.id)

          if (updateError) {
            log.error('Failed to update call with AI content', { callId: call.id, error: updateError.message })
            failed++
          } else {
            log.info('Successfully regenerated AI content for call', { callId: call.id, clientName })
            processed++

            // Auto-create followup alerts from coach actions
            if (actions && call.client_id) {
              const count = await createAlertsFromCoachActions(supabase, call.client_id, call.id, actions, clientName)
              alertsCreated += count
            }
          }
        } else {
          log.warn('AI generation returned no content for call', { callId: call.id })
          failed++
        }
      } catch (err) {
        log.error('Error processing call for AI regeneration', { callId: call.id, error: (err as Error).message })
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      failed,
      alerts_created: alertsCreated,
      total: calls.length,
    })
  } catch (error) {
    log.error('Cron regenerate-call-ai failed', { error: (error as Error).message })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
