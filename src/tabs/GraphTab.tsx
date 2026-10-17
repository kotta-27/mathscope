import { useMemo, useRef, useState } from 'react'
import { ConstantNode, ParenthesisNode, isSymbolNode, type MathNode } from 'mathjs'
import { Plot } from '../components/Plot'
import { Slider } from '../components/Slider'
import { MathInput } from '../components/MathInput'
import { Tex } from '../components/Tex'
import { PALETTE, evalNum, parseExpr, texOf } from '../lib/math'
import { useRaf } from '../lib/useRaf'
import { useMedia } from '../lib/useMedia'
import { usePresent } from '../lib/display'
import { findFeatures, type Feature } from '../lib/features'
import { num, readHash, useSyncHash } from '../lib/route'
import type { View } from '../components/Plot'

type Row = { id: number; src: string }

const PRESETS: { label: string; rows: string[] }[] = [
  { label: '正弦波', rows: ['a*sin(b*x + c)'] },
  { label: '放物線（頂点形）', rows: ['a*(x - p)^2 + q'] },
  { label: '3次関数', rows: ['x^3 + a*x^2 + b*x'] },
  { label: '正規分布', rows: ['exp(-(x - m)^2 / (2*s^2)) / (s*sqrt(2*pi))'] },
  { label: '指数と対数', rows: ['a^x', 'log(x) / log(a)'] },
  { label: '波の重ね合わせ', rows: ['sin(x)', 'sin(k*x)', 'sin(x) + sin(k*x)'] },
]

const RANGE = { min: -5, max: 5 }
const VIEW: View = { xMin: -8, xMax: 8, yMin: -5, yMax: 5 }
/** パラメータ以外に使う URL のキー */
const RESERVED = new Set(['f', 'view', 'play', 'pts'])

/** 2 次関数か（2 階差分が一定で 0 でない）。極値を「頂点」と呼ぶため */
function isQuadratic(f: (x: number) => number) {
  const d2 = (x: number) => f(x + 1) - 2 * f(x) + f(x - 1)
  const a = d2(0.3)
  return Number.isFinite(a) && Math.abs(a) > 1e-9 && [-2.1, 1.7, 4.2].every((x) => Math.abs(d2(x) - a) < 1e-6 * Math.max(1, Math.abs(a)))
}

const fmtPt = (v: number) => String(Number(v.toFixed(2)) || 0)
const LABEL: Record<Feature['kind'], string> = { root: '', yint: '', max: '極大', min: '極小', cross: '交点' }

function readView(s: string | null): View {
  const v = (s ?? '').split(',').map(Number)
  return v.length === 4 && v.every(Number.isFinite) && v[0] < v[1] && v[2] < v[3] ? { xMin: v[0], xMax: v[1], yMin: v[2], yMax: v[3] } : VIEW
}

function substitute(node: MathNode, scope: Record<string, number>): MathNode {
  return node.transform((n) => {
    if (!isSymbolNode(n) || !(n.name in scope)) return n
    const v = Math.round(scope[n.name] * 100) / 100
    return v < 0 ? new ParenthesisNode(new ConstantNode(v)) : new ConstantNode(v)
  })
}

