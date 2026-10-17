import { rationalize, type MathNode } from 'mathjs'

/** 1 変数の多項式。係数を次数の低い順に持つ（c[0] + c[1] x + c[2] x² …） */
export type Poly = number[]

const EPS = 1e-9

export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))

export function trim(p: Poly): Poly {
  const q = p.slice()
  while (q.length > 1 && Math.abs(q[q.length - 1]) < EPS) q.pop()
  return q
}
export const degree = (p: Poly) => trim(p).length - 1
export const lead = (p: Poly) => trim(p)[degree(p)]
export const evalPoly = (p: Poly, x: number) => p.reduceRight((acc, c) => acc * x + c, 0)
export const isInt = (x: number) => Math.abs(x - Math.round(x)) < EPS

/** rationalize(…, true) の戻り値。型定義にない numerator / denominator も実際には返る */
export type RationalDetail = {
  expression: MathNode
  variables: string[]
  coefficients: unknown[]
  numerator?: MathNode
  denominator?: MathNode
}
export function rationalDetail(node: MathNode): RationalDetail | null {
  try {
    return rationalize(node, {}, true) as unknown as RationalDetail
  } catch {
    return null
  }
}

/** 式を 1 変数の多項式として読む。分数式・2 変数以上・多項式でないものは null */
export function polyOf(node: MathNode): { poly: Poly; v: string } | null {
  const r = rationalDetail(node)
  if (!r) return null
  if (r.denominator || r.variables.length > 1) return null
  if (r.variables.length === 0) {
    const val = Number(node.evaluate())
    return Number.isFinite(val) ? { poly: [val], v: 'x' } : null
  }
  return { poly: trim(r.coefficients.map(Number)), v: r.variables[0] }
}

/** 小数を分数で近似する（分母 1000 まで）。[分子, 分母]（分母は正） */
export function frac(x: number): [number, number] | null {
  for (let d = 1; d <= 1000; d++) {
    const n = Math.round(x * d)
    if (Math.abs(n / d - x) < EPS) {
      const g = gcd(Math.abs(n), d) || 1
      return [n / g, d / g]
    }
  }
  return null
}

/** 数を TeX に（整数・分数・小数） */
export function numTex(x: number): string {
  if (Math.abs(x) < EPS) return '0'
  const f = frac(x)
  if (!f) return String(Number(x.toPrecision(6)))
  const [n, d] = f
  if (d === 1) return String(n)
  return `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`
}
/** 数を mathjs が読める文字列に */
export function numStr(x: number): string {
  const f = frac(x)
  if (!f) return String(x)
  const [n, d] = f
  return d === 1 ? String(n) : `(${n}/${d})`
}

const varPow = (v: string, i: number) => (i === 0 ? '' : i === 1 ? v : `${v}^{${i}}`)

/** 多項式を TeX に（次数の高い順） */
export function polyTex(p: Poly, v: string): string {
  const q = trim(p)
  const parts: string[] = []
  for (let i = q.length - 1; i >= 0; i--) {
    const c = q[i]
    if (Math.abs(c) < EPS) continue
    const abs = Math.abs(c)
    const body = (abs === 1 && i > 0 ? '' : numTex(abs)) + varPow(v, i)
    if (!parts.length) parts.push((c < 0 ? '-' : '') + body)
    else parts.push(`${c < 0 ? '-' : '+'} ${body}`)
  }
  return parts.length ? parts.join(' ') : '0'
}
/** 多項式を mathjs が読める文字列に */
export function polyStr(p: Poly, v: string): string {
  const q = trim(p)
  const parts: string[] = []
  for (let i = q.length - 1; i >= 0; i--) {
    if (Math.abs(q[i]) < EPS) continue
    parts.push(`${numStr(q[i])}*${v}^${i}`)
  }
  return parts.length ? parts.join(' + ') : '0'
}

/** (x - r) で割った商（組立除法）。割り切れる前提 */
export function divideByRoot(p: Poly, r: number): Poly {
  const desc = trim(p).slice().reverse()
  const q = [desc[0]]
  for (let i = 1; i < desc.length - 1; i++) q.push(desc[i] + q[i - 1] * r)
  return q.reverse()
}

