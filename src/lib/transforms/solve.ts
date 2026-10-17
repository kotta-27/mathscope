import { OperatorNode, isConstantNode } from 'mathjs'
import { parseExpr, texOf } from '../math'
import {
  commonFactor,
  degree,
  divideByRoot,
  gcd,
  isInt,
  linearFactor,
  monoTex,
  numTex,
  polyOf,
  polyTex,
  rationalRoot,
  trim,
  type Poly,
} from './poly'
import { splitQuadratic } from './factor'
import { hot, type Move, type TransformResult } from './types'

const plain = (x: number) => (isInt(x) ? String(Math.round(x)) : String(Number(x.toPrecision(6))))

/** 方程式（「=」を 1 つ含む）を解く手順 */
export function solve(src: string): TransformResult {
  const sides = src.normalize('NFKC').split('=')
  if (sides.length !== 2 || !sides[0].trim() || !sides[1].trim()) {
    return { ok: false, error: '「=」を 1 つ含む方程式を入れてください（例: 2x + 3 = 7）' }
  }
  const L = parseExpr(sides[0])
  const R = parseExpr(sides[1])
  if (!L.ok) return { ok: false, error: `左辺: ${L.error}` }
  if (!R.ok) return { ok: false, error: `右辺: ${R.error}` }
  const P = polyOf(new OperatorNode('-', 'subtract', [L.node, R.node]))
  if (!P) return { ok: false, error: '1 つの文字の多項式の方程式にしてください（分数式や文字が 2 つ以上のものは扱えません）' }
  const { v } = P
  let p: Poly = trim(P.poly)
  const start = `${texOf(L.node)} = ${texOf(R.node)}`
  const moves: Move[] = []
  const d = degree(p)

  if (d === 0) {
    moves.push({ label: '移項して整理する', tex: `${numTex(p[0])} = 0` })
    moves.push(
      Math.abs(p[0]) < 1e-9
        ? { label: 'どんな値でも成り立つ（恒等式）', tex: `${v}\\ \\text{はすべての数}` }
        : { label: '成り立つ値はない（解なし）', tex: `\\text{解なし}` },
    )
    return { ok: true, start, moves, roots: [] }
  }

  if (d === 1) {
    const [b, a] = p
    moves.push({ label: `移項して、${v} の項を左辺に、数を右辺に集める`, tex: `${hot(monoTex(a, 1, v))} = ${hot(numTex(-b))}` })
    if (Math.abs(a - 1) > 1e-9) moves.push({ label: `両辺を ${plain(a)} で割る`, tex: `${v} = ${hot(numTex(-b / a))}` })
    return { ok: true, start, moves, roots: [-b / a] }
  }

  // 右辺がもともと 0 なら移項の手は要らない
  const rightIsZero = isConstantNode(R.node) && Number(R.node.value) === 0
  if (!rightIsZero) moves.push({ label: '移項して右辺を 0 にする', tex: `${polyTex(p, v)} = 0` })
  const { g, k } = commonFactor(p)
  if (k === 0 && Math.abs(g) !== 1) {
    p = p.map((c) => c / g)
    moves.push({ label: `両辺を ${plain(g)} で割る`, tex: `${polyTex(p, v)} = 0` })
  }

  if (d === 2) {
    const [c, b, a] = p
    const { D, parts } = splitQuadratic(p, v)
    if (parts) {
      const { r1, r2, f1, f2, rest } = parts
      const coef = Math.abs(rest - 1) > 1e-9 ? numTex(rest) : ''
      if (D === 0) {
        moves.push({ label: '左辺を因数分解する', tex: `${hot(`${coef}(${f1.tex})^2`)} = 0` })
        moves.push({ label: '2 乗して 0 になるのは、中身が 0 のとき', tex: `${f1.tex} = 0` })
        moves.push({ label: '解（重解）', tex: `${v} = ${hot(numTex(r1))}` })
        return { ok: true, start, moves, roots: [r1] }
      }
      moves.push({ label: '左辺を因数分解する', tex: `${hot(`${coef}(${f1.tex})(${f2.tex})`)} = 0` })
      moves.push({ label: '掛けて 0 になるのは、どちらかが 0 のとき', tex: `${f1.tex} = 0\\quad\\text{または}\\quad ${f2.tex} = 0` })
      moves.push({ label: '解', tex: `${v} = ${hot(numTex(r1))},\\ ${hot(numTex(r2))}` })
      return { ok: true, start, moves, roots: [r1, r2] }
    }
    // 解の公式
    const bt = numTex(b)
    moves.push({
      label: '因数分解できないので、解の公式に当てはめる',
      tex: `${v} = \\frac{-(${bt}) \\pm \\sqrt{(${bt})^2 - 4 \\cdot ${numTex(a)} \\cdot (${numTex(c)})}}{2 \\cdot ${numTex(a)}}`,
    })
    moves.push({ label: '計算する', tex: `${v} = \\frac{${numTex(-b)} \\pm \\sqrt{${numTex(D)}}}{${numTex(2 * a)}}` })
    if (D < 0) {
      moves.push({
        label: '√ の中が負なので、実数の解はない（虚数 i を使うと次のとおり）',
        tex: `${v} = \\frac{${numTex(-b)} \\pm ${hot(`\\sqrt{${numTex(-D)}}\\,i`)}}{${numTex(2 * a)}}`,
      })
      return { ok: true, start, moves, roots: [] }
    }
    const roots = [(-b + Math.sqrt(D)) / (2 * a), (-b - Math.sqrt(D)) / (2 * a)]
    if ([a, b, c].every(isInt)) {
      // √D = k√m の形にして、約分する
      let kk = 1
      for (let i = Math.floor(Math.sqrt(D)); i > 1; i--) if (D % (i * i) === 0) { kk = i; break }
      const m = D / (kk * kk)
      let nb = -b
      let den = 2 * a
      if (kk > 1) moves.push({ label: '√ の中から 2 乗を外に出す', tex: `${v} = \\frac{${nb} \\pm ${hot(`${kk}\\sqrt{${m}}`)}}{${den}}` })
      const g2 = gcd(gcd(Math.abs(nb), kk), Math.abs(den))
      if (g2 > 1) {
        nb /= g2
        den /= g2
        const kt = kk / g2 === 1 ? '' : String(kk / g2)
        const body = `${nb} \\pm ${kt}\\sqrt{${m}}`
        moves.push({ label: `分母と分子を ${g2} で約分する`, tex: `${v} = ${hot(den === 1 ? body : `\\frac{${body}}{${den}}`)}` })
      }
    }
    return { ok: true, start, moves, roots }
  }

  // 3 次以上: 因数定理で有理数の解を探す
  let rest = p
  const roots: number[] = []
  const facs: string[] = []
  for (let guard = 0; degree(rest) >= 1 && guard < 12; guard++) {
    if (degree(rest) === 2) {
      const { parts } = splitQuadratic(rest, v)
      if (!parts) break
      roots.push(parts.r1, parts.r2)
      facs.push(parts.f1.tex, parts.f2.tex)
      rest = [parts.rest]
      break
    }
    if (degree(rest) === 1) {
      const r = -rest[0] / rest[1]
      roots.push(r)
      facs.push(linearFactor(r, v).tex)
      rest = [rest[1] / linearFactor(r, v).scale]
      break
    }
    const r = rationalRoot(rest)
    if (r === null) break
    const lf = linearFactor(r, v)
    roots.push(r)
    facs.push(lf.tex)
    rest = trim(divideByRoot(rest, r).map((x) => x / lf.scale))
    moves.push({ label: '因数定理で 1 つ目の解を見つける', tex: `P(${numTex(r)}) = 0`, sub: `${hot(lf.tex)}\\ \\text{で割り切れる}` })
  }
  if (degree(rest) > 0) {
    moves.push({ label: '有理数の解だけでは解ききれない', tex: `${facs.map((f) => `(${f})`).join('')}(${polyTex(rest, v)}) = 0` })
    return { ok: true, start, moves, roots }
  }
  moves.push({ label: '左辺を因数分解する', tex: `${hot(facs.map((f) => `(${f})`).join(''))} = 0` })
  const uniq = [...new Set(roots.map((r) => Number(r.toFixed(9))))].sort((a, b) => a - b)
  moves.push({ label: '解', tex: `${v} = ${uniq.map((r) => hot(numTex(r))).join(',\\ ')}` })
  return { ok: true, start, moves, roots: uniq }
}
