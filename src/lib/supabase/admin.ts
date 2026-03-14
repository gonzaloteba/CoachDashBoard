import { createClient } from '@supabase/supabase-js'

/** Supabase admin client using service role key (bypasses RLS) */
export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type AdminClient = ReturnType<typeof getAdminClient>
