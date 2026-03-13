import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for webhook inserts (bypasses RLS)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  // Verify webhook secret
  const secret = request.headers.get('x-typeform-secret')
  if (secret !== process.env.TYPEFORM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await request.json()
    const formResponse = payload.form_response

    if (!formResponse) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const answers = formResponse.answers || []
    const responseId = formResponse.token
    const submittedAt = formResponse.submitted_at

    // Extract hidden fields to identify the client
    // The Typeform should include a hidden field 'client_id'
    const hiddenFields = formResponse.hidden || {}
    const clientId = hiddenFields.client_id

    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing client_id in hidden fields' },
        { status: 400 }
      )
    }

    // Map answers by field ref
    const answerMap = new Map<string, unknown>()
    for (const answer of answers) {
      const ref = answer.field?.ref
      if (ref) {
        // Extract value based on answer type
        let value: unknown
        switch (answer.type) {
          case 'number':
            value = answer.number
            break
          case 'text':
            value = answer.text
            break
          case 'boolean':
            value = answer.boolean
            break
          case 'choice':
            value = answer.choice?.label
            break
          default:
            value = answer[answer.type]
        }
        answerMap.set(ref, value)
      }
    }

    // Build check-in data
    // These refs should match what's configured in your Typeform
    const checkInData = {
      client_id: clientId,
      submitted_at: submittedAt,
      typeform_response_id: responseId,
      weight: answerMap.get('weight') as number | undefined || null,
      body_fat_percentage: answerMap.get('body_fat') as number | undefined || null,
      waist_measurement: answerMap.get('waist') as number | undefined || null,
      energy_level: answerMap.get('energy') as number | undefined || null,
      sleep_quality: answerMap.get('sleep') as number | undefined || null,
      mood: answerMap.get('mood') as number | undefined || null,
      nutrition_adherence: answerMap.get('nutrition_adherence') as number | undefined || null,
      training_adherence: answerMap.get('training_adherence') as number | undefined || null,
      notes: answerMap.get('notes') as string | undefined || null,
    }

    const supabase = getAdminClient()

    // Insert check-in
    const { error: insertError } = await supabase
      .from('check_ins')
      .insert(checkInData)

    if (insertError) {
      console.error('Error inserting check-in:', insertError)
      return NextResponse.json(
        { error: 'Failed to insert check-in' },
        { status: 500 }
      )
    }

    // Resolve any existing missed_checkin alerts for this client
    await supabase
      .from('alerts')
      .update({ is_resolved: true, resolved_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .eq('type', 'missed_checkin')
      .eq('is_resolved', false)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
