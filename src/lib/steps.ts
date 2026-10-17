import {
  OperatorNode,
  ConstantNode,
  ParenthesisNode,
  isOperatorNode,
  isParenthesisNode,
  isConstantNode,
  type MathNode,
} from 'mathjs'

export type Step = {
  label: string
  before: MathNode
  after: MathNode
  /** before 内で書き換えられた部分 */
  target: MathNode
  /** after 内の書き換え後の部分 */
  replacement: MathNode
  /** 式全体を整理する手（部分ハイライトしない） */
  whole?: boolean
}

const un = (n: MathNode): MathNode => (isParenthesisNode(n) ? un(n.content) : n)
const opOf = (n: MathNode) => {
  const u = un(n)
  return isOperatorNode(u) ? u : null
}
const isSum = (n: MathNode) => {
  const o = opOf(n)
  return !!o && (o.fn === 'add' || o.fn === 'subtract') && o.args.length === 2
}
const op = (sym: string, fn: string, args: MathNode[]): MathNode =>
  new OperatorNode(sym as never, fn as never, args)
const mul = (a: MathNode, b: MathNode) => op('*', 'multiply', [wrap(a), wrap(b)])
const add = (a: MathNode, b: MathNode) => op('+', 'add', [a, b])
const sub = (a: MathNode, b: MathNode) => op('-', 'subtract', [a, wrapNeg(b)])
const neg = (a: MathNode) => op('-', 'unaryMinus', [wrapNeg(a)])
const combine = (fn: string, a: MathNode, b: MathNode) => (fn === 'add' ? add(a, b) : sub(a, b))

function wrap(n: MathNode): MathNode {
  if (isParenthesisNode(n)) return n
  const o = opOf(n)
  if (o && (isSum(o) || o.fn === 'unaryMinus')) return new ParenthesisNode(n)
  return n
}
function wrapNeg(n: MathNode): MathNode {
  return isSum(n) && !isParenthesisNode(n) ? new ParenthesisNode(n) : n
}

type Rule = { label: string; apply: (n: MathNode) => MathNode | null }

const RULES: Rule[] = [
  {
    label: '累乗を掛け算に書き直す',
    apply(n) {
      if (!isOperatorNode(n) || n.fn !== 'pow') return null
      const [base, ex] = n.args
      if (!isSum(base) || !isConstantNode(ex)) return null
      const k = Number(ex.value)
      if (!Number.isInteger(k) || k < 2 || k > 4) return null
      let out: MathNode = new ParenthesisNode(un(base).cloneDeep())
      for (let i = 1; i < k; i++) out = op('*', 'multiply', [out, new ParenthesisNode(un(base).cloneDeep())])
      return out
    },
  },
  {
    label: 'マイナスを括弧の中に配る',
    apply(n) {
      if (!isOperatorNode(n)) return null
      if (n.fn === 'unaryMinus' && isSum(n.args[0])) {
        const s = opOf(n.args[0])!
        return combine(s.fn === 'add' ? 'subtract' : 'add', neg(s.args[0]), s.args[1])
      }
      if (n.fn === 'subtract' && isSum(n.args[1]) && isParenthesisNode(n.args[1])) {
        const s = opOf(n.args[1])!
        return combine(s.fn === 'add' ? 'subtract' : 'add', sub(n.args[0], s.args[0]), s.args[1])
      }
      return null
    },
  },
  {
    label: '分配法則で展開する',
    apply(n) {
      if (!isOperatorNode(n) || n.fn !== 'multiply' || n.args.length !== 2) return null
      const [l, r] = n.args
      if (isSum(l)) {
        const s = opOf(l)!
        return combine(s.fn, mul(s.args[0], r.cloneDeep()), mul(s.args[1], r.cloneDeep()))
      }
      if (isSum(r)) {
        const s = opOf(r)!
        return combine(s.fn, mul(l.cloneDeep(), s.args[0]), mul(l.cloneDeep(), s.args[1]))
      }
      return null
    },
  },
]

function applyOnce(root: MathNode, rule: Rule) {
  let target: MathNode | null = null
  let replacement: MathNode | null = null
  const after = root.transform((n) => {
    if (target) return n
    const r = rule.apply(n)
    if (!r) return n
    target = n
    replacement = r
    return r
  })
  return target && replacement ? { after, target: target as MathNode, replacement: replacement as MathNode } : null
}

type Term = { neg: boolean; node: MathNode }

function terms(n: MathNode, negated = false, out: Term[] = []): Term[] {
  const u = un(n)
  if (isOperatorNode(u) && (u.fn === 'add' || u.fn === 'subtract') && u.args.length === 2) {
    terms(u.args[0], negated, out)
    terms(u.args[1], u.fn === 'subtract' ? !negated : negated, out)
  } else if (isOperatorNode(u) && u.fn === 'unaryMinus') {
    terms(u.args[0], !negated, out)
  } else {
    out.push({ neg: negated, node: u })
  }
  return out
}

