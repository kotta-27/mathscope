import { describe, expect, it } from 'vitest'
import { hrefTo, num, readNum } from './route'

describe('hrefTo', () => {
  it('値の種類ごとに書き分ける', () => {
    expect(hrefTo('graph', { f: ['x^2', 'sin(x)'], a: 1.23456, play: null, tan: true, off: false })).toBe('#graph?f=x%5E2&f=sin%28x%29&a=1.235&tan=1')
  })
  it('値がなければ ? をつけない', () => {
    expect(hrefTo('home', { q: undefined })).toBe('#home')
  })
})

describe('num / readNum', () => {
  it('小数 3 桁に丸め、余計な 0 を書かない', () => {
    expect(num(0.1 + 0.2)).toBe('0.3')
    expect(num(-2)).toBe('-2')
  })
  it('数でない値やないキーは既定値', () => {
    const p = new URLSearchParams('a=2.5&b=x&c=')
    expect(readNum(p, 'a', 0)).toBe(2.5)
    expect(readNum(p, 'b', 7)).toBe(7)
    expect(readNum(p, 'c', 7)).toBe(7)
    expect(readNum(p, 'd', 7)).toBe(7)
  })
})
