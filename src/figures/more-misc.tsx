import { useMemo } from 'react'
import { Slider } from '../components/Slider'
import { Tex } from '../components/Tex'
import { Arrow, Axes, Fig, Handle, TexAt } from './common'
import { C, SERIES, clamp, frame, par, r2, sgn } from './util'
import { useFig } from './state'

type P = [number, number]

/* ---------- 連立一次方程式の解の存在（2 直線） ---------- */

export function RankSolutionFig() {
  const t1 = (30 * Math.PI) / 180
  const d1 = 0.5
  const [deg2, setDeg2] = useFig('deg2', 110)
  const [d2, setD2] = useFig('d2', 1)
  const t2 = (deg2 * Math.PI) / 180
  const F = frame([-3.2, 3.2], [-2, 2], { x: 0, y: 0, w: 560, h: 350 })
  // 直線: x cosθ + y sinθ = d
  const line = (t: number, d: number) => {
    const n: P = [Math.cos(t), Math.sin(t)]
    const p: P = [n[0] * d, n[1] * d]
    const v: P = [-n[1], n[0]]
    return [F.X(p[0] - v[0] * 8), F.Y(p[1] - v[1] * 8), F.X(p[0] + v[0] * 8), F.Y(p[1] + v[1] * 8)]
  }
  const det = Math.cos(t1) * Math.sin(t2) - Math.sin(t1) * Math.cos(t2)
  const rA = Math.abs(det) < 1e-6 ? 1 : 2
  const rAb = rA === 2 ? 2 : Math.abs(d2 - d1) < 1e-3 ? 1 : 2
  const sol: P | null = rA === 2 ? [(d1 * Math.sin(t2) - d2 * Math.sin(t1)) / det, (Math.cos(t1) * d2 - Math.cos(t2) * d1) / det] : null
  const [a1, b1, a2, b2] = line(t1, d1)
  const [c1, e1, c2, e2] = line(t2, d2)
  const verdict = rA === 2 ? '解がちょうど 1 つ' : rAb === 2 ? '解なし（平行）' : '解が無数（重なる）'
  return (
    <Fig
      w={560}
      h={350}
      controls={
        <>
          <Slider stack name="t" tex="\text{2 本目の向き}\ (^\circ)" value={deg2} min={0} max={179} step={1} onChange={setDeg2} />
          <Slider stack name="d" tex="\text{2 本目の位置}" value={d2} min={-1.5} max={1.5} step={0.05} onChange={setD2} />
          <div className="chips">
            <button className="chip" onClick={() => setDeg2(30)}>平行にする</button>
            <button className="chip" onClick={() => { setDeg2(30); setD2(0.5) }}>重ねる</button>
          </div>
        </>
      }
      caption={<Tex block tex={`\\operatorname{rank}A=${rA},\\quad\\operatorname{rank}(A\\,|\\,\\vec b)=${rAb}\\quad\\Rightarrow\\quad\\text{${verdict}}`} />}
    >
      <Axes f={F} grid />
      <line x1={a1} y1={b1} x2={a2} y2={b2} stroke={C.blue} strokeWidth={rA === 1 && rAb === 1 ? 6 : 2.5} opacity={rA === 1 && rAb === 1 ? 0.5 : 1} />
      <line x1={c1} y1={e1} x2={c2} y2={e2} stroke={C.red} strokeWidth={2.5} />
      {sol && <circle cx={F.X(sol[0])} cy={F.Y(sol[1])} r={7} fill={C.green} />}
    </Fig>
  )
}

/* ---------- 次元定理: 潰れる方向（核）と残る方向（像） ---------- */

