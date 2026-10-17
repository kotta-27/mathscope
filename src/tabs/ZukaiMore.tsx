import { useMemo, useState } from 'react'
import { DragPoint, Plot, type PlotCtx } from '../components/Plot'
import { Slider } from '../components/Slider'
import { Tex } from '../components/Tex'
import { fmt } from '../lib/math'
import { hrefTo, readHash, readNum, useSyncHash } from '../lib/route'

/* 図解タブのデモ（ベクトル・複素数・極限・確率） */

type P = [number, number]
const BLUE = '#2e86ab'
const RED = '#e4572e'
const GREEN = '#3bb273'
const ORANGE = '#f2a541'
const PURPLE = '#a259ff'

/** そのデモを URL で開いたときだけ、URL の値を初期値に使う */
function params(id: string) {
  const { params: p } = readHash()
  return p.get('demo') === id ? p : new URLSearchParams()
}
const readPt = (p: URLSearchParams, k: string, d: P): P => {
  const v = (p.get(k) ?? '').split(',').map(Number)
  return v.length === 2 && v.every(Number.isFinite) ? [v[0], v[1]] : d
}
const ptStr = (p: P) => p.map((v) => fmt(v, 3)).join(',')

/** 平面の矢印（数学の座標で指定） */
function Vec({ ctx, from = [0, 0], to, color, width = 2.5, dashed }: { ctx: PlotCtx; from?: P; to: P; color: string; width?: number; dashed?: boolean }) {
  const x1 = ctx.sx(from[0])
  const y1 = ctx.sy(from[1])
  const x2 = ctx.sx(to[0])
  const y2 = ctx.sy(to[1])
  const L = Math.hypot(x2 - x1, y2 - y1)
  if (L < 2) return null
  const ux = (x2 - x1) / L
  const uy = (y2 - y1) / L
  const hs = Math.min(12, L * 0.4)
  const bx = x2 - ux * hs
  const by = y2 - uy * hs
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeDasharray={dashed ? '6 4' : undefined} />
      <polygon points={`${x2},${y2} ${bx - uy * hs * 0.45},${by + ux * hs * 0.45} ${bx + uy * hs * 0.45},${by - ux * hs * 0.45}`} fill={color} />
    </g>
  )
}

/** デモの下に出す、関連する定理へのリンク */
export function Related({ ids }: { ids: [string, string][] }) {
  return (
    <div className="zukai-related">
      <span className="tag">関連する定理</span>
      {ids.map(([id, name]) => (
        <a key={id} href={hrefTo('theorems', { id })}>
          {name}
        </a>
      ))}
    </div>
  )
}

const snap = (p: { x: number; y: number }): P => [Math.round(p.x * 4) / 4, Math.round(p.y * 4) / 4]

/* ---------- ベクトルの和・差・実数倍 ---------- */

