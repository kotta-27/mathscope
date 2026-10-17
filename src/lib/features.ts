/** グラフの目印になる点（x 軸との交点・y 軸との交点・極大・極小・2 つのグラフの交点）を数値的に探す */

export type Feature = { x: number; y: number; kind: 'root' | 'yint' | 'max' | 'min' | 'cross' }

const N = 600

function bisect(f: (x: number) => number, a: number, b: number) {
  let fa = f(a)
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2
    const fm = f(m)
    if (fm === 0) return m
    if (Math.sign(fm) === Math.sign(fa)) [a, fa] = [m, fm]
    else b = m
  }
  return (a + b) / 2
}

/** 黄金分割探索で、[a, b] の極大（sign = 1）・極小（sign = -1）の位置 */
function golden(f: (x: number) => number, a: number, b: number, sign: number) {
  const g = (Math.sqrt(5) - 1) / 2
  let c = b - g * (b - a)
  let d = a + g * (b - a)
  for (let i = 0; i < 60; i++) {
    if (sign * f(c) > sign * f(d)) b = d
    else a = c
    c = b - g * (b - a)
    d = a + g * (b - a)
  }
  return (a + b) / 2
}

/** f の値が連続とみなせるか（漸近線をまたいだ符号の変化を交点と見なさない） */
const near = (a: number, b: number, span: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < span

function zeros(f: (x: number) => number, x0: number, x1: number, span: number) {
  const out: number[] = []
  const h = (x1 - x0) / N
  let px = x0
  let py = f(px)
  for (let i = 1; i <= N; i++) {
    const x = x0 + i * h
    const y = f(x)
    if (py === 0) out.push(px)
    else if (near(py, y, span) && Math.sign(py) !== Math.sign(y) && y !== 0) {
      const r = bisect(f, px, x)
      if (Math.abs(f(r)) < span * 1e-3) out.push(r)
    }
    px = x
    py = y
  }
  return out
}

function extrema(f: (x: number) => number, x0: number, x1: number, span: number) {
  const out: Feature[] = []
  const h = (x1 - x0) / N
  const ys = Array.from({ length: N + 1 }, (_, i) => f(x0 + i * h))
  for (let i = 1; i < N; i++) {
    const [a, b, c] = [ys[i - 1], ys[i], ys[i + 1]]
    if (!near(a, b, span) || !near(b, c, span)) continue
    const kind = b > a && b >= c ? 'max' : b < a && b <= c ? 'min' : null
    if (!kind) continue
    // 平らな直線（定数）は除く
    if (Math.abs(b - a) + Math.abs(c - b) < span * 1e-9) continue
    const x = golden(f, x0 + (i - 1) * h, x0 + (i + 1) * h, kind === 'max' ? 1 : -1)
    out.push({ x, y: f(x), kind })
  }
  return out
}

/** 表示範囲 [x0, x1]（縦の幅 span）の中の目印の点。fs はグラフの関数 */
export function findFeatures(fs: ((x: number) => number)[], x0: number, x1: number, span: number): Feature[][] {
  return fs.map((f, i) => {
    const pts: Feature[] = [...zeros(f, x0, x1, span).map((x) => ({ x, y: 0, kind: 'root' as const })), ...extrema(f, x0, x1, span)]
    const y0 = f(0)
    if (x0 <= 0 && 0 <= x1 && Number.isFinite(y0) && Math.abs(y0) > 1e-9) pts.push({ x: 0, y: y0, kind: 'yint' })
    for (let j = i + 1; j < fs.length; j++) {
      const g = fs[j]
      for (const x of zeros((t) => f(t) - g(t), x0, x1, span)) pts.push({ x, y: f(x), kind: 'cross' })
    }
    // 近すぎる点はまとめる
    const tol = (x1 - x0) / 300
    return pts.filter((p, k) => Number.isFinite(p.y) && !pts.slice(0, k).some((q) => Math.abs(q.x - p.x) < tol && Math.abs(q.y - p.y) < span / 300))
  })
}