export function GraphTab() {
  const nextId = useRef(100)
  const [hp] = useState(() => readHash().params)
  const [rows, setRows] = useState<Row[]>(() => {
    const fs = hp.getAll('f')
    return (fs.length ? fs : ['a*sin(b*x + c)']).map((src, i) => ({ id: i + 1, src }))
  })
  const [params, setParams] = useState<Record<string, number>>(() => {
    const o: Record<string, number> = {}
    hp.forEach((v, k) => {
      if (!RESERVED.has(k) && v !== '' && Number.isFinite(Number(v))) o[k] = Number(v)
    })
    return o
  })
  const [playing, setPlaying] = useState<Record<string, boolean>>(() =>
    Object.fromEntries((hp.get('play') ?? '').split(',').filter(Boolean).map((k) => [k, true])),
  )
  const [initialView] = useState(() => readView(hp.get('view')))
  const [showPts, setShowPts] = useState(() => hp.get('pts') !== '0')
  const [view, setView] = useState(initialView)
  const dirs = useRef<Record<string, number>>({})

  const parsed = useMemo(() => rows.map((r) => parseExpr(r.src)), [rows])
  const names = useMemo(() => {
    const s = new Set<string>()
    parsed.forEach((p) => p.ok && p.symbols.forEach((n) => n !== 'x' && s.add(n)))
    return [...s].sort()
  }, [parsed])
  const scope = Object.fromEntries(names.map((n) => [n, params[n] ?? 1]))
  const active = names.filter((n) => playing[n])
  const narrow = useMedia('(max-width: 900px)')
  const present = usePresent()
  const plotH = present ? Math.max(520, window.innerHeight - 120) : narrow ? 300 : 520
  /** 値が -5〜5 を超えたら、スライダーの範囲を広げる */
  const rangeOf = (n: string) => {
    const m = Math.max(RANGE.max, Math.ceil(Math.abs(scope[n]) / 5) * 5)
    return { min: -m, max: m }
  }

  // 式・パラメータの値・表示範囲・再生中のパラメータを URL に残す
  const sameView = (Object.keys(VIEW) as (keyof View)[]).every((k) => Math.abs(view[k] - VIEW[k]) < 1e-9)
  useSyncHash('graph', {
    f: rows.map((r) => r.src),
    ...Object.fromEntries(names.filter((n) => !RESERVED.has(n)).map((n) => [n, scope[n]])),
    view: sameView ? null : [view.xMin, view.xMax, view.yMin, view.yMax].map(num).join(','),
    play: active.length ? active.join(',') : null,
    pts: showPts ? null : '0',
  })

  useRaf(active.length > 0, (dt) => {
    setParams((p) => {
      const next = { ...p }
      for (const k of active) {
        let d = dirs.current[k] ?? 1
        let v = (next[k] ?? 1) + d * dt * 1.5
        if (v > RANGE.max) [v, d] = [RANGE.max, -1]
        if (v < RANGE.min) [v, d] = [RANGE.min, 1]
        dirs.current[k] = d
        next[k] = v
      }
      return next
    })
  })

  const setRow = (id: number, src: string) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, src } : r)))
  const loadPreset = (srcs: string[]) => {
    setRows(srcs.map((src) => ({ id: nextId.current++, src })))
    setPlaying({})
  }

  return (
    <div className="layout graph-layout">
      <aside className="panel">
        <h2>式</h2>
        <p className="hint">x 以外の文字はパラメータになり、スライダーで動かせる。x²・√x・sin 2x・|x| のような書き方も、LaTeX もそのまま使える。</p>
        {rows.map((r, i) => {
          const p = parsed[i]
          const color = PALETTE[i % PALETTE.length]
          return (
            <div key={r.id} className="expr-row">
              <MathInput
                value={r.src}
                onChange={(v) => setRow(r.id, v)}
                parsed={p}
                before={<span className="swatch" style={{ background: color }} />}
                after={
                  rows.length > 1 && (
                    <button className="icon-btn" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} title="削除">
                      ×
                    </button>
                  )
                }
              />
              {p.ok && (
                <div className="expr-tex">
                  <Tex tex={`y = ${texOf(p.node)}`} />
                  {names.some((n) => p.symbols.includes(n)) && (
                    <Tex className="sub" tex={`= ${texOf(substitute(p.node, scope))}`} />
                  )}
                </div>
              )}
            </div>
          )
        })}
        <button className="btn" onClick={() => setRows((rs) => [...rs, { id: nextId.current++, src: '' }])}>
          + 式を追加
        </button>

        {names.length > 0 && (
          <>
            <h2>パラメータ</h2>
            {names.map((n) => (
              <Slider
                key={n}
                name={n}
                value={scope[n]}
                {...rangeOf(n)}
                onChange={(v) => setParams((p) => ({ ...p, [n]: v }))}
                playing={!!playing[n]}
                onTogglePlay={() => setPlaying((p) => ({ ...p, [n]: !p[n] }))}
              />
            ))}
          </>
        )}

        <label className="check">
          <input type="checkbox" checked={showPts} onChange={(e) => setShowPts(e.target.checked)} /> 頂点・極値・交点に印をつける
        </label>

        <h2>例</h2>
        <div className="chips">
          {PRESETS.map((p) => (
            <button key={p.label} className="chip" onClick={() => loadPreset(p.rows)}>
              {p.label}
            </button>
          ))}
        </div>
      </aside>

      <section className="stage">
        <Plot initial={initialView} height={plotH} onView={setView}>
          {(ctx) => {
            const fns = parsed.map((p) => (p.ok ? (x: number) => evalNum(p.code, { ...scope, x }) : null))
            const ok = fns.flatMap((f, i) => (f ? [{ f, i }] : []))
            const feats = showPts ? findFeatures(ok.map((o) => o.f), ctx.view.xMin, ctx.view.xMax, ctx.view.yMax - ctx.view.yMin) : []
            return (
              <>
                {ok.map(({ f, i }) => (
                  <path key={rows[i].id} d={ctx.path(f)} stroke={PALETTE[i % PALETTE.length]} className="curve" />
                ))}
                {feats.map((pts, k) => {
                  const { f, i } = ok[k]
                  const quad = isQuadratic(f)
                  // 点が多すぎるとき（sin など）は、座標を書かずに印だけにする
                  const labels = pts.length <= 8
                  return pts
                    .filter((p) => p.y >= ctx.view.yMin && p.y <= ctx.view.yMax)
                    .map((p) => {
                      const name = quad && (p.kind === 'max' || p.kind === 'min') ? '頂点' : LABEL[p.kind]
                      const text = `${name ? `${name} ` : ''}(${fmtPt(p.x)}, ${fmtPt(p.y)})`
                      const below = p.kind === 'min'
                      return (
                        <g key={`${rows[i].id}-${p.kind}-${p.x.toFixed(4)}`} className="feature-pt">
                          <circle cx={ctx.sx(p.x)} cy={ctx.sy(p.y)} r={4.5} stroke={PALETTE[i % PALETTE.length]}>
                            <title>{text}</title>
                          </circle>
                          {labels && (
                            <text x={ctx.sx(p.x) + 7} y={ctx.sy(p.y) + (below ? 18 : -9)} className="pt-label">
                              {text}
                            </text>
                          )}
                        </g>
                      )
                    })
                })}
              </>
            )
          }}
        </Plot>
        <p className="hint">{narrow ? 'ドラッグで移動、2 本の指で拡大縮小。' : 'ドラッグで移動、ホイールで拡大縮小。'}</p>
      </section>
    </div>
  )
}
