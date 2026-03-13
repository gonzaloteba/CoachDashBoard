import { differenceInDays, startOfMonth, isAfter } from 'date-fns'
import type { Client, CheckIn, Call, HealthScore } from './types'
import { CALLS_PER_MONTH, CHECKIN_GRACE_DAYS } from './constants'

export function calculateHealthScore(
  client: Client,
  lastCheckIn: CheckIn | null,
  callsThisMonth: number
): HealthScore {
  if (client.status !== 'active') return 'green'

  const now = new Date()
  let redFlags = 0
  let yellowFlags = 0

  // Check-in analysis
  if (lastCheckIn) {
    const daysSinceCheckIn = differenceInDays(now, new Date(lastCheckIn.submitted_at))
    if (daysSinceCheckIn > CHECKIN_GRACE_DAYS * 2) {
      redFlags++
    } else if (daysSinceCheckIn > CHECKIN_GRACE_DAYS) {
      yellowFlags++
    }
  } else {
    // No check-ins at all, check if client started more than 8 days ago
    const daysSinceStart = differenceInDays(now, new Date(client.start_date))
    if (daysSinceStart > CHECKIN_GRACE_DAYS) {
      redFlags++
    }
  }

  // Calls analysis
  const monthStart = startOfMonth(now)
  const dayOfMonth = now.getDate()
  // Expected calls so far: roughly 1 per week for the first 3 weeks
  const weeksInMonth = Math.min(Math.floor(dayOfMonth / 7), 3)
  if (weeksInMonth > 0 && callsThisMonth === 0) {
    redFlags++
  } else if (weeksInMonth > callsThisMonth) {
    yellowFlags++
  }

  // Onboarding check (only if within first 3 days)
  const daysSinceStart = differenceInDays(now, new Date(client.start_date))
  if (daysSinceStart > 3) {
    const onboardingComplete =
      client.onboarding_trainingpeaks &&
      client.onboarding_whatsapp_group &&
      client.onboarding_community_group
    if (!onboardingComplete) {
      redFlags++
    }
  }

  if (redFlags > 0) return 'red'
  if (yellowFlags > 0) return 'yellow'
  return 'green'
}

export function getDaysRemaining(endDate: string): number {
  return Math.max(0, differenceInDays(new Date(endDate), new Date()))
}
