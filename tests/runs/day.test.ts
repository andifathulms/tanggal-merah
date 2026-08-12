import { describe, expect, it } from 'vitest'
import {
  civilOf,
  dayNumberOf,
  daysInMonth,
  daysInYear,
  daysOfYear,
  fromIsoDate,
  isLeapYear,
  toIsoDate,
  weekdayOf,
  type Month,
} from '@/lib/day'
import { akhirPekanOf, isAkhirPekan } from '@/lib/day/pattern'

describe('day numbers', () => {
  it('anchors the epoch on a Thursday', () => {
    expect(dayNumberOf(1970, 1, 1)).toBe(0)
    expect(weekdayOf(0)).toBe(4)
  })

  it('round-trips civil dates across four centuries', () => {
    for (let year = 1800; year <= 2200; year += 1) {
      for (let month = 1 as Month; month <= 12; month = (month + 1) as Month) {
        const last = daysInMonth(year, month)
        for (const day of [1, 15, last]) {
          const n = dayNumberOf(year, month, day)
          expect(civilOf(n)).toEqual({ year, month, day })
        }
      }
    }
  })

  it('advances exactly one day at a time through a leap year', () => {
    const days = daysOfYear(2024)
    expect(days).toHaveLength(366)
    for (let i = 1; i < days.length; i += 1) {
      expect(days[i]! - days[i - 1]!).toBe(1)
    }
    expect(toIsoDate(days[59]!)).toBe('2024-02-29')
  })

  it('cycles weekdays with period seven', () => {
    for (let n = -1000; n < 1000; n += 1) {
      expect(weekdayOf(n + 7)).toBe(weekdayOf(n))
      expect(weekdayOf(n)).toBeGreaterThanOrEqual(0)
      expect(weekdayOf(n)).toBeLessThanOrEqual(6)
    }
  })

  it('knows the length of a year without a calendar library', () => {
    expect(daysInYear(2025)).toBe(365)
    expect(daysInYear(2024)).toBe(366)
    expect(isLeapYear(1900)).toBe(false)
    expect(isLeapYear(2000)).toBe(true)
  })
})

describe('ISO dates', () => {
  it('round-trips', () => {
    expect(toIsoDate(fromIsoDate('2026-08-17'))).toBe('2026-08-17')
  })

  it('rejects dates that do not exist', () => {
    expect(() => fromIsoDate('2026-02-30')).toThrow()
    expect(() => fromIsoDate('2026-13-01')).toThrow()
    expect(() => fromIsoDate('17 Agustus 2026')).toThrow()
  })
})

describe('work patterns', () => {
  it('treats Saturday as worked on a six-day week', () => {
    const saturday = fromIsoDate('2026-08-15')
    expect(weekdayOf(saturday)).toBe(6)
    expect(isAkhirPekan(saturday, 'lima-hari')).toBe(true)
    expect(isAkhirPekan(saturday, 'enam-hari')).toBe(false)
  })

  it('never works Sunday under either pattern', () => {
    const sunday = fromIsoDate('2026-08-16')
    for (const pattern of ['lima-hari', 'enam-hari'] as const) {
      expect(akhirPekanOf(pattern)).toContain(0)
      expect(isAkhirPekan(sunday, pattern)).toBe(true)
    }
  })
})
