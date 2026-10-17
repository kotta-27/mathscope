import { useMemo, useRef, useState, type PointerEvent } from 'react'
import { derivative, simplify } from 'mathjs'
import { DragPoint, Dot, Line, Plot } from '../components/Plot'
import { Slider } from '../components/Slider'
import { MathInput } from '../components/MathInput'
import { Tex } from '../components/Tex'
import { evalNum, fmt, parseExpr, texOf } from '../lib/math'
import { useRaf } from '../lib/useRaf'
import { readHash, readNum, replaceHash, useSyncHash } from '../lib/route'

const DEMOS = [
  { id: 'circle', label: '単位円と三角関数' },
  { id: 'deriv', label: '微分 = 接線の傾き' },
  { id: 'integral', label: '積分 = 面積' },
] as const
type DemoId = (typeof DEMOS)[number]['id']

/** そのデモを URL で開いたときだけ、URL の値を初期値に使う */
function demoParams(id: DemoId) {
  const { params } = readHash()
  return params.get('demo') === id || (id === 'circle' && !params.get('demo')) ? params : new URLSearchParams()
}

export function GeometryTab() {
  const [demo, setDemo] = useState<DemoId>(() => {
    const d = readHash().params.get('demo')
    return DEMOS.find((x) => x.id === d)?.id ?? 'circle'
  })
  return (
    <>
      <div className="subtabs">
        {DEMOS.map((d) => (
          <button key={d.id} className={`chip ${demo === d.id ? 'on' : ''}`} onClick={() => {
              setDemo(d.id)
              replaceHash('geometry', { demo: d.id })
            }}>
            {d.label}
          </button>
        ))}
      </div>
      {demo === 'circle' && <UnitCircle />}
      {demo === 'deriv' && <Derivative />}
      {demo === 'integral' && <Integral />}
    </>
  )
}

/* ---------- 単位円 ---------- */

const TAU = Math.PI * 2

function piFrac(t: number) {
  const k = Math.round((t / Math.PI) * 12)
  if (Math.abs(k * (Math.PI / 12) - t) > 0.01) return `${t.toFixed(2)}`
  if (k === 0) return '0'
  const g = gcd(k, 12)
  const [n, d] = [k / g, 12 / g]
  const num = n === 1 ? '\\pi' : `${n}\\pi`
  return d === 1 ? num : `\\frac{${num}}{${d}}`
}
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))

