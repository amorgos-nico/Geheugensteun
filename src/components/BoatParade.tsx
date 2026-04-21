import { useEffect, useState } from 'react'

interface Props {
  count: number
  onDismiss: () => void
}

const SAIL_DURATION_MS = 7000

export function BoatParade({ count, onDismiss }: Props) {
  const [bannerVisible, setBannerVisible] = useState(false)

  useEffect(() => {
    const show = requestAnimationFrame(() => setBannerVisible(true))
    const hideBanner = setTimeout(() => setBannerVisible(false), SAIL_DURATION_MS - 600)
    const done = setTimeout(onDismiss, SAIL_DURATION_MS)
    return () => {
      cancelAnimationFrame(show)
      clearTimeout(hideBanner)
      clearTimeout(done)
    }
  }, [onDismiss])

  return (
    <div
      className="fixed inset-x-0 z-[55] pointer-events-none"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 92px)' }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes boatParadeSail {
          from { transform: translateX(110vw); }
          to   { transform: translateX(-220px); }
        }
        @keyframes boatParadeBob {
          0%, 100% { transform: translateY(0) rotate(-1.5deg); }
          50%     { transform: translateY(-4px) rotate(1.5deg); }
        }
        @keyframes boatParadeDance {
          0%, 100% { transform: translateY(0); }
          50%     { transform: translateY(-2px); }
        }
      `}</style>

      <div
        className={`flex justify-center mb-3 transition-opacity duration-500 ${
          bannerVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="px-4 py-2 rounded-full bg-amber-500 dark:bg-amber-600 text-white text-sm font-semibold shadow-lg">
          {count} woorden! 🎉 Feest op het water!
        </div>
      </div>

      <div
        className="will-change-transform"
        style={{ animation: `boatParadeSail ${SAIL_DURATION_MS}ms linear forwards` }}
      >
        <div
          className="w-[200px]"
          style={{ animation: 'boatParadeBob 1.6s ease-in-out infinite' }}
        >
          <svg viewBox="0 0 200 130" width="200" height="130">
            <path
              d="M0,104 Q15,101 30,104 T60,104 T90,104 T120,104 T150,104 T180,104 T200,104"
              stroke="rgba(59,130,246,0.55)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M10,108 Q25,105 40,108 T70,108 T100,108 T130,108 T160,108 T190,108"
              stroke="rgba(59,130,246,0.35)"
              strokeWidth="1.5"
              fill="none"
            />

            <rect x="98" y="28" width="4" height="58" fill="#5a3a1c" />
            <path d="M102,28 L134,34 L102,40 Z" fill="#ef4444" />

            <g style={{ animation: 'boatParadeDance 0.7s ease-in-out infinite' }}>
              <circle cx="70" cy="72" r="5" fill="#fde68a" stroke="#1f2937" strokeWidth="1" />
              <path
                d="M70,77 L70,85 M70,78 L63,70 M70,78 L77,70 M70,85 L65,93 M70,85 L75,93"
                stroke="#1f2937"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            </g>
            <g style={{ animation: 'boatParadeDance 0.55s ease-in-out infinite', animationDelay: '0.15s' }}>
              <circle cx="100" cy="68" r="5.5" fill="#fecaca" stroke="#1f2937" strokeWidth="1" />
              <path
                d="M100,74 L100,86 M100,75 L92,66 M100,75 L108,66 M100,86 L94,95 M100,86 L106,95"
                stroke="#1f2937"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            </g>
            <g style={{ animation: 'boatParadeDance 0.65s ease-in-out infinite', animationDelay: '0.3s' }}>
              <circle cx="130" cy="72" r="5" fill="#bfdbfe" stroke="#1f2937" strokeWidth="1" />
              <path
                d="M130,77 L130,85 M130,78 L123,70 M130,78 L137,70 M130,85 L125,93 M130,85 L135,93"
                stroke="#1f2937"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            <path d="M38,92 L162,92 L150,108 L50,108 Z" fill="#8b5a2b" />
            <path d="M38,92 L162,92" stroke="#3f2713" strokeWidth="1.2" />
            <rect x="54" y="84" width="92" height="9" fill="#c08457" />
            <rect x="54" y="84" width="92" height="2" fill="#a06a3c" />

            <circle cx="55" cy="50" r="2" fill="#ef4444" />
            <circle cx="75" cy="40" r="2" fill="#3b82f6" />
            <circle cx="120" cy="45" r="2" fill="#10b981" />
            <circle cx="145" cy="55" r="2" fill="#f59e0b" />
            <circle cx="90" cy="32" r="2" fill="#ec4899" />
            <circle cx="60" cy="28" r="2" fill="#8b5cf6" />
            <circle cx="140" cy="24" r="2" fill="#14b8a6" />
            <circle cx="165" cy="38" r="2" fill="#f43f5e" />
            <circle cx="40" cy="42" r="2" fill="#eab308" />
          </svg>
        </div>
      </div>
    </div>
  )
}
