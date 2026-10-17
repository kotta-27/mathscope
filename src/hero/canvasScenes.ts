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

/* ---------- 整数：ウラムのらせん（素数だけに点を打つと斜めの線が浮かぶ） ---------- */

function sieve(n: number) {
  const p = new Uint8Array(n + 1).fill(1)
  p[0] = p[1] = 0
  for (let i = 2; i * i <= n; i++) if (p[i]) for (let j = i * i; j <= n; j += i) p[j] = 0
  return p
}

export const ulam = scene({
  init: (c) => {
    const cell = Math.max(4, Math.round(Math.min(c.w, c.h) / 64))
    const side = Math.floor(Math.min(c.w, c.h) / cell)
    const N = side * side
    // 1 から順に、中心から外へ四角くらせんを描く位置
    const pos: [number, number][] = [[0, 0]]
    let x = 0
    let y = 0
    let d = 0
    const dirs = [[1, 0], [0, -1], [-1, 0], [0, 1]]
    for (let len = 1; pos.length < N; len++)
      for (let rep = 0; rep < 2 && pos.length < N; rep++) {
        for (let k = 0; k < len && pos.length < N; k++) {
          x += dirs[d][0]
          y += dirs[d][1]
          pos.push([x, y])
        }
        d = (d + 1) % 4
      }
    return { cell, N, pos, prime: sieve(N + 1) }
  },
  frame(c, s, t, _dt, render) {
    if (!render) return
    const { ctx, w, h } = c
    clear(c)
    const n = Math.min(s.N, Math.floor(60 + t * t * 260))
    glow(c)
    for (let i = 0; i < n; i++) {
      if (!s.prime[i + 1]) continue
      const [px, py] = s.pos[i]
      const r = Math.hypot(px, py) / Math.sqrt(s.N)
      ctx.fillStyle = hsl(200 + r * 160 + t * 6, 80, light(c, 62), 0.95)
      ctx.beginPath()
      ctx.arc(w / 2 + px * s.cell, h * 0.45 + py * s.cell, s.cell * 0.42, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalCompositeOperation = 'source-over'
  },
})

/* ---------- 二項係数：パスカルの三角形の奇数だけを塗るとシェルピンスキーの三角形 ---------- */

export const pascalMod2 = scene({
  init: () => ({}),
  frame(c, _s, t, _dt, render) {
    if (!render) return
    const { ctx, w, h } = c
    clear(c)
    const ROWS = 128
    const rows = Math.min(ROWS, Math.floor(4 + t * 14))
    const size = Math.min((h * 0.86) / ROWS, (w * 0.9) / ROWS)
    const top = h * 0.07
    glow(c)
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k <= r; k++) {
        // C(r, k) が奇数 ⇔ k と r − k の 2 進数に同じ位の 1 がない（ルカの定理）
        if ((k & (r - k)) !== 0) continue
        const x = w / 2 + (k - r / 2) * size
        const y = top + r * size * 0.92
        ctx.fillStyle = hsl(330 - (r / ROWS) * 140 + t * 4, 80, light(c, 60), 0.92)
        ctx.beginPath()
        ctx.moveTo(x, y - size * 0.5)
        ctx.lineTo(x + size * 0.55, y + size * 0.45)
        ctx.lineTo(x - size * 0.55, y + size * 0.45)
        ctx.fill()
      }
    }
    ctx.globalCompositeOperation = 'source-over'
  },
})

/* ---------- 複素数：マンデルブロ集合（z → z² + c をくり返しても発散しない c） ---------- */

