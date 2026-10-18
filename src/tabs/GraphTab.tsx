import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ConstantNode, ParenthesisNode, derivative, isSymbolNode, simplify, type EvalFunction, type MathNode } from 'mathjs'
import { Plot } from '../components/Plot'
import { Slider } from '../components/Slider'
import { MathInput } from '../components/MathInput'
import { Dropdown } from '../components/Dropdown'
import { GraphSaves } from '../components/GraphSaves'
import { Tex } from '../components/Tex'
import { PALETTE, evalNum, texOf } from '../lib/math'
import { definedName, readGraphExpr, type Curve } from '../lib/graphExpr'
import { PRESET_GROUPS, type Preset } from '../lib/graphPresets'
import { Curves, Ghosts } from '../components/GraphCurves'
import { useRaf } from '../lib/useRaf'
import { useMedia } from '../lib/useMedia'
import { usePresent } from '../lib/display'
import { findFeatures, type Feature } from '../lib/features'
import { num, readHash, useSyncHash } from '../lib/route'
import type { PlotCtx, View } from '../components/Plot'

/** hidden: 隠す、deriv: 導関数を重ねる、area: [a, b] の面積を塗る */
type Row = { id: number; src: string; hidden?: boolean; deriv?: boolean; area?: [number, number] }
type Range = { min: number; max: number; step: number }


const RANGE = { min: -5, max: 5 }
const VIEW: View = { xMin: -8, xMax: 8, yMin: -5, yMax: 5 }
/** パラメータ以外に使う URL のキー */
const RESERVED = new Set(['f', 'view', 'play', 'pts', 'trail', 'hide', 'deriv', 'area', 'rng'])
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
const r2 = (v: number, d = 2) => (Number.isFinite(v) ? Number(v.toFixed(d)) || 0 : NaN)

/** 数値積分（シンプソン則） */
function integrate(f: (x: number) => number, a: number, b: number, n = 400) {
  const h = (b - a) / n
  let s = f(a) + f(b)
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2)
  return (s * h) / 3
}

/** スライダーの最小・最大・刻みを決める */
function RangeEditor({ value, onChange, onReset }: { value: Range; onChange: (r: Range) => void; onReset: () => void }) {
  const field = (k: keyof Range, label: string) => (
    <label>
      {label}
      <input
        type="number"
        value={value[k]}
        step={k === 'step' ? 0.01 : 1}
        onChange={(e) => {
          const v = Number(e.target.value)
          if (e.target.value === '' || !Number.isFinite(v)) return
          const next = { ...value, [k]: v }
          if (next.min < next.max && next.step > 0) onChange(next)
        }}
      />
    </label>
  )
  return (
    <div className="range-edit">
      {field('min', '最小')}
      {field('max', '最大')}
      {field('step', '刻み')}
      <button className="chip" onClick={() => onChange({ ...value, step: 1 })}>
        整数だけ
      </button>
      <button className="chip" onClick={onReset}>
        元に戻す
      </button>
    </div>
  )
}
const LABEL: Record<Feature['kind'], string> = { root: '', yint: '', max: '極大', min: '極小', cross: '交点' }

function readView(s: string | null): View {
  const v = (s ?? '').split(',').map(Number)
  return v.length === 4 && v.every(Number.isFinite) && v[0] < v[1] && v[2] < v[3] ? { xMin: v[0], xMax: v[1], yMin: v[2], yMax: v[3] } : VIEW
}

function substitute(node: MathNode, scope: Record<string, number>): MathNode {
  return node.transform((n) => {
    // 数の値だけを入れる（名前をつけた関数の名前はそのまま）
    if (!isSymbolNode(n) || typeof scope[n.name] !== 'number') return n
    const v = Math.round(scope[n.name] * 100) / 100
    return v < 0 ? new ParenthesisNode(new ConstantNode(v)) : new ConstantNode(v)
  })
}

