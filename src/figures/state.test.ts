import { describe, expect, it } from 'vitest'
import { decode, encode } from './state'

describe('図の状態の書き出しと読み戻し', () => {
  it('数・真偽・文字', () => {
    expect(encode(0.1 + 0.2)).toBe('0.3')
    expect(decode('0.3', 1)).toBe(0.3)
    expect(decode(encode(true), false)).toBe(true)
    expect(decode('cube', 'tetra')).toBe('cube')
  })
  it('配列やオブジェクトは初期値と同じ形に戻す', () => {
    const pts = [[1, 2], [3, 4.5]]
    expect(encode(pts)).toBe('1,2,3,4.5')
    expect(decode('5,6,7,8', pts)).toEqual([[5, 6], [7, 8]])
    expect(decode('1,2,3,4', { a: 0, b: 0, c: 0, d: 0 })).toEqual({ a: 1, b: 2, c: 3, d: 4 })
  })
  it('形や中身が合わなければ読まない', () => {
    expect(decode('1,2,3', [0, 0])).toBeUndefined()
    expect(decode('x', 1)).toBeUndefined()
  })
})