const divisors = (n: number) => {
  n = Math.abs(Math.round(n))
  const out: number[] = []
  for (let d = 1; d <= n; d++) if (n % d === 0) out.push(d)
  return out
}

/** 整数係数の多項式の有理数の根を 1 つ探す（有理根定理）。0 は除く */
export function rationalRoot(p: Poly): number | null {
  const q = trim(p)
  if (!q.every(isInt)) return null
  const a0 = q[0]
  const an = q[q.length - 1]
  if (Math.abs(a0) < EPS) return 0
  const cands: number[] = []
  for (const num of divisors(a0)) for (const den of divisors(an)) cands.push(num / den, -num / den)
  cands.sort((a, b) => Math.abs(a) - Math.abs(b) || b - a)
  return cands.find((r) => Math.abs(evalPoly(q, r)) < 1e-7) ?? null
}

/** 根 r = n/d の 1 次の因数 (d·x − n) を TeX と文字列で */
export function linearFactor(r: number, v: string): { tex: string; str: string; scale: number } {
  const [n, d] = frac(r) ?? [r, 1]
  const xs = d === 1 ? v : `${d}${v}`
  const tex = n === 0 ? v : `${xs} ${n > 0 ? '-' : '+'} ${Math.abs(n)}`
  const str = n === 0 ? v : `(${d}*${v} - (${n}))`
  return { tex, str, scale: d }
}

/** 係数の最大公約数（符号は最高次の係数に合わせる）と、最も低い次数 */
export function commonFactor(p: Poly): { g: number; k: number } {
  const q = trim(p)
  const nz = q.filter((c) => Math.abs(c) > EPS)
  let g = nz.every(isInt) ? nz.reduce((a, c) => gcd(a, Math.round(c)), 0) : 1
  if (q[q.length - 1] < 0) g = -g
  const k = q.findIndex((c) => Math.abs(c) > EPS)
  return { g: g || 1, k: Math.max(0, k) }
}

/** 単項式 g·x^k の TeX（g = ±1 なら係数を省く） */
export function monoTex(g: number, k: number, v: string): string {
  const coef = Math.abs(g) === 1 && k > 0 ? (g < 0 ? '-' : '') : numTex(g)
  return coef + varPow(v, k)
}

/** 多項式の最大公約式（ユークリッドの互除法）。最高次の係数を 1 にして返す */
export function polyGcd(a: Poly, b: Poly): Poly {
  let x = trim(a)
  let y = trim(b)
  while (degree(y) > 0 || Math.abs(y[0]) > EPS) {
    if (degree(y) === 0) return [1]
    const r = polyRem(x, y)
    x = y
    y = r
  }
  const l = lead(x)
  return x.map((c) => c / l)
}
function polyRem(a: Poly, b: Poly): Poly {
  let r = trim(a).slice()
  const db = degree(b)
  const lb = lead(b)
  while (degree(r) >= db && !(degree(r) === 0 && Math.abs(r[0]) < EPS)) {
    const k = lead(r) / lb
    const shift = degree(r) - db
    for (let i = 0; i <= db; i++) r[i + shift] -= k * b[i]
    r = trim(r)
    if (degree(r) === 0 && Math.abs(r[0]) < EPS) break
  }
  return r
}
/** 多項式の割り算（割り切れる前提） */
export function polyDiv(a: Poly, b: Poly): Poly {
  let r = trim(a).slice()
  const db = degree(b)
  const lb = lead(b)
  const q = new Array(Math.max(1, degree(a) - db + 1)).fill(0)
  while (degree(r) >= db && !(degree(r) === 0 && Math.abs(r[0]) < EPS)) {
    const k = lead(r) / lb
    const shift = degree(r) - db
    q[shift] = k
    for (let i = 0; i <= db; i++) r[i + shift] -= k * b[i]
    r = trim(r)
  }
  return trim(q)
}
/** 係数を整数にそろえる（分母の最小公倍数を掛ける） */
export function toIntPoly(p: Poly): Poly {
  let l = 1
  for (const c of p) {
    const f = frac(c)
    if (f) l = (l * f[1]) / gcd(l, f[1])
  }
  return p.map((c) => Math.round(c * l * 1e9) / 1e9)
}