export function RankNullityFig() {
  const [s, setS] = useFig('s', 1.6)
  // A = [[1, 2], [0.5, s]]、det = s − 1
  const A = [
    [1, 2],
    [0.5, s],
  ]
  const det = s - 1
  const rank = Math.abs(det) < 1e-6 ? 1 : 2
  const L = frame([-3, 3], [-3, 3], { x: 10, y: 20, w: 255, h: 255 })
  const R = frame([-6, 6], [-6, 6], { x: 295, y: 20, w: 255, h: 255 })
  const pts: P[] = []
  for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) pts.push([i * 0.6, j * 0.6])
  const map = ([x, y]: P): P => [A[0][0] * x + A[0][1] * y, A[1][0] * x + A[1][1] * y]
  // 核の向き: A v = 0 → v ∝ (2, −1)
  const onKer = (p: P) => rank === 1 && Math.abs(p[0] * 1 + p[1] * 2) < 1e-6
  return (
    <Fig
      w={560}
      h={300}
      controls={
        <>
          <Slider stack name="s" value={s} min={0} max={3} step={0.01} onChange={setS} />
          <div className="chips">
            <button className="chip" onClick={() => setS(1)}>s = 1（潰れる）</button>
          </div>
        </>
      }
      caption={
        <Tex
          block
          tex={`A=\\begin{pmatrix}1&2\\\\0.5&${r2(s)}\\end{pmatrix}:\\quad\\textcolor{${C.red}}{\\dim\\operatorname{Ker}A=${2 - rank}}+\\textcolor{${C.blue}}{\\operatorname{rank}A=${rank}}=2`}
        />
      }
    >
      <Axes f={L} />
      <Axes f={R} />
      {rank === 1 && <line x1={L.X(-6)} y1={L.Y(3)} x2={L.X(6)} y2={L.Y(-3)} stroke={C.red} strokeWidth={3} />}
      {rank === 1 && <line x1={R.X(-6)} y1={R.Y(-3)} x2={R.X(6)} y2={R.Y(3)} stroke={C.blue} strokeWidth={3} opacity={0.5} />}
      {pts.map((p, i) => {
        const q = map(p)
        const col = onKer(p) ? C.red : SERIES[(Math.round(p[0] / 0.6) + 8) % 4]
        return (
          <g key={i}>
            <circle cx={L.X(p[0])} cy={L.Y(p[1])} r={2.5} fill={col} />
            {Math.abs(q[0]) <= 6 && Math.abs(q[1]) <= 6 && <circle cx={R.X(q[0])} cy={R.Y(q[1])} r={2.5} fill={col} opacity={0.8} />}
          </g>
        )
      })}
      <TexAt x={L.X(0)} y={12} tex="\text{入力}\ \mathbb R^2" size={12} color="var(--muted)" />
      <TexAt x={R.X(0)} y={12} tex="\text{出力}\ A\vec x" size={12} color="var(--muted)" />
    </Fig>
  )
}

/* ---------- ケーリー・ハミルトンの定理 ---------- */

export function CayleyHamiltonFig() {
  const [a, setA] = useFig('a', 1.2)
  const [b, setB] = useFig('b', 0.6)
  const [c, setC] = useFig('c', -0.4)
  const [d, setD] = useFig('d', 0.8)
  const tr = a + d
  const det = a * d - b * c
  const v: P = [1, 0.6]
  const Av: P = [a * v[0] + b * v[1], c * v[0] + d * v[1]]
  const A2v: P = [a * Av[0] + b * Av[1], c * Av[0] + d * Av[1]]
  const F = frame([-3, 3], [-2, 2], { x: 0, y: 0, w: 560, h: 300 })
  const O: P = [F.X(0), F.Y(0)]
  const S = (p: P): P => [F.X(p[0]), F.Y(p[1])]
  const t1: P = [tr * Av[0], tr * Av[1]]
  const t2: P = [-det * v[0], -det * v[1]]
  const sum: P = [t1[0] + t2[0], t1[1] + t2[1]]
  const m = (x: number[][]) => `\\begin{pmatrix}${x.map((r) => r.map((y) => r2(y)).join('&')).join('\\\\')}\\end{pmatrix}`
  const A2 = [
    [a * a + b * c, a * b + b * d],
    [c * a + d * c, c * b + d * d],
  ]
  return (
    <Fig
      w={560}
      h={300}
      controls={
        <>
          <Slider stack name="a" value={a} min={-1.5} max={1.5} step={0.01} onChange={setA} />
          <Slider stack name="b" value={b} min={-1.5} max={1.5} step={0.01} onChange={setB} />
          <Slider stack name="c" value={c} min={-1.5} max={1.5} step={0.01} onChange={setC} />
          <Slider stack name="d" value={d} min={-1.5} max={1.5} step={0.01} onChange={setD} />
        </>
      }
      caption={
        <>
          <Tex block tex={`\\textcolor{${C.red}}{A^2}${sgn(-tr, 'A')}${sgn(det, 'E')}=${m(A2)}${sgn(-tr)}${m([[a, b], [c, d]])}${sgn(det, 'E')}=${m([[0, 0], [0, 0]])}`} />
          <span className="hint">どのベクトル v でも、A²v は (a+d)Av と −(ad−bc)v を足したもの（点線の平行四辺形）にぴったり重なる。</span>
        </>
      }
    >
      <Axes f={F} grid step={0.5} />
      <line x1={S(t1)[0]} y1={S(t1)[1]} x2={S(sum)[0]} y2={S(sum)[1]} className="fig-dash" />
      <line x1={S(t2)[0]} y1={S(t2)[1]} x2={S(sum)[0]} y2={S(sum)[1]} className="fig-dash" />
      <Arrow x1={O[0]} y1={O[1]} x2={S(t1)[0]} y2={S(t1)[1]} color={C.green} width={1.6} dashed />
      <Arrow x1={O[0]} y1={O[1]} x2={S(t2)[0]} y2={S(t2)[1]} color={C.orange} width={1.6} dashed />
      <Arrow x1={O[0]} y1={O[1]} x2={S(v)[0]} y2={S(v)[1]} color="currentColor" />
      <Arrow x1={O[0]} y1={O[1]} x2={S(Av)[0]} y2={S(Av)[1]} color={C.blue} />
      <Arrow x1={O[0]} y1={O[1]} x2={S(A2v)[0]} y2={S(A2v)[1]} color={C.red} width={4} />
      <TexAt x={S(v)[0] + 8} y={S(v)[1] + 12} tex="v" anchor="start" size={13} />
      <TexAt x={S(Av)[0] + 8} y={S(Av)[1]} tex="Av" color={C.blue} anchor="start" size={13} />
      <TexAt x={S(A2v)[0] + 8} y={S(A2v)[1] - 10} tex="A^2v" color={C.red} anchor="start" size={13} />
    </Fig>
  )
}

