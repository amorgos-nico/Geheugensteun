import { useEffect, useState } from 'react'

interface Props {
  src: string
  count: number
  onDismiss: () => void
}

const MESSAGES = [
  'Kus van Nico',
  'Trots op je',
  'Knap gedaan, schat',
  'Blijf zo doorgaan',
  'Je bent geweldig',
]

export function PhotoMilestone({ src, count, onDismiss }: Props) {
  const [visible, setVisible] = useState(false)
  const [message] = useState(
    () => MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
  )

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-5 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onDismiss}
      role="dialog"
      aria-label="Milestone reached"
    >
      <div
        className={`max-w-[420px] w-full flex flex-col items-center gap-4 transition-transform duration-300 ${
          visible ? 'scale-100' : 'scale-95'
        }`}
      >
        <div className="text-white text-center">
          <div className="text-[40px] font-semibold leading-none">{count}</div>
          <div className="text-sm opacity-80 mt-1">
            {count === 1 ? 'word learned' : 'words learned'}
          </div>
        </div>
        <img
          src={src}
          alt="A message from Nico"
          className="w-full rounded-2xl shadow-2xl object-cover max-h-[60vh]"
          draggable={false}
        />
        <div className="text-white text-center">
          <div className="text-lg font-medium">{message}</div>
          <div className="text-xs opacity-60 mt-2">Tap to close</div>
        </div>
      </div>
    </div>
  )
}