export const mandelbrot = scene({
  init(c) {
    const W = Math.round(c.w)
    const H = Math.round(c.h)
    const off = document.createElement('canvas')
    off.width = W
    off.height = H
    const octx = off.getContext('2d')!
    // 背景色で塗っておき、上から 1 行ずつ描き足す
    octx.fillStyle = c.bg
    octx.fillRect(0, 0, W, H)
    // 背景の色（RGB）を読んでおき、集合の外をそれになじませる
    const px = octx.getImageData(0, 0, 1, 1).data
    return { off, octx, W, H, row: 0, bg: [px[0], px[1], px[2]] as [number, number, number] }
  },
  frame(c, s, t, dt) {
    const { ctx } = c
    const { W, H, octx } = s
    const scale = 3.1 / W
    const cx0 = -0.62
    const MAX = 90
    // 1 秒におよそ画面 1 枚の 1/2.5 を描く
    const rowsNow = Math.min(H, Math.ceil(s.row + Math.max(1, (H / 2.5) * dt)))
    for (; s.row < rowsNow; s.row++) {
      const img = octx.createImageData(W, 1)
      const ci = (s.row - H / 2) * scale
      for (let x = 0; x < W; x++) {
        const cr = cx0 + (x - W / 2) * scale
        let zr = 0
        let zi = 0
        let n = 0
        while (n < MAX && zr * zr + zi * zi < 16) {
          const nzr = zr * zr - zi * zi + cr
          zi = 2 * zr * zi + ci
          zr = nzr
          n++
        }
        const o = x * 4
        let rgb: [number, number, number]
        if (n === MAX) rgb = c.dark ? [6, 8, 14] : [36, 40, 58]
        else {
          // 発散の速さで色をなめらかに変える（遠いところは背景の色に近く）
          const v = n + 1 - Math.log2(Math.log2(zr * zr + zi * zi) / 2)
          const k = Math.min(1, Math.sqrt(Math.max(0, v) / MAX) * 1.25)
          const glowRgb: [number, number, number] = [255 * Math.min(1, 1.5 * k * k), 255 * Math.min(1, k * 0.85), 255 * Math.min(1, k * 1.15)]
          rgb = c.dark ? [s.bg[0] + glowRgb[0] * k, s.bg[1] + glowRgb[1] * k, s.bg[2] + glowRgb[2] * k] : [s.bg[0] - (255 - glowRgb[2] * 0.5) * k * 0.8, s.bg[1] - (255 - glowRgb[1] * 0.4) * k * 0.8, s.bg[2] - (180 - glowRgb[0] * 0.3) * k * 0.6]
        }
        img.data[o] = rgb[0]
        img.data[o + 1] = rgb[1]
        img.data[o + 2] = rgb[2]
        img.data[o + 3] = 255
      }
      octx.putImageData(img, 0, s.row)
    }
    ctx.drawImage(s.off, 0, 0, c.w, c.h)
    void t
  },
})

/* ---------- 三角関数：回る円を足して矩形波を作る（フーリエ級数） ---------- */

export const fourierSquare = scene({
  init: () => ({ trace: [] as number[] }),
  frame(c, s, t, dt) {
    const { ctx, w, h } = c
    clear(c)
    const terms = Math.min(12, 1 + Math.floor(t / 0.8))
    const R = Math.min(w, h) * 0.16
    const cx = w * 0.24
    const cy = h * 0.5
    const ang = t * 1.6
    let x = cx
    let y = cy
    ctx.lineWidth = 1
    for (let k = 0; k < terms; k++) {
      const n = 2 * k + 1
      const r = (R * 4) / (Math.PI * n)
      ctx.strokeStyle = hsl(190 + k * 14, 60, light(c, 55), 0.45)
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.stroke()
      const nx = x + r * Math.cos(n * ang)
      const ny = y - r * Math.sin(n * ang)
      ctx.strokeStyle = hsl(190 + k * 14, 80, light(c, 65), 0.9)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(nx, ny)
      ctx.stroke()
      x = nx
      y = ny
    }
    // 最後の点の高さを、右へ流れる波として残す
    s.trace.unshift(y)
    const maxLen = Math.floor(w * 0.6)
    if (s.trace.length > maxLen) s.trace.length = maxLen
    const x0 = w * 0.42
    ctx.strokeStyle = hsl(30, 90, light(c, 62), 0.5)
    ctx.setLineDash([3, 4])
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x0, y)
    ctx.stroke()
    ctx.setLineDash([])
    glow(c)
    ctx.strokeStyle = hsl(30, 95, light(c, 62), 0.95)
    ctx.lineWidth = 2
    ctx.beginPath()
    s.trace.forEach((yy, i) => (i ? ctx.lineTo(x0 + i, yy) : ctx.moveTo(x0, yy)))
    ctx.stroke()
    ctx.globalCompositeOperation = 'source-over'
    void dt
  },
})

/* ---------- 数列：フィボナッチの正方形と黄金らせん ---------- */

