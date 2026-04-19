const BASE = import.meta.env.BASE_URL

export const PHOTOS: string[] = [
  `${BASE}photos/photo-1.jpg`,
  `${BASE}photos/photo-2.jpg`,
  `${BASE}photos/photo-3.jpg`,
  `${BASE}photos/photo-4.jpg`,
  `${BASE}photos/photo-5.jpg`,
]

export function randomPhoto(previous?: string): string {
  if (PHOTOS.length < 2) return PHOTOS[0]
  let pick = PHOTOS[Math.floor(Math.random() * PHOTOS.length)]
  let guard = 0
  while (pick === previous && guard < 5) {
    pick = PHOTOS[Math.floor(Math.random() * PHOTOS.length)]
    guard++
  }
  return pick
}
