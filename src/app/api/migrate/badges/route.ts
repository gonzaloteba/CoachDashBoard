import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = getAdminClient()

  // Step 1: Check if columns already exist
  const { data, error: checkError } = await supabase
    .from('clients')
    .select('is_renewed')
    .limit(1)

  if (!checkError) {
    return NextResponse.json({ message: 'Columns already exist, no migration needed' })
  }

  // Step 2: Add columns using Supabase's rpc to execute raw SQL
  // We need to create a helper function first, then call it
  // Alternative: use the pg_net extension or direct REST calls

  // Since we can't run raw ALTER TABLE via PostgREST, we'll use a workaround:
  // Call the Supabase Management API SQL endpoint
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.match(/https:\/\/(.+)\.supabase\.co/)?.[1]

  if (!projectRef) {
    return NextResponse.json({ error: 'Could not determine project ref' }, { status: 500 })
  }

  const sql = `
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_renewed BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_success_case BOOLEAN NOT NULL DEFAULT false;
    UPDATE clients SET is_renewed = true, status = 'active' WHERE status = 'renewed';
    UPDATE clients SET is_success_case = true, status = 'active' WHERE status = 'success_case';
    ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;
    ALTER TABLE clients ADD CONSTRAINT clients_status_check CHECK (status IN ('active', 'cancelled', 'completed'));
  `

  // Try using Supabase's pg-meta endpoint (available on hosted Supabase)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  const pgRes = await fetch(`${baseUrl}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceKey}`,
      'apikey': serviceKey,
    },
    body: JSON.stringify({ query: sql }),
  })

  if (pgRes.ok) {
    return NextResponse.json({ success: true, method: 'pg-meta' })
  }

  // If pg-meta doesn't work, return the SQL for manual execution
  return NextResponse.json({
    error: 'Auto-migration failed. Please run this SQL in your Supabase SQL Editor:',
    sql,
  }, { status: 500 })
}