function UnitCircle() {
  const [hp] = useState(() => demoParams('circle'))
  const [t, setT] = useState(() => readNum(hp, 't', Math.PI / 6))
  const [play, setPlay] = useState(false)
  const [showTan, setShowTan] = useState(() => hp.get('tan') === '1')
  useSyncHash('geometry', { demo: 'circle', t, tan: showTan })
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)
  useRaf(play, (dt) => setT((v) => (v + dt * 0.8) % TAU))

  const R = 130
  const cx = 170
  const cy = 190
  const W0 = 350
  const WW = 420
  const px = cx + R * Math.cos(t)
  const py = cy - R * Math.sin(t)
  const wx = (a: number) => W0 + (a / TAU) * WW
  const wave = (to: number) => {
    let d = ''
    for (let i = 0; i <= 200; i++) {
      const a = (to * i) / 200
      d += `${i ? 'L' : 'M'}${wx(a).toFixed(1)},${(cy - R * Math.sin(a)).toFixed(1)}`
    }
    return d
  }
  const setFromPointer = (e: PointerEvent) => {
    const m = svgRef.current!.getScreenCTM()!.inverse()
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m)
    if (pt.x > W0 - 10) {
      setT(Math.max(0, Math.min(TAU, ((pt.x - W0) / WW) * TAU)))
    } else {
      setT((Math.atan2(cy - pt.y, pt.x - cx) + TAU) % TAU)
    }
  }
  const tanY = cy - R * Math.tan(t)
  const tanOk = Math.abs(Math.cos(t)) > 0.05

  return (
    <div className="layout">
      <aside className="panel">
        <h2>角度</h2>
        <Slider name="theta" tex="\theta" value={t} min={0} max={TAU} onChange={setT} playing={play} onTogglePlay={() => setPlay(!play)} />
        <label className="check">
          <input type="checkbox" checked={showTan} onChange={(e) => setShowTan(e.target.checked)} /> tan も表示
        </label>
        <div className="readout">
          <Tex block tex={`\\theta = ${piFrac(t)} \\;(${((t * 180) / Math.PI).toFixed(1)}^\\circ)`} />
          <Tex block tex={`\\textcolor{#2e86ab}{\\cos\\theta = ${fmt(Math.cos(t), 3)}}`} />
          <Tex block tex={`\\textcolor{#e4572e}{\\sin\\theta = ${fmt(Math.sin(t), 3)}}`} />
          {showTan && <Tex block tex={`\\textcolor{#3bb273}{\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta} = ${tanOk ? fmt(Math.tan(t), 3) : '\\infty'}}`} />}
          <Tex
            block
            tex={`\\cos^2\\theta + \\sin^2\\theta = ${fmt(Math.cos(t) ** 2, 3)} + ${fmt(Math.sin(t) ** 2, 3)} = 1`}
          />
        </div>
        <p className="hint">
          半径 1 の円の上を点が回ると、x 座標が cos、y 座標が sin になる。右の波は y 座標を角度ごとに並べたもの。点や波をドラッグして動かせる。
        </p>
      </aside>
      <section className="stage">
        <svg
          ref={svgRef}
          viewBox="0 0 800 380"
          className="figure"
          onPointerDown={(e) => {
            dragging.current = true
            e.currentTarget.setPointerCapture(e.pointerId)
            setPlay(false)
            setFromPointer(e)
          }}
          onPointerMove={(e) => dragging.current && setFromPointer(e)}
          onPointerUp={() => (dragging.current = false)}
        >
          <line x1={cx - R - 20} x2={W0 + WW + 10} y1={cy} y2={cy} className="axis" />
          <line x1={cx} x2={cx} y1={cy - R - 30} y2={cy + R + 30} className="axis" />
          <line x1={W0} x2={W0} y1={cy - R - 10} y2={cy + R + 10} className="axis" />
          <circle cx={cx} cy={cy} r={R} className="unit" />
          {[1, 2, 3, 4].map((k) => (
            <g key={k}>
              <line x1={wx((k * TAU) / 4)} x2={wx((k * TAU) / 4)} y1={cy - 4} y2={cy + 4} className="axis" />
              <text x={wx((k * TAU) / 4)} y={cy + 20} className="tick" textAnchor="middle">
                {['π/2', 'π', '3π/2', '2π'][k - 1]}
              </text>
            </g>
          ))}
          <text x={W0 - 6} y={cy - R + 4} className="tick" textAnchor="end">1</text>
          <text x={W0 - 6} y={cy + R + 4} className="tick" textAnchor="end">-1</text>

          <path d={wave(TAU)} className="ghost" />
          <path d={wave(t)} className="curve" stroke="#e4572e" />

          <path d={`M${cx + 28},${cy} A28,28 0 ${t > Math.PI ? 1 : 0} 0 ${cx + 28 * Math.cos(t)},${cy - 28 * Math.sin(t)}`} className="arc" />
          <line x1={cx} y1={cy} x2={px} y2={py} className="radius" />
          <line x1={cx} y1={cy} x2={px} y2={cy} stroke="#2e86ab" className="seg" />
          <line x1={px} y1={cy} x2={px} y2={py} stroke="#e4572e" className="seg" />
          {showTan && tanOk && (
            <>
              <line x1={cx + R} x2={cx + R} y1={cy - R * 2.5} y2={cy + R * 2.5} className="ghost-line" />
              <line x1={cx} y1={cy} x2={cx + R} y2={tanY} className="ghost-line" />
              <line x1={cx + R} y1={cy} x2={cx + R} y2={tanY} stroke="#3bb273" className="seg" />
            </>
          )}
          <line x1={px} y1={py} x2={wx(t)} y2={py} className="guide" />
          <circle cx={wx(t)} cy={py} r={6} fill="#e4572e" />
          <circle cx={px} cy={py} r={8} fill="currentColor" className="handle" />
          <text x={(cx + px) / 2} y={cy + (Math.sin(t) >= 0 ? 18 : -8)} className="seg-label" fill="#2e86ab" textAnchor="middle">cos</text>
          <text x={px + (Math.cos(t) >= 0 ? 8 : -8)} y={(cy + py) / 2} className="seg-label" fill="#e4572e" textAnchor={Math.cos(t) >= 0 ? 'start' : 'end'}>sin</text>
        </svg>
      </section>
    </div>
  )
}

