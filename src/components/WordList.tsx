import type { Word } from '../types'
import { WordItem } from './WordItem'

interface Props {
  words: Word[]
  totalStored: number
  onDelete: (id: string) => void
}

export function WordList({ words, totalStored, onDelete }: Props) {
  if (totalStored === 0) {
    return (
      <div className="text-center py-8 px-4 text-sm text-neutral-500 dark:text-neutral-400">
        No words yet. Add your first one above!
      </div>
    )
  }
  if (words.length === 0) {
    return (
      <div className="text-center py-8 px-4 text-sm text-neutral-500 dark:text-neutral-400">
        No matches.
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-1.5">
      {words.map((w) => (
        <WordItem key={w.id} word={w} onDelete={onDelete} />
      ))}
    </div>
  )
}
