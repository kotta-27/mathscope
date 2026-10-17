import * as mathjs from 'mathjs'
import {
  parse,
  isSymbolNode,
  isFunctionNode,
  isParenthesisNode,
  type MathNode,
  type EvalFunction,
} from 'mathjs'
import { normalizeExpr } from './normalize'

const CONSTANTS = new Set(['pi', 'e', 'i', 'Infinity', 'NaN', 'PI', 'E', 'tau', 'phi'])

export type Parsed =
  | { ok: true; node: MathNode; code: EvalFunction; symbols: string[]; normalized: string }
  /** pos は normalized の中のエラー位置（0 始まり） */
  | { ok: false; error: string; pos?: number; normalized: string }

/** mathjs のエラーメッセージを日本語にする */
function translateError(msg: string, text: string): { error: string; pos?: number } {
  const m = /\(char (\d+)\)/.exec(msg)
  const pos = m ? Math.max(0, Number(m[1]) - 1) : undefined
  const at = pos !== undefined ? text[pos] : undefined
  if (/Unexpected end of expression/.test(msg)) return { error: '式が途中で終わっています', pos: text.length }
  if (/Parenthesis \) expected/.test(msg)) return { error: '閉じ括弧「)」が足りません', pos: text.length }
  if (/Unexpected operator \)/.test(msg)) return { error: '閉じ括弧「)」が多すぎます', pos }
  if (/Unexpected operator/.test(msg)) return { error: `「${at ?? ''}」の位置がおかしいです`, pos }
  if (/Value expected/.test(msg)) return { error: '数か文字が入るべきところに、別のものがあります', pos }
  if (/Unexpected part/.test(msg)) return { error: '前後のつながりが読み取れません（演算子が抜けていませんか）', pos }
  if (/Unexpected type of argument|Too many arguments|Too few arguments/.test(msg)) return { error: '関数の引数の数や種類が合いません' }
  return { error: '式を読み取れませんでした', pos }
}

const isMathFunction = (name: string) => typeof (mathjs as unknown as Record<string, unknown>)[name] === 'function'

export function parseExpr(src: string): Parsed {
  const normalized = normalizeExpr(src)
  if (!normalized) return { ok: false, error: '式を入力してください', normalized }
  let node: MathNode
  try {
    node = parse(normalized)
  } catch (e) {
    return { ok: false, normalized, ...translateError((e as Error).message, normalized) }
  }
  let unknown: string | null = null
  node.traverse((n) => {
    if (!unknown && isFunctionNode(n) && !isMathFunction(n.fn.name)) unknown = n.fn.name
  })
  if (unknown) {
    const pos = normalized.indexOf(unknown)
    return { ok: false, normalized, error: `「${unknown}」という関数はありません`, pos: pos < 0 ? undefined : pos }
  }
  return { ok: true, node, code: node.compile(), symbols: freeSymbols(node), normalized }
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
    // 微分の途中に置く印 D(u, x) は d/dx(u) と描く
    if (isFunctionNode(n) && n.fn.name === 'D' && n.args.length === 2) {
      const v = isSymbolNode(n.args[1]) ? n.args[1].name : 'x'
      const inner = `\\frac{d}{d${v}}\\left(${n.args[0].toTex(options)}\\right)`
      return c ? `\\textcolor{${c}}{${inner}}` : inner
    }
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
