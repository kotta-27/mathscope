import { describe, expect, it } from 'vitest'
import { parse } from 'mathjs'
import { normalizeExpr } from './normalize'

/** 暗黙の掛け算も * で表示して比べる */
const show = (s: string) => parse(s).toString({ implicit: 'show', parenthesis: 'auto' })

/** 正規化した結果を mathjs で読み、期待する式と同じ木になるか比べる */
const same = (input: string, expected: string) =>
  expect(show(normalizeExpr(input)), `${input} → ${normalizeExpr(input)}`).toBe(show(expected))

describe('normalizeExpr', () => {
  it('そのままで読める式は変えない', () => {
    for (const s of ['a*sin(b*x + c)', 'x^3/3 - x', '(-b + sqrt(b^2 - 4*a*c)) / (2*a)', 'exp(-(x - m)^2 / (2*s^2))', '2(x+1)', '(x+1)(x-1)', '1e5'])
      same(s, s)
  })

  it('全角文字を半角にする', () => {
    same('ｘ＋１', 'x+1')
    same('（ｘ－２）＾２', '(x-2)^2')
    same('２ｘ　＋　３', '2x + 3')
  })

  it('掛け算・割り算・マイナスの記号', () => {
    same('2×x', '2*x')
    same('6÷3', '6/3')
    same('x−1', 'x-1')
    same('a・b', 'a*b')
    same('x**2', 'x^2')
  })

  it('定数の記号', () => {
    same('2π', '2pi')
    same('∞', 'Infinity')
  })

  it('上付き文字', () => {
    same('x²', 'x^2')
    same('x³ + y²', 'x^3 + y^2')
    same('x⁻¹', 'x^(-1)')
    same('x¹⁰', 'x^10')
    same('x²y', 'x^2 * y')
    same('eˣ', 'e^x')
  })

  it('ルート', () => {
    same('√x', 'sqrt(x)')
    same('√2x', 'sqrt(2x)')
    same('√(x+1)', 'sqrt(x+1)')
    same('∛8', 'cbrt(8)')
  })

  it('絶対値の縦棒', () => {
    same('|x|', 'abs(x)')
    same('|x-1| + |x+1|', 'abs(x-1) + abs(x+1)')
  })

  it('括弧なしの関数', () => {
    same('sinx', 'sin(x)')
    same('sin x', 'sin(x)')
    same('sin2x', 'sin(2x)')
    same('sin 2x + cos 3x', 'sin(2x) + cos(3x)')
    same('2sinx', '2sin(x)')
    same('sin²x', 'sin(x)^2')
    same('sin^2 x', 'sin(x)^2')
    same('sin^2(x)', 'sin(x)^2')
    same('cos θ', 'cos(θ)')
    same('sin theta', 'sin(theta)')
    same('sinxcosx', 'sin(x)*cos(x)')
  })

  it('ln は自然対数 log', () => {
    same('ln x', 'log(x)')
    same('ln(x+1)', 'log(x+1)')
  })

  it('複数文字の変数は 1 文字ずつの積', () => {
    same('ax^2+bx+c', 'a*x^2+b*x+c')
    same('2ab', '2*a*b')
    same('xy', 'x*y')
    same('mgh', 'm*g*h')
  })

  it('名前・関数名・添字つきの名前は分けない', () => {
    same('pi', 'pi')
    same('theta + alpha', 'theta + alpha')
    same('sinh(x)', 'sinh(x)')
    same('sqrt(x)', 'sqrt(x)')
    same('floor(x)', 'floor(x)')
    same('max(a, b)', 'max(a, b)')
    same('x_1 + x_2', 'x_1 + x_2')
    same('x2', 'x2')
    same('2pix', '2*pi*x')
  })

  it('底つきの対数', () => {
    same('log10(x)', 'log10(x)')
    same('log10 x', 'log10(x)')
    same('log_10(x)', 'log10(x)')
    same('log_{10} x', 'log10(x)')
    same('\\log_{10} x', 'log10(x)')
    same('\\log_{10}(x+1)', 'log10(x+1)')
    same('log₁₀x', 'log10(x)')
    same('lg x', 'log10(x)')
    same('log_2 8', 'log2(8)')
    same('log_3(x+1)', 'log(x+1, 3)')
    same('log_a x', 'log(x, a)')
    same('2log_3(x^2+1) + 1', '2log(x^2+1, 3) + 1')
    // 底のない log は自然対数のまま
    same('log x', 'log(x)')
    same('logx', 'log(x)')
    same('log(x, 10)', 'log(x, 10)')
  })

  it('LaTeX の書き方', () => {
    same('\\frac{1}{x+1}', '1/(x+1)')
    same('\\dfrac{x^{2}-1}{x-1}', '(x^2-1)/(x-1)')
    same('\\frac12 x', '(1/2) x')
    same('\\sqrt{x^2+1}', 'sqrt(x^2+1)')
    same('\\sqrt[3]{x}', 'nthRoot(x, 3)')
    same('2\\cdot x + 3 \\times y', '2*x + 3*y')
    same('a \\div b', 'a/b')
    same('\\sin x + \\cos^2 x', 'sin(x) + cos(x)^2')
    same('\\sin\\left(2x\\right)', 'sin(2x)')
    same('\\ln x', 'log(x)')
    same('e^{-x^2}', 'e^(-x^2)')
    same('\\pi r^2', 'pi*r^2')
    same('\\theta + \\alpha', 'theta + alpha')
    same('x_{1} + x_{2}', 'x_1 + x_2')
    same('\\left|x-1\\right|', 'abs(x-1)')
    same('\\mathrm{e}^{x}', 'e^x')
    same('a\\,b', 'a*b')
    same('y = \\frac{1}{2}x^{2}', '(1/2) x^2')
  })

  it('先頭の y = や f(x) = を取り除く', () => {
    same('y = x^2', 'x^2')
    same('f(x)=sin x', 'sin(x)')
  })
})