function joinTerms(ts: Term[]): MathNode {
  return ts.reduce<MathNode | null>((acc, t) => {
    if (!acc) return t.neg ? neg(t.node) : t.node
    return t.neg ? sub(acc, t.node) : add(acc, t.node)
  }, null)!
}

type Mono = { coef: number; factors: Map<string, { base: MathNode; exp: number }> }

/** 項を「係数 × 文字の累乗の積」に分解する */
function toMono(n: MathNode, m: Mono = { coef: 1, factors: new Map() }, k = 1): Mono {
  const u = un(n)
  if (isConstantNode(u) && typeof u.value === 'number') {
    m.coef *= u.value ** k
    return m
  }
  if (isOperatorNode(u)) {
    if (u.fn === 'multiply') {
      u.args.forEach((a) => toMono(a, m, k))
      return m
    }
    if (u.fn === 'unaryMinus') {
      m.coef *= -1
      return toMono(u.args[0], m, k)
    }
    if (u.fn === 'divide' && isConstantNode(u.args[1])) {
      m.coef /= Number(u.args[1].value) ** k
      return toMono(u.args[0], m, k)
    }
    if (u.fn === 'pow' && isConstantNode(u.args[1]) && !isConstantNode(un(u.args[0]))) {
      return toMono(u.args[0], m, k * Number(u.args[1].value))
    }
  }
  const key = u.toString()
  const f = m.factors.get(key)
  m.factors.set(key, { base: u, exp: (f?.exp ?? 0) + k })
  return m
}

const monoKey = (m: Mono) =>
  [...m.factors.entries()]
    .filter(([, f]) => f.exp !== 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, f]) => `${k}^${f.exp}`)
    .join('*')

function fromMono(m: Mono): Term {
  const fs = [...m.factors.entries()]
    .filter(([, f]) => f.exp !== 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, f]) => (f.exp === 1 ? f.base : op('^', 'pow', [wrapPow(f.base), new ConstantNode(f.exp)])))
  const c = Math.abs(m.coef)
  const parts = c === 1 && fs.length ? fs : [new ConstantNode(Number(c.toPrecision(12))), ...fs]
  return { neg: m.coef < 0, node: parts.reduce((acc, f) => op('*', 'multiply', [acc, wrap(f)])) }
}

function wrapPow(n: MathNode): MathNode {
  return isOperatorNode(n) ? new ParenthesisNode(n) : n
}

function monos(n: MathNode): Mono[] {
  return terms(n).map((t) => {
    const m = toMono(t.node)
    if (t.neg) m.coef *= -1
    return m
  })
}

/** 指数ベクトルの辞書式（降順）で並べる */
function compareMono(a: Mono, b: Mono, vars: string[]) {
  const deg = (m: Mono) => [...m.factors.values()].reduce((s, f) => s + f.exp, 0)
  const d = deg(b) - deg(a)
  if (d) return d
  for (const v of vars) {
    const diff = (b.factors.get(v)?.exp ?? 0) - (a.factors.get(v)?.exp ?? 0)
    if (diff) return diff
  }
  return 0
}

function normalizeTerms(n: MathNode): MathNode {
  return joinTerms(monos(n).map(fromMono))
}

function collectLikeTerms(n: MathNode): MathNode {
  const groups = new Map<string, Mono>()
  for (const m of monos(n)) {
    const key = monoKey(m)
    const g = groups.get(key)
    if (g) g.coef += m.coef
    else groups.set(key, m)
  }
  const list = [...groups.values()].filter((m) => Math.abs(m.coef) > 1e-12)
  if (!list.length) return new ConstantNode(0)
  const vars = [...new Set(list.flatMap((m) => [...m.factors.keys()]))].sort()
  list.sort((a, b) => compareMono(a, b, vars))
  return joinTerms(list.map(fromMono))
}

export function deriveSteps(start: MathNode, max = 40): Step[] {
  const steps: Step[] = []
  let cur = start
  outer: while (steps.length < max) {
    for (const rule of RULES) {
      const res = applyOnce(cur, rule)
      if (res) {
        steps.push({ label: rule.label, before: cur, ...res })
        cur = res.after
        continue outer
      }
    }
    break
  }
  const finals: [string, (n: MathNode) => MathNode][] = [
    ['各項の中を整理する（a·a → a² など）', normalizeTerms],
    ['同類項をまとめて並べ替える', collectLikeTerms],
  ]
  for (const [label, f] of finals) {
    const next = f(cur)
    if (next.toString() === cur.toString()) continue
    steps.push({ label, before: cur, after: next, target: cur, replacement: next, whole: true })
    cur = next
  }
  return steps
}