/* ---------- 期待値の線形性 ---------- */

export function LinearityExpectationFig() {
  const [a, setA] = useFig('a', 1)
  const [b, setB] = useFig('b', 3)
  // X: さいころの目、Y: 目が偶数なら 1（X と独立ではない）
  const vals = [1, 2, 3, 4, 5, 6].map((x) => a * x + b * (x % 2 === 0 ? 1 : 0))
  const lo = Math.min(0, ...vals) - 1
  const hi = Math.max(...vals) + 1
  const F = frame([lo, hi], [0, 0.4], { x: 20, y: 20, w: 520, h: 220 })
  const E = vals.reduce((s, v) => s + v, 0) / 6
  const counts = new Map<number, number>()
  vals.forEach((v) => counts.set(r2(v, 6), (counts.get(r2(v, 6)) ?? 0) + 1))
  const w = Math.max(6, Math.min(30, (F.X(lo + 1) - F.X(lo)) * 0.6))
  return (
    <Fig
      w={560}
      h={270}
      controls={
        <>
          <Slider stack name="a" value={a} min={-2} max={3} step={0.1} onChange={setA} />
          <Slider stack name="b" value={b} min={-4} max={6} step={0.1} onChange={setB} />
        </>
      }
      caption={
        <>
          <Tex block tex={`E[aX+bY]=${r2(E, 3)}=\\textcolor{${C.blue}}{${r2(a)}}\\times3.5\\textcolor{${C.red}}{${sgn(b)}}\\times0.5`} />
          <span className="hint">X はさいころの目、Y は「目が偶数なら 1」。X と Y は独立ではないが、期待値はそれぞれの期待値を足すだけで求まる。</span>
        </>
      }
    >
      <line x1={F.box.x} x2={F.box.x + F.box.w} y1={F.Y(0)} y2={F.Y(0)} className="fig-axis" />
      {[...counts].map(([v, n]) => (
        <g key={v}>
          <rect x={F.X(v) - w / 2} y={F.Y(n / 6)} width={w} height={F.Y(0) - F.Y(n / 6)} fill={C.blue} opacity={0.6} rx={2} />
          <TexAt x={F.X(v)} y={F.Y(0) + 14} tex={`${r2(v)}`} size={11} />
        </g>
      ))}
      <line x1={F.X(E)} x2={F.X(E)} y1={F.Y(0.4)} y2={F.Y(0)} stroke={C.red} strokeWidth={2.5} />
      <TexAt x={F.X(E) + 6} y={F.Y(0.37)} tex={`E=${r2(E, 2)}`} color={C.red} anchor="start" size={13} />
    </Fig>
  )
}

/* ---------- 分散の公式 ---------- */

