import { useEffect, useState } from 'react'

interface Props {
  message: string
  onDismiss: () => void
}

export function Cheer({ message, onDismiss }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const showIn = requestAnimationFrame(() => setVisible(true))
    const hide = setTimeout(() => setVisible(false), 2000)
    const remove = setTimeout(onDismiss, 2400)
    return () => {
      cancelAnimationFrame(showIn)
      clearTimeout(hide)
      clearTimeout(remove)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      aria-live="polite"
    >
      <div
        className={`px-4 py-2 rounded-full text-white font-medium text-sm shadow-lg transition-all duration-300 bg-emerald-500 dark:bg-emerald-600 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
        }`}
      >
        {message}
      </div>
    </div>
  )
}
