import { Slider } from '../components/Slider'
import { Tex } from '../components/Tex'
import { AngleArc, Axes, Fig, Handle, TexAt } from './common'
import { useFig } from './state'
import { C, SERIES, clamp, frame, par, r2, sgn } from './util'

type P = [number, number]
const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1])
const poly = (...ps: P[]) => ps.map((p) => p.join(',')).join(' ')
const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
/** 係数つきの項（1 や −1 は数字を省く）。先頭の項に使う */
const lead = (v: number, k: string) => (Math.abs(v - 1) < 1e-9 ? k : Math.abs(v + 1) < 1e-9 ? `-${k}` : `${r2(v)}${k}`)

/* ---------- 平方完成 ---------- */

export function CompletingSquareFig() {
  const [a, setA] = useFig('a', 1)
  const [b, setB] = useFig('b', -4)
  const [c, setC] = useFig('c', 1)
  const F = frame([-6, 6], [-6, 6], { x: 0, y: 0, w: 560, h: 320 })
  const ok = Math.abs(a) > 1e-9
  const p = ok ? -b / (2 * a) : 0
  const q = ok ? c - (b * b) / (4 * a) : 0
  return (
    <Fig
      w={560}
      h={320}
      controls={
        <>
          <Slider stack name="a" value={a} min={-2} max={2} step={0.1} onChange={setA} />
          <Slider stack name="b" value={b} min={-6} max={6} step={0.1} onChange={setB} />
          <Slider stack name="c" value={c} min={-5} max={5} step={0.1} onChange={setC} />
        </>
      }
      caption={
        ok ? (
          <Tex
            block
            tex={`${lead(a, 'x^2')}${b ? sgn(b, 'x') : ''}${c ? sgn(c) : ''}=${lead(a, '')}\\left(x${p ? sgn(-p) : ''}\\right)^2${q ? sgn(q) : ''}\\qquad\\textcolor{${C.red}}{\\text{頂点}\\ (${r2(p)},\\ ${r2(q)})}`}
          />
        ) : (
          <span className="hint">a = 0 のときは 2 次式ではない（直線になる）。</span>
        )
      }
    >
      <Axes f={F} grid />
      <path d={F.path((x) => a * x * x + b * x + c)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      {ok && (
        <>
          <line x1={F.X(p)} x2={F.X(p)} y1={0} y2={320} stroke={C.purple} strokeDasharray="6 4" />
          <TexAt x={F.X(p) + 6} y={16} tex={`x=${r2(p)}`} color={C.purple} anchor="start" size={12} />
          <circle cx={F.X(p)} cy={F.Y(q)} r={6} fill={C.red} />
        </>
      )}
    </Fig>
  )
}

/* ---------- 2 次不等式 ---------- */

export function QuadraticInequalityFig() {
  const [b, setB] = useFig('b', -1)
  const [c, setC] = useFig('c', -2)
  const [gt, setGt] = useFig('gt', true)
  const F = frame([-6, 6], [-5, 6], { x: 0, y: 0, w: 560, h: 300 })
  const D = b * b - 4 * c
  const r1 = (-b - Math.sqrt(Math.max(D, 0))) / 2
  const r2_ = (-b + Math.sqrt(Math.max(D, 0))) / 2
  const f = (x: number) => x * x + b * x + c
  const ans =
    D > 1e-9
      ? gt
        ? `x<${r2(r1)},\\ ${r2(r2_)}<x`
        : `${r2(r1)}<x<${r2(r2_)}`
      : Math.abs(D) <= 1e-9
        ? gt
          ? `x\\neq${r2(r1)}\\ \\text{のすべての実数}`
          : `\\text{解なし}`
        : gt
          ? `\\text{すべての実数}`
          : `\\text{解なし}`
  // x 軸上で条件を満たす区間を塗る
  const segs: [number, number][] = []
  let start: number | null = null
  for (let i = 0; i <= 600; i++) {
    const x = -6 + (12 * i) / 600
    const okx = gt ? f(x) > 0 : f(x) < 0
    if (okx && start === null) start = x
    if ((!okx || i === 600) && start !== null) {
      segs.push([start, x])
      start = null
    }
  }
  return (
    <Fig
      w={560}
      h={300}
      controls={
        <>
          <Slider stack name="b" value={b} min={-5} max={5} step={0.1} onChange={setB} />
          <Slider stack name="c" value={c} min={-5} max={5} step={0.1} onChange={setC} />
          <div className="chips">
            <button className={`chip ${gt ? 'on' : ''}`} onClick={() => setGt(true)}>
              &gt; 0
            </button>
            <button className={`chip ${!gt ? 'on' : ''}`} onClick={() => setGt(false)}>
              &lt; 0
            </button>
          </div>
        </>
      }
      caption={<Tex block tex={`x^2${b ? sgn(b, 'x') : ''}${c ? sgn(c) : ''}${gt ? '>' : '<'}0\\quad\\Longleftrightarrow\\quad \\textcolor{${C.red}}{${ans}}`} />}
    >
      <Axes f={F} grid />
      <path d={F.path(f)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      {segs.map(([s, e], i) => (
        <rect key={i} x={F.X(s)} y={F.Y(0) - 5} width={F.X(e) - F.X(s)} height={10} rx={5} fill={C.red} opacity={0.7} />
      ))}
      {D >= 0 &&
        [r1, r2_].map((r, i) => <circle key={i} cx={F.X(r)} cy={F.Y(0)} r={5} fill="var(--bg)" stroke={C.red} strokeWidth={2} />)}
      <TexAt x={540} y={20} tex={`\\text{グラフが x 軸より${gt ? '上' : '下'}}`} anchor="end" size={12} color="var(--muted)" />
    </Fig>
  )
}

/* ---------- 対数の性質 ---------- */

const BASES: [string, number, string][] = [
  ['2', 2, '\\log_2'],
  ['10', 10, '\\log_{10}'],
  ['e', Math.E, '\\log'],
]

export function LogPropertiesFig() {
  const [m, setM] = useFig('m', 2)
  const [n, setN] = useFig('n', 3)
  const [bi, setBi] = useFig('base', 0)
  const [, base, name] = BASES[bi]
  const lg = (x: number) => Math.log(x) / Math.log(base)
  const F = frame([0, 17], [-1.5, 4.5], { x: 30, y: 10, w: 400, h: 280 })
  const bars: [string, number, string][] = [
    [`${name}M`, lg(m), C.blue],
    [`${name}N`, lg(n), C.orange],
  ]
  const by = (v: number) => F.Y(v)
  return (
    <Fig
      w={560}
      h={300}
      controls={
        <>
          <Slider stack name="M" value={m} min={0.5} max={4} step={0.05} onChange={setM} />
          <Slider stack name="N" value={n} min={0.5} max={4} step={0.05} onChange={setN} />
          <div className="chips">
            {BASES.map(([label], i) => (
              <button key={label} className={`chip ${i === bi ? 'on' : ''}`} onClick={() => setBi(i)}>
                底 {label}
              </button>
            ))}
          </div>
        </>
      }
      caption={
        <Tex
          block
          tex={`${name}(MN)=\\textcolor{${C.green}}{${r2(lg(m * n), 3)}}=\\textcolor{${C.blue}}{${r2(lg(m), 3)}}+\\textcolor{${C.orange}}{${r2(lg(n), 3)}}=${name}M+${name}N`}
        />
      }
    >
      <Axes f={F} />
      <path d={F.path(lg, 0.05, 17)} stroke={C.purple} strokeWidth={2.5} fill="none" />
      {[
        [m, C.blue],
        [n, C.orange],
        [m * n, C.green],
      ].map(([x, col], i) => (
        <g key={i}>
          <line x1={F.X(x as number)} x2={F.X(x as number)} y1={F.Y(0)} y2={F.Y(lg(x as number))} stroke={col as string} strokeDasharray="4 3" />
          <circle cx={F.X(x as number)} cy={F.Y(lg(x as number))} r={5} fill={col as string} />
        </g>
      ))}
      <TexAt x={F.X(m * n)} y={F.Y(0) + 16} tex="MN" color={C.green} size={12} />
      {/* 右側: 2 本を積むと log(MN) の高さになる */}
      <rect x={470} y={Math.min(by(0), by(lg(m * n)))} width={22} height={Math.abs(by(lg(m * n)) - by(0))} fill={C.green} opacity={0.75} />
      {(() => {
        let acc = 0
        return bars.map(([, v, col], i) => {
          const y0 = by(acc)
          acc += v
          const y1 = by(acc)
          return <rect key={i} x={500} y={Math.min(y0, y1)} width={22} height={Math.abs(y1 - y0)} fill={col} opacity={0.75} stroke="var(--bg)" />
        })
      })()}
      <line x1={460} x2={530} y1={by(0)} y2={by(0)} className="fig-axis" />
    </Fig>
  )
}

/* ---------- 漸化式（特性方程式）: くもの巣図 ---------- */

export function RecurrenceFig() {
  const [p, setP] = useFig('p', 0.5)
  const [q, setQ] = useFig('q', 1)
  const [a1, setA1] = useFig('a1', -2)
  const F = frame([-4, 6], [-4, 6], { x: 70, y: 0, w: 420, h: 340 })
  const alpha = Math.abs(1 - p) > 1e-9 ? q / (1 - p) : NaN
  const seq = [a1]
  for (let i = 0; i < 14; i++) seq.push(p * seq[i] + q)
  let web = `M${F.X(seq[0])},${F.Y(0)}`
  for (let i = 0; i < seq.length - 1; i++) web += ` L${F.X(seq[i])},${F.Y(clamp(seq[i + 1], -50, 50))} L${F.X(clamp(seq[i + 1], -50, 50))},${F.Y(clamp(seq[i + 1], -50, 50))}`
  return (
    <Fig
      w={560}
      h={340}
      controls={
        <>
          <Slider stack name="p" value={p} min={-1.5} max={1.5} step={0.05} onChange={setP} />
          <Slider stack name="q" value={q} min={-3} max={3} step={0.1} onChange={setQ} />
          <Slider stack name="a1" tex="a_1" value={a1} min={-3} max={5} step={0.1} onChange={setA1} />
        </>
      }
      caption={
        Number.isFinite(alpha) ? (
          <Tex
            block
            tex={`a_{n+1}=${r2(p)}a_n${sgn(q)},\\ \\ \\alpha=${r2(alpha)}:\\ \\ a_n=\\textcolor{${C.red}}{${r2(alpha)}}+(${r2(a1)}${sgn(-alpha)})\\cdot${par(p)}^{\\,n-1}\\ \\ ${Math.abs(p) < 1 ? '\\to\\alpha' : '\\text{（収束しない）}'}`}
          />
        ) : (
          <span className="hint">p = 1 のときは等差数列（特性方程式に解がない）。</span>
        )
      }
    >
      <Axes f={F} grid />
      <path d={F.path((x) => x)} stroke="var(--muted)" strokeWidth={1.5} fill="none" />
      <path d={F.path((x) => p * x + q)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      <path d={web} stroke={C.orange} strokeWidth={1.6} fill="none" />
      {Number.isFinite(alpha) && Math.abs(alpha) < 6 && <circle cx={F.X(alpha)} cy={F.Y(alpha)} r={6} fill={C.red} />}
      <TexAt x={F.X(5.6)} y={F.Y(5.6) + 14} tex="y=x" anchor="end" size={12} color="var(--muted)" />
      <TexAt x={F.X(-3.8)} y={F.Y(p * -3.8 + q) - 12} tex="y=px+q" anchor="start" size={12} color={C.blue} />
    </Fig>
  )
}

/* ---------- 調和級数の発散 ---------- */

export function HarmonicSeriesFig() {
  const [n, setN] = useFig('n', 12)
  const F = frame([0, n + 1.5], [0, 1.1], { x: 30, y: 10, w: 510, h: 250 })
  const H = Array.from({ length: n }, (_, i) => 1 / (i + 1)).reduce((s, v) => s + v, 0)
  return (
    <Fig
      w={560}
      h={280}
      controls={<Slider stack name="n" value={n} min={1} max={80} step={1} onChange={setN} />}
      caption={
        <>
          <Tex block tex={`1+\\frac12+\\cdots+\\frac1{${n}}=\\textcolor{${C.orange}}{${r2(H, 3)}}\\ >\\ \\int_1^{${n + 1}}\\frac{dx}{x}=\\log ${n + 1}=${r2(Math.log(n + 1), 3)}\\ \\to\\infty`} />
          <span className="hint">長方形（面積 1/k）は曲線 y = 1/x の下の面積より大きい。その面積 log(n+1) が限りなく大きくなるので、和も限りなく大きくなる。</span>
        </>
      }
    >
      <Axes f={F} />
      {Array.from({ length: n }, (_, i) => {
        const k = i + 1
        return <rect key={k} x={F.X(k)} y={F.Y(1 / k)} width={F.X(k + 1) - F.X(k)} height={F.Y(0) - F.Y(1 / k)} fill={C.orange} fillOpacity={0.35} stroke={C.orange} strokeWidth={n > 40 ? 0.4 : 1} />
      })}
      <path d={F.path((x) => 1 / x, 0.92, n + 1.5)} stroke={C.blue} strokeWidth={2.2} fill="none" />
    </Fig>
  )
}

/* ---------- 弧度法と扇形 ---------- */

export function RadianFig() {
  const [t, setT] = useFig('t', 1.2)
  const [r, setR] = useFig('r', 2)
  const O: P = [200, 170]
  const S = 55
  const R = r * S
  const end: P = [O[0] + R * Math.cos(t), O[1] - R * Math.sin(t)]
  const large = t > Math.PI ? 1 : 0
  return (
    <Fig
      w={560}
      h={340}
      controls={
        <>
          <Slider stack name="t" tex="\theta\ (\text{ラジアン})" value={t} min={0.05} max={2 * Math.PI} step={0.01} onChange={setT} />
          <Slider stack name="r" value={r} min={0.5} max={2.8} step={0.1} onChange={setR} />
        </>
      }
      caption={
        <Tex
          block
          tex={`\\theta=${r2(t)}\\ (=${r2((t * 180) / Math.PI, 1)}^\\circ),\\quad \\textcolor{${C.red}}{l=r\\theta=${r2(r * t)}},\\quad \\textcolor{${C.blue}}{S=\\tfrac12r^2\\theta=${r2((r * r * t) / 2)}}`}
        />
      }
    >
      <circle cx={O[0]} cy={O[1]} r={R} className="fig-thin" />
      <path d={`M${O[0]},${O[1]} L${O[0] + R},${O[1]} A${R},${R} 0 ${large} 0 ${end[0]},${end[1]} Z`} fill={C.blue} fillOpacity={0.18} />
      <path d={`M${O[0] + R},${O[1]} A${R},${R} 0 ${large} 0 ${end[0]},${end[1]}`} stroke={C.red} strokeWidth={4} fill="none" />
      <line x1={O[0]} y1={O[1]} x2={O[0] + R} y2={O[1]} stroke="currentColor" strokeWidth={2} />
      <line x1={O[0]} y1={O[1]} x2={end[0]} y2={end[1]} stroke="currentColor" strokeWidth={2} />
      <AngleArc v={O} p={[O[0] + 10, O[1]]} q={end} r={22} color={C.purple} label="\theta" />
      <TexAt x={O[0] + R / 2} y={O[1] + 16} tex="r" />
      {/* 右: 半径と同じ長さの弧が 1 ラジアン */}
      <TexAt x={540} y={40} tex="\text{弧の長さ}=\text{半径}\ \Leftrightarrow\ 1\ \text{ラジアン}" anchor="end" size={12} color="var(--muted)" />
      <TexAt x={540} y={64} tex="2\pi\ \text{ラジアン}=360^\circ" anchor="end" size={12} color="var(--muted)" />
    </Fig>
  )
}

/* ---------- 積和の公式 ---------- */

export function ProductToSumFig() {
  const [al, setAl] = useFig('a', 5)
  const [be, setBe] = useFig('b', 4)
  const F = frame([0, 2 * Math.PI], [-1.3, 1.3], { x: 10, y: 10, w: 540, h: 260 })
  const prod = (x: number) => Math.sin(al * x) * Math.sin(be * x)
  return (
    <Fig
      w={560}
      h={280}
      controls={
        <>
          <Slider stack name="a" tex="\alpha" value={al} min={1} max={10} step={1} onChange={setAl} />
          <Slider stack name="b" tex="\beta" value={be} min={1} max={10} step={1} onChange={setBe} />
        </>
      }
      caption={
        <>
          <Tex
            block
            tex={`\\textcolor{${C.red}}{\\sin ${al === 1 ? '' : al}x\\,\\sin ${be === 1 ? '' : be}x}=\\frac12\\left\\{\\textcolor{${C.blue}}{${al === be ? '1' : `\\cos ${Math.abs(al - be) === 1 ? '' : Math.abs(al - be)}x`}}-\\textcolor{${C.green}}{\\cos${al + be}x}\\right\\}`}
          />
          <span className="hint">近い周波数の積は、ゆっくりした波（差の周波数）と速い波（和の周波数）の差になる。うなりの仕組み。</span>
        </>
      }
    >
      <Axes f={F} />
      <path d={F.path((x) => Math.cos((al - be) * x) / 2, 0, 2 * Math.PI, 600)} stroke={C.blue} strokeWidth={1.5} strokeDasharray="5 4" fill="none" />
      <path d={F.path((x) => -Math.cos((al + be) * x) / 2, 0, 2 * Math.PI, 600)} stroke={C.green} strokeWidth={1.2} fill="none" opacity={0.6} />
      <path d={F.path(prod, 0, 2 * Math.PI, 800)} stroke={C.red} strokeWidth={2.5} fill="none" />
    </Fig>
  )
}

/* ---------- 重心 ---------- */

export function CentroidFig() {
  const [pts, setPts] = useFig<P[]>('pts', [
    [240, 40],
    [70, 310],
    [500, 290],
  ])
  const [A, B, Cc] = pts
  const G: P = [(A[0] + B[0] + Cc[0]) / 3, (A[1] + B[1] + Cc[1]) / 3]
  const Ma = mid(B, Cc)
  const set = (i: number) => (x: number, y: number) => setPts(pts.map((p, j) => (j === i ? [r2(clamp(x, 10, 550), 0), r2(clamp(y, 10, 330), 0)] : p)))
  return (
    <Fig
      w={560}
      h={340}
      caption={<Tex block tex={`\\textcolor{${C.red}}{AG}:\\textcolor{${C.blue}}{GM}=${r2(dist(A, G), 0)}:${r2(dist(G, Ma), 0)}=${r2(dist(A, G) / dist(G, Ma), 2)}:1\\qquad G=\\left(\\frac{x_A+x_B+x_C}{3},\\ \\frac{y_A+y_B+y_C}{3}\\right)`} />}
    >
      <polygon points={poly(A, B, Cc)} fill={C.blue} fillOpacity={0.06} stroke="currentColor" strokeWidth={2} />
      {[
        [A, mid(B, Cc)],
        [B, mid(Cc, A)],
        [Cc, mid(A, B)],
      ].map(([p, m], i) => (
        <g key={i}>
          <line x1={p[0]} y1={p[1]} x2={m[0]} y2={m[1]} stroke="var(--muted)" strokeDasharray="5 4" />
          <circle cx={m[0]} cy={m[1]} r={3.5} fill="var(--muted)" />
        </g>
      ))}
      <line x1={A[0]} y1={A[1]} x2={G[0]} y2={G[1]} stroke={C.red} strokeWidth={4} />
      <line x1={G[0]} y1={G[1]} x2={Ma[0]} y2={Ma[1]} stroke={C.blue} strokeWidth={4} />
      <circle cx={G[0]} cy={G[1]} r={6} fill={C.green} />
      <TexAt x={G[0] + 10} y={G[1] - 10} tex="G" color={C.green} anchor="start" />
      <TexAt x={Ma[0]} y={Ma[1] + 18} tex="M" color={C.blue} />
      {(['A', 'B', 'C'] as const).map((l, i) => (
        <TexAt key={l} x={pts[i][0] + (i === 1 ? -14 : i === 2 ? 14 : 0)} y={pts[i][1] + (i === 0 ? -18 : 6)} tex={l} anchor={i === 1 ? 'end' : i === 2 ? 'start' : 'middle'} />
      ))}
      {pts.map((p, i) => (
        <Handle key={i} x={p[0]} y={p[1]} onMove={set(i)} />
      ))}
    </Fig>
  )
}

/* ---------- 接弦定理 ---------- */

export function TangentChordFig() {
  const [tb, setTb] = useFig('b', 20)
  const [tc, setTc] = useFig('c', 130)
  const O: P = [280, 160]
  const R = 120
  const on = (deg: number): P => [O[0] + R * Math.cos((deg * Math.PI) / 180), O[1] - R * Math.sin((deg * Math.PI) / 180)]
  const A = on(-90)
  const B = on(tb)
  const Cp = on(tc)
  // 接線は A で水平。弦 AB と、B 側に伸ばした接線のなす角
  const T: P = [A[0] + (B[0] >= A[0] ? 160 : -160), A[1]]
  const ang = (v: P, p: P, q: P) => {
    const a1 = Math.atan2(p[1] - v[1], p[0] - v[0])
    const a2 = Math.atan2(q[1] - v[1], q[0] - v[0])
    let d = Math.abs(a1 - a2)
    if (d > Math.PI) d = 2 * Math.PI - d
    return (d * 180) / Math.PI
  }
  return (
    <Fig
      w={560}
      h={320}
      controls={
        <>
          <Slider stack name="b" tex="B\ \text{の位置}" value={tb} min={-80} max={250} step={1} onChange={setTb} />
          <Slider stack name="c" tex="C\ \text{の位置}" value={tc} min={-80} max={260} step={1} onChange={setTc} />
        </>
      }
      caption={
        <>
          <Tex block tex={`\\textcolor{${C.red}}{\\angle(\\text{接線},AB)=${r2(ang(A, T, B), 1)}^\\circ}\\qquad \\textcolor{${C.blue}}{\\angle ACB=${r2(ang(Cp, A, B), 1)}^\\circ}`} />
          <span className="hint">C が弦 AB の反対側（接線の角と反対側の弧）にあるとき、2 つの角は等しい。</span>
        </>
      }
    >
      <circle cx={O[0]} cy={O[1]} r={R} className="fig-thin" />
      <line x1={A[0] - 220} x2={A[0] + 220} y1={A[1]} y2={A[1]} stroke={C.orange} strokeWidth={2} />
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke="currentColor" strokeWidth={2} />
      <line x1={A[0]} y1={A[1]} x2={Cp[0]} y2={Cp[1]} stroke="var(--muted)" strokeWidth={1.5} />
      <line x1={B[0]} y1={B[1]} x2={Cp[0]} y2={Cp[1]} stroke="var(--muted)" strokeWidth={1.5} />
      <AngleArc v={A} p={T} q={B} r={34} color={C.red} />
      <AngleArc v={Cp} p={A} q={B} r={30} color={C.blue} />
      <TexAt x={A[0]} y={A[1] + 18} tex="A" />
      <TexAt x={B[0] + (B[0] > O[0] ? 12 : -12)} y={B[1] - 8} tex="B" anchor={B[0] > O[0] ? 'start' : 'end'} />
      <TexAt x={Cp[0] + (Cp[0] > O[0] ? 12 : -12)} y={Cp[1] - 8} tex="C" anchor={Cp[0] > O[0] ? 'start' : 'end'} />
      <TexAt x={A[0] + 210} y={A[1] - 12} tex="\text{接線}" color={C.orange} anchor="end" size={12} />
    </Fig>
  )
}

/* ---------- ヘロンの公式 ---------- */

export function HeronFig() {
  const [pts, setPts] = useFig<P[]>('pts', [
    [200, 50],
    [70, 300],
    [480, 300],
  ])
  const u = 50
  const [A, B, Cc] = pts
  const a = dist(B, Cc) / u
  const b = dist(Cc, A) / u
  const c = dist(A, B) / u
  const s = (a + b + c) / 2
  const heron = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)))
  const shoe = Math.abs((B[0] - A[0]) * (Cc[1] - A[1]) - (Cc[0] - A[0]) * (B[1] - A[1])) / 2 / (u * u)
  const set = (i: number) => (x: number, y: number) => setPts(pts.map((p, j) => (j === i ? [r2(clamp(x, 10, 550), 0), r2(clamp(y, 10, 330), 0)] : p)))
  return (
    <Fig
      w={560}
      h={340}
      caption={
        <Tex
          block
          tex={`s=\\frac{${r2(a)}+${r2(b)}+${r2(c)}}{2}=${r2(s)},\\quad \\sqrt{s(s-a)(s-b)(s-c)}=\\textcolor{${C.green}}{${r2(heron, 3)}}\\quad(\\text{座標で計算した面積}\\ ${r2(shoe, 3)})`}
        />
      }
    >
      <polygon points={poly(A, B, Cc)} fill={C.green} fillOpacity={0.15} stroke="currentColor" strokeWidth={2} />
      <TexAt x={mid(B, Cc)[0]} y={mid(B, Cc)[1] + 16} tex={`a=${r2(a)}`} color={C.blue} size={13} />
      <TexAt x={mid(Cc, A)[0] + 10} y={mid(Cc, A)[1]} tex={`b=${r2(b)}`} color={C.blue} anchor="start" size={13} />
      <TexAt x={mid(A, B)[0] - 10} y={mid(A, B)[1]} tex={`c=${r2(c)}`} color={C.blue} anchor="end" size={13} />
      {pts.map((p, i) => (
        <Handle key={i} x={p[0]} y={p[1]} onMove={set(i)} />
      ))}
    </Fig>
  )
}

