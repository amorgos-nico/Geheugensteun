import { useMemo, useState } from 'react'
import { WordForm } from './WordForm'
import { SearchFilter } from './SearchFilter'
import { Stats } from './Stats'
import { WordList } from './WordList'
import type { Article, FilterValue, Word } from '../types'

interface Props {
  words: Word[]
  onAdd: (word: string, translation: string, article: Article) => void
  onDelete: (id: string) => void
}

export function WordsView({ words, onAdd, onDelete }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterValue>('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return words.filter((w) => {
      if (filter !== 'all' && w.article !== filter) return false
      if (!q) return true
      return (w.word + ' ' + w.translation).toLowerCase().includes(q)
    })
  }, [words, search, filter])

  const counts = useMemo(() => {
    let de = 0
    let het = 0
    for (const w of words) {
      if (w.article === 'de') de++
      else het++
    }
    return { total: words.length, de, het }
  }, [words])

  return (
    <>
      <h1 className="text-2xl font-semibold mb-1">Nico's geheugensteun</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
        Dutch de/het word tracker
      </p>

      <WordForm onAdd={onAdd} />

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
      />

      <Stats total={counts.total} de={counts.de} het={counts.het} />

      <WordList words={filtered} totalStored={words.length} onDelete={onDelete} />

      <div className="mt-6 px-3.5 py-3 rounded-[10px] bg-black/[0.03] dark:bg-white/[0.05] text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
        <strong className="font-semibold">Tip:</strong> all diminutives (words ending
        in -je, -tje, -pje) are always "het" — het huisje, het kopje, het meisje.
      </div>
    </>
  )
}
