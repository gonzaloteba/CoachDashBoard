import { createClient } from '@/lib/supabase/server'
import type { Coach } from '@/lib/types'

/**
 * Get the currently authenticated coach.
 * Returns the coach record (id, full_name, role) or null if not found.
 */
export async function getCurrentCoach(): Promise<Coach | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) return null

    const { data: coach, error: queryError } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', user.id)
      .single()

    if (queryError || !coach) return null

    return coach
  } catch {
    return null
  }
}

/**
 * Check if a coach has admin role.
 */
export function isAdmin(coach: Coach): boolean {
  return coach.role === 'admin'
}

/**
 * Get the default coach ID for auto-assigning new clients.
 * Uses DEFAULT_COACH_ID env var, or falls back to the first coach with role 'coach'.
 */
export async function getDefaultCoachId(): Promise<string | null> {
  if (process.env.DEFAULT_COACH_ID) return process.env.DEFAULT_COACH_ID
  try {
    const { getAdminClient } = await import('@/lib/supabase/admin')
    const supabase = getAdminClient()
    const { data } = await supabase
      .from('coaches')
      .select('id')
      .eq('role', 'coach')
      .order('created_at')
      .limit(1)
      .single()
    return data?.id ?? null
  } catch {
    return null
  }
}