/* ---------- トレミーの定理 ---------- */

export function PtolemyFig() {
  const [angs, setAngs] = useFig('ang', [110, 200, 290, 20])
  const O: P = [280, 165]
  const R = 140
  const sorted = [...angs].sort((x, y) => x - y)
  const on = (d: number): P => [O[0] + R * Math.cos((d * Math.PI) / 180), O[1] - R * Math.sin((d * Math.PI) / 180)]
  const [A, B, Cc, D] = sorted.map(on)
  const u = 70
  const L = (p: P, q: P) => dist(p, q) / u
  const lhs = L(A, Cc) * L(B, D)
  const rhs = L(A, B) * L(Cc, D) + L(A, D) * L(B, Cc)
  const move = (i: number) => (x: number, y: number) => {
    const d = (((Math.atan2(O[1] - y, x - O[0]) * 180) / Math.PI + 360) % 360)
    setAngs(angs.map((v, j) => (j === i ? r2(d, 1) : v)))
  }
  return (
    <Fig
      w={560}
      h={330}
      caption={
        <>
          <Tex
            block
            tex={`\\textcolor{${C.red}}{AC\\cdot BD}=${r2(lhs, 3)}\\qquad \\textcolor{${C.blue}}{AB\\cdot CD}+\\textcolor{${C.green}}{AD\\cdot BC}=${r2(rhs, 3)}`}
          />
          <span className="hint">4 つの点をドラッグして円周上を動かす。円に内接する四角形では、対角線の積が向かい合う辺の積の和に等しい。</span>
        </>
      }
    >
      <circle cx={O[0]} cy={O[1]} r={R} className="fig-thin" />
      <polygon points={poly(A, B, Cc, D)} fill={C.blue} fillOpacity={0.05} stroke="none" />
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={C.blue} strokeWidth={2.5} />
      <line x1={Cc[0]} y1={Cc[1]} x2={D[0]} y2={D[1]} stroke={C.blue} strokeWidth={2.5} />
      <line x1={A[0]} y1={A[1]} x2={D[0]} y2={D[1]} stroke={C.green} strokeWidth={2.5} />
      <line x1={B[0]} y1={B[1]} x2={Cc[0]} y2={Cc[1]} stroke={C.green} strokeWidth={2.5} />
      <line x1={A[0]} y1={A[1]} x2={Cc[0]} y2={Cc[1]} stroke={C.red} strokeWidth={2.5} strokeDasharray="6 4" />
      <line x1={B[0]} y1={B[1]} x2={D[0]} y2={D[1]} stroke={C.red} strokeWidth={2.5} strokeDasharray="6 4" />
      {[A, B, Cc, D].map((p, i) => (
        <TexAt key={i} x={O[0] + (p[0] - O[0]) * 1.16} y={O[1] + (p[1] - O[1]) * 1.16} tex={'ABCD'[i]} />
      ))}
      {angs.map((d, i) => {
        const p = on(d)
        return <Handle key={i} x={p[0]} y={p[1]} onMove={move(i)} />
      })}
    </Fig>
  )
}