export function VarianceFig() {
  const [a, setA] = useFig('a', 1)
  const [b, setB] = useFig('b', 0)
  const xs = [1, 2, 3, 4, 5, 6]
  const ys = xs.map((x) => a * x + b)
  const E = ys.reduce((s, v) => s + v, 0) / 6
  const E2 = ys.reduce((s, v) => s + v * v, 0) / 6
  const V = E2 - E * E
  const F = frame([-14, 20], [0, 1], { x: 20, y: 20, w: 520, h: 200 })
  const sd = Math.sqrt(V)
  return (
    <Fig
      w={560}
      h={250}
      controls={
        <>
          <Slider stack name="a" value={a} min={-2.5} max={2.5} step={0.1} onChange={setA} />
          <Slider stack name="b" value={b} min={-8} max={8} step={0.5} onChange={setB} />
        </>
      }
      caption={
        <Tex
          block
          tex={`V[aX+b]=E[Y^2]-(E[Y])^2=${r2(E2, 3)}-${r2(E, 3)}^2=${r2(V, 3)}=\\textcolor{${C.purple}}{${par(a)}^2}\\times\\tfrac{35}{12}\\quad(b\\ \\text{は効かない})`}
        />
      }
    >
      <line x1={F.box.x} x2={F.box.x + F.box.w} y1={F.Y(0)} y2={F.Y(0)} className="fig-axis" />
      {xs.map((x) => (
        <circle key={`x${x}`} cx={F.X(x)} cy={F.Y(0.15)} r={6} fill="var(--muted)" opacity={0.5} />
      ))}
      <TexAt x={F.X(-13)} y={F.Y(0.15)} tex="X" anchor="start" size={13} color="var(--muted)" />
      {ys.map((y, i) => (
        <circle key={`y${i}`} cx={F.X(clamp(y, -14, 20))} cy={F.Y(0.55)} r={7} fill={C.blue} />
      ))}
      <TexAt x={F.X(-13)} y={F.Y(0.55)} tex="aX+b" anchor="start" size={13} color={C.blue} />
      <line x1={F.X(E - sd)} x2={F.X(E + sd)} y1={F.Y(0.75)} y2={F.Y(0.75)} stroke={C.purple} strokeWidth={4} />
      <line x1={F.X(E)} x2={F.X(E)} y1={F.Y(0.45)} y2={F.Y(0.85)} stroke={C.red} strokeWidth={2} />
      <TexAt x={F.X(E)} y={F.Y(0.92)} tex={`E\\pm\\sigma`} size={12} color={C.purple} />
    </Fig>
  )
}

/* ---------- 大数の法則 ---------- */

