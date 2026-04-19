import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

type State = 'ready' | 'playing' | 'gameover'

type ObstacleKind =
  | 'rock'
  | 'whale'
  | 'lat-red'
  | 'lat-green'
  | 'card-n'
  | 'card-s'
  | 'card-e'
  | 'card-w'
  | 'safe-water'
  | 'nico'

const SPAWN_TABLE: { kind: ObstacleKind; weight: number }[] = [
  { kind: 'rock', weight: 25 },
  { kind: 'whale', weight: 5 },
  { kind: 'lat-red', weight: 11 },
  { kind: 'lat-green', weight: 11 },
  { kind: 'card-n', weight: 8 },
  { kind: 'card-s', weight: 8 },
  { kind: 'card-e', weight: 8 },
  { kind: 'card-w', weight: 8 },
  { kind: 'safe-water', weight: 9 },
  { kind: 'nico', weight: 7 },
]
const SPAWN_TOTAL = SPAWN_TABLE.reduce((s, e) => s + e.weight, 0)

function pickKind(): ObstacleKind {
  let r = Math.random() * SPAWN_TOTAL
  for (const e of SPAWN_TABLE) {
    r -= e.weight
    if (r <= 0) return e.kind
  }
  return 'rock'
}

interface Obstacle {
  kind: ObstacleKind
  x: number
  y: number
  r: number
  seed: number
}

interface GameState {
  boat: { x: number; y: number; r: number; tilt: number; lastX: number }
  obstacles: Obstacle[]
  elapsed: number
  spawnTimer: number
  lastTime: number
  rafId: number
  drag: { fx: number; bx: number; id: number } | null
  width: number
  height: number
  dpr: number
  score: number
  dodged: number
  whalesDodged: number
}

function makeInitial(width: number, height: number): GameState {
  return {
    boat: { x: width / 2, y: height - 70, r: 16, tilt: 0, lastX: width / 2 },
    obstacles: [],
    elapsed: 0,
    spawnTimer: 800,
    lastTime: 0,
    rafId: 0,
    drag: null,
    width,
    height,
    dpr: 1,
    score: 0,
    dodged: 0,
    whalesDodged: 0,
  }
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v
}

function spawnObstacle(g: GameState) {
  const kind = pickKind()
  const radius =
    kind === 'whale'
      ? 36 + Math.random() * 8
      : kind === 'rock'
        ? 18 + Math.random() * 10
        : kind === 'nico'
          ? 18
          : 13
  const x = radius + 8 + Math.random() * (g.width - 2 * (radius + 8))
  g.obstacles.push({ kind, x, y: -radius - 18, r: radius, seed: Math.random() })
}

function drawWater(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#4A9BD6')
  grad.addColorStop(1, '#1E5E8F')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1.2
  const spacing = 28
  const offset = (t * 0.04) % spacing
  for (let y = -spacing + offset; y < h; y += spacing) {
    ctx.beginPath()
    for (let x = 0; x <= w; x += 12) {
      const yy = y + Math.sin((x + t * 0.05) * 0.04) * 3
      if (x === 0) ctx.moveTo(x, yy)
      else ctx.lineTo(x, yy)
    }
    ctx.stroke()
  }
}

function drawBoat(ctx: CanvasRenderingContext2D, x: number, y: number, tilt: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(tilt)

  // hull
  ctx.fillStyle = '#8B5A2B'
  ctx.strokeStyle = '#5C3A1A'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(-14, 0)
  ctx.lineTo(14, 0)
  ctx.lineTo(9, 10)
  ctx.lineTo(-9, 10)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // mast
  ctx.strokeStyle = '#5C3A1A'
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, -28)
  ctx.stroke()

  // main sail
  ctx.fillStyle = '#FFFFFF'
  ctx.strokeStyle = '#D4D4D8'
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(0.5, -26)
  ctx.lineTo(0.5, -2)
  ctx.lineTo(13, -2)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // jib
  ctx.fillStyle = '#F5F5F5'
  ctx.beginPath()
  ctx.moveTo(-0.5, -24)
  ctx.lineTo(-0.5, -4)
  ctx.lineTo(-9, -4)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  ctx.restore()
}

