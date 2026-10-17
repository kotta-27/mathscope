import { useEffect, useMemo, useRef, useState } from 'react'
import { ConstantNode, ParenthesisNode, isSymbolNode, type MathNode } from 'mathjs'
import { Plot } from '../components/Plot'
import { Slider } from '../components/Slider'
import { MathInput } from '../components/MathInput'
import { Tex } from '../components/Tex'
import { PALETTE, evalNum, texOf } from '../lib/math'
import { readGraphExpr } from '../lib/graphExpr'
import { Curves, Ghosts } from '../components/GraphCurves'
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
  { label: '円', rows: ['(x - a)^2 + (y - b)^2 = r^2'] },
  { label: '楕円・双曲線', rows: ['x^2/a^2 + y^2/b^2 = 1', 'x^2/a^2 - y^2/b^2 = 1'] },
  { label: '不等式の領域', rows: ['y > x^2 - 2', 'x^2 + y^2 < r^2'] },
  { label: '媒介変数（リサジュー）', rows: ['(sin(a*t), sin(b*t))'] },
  { label: '極座標（バラ曲線）', rows: ['r = cos(k*θ)'] },
]

const RANGE = { min: -5, max: 5 }
const VIEW: View = { xMin: -8, xMax: 8, yMin: -5, yMax: 5 }
/** パラメータ以外に使う URL のキー */
const RESERVED = new Set(['f', 'view', 'play', 'pts', 'trail'])
/** 残像の数と、軌跡の点の数の上限 */
const MAX_SNAPS = 12
const MAX_TRAIL = 800

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
  const [trail, setTrail] = useState(() => hp.get('trail') === '1')
  const [snaps, setSnaps] = useState<Record<string, number>[]>([])
  const [trailPts, setTrailPts] = useState<{ x: number; y: number; i: number }[]>([])
  const lastSnap = useRef(0)
  const [view, setView] = useState(initialView)
  const dirs = useRef<Record<string, number>>({})

  const exprs = useMemo(() => rows.map((r) => readGraphExpr(r.src)), [rows])
  const names = useMemo(() => {
    const s = new Set<string>()
    exprs.forEach((e) => e.ok && e.symbols.forEach((n) => s.add(n)))
    return [...s].sort()
  }, [exprs])
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
  // y の範囲は横幅に合わせて決まるので、x の範囲と y の中心だけで比べる
  const sameView =
    Math.abs(view.xMin - VIEW.xMin) < 1e-9 &&
    Math.abs(view.xMax - VIEW.xMax) < 1e-9 &&
    Math.abs((view.yMin + view.yMax) / 2 - (VIEW.yMin + VIEW.yMax) / 2) < 1e-9
  useSyncHash('graph', {
    f: rows.map((r) => r.src),
    ...Object.fromEntries(names.filter((n) => !RESERVED.has(n)).map((n) => [n, scope[n]])),
    view: sameView ? null : [view.xMin, view.xMax, view.yMin, view.yMax].map(num).join(','),
    play: active.length ? active.join(',') : null,
    pts: showPts ? null : '0',
    trail: trail ? '1' : null,
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

  // 動かした跡: パラメータが変わるたびに（0.1 秒おきに）、そのときの値と、頂点などの位置を残す
  const ids = rows.map((r) => r.id)
  const scopeKey = JSON.stringify(scope)
  const clearTrail = () => {
    setSnaps([])
    setTrailPts([])
  }
  const [prevExprs, setPrevExprs] = useState(exprs)
  if (prevExprs !== exprs) {
    // 式が変わったら、跡は消す
    setPrevExprs(exprs)
    clearTrail()
  }
  useEffect(() => {
    if (!trail || !names.length) return
    const now = performance.now()
    if (now - lastSnap.current < 100) return
    lastSnap.current = now
    const sc = JSON.parse(scopeKey) as Record<string, number>
    setSnaps((s) => [...s, sc].slice(-MAX_SNAPS))
    const fns = exprs.flatMap((e, i) => (e.ok && e.curve.kind === 'fn' ? [{ c: e.curve.f.code, i }] : []))
    if (!fns.length) return
    const feats = findFeatures(
      fns.map(({ c }) => (x: number) => evalNum(c, { ...sc, x })),
      view.xMin,
      view.xMax,
      view.yMax - view.yMin,
    )
    const pts = feats.flatMap((ps, k) => ps.filter((p) => p.kind === 'max' || p.kind === 'min' || p.kind === 'cross').map((p) => ({ x: p.x, y: p.y, i: fns[k].i })))
    setTrailPts((t) => [...t, ...pts].slice(-MAX_TRAIL))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- パラメータの値が変わったときだけ残す
  }, [scopeKey, trail])

  const setRow = (id: number, src: string) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, src } : r)))
  const loadPreset = (srcs: string[]) => {
    setRows(srcs.map((src) => ({ id: nextId.current++, src })))
    setPlaying({})
  }

  return (
    <div className="layout graph-layout">
      <aside className="panel">
        <h2>式</h2>
        <p className="hint">x 以外の文字はパラメータになり、スライダーで動かせる。x²・√x・sin 2x・|x| のような書き方も、LaTeX もそのまま使える。円 x² + y² = 4、領域 y {'>'} x²、媒介変数 (cos t, sin t)、極座標 r = 1 + cos θ も描ける。</p>
        {rows.map((r, i) => {
          const e = exprs[i]
          const color = PALETTE[i % PALETTE.length]
          return (
            <div key={r.id} className="expr-row">
              <MathInput
                value={r.src}
                onChange={(v) => setRow(r.id, v)}
                parsed={e.parsed}
                before={<span className="swatch" style={{ background: color }} />}
                after={
                  rows.length > 1 && (
                    <button className="icon-btn" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} title="削除">
                      ×
                    </button>
                  )
                }
              />
              {e.ok && (
                <div className="expr-tex">
                  <Tex tex={e.join(e.parts.map((n) => texOf(n)))} />
                  {e.symbols.length > 0 && <Tex className="sub" tex={`\\to\\ ${e.join(e.parts.map((n) => texOf(substitute(n, scope))))}`} />}
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
        <label className="check">
          <input
            type="checkbox"
            checked={trail}
            onChange={(e) => {
              setTrail(e.target.checked)
              clearTrail()
            }}
          />{' '}
          動かした跡を残す（前の形と、頂点などが動いた跡）
        </label>
        {trail && (snaps.length > 0 || trailPts.length > 0) && (
          <button className="chip" onClick={clearTrail}>
            跡を消す
          </button>
        )}

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
        <Plot initial={initialView} height={plotH} onView={setView} equal>
          {(ctx) => {
            // y = f(x) の式（頂点・交点の印の対象）
            const ok = exprs.flatMap((e, i) => (e.ok && e.curve.kind === 'fn' ? [{ f: ((c) => (x: number) => evalNum(c, { ...scope, x }))(e.curve.f.code), i }] : []))
            const feats = showPts ? findFeatures(ok.map((o) => o.f), ctx.view.xMin, ctx.view.xMax, ctx.view.yMax - ctx.view.yMin) : []
            return (
              <>
                {trail && <Ghosts exprs={exprs} ids={ids} snaps={snaps} ctx={ctx} />}
                <Curves exprs={exprs} ids={ids} scope={scope} ctx={ctx} />
                {trail &&
                  trailPts.map((p, k) => (
                    <circle key={k} cx={ctx.sx(p.x)} cy={ctx.sy(p.y)} r={2.6} fill={PALETTE[p.i % PALETTE.length]} opacity={0.75} className="trail-pt" />
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