export function VectorDemo() {
  const [hp] = useState(() => params('vector'))
  const [a, setA] = useState<P>(() => readPt(hp, 'a', [3, 1]))
  const [b, setB] = useState<P>(() => readPt(hp, 'b', [1, 2]))
  const [k, setK] = useState(() => readNum(hp, 'k', 1.5))
  const [mode, setMode] = useState<'sum' | 'diff' | 'scale'>(() => {
    const m = hp.get('m')
    return m === 'diff' || m === 'scale' ? m : 'sum'
  })
  useSyncHash('geometry', { demo: 'vector', a: ptStr(a), b: ptStr(b), k, m: mode === 'sum' ? null : mode })
  const sum: P = [a[0] + b[0], a[1] + b[1]]
  const diff: P = [a[0] - b[0], a[1] - b[1]]
  const ka: P = [a[0] * k, a[1] * k]
  return (
    <div className="layout">
      <aside className="panel">
        <h2>見るもの</h2>
        <div className="chips">
          {(
            [
              ['sum', '和 a + b'],
              ['diff', '差 a − b'],
              ['scale', '実数倍 ka'],
            ] as const
          ).map(([id, l]) => (
            <button key={id} className={`chip ${mode === id ? 'on' : ''}`} onClick={() => setMode(id)}>
              {l}
            </button>
          ))}
        </div>
        {mode === 'scale' && <Slider name="k" value={k} min={-2} max={2.5} step={0.05} onChange={setK} />}
        <div className="readout">
          <Tex block tex={`\\vec a=(${fmt(a[0], 3)},\\ ${fmt(a[1], 3)}),\\quad \\vec b=(${fmt(b[0], 3)},\\ ${fmt(b[1], 3)})`} />
          {mode === 'sum' && <Tex block tex={`\\textcolor{${GREEN}}{\\vec a+\\vec b=(${fmt(sum[0], 3)},\\ ${fmt(sum[1], 3)})}`} />}
          {mode === 'diff' && <Tex block tex={`\\textcolor{${RED}}{\\vec a-\\vec b=(${fmt(diff[0], 3)},\\ ${fmt(diff[1], 3)})}`} />}
          {mode === 'scale' && <Tex block tex={`\\textcolor{${PURPLE}}{${fmt(k, 3)}\\,\\vec a=(${fmt(ka[0], 3)},\\ ${fmt(ka[1], 3)})}`} />}
        </div>
        <p className="hint">
          {mode === 'sum'
            ? '和は、a の先に b をつないだ先。a と b で作る平行四辺形の対角線になる。'
            : mode === 'diff'
              ? '差 a − b は、b の先から a の先へ向かう矢印。始点を原点に移すと緑の点線になる。'
              : 'k を負にすると向きが逆になり、0 と 1 の間では短くなる。向きは変わらず、長さが |k| 倍。'}
          矢印の先はドラッグできる。
        </p>
        <Related ids={[['dot-product', '内積と角'], ['section-formula', '内分点・外分点の公式'], ['linear-independence', '一次独立']]} />
      </aside>
      <section className="stage">
        <Plot initial={{ xMin: -5, xMax: 6, yMin: -3, yMax: 5 }} height={520} equal>
          {(ctx) => (
            <>
              {mode === 'sum' && (
                <>
                  <Vec ctx={ctx} from={a} to={sum} color={BLUE} width={1.5} dashed />
                  <Vec ctx={ctx} from={b} to={sum} color={ORANGE} width={1.5} dashed />
                  <Vec ctx={ctx} to={sum} color={GREEN} width={3.5} />
                </>
              )}
              {mode === 'diff' && (
                <>
                  <Vec ctx={ctx} from={b} to={a} color={RED} width={3.5} />
                  <Vec ctx={ctx} to={diff} color={GREEN} width={1.8} dashed />
                </>
              )}
              {mode === 'scale' && <Vec ctx={ctx} to={ka} color={PURPLE} width={5} />}
              <Vec ctx={ctx} to={a} color={BLUE} />
              {mode !== 'scale' && <Vec ctx={ctx} to={b} color={ORANGE} />}
              <DragPoint ctx={ctx} x={a[0]} y={a[1]} color={BLUE} onDrag={(p) => setA(snap(p))} />
              {mode !== 'scale' && <DragPoint ctx={ctx} x={b[0]} y={b[1]} color={ORANGE} onDrag={(p) => setB(snap(p))} />}
            </>
          )}
        </Plot>
        <div className="legend">
          <span style={{ color: BLUE }}>━ a</span>
          {mode !== 'scale' && <span style={{ color: ORANGE }}>━ b</span>}
          <span style={{ color: mode === 'sum' ? GREEN : mode === 'diff' ? RED : PURPLE }}>━ {mode === 'sum' ? 'a + b' : mode === 'diff' ? 'a − b' : 'ka'}</span>
        </div>
      </section>
    </div>
  )
}

/* ---------- 複素数の掛け算 = 回転と拡大 ---------- */

