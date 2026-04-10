import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/migrate/fix-calls-schema
 *
 * Diagnoses and reports missing columns in the calls table.
 * Shows which columns exist and which are missing.
 */
export async function GET() {
  const supabase = getAdminClient()
  const results: Record<string, string> = {}

  // Test each column by trying to select it
  const columns = [
    'transcript',
    'google_event_id',
    'meet_link',
    'coach_actions',
    'coach_actions_completed',
    'coach_actions_completed_items',
    'coach_id',
    'transcript_summary',
    'positive_highlights',
    'scheduled_at',
    'calendly_event_uri',
  ]

  for (const col of columns) {
    const { error } = await supabase
      .from('calls')
      .select(col)
      .limit(1)

    results[col] = error ? `MISSING - ${error.message}` : 'OK'
  }

  const missing = Object.entries(results)
    .filter(([, v]) => v.startsWith('MISSING'))
    .map(([k]) => k)

  return NextResponse.json({
    status: missing.length === 0 ? 'ALL_COLUMNS_EXIST' : 'MISSING_COLUMNS',
    columns: results,
    missing,
    fix: missing.length > 0
      ? 'Go to Supabase Dashboard → SQL Editor and run the SQL shown in fix_sql'
      : 'No fix needed',
    fix_sql: missing.length > 0
      ? missing.map(col => {
          if (col === 'coach_actions_completed_items')
            return `ALTER TABLE calls ADD COLUMN IF NOT EXISTS ${col} JSONB NOT NULL DEFAULT '[]'::jsonb;`
          if (col === 'coach_actions_completed')
            return `ALTER TABLE calls ADD COLUMN IF NOT EXISTS ${col} BOOLEAN DEFAULT false;`
          if (col === 'scheduled_at')
            return `ALTER TABLE calls ADD COLUMN IF NOT EXISTS ${col} TIMESTAMPTZ;`
          if (col === 'coach_id')
            return `ALTER TABLE calls ADD COLUMN IF NOT EXISTS ${col} UUID REFERENCES coaches(id);`
          return `ALTER TABLE calls ADD COLUMN IF NOT EXISTS ${col} TEXT;`
        }).join('\n')
      : null,
  })
}
