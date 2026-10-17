import type { MathNode } from 'mathjs'
import { parseExpr } from '../math'
import { differentiate } from './derive'
import { expand } from './expand'
import { factorize } from './factor'
import { tidy } from './simplify'
import { solve } from './solve'
import { completeSquare } from './complete'
import { solveSystem } from './system'
import type { TransformResult } from './types'

export type { Move, TransformResult } from './types'

const withParse = (f: (n: MathNode) => TransformResult) => (src: string): TransformResult => {
  const p = parseExpr(src)
  return p.ok ? f(p.node) : { ok: false, error: p.error }
}

export const MODES = [
  {
    id: 'expand',
    label: '展開',
    presets: ['(a+b)^2', '(x+1)(x-2)', '(x+y)(x-y)', '2(x+3) - (x-1)', '(2x-3)^2', '(a+b)^3'],
    run: withParse(expand),
  },
  {
    id: 'factor',
    label: '因数分解',
    presets: ['x^2 - 5x + 6', '2x^2 - 8', 'x^2 + 6x + 9', '6x^2 + x - 2', 'x^3 - 6x^2 + 11x - 6', '3x^3 - 12x'],
    run: withParse(factorize),
  },
  {
    id: 'complete',
    label: '平方完成',
    presets: ['x^2 - 4x + 1', 'x^2 + 6x + 5', '2x^2 - 8x + 3', 'x^2 + 3x', '-x^2 + 2x + 3', '3x^2 + 2x - 1'],
    run: withParse(completeSquare),
  },
  {
    id: 'simplify',
    label: '整理',
    presets: ['1/x + 1/(x+1)', '(x^2 - 1)/(x - 1)', '(x^2 + 3x + 2)/(x^2 - 1)', 'x/(x-2) - 2/(x-2)', '3x + 2(x - 1) - x'],
    run: withParse(tidy),
  },
  {
    id: 'solve',
    label: '方程式を解く',
    presets: ['2x + 3 = 7', '3(x - 1) = x + 5', 'x^2 = 5x - 6', 'x^2 - 4x + 1 = 0', '2x^2 + 3x - 2 = 0', 'x^3 - 6x^2 + 11x = 6'],
    run: solve,
  },
  {
    id: 'system',
    label: '連立方程式',
    presets: ['2x + y = 5, x - y = 1', '3x + 2y = 12, x + 2y = 8', 'x + y = 10, 2x + 4y = 28', '2x - 3y = 1, 4x - 6y = 5', 'y = 2x - 1, y = -x + 5'],
    run: solveSystem,
  },
  {
    id: 'derive',
    label: '微分',
    presets: ['x^3 - 2x^2 + 5', 'x^2 sin x', '(3x + 1)^5', 'sin(2x)', 'e^x cos x', 'x/(x^2 + 1)', 'ln(x^2 + 1)'],
    run: withParse(differentiate),
  },
] as const

export type ModeId = (typeof MODES)[number]['id']
