import type { TabKey } from '../types'

interface Props {
  active: TabKey
  onChange: (tab: TabKey) => void
}

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'words', label: 'Words', icon: '📒' },
  { key: 'stats', label: 'Stats', icon: '📊' },
  { key: 'story', label: 'Story', icon: '✨' },
  { key: 'game', label: 'Sail', icon: '⛵' },
]

export function TabBar({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-paper/90 dark:bg-night/90 backdrop-blur border-t border-[#e0ddd0] dark:border-night-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-[600px] mx-auto flex">
        {TABS.map((t) => {
          const isActive = active === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={`flex-1 py-2.5 px-2 flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-neutral-900 dark:text-neutral-100'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
              aria-pressed={isActive}
              aria-label={t.label}
            >
              <span
                className={`text-lg leading-none transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-50'
                }`}
                aria-hidden
              >
                {t.icon}
              </span>
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
