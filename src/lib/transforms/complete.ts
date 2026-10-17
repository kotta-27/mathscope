import type { MathNode } from 'mathjs'
import { texOf } from '../math'
import { degree, numStr, numTex, polyOf, polyTex, trim } from './poly'
import { hot, type Move, type TransformResult } from './types'

/** 「+ 3」「− 1/2」のように、符号つきで書く */
const signed = (x: number) => (x < 0 ? `- ${numTex(-x)}` : `+ ${numTex(x)}`)
/** 係数（1 と −1 は数字を省く） */
const coef = (a: number) => (Math.abs(a - 1) < 1e-9 ? '' : Math.abs(a + 1) < 1e-9 ? '-' : numTex(a))

/** 2 次式を a(x − p)² + q の形にする（平方完成） */
export function completeSquare(node: MathNode): TransformResult {
  const P = polyOf(node)
  if (!P) return { ok: false, error: '1 つの文字の 2 次式を入れてください（例: x² − 4x + 1）' }
  const { v } = P
  const p = trim(P.poly)
  if (degree(p) !== 2) return { ok: false, error: '2 次式を入れてください（x² の項が必要です）' }
  const [c, b, a] = p
  const start = texOf(node)
  const moves: Move[] = []
  const h = b / (2 * a) // x + h の h
  const q = c - a * h * h
  const xh = Math.abs(h) < 1e-12 ? v : `${v} ${signed(h)}`
  const one = Math.abs(a - 1) < 1e-9

  if (Math.abs(b) < 1e-12) {
    moves.push({ label: 'x の 1 次の項がないので、そのまま平方完成の形', tex: `${hot(`${coef(a)}${v}^2`)} ${Math.abs(c) < 1e-12 ? '' : signed(c)}` })
  } else {
    const inner = `${v}^2 ${signed(b / a)}${v}`
    if (!one) moves.push({ label: `${v}² と ${v} の項を、${v}² の係数 ${numTex(a).replace(/\\frac\{(\d+)\}\{(\d+)\}/, '$1/$2')} でくくる`, tex: `${hot(`${coef(a)}(${inner})`)} ${signed(c)}`, sub: `${coef(a)}(${inner})` })
    const half = numTex(Math.abs(h))
    moves.push({
      label: `${v} の係数の半分（${numTex(h)}）の 2 乗を、足して引く`,
      tex: `${one ? '' : `${coef(a)}\\left\\{`}${inner} ${hot(`+ \\left(${half}\\right)^2 - \\left(${half}\\right)^2`)}${one ? '' : '\\right\\}'} ${signed(c)}`,
    })
    moves.push({
      label: `前の 3 つの項を、( ${v} ${h < 0 ? '−' : '+'} ${numTex(Math.abs(h))} )² にまとめる`,
      tex: `${one ? '' : `${coef(a)}\\left\\{`}${hot(`(${xh})^2`)} - ${numTex(h * h)}${one ? '' : '\\right\\}'} ${signed(c)}`,
    })
    if (!one) moves.push({ label: '中かっこを外す', tex: `${coef(a)}(${xh})^2 ${hot(signed(-a * h * h))} ${signed(c)}` })
    moves.push({ label: '定数の部分を計算する', tex: `${coef(a)}(${xh})^2 ${hot(Math.abs(q) < 1e-12 ? '' : signed(q))}` })
  }
  moves.push({
    label: `頂点と軸が読める（y = ${polyTex(p, v).replace(/\\frac\{(-?\d+)\}\{(\d+)\}/g, '$1/$2').replace(/\^\{?(\d)\}?/g, '^$1')} のグラフ）`,
    tex: `\\text{頂点}\\ ${hot(`\\left(${numTex(-h)},\\ ${numTex(q)}\\right)`)},\\quad \\text{軸}\\ ${v} = ${numTex(-h)}`,
  })
  return { ok: true, start, moves, result: `${numStr(a)}*(${v} + ${numStr(h)})^2 + ${numStr(q)}` }
}
