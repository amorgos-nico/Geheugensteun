import { useEffect, useState } from 'react'

type CheerTone = 'cheer' | 'warn'

interface Props {
  message: string
  onDismiss: () => void
  tone?: CheerTone
}

export function Cheer({ message, onDismiss, tone = 'cheer' }: Props) {
  const [visible, setVisible] = useState(false)
  const duration = tone === 'warn' ? 2800 : 2000

  useEffect(() => {
    const showIn = requestAnimationFrame(() => setVisible(true))
    const hide = setTimeout(() => setVisible(false), duration)
    const remove = setTimeout(onDismiss, duration + 400)
    return () => {
      cancelAnimationFrame(showIn)
      clearTimeout(hide)
      clearTimeout(remove)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const bg =
    tone === 'warn'
      ? 'bg-amber-500 dark:bg-amber-600'
      : 'bg-emerald-500 dark:bg-emerald-600'

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      aria-live="polite"
    >
      <div
        className={`px-4 py-2 rounded-full text-white font-medium text-sm shadow-lg transition-all duration-300 ${bg} ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
        }`}
      >
        {message}
      </div>
    </div>
  )
}