export function GraphTab() {
  const nextId = useRef(100)
  const [hp] = useState(() => readHash().params)
  const [rows, setRows] = useState<Row[]>(() => {
    const fs = hp.getAll('f')
    const list = (k: string) => new Set((hp.get(k) ?? '').split(',').filter(Boolean).map(Number))
    const hide = list('hide')
    const deriv = list('deriv')
    const areas = new Map(
      hp.getAll('area').flatMap((s) => {
        const [i, a, b] = s.split(':').map(Number)
        return [i, a, b].every(Number.isFinite) ? [[i, [a, b] as [number, number]] as const] : []
      }),
    )
    return (fs.length ? fs : ['a*sin(b*x + c)']).map((src, i) => ({ id: i + 1, src, hidden: hide.has(i) || undefined, deriv: deriv.has(i) || undefined, area: areas.get(i) }))
  })
  const [ranges, setRanges] = useState<Record<string, Range>>(() =>
    Object.fromEntries(
      hp.getAll('rng').flatMap((s) => {
        const [n, ...v] = s.split(':')
        const [min, max, step] = v.map(Number)
        return n && [min, max, step].every(Number.isFinite) && min < max && step > 0 ? [[n, { min, max, step }]] : []
      }),
    ),
  )
  const [editRange, setEditRange] = useState<string | null>(null)
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null)
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

  // 先に名前をつけた関数を拾ってから、各行を読む（f(x) = … の行があれば、ほかの行で f(…) が使える）
  const exprs = useMemo(() => {
    const fns = rows.flatMap((r) => {
      const d = definedName(r.src)
      return d?.fn ? [d.name] : []
    })
    return rows.map((r) => readGraphExpr(r.src, fns))
  }, [rows])
  // 名前をつけた関数・定数
  const defs = useMemo(
    () => exprs.flatMap((e) => (e.ok && (e.curve.kind === 'const' || (e.curve.kind === 'fn' && e.curve.name)) ? [e.curve] : [])) as (Extract<Curve, { kind: 'const' }> | Extract<Curve, { kind: 'fn' }>)[],
    [exprs],
  )
  const defNames = useMemo(() => new Set(defs.map((d) => (d.kind === 'const' ? d.name : d.name!))), [defs])
  const names = useMemo(() => {
    const s = new Set<string>()
    exprs.forEach((e) => e.ok && e.symbols.forEach((n) => !defNames.has(n) && s.add(n)))
    return [...s].sort()
  }, [exprs, defNames])
  /** パラメータの値に、名前をつけた定数・関数を足した scope */
  const withDefs = useCallback(
    (base: Record<string, number>) => {
      const sc: Record<string, unknown> = { ...base }
      let depth = 0
      for (const d of defs)
        if (d.kind === 'fn' && d.name) {
          const { code } = d.f
          const arg = d.arg
          sc[d.name] = (v: number) => {
            // 互いに呼び合う定義で止まらなくならないように
            if (depth > 40) return NaN
            depth++
            try {
              return evalNum(code, { ...sc, [arg]: v })
            } finally {
              depth--
            }
          }
        }
      // 定数どうしが参照し合ってもよいように、何回か計算し直す
      for (let pass = 0; pass < 4; pass++) for (const d of defs) if (d.kind === 'const') sc[d.name] = evalNum(d.v.code, sc)
      return sc as Record<string, number>
    },
    [defs],
  )
  const pscope = Object.fromEntries(names.map((n) => [n, params[n] ?? 1]))
  const scope = withDefs(pscope)
  const active = names.filter((n) => playing[n])
  const narrow = useMedia('(max-width: 900px)')
  const present = usePresent()
  const plotH = present ? Math.max(520, window.innerHeight - 120) : narrow ? 300 : 520
  /** スライダーの範囲。決めていなければ -5〜5 で、値がはみ出したら広げる */
  const rangeOf = (n: string): Range => {
    if (ranges[n]) return ranges[n]
    const m = Math.max(RANGE.max, Math.ceil(Math.abs(scope[n] ?? 1) / 5) * 5)
    return { min: -m, max: m, step: 0.01 }
  }
  const ids = rows.map((r) => r.id)
  // 残像の各時点の scope（定数・関数を足したもの）
  const ghostScopes = useMemo(() => snaps.map(withDefs), [snaps, withDefs])
  const hidden = useMemo(() => new Set(rows.filter((r) => r.hidden).map((r) => r.id)), [rows])
  // 導関数（式で求められるときは式で、だめなら数値で）
  const derivs = useMemo(
    () =>
      exprs.map((e) => {
        if (!e.ok || e.curve.kind !== 'fn') return null
        try {
          const node = simplify(derivative(e.curve.f.node, e.curve.arg))
          return { node, code: node.compile() as EvalFunction }
        } catch {
          return null
        }
      }),
    [exprs],
  )

  // 式・パラメータの値・表示範囲・再生中のパラメータを URL に残す
  // 縦横の目盛りをそろえるため、表示範囲は既定の範囲（x −8〜8、y −5〜5）を含むように広がる。
  // 中心が同じで、どちらかの幅が既定と同じなら、既定のまま（URL に書かない）
  const near = (a: number, b: number) => Math.abs(a - b) < 1e-6
  const sameView =
    near((view.xMin + view.xMax) / 2, (VIEW.xMin + VIEW.xMax) / 2) &&
    near((view.yMin + view.yMax) / 2, (VIEW.yMin + VIEW.yMax) / 2) &&
    (near(view.xMax - view.xMin, VIEW.xMax - VIEW.xMin) || near(view.yMax - view.yMin, VIEW.yMax - VIEW.yMin))
  useSyncHash('graph', {
    f: rows.map((r) => r.src),
    ...Object.fromEntries(names.filter((n) => !RESERVED.has(n)).map((n) => [n, scope[n]])),
    view: sameView ? null : [view.xMin, view.xMax, view.yMin, view.yMax].map(num).join(','),
    play: active.length ? active.join(',') : null,
    pts: showPts ? null : '0',
    trail: trail ? '1' : null,
    hide: rows.some((r) => r.hidden) ? rows.flatMap((r, i) => (r.hidden ? [i] : [])).join(',') : null,
    deriv: rows.some((r) => r.deriv) ? rows.flatMap((r, i) => (r.deriv ? [i] : [])).join(',') : null,
    area: rows.flatMap((r, i) => (r.area ? [`${i}:${num(r.area[0])}:${num(r.area[1])}`] : [])),
    rng: Object.entries(ranges).map(([n, r]) => `${n}:${num(r.min)}:${num(r.max)}:${num(r.step)}`),
  })

  useRaf(active.length > 0, (dt) => {
    setParams((p) => {
      const next = { ...p }
      for (const k of active) {
        let d = dirs.current[k] ?? 1
        const rg = rangeOf(k)
        let v = (next[k] ?? 1) + d * dt * 1.5 * ((rg.max - rg.min) / 10)
        if (v > rg.max) [v, d] = [rg.max, -1]
        if (v < rg.min) [v, d] = [rg.min, 1]
        dirs.current[k] = d
        next[k] = v
      }
      return next
    })
  })

  // 動かした跡: パラメータが変わるたびに（0.1 秒おきに）、そのときの値と、頂点などの位置を残す
  // 跡はパラメータの値だけで残す（定数・関数は描くときに足す）
  const scopeKey = JSON.stringify(pscope)
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
    const sc = withDefs(JSON.parse(scopeKey) as Record<string, number>)
    setSnaps((s) => [...s, sc].slice(-MAX_SNAPS))
    const fns = exprs.flatMap((e, i) => (e.ok && e.curve.kind === 'fn' && !rows[i].hidden ? [{ c: e.curve.f.code, arg: e.curve.arg, i }] : []))
    if (!fns.length) return
    const feats = findFeatures(
      fns.map(({ c, arg }) => (x: number) => evalNum(c, { ...sc, [arg]: x })),
      view.xMin,
      view.xMax,
      view.yMax - view.yMin,
    )
    const pts = feats.flatMap((ps, k) => ps.filter((p) => p.kind === 'max' || p.kind === 'min' || p.kind === 'cross').map((p) => ({ x: p.x, y: p.y, i: fns[k].i })))
    setTrailPts((t) => [...t, ...pts].slice(-MAX_TRAIL))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- パラメータの値が変わったときだけ残す
  }, [scopeKey, trail])

  const setRow = (id: number, src: string) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, src } : r)))
  const patchRow = (id: number, p: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)))
  const loadPreset = (p: Preset) => {
    setRows(p.rows.map((x) => (typeof x === 'string' ? { id: nextId.current++, src: x } : { id: nextId.current++, ...x })))
    if (p.params) setParams((o) => ({ ...o, ...p.params }))
    setPlaying(p.play ? { [p.play]: true } : {})
    setTrail(!!p.trail)
    clearTrail()
  }

  return (
    <div className="layout graph-layout">
      <aside className="panel">
        <GraphSaves suggest={rows.find((r) => r.src.trim())?.src.trim().slice(0, 40) ?? ''} />
        <h2>式</h2>
        <details className="howto">
          <summary>x 以外の文字はスライダーになる。書き方の例</summary>
          <p className="hint">x²・√x・sin 2x・|x| のようなふだんの書き方も、LaTeX も使える。円 x² + y² = 4、領域 y {'>'} x²、媒介変数 (cos t, sin t)、極座標 r = 1 + cos θ も描ける。f(x) = x² のように関数に、k = 2 のように定数に名前をつけると、ほかの行で f(x − k) のように使える。</p>
        </details>
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
                  <>
                    <button
                      className={`icon-btn eye ${r.hidden ? 'off' : ''}`}
                      onClick={() => patchRow(r.id, { hidden: !r.hidden || undefined })}
                      title={r.hidden ? '表示する' : '隠す'}
                      aria-pressed={!r.hidden}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                        <circle cx="12" cy="12" r="3" />
                        {r.hidden && <path d="M3 3l18 18" />}
                      </svg>
                    </button>
                    {rows.length > 1 && (
                      <button className="icon-btn" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} title="削除">
                        ×
                      </button>
                    )}
                  </>
                }
              />
              {e.ok && (
                <div className="expr-tex">
                  <Tex tex={e.join(e.parts.map((n) => texOf(n)))} />
                  {e.symbols.length > 0 && <Tex className="sub" tex={`\\to\\ ${e.join(e.parts.map((n) => texOf(substitute(n, scope))))}`} />}
                  {r.deriv && derivs[i] && <Tex className="sub" tex={`y' = ${texOf(derivs[i]!.node)}`} />}
                  {e.curve.kind === 'const' && <Tex className="sub" tex={`= ${r2(scope[e.curve.name], 4)}\\ \\text{（定数）}`} />}
                </div>
              )}
              {e.ok && e.curve.kind === 'fn' && (
                <div className="row-tools">
                  <button className={`chip ${r.deriv ? 'on' : ''}`} onClick={() => patchRow(r.id, { deriv: !r.deriv || undefined })} title="導関数のグラフを点線で重ねる">
                    導関数 y′
                  </button>
                  <button className={`chip ${r.area ? 'on' : ''}`} onClick={() => patchRow(r.id, { area: r.area ? undefined : [0, 2] })} title="区間の面積（定積分）を塗る">
                    面積 ∫
                  </button>
                  {r.area && (
                    <span className="area-range">
                      <input type="number" step="0.5" value={r.area[0]} aria-label="積分の下端" onChange={(ev) => ev.target.value !== '' && patchRow(r.id, { area: [Number(ev.target.value), r.area![1]] })} />
                      〜
                      <input type="number" step="0.5" value={r.area[1]} aria-label="積分の上端" onChange={(ev) => ev.target.value !== '' && patchRow(r.id, { area: [r.area![0], Number(ev.target.value)] })} />
                      <Tex tex={`=\\ ${r2(integrate((x) => evalNum((e.curve as { f: { code: EvalFunction } }).f.code, { ...scope, [(e.curve as { arg: string }).arg]: x }), r.area[0], r.area[1]), 4)}`} />
                    </span>
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
              <div key={n} className="param-row">
                <Slider
                  name={n}
                  value={scope[n]}
                  {...rangeOf(n)}
                  onChange={(v) => setParams((p) => ({ ...p, [n]: v }))}
                  playing={!!playing[n]}
                  onTogglePlay={() => setPlaying((p) => ({ ...p, [n]: !p[n] }))}
                />
                <button className="icon-btn range-btn" onClick={() => setEditRange(editRange === n ? null : n)} title="範囲と刻みを変える" aria-expanded={editRange === n}>
                  ⋯
                </button>
                {editRange === n && (
                  <RangeEditor
                    value={rangeOf(n)}
                    onChange={(rg) => setRanges((o) => ({ ...o, [n]: rg }))}
                    onReset={() =>
                      setRanges((o) => {
                        const next = { ...o }
                        delete next[n]
                        return next
                      })
                    }
                  />
                )}
              </div>
            ))}
          </>
        )}

        <div className="graph-toggles">
          <button className={`chip ${showPts ? 'on' : ''}`} aria-pressed={showPts} onClick={() => setShowPts(!showPts)} title="頂点・極値・交点に印と座標をつける">
            頂点・交点の印
          </button>
          <button
            className={`chip ${trail ? 'on' : ''}`}
            aria-pressed={trail}
            onClick={() => {
              setTrail(!trail)
              clearTrail()
            }}
            title="動かしたときの前の形と、頂点などが動いた跡を残す"
          >
            動かした跡
          </button>
          {trail && (snaps.length > 0 || trailPts.length > 0) && (
            <button className="chip" onClick={clearTrail}>
              跡を消す
            </button>
          )}
        </div>

        <h2>例</h2>
        <Dropdown
          label="例を選ぶ（単元ごと）"
          groups={PRESET_GROUPS.map((g) => ({ label: g.unit, items: g.items.map((p) => ({ label: p.label, value: p })) }))}
          onSelect={loadPreset}
        />
      </aside>

      <section className="stage">
        <Plot initial={initialView} height={plotH} onView={setView} equal onHover={setHover}>
          {(ctx) => {
            // y = f(x) の式（頂点・交点の印の対象）
            const ok = exprs.flatMap((e, i) => (e.ok && e.curve.kind === 'fn' && !rows[i].hidden ? [{ f: ((c, arg) => (x: number) => evalNum(c, { ...scope, [arg]: x }))(e.curve.f.code, e.curve.arg), i }] : []))
            const feats = showPts ? findFeatures(ok.map((o) => o.f), ctx.view.xMin, ctx.view.xMax, ctx.view.yMax - ctx.view.yMin) : []
            return (
              <>
                {/* 面積（定積分）: 曲線と x 軸の間。x 軸より下（負の面積）は灰色 */}
                {ok.map(({ f, i }) => {
                  const ar = rows[i].area
                  if (!ar) return null
                  const [a, b] = ar[0] <= ar[1] ? ar : [ar[1], ar[0]]
                  const n = 200
                  const up: string[] = []
                  const down: string[] = []
                  for (let k = 0; k <= n; k++) {
                    const x = a + ((b - a) * k) / n
                    const y = f(x)
                    if (!Number.isFinite(y)) continue
                    const pt = `${ctx.sx(x).toFixed(1)},${ctx.sy(Math.max(Math.min(y, ctx.view.yMax * 4), ctx.view.yMin * 4)).toFixed(1)}`
                    up.push(pt)
                    down.push(`${ctx.sx(x).toFixed(1)},${ctx.sy(0).toFixed(1)}`)
                  }
                  const color = PALETTE[i % PALETTE.length]
                  return (
                    <g key={`area-${ids[i]}`}>
                      <clipPath id={`above-${ids[i]}`}>
                        <rect x={0} y={0} width={ctx.w} height={Math.max(0, ctx.sy(0))} />
                      </clipPath>
                      <polygon points={[...up, ...down.reverse()].join(' ')} fill="var(--muted)" opacity={0.35} />
                      <polygon points={[...up, ...down].join(' ')} fill={color} opacity={0.3} clipPath={`url(#above-${ids[i]})`} />
                      {[a, b].map((x) => (
                        <line key={x} x1={ctx.sx(x)} x2={ctx.sx(x)} y1={ctx.sy(0)} y2={ctx.sy(f(x))} stroke={color} strokeDasharray="4 3" />
                      ))}
                    </g>
                  )
                })}
                {trail && <Ghosts exprs={exprs} ids={ids} snaps={ghostScopes} ctx={ctx} hidden={hidden} />}
                <Curves exprs={exprs} ids={ids} scope={scope} ctx={ctx} hidden={hidden} />
                {/* 導関数: 同じ色の点線 */}
                {exprs.map((e, i) => {
                  if (!e.ok || e.curve.kind !== 'fn' || !rows[i].deriv || rows[i].hidden) return null
                  const { code } = e.curve.f
                  const arg = e.curve.arg
                  const d = derivs[i]
                  // 式で求められないとき（名前をつけた関数を使う式など）は数値で
                  const fx = (x: number) => evalNum(code, { ...scope, [arg]: x })
                  const df = d ? (x: number) => evalNum(d.code, { ...scope, [arg]: x }) : (x: number) => (fx(x + 1e-5) - fx(x - 1e-5)) / 2e-5
                  return <path key={`d-${ids[i]}`} d={ctx.path(df)} stroke={PALETTE[i % PALETTE.length]} className="curve deriv" />
                })}
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
                {hover && <TracePoint ok={ok} ctx={ctx} p={hover} />}
              </>
            )
          }}
        </Plot>
        <p className="hint">{narrow ? 'ドラッグで移動、2 本の指で拡大縮小。' : 'ドラッグで移動、ホイールで拡大縮小。'}</p>
      </section>
    </div>
  )
}