function drawRock(ctx: CanvasRenderingContext2D, o: Obstacle) {
  ctx.fillStyle = '#6B7280'
  ctx.strokeStyle = '#4B5563'
  ctx.lineWidth = 1
  const points = 8
  ctx.beginPath()
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2 + o.seed
    const rr = o.r * (0.82 + (Math.sin(i * 2.3 + o.seed * 5) + 1) * 0.09)
    const px = o.x + Math.cos(a) * rr
    const py = o.y + Math.sin(a) * rr
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // highlight
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.beginPath()
  ctx.arc(o.x - o.r * 0.3, o.y - o.r * 0.3, o.r * 0.25, 0, Math.PI * 2)
  ctx.fill()
}

const BLACK = '#0F172A'
const YELLOW = '#FACC15'
const RED = '#DC2626'
const GREEN = '#16A34A'
const WHITE = '#FFFFFF'

function drawPoleAndCones(
  ctx: CanvasRenderingContext2D,
  x: number,
  bodyTopY: number,
  pattern: 'up-up' | 'up-down' | 'down-up',
  fill: string,
) {
  const pole = 4
  ctx.strokeStyle = fill
  ctx.lineWidth = 1.1
  ctx.beginPath()
  ctx.moveTo(x, bodyTopY)
  ctx.lineTo(x, bodyTopY - pole)
  ctx.stroke()

  const top = bodyTopY - pole
  ctx.fillStyle = fill
  const cone = (baseY: number, pointsUp: boolean) => {
    ctx.beginPath()
    ctx.moveTo(x - 3, baseY)
    ctx.lineTo(x + 3, baseY)
    ctx.lineTo(x, pointsUp ? baseY - 4 : baseY + 4)
    ctx.closePath()
    ctx.fill()
  }

  if (pattern === 'up-up') {
    cone(top, true)
    cone(top - 5, true)
  } else if (pattern === 'up-down') {
    // East: cones point apart (top up, bottom down)
    cone(top - 5, true)
    cone(top, false)
  } else {
    // West: cones point together (top down, bottom up)
    cone(top - 5, false)
    cone(top, true)
  }
}

function drawTwoDownCones(ctx: CanvasRenderingContext2D, x: number, bodyTopY: number, fill: string) {
  const pole = 4
  ctx.strokeStyle = fill
  ctx.lineWidth = 1.1
  ctx.beginPath()
  ctx.moveTo(x, bodyTopY)
  ctx.lineTo(x, bodyTopY - pole)
  ctx.stroke()
  const top = bodyTopY - pole
  ctx.fillStyle = fill
  // upper cone points down; its "base" is at the top, point extends down to top+4
  // lower cone points down; base at top+5, point at top+9
  const down = (baseY: number) => {
    ctx.beginPath()
    ctx.moveTo(x - 3, baseY)
    ctx.lineTo(x + 3, baseY)
    ctx.lineTo(x, baseY + 4)
    ctx.closePath()
    ctx.fill()
  }
  down(top - 9)
  down(top - 4)
}

