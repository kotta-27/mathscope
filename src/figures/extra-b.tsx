import { useMemo } from 'react'
import { Slider } from '../components/Slider'
import { Tex } from '../components/Tex'
import { Arrow, Axes, Fig, TexAt } from './common'
import { useFig } from './state'
import { C, SERIES, clamp, frame, r2, sgn } from './util'

type P = [number, number]
/** 係数つきの項（1 や −1 は数字を省く）。先頭の項に使う */
const lead = (v: number, k: string) => (Math.abs(v - 1) < 1e-9 ? k : Math.abs(v + 1) < 1e-9 ? `-${k}` : `${r2(v)}${k}`)

/* ---------- 接線の方程式 ---------- */

const CURVES: { name: string; tex: string; f: (x: number) => number; df: (x: number) => number }[] = [
  { name: '3 次', tex: '\\frac{x^3}{3}-x', f: (x) => x ** 3 / 3 - x, df: (x) => x * x - 1 },
  { name: '放物線', tex: 'x^2', f: (x) => x * x, df: (x) => 2 * x },
  { name: 'e^x', tex: 'e^x', f: Math.exp, df: Math.exp },
  { name: 'sin', tex: '\\sin x', f: Math.sin, df: Math.cos },
]

export function TangentLineFig() {
  const [k, setK] = useFig('f', 0)
  const [a, setA] = useFig('a', 1.5)
  const c = CURVES[k]
  const F = frame([-4, 4], [-3, 4], { x: 0, y: 0, w: 560, h: 300 })
  const m = c.df(a)
  const b = c.f(a) - m * a
  return (
    <Fig
      w={560}
      h={300}
      controls={
        <>
          <div className="chips">
            {CURVES.map((x, i) => (
              <button key={x.name} className={`chip ${i === k ? 'on' : ''}`} onClick={() => setK(i)}>
                <Tex tex={x.tex} />
              </button>
            ))}
          </div>
          <Slider stack name="a" value={a} min={-3} max={3} step={0.01} onChange={setA} />
        </>
      }
      caption={
        <Tex
          block
          tex={`y-f(a)=f'(a)(x-a):\\quad y${sgn(-c.f(a))}=${r2(m)}(x${sgn(-a)})\\ \\Longleftrightarrow\\ \\textcolor{${C.red}}{y=${Math.abs(m) < 1e-9 ? '' : lead(m, 'x')}${b ? (Math.abs(m) < 1e-9 ? r2(b) : sgn(b)) : Math.abs(m) < 1e-9 ? '0' : ''}}`}
        />
      }
    >
      <Axes f={F} grid />
      <path d={F.path(c.f)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      <path d={F.path((x) => m * (x - a) + c.f(a))} stroke={C.red} strokeWidth={2} fill="none" />
      <circle cx={F.X(a)} cy={F.Y(c.f(a))} r={6} fill={C.red} />
      <TexAt x={F.X(a) + 10} y={F.Y(c.f(a)) + 16} tex={`(a,\\ f(a))`} anchor="start" size={12} />
    </Fig>
  )
}

/* ---------- ニュートン法 ---------- */

const NEWTON: { name: string; tex: string; f: (x: number) => number; df: (x: number) => number; root: string }[] = [
  { name: '√2', tex: 'x^2-2', f: (x) => x * x - 2, df: (x) => 2 * x, root: '\\sqrt2=1.41421356\\ldots' },
  { name: 'cos x = x', tex: '\\cos x-x', f: (x) => Math.cos(x) - x, df: (x) => -Math.sin(x) - 1, root: '0.73908513\\ldots' },
  { name: '3 次', tex: 'x^3-2x-5', f: (x) => x ** 3 - 2 * x - 5, df: (x) => 3 * x * x - 2, root: '2.09455148\\ldots' },
]

export function NewtonFig() {
  const [k, setK] = useFig('f', 0)
  const [x0, setX0] = useFig('x0', 3)
  const [n, setN] = useFig('n', 2)
  const c = NEWTON[k]
  const F = frame([-1, 4], [-3, 8], { x: 20, y: 10, w: 520, h: 290 })
  const xs = [x0]
  for (let i = 0; i < 6; i++) {
    const x = xs[i]
    const d = c.df(x)
    xs.push(Math.abs(d) < 1e-12 ? x : x - c.f(x) / d)
  }
  return (
    <Fig
      w={560}
      h={310}
      controls={
        <>
          <div className="chips">
            {NEWTON.map((x, i) => (
              <button key={x.name} className={`chip ${i === k ? 'on' : ''}`} onClick={() => setK(i)}>
                <Tex tex={x.tex} />
              </button>
            ))}
          </div>
          <Slider stack name="x0" tex="x_0" value={x0} min={0.3} max={3.8} step={0.01} onChange={setX0} />
          <Slider stack name="n" tex="\text{くり返す回数}" value={n} min={0} max={5} step={1} onChange={setN} />
        </>
      }
      caption={
        <Tex
          block
          tex={`x_{k+1}=x_k-\\frac{f(x_k)}{f'(x_k)}:\\ \\ ${xs
            .slice(0, n + 1)
            .map((x, i) => `x_${i}=${r2(x, 6)}`)
            .join(',\\ ')}\\ \\to\\ ${c.root}`}
        />
      }
    >
      <Axes f={F} grid />
      <path d={F.path(c.f)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      {xs.slice(0, n).map((x, i) => {
        const nx = xs[i + 1]
        return (
          <g key={i}>
            <line x1={F.X(x)} x2={F.X(x)} y1={F.Y(0)} y2={F.Y(c.f(x))} className="fig-dash" />
            <line x1={F.X(x)} y1={F.Y(c.f(x))} x2={F.X(nx)} y2={F.Y(0)} stroke={SERIES[(i + 1) % SERIES.length]} strokeWidth={2} />
            <circle cx={F.X(x)} cy={F.Y(c.f(x))} r={4} fill={SERIES[(i + 1) % SERIES.length]} />
          </g>
        )
      })}
      {xs.slice(0, n + 1).map((x, i) => (
        <g key={`x${i}`}>
          <circle cx={F.X(x)} cy={F.Y(0)} r={4.5} fill={i === n ? C.red : 'var(--muted)'} />
          {i < 3 && <TexAt x={F.X(x)} y={F.Y(0) + 16} tex={`x_${i}`} size={12} />}
        </g>
      ))}
    </Fig>
  )
}

/* ---------- 2 曲線で囲まれた面積（1/6 公式） ---------- */

export function AreaBetweenFig() {
  const [m, setM] = useFig('m', 1)
  const [k, setK] = useFig('k', 2)
  const F = frame([-4, 4], [-2, 9], { x: 0, y: 0, w: 560, h: 300 })
  const D = m * m + 4 * k
  const ok = D > 0
  const al = (m - Math.sqrt(Math.max(D, 0))) / 2
  const be = (m + Math.sqrt(Math.max(D, 0))) / 2
  const g = (x: number) => m * x + k
  const f = (x: number) => x * x
  const region = ok ? `M${F.X(al)},${F.Y(g(al))} ${F.path(g, al, be, 50).replace(/^M/, 'L')} ${F.path(f, be, al, 200).replace(/^M/, 'L')} Z` : ''
  return (
    <Fig
      w={560}
      h={300}
      controls={
        <>
          <Slider stack name="m" value={m} min={-3} max={3} step={0.1} onChange={setM} />
          <Slider stack name="k" value={k} min={-1} max={5} step={0.1} onChange={setK} />
        </>
      }
      caption={
        ok ? (
          <Tex
            block
            tex={`\\int_{\\alpha}^{\\beta}\\{(${lead(m, 'x')}${sgn(k)})-x^2\\}\\,dx=\\frac{(\\beta-\\alpha)^3}{6}=\\frac{${r2(be - al, 3)}^3}{6}=\\textcolor{${C.green}}{${r2((be - al) ** 3 / 6, 3)}}\\qquad(\\alpha=${r2(al)},\\ \\beta=${r2(be)})`}
          />
        ) : (
          <span className="hint">直線が放物線と 2 点で交わらないので、囲まれた部分がない。</span>
        )
      }
    >
      <Axes f={F} grid />
      {ok && <path d={region} fill={C.green} opacity={0.3} />}
      <path d={F.path(f)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      <path d={F.path(g)} stroke={C.red} strokeWidth={2.2} fill="none" />
      {ok &&
        [al, be].map((x, i) => (
          <g key={i}>
            <circle cx={F.X(x)} cy={F.Y(f(x))} r={5} fill={C.green} />
            <TexAt x={F.X(x)} y={F.Y(0) + 14} tex={i ? '\\beta' : '\\alpha'} color={C.green} size={13} />
            <line x1={F.X(x)} x2={F.X(x)} y1={F.Y(0)} y2={F.Y(f(x))} className="fig-dash" />
          </g>
        ))}
    </Fig>
  )
}

/* ---------- 回転行列 ---------- */

/** 向きが分かる「F」の形 */
const SHAPE: P[] = [
  [0, 0],
  [0, 2],
  [1.2, 2],
  [1.2, 1.6],
  [0.4, 1.6],
  [0.4, 1.2],
  [1, 1.2],
  [1, 0.8],
  [0.4, 0.8],
  [0.4, 0],
]

export function RotationMatrixFig() {
  const [deg, setDeg] = useFig('t', 60)
  const t = (deg * Math.PI) / 180
  const c = Math.cos(t)
  const s = Math.sin(t)
  const rot = ([x, y]: P): P => [c * x - s * y, s * x + c * y]
  const F = frame([-3.2, 3.2], [-2.6, 2.6], { x: 0, y: 0, w: 560, h: 340 })
  const pts = (ps: P[]) => ps.map(([x, y]) => `${F.X(x)},${F.Y(y)}`).join(' ')
  const O: P = [F.X(0), F.Y(0)]
  const e1 = rot([1.5, 0])
  const e2 = rot([0, 1.5])
  return (
    <Fig
      w={560}
      h={340}
      controls={<Slider stack name="t" tex="\theta\ (^\circ)" value={deg} min={-180} max={180} step={1} onChange={setDeg} />}
      caption={
        <Tex
          block
          tex={`R(\\theta)=\\begin{pmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{pmatrix}=\\begin{pmatrix}${r2(c)}&${r2(-s)}\\\\${r2(s)}&${r2(c)}\\end{pmatrix}\\qquad\\det R=1\\ (\\text{面積は変わらない})`}
        />
      }
    >
      <Axes f={F} grid step={0.5} />
      <polygon points={pts(SHAPE)} fill="var(--muted)" fillOpacity={0.15} stroke="var(--muted)" strokeDasharray="4 3" />
      <polygon points={pts(SHAPE.map(rot))} fill={C.blue} fillOpacity={0.3} stroke={C.blue} strokeWidth={2} />
      <Arrow x1={O[0]} y1={O[1]} x2={F.X(e1[0])} y2={F.Y(e1[1])} color={C.red} />
      <Arrow x1={O[0]} y1={O[1]} x2={F.X(e2[0])} y2={F.Y(e2[1])} color={C.green} />
      <TexAt x={F.X(e1[0] * 1.15)} y={F.Y(e1[1] * 1.15)} tex="R\vec e_1" color={C.red} size={13} />
      <TexAt x={F.X(e2[0] * 1.15)} y={F.Y(e2[1] * 1.15)} tex="R\vec e_2" color={C.green} size={13} />
    </Fig>
  )
}

/* ---------- 正規分布（68-95-99.7） ---------- */

const erf = (x: number) => {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}

export function NormalDistFig() {
  const [mu, setMu] = useFig('m', 50)
  const [sd, setSd] = useFig('s', 10)
  const [k, setK] = useFig('k', 1)
  const pdf = (x: number) => Math.exp(-((x - mu) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI))
  const F = frame([0, 100], [0, 0.085], { x: 10, y: 10, w: 540, h: 250 })
  const lo = mu - k * sd
  const hi = mu + k * sd
  const shade = `M${F.X(lo)},${F.Y(0)} ${F.path(pdf, lo, hi, 150).replace(/^M/, 'L')} L${F.X(hi)},${F.Y(0)} Z`
  const pr = erf(k / Math.SQRT2)
  return (
    <Fig
      w={560}
      h={290}
      controls={
        <>
          <Slider stack name="m" tex="\mu" value={mu} min={20} max={80} step={1} onChange={setMu} />
          <Slider stack name="s" tex="\sigma" value={sd} min={5} max={20} step={0.5} onChange={setSd} />
          <div className="chips">
            {[1, 2, 3].map((v) => (
              <button key={v} className={`chip ${k === v ? 'on' : ''}`} onClick={() => setK(v)}>
                ±{v}σ
              </button>
            ))}
          </div>
        </>
      }
      caption={<Tex block tex={`P(\\mu-${k === 1 ? '' : k}\\sigma\\le X\\le\\mu+${k === 1 ? '' : k}\\sigma)=P(${r2(lo, 1)}\\le X\\le${r2(hi, 1)})=\\textcolor{${C.blue}}{${r2(pr * 100, 2)}\\%}`} />}
    >
      <line x1={10} x2={550} y1={F.Y(0)} y2={F.Y(0)} className="fig-axis" />
      <path d={shade} fill={C.blue} opacity={0.3} />
      <path d={F.path(pdf, 0, 100, 400)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      <line x1={F.X(mu)} x2={F.X(mu)} y1={F.Y(0)} y2={F.Y(pdf(mu))} className="fig-dash" />
      {[0, 20, 40, 60, 80, 100].map((v) => (
        <TexAt key={v} x={F.X(v)} y={F.Y(0) + 14} tex={`${v}`} size={11} color="var(--muted)" />
      ))}
      <TexAt x={F.X(mu)} y={F.Y(pdf(mu)) - 12} tex="\mu" size={13} />
    </Fig>
  )
}

/* ---------- 誕生日のパラドックス ---------- */

export function BirthdayFig() {
  const [n, setN] = useFig('n', 23)
  const P = useMemo(() => {
    const out = [0]
    let q = 1
    for (let i = 1; i <= 80; i++) {
      q *= (365 - (i - 1)) / 365
      out.push(1 - q)
    }
    return out
  }, [])
  const F = frame([0, 80], [0, 1], { x: 40, y: 10, w: 500, h: 250 })
  let d = ''
  for (let i = 1; i <= 80; i++) d += `${i > 1 ? 'L' : 'M'}${F.X(i)},${F.Y(P[i])}`
  return (
    <Fig
      w={560}
      h={290}
      controls={<Slider stack name="n" tex="n\ (\text{人数})" value={n} min={2} max={80} step={1} onChange={setN} />}
      caption={
        <Tex
          block
          tex={`P(\\text{同じ誕生日の 2 人がいる})=1-\\frac{365}{365}\\cdot\\frac{364}{365}\\cdots\\frac{${366 - n}}{365}=\\textcolor{${C.red}}{${r2(P[n] * 100, 1)}\\%}\\quad(n=${n})`}
        />
      }
    >
      <line x1={F.X(0)} x2={F.X(80)} y1={F.Y(0.5)} y2={F.Y(0.5)} className="fig-dash" />
      <line x1={F.X(0)} x2={F.X(80)} y1={F.Y(0)} y2={F.Y(0)} className="fig-axis" />
      <line x1={F.X(0)} x2={F.X(0)} y1={F.Y(0)} y2={F.Y(1)} className="fig-axis" />
      <path d={d} stroke={C.blue} strokeWidth={2.5} fill="none" />
      <line x1={F.X(n)} x2={F.X(n)} y1={F.Y(0)} y2={F.Y(P[n])} stroke={C.red} strokeWidth={2} />
      <circle cx={F.X(n)} cy={F.Y(P[n])} r={6} fill={C.red} />
      <TexAt x={F.X(0) - 6} y={F.Y(0.5)} tex="50\%" anchor="end" size={11} color="var(--muted)" />
      <TexAt x={F.X(0) - 6} y={F.Y(1)} tex="100\%" anchor="end" size={11} color="var(--muted)" />
      {[10, 20, 30, 40, 50, 60, 70, 80].map((v) => (
        <TexAt key={v} x={F.X(v)} y={F.Y(0) + 14} tex={`${v}`} size={11} color="var(--muted)" />
      ))}
    </Fig>
  )
}

/* ---------- 信頼区間 ---------- */

function mulberry(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const LEVELS: [string, number][] = [
  ['90%', 1.645],
  ['95%', 1.96],
  ['99%', 2.576],
]

export function ConfidenceIntervalFig() {
  const [n, setN] = useFig('n', 25)
  const [li, setLi] = useFig('level', 1)
  const [seed, setSeed] = useFig('seed', 1)
  const mu = 50
  const sd = 10
  const K = 30
  const [label, z] = LEVELS[li]
  const means = useMemo(() => {
    const r = mulberry(seed * 7919)
    return Array.from({ length: K }, () => {
      let s = 0
      for (let i = 0; i < n; i++) {
        // ボックス＝ミュラー法で正規分布の値を作る
        const u = r() || 1e-9
        const v = r()
        s += mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
      }
      return s / n
    })
  }, [n, seed])
  const half = (z * sd) / Math.sqrt(n)
  const F = frame([mu - 14, mu + 14], [0, K + 1], { x: 20, y: 10, w: 520, h: 290 })
  const hit = means.filter((m) => Math.abs(m - mu) <= half).length
  return (
    <Fig
      w={560}
      h={310}
      controls={
        <>
          <Slider stack name="n" tex="n\ (\text{標本の大きさ})" value={n} min={4} max={200} step={1} onChange={setN} />
          <div className="chips">
            {LEVELS.map(([l], i) => (
              <button key={l} className={`chip ${i === li ? 'on' : ''}`} onClick={() => setLi(i)}>
                {l}
              </button>
            ))}
            <button className="chip" onClick={() => setSeed(seed + 1)}>
              もう一度取る
            </button>
          </div>
        </>
      }
      caption={
        <>
          <Tex block tex={`\\bar X\\pm${z}\\cdot\\frac{\\sigma}{\\sqrt n}=\\bar X\\pm${r2(half, 2)}:\\quad ${K}\\ \\text{本のうち}\\ \\textcolor{${C.blue}}{${hit}}\\ \\text{本が}\\ \\mu=${mu}\\ \\text{を含む（${label.replace('%', '\\%')}）}`} />
          <span className="hint">同じ母集団から {K} 回標本を取り、それぞれで区間を作った。μ を含まない区間は赤。n を大きくすると区間が短くなる。</span>
        </>
      }
    >
      <line x1={F.X(mu)} x2={F.X(mu)} y1={F.Y(0)} y2={F.Y(K + 1)} stroke="currentColor" strokeDasharray="6 4" />
      {means.map((m, i) => {
        const ok = Math.abs(m - mu) <= half
        return (
          <g key={i}>
            <line x1={F.X(clamp(m - half, mu - 14, mu + 14))} x2={F.X(clamp(m + half, mu - 14, mu + 14))} y1={F.Y(i + 1)} y2={F.Y(i + 1)} stroke={ok ? C.blue : C.red} strokeWidth={3} />
            <circle cx={F.X(clamp(m, mu - 14, mu + 14))} cy={F.Y(i + 1)} r={2.5} fill={ok ? C.blue : C.red} />
          </g>
        )
      })}
      <TexAt x={F.X(mu)} y={F.Y(0) + 4} tex="\mu" size={13} />
    </Fig>
  )
}

/* ---------- オイラーの定理（オイラーの φ 関数） ---------- */

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))
const powmod = (a: number, e: number, m: number) => {
  let r = 1
  let x = a % m
  for (let k = e; k > 0; k >>= 1) {
    if (k & 1) r = (r * x) % m
    x = (x * x) % m
  }
  return r
}

export function EulerTotientFig() {
  const [n, setN] = useFig('n', 12)
  const [a, setA] = useFig('a', 5)
  const co = Array.from({ length: n }, (_, i) => i + 1).filter((k) => gcd(k, n) === 1)
  const phi = co.length
  const cols = 10
  const S = 46
  const ok = gcd(a, n) === 1
  return (
    <Fig
      w={560}
      h={Math.ceil(n / cols) * S + 30}
      controls={
        <>
          <Slider stack name="n" value={n} min={2} max={40} step={1} onChange={setN} />
          <Slider stack name="a" value={a} min={2} max={39} step={1} onChange={setA} />
        </>
      }
      caption={
        <Tex
          block
          tex={`\\varphi(${n})=\\textcolor{${C.green}}{${phi}}\\qquad ${
            ok ? `${a}^{\\varphi(${n})}=${a}^{${phi}}\\equiv\\textcolor{${C.red}}{${powmod(a, phi, n)}}\\pmod{${n}}` : `\\gcd(${a},${n})=${gcd(a, n)}\\neq1\\ \\text{なので成り立たない}`
          }`}
        />
      }
    >
      {Array.from({ length: n }, (_, i) => {
        const k = i + 1
        const c = gcd(k, n) === 1
        const x = 20 + (i % cols) * 52
        const y = 15 + Math.floor(i / cols) * S
        return (
          <g key={k}>
            <rect x={x} y={y} width={44} height={36} rx={8} fill={c ? C.green : 'var(--surface-2)'} opacity={c ? 0.75 : 1} stroke={k === a % n ? C.red : 'none'} strokeWidth={3} />
            <TexAt x={x + 22} y={y + 18} tex={`${k}`} size={14} color={c ? '#fff' : 'var(--muted)'} />
          </g>
        )
      })}
    </Fig>
  )
}

/* ---------- ピタゴラス数 ---------- */

export function PythagoreanTriplesFig() {
  const [m, setM] = useFig('m', 2)
  const [k, setK] = useFig('n', 1)
  const n = Math.min(k, m - 1)
  const a = m * m - n * n
  const b = 2 * m * n
  const c = m * m + n * n
  const s = Math.min(380 / a, 270 / b)
  const O: P = [90, 300]
  const A: P = [O[0] + a * s, O[1]]
  const B: P = [O[0], O[1] - b * s]
  const prim = gcd(m, n) === 1 && (m - n) % 2 === 1
  return (
    <Fig
      w={560}
      h={330}
      controls={
        <>
          <Slider stack name="m" value={m} min={2} max={9} step={1} onChange={setM} />
          <Slider stack name="n" value={n} min={1} max={8} step={1} onChange={setK} />
        </>
      }
      caption={
        <Tex
          block
          tex={`(m^2-n^2,\\ 2mn,\\ m^2+n^2)=(\\textcolor{${C.blue}}{${a}},\\ \\textcolor{${C.orange}}{${b}},\\ \\textcolor{${C.green}}{${c}}):\\ \\ ${a}^2+${b}^2=${a * a + b * b}=${c}^2\\ \\ ${prim ? '\\text{（既約）}' : '\\text{（既約でない）}'}`}
        />
      }
    >
      <polygon points={[O, A, B].map((p) => p.join(',')).join(' ')} fill={C.green} fillOpacity={0.1} stroke="none" />
      <line x1={O[0]} y1={O[1]} x2={A[0]} y2={A[1]} stroke={C.blue} strokeWidth={4} />
      <line x1={O[0]} y1={O[1]} x2={B[0]} y2={B[1]} stroke={C.orange} strokeWidth={4} />
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={C.green} strokeWidth={4} />
      <rect x={O[0]} y={O[1] - 14} width={14} height={14} fill="none" stroke="currentColor" />
      <TexAt x={(O[0] + A[0]) / 2} y={O[1] + 16} tex={`${a}`} color={C.blue} />
      <TexAt x={O[0] - 10} y={(O[1] + B[1]) / 2} tex={`${b}`} color={C.orange} anchor="end" />
      <TexAt x={(A[0] + B[0]) / 2 + 12} y={(A[1] + B[1]) / 2 - 10} tex={`${c}`} color={C.green} anchor="start" />
    </Fig>
  )
}

/* ---------- 並べ替え不等式 ---------- */

const RA = [1, 2, 3, 4]
const RB = [1, 3, 4, 6]
const PERMS: [string, number[]][] = [
  ['同じ順', [0, 1, 2, 3]],
  ['逆順', [3, 2, 1, 0]],
  ['ばらばら 1', [1, 3, 0, 2]],
  ['ばらばら 2', [2, 0, 3, 1]],
]

export function RearrangementFig() {
  const [pi, setPi] = useFig('order', 2)
  const perm = PERMS[pi][1]
  const sum = (p: number[]) => RA.reduce((s, a, i) => s + a * RB[p[i]], 0)
  const S = sum(perm)
  const mx = sum(PERMS[0][1])
  const mn = sum(PERMS[1][1])
  const u = 9
  return (
    <Fig
      w={560}
      h={260}
      controls={
        <div className="chips">
          {PERMS.map(([l], i) => (
            <button key={l} className={`chip ${i === pi ? 'on' : ''}`} onClick={() => setPi(i)}>
              {l}
            </button>
          ))}
        </div>
      }
      caption={
        <>
          <Tex
            block
            tex={`\\underbrace{${mn}}_{\\text{逆順}}\\ \\le\\ ${RA.map((a, i) => `${a}\\cdot\\textcolor{${C.orange}}{${RB[perm[i]]}}`).join('+')}=\\textcolor{${C.blue}}{${S}}\\ \\le\\ \\underbrace{${mx}}_{\\text{同じ順}}`}
          />
          <span className="hint">横 a・縦 b の長方形の面積の合計。大きいもの同士を組むと最大、大きいものと小さいものを組むと最小。</span>
        </>
      }
    >
      {(() => {
        // 長方形の左端（幅 a×26 と間 u を順に足した位置）
        const lefts = RA.map((_, i) => 30 + RA.slice(0, i).reduce((t, v) => t + v * 26 + u, 0))
        return RA.map((a, i) => {
          const b = RB[perm[i]]
          const w = a * 26
          const x = lefts[i]
          return (
            <g key={i}>
              <rect x={x} y={220 - b * 30} width={w} height={b * 30} fill={SERIES[i]} opacity={0.6} stroke="var(--bg)" />
              <TexAt x={x + w / 2} y={232} tex={`${a}`} size={12} />
              <TexAt x={x + w / 2} y={210 - b * 30} tex={`${b}`} size={12} color={C.orange} />
            </g>
          )
        })
      })()}
      <line x1={20} x2={330} y1={220} y2={220} className="fig-axis" />
      <TexAt x={540} y={60} tex={`\\text{面積の合計}=${S}`} anchor="end" color={C.blue} />
      <rect x={380} y={90} width={150} height={10} rx={5} fill="none" stroke="var(--muted)" />
      <rect x={380 + ((S - mn) / (mx - mn)) * 150 - 3} y={86} width={6} height={18} rx={3} fill={C.blue} />
      <TexAt x={380} y={118} tex={`${mn}`} size={11} color="var(--muted)" />
      <TexAt x={530} y={118} tex={`${mx}`} size={11} color="var(--muted)" />
    </Fig>
  )
}

/* ---------- 1 の n 乗根 ---------- */

export function RootsOfUnityFig() {
  const [n, setN] = useFig('n', 6)
  const [k, setK] = useFig('k', 1)
  const F = frame([-2.2, 2.2], [-1.6, 1.6], { x: 0, y: 0, w: 560, h: 400 })
  const w = (j: number): P => [Math.cos((2 * Math.PI * j) / n), Math.sin((2 * Math.PI * j) / n)]
  const roots = Array.from({ length: n }, (_, j) => w(j))
  // 根を順に足していく矢印（最後は原点に戻る）
  const chain: P[] = [[0, 0]]
  roots.forEach((r) => chain.push([chain[chain.length - 1][0] + r[0] * 0.35, chain[chain.length - 1][1] + r[1] * 0.35]))
  const kk = Math.min(k, n - 1)
  return (
    <Fig
      w={560}
      h={400}
      controls={
        <>
          <Slider stack name="n" value={n} min={2} max={12} step={1} onChange={setN} />
          <Slider stack name="k" tex="\omega^k\ \text{の}\ k" value={kk} min={1} max={11} step={1} onChange={setK} />
        </>
      }
      caption={
        <Tex
          block
          tex={`z^{${n}}=1:\\ z=\\omega^j\\ (\\omega=e^{2\\pi i/${n}},\\ j=0,\\ldots,${n - 1}),\\quad 1+\\omega+\\cdots+\\omega^{${n - 1}}=0,\\quad \\textcolor{${C.red}}{(\\omega^{${kk}})^{${n}}=1}`}
        />
      }
    >
      <Axes f={F} grid step={0.5} />
      <circle cx={F.X(0)} cy={F.Y(0)} r={F.X(1) - F.X(0)} fill="none" stroke="var(--muted)" strokeDasharray="4 4" />
      <polygon points={roots.map(([x, y]) => `${F.X(x)},${F.Y(y)}`).join(' ')} fill={C.purple} fillOpacity={0.08} stroke={C.purple} strokeWidth={1.5} />
      {chain.slice(0, -1).map((p, i) => (
        <Arrow key={i} x1={F.X(p[0])} y1={F.Y(p[1])} x2={F.X(chain[i + 1][0])} y2={F.Y(chain[i + 1][1])} color={C.orange} width={1.6} />
      ))}
      {roots.map(([x, y], j) => (
        <g key={j}>
          <circle cx={F.X(x)} cy={F.Y(y)} r={j === kk ? 8 : 6} fill={j === kk ? C.red : C.purple} />
          <TexAt x={F.X(x * 1.18)} y={F.Y(y * 1.18)} tex={j === 0 ? '1' : `\\omega^{${j}}`} size={12} />
        </g>
      ))}
    </Fig>
  )
}

/* ---------- 実数係数の 2 次方程式の共役な解 ---------- */

export function ConjugateRootsFig() {
  const [b, setB] = useFig('b', 2)
  const [c, setC] = useFig('c', 5)
  const D = b * b - 4 * c
  const re = -b / 2
  const im = Math.sqrt(Math.abs(D)) / 2
  const roots: P[] = D >= 0 ? [[re - im, 0], [re + im, 0]] : [[re, im], [re, -im]]
  const F = frame([-5, 5], [-3.2, 3.2], { x: 0, y: 0, w: 560, h: 340 })
  return (
    <Fig
      w={560}
      h={340}
      controls={
        <>
          <Slider stack name="b" value={b} min={-5} max={5} step={0.1} onChange={setB} />
          <Slider stack name="c" value={c} min={-4} max={8} step={0.1} onChange={setC} />
        </>
      }
      caption={
        <Tex
          block
          tex={`x^2${b ? sgn(b, 'x') : ''}${c ? sgn(c) : ''}=0:\\ \\ ${
            D >= 0 ? `x=${r2(roots[0][0])},\\ ${r2(roots[1][0])}\\ \\text{（実数）}` : `x=\\textcolor{${C.purple}}{${r2(re)}\\pm${r2(im)}i}\\ \\text{（共役な複素数）}`
          },\\quad \\alpha+\\beta=${r2(-b)},\\ \\alpha\\beta=${r2(c)}`}
        />
      }
    >
      <Axes f={F} grid />
      <line x1={F.X(-5)} x2={F.X(5)} y1={F.Y(0)} y2={F.Y(0)} stroke="var(--muted)" strokeWidth={1.5} />
      {D < 0 && <line x1={F.X(re)} x2={F.X(re)} y1={F.Y(im)} y2={F.Y(-im)} stroke={C.purple} strokeDasharray="5 4" />}
      {roots.map(([x, y], i) => (
        <g key={i}>
          <circle cx={F.X(x)} cy={F.Y(y)} r={7} fill={D >= 0 ? C.orange : C.purple} />
          <TexAt x={F.X(x) + 12} y={F.Y(y) - 10} tex={i ? '\\beta' : '\\alpha'} anchor="start" />
        </g>
      ))}
      <TexAt x={F.X(4.9)} y={F.Y(0) + 14} tex="\text{実軸}" anchor="end" size={11} color="var(--muted)" />
      <TexAt x={F.X(0) + 6} y={F.Y(3)} tex="\text{虚軸}" anchor="start" size={11} color="var(--muted)" />
    </Fig>
  )
}
