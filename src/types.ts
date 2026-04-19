export type Article = 'de' | 'het'

export interface Word {
  id: string
  word: string
  translation: string
  article: Article
}

export type FilterValue = 'all' | Article
