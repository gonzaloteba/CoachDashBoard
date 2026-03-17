import { differenceInDays } from 'date-fns'
import type { HealthScore } from './types'

export function calculateHealthScore(unresolvedAlertCount: number): HealthScore {
  return unresolvedAlertCount > 0 ? 'red' : 'green'
}

export function getDaysRemaining(endDate: string): number {
  return Math.max(0, differenceInDays(new Date(endDate), new Date()))
}
