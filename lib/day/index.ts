/**
 * Integer day model.
 *
 * Invariant 1: no `Date` objects in `lib/`. A day is an integer day number —
 * days since 1970-01-01 in the proleptic Gregorian calendar. No timezone, no
 * DST, no locale. The UI converts at the boundary.
 *
 * Invariant 2: nothing here reads the clock. Every function takes its year.
 *
 * Naming: a day *number* is `*Day`; a *count* of days is `*Days`. Never mix.
 */

/** Days since 1970-01-01. */
export type DayNumber = number

/** Sunday = 0 … Saturday = 6. The Indonesian wall calendar starts on Sunday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const SUNDAY: Weekday = 0
export const SATURDAY: Weekday = 6

/** 1 = January … 12 = December. */
export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type CivilDate = {
  readonly year: number
  readonly month: Month
  readonly day: number
}

/**
 * Howard Hinnant's days_from_civil. Exact integer arithmetic, valid for any
 * year in the proleptic Gregorian calendar.
 */
export function dayNumberOf(year: number, month: Month, day: number): DayNumber {
  const y = year - (month <= 2 ? 1 : 0)
  const era = Math.floor(y / 400)
  const yoe = y - era * 400 // [0, 399]
  const doy = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1 // [0, 365]
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy // [0, 146096]
  return era * 146097 + doe - 719468
}

/** Howard Hinnant's civil_from_days — the exact inverse of `dayNumberOf`. */
export function civilOf(dayNumber: DayNumber): CivilDate {
  const z = dayNumber + 719468
  const era = Math.floor(z / 146097)
  const doe = z - era * 146097 // [0, 146096]
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365)
  const y = yoe + era * 400
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100))
  const mp = Math.floor((5 * doy + 2) / 153) // [0, 11]
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1 // [1, 31]
  const month = (mp + (mp < 10 ? 3 : -9)) as Month
  return { year: y + (month <= 2 ? 1 : 0), month, day }
}

/** Epoch day 0 is 1970-01-01, a Thursday. */
export function weekdayOf(dayNumber: DayNumber): Weekday {
  return (((dayNumber + 4) % 7) + 7) % 7 as Weekday
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function daysInMonth(year: number, month: Month): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31
}

export function firstDayOfYear(year: number): DayNumber {
  return dayNumberOf(year, 1, 1)
}

export function lastDayOfYear(year: number): DayNumber {
  return dayNumberOf(year, 12, 31)
}

export function daysInYear(year: number): number {
  return lastDayOfYear(year) - firstDayOfYear(year) + 1
}

/** Every day number in the year, ascending. */
export function daysOfYear(year: number): readonly DayNumber[] {
  const first = firstDayOfYear(year)
  const last = lastDayOfYear(year)
  const out: DayNumber[] = []
  for (let d = first; d <= last; d += 1) out.push(d)
  return out
}

export function yearOf(dayNumber: DayNumber): number {
  return civilOf(dayNumber).year
}

/** `YYYY-MM-DD`, the form used in the SKB rule packs. */
export function toIsoDate(dayNumber: DayNumber): string {
  const { year, month, day } = civilOf(dayNumber)
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/** Parses `YYYY-MM-DD`. Throws on a malformed or non-existent date. */
export function fromIsoDate(iso: string): DayNumber {
  const match = ISO_DATE.exec(iso)
  if (match === null) throw new Error(`Tanggal tidak valid: ${iso} (harus YYYY-MM-DD)`)
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12) throw new Error(`Bulan tidak valid: ${iso}`)
  if (day < 1 || day > daysInMonth(year, month as Month)) throw new Error(`Hari tidak valid: ${iso}`)
  return dayNumberOf(year, month as Month, day)
}

function pad(value: number, width: number): string {
  return String(value).padStart(width, '0')
}