function mulberry(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function LlnFig() {
  const [n, setN] = useFig('n', 500)
  const [p, setP] = useFig('p', 0.3)
  const [seed, setSeed] = useFig('seed', 1)
  const N = 2000
  const flips = useMemo(
    () =>
      Array.from({ length: 5 }, (_, k) => {
        const r = mulberry(seed * 97 + k * 13)
        return Array.from({ length: N }, () => r())
      }),
    [seed],
  )
  const F = frame([0, n], [0, 1], { x: 40, y: 10, w: 510, h: 260 })
  const paths = flips.map((u) => {
    let s = 0
    let d = ''
    const step = Math.max(1, Math.floor(n / 400))
    for (let i = 0; i < n; i++) {
      s += u[i] < p ? 1 : 0
      if (i % step === 0 || i === n - 1) d += `${d ? 'L' : 'M'}${F.X(i + 1).toFixed(1)},${F.Y(s / (i + 1)).toFixed(1)}`
    }
    return { d, last: s / n }
  })
  return (
    <Fig
      w={560}
      h={290}
      controls={
        <>
          <Slider stack name="n" tex="n\ (\text{回数})" value={n} min={10} max={N} step={10} onChange={setN} />
          <Slider stack name="p" tex="\mu\ (\text{当たる確率})" value={p} min={0.05} max={0.95} step={0.01} onChange={setP} />
          <div className="chips">
            <button className="chip" onClick={() => setSeed((s) => s + 1)}>もう一度試す</button>
          </div>
        </>
      }
      caption={<Tex block tex={`\\bar X_{${n}}=${paths.map((q) => r2(q.last, 3)).join(',\\ ')}\\ \\to\\ \\mu=${r2(p)}`} />}
    >
      <line x1={F.X(0)} x2={F.X(n)} y1={F.Y(p)} y2={F.Y(p)} stroke="currentColor" strokeWidth={1.5} strokeDasharray="6 4" />
      <line x1={F.X(0)} x2={F.X(0)} y1={F.Y(0)} y2={F.Y(1)} className="fig-axis" />
      <line x1={F.X(0)} x2={F.X(n)} y1={F.Y(0)} y2={F.Y(0)} className="fig-axis" />
      {paths.map((q, i) => (
        <path key={i} d={q.d} stroke={SERIES[i]} strokeWidth={1.8} fill="none" opacity={0.85} />
      ))}
      <TexAt x={F.X(0) - 6} y={F.Y(1)} tex="1" anchor="end" size={12} color="var(--muted)" />
      <TexAt x={F.X(0) - 6} y={F.Y(p)} tex="\mu" anchor="end" size={13} />
    </Fig>
  )
}

/* ---------- チェビシェフの不等式 ---------- */

const erf = (x: number) => {
  // Abramowitz–Stegun 7.1.26
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const DISTS = {
  normal: {
    name: '正規分布',
    pdf: (x: number) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI),
    tail: (k: number) => 1 - erf(k / Math.SQRT2),
  },
  uniform: {
    name: '一様分布',
    pdf: (x: number) => (Math.abs(x) <= Math.sqrt(3) ? 1 / (2 * Math.sqrt(3)) : 0),
    tail: (k: number) => Math.max(0, 1 - k / Math.sqrt(3)),
  },
  exp: {
    name: '指数分布',
    // 平均 0・標準偏差 1 にずらした指数分布
    pdf: (x: number) => (x >= -1 ? Math.exp(-(x + 1)) : 0),
    tail: (k: number) => Math.exp(-(1 + k)) + (k < 1 ? 1 - Math.exp(-(1 - k)) : 0),
  },
}

export function ChebyshevFig() {
  const [k, setK] = useFig('k', 1.5)
  const [d, setD] = useFig<keyof typeof DISTS>('d', 'normal')
  const D = DISTS[d]
  const F = frame([-4.5, 4.5], [0, 1.05], { x: 0, y: 10, w: 560, h: 240 })
  const tail = D.tail(k)
  const bound = 1 / (k * k)
  const shade = (a: number, b: number) => `M${F.X(a)},${F.Y(0)} ${F.path(D.pdf, a, b, 150).replace(/^M/, 'L')} L${F.X(b)},${F.Y(0)} Z`
  return (
    <Fig
      w={560}
      h={280}
      controls={
        <>
          <div className="chips">
            {(Object.keys(DISTS) as (keyof typeof DISTS)[]).map((id) => (
              <button key={id} className={`chip ${id === d ? 'on' : ''}`} onClick={() => setD(id)}>
                {DISTS[id].name}
              </button>
            ))}
          </div>
          <Slider stack name="k" value={k} min={1} max={4} step={0.01} onChange={setK} />
        </>
      }
      caption={
        <Tex
          block
          tex={`P(|X-\\mu|\\ge${r2(k)}\\sigma)=\\textcolor{${C.red}}{${r2(tail, 4)}}\\ \\le\\ \\frac1{k^2}=\\textcolor{${C.purple}}{${r2(bound, 4)}}\\quad(\\text{分布の形によらない})`}
        />
      }
    >
      <line x1={0} x2={560} y1={F.Y(0)} y2={F.Y(0)} className="fig-axis" />
      <path d={shade(-4.5, -k)} fill={C.red} opacity={0.4} />
      <path d={shade(k, 4.5)} fill={C.red} opacity={0.4} />
      <path d={F.path(D.pdf, -4.5, 4.5, 400)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      {[-k, k].map((x) => (
        <line key={x} x1={F.X(x)} x2={F.X(x)} y1={F.Y(0)} y2={F.Y(0.6)} className="fig-dash" />
      ))}
      <TexAt x={F.X(k)} y={F.Y(0) + 14} tex={`\\mu+${r2(k)}\\sigma`} size={11} />
      <TexAt x={F.X(-k)} y={F.Y(0) + 14} tex={`\\mu-${r2(k)}\\sigma`} size={11} />
      <rect x={380} y={30} width={150} height={10} rx={5} fill="none" stroke={C.purple} />
      <rect x={380} y={30} width={150 * bound} height={10} rx={5} fill={C.purple} opacity={0.5} />
      <rect x={380} y={48} width={150 * tail} height={10} rx={5} fill={C.red} />
      <TexAt x={374} y={35} tex="1/k^2" anchor="end" size={11} color={C.purple} />
      <TexAt x={374} y={53} tex="\text{実際}" anchor="end" size={11} color={C.red} />
    </Fig>
  )
}

/* ---------- ベズーの等式 ---------- */

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))
function extgcd(a: number, b: number): [number, number] {
  if (!b) return [1, 0]
  const [x, y] = extgcd(b, a % b)
  return [y, x - Math.floor(a / b) * y]
}