export const goldenSpiral = scene({
  init: () => ({}),
  frame(c, _s, t, _dt, render) {
    if (!render) return
    const { ctx, w, h } = c
    clear(c)
    const F = [1, 1]
    for (let i = 2; i < 14; i++) F.push(F[i - 1] + F[i - 2])
    const count = Math.min(F.length, 2 + Math.floor(t * 1.4))
    // 正方形を時計回りに貼っていく。全体の大きさに合わせて縮める
    const squares: { x: number; y: number; s: number; dir: number }[] = []
    let minX = 0
    let minY = 0
    let maxX = 1
    let maxY = 1
    squares.push({ x: 0, y: 0, s: 1, dir: 0 })
    for (let i = 1; i < count; i++) {
      const s = F[i]
      const d = i % 4
      let x = 0
      let y = 0
      if (d === 1) [x, y] = [maxX, minY]
      else if (d === 2) [x, y] = [maxX - s, maxY]
      else if (d === 3) [x, y] = [minX - s, maxY - s]
      else [x, y] = [minX, minY - s]
      squares.push({ x, y, s, dir: d })
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + s)
      maxY = Math.max(maxY, y + s)
    }
    const k = Math.min((w * 0.86) / (maxX - minX), (h * 0.86) / (maxY - minY))
    const ox = w / 2 - ((minX + maxX) / 2) * k
    const oy = h / 2 - ((minY + maxY) / 2) * k
    squares.forEach((q, i) => {
      ctx.fillStyle = hsl(40 + i * 23, 70, light(c, 50), 0.16)
      ctx.strokeStyle = hsl(40 + i * 23, 70, light(c, 60), 0.6)
      ctx.lineWidth = 1
      ctx.fillRect(ox + q.x * k, oy + q.y * k, q.s * k, q.s * k)
      ctx.strokeRect(ox + q.x * k, oy + q.y * k, q.s * k, q.s * k)
    })
    // 各正方形に 4 分の 1 円を描くと、らせんになる
    glow(c)
    ctx.strokeStyle = hsl(45, 95, light(c, 65), 0.95)
    ctx.lineWidth = 2.4
    ctx.beginPath()
    squares.forEach((q, i) => {
      const d = i === 0 ? 0 : q.dir
      const centers = [
        [q.x + q.s, q.y + q.s, Math.PI, Math.PI * 1.5],
        [q.x, q.y + q.s, Math.PI * 1.5, Math.PI * 2],
        [q.x, q.y, 0, Math.PI * 0.5],
        [q.x + q.s, q.y, Math.PI * 0.5, Math.PI],
      ][d]
      ctx.moveTo(ox + (centers[0] + q.s * Math.cos(centers[2])) * k, oy + (centers[1] + q.s * Math.sin(centers[2])) * k)
      ctx.arc(ox + centers[0] * k, oy + centers[1] * k, q.s * k, centers[2], centers[3])
    })
    ctx.stroke()
    ctx.globalCompositeOperation = 'source-over'
  },
})

/* ---------- 再帰：紙を半分に折り続けて開くとドラゴン曲線 ---------- */

export const dragon = scene({
  init: () => {
    // 折り目の向き（右折 1 / 左折 -1）を 13 回折った分だけ作る
    let turns: number[] = []
    for (let i = 0; i < 13; i++) turns = [...turns, 1, ...turns.map((x) => -x).reverse()]
    return { turns }
  },
  frame(c, s, t, _dt, render) {
    if (!render) return
    const { ctx, w, h } = c
    clear(c)
    const level = Math.min(13, 1 + Math.floor(t * 1.1))
    const n = 2 ** level - 1
    // 回数を増やすと 45° ずつ回るので、向きを戻して同じ向きに見せる
    let a = (level * Math.PI) / 4
    const pts: [number, number][] = [[0, 0]]
    for (let i = 0; i <= n; i++) {
      const [x, y] = pts[pts.length - 1]
      pts.push([x + Math.cos(a), y + Math.sin(a)])
      if (i < n) a += (s.turns[i] * Math.PI) / 2
    }
    // 全体が枠に収まるように縮めて、真ん中に置く
    const xs = pts.map((p) => p[0])
    const ys = pts.map((p) => p[1])
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
    const k = Math.min((w * 0.84) / Math.max(1, x1 - x0), (h * 0.74) / Math.max(1, y1 - y0))
    const ox = w / 2 - ((x0 + x1) / 2) * k
    const oy = h * 0.44 - ((y0 + y1) / 2) * k
    glow(c)
    ctx.lineWidth = Math.max(1, Math.min(3, k * 0.4))
    ctx.lineCap = 'round'
    for (let i = 0; i < pts.length - 1; i++) {
      ctx.strokeStyle = hsl(260 + (i / n) * 140, 85, light(c, 60), 0.95)
      ctx.beginPath()
      ctx.moveTo(ox + pts[i][0] * k, oy + pts[i][1] * k)
      ctx.lineTo(ox + pts[i + 1][0] * k, oy + pts[i + 1][1] * k)
      ctx.stroke()
    }
    ctx.globalCompositeOperation = 'source-over'
  },
})