/* ---------- ピックの定理 ---------- */

const PICK_PRESETS: { name: string; v: P[] }[] = [
  { name: '三角形', v: [[1, 1], [8, 2], [3, 6]] },
  { name: '四角形', v: [[1, 1], [7, 1], [9, 5], [2, 6]] },
  { name: 'へこんだ形', v: [[1, 1], [8, 1], [8, 6], [5, 3], [1, 6]] },
]
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))

export function PickFig() {
  const [vs, setVs] = useFig<P[]>('v', PICK_PRESETS[1].v)
  const S = 50
  const X = (x: number) => 30 + x * S
  const Y = (y: number) => 340 - 20 - y * S
  const n = vs.length
  let area2 = 0
  let B = 0
  for (let i = 0; i < n; i++) {
    const [x1, y1] = vs[i]
    const [x2, y2] = vs[(i + 1) % n]
    area2 += x1 * y2 - x2 * y1
    B += gcd(Math.abs(x2 - x1), Math.abs(y2 - y1))
  }
  const A = Math.abs(area2) / 2
  // 内部の格子点を数える（境界上は除く）
  const onEdge = (px: number, py: number) =>
    vs.some((p, i) => {
      const q = vs[(i + 1) % n]
      const cross = (q[0] - p[0]) * (py - p[1]) - (q[1] - p[1]) * (px - p[0])
      return cross === 0 && px >= Math.min(p[0], q[0]) && px <= Math.max(p[0], q[0]) && py >= Math.min(p[1], q[1]) && py <= Math.max(p[1], q[1])
    })
  const inside = (px: number, py: number) => {
    let c = false
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const [xi, yi] = vs[i]
      const [xj, yj] = vs[j]
      if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c
    }
    return c
  }
  const dots: { x: number; y: number; k: 'in' | 'edge' | 'out' }[] = []
  for (let x = 0; x <= 10; x++) for (let y = 0; y <= 6; y++) dots.push({ x, y, k: onEdge(x, y) ? 'edge' : inside(x, y) ? 'in' : 'out' })
  const I = dots.filter((d) => d.k === 'in').length
  const move = (i: number) => (px: number, py: number) =>
    setVs(vs.map((p, j) => (j === i ? [clamp(Math.round((px - 30) / S), 0, 10), clamp(Math.round((320 - py) / S), 0, 6)] : p)))
  return (
    <Fig
      w={560}
      h={340}
      controls={
        <div className="chips">
          {PICK_PRESETS.map((p) => (
            <button key={p.name} className="chip" onClick={() => setVs(p.v)}>
              {p.name}
            </button>
          ))}
        </div>
      }
      caption={
        <>
          <Tex
            block
            tex={`S=${r2(A, 1)}\\qquad \\textcolor{${C.green}}{i}+\\frac{\\textcolor{${C.orange}}{b}}{2}-1=\\textcolor{${C.green}}{${I}}+\\frac{\\textcolor{${C.orange}}{${B}}}{2}-1=${r2(I + B / 2 - 1, 1)}`}
          />
          <span className="hint">頂点をドラッグすると格子点に吸い付く（辺どうしが交わらない形で）。緑は内部の格子点、橙は辺の上の格子点。</span>
        </>
      }
    >
      <polygon points={vs.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} fill={C.blue} fillOpacity={0.12} stroke={C.blue} strokeWidth={2} />
      {dots.map((d) => (
        <circle key={`${d.x}-${d.y}`} cx={X(d.x)} cy={Y(d.y)} r={d.k === 'out' ? 2 : 4.5} fill={d.k === 'in' ? C.green : d.k === 'edge' ? C.orange : 'var(--muted)'} opacity={d.k === 'out' ? 0.5 : 1} />
      ))}
      {vs.map(([x, y], i) => (
        <Handle key={i} x={X(x)} y={Y(y)} onMove={move(i)} color={SERIES[0]} />
      ))}
    </Fig>
  )
}