export function ComplexDemo() {
  const [hp] = useState(() => params('complex'))
  const [z, setZ] = useState<P>(() => readPt(hp, 'z', [1.5, 0.5]))
  const [w, setW] = useState<P>(() => readPt(hp, 'w', [0.75, 1]))
  useSyncHash('geometry', { demo: 'complex', z: ptStr(z), w: ptStr(w) })
  const zw: P = [z[0] * w[0] - z[1] * w[1], z[0] * w[1] + z[1] * w[0]]
  const abs = (p: P) => Math.hypot(p[0], p[1])
  const arg = (p: P) => (Math.atan2(p[1], p[0]) * 180) / Math.PI
  const arc = (ctx: PlotCtx, r: number, a0: number, a1: number, color: string) => {
    const s = (a0 * Math.PI) / 180
    const e = (a1 * Math.PI) / 180
    const pts = Array.from({ length: 40 }, (_, i) => {
      const t = s + ((e - s) * i) / 39
      return `${ctx.sx(r * Math.cos(t))},${ctx.sy(r * Math.sin(t))}`
    })
    return <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} />
  }
  return (
    <div className="layout">
      <aside className="panel">
        <h2>掛け算 zw</h2>
        <div className="readout">
          <Tex block tex={`\\textcolor{${BLUE}}{z=${fmt(z[0], 3)}${z[1] >= 0 ? '+' : ''}${fmt(z[1], 3)}i},\\ \\ \\textcolor{${ORANGE}}{w=${fmt(w[0], 3)}${w[1] >= 0 ? '+' : ''}${fmt(w[1], 3)}i}`} />
          <Tex block tex={`|zw|=|z||w|=${fmt(abs(z), 3)}\\times${fmt(abs(w), 3)}=${fmt(abs(zw), 3)}`} />
          <Tex block tex={`\\arg zw=\\arg z+\\arg w=${fmt(arg(z), 3)}^\\circ+${fmt(arg(w), 3)}^\\circ`} />
        </div>
        <p className="hint">w を掛けると、z は |w| 倍に伸びて、arg w だけ回る。w を単位円の上（長さ 1）に置くと、ただの回転になる。w = i なら 90° 回転。点はドラッグできる。</p>
        <Related ids={[['polar-product', '極形式の積'], ['de-moivre', 'ド・モアブルの定理'], ['euler-formula', 'オイラーの公式']]} />
      </aside>
      <section className="stage">
        <Plot initial={{ xMin: -4, xMax: 4, yMin: -3, yMax: 3 }} height={520} equal>
          {(ctx) => (
            <>
              <circle cx={ctx.sx(0)} cy={ctx.sy(0)} r={ctx.sx(1) - ctx.sx(0)} fill="none" stroke="var(--muted)" strokeDasharray="4 4" />
              {arc(ctx, 0.6, 0, arg(z), BLUE)}
              {arc(ctx, 0.9, arg(z), arg(z) + arg(w), ORANGE)}
              <Vec ctx={ctx} to={z} color={BLUE} />
              <Vec ctx={ctx} to={w} color={ORANGE} />
              <Vec ctx={ctx} to={zw} color={GREEN} width={3.5} />
              <DragPoint ctx={ctx} x={z[0]} y={z[1]} color={BLUE} onDrag={(p) => setZ(snap(p))} />
              <DragPoint ctx={ctx} x={w[0]} y={w[1]} color={ORANGE} onDrag={(p) => setW(snap(p))} />
            </>
          )}
        </Plot>
        <div className="legend">
          <span style={{ color: BLUE }}>━ z</span>
          <span style={{ color: ORANGE }}>━ w</span>
          <span style={{ color: GREEN }}>━ zw</span>
          <span style={{ color: 'var(--muted)' }}>┅ 単位円</span>
        </div>
      </section>
    </div>
  )
}

/* ---------- 数列の極限（ε と N） ---------- */

const SEQS = [
  { id: 'alt', tex: 'a_n=1+\\frac{(-1)^n}{n}', f: (n: number) => 1 + (-1) ** n / n, lim: 1 },
  { id: 'inv', tex: 'a_n=\\frac{2n+1}{n}', f: (n: number) => (2 * n + 1) / n, lim: 2 },
  { id: 'sin', tex: 'a_n=\\frac{\\sin n}{\\sqrt n}', f: (n: number) => Math.sin(n) / Math.sqrt(n), lim: 0 },
] as const

export function LimitDemo() {
  const [hp] = useState(() => params('limit'))
  const [si, setSi] = useState(() => Math.max(0, SEQS.findIndex((s) => s.id === hp.get('s'))))
  const [eps, setEps] = useState(() => readNum(hp, 'e', 0.2))
  useSyncHash('geometry', { demo: 'limit', s: SEQS[si].id, e: eps })
  const S = SEQS[si]
  const NMAX = 60
  const vals = useMemo(() => Array.from({ length: NMAX }, (_, i) => S.f(i + 1)), [S])
  // これ以降はずっと帯の中、という最初の N
  let N = NMAX
  for (let n = NMAX; n >= 1; n--) {
    if (Math.abs(vals[n - 1] - S.lim) >= eps) break
    N = n
  }
  return (
    <div className="layout">
      <aside className="panel">
        <h2>数列</h2>
        <div className="chips">
          {SEQS.map((s, i) => (
            <button key={s.id} className={`chip ${i === si ? 'on' : ''}`} onClick={() => setSi(i)}>
              <Tex tex={s.tex} />
            </button>
          ))}
        </div>
        <Slider name="e" tex="\varepsilon" value={eps} min={0.02} max={1} step={0.01} onChange={setEps} />
        <div className="readout">
          <Tex block tex={`n\\ge ${N}\\ \\text{なら}\\ |a_n-${S.lim}|<${fmt(eps, 3)}`} />
        </div>
        <p className="hint">
          「a_n が {S.lim} に収束する」とは、どんなに狭い帯（幅 ε）を決めても、ある番号 N から先がすべて帯に入ること。ε を小さくすると N は大きくなるが、必ず見つかる。
        </p>
        <Related ids={[['squeeze', 'はさみうちの原理'], ['monotone-convergence', '単調収束定理'], ['geometric-sum', '等比数列の和・無限等比級数']]} />
      </aside>
      <section className="stage">
        <Plot initial={{ xMin: -2, xMax: 62, yMin: S.lim - 1.6, yMax: S.lim + 1.6 }} height={520} key={S.id}>
          {(ctx) => (
            <>
              <rect x={0} y={ctx.sy(S.lim + eps)} width={ctx.w} height={ctx.sy(S.lim - eps) - ctx.sy(S.lim + eps)} fill={GREEN} opacity={0.15} />
              <line x1={0} x2={ctx.w} y1={ctx.sy(S.lim)} y2={ctx.sy(S.lim)} stroke={GREEN} strokeDasharray="6 4" />
              <line x1={ctx.sx(N - 0.5)} x2={ctx.sx(N - 0.5)} y1={0} y2={ctx.h} stroke={ORANGE} strokeWidth={2} />
              <text x={ctx.sx(N - 0.5) + 6} y={16} className="seg-label">N = {N}</text>
              {vals.map((v, i) => (
                <circle key={i} cx={ctx.sx(i + 1)} cy={ctx.sy(v)} r={3.5} fill={i + 1 >= N ? GREEN : Math.abs(v - S.lim) < eps ? BLUE : RED} />
              ))}
            </>
          )}
        </Plot>
        <div className="legend">
          <span style={{ color: GREEN }}>■ 帯（極限 ± ε）と、N 番目より先の項</span>
          <span style={{ color: RED }}>● 帯の外の項</span>
        </div>
      </section>
    </div>
  )
}

