import { describe, expect, it } from 'vitest'
import { THEOREMS } from './theorems'
import { COURSES } from './courses'
import { matches } from './search'

const find = (q: string) => THEOREMS.filter((t) => matches(t, q)).map((t) => t.id)

describe('定理の検索', () => {
  it('すべての定理に科目・単元・英語名がある', () => {
    expect(THEOREMS.filter((t) => !COURSES[t.id]).map((t) => t.id)).toEqual([])
    expect(Object.keys(COURSES).filter((id) => !THEOREMS.some((t) => t.id === id))).toEqual([])
  })
  it('英語で探せる（大文字・小文字やアクセント記号を問わない）', () => {
    expect(find('eigen')).toContain('diagonalization')
    expect(find('LHopital')).toContain('lhopital')
    expect(find('bayes')).toContain('bayes')
  })
  it('単元名・科目で探せる', () => {
    expect(find('図形と計量')).toEqual(expect.arrayContaining(['law-of-sines', 'law-of-cosines', 'triangle-area']))
    expect(find('数C')).toContain('dot-product')
    expect(find('数列')).toContain('induction')
  })
  it('漢数字と算用数字を区別しない', () => {
    expect(find('二次方程式')).toContain('quadratic-formula')
    expect(find('2次方程式')).toContain('quadratic-formula')
  })
})
