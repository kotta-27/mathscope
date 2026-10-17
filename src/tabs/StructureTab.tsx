import { useMemo, useState } from 'react'
import {
  isConstantNode,
  isFunctionNode,
  isOperatorNode,
  isParenthesisNode,
  isSymbolNode,
  type MathNode,
} from 'mathjs'
import { Slider } from '../components/Slider'
import { Tex } from '../components/Tex'
import { readHash } from '../lib/route'
import { PALETTE, fmt, parseExpr, texOf, unwrap } from '../lib/math'

type TNode = { node: MathNode; kind: string; detail: string; role?: string; children: TNode[] }

const OPS: Record<string, { kind: string; detail: string; roles: string[] }> = {
  add: { kind: '和', detail: '項を足し合わせる', roles: ['項'] },
  subtract: { kind: '差', detail: '左から右を引く', roles: ['引かれる数', '引く数'] },
  multiply: { kind: '積', detail: '因数を掛け合わせる', roles: ['因数'] },
  divide: { kind: '商', detail: '分子 ÷ 分母', roles: ['分子', '分母'] },
  pow: { kind: '累乗', detail: '底を指数の回数だけ掛ける', roles: ['底', '指数'] },
  unaryMinus: { kind: '符号反転', detail: '−1 を掛ける', roles: ['対象'] },
  mod: { kind: '剰余', detail: '割った余り', roles: ['割られる数', '割る数'] },
  factorial: { kind: '階乗', detail: 'n × (n−1) × … × 1', roles: ['n'] },
}

const FUNCS: Record<string, string> = {
  sin: '正弦。単位円上の点の y 座標',
  cos: '余弦。単位円上の点の x 座標',
  tan: '正接。sin ÷ cos、傾き',
  exp: '指数関数 eˣ。変化率が自分自身に等しい',
  log: '自然対数。e を何乗すればよいか',
  sqrt: '平方根。2 乗すると中身になる数',
  abs: '絶対値。0 からの距離',
  asin: '逆正弦',
  acos: '逆余弦',
  atan: '逆正接',
}

const SYMS: Record<string, string> = { pi: '円周率 ≈ 3.14159', e: 'ネイピア数 ≈ 2.71828' }

/** 同じ結合的演算（和・積）の入れ子は平らにする */
function flatArgs(n: MathNode, fn: string): MathNode[] {
  if (isOperatorNode(n) && n.fn === fn && (fn === 'add' || fn === 'multiply'))
    return n.args.flatMap((a) => flatArgs(a, fn))
  return [n]
}

function build(raw: MathNode, role?: string): TNode {
  const paren = isParenthesisNode(raw)
  const n = unwrap(raw)
  const base = { node: n, role, children: [] as TNode[] }
  let t: TNode
  if (isOperatorNode(n)) {
    const info = OPS[n.fn] ?? { kind: n.op, detail: n.fn, roles: [] }
    const args = n.args.flatMap((a) => flatArgs(a, n.fn))
    t = {
      ...base,
      kind: info.kind,
      detail: info.detail,
      children: args.map((a, i) => build(a, info.roles.length === 1 ? `${info.roles[0]} ${i + 1}` : info.roles[i])),
    }
  } else if (isFunctionNode(n)) {
    t = {
      ...base,
      kind: `関数 ${n.fn.name}`,
      detail: FUNCS[n.fn.name] ?? '関数',
      children: n.args.map((a) => build(a, '引数')),
    }
  } else if (isSymbolNode(n)) {
    t = { ...base, kind: SYMS[n.name] ? '定数' : '変数', detail: SYMS[n.name] ?? 'スライダーで値を変えられる' }
  } else if (isConstantNode(n)) {
    t = { ...base, kind: '数', detail: '' }
  } else {
    t = { ...base, kind: n.type, detail: '' }
  }
  if (paren) t.detail = t.detail ? `${t.detail}（括弧でひとまとまり）` : '括弧でひとまとまり'
  return t
}

/** 一番外側の和・差を項に分ける */
function topTerms(n: MathNode, sign = 1, out: { node: MathNode; sign: number }[] = []) {
  const u = unwrap(n)
  if (isOperatorNode(u) && u.fn === 'add') u.args.forEach((a) => topTerms(a, sign, out))
  else if (isOperatorNode(u) && u.fn === 'subtract') {
    topTerms(u.args[0], sign, out)
    topTerms(u.args[1], -sign, out)
  } else out.push({ node: u, sign })
  return out
}

