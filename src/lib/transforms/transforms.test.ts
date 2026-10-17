import { describe, expect, it } from 'vitest'
import { derivative, parse } from 'mathjs'
import katex from 'katex'
import { normalizeExpr } from '../normalize'
import { MODES } from '.'

const mode = (id: string) => MODES.find((m) => m.id === id)!
const POINTS = [0.37, 1.9, -2.3, 3.1]

/** 2 つの式がいくつかの点で同じ値になるか */
function sameValue(a: string, b: string) {
  const f = parse(a).compile()
  const g = parse(b).compile()
  for (const x of POINTS) {
    const scope = { x, a: x + 0.5, b: 1.3 - x, y: 0.7 * x }
    expect(g.evaluate(scope), `${a} と ${b}（x=${x}）`).toBeCloseTo(f.evaluate(scope), 6)
  }
}

describe('因数分解', () => {
  for (const src of mode('factor').presets) {
    it(`${src} は元の式と同じ値`, () => {
      const r = mode('factor').run(src)
      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.moves.length).toBeGreaterThan(0)
      sameValue(normalizeExpr(src), r.result!)
    })
  }
  it('x^2 - 5x + 6 は「足して・掛けて」から (x-2)(x-3)', () => {
    const r = mode('factor').run('x^2 - 5x + 6')
    if (!r.ok) throw new Error(r.error)
    expect(r.moves.map((m) => m.label)).toEqual(['足して -5、掛けて 6 になる 2 数を探す', '(x + m)(x + n) の形にする'])
    expect(r.moves[1].tex).toContain('x - 2')
    expect(r.moves[1].tex).toContain('x - 3')
  })
  it('2x^2 - 8 は共通因数のあと平方の差', () => {
    const r = mode('factor').run('2x^2 - 8')
    if (!r.ok) throw new Error(r.error)
    expect(r.moves.map((m) => m.label)).toEqual(['共通因数でくくる', '平方の差 A² − B² = (A + B)(A − B) を使う'])
  })
  it('3 次式は因数定理を使う', () => {
    const r = mode('factor').run('x^3 - 6x^2 + 11x - 6')
    if (!r.ok) throw new Error(r.error)
    expect(r.moves[0].label).toBe('因数定理で 1 次の因数を見つける')
  })
  it('分けられない 2 次式はそう伝える', () => {
    const r = mode('factor').run('x^2 + x + 1')
    if (!r.ok) throw new Error(r.error)
    expect(r.moves.at(-1)!.label).toBe('整数の範囲ではこれ以上因数分解できない')
  })
  it('多項式でなければエラー', () => {
    expect(mode('factor').run('sin(x)').ok).toBe(false)
  })
})

describe('方程式を解く', () => {
  const check = (src: string, expected: number[]) => {
    const r = mode('solve').run(src)
    if (!r.ok) throw new Error(r.error)
    const roots = [...r.roots!].sort((a, b) => a - b)
    expect(roots.length).toBe(expected.length)
    roots.forEach((x, i) => expect(x).toBeCloseTo(expected[i], 9))
    // 解を代入すると両辺が等しい
    const [left, right] = src.split('=')
    const l = parse(normalizeExpr(left)).compile()
    const rr = parse(normalizeExpr(right)).compile()
    for (const x of roots) expect(l.evaluate({ x })).toBeCloseTo(rr.evaluate({ x }), 6)
    return r
  }
  it('1 次方程式', () => {
    const r = check('2x + 3 = 7', [2])
    if (r.ok) expect(r.moves.map((m) => m.label)).toEqual(['移項して、x の項を左辺に、数を右辺に集める', '両辺を 2 で割る'])
    check('3(x - 1) = x + 5', [4])
  })
  it('因数分解で解ける 2 次方程式', () => {
    const r = check('x^2 = 5x - 6', [2, 3])
    if (r.ok) expect(r.moves.map((m) => m.label)).toContain('掛けて 0 になるのは、どちらかが 0 のとき')
    check('2x^2 + 3x - 2 = 0', [-2, 0.5])
  })
  it('解の公式で解く 2 次方程式（√ を簡単にして約分）', () => {
    const r = check('x^2 - 4x + 1 = 0', [2 - Math.sqrt(3), 2 + Math.sqrt(3)])
    if (r.ok) {
      expect(r.moves.map((m) => m.label)).toContain('√ の中から 2 乗を外に出す')
      expect(r.moves.at(-1)!.tex).toContain('2 \\pm \\sqrt{3}')
    }
  })
  it('実数解がない', () => {
    const r = mode('solve').run('x^2 + x + 1 = 0')
    if (!r.ok) throw new Error(r.error)
    expect(r.roots).toEqual([])
  })
  it('3 次方程式', () => {
    check('x^3 - 6x^2 + 11x = 6', [1, 2, 3])
  })
  it('「=」がなければエラー', () => {
    expect(mode('solve').run('x + 1').ok).toBe(false)
  })
})

