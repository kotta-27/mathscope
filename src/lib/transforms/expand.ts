import type { MathNode } from 'mathjs'
import { texOf } from '../math'
import { deriveSteps } from '../steps'
import { HOT, HOT_BEFORE, type Move, type TransformResult } from './types'

/** 展開。既存のエンジンの各手を、色付きの式に直す */
export function expand(node: MathNode): TransformResult {
  const steps = deriveSteps(node)
  const moves: Move[] = steps.map((s) => ({
    label: s.label,
    tex: texOf(s.after, s.whole ? undefined : new Map([[s.replacement, HOT]])),
    sub: s.whole ? undefined : `\\textcolor{${HOT_BEFORE}}{${texOf(s.target)}}\;\\Rightarrow\;\\textcolor{${HOT}}{${texOf(s.replacement)}}`,
  }))
  const first = steps[0]
  return {
    ok: true,
    start: texOf(node, first && !first.whole ? new Map([[first.target, HOT_BEFORE]]) : undefined),
    moves,
    result: steps.length ? steps[steps.length - 1].after.toString() : node.toString(),
  }
}
