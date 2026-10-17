import { describe, expect, it } from 'vitest'
import { findFeatures } from './features'

const kinds = (fs: { kind: string; x: number; y: number }[]) => fs.map((f) => `${f.kind}:${f.x.toFixed(3)},${f.y.toFixed(3)}`).sort()

describe('findFeatures', () => {
  it('放物線の頂点・x 軸との交点・y 軸との交点', () => {
    const [p] = findFeatures([(x) => (x - 2) ** 2 - 1], -8, 8, 10)
    expect(kinds(p)).toEqual(['min:2.000,-1.000', 'root:1.000,0.000', 'root:3.000,0.000', 'yint:0.000,3.000'])
  })
  it('3 次関数の極大・極小', () => {
    const [p] = findFeatures([(x) => x ** 3 - 3 * x], -3, 3, 10)
    const ex = p.filter((f) => f.kind === 'max' || f.kind === 'min')
    expect(kinds(ex)).toEqual(['max:-1.000,2.000', 'min:1.000,-2.000'])
  })
  it('2 つのグラフの交点', () => {
    const [p] = findFeatures([(x) => x * x, (x) => x + 2], -5, 5, 10)
    expect(kinds(p.filter((f) => f.kind === 'cross'))).toEqual(['cross:-1.000,1.000', 'cross:2.000,4.000'])
  })
  it('漸近線をまたぐ符号の変化は交点にしない', () => {
    const [p] = findFeatures([(x) => 1 / x], -5, 5, 10)
    expect(p.filter((f) => f.kind === 'root')).toEqual([])
  })
})