export function BezoutFig() {
  const [a, setA] = useFig('a', 12)
  const [b, setB] = useFig('b', 18)
  const g = gcd(a, b)
  const [x, y] = extgcd(a, b)
  const R = 60
  const F = frame([-R, R], [0, 1], { x: 20, y: 0, w: 520, h: 200 })
  const vals = new Set<number>()
  for (let i = -8; i <= 8; i++) for (let j = -8; j <= 8; j++) {
    const v = a * i + b * j
    if (Math.abs(v) <= R) vals.add(v)
  }
  const ticks = Array.from({ length: 2 * R + 1 }, (_, i) => i - R)
  return (
    <Fig
      w={560}
      h={200}
      controls={
        <>
          <Slider stack name="a" value={a} min={1} max={30} step={1} onChange={setA} />
          <Slider stack name="b" value={b} min={1} max={30} step={1} onChange={setB} />
        </>
      }
      caption={
        <>
          <Tex block tex={`${a}\\cdot(${x})+${b}\\cdot(${y})=\\textcolor{${C.red}}{${g}}=\\gcd(${a},${b})`} />
          <span className="hint">整数 x, y を変えて ax + by が取る値（青）は、ちょうど gcd(a, b) の倍数に並ぶ。いちばん小さい正の値が gcd。</span>
        </>
      }
    >
      <line x1={F.X(-R)} x2={F.X(R)} y1={110} y2={110} className="fig-axis" />
      {ticks.map((t) => (
        <line key={t} x1={F.X(t)} x2={F.X(t)} y1={106} y2={114} stroke="var(--muted)" strokeWidth={t % 10 ? 0.6 : 1.4} />
      ))}
      {[...vals].map((v) => (
        <circle key={v} cx={F.X(v)} cy={110} r={v === g ? 7 : 4.5} fill={v === g ? C.red : C.blue} opacity={v === g ? 1 : 0.8} />
      ))}
      {[-60, -40, -20, 0, 20, 40, 60].map((t) => (
        <TexAt key={t} x={F.X(t)} y={134} tex={`${t}`} size={11} color="var(--muted)" />
      ))}
      <TexAt x={F.X(g)} y={84} tex={`${g}`} color={C.red} size={14} />
    </Fig>
  )
}

/* ---------- フェルマーの小定理 ---------- */

const PRIMES = [5, 7, 11, 13, 17, 19, 23]

export function FermatLittleFig() {
  const [p, setP] = useFig('p', 13)
  const [a, setA] = useFig('a', 2)
  const aa = ((a % p) + p) % p || 1
  const pows: number[] = []
  let v = 1
  for (let i = 0; i < p; i++) {
    pows.push(v)
    v = (v * aa) % p
  }
  const ord = pows.indexOf(1, 1)
  const cx = 280
  const cy = 170
  const R = 130
  const pos = (k: number): P => [cx + R * Math.sin((2 * Math.PI * k) / p), cy - R * Math.cos((2 * Math.PI * k) / p)]
  const path = pows.slice(0, ord + 1).map((k) => pos(k).join(',')).join(' ')
  return (
    <Fig
      w={560}
      h={340}
      controls={
        <>
          <div className="chips">
            {PRIMES.map((q) => (
              <button key={q} className={`chip ${q === p ? 'on' : ''}`} onClick={() => setP(q)}>
                p = {q}
              </button>
            ))}
          </div>
          <Slider stack name="a" value={a} min={2} max={22} step={1} onChange={setA} />
        </>
      }
      caption={
        <Tex
          block
          tex={
            aa % p === 0
              ? `a\\ \\text{が}\\ p\\ \\text{の倍数のときは成り立たない}`
              : `${a}^1,${a}^2,\\ldots\\equiv ${pows.slice(1, ord + 1).join(',')}\\pmod{${p}}\\ \\text{→}\\ ${a}^{${ord}}\\equiv1,\\ \\ ${ord}\\mid${p - 1}\\ \\text{なので}\\ ${a}^{${p - 1}}\\equiv1`
          }
        />
      }
    >
      <circle cx={cx} cy={cy} r={R} className="fig-thin" />
      {aa % p !== 0 && <polyline points={path} fill="none" stroke={C.purple} strokeWidth={2} opacity={0.8} />}
      {Array.from({ length: p }, (_, k) => {
        const [x, y] = pos(k)
        const hit = pows.slice(0, ord + 1).includes(k)
        return (
          <g key={k}>
            <circle cx={x} cy={y} r={k === 1 ? 9 : 6} fill={k === 1 ? C.red : hit ? C.purple : 'var(--muted)'} opacity={hit || k === 1 ? 1 : 0.4} />
            <TexAt x={cx + (R + 22) * Math.sin((2 * Math.PI * k) / p)} y={cy - (R + 22) * Math.cos((2 * Math.PI * k) / p)} tex={`${k}`} size={12} />
          </g>
        )
      })}
    </Fig>
  )
}

