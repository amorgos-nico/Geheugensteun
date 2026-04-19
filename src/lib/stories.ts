import type { Word } from '../types'

interface Ctx {
  de: Word[]
  het: Word[]
  any: Word[]
}

interface Template {
  minDe: number
  minHet: number
  minAny: number
  render: (ctx: Ctx) => string
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickUnique<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  const out: T[] = []
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length)
    out.push(copy.splice(idx, 1)[0])
  }
  return out
}

const DE = (w: Word) => `de ${w.word}`
const HET = (w: Word) => `het ${w.word}`
const ART = (w: Word) => (w.article === 'de' ? DE(w) : HET(w))

const TEMPLATES: Template[] = [
  {
    minDe: 1,
    minHet: 0,
    minAny: 0,
    render: ({ de }) =>
      `Nico keek naar ${DE(pick(de))} en glimlachte. "Dit," zei hij, "is precies wat we nodig hadden."`,
  },
  {
    minDe: 0,
    minHet: 1,
    minAny: 0,
    render: ({ het }) =>
      `${HET(pick(het))} stond midden in de kamer. Anna fronste, Nico gniffelde. Er moest iets gebeuren.`,
  },
  {
    minDe: 1,
    minHet: 1,
    minAny: 0,
    render: ({ de, het }) =>
      `Anna zag ${DE(pick(de))} en dacht meteen aan ${HET(pick(het))}. "Wat een combinatie," fluisterde ze. Nico kon alleen maar knikken.`,
  },
  {
    minDe: 1,
    minHet: 1,
    minAny: 0,
    render: ({ de, het }) =>
      `Op dinsdagochtend verdween ${DE(pick(de))} spoorloos. In zijn plaats lag ${HET(pick(het))}. Niemand begreep het, behalve misschien de kat.`,
  },
  {
    minDe: 2,
    minHet: 0,
    minAny: 0,
    render: ({ de }) => {
      const [a, b] = pickUnique(de, 2)
      return `${DE(a)} en ${DE(b)} waren beste vrienden geworden. Samen beleefden ze avonturen waar zelfs Nico van droomde.`
    },
  },
  {
    minDe: 0,
    minHet: 2,
    minAny: 0,
    render: ({ het }) => {
      const [a, b] = pickUnique(het, 2)
      return `${HET(a)} vertelde ${HET(b)} een geheim. Sindsdien was niets meer hetzelfde.`
    },
  },
  {
    minDe: 1,
    minHet: 1,
    minAny: 1,
    render: ({ de, het, any }) => {
      const d = pick(de)
      const h = pick(het)
      const other = pick(any.filter((w) => w.id !== d.id && w.id !== h.id)) ?? pick(any)
      return `Stel je voor: ${DE(d)}, ${HET(h)}, en ergens op de achtergrond ${ART(other)}. Voor de meeste mensen het begin van een mop. Voor Anna een doodgewone donderdag.`
    },
  },
  {
    minDe: 1,
    minHet: 0,
    minAny: 0,
    render: ({ de }) =>
      `"Heb jij ${DE(pick(de))} gezien?" vroeg Nico. Anna haalde haar schouders op. Buiten begon het te regenen.`,
  },
  {
    minDe: 0,
    minHet: 1,
    minAny: 0,
    render: ({ het }) =>
      `Er was eens ${HET(pick(het))} dat geen zin meer had om te zijn wat het was. Het wilde iets groters. Iets mooiers. Iets Nederlandsers.`,
  },
  {
    minDe: 1,
    minHet: 1,
    minAny: 0,
    render: ({ de, het }) =>
      `In een klein café in Amsterdam bestelde Anna ${DE(pick(de))}. De ober bracht in plaats daarvan ${HET(pick(het))}. "Typisch," zei ze, en nam een slok.`,
  },
  {
    minDe: 2,
    minHet: 1,
    minAny: 0,
    render: ({ de, het }) => {
      const [d1, d2] = pickUnique(de, 2)
      const h = pick(het)
      return `Nico had een droom: ${DE(d1)}, ${DE(d2)} en ${HET(h)} — allemaal in één kamer. Hij werd wakker met een brede glimlach en geen idee wat het betekende.`
    },
  },
  {
    minDe: 1,
    minHet: 1,
    minAny: 0,
    render: ({ de, het }) =>
      `Anna pakte ${DE(pick(de))} uit haar tas. Ze legde het naast ${HET(pick(het))}. "Perfect," dacht ze. Niemand anders zou het begrijpen, en dat was prima.`,
  },
  {
    minDe: 0,
    minHet: 0,
    minAny: 1,
    render: ({ any }) =>
      `Op een dag besloot ${ART(pick(any))} niet meer mee te werken. Het was genoeg geweest. Anna probeerde te onderhandelen, zonder succes.`,
  },
  {
    minDe: 1,
    minHet: 1,
    minAny: 0,
    render: ({ de, het }) =>
      `De regel was simpel: eerst ${DE(pick(de))}, daarna ${HET(pick(het))}. Nico hield zich nooit aan de regel. Daarom hield Anna van hem.`,
  },
  {
    minDe: 0,
    minHet: 0,
    minAny: 2,
    render: ({ any }) => {
      const [a, b] = pickUnique(any, 2)
      return `${ART(a)} keek ${ART(b)} recht aan. Er vielen geen woorden. Er hoefden geen woorden te vallen.`
    },
  },
]

export interface StoryResult {
  kind: 'ok'
  text: string
}

export interface StoryEmpty {
  kind: 'empty'
  reason: 'no-words' | 'too-few-words'
  need: number
  have: number
}

export type StoryOutput = StoryResult | StoryEmpty

export function generateStory(words: Word[], previous?: string): StoryOutput {
  const have = words.length
  if (have === 0) {
    return { kind: 'empty', reason: 'no-words', need: 2, have }
  }

  const de = words.filter((w) => w.article === 'de')
  const het = words.filter((w) => w.article === 'het')

  const eligible = TEMPLATES.filter(
    (t) => de.length >= t.minDe && het.length >= t.minHet && words.length >= t.minAny,
  )

  if (eligible.length === 0) {
    return { kind: 'empty', reason: 'too-few-words', need: 2, have }
  }

  const ctx: Ctx = { de, het, any: words }
  let text = pick(eligible).render(ctx)
  let tries = 0
  while (text === previous && eligible.length > 1 && tries < 6) {
    text = pick(eligible).render(ctx)
    tries++
  }
  return { kind: 'ok', text }
}