describe('整理', () => {
  for (const src of mode('simplify').presets) {
    it(`${src} は元の式と同じ値`, () => {
      const r = mode('simplify').run(src)
      if (!r.ok) throw new Error(r.error)
      expect(r.moves.length).toBeGreaterThan(0)
      sameValue(normalizeExpr(src), r.result!)
    })
  }
  it('(x^2-1)/(x-1) は約分して x + 1', () => {
    const r = mode('simplify').run('(x^2 - 1)/(x - 1)')
    if (!r.ok) throw new Error(r.error)
    expect(r.moves.at(-1)!.label).toBe('共通の因数で約分する')
    expect(r.moves.at(-1)!.tex).toContain('x + 1')
  })
})

describe('微分', () => {
  for (const src of mode('derive').presets) {
    it(`${src} は mathjs の微分と同じ値`, () => {
      const r = mode('derive').run(src)
      if (!r.ok) throw new Error(r.error)
      expect(r.moves.length).toBeGreaterThan(1)
      sameValue(derivative(normalizeExpr(src), 'x').toString(), r.result!)
    })
  }
  it('底つきの対数も微分できる', () => {
    // 答え合わせは mathjs の微分で。mathjs は log2 を微分できないので、同じ意味の log(…, 2) で比べる
    for (const [src, ref] of [
      ['log10 x', 'log(x, 10)'],
      ['log_2(3x+1)', 'log(3x+1, 2)'],
      ['log_3(x^2+1)', 'log(x^2+1, 3)'],
    ]) {
      const r = mode('derive').run(src)
      if (!r.ok) throw new Error(`${src}: ${r.error}`)
      sameValue(derivative(ref, 'x').toString(), r.result!)
    }
  })

  it('積の微分と合成関数の微分の手が出る', () => {
    const a = mode('derive').run('x^2 sin x')
    const b = mode('derive').run('(3x + 1)^5')
    if (!a.ok || !b.ok) throw new Error()
    expect(a.moves[0].label).toBe("積の微分: (fg)' = f'g + fg'")
    expect(b.moves[0].label).toBe('合成関数の微分: 外側（□ の n 乗）を微分 × 内側を微分')
    // x^1 のような形を残さない
    expect(a.moves.map((m) => m.tex).join(' ')).not.toContain('^{1}')
  })
})

describe('TeX', () => {
  it('どのモードのどの手も KaTeX でエラーなく描ける', () => {
    for (const m of MODES) {
      for (const src of m.presets) {
        const r = m.run(src)
        if (!r.ok) throw new Error(`${m.id} ${src}: ${r.error}`)
        for (const tex of [r.start, ...r.moves.flatMap((x) => [x.tex, x.sub ?? ''])]) {
          expect(() => katex.renderToString(tex, { throwOnError: true, strict: 'ignore' }), `${m.id} ${src}: ${tex}`).not.toThrow()
          // JS の文字列で \f や \t になった崩れも見つける
          expect(/[\f\t\v\b]/.test(tex), `${m.id} ${src}: 制御文字 ${JSON.stringify(tex)}`).toBe(false)
        }
      }
    }
  })
})

describe('展開', () => {
  for (const src of mode('expand').presets) {
    it(`${src} は元の式と同じ値`, () => {
      const r = mode('expand').run(src)
      if (!r.ok) throw new Error(r.error)
      sameValue(normalizeExpr(src), r.result!)
    })
  }
})
