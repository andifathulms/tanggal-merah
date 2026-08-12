import { SATURDAY, SUNDAY, weekdayOf, type DayNumber, type Weekday } from './index'

/**
 * Invariant 10: work pattern is a first-class input. Never assume Saturday is
 * off — many Indonesians work a six-day week and every long-weekend
 * calculation changes if they do (PRD §5.3).
 */
export type WorkPattern = 'lima-hari' | 'enam-hari'

export const WORK_PATTERNS: readonly WorkPattern[] = ['lima-hari', 'enam-hari']

/** Days of the week that are not worked under this pattern. */
export function akhirPekanOf(pattern: WorkPattern): readonly Weekday[] {
  switch (pattern) {
    case 'lima-hari':
      return [SUNDAY, SATURDAY]
    case 'enam-hari':
      return [SUNDAY]
    default:
      return exhaustive(pattern)
  }
}

export function isAkhirPekan(dayNumber: DayNumber, pattern: WorkPattern): boolean {
  return akhirPekanOf(pattern).includes(weekdayOf(dayNumber))
}

function exhaustive(value: never): never {
  throw new Error(`Pola kerja tidak dikenal: ${String(value)}`)
}