const PRESETS = [
  '(-b + sqrt(b^2 - 4*a*c)) / (2*a)',
  'a*x^2 + b*x + c',
  'm*g*h + m*v^2/2',
  'sin(x)^2 + cos(x)^2',
  'P*(1 + r/n)^(n*t)',
  'exp(-(x - m)^2 / (2*s^2)) / (s*sqrt(2*pi))',
]

export function StructureTab() {
  const [src, setSrc] = useState(() => readHash().params.get('f') ?? PRESETS[0])
  const [vals, setVals] = useState<Record<string, number>>({ a: 1, b: -3, c: 2 })
  const [hover, setHover] = useState<MathNode | null>(null)
  const p = useMemo(() => parseExpr(src), [src])
  const scope = p.ok ? Object.fromEntries(p.symbols.map((s) => [s, vals[s] ?? 1])) : {}

  const tree = useMemo(() => (p.ok ? build(p.node) : null), [p])
  const terms = useMemo(() => (p.ok ? topTerms(p.node) : []), [p])
  const colors = useMemo(() => {
    if (hover) return new Map([[hover, PALETTE[0]]])
    if (terms.length < 2) return undefined
    return new Map(terms.map((t, i) => [t.node, PALETTE[(i + 1) % PALETTE.length]]))
  }, [hover, terms])

  const valueOf = (n: MathNode) => {
    try {
      return fmt(n.evaluate({ ...scope }))
    } catch {
      return '—'
    }
  }

  return (
    <div className="layout">
      <aside className="panel">
        <h2>式</h2>
        <input className="wide" value={src} onChange={(e) => setSrc(e.target.value)} spellCheck={false} />
        {!p.ok && <div className="error">{p.error}</div>}
        {p.ok && p.symbols.length > 0 && (
          <>
            <h2>文字の値</h2>
            {p.symbols.map((s) => (
              <Slider key={s} name={s} value={scope[s]} min={-10} max={10} onChange={(v) => setVals((o) => ({ ...o, [s]: v }))} />
            ))}
          </>
        )}
        <h2>例</h2>
        <div className="chips">
          {PRESETS.map((s) => (
            <button key={s} className="chip mono" onClick={() => setSrc(s)}>
              {s}
            </button>
          ))}
        </div>
      </aside>

      <section className="stage">
        {p.ok && tree && (
          <>
            <div className="hero-tex">
              <Tex block tex={texOf(p.node, colors)} />
              <div className="hero-value">
                = <strong>{valueOf(p.node)}</strong>
              </div>
            </div>

            {terms.length > 1 && (
              <div className="terms">
                {terms.map((t, i) => (
                  <div
                    key={i}
                    className="term"
                    style={{ borderColor: PALETTE[(i + 1) % PALETTE.length] }}
                    onMouseEnter={() => setHover(t.node)}
                    onMouseLeave={() => setHover(null)}
                  >
                    <span className="term-label">項 {i + 1}</span>
                    <Tex tex={`${t.sign < 0 ? '-' : '+'}\\,${texOf(t.node)}`} />
                    <span className="term-value">{valueOf(t.node)}</span>
                  </div>
                ))}
              </div>
            )}

            <h2>式の木構造</h2>
            <p className="hint">外側の演算から内側へ分解したもの。行にマウスを乗せると、上の式で該当部分が光る。</p>
            <ul className="tree">
              <TreeRow t={tree} hover={hover} setHover={setHover} valueOf={valueOf} />
            </ul>
          </>
        )}
      </section>
    </div>
  )
}

function TreeRow({
  t,
  hover,
  setHover,
  valueOf,
}: {
  t: TNode
  hover: MathNode | null
  setHover: (n: MathNode | null) => void
  valueOf: (n: MathNode) => string
}) {
  const [open, setOpen] = useState(true)
  return (
    <li>
      <div
        className={`tree-row ${hover === t.node ? 'hot' : ''}`}
        onMouseEnter={() => setHover(t.node)}
        onMouseLeave={() => setHover(null)}
        onClick={() => t.children.length && setOpen(!open)}
      >
        <span className="caret">{t.children.length ? (open ? '▾' : '▸') : '·'}</span>
        {t.role && <span className="role">{t.role}</span>}
        <span className="kind">{t.kind}</span>
        <Tex tex={texOf(t.node)} />
        <span className="detail">{t.detail}</span>
        <span className="value">= {valueOf(t.node)}</span>
      </div>
      {open && t.children.length > 0 && (
        <ul>
          {t.children.map((c, i) => (
            <TreeRow key={i} t={c} hover={hover} setHover={setHover} valueOf={valueOf} />
          ))}
        </ul>
      )}
    </li>
  )
}
