import type { Word } from '../types'

interface Props {
  word: Word
  onDelete: (id: string) => void
}

export function WordItem({ word, onDelete }: Props) {
  const isDe = word.article === 'de'
  const wrap = isDe
    ? 'bg-de-bg border-de-border'
    : 'bg-het-bg border-het-border'
  const badge = isDe ? 'bg-de-accent' : 'bg-het-accent'
  const name = isDe ? 'text-de-ink' : 'text-het-ink'
  const trans = isDe ? 'text-de-ink-soft' : 'text-het-ink-soft'

  return (
    <div className={`flex items-center gap-3 border rounded-[10px] px-3 py-2.5 ${wrap}`}>
      <span
        className={`${badge} text-white text-xs font-semibold px-2.5 py-0.5 rounded-full min-w-[36px] text-center flex-shrink-0`}
      >
        {word.article}
      </span>
      <div className="flex-1 min-w-0">
        <div className={`text-base font-medium break-words ${name}`}>{word.word}</div>
        {word.translation && (
          <div className={`text-[13px] break-words ${trans}`}>{word.translation}</div>
        )}
      </div>
      <button
        type="button"
        aria-label={`Delete ${word.word}`}
        onClick={() => onDelete(word.id)}
        className="bg-transparent border-0 text-[22px] opacity-50 hover:opacity-100 px-2.5 py-1 cursor-pointer flex-shrink-0"
      >
        ×
      </button>
    </div>
  )
}
