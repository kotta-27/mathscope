import { ConstantNode, isOperatorNode, isParenthesisNode, simplify, type MathNode } from 'mathjs'
import { freeSymbols, texOf } from '../math'
import { expand } from './expand'
import { degree, polyDiv, polyGcd, polyOf, polyStr, polyTex, toIntPoly, type Poly } from './poly'
import { rationalDetail } from './poly'
import { hot, type Move, type TransformResult } from './types'

const paren = (p: Poly, v: string) => (p.filter((c) => Math.abs(c) > 1e-12).length > 1 ? `\\left(${polyTex(p, v)}\\right)` : polyTex(p, v))

/** 整理: 分母に文字がなければ展開と同類項のまとめ。分数式なら通分と約分 */
export function tidy(node: MathNode): TransformResult {
  const hasVarDen = node.filter((n) => isOperatorNode(n) && n.fn === 'divide' && freeSymbols(n.args[1]).length > 0).length > 0
  if (!hasVarDen) {
    const r = expand(node)
    if (r.ok && !r.moves.length) {
      const s = simplify(node)
      if (s.toString() !== node.toString()) r.moves.push({ label: 'まとめて整理する', tex: hot(texOf(s)) })
      r.result = s.toString()
    }
    return r
  }

  const r = rationalDetail(node)
  if (!r || !r.numerator) return { ok: false, error: 'この式は整理できませんでした' }
  const num = r.numerator
  const den = r.denominator ?? new ConstantNode(1)
  const P = polyOf(num)
  const Q = polyOf(den)
  // 1 変数なら多項式の書き方（3·x ではなく 3x）で見せる
  const same = P && Q && (P.v === Q.v || degree(P.poly) === 0 || degree(Q.poly) === 0)
  const pv = P && Q ? (degree(P.poly) > 0 ? P.v : Q.v) : 'x'
  const numTex = same ? polyTex(P.poly, pv) : texOf(num)
  const denTex = same ? polyTex(Q.poly, pv) : texOf(den)
  const moves: Move[] = [{ label: '分母をそろえて 1 つの分数にする（通分）', tex: hot(`\\frac{${numTex}}{${denTex}}`) }]
  let result = `(${num.toString()}) / (${den.toString()})`
  if (P && Q && (P.v === Q.v || degree(P.poly) === 0 || degree(Q.poly) === 0)) {
    const v = degree(P.poly) > 0 ? P.v : Q.v
    const g = toIntPoly(polyGcd(P.poly, Q.poly))
    if (degree(g) > 0) {
      const n2 = polyDiv(P.poly, g)
      const d2 = polyDiv(Q.poly, g)
      const gt = hot(`\\left(${polyTex(g, v)}\\right)`)
      moves.push({ label: '分子と分母を、共通の因数が見えるように分ける', tex: `\\frac{${gt}${paren(n2, v)}}{${gt}${paren(d2, v)}}` })
      const one = degree(d2) === 0 && Math.abs(d2[0] - 1) < 1e-9
      moves.push({
        label: '共通の因数で約分する',
        tex: hot(one ? polyTex(n2, v) : `\\frac{${polyTex(n2, v)}}{${polyTex(d2, v)}}`),
        sub: `${polyTex(g, v)} \\ne 0\\ \\text{のとき}`,
      })
      result = `(${polyStr(n2, v)}) / (${polyStr(d2, v)})`
    }
  }
  // 分数の分子・分母を囲む括弧は、分数の線があれば要らないので外して見せる
  const plain = node.transform((x, _path, parent) =>
    isParenthesisNode(x) && parent && isOperatorNode(parent) && parent.fn === 'divide' ? x.content : x,
  )
  return { ok: true, start: texOf(plain), moves, result }
}
