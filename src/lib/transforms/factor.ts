import type { MathNode } from 'mathjs'
import {
  commonFactor,
  degree,
  divideByRoot,
  isInt,
  linearFactor,
  monoTex,
  numStr,
  numTex,
  polyOf,
  polyStr,
  polyTex,
  rationalRoot,
  trim,
  type Poly,
} from './poly'
import { hot, type Move, type TransformResult } from './types'

type Factor = { tex: string; str: string; pow: number }

/** 2 次式を 1 次式 2 つに分ける方法と結果。分けられなければ null */
export function splitQuadratic(q: Poly, v: string) {
  const [c, b, a] = q
  const D = b * b - 4 * a * c
  const s = Math.sqrt(D)
  if (!(D >= 0 && isInt(s) && q.every(isInt))) return { D, parts: null }
  const r1 = (-b + s) / (2 * a)
  const r2 = (-b - s) / (2 * a)
  const f1 = linearFactor(r1, v)
  const f2 = linearFactor(r2, v)
  const rest = a / (f1.scale * f2.scale)
  let how: 'square' | 'diff' | 'sumprod' | 'tasuki'
  if (D === 0) how = 'square'
  else if (b === 0) how = 'diff'
  else if (a === 1 && isInt(r1) && isInt(r2)) how = 'sumprod'
  else how = 'tasuki'
  return { D, parts: { r1, r2, f1, f2, rest, how } }
}

export function factorize(node: MathNode): TransformResult {
  const P = polyOf(node)
  if (!P || degree(P.poly) < 1) return { ok: false, error: '1 つの文字の多項式を入れてください（例: x^2 - 5x + 6）' }
  const { v } = P
  const p = trim(P.poly)
  if (!p.every(isInt)) return { ok: false, error: '係数が整数の多項式にしてください' }

  const moves: Move[] = []
  // 外にくくり出した係数 outG と x の次数 outK
  let outG = 1
  let outK = 0
  const facs: Factor[] = []
  let rest: Poly = p

  const addFactor = (f: { tex: string; str: string }, pow = 1) => {
    const same = facs.find((x) => x.tex === f.tex)
    if (same) same.pow += pow
    else facs.push({ ...f, pow })
  }
  /** 今の積を TeX に。hl に入れた因数は色付け */
  const render = (hl: Set<string> = new Set()) => {
    const parts: string[] = []
    // 残りが定数になったら、外の係数に掛けてまとめる
    const c = outG * (degree(rest) === 0 ? rest[0] : 1)
    if (Math.abs(c - 1) > 1e-9 || outK > 0) {
      const t = c === -1 && outK === 0 ? '-' : monoTex(c, outK, v)
      parts.push(hl.has('out') ? hot(t) : t)
    }
    for (const f of facs) {
      const t = `\\left(${f.tex}\\right)${f.pow > 1 ? `^{${f.pow}}` : ''}`
      parts.push(hl.has(f.tex) ? hot(t) : t)
    }
    if (degree(rest) > 0) {
      const inner = polyTex(rest, v)
      const t = parts.length ? `\\left(${inner}\\right)` : inner
      parts.push(hl.has('rest') ? hot(t) : t)
    }
    return parts.join('') || '1'
  }
  const resultStr = () =>
    [`${numStr(outG)}*${v}^${outK}`, ...facs.map((f) => `(${f.str})^${f.pow}`), degree(rest) > 0 ? `(${polyStr(rest, v)})` : numStr(rest[0])].join('*')

  // 1. 共通因数
  const { g, k } = commonFactor(p)
  if (Math.abs(g) !== 1 || k > 0) {
    rest = trim(p.slice(k).map((c) => c / g))
    outG = g
    outK = k
    moves.push({ label: '共通因数でくくる', tex: render(new Set(['out'])), sub: `${hot(monoTex(g, k, v))}\\ \\text{がすべての項に共通}` })
  }

  // 2. 3 次以上: 因数定理で 1 次の因数を見つける
  for (let guard = 0; degree(rest) >= 3 && guard < 10; guard++) {
    const r = rationalRoot(rest)
    if (r === null) break
    const lf = linearFactor(r, v)
    rest = trim(divideByRoot(rest, r).map((c) => c / lf.scale))
    addFactor(lf)
    moves.push({
      label: '因数定理で 1 次の因数を見つける',
      tex: render(new Set([lf.tex])),
      sub: `P(${numTex(r)})=0 \\ \\Rightarrow\\ ${hot(lf.tex)}\\ \\text{で割り切れる}`,
    })
  }

  // 3. 2 次式を分ける
  if (degree(rest) === 2) {
    const q = rest
    const { D, parts } = splitQuadratic(q, v)
    if (parts) {
      const { r1, r2, f1, f2, how } = parts
      if (how === 'sumprod') {
        moves.push({
          label: `足して ${q[1]}、掛けて ${q[0]} になる 2 数を探す`,
          tex: render(),
          sub: `${-r1}+(${-r2})=${q[1]},\\quad ${-r1}\\times(${-r2})=${q[0]}`,
        })
      }
      const before = polyTex(q, v)
      rest = [parts.rest]
      if (how === 'square') addFactor(f1, 2)
      else {
        addFactor(f1)
        addFactor(f2)
      }
      const label = {
        square: '完全平方式 (A ± B)² の形にする',
        diff: '平方の差 A² − B² = (A + B)(A − B) を使う',
        sumprod: '(x + m)(x + n) の形にする',
        tasuki: 'たすき掛けで 1 次式 2 つに分ける',
      }[how]
      moves.push({ label, tex: render(new Set([f1.tex, f2.tex])), sub: `${before}\\ \\Rightarrow\\ ${hot(how === 'square' ? `(${f1.tex})^2` : `(${f1.tex})(${f2.tex})`)}` })
    } else {
      moves.push({
        label: '整数の範囲ではこれ以上因数分解できない',
        tex: render(),
        sub: `D=${numTex(D)}${D < 0 ? '<0' : '\\ \\text{は平方数でない}'}`,
      })
    }
  } else if (degree(rest) >= 3) {
    moves.push({ label: '有理数の範囲で見つかる因数はここまで', tex: render() })
  }

  return { ok: true, start: polyTex(p, v), moves, result: resultStr() }
}
