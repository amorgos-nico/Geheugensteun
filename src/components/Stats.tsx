interface Props {
  total: number
  de: number
  het: number
}

export function Stats({ total, de, het }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2 mb-5">
      <div className="rounded-[10px] px-3 py-2.5 bg-paper-sunk dark:bg-night-sunk">
        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">Total</div>
        <div className="text-[22px] font-semibold">{total}</div>
      </div>
      <div className="rounded-[10px] px-3 py-2.5 bg-de-bg">
        <div className="text-xs text-de-label mb-0.5">de</div>
        <div className="text-[22px] font-semibold text-de-ink">{de}</div>
      </div>
      <div className="rounded-[10px] px-3 py-2.5 bg-het-bg">
        <div className="text-xs text-het-label mb-0.5">het</div>
        <div className="text-[22px] font-semibold text-het-ink">{het}</div>
      </div>
    </div>
  )
}
