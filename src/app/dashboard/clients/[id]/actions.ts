'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function completeCoachActions(callId: string) {
  const supabase = await createClient()

  // Use .select() to verify the update actually affected a row
  const { data, error } = await supabase
    .from('calls')
    .update({ coach_actions_completed: true })
    .eq('id', callId)
    .select('id, coach_actions_completed')

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  revalidatePath('/dashboard/clients', 'layout')
  revalidatePath('/dashboard', 'layout')

  return {
    success: true,
    data,
    rowsUpdated: data?.length ?? 0,
  }
}
