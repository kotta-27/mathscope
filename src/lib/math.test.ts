import { describe, expect, it } from 'vitest'
import { parseExpr, texOf } from './math'

const err = (src: string) => {
  const p = parseExpr(src)
  if (p.ok) throw new Error(`${src} はエラーになるはず`)
  return p
}

describe('parseExpr', () => {
  it('正規化してから読む', () => {
    const p = parseExpr('ax² + bx + c')
    expect(p.ok).toBe(true)
    if (p.ok) {
      expect(p.symbols).toEqual(['a', 'b', 'c', 'x'])
      expect(p.code.evaluate({ a: 1, b: 2, c: 3, x: 2 })).toBe(11)
    }
  })

  it('関数名は変数として数えない', () => {
    const p = parseExpr('sin x + cos θ')
    expect(p.ok && p.symbols).toEqual(['x', 'θ'])
  })

  it('空のとき', () => {
    expect(err('   ').error).toBe('式を入力してください')
  })

  it('閉じ括弧が足りない', () => {
    const e = err('(x+1')
    expect(e.error).toContain('閉じ括弧')
    expect(e.pos).toBe(e.normalized.length)
  })

  it('閉じ括弧が多い', () => {
    expect(err('x+1)').error).toContain('多すぎ')
  })

  it('途中で終わっている', () => {
    expect(err('x+').error).toBe('式が途中で終わっています')
  })

  it('演算子の連続は位置つきで返す', () => {
    const e = err('x+*2')
    expect(e.pos).toBe(e.normalized.indexOf('*'))
  })

  it('存在しない関数', () => {
    const e = err('foo(x)')
    expect(e.error).toBe('「foo」という関数はありません')
    expect(e.pos).toBe(0)
  })
})

describe('指数の括弧', () => {
  it('指数を囲む括弧は描かない', () => {
    const p = parseExpr('x^(n+1) + sqrt(x^(2)+1)')
    expect(p.ok && texOf(p.node)).not.toMatch(/\\left\(2\\right\)|\^\{\\left\(/)
  })
})
