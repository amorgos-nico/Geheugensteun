import { useCallback, useEffect, useRef, useState } from 'react'
import { Cheer } from './components/Cheer'
import { TabBar } from './components/TabBar'
import { WordsView } from './components/WordsView'
import { StatsView } from './components/StatsView'
import { randomCheer } from './cheers'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { Article, TabKey, Word } from './types'

const STORAGE_KEY = 'nicos-geheugensteun-words'

function newId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function App() {
  const [words, setWords] = useLocalStorage<Word[]>(STORAGE_KEY, [])
  const [tab, setTab] = useState<TabKey>('words')
  const [cheer, setCheer] = useState<{ id: number; text: string } | null>(null)
  const lastCheerRef = useRef<string | undefined>(undefined)

  const dismissCheer = useCallback(() => setCheer(null), [])

  const addWord = (word: string, translation: string, article: Article) => {
    setWords((prev) => [
      { id: newId(), word, translation, article, createdAt: new Date().toISOString() },
      ...prev,
    ])
    const text = randomCheer(lastCheerRef.current)
    lastCheerRef.current = text
    setCheer({ id: Date.now(), text })
  }

  const deleteWord = (id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id))
  }

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [tab])

  return (
    <div className="max-w-[600px] mx-auto px-4 pt-5 pb-24">
      {cheer && <Cheer key={cheer.id} message={cheer.text} onDismiss={dismissCheer} />}
      {tab === 'words' ? (
        <WordsView words={words} onAdd={addWord} onDelete={deleteWord} />
      ) : (
        <StatsView words={words} />
      )}
      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}
