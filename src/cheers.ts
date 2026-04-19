export const CHEERS = [
  'Nice one!',
  'Great job!',
  'Keep it up!',
  "You're amazing!",
  'Well done!',
  'Fantastic!',
  'Brilliant!',
  'Lekker bezig!',
  'Goed zo!',
  'Super!',
  'Perfect!',
  'Way to go!',
  "That's the spirit!",
  'Another one!',
  "You're on fire!",
  'Smooth!',
  'Bravo!',
  'Love it!',
  'Spot on!',
  'Keep going!',
  'Champion!',
  "You've got this!",
  'Wonderful!',
  'One closer to fluent!',
  'Proud of you!',
  'Beautiful!',
  'Knap hoor!',
]

export function randomCheer(previous?: string) {
  if (CHEERS.length < 2) return CHEERS[0]
  let pick = CHEERS[Math.floor(Math.random() * CHEERS.length)]
  let guard = 0
  while (pick === previous && guard < 5) {
    pick = CHEERS[Math.floor(Math.random() * CHEERS.length)]
    guard++
  }
  return pick
}