function drawLatRed(ctx: CanvasRenderingContext2D, o: Obstacle) {
  const w = 16
  const h = 18
  const topY = o.y - h / 2
  ctx.fillStyle = RED
  ctx.fillRect(o.x - w / 2, topY, w, h)
  ctx.strokeStyle = '#7F1D1D'
  ctx.lineWidth = 1
  ctx.strokeRect(o.x - w / 2 + 0.5, topY + 0.5, w - 1, h - 1)
  // small topmark: red can/cylinder shape suggestion (simple ball)
  ctx.fillStyle = RED
  ctx.strokeStyle = '#7F1D1D'
  ctx.beginPath()
  ctx.arc(o.x, topY - 4, 2.8, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  // water ripple
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.fillRect(o.x - w / 2 - 2, o.y + h / 2 - 1, w + 4, 2)
}

function drawLatGreen(ctx: CanvasRenderingContext2D, o: Obstacle) {
  ctx.fillStyle = GREEN
  ctx.strokeStyle = '#14532D'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(o.x, o.y - 11)
  ctx.lineTo(o.x + 9, o.y + 8)
  ctx.lineTo(o.x - 9, o.y + 8)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  // cone topmark
  ctx.fillStyle = GREEN
  ctx.beginPath()
  ctx.moveTo(o.x, o.y - 18)
  ctx.lineTo(o.x - 3, o.y - 13)
  ctx.lineTo(o.x + 3, o.y - 13)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  // ripple
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.fillRect(o.x - 11, o.y + 8, 22, 2)
}

function drawCardinalBody(
  ctx: CanvasRenderingContext2D,
  o: Obstacle,
  bands: { color: string; frac: number }[],
) {
  const w = 14
  const h = 18
  const topY = o.y - h / 2
  let y = topY
  for (const b of bands) {
    const bh = h * b.frac
    ctx.fillStyle = b.color
    ctx.fillRect(o.x - w / 2, y, w, bh)
    y += bh
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'
  ctx.lineWidth = 0.8
  ctx.strokeRect(o.x - w / 2 + 0.5, topY + 0.5, w - 1, h - 1)
  // ripple
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.fillRect(o.x - w / 2 - 2, o.y + h / 2 - 1, w + 4, 2)
  return topY
}

function drawCardN(ctx: CanvasRenderingContext2D, o: Obstacle) {
  const topY = drawCardinalBody(ctx, o, [
    { color: BLACK, frac: 0.5 },
    { color: YELLOW, frac: 0.5 },
  ])
  drawPoleAndCones(ctx, o.x, topY, 'up-up', BLACK)
}

function drawCardS(ctx: CanvasRenderingContext2D, o: Obstacle) {
  const topY = drawCardinalBody(ctx, o, [
    { color: YELLOW, frac: 0.5 },
    { color: BLACK, frac: 0.5 },
  ])
  drawTwoDownCones(ctx, o.x, topY, BLACK)
}

function drawCardE(ctx: CanvasRenderingContext2D, o: Obstacle) {
  const topY = drawCardinalBody(ctx, o, [
    { color: BLACK, frac: 0.35 },
    { color: YELLOW, frac: 0.3 },
    { color: BLACK, frac: 0.35 },
  ])
  drawPoleAndCones(ctx, o.x, topY, 'up-down', BLACK)
}

function drawCardW(ctx: CanvasRenderingContext2D, o: Obstacle) {
  const topY = drawCardinalBody(ctx, o, [
    { color: YELLOW, frac: 0.35 },
    { color: BLACK, frac: 0.3 },
    { color: YELLOW, frac: 0.35 },
  ])
  drawPoleAndCones(ctx, o.x, topY, 'down-up', BLACK)
}

function drawSafeWater(ctx: CanvasRenderingContext2D, o: Obstacle) {
  const w = 16
  const h = 18
  const topY = o.y - h / 2
  // vertical red/white stripes
  const stripes = 4
  const sw = w / stripes
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? RED : WHITE
    ctx.fillRect(o.x - w / 2 + i * sw, topY, sw, h)
  }
  ctx.strokeStyle = '#7F1D1D'
  ctx.lineWidth = 0.8
  ctx.strokeRect(o.x - w / 2 + 0.5, topY + 0.5, w - 1, h - 1)
  // pole
  ctx.strokeStyle = RED
  ctx.lineWidth = 1.1
  ctx.beginPath()
  ctx.moveTo(o.x, topY)
  ctx.lineTo(o.x, topY - 5)
  ctx.stroke()
  // red ball on top
  ctx.fillStyle = RED
  ctx.beginPath()
  ctx.arc(o.x, topY - 7, 3, 0, Math.PI * 2)
  ctx.fill()
  // ripple
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.fillRect(o.x - w / 2 - 2, o.y + h / 2 - 1, w + 4, 2)
}

function drawWhale(ctx: CanvasRenderingContext2D, o: Obstacle) {
  // body
  ctx.fillStyle = '#475569'
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.ellipse(o.x, o.y, o.r, o.r * 0.55, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // belly
  ctx.fillStyle = '#94A3B8'
  ctx.beginPath()
  ctx.ellipse(o.x, o.y + 4, o.r * 0.8, o.r * 0.35, 0, 0, Math.PI * 2)
  ctx.fill()

  // eye
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(o.x - o.r * 0.55, o.y - 2, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(o.x - o.r * 0.55, o.y - 2, 1.6, 0, Math.PI * 2)
  ctx.fill()

  // spout
  ctx.strokeStyle = '#E0F2FE'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(o.x + o.r * 0.2, o.y - o.r * 0.5)
  ctx.lineTo(o.x + o.r * 0.1, o.y - o.r * 1.1)
  ctx.moveTo(o.x + o.r * 0.2, o.y - o.r * 0.5)
  ctx.lineTo(o.x + o.r * 0.35, o.y - o.r * 1)
  ctx.stroke()
}

function drawNico(
  ctx: CanvasRenderingContext2D,
  o: Obstacle,
  img: HTMLImageElement | null,
  t: number,
) {
  // pulsing golden glow so it reads as a collectible, not an obstacle
  const pulse = (Math.sin(t * 0.008) + 1) * 0.5
  const glowR = o.r + 5 + pulse * 4
  ctx.fillStyle = `rgba(250, 204, 21, ${0.18 + pulse * 0.22})`
  ctx.beginPath()
  ctx.arc(o.x, o.y, glowR, 0, Math.PI * 2)
  ctx.fill()

  // life-ring outer (red)
  ctx.fillStyle = RED
  ctx.beginPath()
  ctx.arc(o.x, o.y, o.r + 2.5, 0, Math.PI * 2)
  ctx.fill()
  // white accents on life-ring (quarter cross)
  ctx.fillStyle = WHITE
  ctx.fillRect(o.x - o.r - 2.5, o.y - 1.2, (o.r + 2.5) * 2, 2.4)
  ctx.fillRect(o.x - 1.2, o.y - o.r - 2.5, 2.4, (o.r + 2.5) * 2)

  // photo clipped to circle
  ctx.save()
  ctx.beginPath()
  ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2)
  ctx.clip()
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, o.x - o.r, o.y - o.r, o.r * 2, o.r * 2)
  } else {
    ctx.fillStyle = '#FDE68A'
    ctx.fillRect(o.x - o.r, o.y - o.r, o.r * 2, o.r * 2)
    ctx.fillStyle = '#6B7280'
    ctx.font = 'bold 18px -apple-system, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('N', o.x, o.y)
    ctx.textAlign = 'start'
    ctx.textBaseline = 'alphabetic'
  }
  ctx.restore()

  // inner white rim
  ctx.strokeStyle = WHITE
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2)
  ctx.stroke()
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  o: Obstacle,
  img: HTMLImageElement | null,
  t: number,
) {
  switch (o.kind) {
    case 'rock':
      return drawRock(ctx, o)
    case 'whale':
      return drawWhale(ctx, o)
    case 'lat-red':
      return drawLatRed(ctx, o)
    case 'lat-green':
      return drawLatGreen(ctx, o)
    case 'card-n':
      return drawCardN(ctx, o)
    case 'card-s':
      return drawCardS(ctx, o)
    case 'card-e':
      return drawCardE(ctx, o)
    case 'card-w':
      return drawCardW(ctx, o)
    case 'safe-water':
      return drawSafeWater(ctx, o)
    case 'nico':
      return drawNico(ctx, o, img, t)
  }
}

