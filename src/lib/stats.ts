import type { Word } from '../types'

export function isoDay(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function datedDays(words: Word[]): Set<string> {
  const s = new Set<string>()
  for (const w of words) {
    if (!w.createdAt) continue
    const d = new Date(w.createdAt)
    if (Number.isNaN(d.getTime())) continue
    s.add(isoDay(d))
  }
  return s
}

export function currentStreak(words: Word[]): number {
  const days = datedDays(words)
  if (days.size === 0) return 0
  let streak = 0
  const cursor = new Date()
  while (days.has(isoDay(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export interface WeekBucket {
  date: string
  label: string
  count: number
  isToday: boolean
}

export function weekBuckets(words: Word[]): WeekBucket[] {
  const today = isoDay(new Date())
  const buckets: WeekBucket[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const date = isoDay(d)
    buckets.push({
      date,
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      count: 0,
      isToday: date === today,
    })
  }
  const map = new Map(buckets.map((b) => [b.date, b]))
  for (const w of words) {
    if (!w.createdAt) continue
    const d = new Date(w.createdAt)
    if (Number.isNaN(d.getTime())) continue
    const key = isoDay(d)
    const bucket = map.get(key)
    if (bucket) bucket.count++
  }
  return buckets
}
