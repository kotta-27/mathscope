import { describe, expect, it } from 'vitest'
import { parse } from 'mathjs'
import { deriveSteps } from './steps'

const run = (src: string) => deriveSteps(parse(src))
const last = (src: string) => {
  const s = run(src)
  return s[s.length - 1].after.toString()
}
/** 展開前と展開後が同じ値になるか、いくつかの点で確かめる */
const sameValue = (src: string) => {
  const s = run(src)
  const f = parse(src).compile()
  const g = s[s.length - 1].after.compile()
  for (const [a, b, x, y] of [[1, 2, 3, 4], [-1.5, 0.5, 2, -3], [0.3, -2, -1, 7]]) {
    const scope = { a, b, x, y, c: 1.7 }
    expect(g.evaluate(scope)).toBeCloseTo(f.evaluate(scope), 9)
  }
}

describe('deriveSteps', () => {
  it('(a+b)^2 は累乗を掛け算に直してから分配し、最後に同類項をまとめる', () => {
    const s = run('(a+b)^2')
    expect(s[0].label).toBe('累乗を掛け算に書き直す')
    expect(s.some((x) => x.label === '分配法則で展開する')).toBe(true)
    expect(s[s.length - 1].label).toBe('同類項をまとめて並べ替える')
    expect(last('(a+b)^2')).toBe('a ^ 2 + 2 * a * b + b ^ 2')
  })

  it('よく使う展開の結果', () => {
    expect(last('(x+1)*(x-2)')).toBe('x ^ 2 - x - 2')
    expect(last('(x+y)*(x-y)')).toBe('x ^ 2 - y ^ 2')
    expect(last('2*(x+3) - (x-1)')).toBe('x + 7')
    expect(last('(a+b)^3')).toBe('a ^ 3 + 3 * a ^ 2 * b + 3 * a * b ^ 2 + b ^ 3')
  })

  it('マイナスを括弧に配る手がある', () => {
    expect(run('2*(x+3) - (x-1)')[0].label).toBe('マイナスを括弧の中に配る')
  })

  it('どの手でも式の値は変わらない', () => {
    for (const src of ['(a+b)^2', '(x+1)*(x-2)', '(2x-3)^2', '-(a-b)*c', '(a+b)^3', 'x/2*(x+4)']) sameValue(src)
  })

  it('途中の各手も値を保つ', () => {
    const f = parse('(2x-3)^2').compile()
    for (const step of run('(2x-3)^2')) {
      expect(step.after.compile().evaluate({ x: 1.3 })).toBeCloseTo(f.evaluate({ x: 1.3 }), 9)
    }
  })

  it('展開できる箇所がなければ手はない', () => {
    expect(run('sin(x)^2')).toEqual([])
  })

  it('部分の書き換えでは、前後の式の中の位置を返す', () => {
    const s = run('(a+b)^2')[0]
    expect(s.whole).toBeFalsy()
    expect(s.target.toString()).toBe('(a + b) ^ 2')
  })
})