/* ---------- 素数は無数にある ---------- */

const FIRST_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19]
function factor(n: number): number[] {
  const out: number[] = []
  for (let d = 2; d * d <= n; d++)
    while (n % d === 0) {
      out.push(d)
      n /= d
    }
  if (n > 1) out.push(n)
  return out
}

export function InfinitePrimesFig() {
  const [n, setN] = useFig('n', 6)
  const ps = FIRST_PRIMES.slice(0, n)
  const N = ps.reduce((s, p) => s * p, 1) + 1
  const fs = factor(N)
  const rowH = 30
  return (
    <Fig
      w={560}
      h={60 + rowH * n}
      controls={<Slider stack name="n" tex="n\ (\text{知っている素数の数})" value={n} min={1} max={8} step={1} onChange={setN} />}
      caption={
        <Tex
          block
          tex={`N=${ps.join('\\cdot')}+1=${N.toLocaleString('en')}=${fs.map((f) => `\\textcolor{${C.red}}{${f.toLocaleString('en')}}`).join('\\times')}\\ \\ (\\text{リストにない素数})`}
        />
      }
    >
      {ps.map((p, i) => (
        <g key={p}>
          <TexAt x={40} y={30 + i * rowH} tex={`N\\div${p}`} anchor="start" size={14} />
          <rect x={140} y={22 + i * rowH} width={360} height={16} rx={4} fill={SERIES[i % SERIES.length]} opacity={0.25} />
          <rect x={496} y={22 + i * rowH} width={4} height={16} fill={C.red} />
          <TexAt x={510} y={30 + i * rowH} tex="\text{余り }1" anchor="start" size={12} color={C.red} />
        </g>
      ))}
      <TexAt x={280} y={44 + rowH * n} tex={`\\text{どの}\\ p_i\\ \\text{でも割り切れない}`} size={13} color="var(--muted)" />
    </Fig>
  )
}

/* ---------- コーシー・シュワルツの不等式 ---------- */

