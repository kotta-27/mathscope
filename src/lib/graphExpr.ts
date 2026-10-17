import type { MathNode } from 'mathjs'
import { parseExpr, type Parsed } from './math'

/**
 * グラフタブの 1 行を読む。書き方から次の種類を見分ける。
 * - y = f(x)（いちばんふつう。「y =」は省いてよい）
 * - x と y の関係式: x^2 + y^2 = 4 → F(x, y) = 0 の曲線
 * - 不等式: y > x^2、x^2 + y^2 <= 4 → 領域
 * - 媒介変数: (cos t, sin 2t) → t を 0〜2π で動かした点
 * - 極座標: r = 1 + cos θ → θ を 0〜2π で動かした点
 */
export type Op = '<' | '<=' | '>' | '>='
type Ok = Extract<Parsed, { ok: true }>

export type Curve =
  | { kind: 'fn'; f: Ok }
  | { kind: 'implicit'; F: Ok }
  | { kind: 'region'; F: Ok; op: Op }
  | { kind: 'param'; x: Ok; y: Ok }
  | { kind: 'polar'; r: Ok }

export type GraphExpr =
  | {
      ok: true
      curve: Curve
      /** 入力欄に渡す読み取り結果 */
      parsed: Parsed
      /** スライダーにする文字（x, y, t, θ などの変数を除く） */
      symbols: string[]
      /** 式の表示に使う部品と、つなぎ方 */
      parts: MathNode[]
      join: (tex: string[]) => string
    }
  | { ok: false; parsed: Parsed }

const VARS: Record<Curve['kind'], string[]> = {
  fn: ['x'],
  implicit: ['x', 'y'],
  region: ['x', 'y'],
  param: ['t'],
  polar: ['theta'],
}

/** 一番外側（括弧の外）にある記号の位置 */
function topLevel(s: string, re: RegExp): { i: number; m: string } | null {
  let depth = 0
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === '(' || c === '[' || c === '{') depth++
    else if (c === ')' || c === ']' || c === '}') depth--
    else if (depth === 0) {
      const m = re.exec(s.slice(i))
      if (m && m.index === 0) return { i, m: m[0] }
    }
  }
  return null
}

const fail = (error: string, normalized: string, pos?: number): GraphExpr => ({ ok: false, parsed: { ok: false, error, normalized, pos } })

/** 左辺・右辺をそれぞれ読み、エラーにはどちらの辺かを付ける */
function sides(l: string, r: string, op: string) {
  const a = parseExpr(l)
  const b = parseExpr(r)
  const normalized = `${a.normalized} ${op} ${b.normalized}`
  if (!a.ok) return { error: fail(`左辺: ${a.error}`, normalized) }
  if (!b.ok) return { error: fail(`右辺: ${b.error}`, normalized) }
  const F = parseExpr(`(${a.normalized}) - (${b.normalized})`)
  if (!F.ok) return { error: fail(F.error, normalized) }
  return { a, b, F, normalized }
}

const OP_TEX: Record<Op, string> = { '<': '<', '<=': '\\le', '>': '>', '>=': '\\ge' }

export function readGraphExpr(src: string): GraphExpr {
  // NFKC は ² を 2 にしてしまうので使わず、見分けに使う記号だけを半角にする
  const s = src
    .replace(/[＜]/g, '<')
    .replace(/[＞]/g, '>')
    .replace(/[＝]/g, '=')
    .replace(/[（]/g, '(')
    .replace(/[）]/g, ')')
    .replace(/[，、]/g, ',')
    .replace(/[≦≤]/g, '<=')
    .replace(/[≧≥]/g, '>=')
    .replace(/θ/g, 'theta')
    .trim()
  // θ と書いた人には、読み取りも θ で見せる
  const greek = (p: Ok): Ok => (src.includes('θ') ? { ...p, normalized: p.normalized.replace(/theta/g, 'θ') } : p)
  const done = (curve: Curve, parsed: Ok, parts: MathNode[], join: (t: string[]) => string, symbols: string[]): GraphExpr => ({
    ok: true,
    curve,
    parsed: greek(parsed),
    parts,
    join,
    symbols: symbols.filter((x) => !VARS[curve.kind].includes(x)),
  })

  // 媒介変数: (f(t), g(t))
  if (/^\(.*\)$/.test(s)) {
    const inner = s.slice(1, -1)
    const comma = topLevel(inner, /,/)
    if (comma) {
      const a = parseExpr(inner.slice(0, comma.i))
      const b = parseExpr(inner.slice(comma.i + 1))
      const normalized = `(${a.normalized}, ${b.normalized})`
      if (!a.ok) return fail(`x 座標: ${a.error}`, normalized)
      if (!b.ok) return fail(`y 座標: ${b.error}`, normalized)
      const parsed: Ok = { ...a, normalized, symbols: [...new Set([...a.symbols, ...b.symbols])].sort() }
      return done({ kind: 'param', x: a, y: b }, parsed, [a.node, b.node], ([x, y]) => `(x,\\ y)=\\left(${x},\\ ${y}\\right)`, parsed.symbols)
    }
  }

  const cmp = topLevel(s, /<=|>=|<|>|=/)
  if (!cmp) {
    const f = parseExpr(s)
    if (!f.ok) return { ok: false, parsed: f }
    return done({ kind: 'fn', f }, f, [f.node], ([t]) => `y = ${t}`, f.symbols)
  }

  const l = s.slice(0, cmp.i).trim()
  const r = s.slice(cmp.i + cmp.m.length).trim()
  if (!l || !r) return fail(`「${cmp.m}」の${l ? '右' : '左'}側に式を入れてください`, s)
  if (topLevel(r, /<=|>=|<|>|=/)) return fail('等号・不等号は 1 つだけにしてください', s)

  if (cmp.m === '=') {
    // y = f(x) / f(x) = …（右辺に y がなければ、ふつうの関数）
    if (/^(y|f\(x\))$/.test(l.replace(/\s+/g, ''))) {
      const f = parseExpr(r)
      if (!f.ok) return { ok: false, parsed: f }
      if (!f.symbols.includes('y')) return done({ kind: 'fn', f }, f, [f.node], ([t]) => `y = ${t}`, f.symbols)
    }
    // 極座標: r = f(θ)
    if (l === 'r') {
      const f = parseExpr(r)
      if (!f.ok) return { ok: false, parsed: f }
      if (f.symbols.includes('theta')) return done({ kind: 'polar', r: f }, { ...f, normalized: `r = ${f.normalized}` }, [f.node], ([t]) => `r = ${t}`, f.symbols)
    }
    const x = sides(l, r, '=')
    if ('error' in x) return x.error as GraphExpr
    return done({ kind: 'implicit', F: x.F }, { ...x.F, normalized: x.normalized }, [x.a.node, x.b.node], ([a, b]) => `${a} = ${b}`, x.F.symbols)
  }

  const op = cmp.m as Op
  const x = sides(l, r, op)
  if ('error' in x) return x.error as GraphExpr
  return done({ kind: 'region', F: x.F, op }, { ...x.F, normalized: x.normalized }, [x.a.node, x.b.node], ([a, b]) => `${a} ${OP_TEX[op]} ${b}`, x.F.symbols)
}

/** 不等号が成り立つか */
export const holds = (v: number, op: Op) => (op === '<' ? v < 0 : op === '<=' ? v <= 0 : op === '>' ? v > 0 : v >= 0)
