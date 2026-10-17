/**
 * ヒーロー用の Canvas アニメーション。解説ではなく、数式から生まれる模様を見せる。
 * 各シーンは init で状態を作り、frame で毎フレーム描く（t はシーン開始からの秒数）。
 */

export type Ctx = { ctx: CanvasRenderingContext2D; w: number; h: number; dark: boolean; bg: string }

export type CanvasScene<S> = {
  init: (c: Ctx) => S
  /** render が false のときは描画を省いてよい（時刻を早送りするとき）。軌跡を貯めるシーンは常に描く */
  frame: (c: Ctx, s: S, t: number, dt: number, render: boolean) => void
}

export type AnyScene = CanvasScene<unknown>
const scene = <S>(s: CanvasScene<S>) => s as unknown as AnyScene

/** 決まった種の疑似乱数 */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let x = a
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

const hsl = (h: number, s: number, l: number, a = 1) => `hsla(${((h % 360) + 360) % 360}, ${s}%, ${l}%, ${a})`

function clear(c: Ctx, alpha = 1) {
  const { ctx, w, h, bg } = c
  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = alpha
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

/** ダークでは光が重なって明るくなる合成にする */
const glow = (c: Ctx) => (c.ctx.globalCompositeOperation = c.dark ? 'lighter' : 'source-over')
const light = (c: Ctx, l: number) => (c.dark ? l : l - 12)

/* ---------- 三角関数：ハーモノグラフ ---------- */

export const harmonograph = scene({
  init(c) {
    clear(c)
    const r = rng(7)
    return {
      f: [2, 3 + 0.012 + r() * 0.01, 3, 2 + 0.008 + r() * 0.01],
      p: [r() * 6, r() * 6, r() * 6, r() * 6],
      tau: 0,
      last: null as [number, number] | null,
    }
  },
  frame(c, s, _t, dt) {
    const { ctx, w, h } = c
    const R = Math.min(w, h) * 0.42
    const at = (tau: number): [number, number] => {
      const d = Math.exp(-0.012 * tau)
      const x = (Math.sin(s.f[0] * tau + s.p[0]) + 0.6 * Math.sin(s.f[1] * tau + s.p[1])) / 1.6
      const y = (Math.sin(s.f[2] * tau + s.p[2]) + 0.6 * Math.sin(s.f[3] * tau + s.p[3])) / 1.6
      return [w / 2 + x * R * d, h / 2 + y * R * d]
    }
    glow(c)
    ctx.lineWidth = 1.1
    const steps = 30
    ctx.beginPath()
    for (let i = 0; i < steps; i++) {
      s.tau += (dt * 9) / steps
      const p = at(s.tau)
      if (s.last) {
        ctx.moveTo(s.last[0], s.last[1])
        ctx.lineTo(p[0], p[1])
      }
      s.last = p
    }
    ctx.strokeStyle = hsl(190 + s.tau * 1.6, 75, light(c, 60), 0.55)
    ctx.stroke()
    ctx.globalCompositeOperation = 'source-over'
  },
})

/* ---------- 整数：円周上の掛け算表（i → k·i mod N） ---------- */

export const timesTable = scene({
  init: () => ({}),
  frame(c, _s, t, _dt, render) {
    if (!render) return
    const { ctx, w, h } = c
    clear(c)
    const N = 300
    const k = 2 + t * 0.28
    const R = Math.min(w, h) * 0.44
    const pt = (i: number): [number, number] => {
      const a = (2 * Math.PI * i) / N - Math.PI / 2
      return [w / 2 + R * Math.cos(a), h / 2 + R * Math.sin(a)]
    }
    glow(c)
    ctx.lineWidth = 0.9
    for (let i = 0; i < N; i++) {
      const [x1, y1] = pt(i)
      const [x2, y2] = pt((i * k) % N)
      ctx.strokeStyle = hsl((i / N) * 360 + t * 18, 75, light(c, 60), 0.5)
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
    ctx.globalCompositeOperation = 'source-over'
  },
})

/* ---------- 数列：黄金角で並ぶ種（フィロタキシス） ---------- */

const GOLDEN = Math.PI * (3 - Math.sqrt(5))

export const phyllotaxis = scene({
  init: () => ({}),
  frame(c, _s, t, _dt, render) {
    if (!render) return
    const { ctx, w, h } = c
    clear(c)
    const MAX = 1500
    const n = Math.min(MAX, Math.floor(t * 190))
    const R = Math.min(w, h) * 0.4
    const k = R / Math.sqrt(MAX)
    glow(c)
    for (let i = 0; i < n; i++) {
      const r = k * Math.sqrt(i)
      const a = i * GOLDEN + t * 0.08
      const size = 0.8 + 2.3 * Math.sqrt(i / MAX)
      // 34 本のらせんごとに色を変えると、隠れたらせんが浮かぶ
      ctx.fillStyle = hsl(40 - ((i % 34) / 34) * 90 + (i / MAX) * 20, 85, light(c, 60), 0.9)
      ctx.beginPath()
      ctx.arc(w / 2 + r * Math.cos(a), h * 0.45 + r * Math.sin(a), size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalCompositeOperation = 'source-over'
  },
})

/* ---------- 複素数：回転する円の重ね合わせでハートを描く ---------- */

type Coef = { m: number; re: number; im: number; amp: number }

export const epicycles = scene({
  init() {
    const N = 256
    const pts: [number, number][] = []
    for (let k = 0; k < N; k++) {
      const s = (2 * Math.PI * k) / N
      pts.push([16 * Math.sin(s) ** 3, -(13 * Math.cos(s) - 5 * Math.cos(2 * s) - 2 * Math.cos(3 * s) - Math.cos(4 * s))])
    }
    const coefs: Coef[] = []
    for (let m = -30; m <= 30; m++) {
      let re = 0
      let im = 0
      pts.forEach(([x, y], k) => {
        const a = (-2 * Math.PI * m * k) / N
        re += x * Math.cos(a) - y * Math.sin(a)
        im += x * Math.sin(a) + y * Math.cos(a)
      })
      re /= N
      im /= N
      coefs.push({ m, re, im, amp: Math.hypot(re, im) })
    }
    coefs.sort((a, b) => b.amp - a.amp)
    return { coefs, trail: [] as [number, number][], lastPhase: 0 }
  },
  frame(c, s, t, _dt, render) {
    const { ctx, w, h } = c
    const period = 7
    const phase = (t % period) / period
    if (phase < s.lastPhase) s.trail = []
    s.lastPhase = phase
    const sc = Math.min(w, h) / 40
    const cx = w / 2
    const cy = h / 2 + sc
    let x = 0
    let y = 0
    const arms: [number, number, number][] = []
    for (const k of s.coefs) {
      const a = 2 * Math.PI * k.m * phase
      const nx = x + k.re * Math.cos(a) - k.im * Math.sin(a)
      const ny = y + k.re * Math.sin(a) + k.im * Math.cos(a)
      arms.push([cx + x * sc, cy + y * sc, k.amp * sc])
      x = nx
      y = ny
    }
    s.trail.push([cx + x * sc, cy + y * sc])
    if (!render) return
    clear(c)
    ctx.lineWidth = 1
    arms.forEach(([ax, ay, r], i) => {
      if (r < 0.6) return
      ctx.strokeStyle = hsl(260 + i * 4, 60, light(c, 65), 0.22)
      ctx.beginPath()
      ctx.arc(ax, ay, r, 0, Math.PI * 2)
      ctx.stroke()
    })
    ctx.strokeStyle = hsl(260, 60, light(c, 70), 0.5)
    ctx.beginPath()
    arms.forEach(([ax, ay], i) => (i ? ctx.lineTo(ax, ay) : ctx.moveTo(ax, ay)))
    ctx.lineTo(cx + x * sc, cy + y * sc)
    ctx.stroke()
    glow(c)
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    for (let i = 1; i < s.trail.length; i++) {
      ctx.strokeStyle = hsl(330 + (i / s.trail.length) * 40, 85, light(c, 62), 0.9)
      ctx.beginPath()
      ctx.moveTo(s.trail[i - 1][0], s.trail[i - 1][1])
      ctx.lineTo(s.trail[i][0], s.trail[i][1])
      ctx.stroke()
    }
    ctx.globalCompositeOperation = 'source-over'
  },
})

/* ---------- 微分方程式：ローレンツ・アトラクタ ---------- */

export const lorenz = scene({
  init() {
    // 出発直後の軌道は捨てて、アトラクタに乗ってから描く
    let p: [number, number, number] = [0.1, 0, 0]
    for (let i = 0; i < 3000; i++) {
      const [x, y, z] = p
      p = [x + 0.005 * 10 * (y - x), y + 0.005 * (x * (28 - z) - y), z + 0.005 * (x * y - (8 / 3) * z)]
    }
    return { p, pts: [] as [number, number, number][] }
  },
  frame(c, s, t, dt, render) {
    const { ctx, w, h } = c
    const sub = Math.max(1, Math.round((dt * 60) * 8))
    for (let i = 0; i < sub; i++) {
      const [x, y, z] = s.p
      const e = 0.005
      s.p = [x + e * 10 * (y - x), y + e * (x * (28 - z) - y), z + e * (x * y - (8 / 3) * z)]
      s.pts.push(s.p)
    }
    if (s.pts.length > 6000) s.pts.splice(0, s.pts.length - 6000)
    if (!render) return
    clear(c)
    const a = t * 0.22
    const ca = Math.cos(a)
    const sa = Math.sin(a)
    const sc = Math.min(w, h) / 58
    const proj = ([x, y, z]: [number, number, number]): [number, number] => [w / 2 + (x * ca - y * sa) * sc, h * 0.45 - (z - 25) * sc]
    glow(c)
    ctx.lineWidth = 1.1
    const n = s.pts.length
    const chunk = 30
    for (let i = 0; i < n - 1; i += chunk) {
      const f = i / n
      ctx.strokeStyle = hsl(190 + f * 120, 80, light(c, 60), 0.15 + 0.75 * f)
      ctx.beginPath()
      const p0 = proj(s.pts[i])
      ctx.moveTo(p0[0], p0[1])
      for (let j = i + 1; j <= Math.min(n - 1, i + chunk); j++) {
        const p = proj(s.pts[j])
        ctx.lineTo(p[0], p[1])
      }
      ctx.stroke()
    }
    const head = proj(s.pts[n - 1])
    ctx.fillStyle = hsl(310, 90, light(c, 75))
    ctx.beginPath()
    ctx.arc(head[0], head[1], 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
  },
})

/* ---------- 確率：バーンズリーのシダ（確率で変換を選ぶ） ---------- */

const FERN: [number, number, number, number, number, number, number][] = [
  [0, 0, 0, 0.16, 0, 0, 0.01],
  [0.85, 0.04, -0.04, 0.85, 0, 1.6, 0.85],
  [0.2, -0.26, 0.23, 0.22, 0, 1.6, 0.07],
  [-0.15, 0.28, 0.26, 0.24, 0, 0.44, 0.07],
]

export const fern = scene({
  init(c) {
    clear(c)
    return { x: 0, y: 0, r: rng(11) }
  },
  frame(c, s, _t, dt) {
    const { ctx, w, h } = c
    const sc = (h * 0.9) / 10
    const ox = w / 2 - 0.25 * sc
    const oy = h * 0.95
    const n = Math.round(700 * dt * 60)
    for (let i = 0; i < n; i++) {
      let u = s.r()
      let m = FERN[0]
      for (const f of FERN) {
        if (u < f[6]) {
          m = f
          break
        }
        u -= f[6]
      }
      const nx = m[0] * s.x + m[1] * s.y + m[4]
      const ny = m[2] * s.x + m[3] * s.y + m[5]
      s.x = nx
      s.y = ny
      ctx.fillStyle = hsl(95 + s.y * 6, 70, light(c, 30 + s.y * 4), 0.75)
      ctx.fillRect(ox + s.x * sc, oy - s.y * sc, 1.2, 1.2)
    }
  },
})

/* ---------- ベクトル場：流れに沿って漂う粒子 ---------- */

export const flowField = scene({
  init(c) {
    clear(c)
    const r = rng(3)
    const ps = Array.from({ length: 1400 }, () => ({ x: r() * c.w, y: r() * c.h }))
    return { ps, r }
  },
  frame(c, s, t) {
    const { ctx, w, h } = c
    // ライトでは薄い残像が灰色に残りやすいので、少し強めに消す
    clear(c, c.dark ? 0.05 : 0.09)
    glow(c)
    ctx.lineWidth = 1.2
    const sc = 360 / Math.min(w, h)
    for (const p of s.ps) {
      const x = p.x * sc
      const y = p.y * sc
      const a = (Math.sin(x * 0.011 + t * 0.15) + Math.cos(y * 0.013 - t * 0.12) + Math.sin((x + y) * 0.004)) * Math.PI * 0.8
      const nx = p.x + Math.cos(a) * 1.3
      const ny = p.y + Math.sin(a) * 1.3
      ctx.strokeStyle = hsl(180 + (a * 180) / Math.PI / 2, 80, light(c, 62), 0.5)
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(nx, ny)
      ctx.stroke()
      p.x = nx
      p.y = ny
      if (p.x < 0 || p.x > w || p.y < 0 || p.y > h || s.r() < 0.004) {
        p.x = s.r() * w
        p.y = s.r() * h
      }
    }
    ctx.globalCompositeOperation = 'source-over'
  },
})
