import { useEffect, useState } from 'react'
import type { Word } from '../types'
import { generateStory, type StoryOutput } from '../lib/stories'

interface Props {
  words: Word[]
}

export function StoryView({ words }: Props) {
  const [story, setStory] = useState<StoryOutput | null>(null)

  useEffect(() => {
    setStory(generateStory(words))
  }, [words])

  const regenerate = () => {
    setStory((prev) => {
      const prevText = prev?.kind === 'ok' ? prev.text : undefined
      return generateStory(words, prevText)
    })
  }

  return (
    <>
      <h1 className="text-2xl font-semibold mb-1">Story time</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
        A little Dutch story using your words
      </p>

      {story?.kind === 'empty' && (
        <div className="rounded-[10px] px-4 py-5 bg-paper-sunk dark:bg-night-sunk text-center">
          <div className="text-sm text-neutral-600 dark:text-neutral-300 mb-2">
            {story.reason === 'no-words'
              ? 'Add a few words first, then come back here.'
              : `Add at least ${story.need} words to unlock stories. You have ${story.have}.`}
          </div>
        </div>
      )}

      {story?.kind === 'ok' && (
        <>
          <div className="rounded-[14px] px-5 py-6 bg-paper-sunk dark:bg-night-sunk text-[17px] leading-relaxed">
            {story.text}
          </div>

          <button
            type="button"
            onClick={regenerate}
            className="mt-4 w-full px-4 py-3 text-[15px] font-medium rounded-[10px] border bg-emerald-500 border-emerald-600 text-white active:scale-[0.98] transition-transform"
          >
            New story
          </button>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4 text-center">
            Stories are made from ~15 templates using your own words. Add more words for more variety.
          </p>
        </>
      )}
    </>
  )
}