/* ---------- 確率 = 面積（でたらめに点を打って π を見積もる） ---------- */

function mulberry(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function MonteCarloDemo() {
  const [hp] = useState(() => params('montecarlo'))
  const [n, setN] = useState(() => readNum(hp, 'n', 500))
  const [seed, setSeed] = useState(() => readNum(hp, 'seed', 1))
  useSyncHash('geometry', { demo: 'montecarlo', n, seed })
  const pts = useMemo(() => {
    const r = mulberry(seed * 7919)
    return Array.from({ length: 5000 }, () => [r(), r()] as P)
  }, [seed])
  const shown = pts.slice(0, n)
  const inside = shown.filter(([x, y]) => x * x + y * y <= 1).length
  const est = (4 * inside) / Math.max(1, n)
  return (
    <div className="layout">
      <aside className="panel">
        <h2>点の数</h2>
        <Slider name="n" value={n} min={10} max={5000} step={10} onChange={setN} />
        <div className="chips">
          <button className="chip" onClick={() => setSeed(seed + 1)}>
            打ち直す
          </button>
        </div>
        <div className="readout">
          <Tex block tex={`\\frac{\\text{円の中の点}}{\\text{全部の点}}=\\frac{${inside}}{${n}}\\approx\\frac{\\pi}{4}\\ \\Rightarrow\\ \\pi\\approx\\textcolor{${GREEN}}{${fmt(est, 5)}}`} />
          <Tex block tex={`\\text{本当の値}\\ \\pi=3.14159\\ldots\\quad(\\text{差}\\ ${fmt(Math.abs(est - Math.PI), 4)})`} />
        </div>
        <p className="hint">1 辺 1 の正方形にでたらめに点を打つと、4 分の 1 円に入る割合は面積の比 π/4 に近づく。確率は面積、平均は長い目で見た割合（大数の法則）。</p>
        <Related ids={[['lln', '大数の法則'], ['clt', '中心極限定理'], ['riemann-sum', '区分求積法']]} />
      </aside>
      <section className="stage">
        <Plot initial={{ xMin: -0.1, xMax: 1.1, yMin: -0.1, yMax: 1.1 }} height={520} equal>
          {(ctx) => (
            <>
              <rect x={ctx.sx(0)} y={ctx.sy(1)} width={ctx.sx(1) - ctx.sx(0)} height={ctx.sy(0) - ctx.sy(1)} fill="none" stroke="var(--muted)" />
              <path d={`M${ctx.sx(0)},${ctx.sy(0)} L${ctx.sx(1)},${ctx.sy(0)} A${ctx.sx(1) - ctx.sx(0)},${ctx.sy(0) - ctx.sy(1)} 0 0 0 ${ctx.sx(0)},${ctx.sy(1)} Z`} fill={GREEN} opacity={0.1} stroke={GREEN} />
              {shown.map(([x, y], i) => (
                <circle key={i} cx={ctx.sx(x)} cy={ctx.sy(y)} r={n > 2000 ? 1.2 : 2} fill={x * x + y * y <= 1 ? GREEN : RED} opacity={0.8} />
              ))}
            </>
          )}
        </Plot>
        <div className="legend">
          <span style={{ color: GREEN }}>● 4 分の 1 円の中</span>
          <span style={{ color: RED }}>● 外</span>
        </div>
      </section>
    </div>
  )
}
