import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getDefaultCoachId } from '@/lib/auth'
import { findClientByName } from '@/lib/typeform-helpers'
import { generateCoachActions } from '@/lib/transcript-ai'

/**
 * POST /api/webhooks/google-transcript
 *
 * Receives call transcripts from a Google App Script that uses Gemini
 * to transcribe Google Meet recordings.
 *
 * Auth: Bearer token via GOOGLE_SCRIPT_SECRET env var.
 *
 * Body (JSON):
 *   - google_event_id: string (required) — Google Calendar event ID for dedup
 *   - meet_link: string (optional) — Google Meet URL
 *   - transcript: string (required) — Full transcript text
 *   - call_date: string (optional) — ISO date (YYYY-MM-DD), defaults to today
 *   - duration_minutes: number (optional) — Call duration, defaults to 15
 *   - client_first_name: string (optional) — To auto-match client
 *   - client_last_name: string (optional) — To auto-match client
 *   - client_id: string (optional) — Direct client UUID if known
 *   - notes: string (optional) — Additional notes
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate with bearer token
    const secret = process.env.GOOGLE_SCRIPT_SECRET
    if (!secret) {
      return NextResponse.json(
        { error: 'GOOGLE_SCRIPT_SECRET not configured' },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    const { google_event_id, transcript } = body
    if (!google_event_id || typeof google_event_id !== 'string') {
      return NextResponse.json(
        { error: 'google_event_id is required' },
        { status: 400 }
      )
    }
    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'transcript is required' },
        { status: 400 }
      )
    }
    if (transcript.length > 50000) {
      return NextResponse.json(
        { error: 'transcript exceeds 50KB limit' },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    // Check for existing call with this google_event_id (dedup)
    const { data: existingCall } = await supabase
      .from('calls')
      .select('id')
      .eq('google_event_id', google_event_id)
      .limit(1)
      .single()

    if (existingCall) {
      // Generate coach actions from updated transcript
      const clientNameForUpdate = body.client_first_name
        ? `${body.client_first_name} ${body.client_last_name || ''}`.trim()
        : undefined
      const updatedActions = await generateCoachActions(transcript, clientNameForUpdate)

      // Update transcript on existing call
      const { error: updateError } = await supabase
        .from('calls')
        .update({
          transcript,
          ...(body.meet_link ? { meet_link: body.meet_link } : {}),
          ...(body.notes ? { notes: body.notes } : {}),
          ...(updatedActions ? { coach_actions: updatedActions, coach_actions_completed: false } : {}),
        })
        .eq('id', existingCall.id)

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update call', detail: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        action: 'transcript_updated',
        call_id: existingCall.id,
        coach_actions_generated: !!updatedActions,
      })
    }

    // No existing call — create a new one
    // Resolve client_id
    let clientId: string | null = body.client_id || null

    if (!clientId && body.client_first_name && body.client_last_name) {
      const client = await findClientByName(
        supabase,
        body.client_first_name,
        body.client_last_name
      )
      if (client) clientId = client.id
    }

    // Resolve coach
    const coachId = await getDefaultCoachId()

    const callDate = body.call_date || new Date().toISOString().split('T')[0]
    const durationMinutes = typeof body.duration_minutes === 'number'
      ? body.duration_minutes
      : 15

    const insertData: Record<string, unknown> = {
      google_event_id,
      transcript,
      call_date: callDate,
      duration_minutes: durationMinutes,
      coach_id: coachId,
    }
    if (clientId) insertData.client_id = clientId
    if (body.meet_link) insertData.meet_link = body.meet_link
    if (body.notes) insertData.notes = body.notes

    const { data: newCall, error: insertError } = await supabase
      .from('calls')
      .insert(insertData)
      .select('id')
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create call', detail: insertError.message },
        { status: 500 }
      )
    }

    // Generate coach actions from transcript using AI (non-blocking for response)
    const clientName = body.client_first_name
      ? `${body.client_first_name} ${body.client_last_name || ''}`.trim()
      : undefined
    const coachActions = await generateCoachActions(transcript, clientName)
    if (coachActions) {
      await supabase
        .from('calls')
        .update({ coach_actions: coachActions })
        .eq('id', newCall.id)
    }

    return NextResponse.json({
      success: true,
      action: clientId ? 'call_created' : 'call_created_no_client',
      call_id: newCall.id,
      client_id: clientId,
      coach_actions_generated: !!coachActions,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', detail: (error as Error).message },
      { status: 500 }
    )
  }
}
