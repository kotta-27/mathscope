import { describe, expect, it } from 'vitest'
import { readGraphExpr } from './graphExpr'

const kind = (s: string) => {
  const e = readGraphExpr(s)
  return e.ok ? e.curve.kind : `error: ${e.parsed.ok ? '' : e.parsed.error}`
}
const syms = (s: string) => {
  const e = readGraphExpr(s)
  return e.ok ? e.symbols : null
}

describe('グラフの式の種類', () => {
  it('y = f(x)', () => {
    expect(kind('x^2')).toBe('fn')
    expect(kind('y = a*x + b')).toBe('fn')
    expect(syms('y = a*x + b')).toEqual(['a', 'b'])
  })
  it('x と y の関係式', () => {
    expect(kind('x^2 + y^2 = 4')).toBe('implicit')
    expect(kind('y^2 = x')).toBe('implicit')
    expect(kind('x = 2')).toBe('implicit')
    expect(syms('(x - a)^2 + (y - b)^2 = r^2')).toEqual(['a', 'b', 'r'])
  })
  it('不等式の領域', () => {
    expect(kind('y > x^2')).toBe('region')
    expect(kind('x^2 + y^2 ≦ 4')).toBe('region')
    expect(kind('y <= 2x + 1')).toBe('region')
  })
  it('媒介変数・極座標', () => {
    expect(kind('(cos t, sin 2t)')).toBe('param')
    expect(syms('(a*cos(t), b*sin(t))')).toEqual(['a', 'b'])
    expect(kind('r = 1 + cos θ')).toBe('polar')
    expect(syms('r = cos(k*θ)')).toEqual(['k'])
  })
  it('読めないときは、どこが悪いかを返す', () => {
    expect(kind('x^2 + = 4')).toMatch(/^error: 左辺/)
    expect(kind('y = ')).toMatch(/^error/)
    expect(kind('x < y < 2')).toMatch(/1 つだけ/)
  })
})
