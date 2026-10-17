import { parseExpr, type Parsed } from '../math'
import { gcd, isInt, numTex } from './poly'
import { hot, type Move, type TransformResult } from './types'

/** 「,」「;」「、」か改行で区切った 2 つの式に分ける */
export const splitSystem = (src: string) =>
  src
    .normalize('NFKC')
    .split(/[,;、\n]/)
    .map((s) => s.trim())
    .filter(Boolean)

type Lin = { a: number; b: number; c: number }

/** 1 次方程式を a·x + b·y = c の係数にする（数値で確かめる） */
function linear(eq: string, vx: string, vy: string): Lin | null {
  const [l, r] = eq.split('=')
  const F = parseExpr(`(${l}) - (${r})`)
  if (!F.ok) return null
  const f = (x: number, y: number) => {
    try {
      return Number(F.node.evaluate({ [vx]: x, [vy]: y }))
    } catch {
      return NaN
    }
  }
  const k = f(0, 0)
  const a = f(1, 0) - k
  const b = f(0, 1) - k
  // 1 次式か: 別の点でも同じ式で表せるか
  for (const [x, y] of [[2, 3], [-1, 4], [5, -2]]) if (Math.abs(f(x, y) - (a * x + b * y + k)) > 1e-7) return null
  return { a, b, c: -k }
}

const term = (k: number, v: string, first: boolean) => {
  if (Math.abs(k) < 1e-12) return ''
  const abs = Math.abs(k)
  const body = (Math.abs(abs - 1) < 1e-12 ? '' : numTex(abs)) + v
  return first ? `${k < 0 ? '-' : ''}${body}` : ` ${k < 0 ? '-' : '+'} ${body}`
}
const eqTex = (e: Lin, vx: string, vy: string) => `${term(e.a, vx, true)}${term(e.b, vy, Math.abs(e.a) < 1e-12) || ''} = ${numTex(e.c)}`
const sys = (a: string, b: string) => `\\begin{cases}${a}\\\\${b}\\end{cases}`

/** 入力欄用: 2 つの式をそれぞれ読む */
export function parseSystem(src: string): Parsed {
  const eqs = splitSystem(src)
  const normalized = eqs.join(', ')
  if (eqs.length !== 2) return { ok: false, error: '式を「,」で区切って 2 つ入れてください（例: 2x + y = 5, x − y = 1）', normalized }
  for (const [i, e] of eqs.entries()) {
    const sides = e.split('=')
    if (sides.length !== 2) return { ok: false, error: `${i + 1} つ目の式に「=」を 1 つ入れてください`, normalized }
    for (const s of sides) {
      const p = parseExpr(s)
      if (!p.ok) return { ok: false, error: `${i + 1} つ目の式: ${p.error}`, normalized }
    }
  }
  const all = parseExpr(eqs.map((e) => `(${e.replace('=', ')-(')})`).join('+'))
  return all.ok ? { ...all, normalized: eqs.map((e) => parseExpr(e.split('=')[0]).normalized + ' = ' + parseExpr(e.split('=')[1]).normalized).join(', ') } : all
}