function drawHud(ctx: CanvasRenderingContext2D, g: GameState, best: number) {
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fillRect(8, 8, 132, 40)

  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 22px -apple-system, system-ui, sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillText(String(g.score), 16, 12)

  ctx.font = '11px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.fillText(`best ${best}`, 16, 34)
  ctx.restore()
}

export function GameView() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<GameState | null>(null)
  const stateRef = useRef<State>('ready')
  const nicoImgRef = useRef<HTMLImageElement | null>(null)
  const [state, setState] = useState<State>('ready')
  const [finalScore, setFinalScore] = useState(0)
  const [isNewBest, setIsNewBest] = useState(false)
  const [best, setBest] = useLocalStorage<number>('nicos-geheugensteun-game-best', 0)

  useEffect(() => {
    const img = new Image()
    img.src = `${import.meta.env.BASE_URL}photos/nico-sail.jpg`
    nicoImgRef.current = img
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      const ctx = canvas.getContext('2d')!
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (!gameRef.current) {
        gameRef.current = makeInitial(rect.width, rect.height)
      } else {
        gameRef.current.width = rect.width
        gameRef.current.height = rect.height
        gameRef.current.boat.y = rect.height - 70
        gameRef.current.boat.x = clamp(gameRef.current.boat.x, 20, rect.width - 20)
      }
      gameRef.current.dpr = dpr
      drawStatic()
    }

    const drawStatic = () => {
      const g = gameRef.current!
      const ctx = canvas.getContext('2d')!
      drawWater(ctx, g.width, g.height, 0)
      for (const o of g.obstacles) drawObstacle(ctx, o, nicoImgRef.current, 0)
      drawBoat(ctx, g.boat.x, g.boat.y, g.boat.tilt)
      drawHud(ctx, g, best)
    }

    resize()
    window.addEventListener('resize', resize)

    const onPointerDown = (e: PointerEvent) => {
      if (stateRef.current !== 'playing') return
      const rect = canvas.getBoundingClientRect()
      const g = gameRef.current!
      g.drag = { fx: e.clientX - rect.left, bx: g.boat.x, id: e.pointerId }
      canvas.setPointerCapture(e.pointerId)
    }
    const onPointerMove = (e: PointerEvent) => {
      const g = gameRef.current!
      if (!g.drag || g.drag.id !== e.pointerId) return
      const rect = canvas.getBoundingClientRect()
      const fx = e.clientX - rect.left
      g.boat.x = clamp(g.drag.bx + (fx - g.drag.fx), g.boat.r, g.width - g.boat.r)
    }
    const onPointerUp = (e: PointerEvent) => {
      const g = gameRef.current!
      if (g.drag && g.drag.id === e.pointerId) g.drag = null
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)

    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      if (gameRef.current?.rafId) cancelAnimationFrame(gameRef.current.rafId)
    }
  }, [best])

  const start = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    gameRef.current = makeInitial(rect.width, rect.height)
    gameRef.current.dpr = window.devicePixelRatio || 1
    stateRef.current = 'playing'
    setIsNewBest(false)
    setState('playing')
    const startBest = best
    const ctx = canvas.getContext('2d')!

    const loop = (now: number) => {
      const g = gameRef.current!
      if (stateRef.current !== 'playing') return
      if (!g.lastTime) g.lastTime = now
      const dt = Math.min(50, now - g.lastTime)
      g.lastTime = now

      g.elapsed += dt / 1000
      const speedMul = 1 + g.elapsed / 45
      const baseSpeed = 0.18
      const speed = baseSpeed * speedMul

      // tilt follows horizontal motion from the last frame
      const dx = g.boat.x - g.boat.lastX
      g.boat.tilt = g.boat.tilt * 0.82 + clamp(dx * 0.025, -0.35, 0.35) * 0.18
      g.boat.lastX = g.boat.x

      // spawn
      g.spawnTimer -= dt
      if (g.spawnTimer <= 0) {
        const interval = Math.max(430, 1200 - g.elapsed * 14)
        g.spawnTimer = interval + Math.random() * 220
        spawnObstacle(g)
      }

      // move + cull
      for (const o of g.obstacles) o.y += speed * dt
      const stillOn: Obstacle[] = []
      for (const o of g.obstacles) {
        if (o.y - o.r > g.height + 20) {
          // nico drifts off-screen if missed — no bonus, no penalty
          if (o.kind === 'nico') continue
          g.dodged++
          g.score += 15
          if (o.kind === 'whale') {
            g.whalesDodged++
            g.score += 185 // total 200 for whale
          }
        } else {
          stillOn.push(o)
        }
      }
      g.obstacles = stillOn

      // survival score
      g.score = Math.max(g.score, Math.floor(g.elapsed * 10) + g.dodged * 15 + g.whalesDodged * 185)

      // collision: nico is a collectible, everything else crashes you
      const afterCollision: Obstacle[] = []
      let crashed = false
      for (const o of g.obstacles) {
        const ddx = o.x - g.boat.x
        const ddy = o.y - g.boat.y
        const rr = o.r + g.boat.r - 3
        const hit = ddx * ddx + ddy * ddy < rr * rr
        if (hit && o.kind === 'nico') {
          g.score += 500
          continue
        }
        if (hit) crashed = true
        afterCollision.push(o)
      }
      g.obstacles = afterCollision
      if (crashed) {
        stateRef.current = 'gameover'
        setFinalScore(g.score)
        if (g.score > startBest) {
          setBest(g.score)
          setIsNewBest(true)
        }
        setState('gameover')
      }

      // render
      drawWater(ctx, g.width, g.height, now)
      for (const o of g.obstacles) drawObstacle(ctx, o, nicoImgRef.current, now)
      drawBoat(ctx, g.boat.x, g.boat.y, g.boat.tilt)
      drawHud(ctx, g, best)

      if (stateRef.current === 'playing') {
        g.rafId = requestAnimationFrame(loop)
      }
    }

    gameRef.current.rafId = requestAnimationFrame(loop)
  }

  useEffect(() => {
    return () => {
      stateRef.current = 'ready'
    }
  }, [])

  return (
    <>
      <h1 className="text-2xl font-semibold mb-1">Sail</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
        Drag to steer. Avoid rocks, buoys, and whales — sail into Nico for a bonus.
      </p>

      <div className="relative rounded-[14px] overflow-hidden shadow-lg">
        <canvas
          ref={canvasRef}
          className="w-full block bg-[#1E5E8F]"
          style={{ aspectRatio: '3 / 4', touchAction: 'none' }}
        />

        {state === 'ready' && (
          <button
            type="button"
            onClick={start}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] text-white"
          >
            <div className="text-3xl font-semibold mb-1">⛵</div>
            <div className="text-lg font-semibold">Tap to start</div>
            <div className="text-xs opacity-80 mt-2">Drag anywhere to steer</div>
          </button>
        )}

        {state === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-6">
            <div className="text-sm opacity-80 mb-1">Shipwrecked</div>
            <div className="text-5xl font-semibold mb-1">{finalScore}</div>
            <div className="text-xs opacity-70 mb-5">
              {isNewBest ? 'New best!' : `Best ${best}`}
            </div>
            <button
              type="button"
              onClick={start}
              className="px-5 py-2.5 rounded-full bg-white text-neutral-900 font-medium text-sm active:scale-[0.97] transition-transform"
            >
              Play again
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4 text-center">
        Dodging a whale: +200. Catching Nico's life-ring: +500.
      </p>
    </>
  )
}
