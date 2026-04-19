import { useRef, useState, type KeyboardEvent } from 'react'
import type { Article } from '../types'

interface Props {
  onAdd: (word: string, translation: string, article: Article) => boolean
}

export function WordForm({ onAdd }: Props) {
  const [word, setWord] = useState('')
  const [translation, setTranslation] = useState('')
  const wordRef = useRef<HTMLInputElement>(null)
  const translationRef = useRef<HTMLInputElement>(null)

  const submit = (article: Article) => {
    const w = word.trim()
    if (!w) {
      wordRef.current?.focus()
      return
    }
    const added = onAdd(w, translation.trim(), article)
    if (added) {
      setWord('')
      setTranslation('')
    }
    wordRef.current?.focus()
  }

  const onWordKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') translationRef.current?.focus()
  }
  const onTranslationKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit('de')
  }

  const inputClasses =
    'w-full min-w-0 px-3.5 py-3 text-base rounded-[10px] border border-[#e0ddd0] bg-white text-neutral-900 outline-none focus:border-neutral-500 dark:bg-night-sunk dark:text-neutral-100 dark:border-night-border'

  return (
    <>
      <div className="flex gap-2 mb-2.5">
        <input
          ref={wordRef}
          type="text"
          className={`${inputClasses} flex-1`}
          placeholder="Word (e.g. tafel)"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={onWordKey}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <input
          ref={translationRef}
          type="text"
          className={`${inputClasses} flex-1`}
          placeholder="Translation"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          onKeyDown={onTranslationKey}
          autoComplete="off"
        />
      </div>
      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => submit('de')}
          className="flex-1 px-4 py-3 text-[15px] font-medium rounded-[10px] border bg-de-bg border-de-accent text-de-label cursor-pointer active:scale-[0.97] transition-transform"
        >
          + Add as de
        </button>
        <button
          type="button"
          onClick={() => submit('het')}
          className="flex-1 px-4 py-3 text-[15px] font-medium rounded-[10px] border bg-het-bg border-het-accent text-het-label cursor-pointer active:scale-[0.97] transition-transform"
        >
          + Add as het
        </button>
      </div>
    </>
  )
}
