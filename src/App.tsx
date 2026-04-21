import { useCallback, useEffect, useRef, useState } from 'react'
import { BoatParade } from './components/BoatParade'
import { Cheer } from './components/Cheer'
import { PhotoMilestone } from './components/PhotoMilestone'
import { TabBar } from './components/TabBar'
import { WordsView } from './components/WordsView'
import { StatsView } from './components/StatsView'
import { StoryView } from './components/StoryView'
import { GameView } from './components/GameView'
import { randomCheer } from './cheers'
import { randomPhoto } from './photos'
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
  const [cheer, setCheer] = useState<
    { id: number; text: string; tone: 'cheer' | 'warn' } | null
  >(null)
  const [milestone, setMilestone] = useState<
    { id: number; photo: string; count: number } | null
  >(null)
  const [parade, setParade] = useState<{ id: number; count: number } | null>(null)
  const lastCheerRef = useRef<string | undefined>(undefined)
  const lastPhotoRef = useRef<string | undefined>(undefined)

  const dismissCheer = useCallback(() => setCheer(null), [])
  const dismissMilestone = useCallback(() => setMilestone(null), [])
  const dismissParade = useCallback(() => setParade(null), [])

  const addWord = (word: string, translation: string, article: Article) => {
    const key = word.trim().toLowerCase()
    const existing = words.find((w) => w.word.trim().toLowerCase() === key)
    if (existing) {
      const sameArticle = existing.article === article
      const options = sameArticle
        ? [
            `"${existing.word}" staat er al! 🙃`,
            `Déjà vu — "${existing.word}" is already in your list!`,
            `Dubbelop! Je had "${existing.word}" al. ⭐`,
            `"${existing.word}"? Die ken je al — goed onthouden! 🎉`,
          ]
        : [
            `"${existing.word}" staat er al als "${existing.article}"! 🤔`,
            `Already got "${existing.word}" as "${existing.article}" — delete the old one first? 🙃`,
            `"${existing.word}" is al in je lijstje (als ${existing.article}). ✨`,
          ]
      const text = options[Math.floor(Math.random() * options.length)]
      setCheer({ id: Date.now(), text, tone: 'warn' })
      return false
    }

    const nextCount = words.length + 1
    setWords((prev) => [
      { id: newId(), word, translation, article, createdAt: new Date().toISOString() },
      ...prev,
    ])

    if (nextCount > 0 && nextCount % 50 === 0) {
      setParade({ id: Date.now(), count: nextCount })
    } else if (nextCount > 0 && nextCount % 5 === 0) {
      const photo = randomPhoto(lastPhotoRef.current)
      lastPhotoRef.current = photo
      setMilestone({ id: Date.now(), photo, count: nextCount })
    } else {
      const text = randomCheer(lastCheerRef.current)
      lastCheerRef.current = text
      setCheer({ id: Date.now(), text, tone: 'cheer' })
    }
    return true
  }

  const deleteWord = (id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id))
  }

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [tab])

  return (
    <div className="max-w-[600px] mx-auto px-4 pt-5 pb-24">
      {cheer && (
        <Cheer
          key={cheer.id}
          message={cheer.text}
          tone={cheer.tone}
          onDismiss={dismissCheer}
        />
      )}
      {milestone && (
        <PhotoMilestone
          key={milestone.id}
          src={milestone.photo}
          count={milestone.count}
          onDismiss={dismissMilestone}
        />
      )}
      {parade && (
        <BoatParade key={parade.id} count={parade.count} onDismiss={dismissParade} />
      )}
      {tab === 'words' && <WordsView words={words} onAdd={addWord} onDelete={deleteWord} />}
      {tab === 'stats' && <StatsView words={words} />}
      {tab === 'story' && <StoryView words={words} />}
      {tab === 'game' && <GameView />}
      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}