export function CauchySchwarzFig() {
  const F = frame([-3.2, 3.2], [-1.6, 2.4], { x: 0, y: 0, w: 560, h: 350 })
  const [a, setA] = useFig<P>('a', [2, 0.5])
  const [b, setB] = useFig<P>('b', [0.8, 1.8])
  const dot = a[0] * b[0] + a[1] * b[1]
  const na = Math.hypot(...a)
  const nb = Math.hypot(...b)
  const k = dot / (na * na || 1)
  const proj: P = [a[0] * k, a[1] * k]
  const S = (p: P): P => [F.X(p[0]), F.Y(p[1])]
  const O = S([0, 0])
  const mv = (set: (p: P) => void) => (x: number, y: number) => set([r2(clamp(F.ix(x), -3, 3)), r2(clamp(F.iy(y), -1.5, 2.3))])
  return (
    <Fig
      w={560}
      h={350}
      caption={
        <>
          <Tex
            block
            tex={`\\textcolor{${C.green}}{(a_1b_1+a_2b_2)^2=${r2(dot * dot)}}\\ \\le\\ \\textcolor{${C.purple}}{(a_1^2+a_2^2)(b_1^2+b_2^2)=${r2(na * na * nb * nb)}}`}
          />
          <span className="hint">a·b は「b を a に落とした影の長さ × |a|」。影は b そのものより長くならないので、等号は a と b が同じ直線上のときだけ。</span>
        </>
      }
    >
      <Axes f={F} grid step={0.5} />
      <line x1={S([-a[0] * 3, -a[1] * 3])[0]} y1={S([-a[0] * 3, -a[1] * 3])[1]} x2={S([a[0] * 3, a[1] * 3])[0]} y2={S([a[0] * 3, a[1] * 3])[1]} className="fig-dash" opacity={0.5} />
      <line x1={S(b)[0]} y1={S(b)[1]} x2={S(proj)[0]} y2={S(proj)[1]} className="fig-dash" />
      <line x1={O[0]} y1={O[1]} x2={S(proj)[0]} y2={S(proj)[1]} stroke={C.green} strokeWidth={6} opacity={0.6} />
      <Arrow x1={O[0]} y1={O[1]} x2={S(a)[0]} y2={S(a)[1]} color={C.blue} />
      <Arrow x1={O[0]} y1={O[1]} x2={S(b)[0]} y2={S(b)[1]} color={C.red} />
      <TexAt x={S(a)[0] + 10} y={S(a)[1] + 12} tex="\vec a" color={C.blue} anchor="start" />
      <TexAt x={S(b)[0] + 10} y={S(b)[1] - 10} tex="\vec b" color={C.red} anchor="start" />
      <rect x={20} y={300} width={Math.min(240, (Math.abs(dot) / Math.max(na * nb, 1e-9)) * 240)} height={10} rx={5} fill={C.green} />
      <rect x={20} y={318} width={240} height={10} rx={5} fill={C.purple} opacity={0.6} />
      <TexAt x={268} y={305} tex="|\vec a\cdot\vec b|" anchor="start" size={12} color={C.green} />
      <TexAt x={268} y={323} tex="|\vec a||\vec b|" anchor="start" size={12} color={C.purple} />
      <Handle x={S(a)[0]} y={S(a)[1]} color={C.blue} onMove={mv(setA)} />
      <Handle x={S(b)[0]} y={S(b)[1]} color={C.red} onMove={mv(setB)} />
    </Fig>
  )
}

/* ---------- ベルヌーイの不等式 ---------- */

export function BernoulliFig() {
  const [n, setN] = useFig('n', 3)
  const [x, setX] = useFig('x', 0.4)
  const F = frame([-1.3, 1.3], [-2, 5], { x: 0, y: 0, w: 560, h: 300 })
  const f = (t: number) => (t < -1 ? NaN : (1 + t) ** n)
  const g = (t: number) => 1 + n * t
  const gap = `M${F.X(-1)},${F.Y(f(-1))} ${F.path(f, -1, 1.3, 200).replace(/^M/, 'L')} ${F.path(g, 1.3, -1, 2).replace(/^M/, 'L')} Z`
  return (
    <Fig
      w={560}
      h={300}
      controls={
        <>
          <Slider stack name="n" value={n} min={1} max={6} step={0.1} onChange={setN} />
          <Slider stack name="x" value={x} min={-1} max={1.2} step={0.01} onChange={setX} />
        </>
      }
      caption={
        <>
          <Tex
            block
            tex={`\\textcolor{${C.blue}}{(1${sgn(x)})^{${r2(n)}}=${r2(f(x), 3)}}\\ \\ge\\ \\textcolor{${C.red}}{1+${r2(n)}\\cdot${par(x)}=${r2(g(x), 3)}}`}
          />
          <span className="hint">直線 1 + nx は曲線 (1 + x)ⁿ の x = 0 での接線。下に凸な曲線は、接線より下に来ない（x ≥ −1、n ≥ 1）。</span>
        </>
      }
    >
      <Axes f={F} grid />
      <path d={gap} fill={C.purple} opacity={0.12} />
      <path d={F.path(f, -1, 1.3)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      <path d={F.path(g)} stroke={C.red} strokeWidth={2} fill="none" />
      <line x1={F.X(x)} x2={F.X(x)} y1={F.Y(g(x))} y2={F.Y(f(x))} stroke={C.purple} strokeWidth={4} />
      <circle cx={F.X(x)} cy={F.Y(f(x))} r={5} fill={C.blue} />
      <circle cx={F.X(x)} cy={F.Y(g(x))} r={5} fill={C.red} />
      <line x1={F.X(-1)} x2={F.X(-1)} y1={0} y2={300} className="fig-dash" />
      <TexAt x={F.X(-1) + 6} y={14} tex="x=-1" anchor="start" size={12} color="var(--muted)" />
    </Fig>
  )
}
