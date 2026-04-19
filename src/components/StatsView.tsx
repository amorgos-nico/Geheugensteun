import { useMemo } from 'react'
import type { Word } from '../types'
import { currentStreak, weekBuckets } from '../lib/stats'

interface Props {
  words: Word[]
}

export function StatsView({ words }: Props) {
  const totals = useMemo(() => {
    let de = 0
    let het = 0
    for (const w of words) {
      if (w.article === 'de') de++
      else het++
    }
    return { total: words.length, de, het }
  }, [words])

  const streak = useMemo(() => currentStreak(words), [words])
  const week = useMemo(() => weekBuckets(words), [words])
  const weekTotal = week.reduce((s, b) => s + b.count, 0)
  const weekMax = Math.max(1, ...week.map((b) => b.count))
  const hasDatedWords = words.some((w) => !!w.createdAt)

  return (
    <>
      <h1 className="text-2xl font-semibold mb-1">Stats</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
        Your progress so far
      </p>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="rounded-[10px] px-3 py-3 bg-paper-sunk dark:bg-night-sunk">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Total</div>
          <div className="text-[22px] font-semibold">{totals.total}</div>
        </div>
        <div className="rounded-[10px] px-3 py-3 bg-de-bg">
          <div className="text-xs text-de-label mb-0.5">de</div>
          <div className="text-[22px] font-semibold text-de-ink">{totals.de}</div>
        </div>
        <div className="rounded-[10px] px-3 py-3 bg-het-bg">
          <div className="text-xs text-het-label mb-0.5">het</div>
          <div className="text-[22px] font-semibold text-het-ink">{totals.het}</div>
        </div>
      </div>

      <div className="rounded-[10px] px-4 py-4 mb-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
        <div className="text-xs text-emerald-700 dark:text-emerald-300 mb-0.5">
          Current streak
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-[32px] font-semibold text-emerald-800 dark:text-emerald-200 leading-none">
            {streak}
          </div>
          <div className="text-sm text-emerald-700 dark:text-emerald-300">
            {streak === 1 ? 'day' : 'days'} in a row
          </div>
        </div>
        {streak === 0 && (
          <div className="text-[13px] text-emerald-700/80 dark:text-emerald-300/80 mt-2">
            Add a word today to start a streak.
          </div>
        )}
      </div>

      <div className="rounded-[10px] px-4 py-4 bg-paper-sunk dark:bg-night-sunk">
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-sm font-semibold">This week</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {weekTotal} {weekTotal === 1 ? 'word' : 'words'}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {week.map((b) => {
            const pct = (b.count / weekMax) * 100
            return (
              <div key={b.date} className="flex items-center gap-3">
                <div
                  className={`w-10 text-xs tabular-nums ${
                    b.isToday
                      ? 'font-semibold text-neutral-900 dark:text-neutral-100'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {b.label}
                </div>
                <div className="flex-1 h-5 rounded-full bg-white/60 dark:bg-black/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400 dark:bg-emerald-500 transition-[width] duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-6 text-right text-xs tabular-nums text-neutral-600 dark:text-neutral-400">
                  {b.count}
                </div>
              </div>
            )
          })}
        </div>
        {!hasDatedWords && words.length > 0 && (
          <div className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-3">
            Older words don't have a date. New ones you add from now on will show up here.
          </div>
        )}
      </div>
    </>
  )
}