/** なぞった点: マウス（指）の位置に一番近いグラフの上の点と、その傾き */
function TracePoint({ ok, ctx, p }: { ok: { f: (x: number) => number; i: number }[]; ctx: PlotCtx; p: { x: number; y: number } }) {
  let best: { f: (x: number) => number; i: number; d: number } | null = null
  for (const o of ok) {
    const y = o.f(p.x)
    if (!Number.isFinite(y)) continue
    const d = Math.abs(ctx.sy(y) - ctx.sy(p.y))
    if (d < 90 && (!best || d < best.d)) best = { ...o, d }
  }
  if (!best) return null
  const x = p.x
  const y = best.f(x)
  const m = (best.f(x + 1e-5) - best.f(x - 1e-5)) / 2e-5
  const color = PALETTE[best.i % PALETTE.length]
  const L = 50 / Math.hypot(1, (m * (ctx.sx(1) - ctx.sx(0))) / (ctx.sy(0) - ctx.sy(1)) || 1) / (ctx.sx(1) - ctx.sx(0))
  const label = `(${fmtPt(x)}, ${fmtPt(y)})  傾き ${Number.isFinite(m) ? fmtPt(m) : '—'}`
  const left = ctx.sx(x) > ctx.w - 190
  return (
    <g className="trace" pointerEvents="none">
      {Number.isFinite(m) && <line x1={ctx.sx(x - L)} y1={ctx.sy(y - m * L)} x2={ctx.sx(x + L)} y2={ctx.sy(y + m * L)} stroke={color} strokeWidth={1.5} />}
      <line x1={ctx.sx(x)} x2={ctx.sx(x)} y1={ctx.sy(y)} y2={ctx.sy(0)} className="trace-drop" />
      <circle cx={ctx.sx(x)} cy={ctx.sy(y)} r={5.5} fill={color} stroke="var(--surface)" strokeWidth={2} />
      <text x={ctx.sx(x) + (left ? -10 : 10)} y={ctx.sy(y) - 12} textAnchor={left ? 'end' : 'start'} className="pt-label">
        {label}
      </text>
    </g>
  )
}
