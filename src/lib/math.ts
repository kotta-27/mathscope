import {
  parse,
  isSymbolNode,
  isFunctionNode,
  isParenthesisNode,
  type MathNode,
  type EvalFunction,
} from 'mathjs'

const CONSTANTS = new Set(['pi', 'e', 'i', 'Infinity', 'NaN', 'PI', 'E', 'tau', 'phi'])

export type Parsed =
  | { ok: true; node: MathNode; code: EvalFunction; symbols: string[] }
  | { ok: false; error: string }

export function parseExpr(src: string): Parsed {
  if (!src.trim()) return { ok: false, error: '式を入力してください' }
  try {
    const node = parse(src)
    return { ok: true, node, code: node.compile(), symbols: freeSymbols(node) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export function freeSymbols(node: MathNode): string[] {
  const set = new Set<string>()
  node.traverse((n, _path, parent) => {
    if (!isSymbolNode(n) || CONSTANTS.has(n.name)) return
    if (parent && isFunctionNode(parent) && parent.fn === n) return
    set.add(n.name)
  })
  return [...set].sort()
}

export function evalNum(code: EvalFunction, scope: Record<string, number>): number {
  try {
    const v = code.evaluate({ ...scope })
    return typeof v === 'number' ? v : NaN
  } catch {
    return NaN
  }
}

export const unwrap = (n: MathNode): MathNode => (isParenthesisNode(n) ? unwrap(n.content) : n)

/** LaTeX 化。colors に入れたノードだけ色を付ける */
export function texOf(node: MathNode, colors?: Map<MathNode, string>): string {
  const active = new Set<MathNode>()
  const handler = (n: MathNode, options: object): string | undefined => {
    const c = colors?.get(n)
    if (!c || active.has(n)) return undefined
    active.add(n)
    const inner = n.toTex(options)
    active.delete(n)
    return `\\textcolor{${c}}{${inner}}`
  }
  const tex = node.toTex({ parenthesis: 'keep', implicit: 'hide', handler } as object)
  return tex.replace(/\\mathrm\{([a-zA-Z])\}/g, '{$1}')
}

export function fmt(v: unknown, digits = 4): string {
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return Number.isNaN(v) ? '未定義' : v > 0 ? '∞' : '-∞'
    const r = Number(v.toPrecision(digits))
    return Object.is(r, -0) ? '0' : String(r)
  }
  return String(v)
}

export const PALETTE = ['#e4572e', '#2e86ab', '#3bb273', '#a259ff', '#f2a541', '#d63a8c']
