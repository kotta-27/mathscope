import { ConstantNode, FunctionNode, OperatorNode, ParenthesisNode, SymbolNode, simplify, isConstantNode, isFunctionNode, isOperatorNode, isSymbolNode, type MathNode } from 'mathjs'
import { freeSymbols, texOf, unwrap } from '../math'
import { HOT, HOT_BEFORE, type Move, type TransformResult } from './types'

const op = (sym: string, fn: string, args: MathNode[]): MathNode => new OperatorNode(sym as never, fn as never, args)
const num = (n: number) => new ConstantNode(n)
const fnc = (name: string, ...args: MathNode[]) => new FunctionNode(new SymbolNode(name), args)
/** 足し算・引き算の式は括弧に入れる（掛け算の中で崩れないように） */
const wrap = (n: MathNode) => {
  const u = unwrap(n)
  return isOperatorNode(u) && ['add', 'subtract', 'unaryMinus'].includes(u.fn) ? new ParenthesisNode(u) : n
}
const mul = (...xs: MathNode[]) => xs.map(wrap).reduce((a, b) => op('*', 'multiply', [a, b]))
const D = (u: MathNode, v: string) => fnc('D', unwrap(u), new SymbolNode(v))
const isD = (n: MathNode) => isFunctionNode(n) && n.fn.name === 'D'

type Rule = { label: string; to: MathNode }

/** D(u) に当てる規則を 1 つ選ぶ */
function rule(u: MathNode, v: string): Rule {
  const dep = (n: MathNode) => freeSymbols(n).includes(v)
  if (!dep(u)) return { label: '定数の微分は 0', to: num(0) }
  if (isSymbolNode(u) && u.name === v) return { label: `${v} を微分すると 1`, to: num(1) }

  if (isOperatorNode(u)) {
    const [a, b] = u.args
    switch (u.fn) {
      case 'add':
      case 'subtract':
        return { label: '和・差の微分は、それぞれを微分する', to: op(u.op, u.fn, [D(a, v), D(b, v)]) }
      case 'unaryMinus':
        return { label: '−1 倍は外に出す', to: op('-', 'unaryMinus', [D(a, v)]) }
      case 'multiply':
        if (!dep(a)) return { label: '定数倍は外に出す', to: mul(a, D(b, v)) }
        if (!dep(b)) return { label: '定数倍は外に出す', to: mul(b, D(a, v)) }
        return { label: '積の微分 (fg)′ = f′g + fg′', to: op('+', 'add', [mul(D(a, v), b), mul(a, D(b, v))]) }
      case 'divide':
        if (!dep(b)) return { label: '定数で割るのはそのまま', to: op('/', 'divide', [D(a, v), wrap(b)]) }
        return {
          label: '商の微分 (f/g)′ = (f′g − fg′) / g²',
          to: op('/', 'divide', [new ParenthesisNode(op('-', 'subtract', [mul(D(a, v), b), mul(a, D(b, v))])), op('^', 'pow', [wrap(b), num(2)])]),
        }
      case 'pow': {
        if (!dep(b)) {
          const n1 = isConstantNode(b) ? num(Number(b.value) - 1) : simplify(op('-', 'subtract', [b, num(1)]))
          const outer = mul(wrap(b), op('^', 'pow', [wrap(a), wrap(n1)]))
          const base = unwrap(a)
          if (isSymbolNode(base) && base.name === v) return { label: `べき乗の微分 (${v}ⁿ)′ = n${v}ⁿ⁻¹`, to: outer }
          return { label: '合成関数の微分: 外側（□ⁿ）を微分 × 内側を微分', to: mul(outer, D(a, v)) }
        }
        if (!dep(a)) {
          const e = isSymbolNode(unwrap(a)) && (unwrap(a) as SymbolNode).name === 'e'
          const self = op('^', 'pow', [a, wrap(b)])
          if (e) return { label: 'e^□ の微分は e^□ × 内側の微分', to: mul(self, D(b, v)) }
          return { label: 'a^□ の微分は a^□ log a × 内側の微分', to: mul(self, fnc('log', a), D(b, v)) }
        }
        break
      }
    }
  }

  if (isFunctionNode(u) && u.args.length === 1) {
    const w = u.args[0]
    const table: Record<string, () => MathNode> = {
      sin: () => fnc('cos', w),
      cos: () => op('-', 'unaryMinus', [fnc('sin', w)]),
      tan: () => op('/', 'divide', [num(1), op('^', 'pow', [fnc('cos', w), num(2)])]),
      exp: () => fnc('exp', w),
      log: () => op('/', 'divide', [num(1), wrap(w)]),
      sqrt: () => op('/', 'divide', [num(1), mul(num(2), fnc('sqrt', w))]),
    }
    const f = table[u.fn.name]
    if (f) {
      const inner = unwrap(w)
      if (isSymbolNode(inner) && inner.name === v) return { label: `${u.fn.name} の微分`, to: f() }
      return { label: `合成関数の微分: ${u.fn.name} を微分 × 内側を微分`, to: mul(f(), D(w, v)) }
    }
  }
  throw new Error(`「${u.toString()}」の微分の規則がありません`)
}

/** 微分を 1 手ずつ。外側の d/dx から規則を当てていく */
export function differentiate(node: MathNode): TransformResult {
  const syms = freeSymbols(node)
  const v = syms.includes('x') ? 'x' : syms[0] ?? 'x'
  let cur: MathNode = D(node, v)
  const start = texOf(cur)
  const moves: Move[] = []
  try {
    for (let guard = 0; guard < 60; guard++) {
      let target: MathNode | null = null
      let applied: Rule | null = null
      const next = cur.transform((n) => {
        if (target || !isD(n)) return n
        target = n
        applied = rule((n as FunctionNode).args[0], v)
        return applied.to
      })
      if (!target || !applied) break
      const a = applied as Rule
      moves.push({
        label: a.label,
        tex: texOf(next, new Map([[a.to, HOT]])),
        sub: `\\textcolor{${HOT_BEFORE}}{${texOf(target)}}\;\\Rightarrow\;\\textcolor{${HOT}}{${texOf(a.to)}}`,
      })
      cur = next
    }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
  const tidy = simplify(cur)
  if (tidy.toString() !== cur.toString()) moves.push({ label: '式を整理する（1 を掛ける・0 を足すなどを消す）', tex: `\\textcolor{${HOT}}{${texOf(tidy)}}` })
  return { ok: true, start, moves, result: tidy.toString() }
}
