export type Article = 'de' | 'het'

export interface Word {
  id: string
  word: string
  translation: string
  article: Article
  createdAt?: string
}

export type FilterValue = 'all' | Article

export type TabKey = 'words' | 'stats' | 'story' | 'game'
