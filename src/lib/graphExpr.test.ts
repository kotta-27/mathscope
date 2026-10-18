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

describe('名前をつけた関数・定数', () => {
  it('関数の定義と、ほかの行での利用', () => {
    const f = readGraphExpr('f(x) = x^2 + a')
    expect(f.ok && f.curve.kind === 'fn' && f.curve.name).toBe('f')
    expect(f.ok && f.symbols).toEqual(['a'])
    const g = readGraphExpr('f(x - k) + 1', ['f'])
    expect(g.ok && g.curve.kind).toBe('fn')
    expect(g.ok && g.symbols).toEqual(['k'])
    // 定義していない名前にかっこが続くときは掛け算
    const h = readGraphExpr('a(x - p)^2')
    expect(h.ok && h.symbols).toEqual(['a', 'p'])
  })
  it('定数の定義', () => {
    const k = readGraphExpr('k = 2a + 1')
    expect(k.ok && k.curve.kind).toBe('const')
    expect(k.ok && k.curve.kind === 'const' && k.curve.name).toBe('k')
    // x や y を含むなら定数ではなく関係式
    expect(readGraphExpr('k = x^2').ok && (readGraphExpr('k = x^2') as { curve: { kind: string } }).curve.kind).toBe('implicit')
  })
  it('横軸の変数が x 以外の関数', () => {
    const f = readGraphExpr('g(t) = sin(w*t)')
    expect(f.ok && f.curve.kind === 'fn' && f.curve.arg).toBe('t')
    expect(f.ok && f.symbols).toEqual(['w'])
  })
})
