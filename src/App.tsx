import { useMemo, useState } from 'react'
import { WordForm } from './components/WordForm'
import { SearchFilter } from './components/SearchFilter'
import { Stats } from './components/Stats'
import { WordList } from './components/WordList'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { Article, FilterValue, Word } from './types'

const STORAGE_KEY = 'nicos-geheugensteun-words'

function newId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function App() {
  const [words, setWords] = useLocalStorage<Word[]>(STORAGE_KEY, [])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterValue>('all')

  const addWord = (word: string, translation: string, article: Article) => {
    setWords((prev) => [{ id: newId(), word, translation, article }, ...prev])
  }

  const deleteWord = (id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id))
  }

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
    <div className="max-w-[600px] mx-auto px-4 pt-5 pb-10">
      <h1 className="text-2xl font-semibold mb-1">Nico's geheugensteun</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
        Dutch de/het word tracker
      </p>

      <WordForm onAdd={addWord} />

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
      />

      <Stats total={counts.total} de={counts.de} het={counts.het} />

      <WordList words={filtered} totalStored={words.length} onDelete={deleteWord} />

      <div className="mt-6 px-3.5 py-3 rounded-[10px] bg-black/[0.03] dark:bg-white/[0.05] text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
        <strong className="font-semibold">Tip:</strong> all diminutives (words ending
        in -je, -tje, -pje) are always "het" — het huisje, het kopje, het meisje.
      </div>
    </div>
  )
}