/* ---------- 微分 ---------- */

function useFn(src: string) {
  return useMemo(() => {
    const p = parseExpr(src)
    if (!p.ok) return { ...p, f: () => NaN }
    return { ...p, f: (x: number) => evalNum(p.code, { x }) }
  }, [src])
}

function Derivative() {
  const [hp] = useState(() => demoParams('deriv'))
  const [src, setSrc] = useState(() => hp.get('f') ?? 'x^3/3 - x')
  const [x0, setX0] = useState(() => readNum(hp, 'x0', 1.5))
  const [h, setH] = useState(() => readNum(hp, 'h', 1.2))
  const [showD, setShowD] = useState(() => hp.get('df') !== '0')
  const [play, setPlay] = useState(false)
  useSyncHash('geometry', { demo: 'deriv', f: src, x0, h, df: showD ? null : '0' })
  const fn = useFn(src)
  useRaf(play, (dt) => {
    if (h <= 0.002) setPlay(false)
    else setH(Math.max(0.001, h * Math.exp(-dt * 0.9)))
  })

  const d = useMemo(() => {
    if (!fn.ok) return null
    try {
      const node = simplify(derivative(fn.node, 'x'))
      const code = node.compile()
      return { node, f: (x: number) => evalNum(code, { x }) }
    } catch {
      return null
    }
  }, [fn])
  const f = fn.f
  const y0 = f(x0)
  const y1 = f(x0 + h)
  const secant = (y1 - y0) / h
  const tangent = d ? d.f(x0) : (f(x0 + 1e-5) - f(x0 - 1e-5)) / 2e-5

  return (
    <div className="layout">
      <aside className="panel">
        <h2>関数</h2>
        <MathInput label="f(x) =" value={src} onChange={setSrc} parsed={fn} />
        {d && (
          <div className="expr-tex">
            <Tex tex={`f'(x) = ${texOf(d.node)}`} />
          </div>
        )}
        <Slider name="x0" tex="x_0" value={x0} min={-5} max={5} onChange={setX0} />
        <Slider name="h" value={h} min={0.001} max={3} step={0.001} onChange={setH} playing={play} onTogglePlay={() => {
          if (!play && h < 0.01) setH(2)
          setPlay(!play)
        }} />
        <label className="check">
          <input type="checkbox" checked={showD} onChange={(e) => setShowD(e.target.checked)} /> 導関数 f′(x) のグラフも表示
        </label>
        <div className="readout">
          <Tex block tex={`\\textcolor{#f2a541}{\\frac{f(x_0+h) - f(x_0)}{h} = \\frac{${fmt(y1 - y0, 3)}}{${fmt(h, 3)}} = ${fmt(secant, 4)}}`} />
          <Tex block tex={`\\textcolor{#3bb273}{f'(x_0) = \\lim_{h\\to 0}\\frac{f(x_0+h)-f(x_0)}{h} = ${fmt(tangent, 4)}}`} />
        </div>
        <p className="hint">
          ▶ を押すと h が 0 に近づき、オレンジの割線が緑の接線に重なっていく。点はドラッグできる。
        </p>
      </aside>
      <section className="stage">
        <Plot initial={{ xMin: -4, xMax: 4, yMin: -3, yMax: 3 }} height={520}>
          {(ctx) => (
            <>
              {showD && d && <path d={ctx.path(d.f)} stroke="#a259ff" className="curve dashed" />}
              <path d={ctx.path(f)} stroke="#2e86ab" className="curve" />
              <Line ctx={ctx} x0={x0} y0={y0} m={tangent} className="tangent" />
              <Line ctx={ctx} x0={x0} y0={y0} m={secant} className="secant" />
              {Number.isFinite(y0) && Number.isFinite(y1) && (
                <>
                  <line x1={ctx.sx(x0)} y1={ctx.sy(y0)} x2={ctx.sx(x0 + h)} y2={ctx.sy(y0)} className="delta" />
                  <line x1={ctx.sx(x0 + h)} y1={ctx.sy(y0)} x2={ctx.sx(x0 + h)} y2={ctx.sy(y1)} className="delta" />
                  <text x={ctx.sx(x0 + h / 2)} y={ctx.sy(y0) + (y1 >= y0 ? 16 : -8)} className="seg-label" textAnchor="middle">h</text>
                  <text x={ctx.sx(x0 + h) + 6} y={ctx.sy((y0 + y1) / 2)} className="seg-label">Δy</text>
                </>
              )}
              {showD && d && <Dot ctx={ctx} x={x0} y={tangent} color="#a259ff" />}
              <Dot ctx={ctx} x={x0 + h} y={y1} color="#f2a541" r={5} />
              <DragPoint ctx={ctx} x={x0} y={y0} color="#3bb273" onDrag={(p) => setX0(Math.max(-5, Math.min(5, p.x)))} />
            </>
          )}
        </Plot>
        <div className="legend">
          <span style={{ color: '#2e86ab' }}>━ f(x)</span>
          <span style={{ color: '#f2a541' }}>━ 割線</span>
          <span style={{ color: '#3bb273' }}>━ 接線</span>
          {showD && <span style={{ color: '#a259ff' }}>┅ f′(x)（高さ = 接線の傾き）</span>}
        </div>
      </section>
    </div>
  )
}