/** 2 元 1 次の連立方程式を、加減法で解く */
export function solveSystem(src: string): TransformResult {
  const eqs = splitSystem(src)
  if (eqs.length !== 2) return { ok: false, error: '式を「,」で区切って 2 つ入れてください' }
  const syms = new Set<string>()
  for (const e of eqs)
    for (const s of e.split('=')) {
      const p = parseExpr(s)
      if (!p.ok) return { ok: false, error: p.error }
      p.symbols.forEach((x) => syms.add(x))
    }
  const vars = [...syms].sort()
  if (vars.length !== 2) return { ok: false, error: '文字を 2 つ使った式にしてください（例: x と y）' }
  const [vx, vy] = vars
  const e1 = linear(eqs[0], vx, vy)
  const e2 = linear(eqs[1], vx, vy)
  if (!e1 || !e2) return { ok: false, error: '1 次の式（x² や xy を含まない式）にしてください' }
  const start = sys(...(eqs.map((e) => {
    const [l, r] = e.split('=')
    const L = parseExpr(l)
    const R = parseExpr(r)
    return L.ok && R.ok ? `${L.normalized.replace(/\*/g, '')} = ${R.normalized}` : e
  }) as [string, string]))
  const moves: Move[] = []
  moves.push({ label: `どちらも「${vx} の項 + ${vy} の項 = 数」の形に整える`, tex: sys(eqTex(e1, vx, vy), eqTex(e2, vx, vy)) })

  const det = e1.a * e2.b - e2.a * e1.b
  if (Math.abs(det) < 1e-12) {
    const same = Math.abs(e1.a * e2.c - e2.a * e1.c) < 1e-9 && Math.abs(e1.b * e2.c - e2.b * e1.c) < 1e-9
    moves.push({
      label: same ? '2 つの式は同じ直線を表す（片方を何倍かするともう片方になる）' : '左辺をそろえると右辺が食い違う（2 本の直線が平行）',
      tex: same ? hot('\\text{解は無数にある}') : hot('\\text{解なし}'),
    })
    return { ok: true, start, moves }
  }

  // y を消す: y の係数の絶対値をそろえる（整数なら最小公倍数）
  let k1 = e2.b
  let k2 = e1.b
  if ([e1.b, e2.b].every(isInt) && e1.b !== 0 && e2.b !== 0) {
    const g = gcd(Math.abs(e1.b), Math.abs(e2.b))
    k1 = e2.b / g
    k2 = e1.b / g
  }
  if (Math.abs(e1.b) < 1e-12 || Math.abs(e2.b) < 1e-12) {
    // 片方に y がないなら、そこから x がすぐ出る
    k1 = Math.abs(e1.b) < 1e-12 ? 1 : 0
    k2 = Math.abs(e2.b) < 1e-12 ? 1 : 0
  }
  const s1: Lin = { a: e1.a * k1, b: e1.b * k1, c: e1.c * k1 }
  const s2: Lin = { a: e2.a * k2, b: e2.b * k2, c: e2.c * k2 }
  if (k1 !== 0 && k2 !== 0 && (Math.abs(k1) !== 1 || Math.abs(k2) !== 1))
    moves.push({ label: `${vy} の係数をそろえるため、上の式を ${numTex(k1)} 倍、下の式を ${numTex(k2)} 倍する`, tex: sys(hot(eqTex(s1, vx, vy)), hot(eqTex(s2, vx, vy))) })
  let x: number
  if (k1 !== 0 && k2 !== 0) {
    const A = s1.a - s2.a
    const Cc = s1.c - s2.c
    moves.push({ label: `上の式から下の式を引いて、${vy} を消す`, tex: `${hot(`${term(A, vx, true)} = ${numTex(Cc)}`)}` })
    x = Cc / A
    if (Math.abs(A - 1) > 1e-12) moves.push({ label: `両辺を ${numTex(A)} で割る`, tex: `${vx} = ${hot(numTex(x))}` })
  } else {
    const e = k1 ? e1 : e2
    x = e.c / e.a
    moves.push({ label: `${vy} を含まない式から ${vx} を求める`, tex: `${vx} = ${hot(numTex(x))}` })
  }
  // 代入して y
  const base = Math.abs(e1.b) > 1e-12 ? e1 : e2
  const y = (base.c - base.a * x) / base.b
  moves.push({
    label: `${vx} = ${numTex(x).replace(/\\frac\{(-?\d+)\}\{(\d+)\}/, '$1/$2')} を${base === e1 ? '上' : '下'}の式に代入して ${vy} を求める`,
    tex: `${numTex(base.a)} \\cdot ${x < 0 ? `(${numTex(x)})` : numTex(x)} ${base.b < 0 ? '-' : '+'} ${Math.abs(Math.abs(base.b) - 1) < 1e-12 ? '' : numTex(Math.abs(base.b))}${vy} = ${numTex(base.c)}\\quad\\Rightarrow\\quad ${vy} = ${hot(numTex(y))}`,
  })
  moves.push({ label: '解', tex: `(${vx},\\ ${vy}) = ${hot(`\\left(${numTex(x)},\\ ${numTex(y)}\\right)`)}` })
  return { ok: true, start, moves, roots: [x, y] }
}