/* ---------- 積分 ---------- */

type Method = 'left' | 'mid' | 'right' | 'trap'
const METHODS: { id: Method; label: string }[] = [
  { id: 'left', label: '左端' },
  { id: 'mid', label: '中点' },
  { id: 'right', label: '右端' },
  { id: 'trap', label: '台形' },
]

function simpson(f: (x: number) => number, a: number, b: number, n = 2000) {
  const hh = (b - a) / n
  let s = f(a) + f(b)
  for (let i = 1; i < n; i++) s += f(a + i * hh) * (i % 2 ? 4 : 2)
  return (s * hh) / 3
}

function Integral() {
  const [hp] = useState(() => demoParams('integral'))
  const [src, setSrc] = useState(() => hp.get('f') ?? 'sin(x) + 1.5')
  const [a, setA] = useState(() => readNum(hp, 'a', -1))
  const [b, setB] = useState(() => readNum(hp, 'b', 3))
  const [n, setN] = useState(() => Math.max(1, Math.round(readNum(hp, 'n', 6))))
  const [method, setMethod] = useState<Method>(() => {
    const m = hp.get('m')
    return m === 'left' || m === 'mid' || m === 'right' || m === 'trap' ? m : 'mid'
  })
  useSyncHash('geometry', { demo: 'integral', f: src, a, b, n, m: method })
  const [play, setPlay] = useState(false)
  const acc = useRef(0)
  const fn = useFn(src)
  const f = fn.f
  useRaf(play, (dt) => {
    acc.current += dt
    if (acc.current < 0.25) return
    acc.current = 0
    if (n >= 100) setPlay(false)
    else setN(n < 20 ? n + 1 : Math.min(100, n + 5))
  })

  const dx = (b - a) / n
  const pieces = Array.from({ length: n }, (_, i) => {
    const l = a + i * dx
    const r = l + dx
    const ys = method === 'left' ? f(l) : method === 'right' ? f(r) : method === 'mid' ? f(l + dx / 2) : (f(l) + f(r)) / 2
    return { l, r, y: ys, yl: f(l), yr: f(r) }
  })
  const sum = pieces.reduce((s, p) => s + p.y * dx, 0)
  const exact = simpson(f, a, b)

  return (
    <div className="layout">
      <aside className="panel">
        <h2>関数</h2>
        <MathInput label="f(x) =" value={src} onChange={setSrc} parsed={fn} />
        <Slider name="a" value={a} min={-5} max={5} onChange={(v) => setA(Math.min(v, b - 0.1))} />
        <Slider name="b" value={b} min={-5} max={5} onChange={(v) => setB(Math.max(v, a + 0.1))} />
        <Slider name="n" value={n} min={1} max={100} step={1} onChange={setN} playing={play} onTogglePlay={() => {
          if (!play && n >= 100) setN(1)
          setPlay(!play)
        }} />
        <div className="chips">
          {METHODS.map((m) => (
            <button key={m.id} className={`chip ${method === m.id ? 'on' : ''}`} onClick={() => setMethod(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="readout">
          <Tex block tex={`\\Delta x = \\frac{b-a}{n} = ${fmt(dx, 3)}`} />
          <Tex block tex={`\\textcolor{#f2a541}{\\sum_{i=1}^{${n}} f(x_i^*)\\,\\Delta x = ${fmt(sum, 6)}}`} />
          <Tex block tex={`\\textcolor{#2e86ab}{\\int_{${fmt(a, 3)}}^{${fmt(b, 3)}} f(x)\\,dx = ${fmt(exact, 6)}}`} />
          <Tex block tex={`\\text{誤差} = ${fmt(sum - exact, 3)}`} />
        </div>
        <p className="hint">
          面積を細い長方形の合計で近似する。n を増やすほど合計が積分の値に近づく。x 軸より下の部分は負の面積として数える。
        </p>
      </aside>
      <section className="stage">
        <Plot initial={{ xMin: -3, xMax: 5, yMin: -1.5, yMax: 3.5 }} height={520}>
          {(ctx) => (
            <>
              <path
                d={`${ctx.path(f, a, b)}L${ctx.sx(b)},${ctx.sy(0)}L${ctx.sx(a)},${ctx.sy(0)}Z`}
                className="area"
              />
              {pieces.map((p, i) =>
                method === 'trap' ? (
                  <polygon
                    key={i}
                    points={`${ctx.sx(p.l)},${ctx.sy(0)} ${ctx.sx(p.l)},${ctx.sy(p.yl)} ${ctx.sx(p.r)},${ctx.sy(p.yr)} ${ctx.sx(p.r)},${ctx.sy(0)}`}
                    className={`rect ${p.y < 0 ? 'neg' : ''}`}
                  />
                ) : (
                  <rect
                    key={i}
                    x={ctx.sx(p.l)}
                    width={Math.max(0, ctx.sx(p.r) - ctx.sx(p.l))}
                    y={ctx.sy(Math.max(0, p.y))}
                    height={Math.abs(ctx.sy(p.y) - ctx.sy(0))}
                    className={`rect ${p.y < 0 ? 'neg' : ''}`}
                  />
                ),
              )}
              <path d={ctx.path(f)} stroke="#2e86ab" className="curve" />
              <line x1={ctx.sx(a)} x2={ctx.sx(a)} y1={0} y2={ctx.h} className="bound" />
              <line x1={ctx.sx(b)} x2={ctx.sx(b)} y1={0} y2={ctx.h} className="bound" />
            </>
          )}
        </Plot>
      </section>
    </div>
  )
}
