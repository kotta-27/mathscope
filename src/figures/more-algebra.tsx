import { useRef, useState } from 'react'
import { Slider } from '../components/Slider'
import { Tex } from '../components/Tex'
import { useRaf } from '../lib/useRaf'
import { useVisible } from '../lib/useVisible'
import { AngleArc, Axes, Fig, Handle, TexAt } from './common'
import { C, SERIES, clamp, frame, r2, sgn } from './util'
import { useFig } from './state'

type P = [number, number]
const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1])
const poly = (...ps: P[]) => ps.map((p) => p.join(',')).join(' ')

/* ---------- 解と係数の関係 ---------- */

export function VietaFig() {
  const [b, setB] = useFig('b', -1)
  const [c, setC] = useFig('c', -2)
  const F = frame([-5, 5], [-6, 6], { x: 0, y: 0, w: 560, h: 320 })
  const D = b * b - 4 * c
  const real = D >= 0
  const r1 = real ? (-b - Math.sqrt(D)) / 2 : NaN
  const r2_ = real ? (-b + Math.sqrt(D)) / 2 : NaN
  return (
    <Fig
      w={560}
      h={320}
      controls={
        <>
          <Slider stack name="b" value={b} min={-5} max={5} step={0.1} onChange={setB} />
          <Slider stack name="c" value={c} min={-6} max={6} step={0.1} onChange={setC} />
        </>
      }
      caption={
        real ? (
          <Tex
            block
            tex={`\\textcolor{${C.red}}{\\alpha+\\beta=${r2(r1 + r2_)}}=-b,\\qquad \\textcolor{${C.blue}}{\\alpha\\beta=${r2(r1 * r2_)}}=c\\qquad(\\alpha=${r2(r1)},\\ \\beta=${r2(r2_)})`}
          />
        ) : (
          <span className="hint">判別式が負なので、実数の解はない（解は虚数で、和と積の関係はそのまま成り立つ）。</span>
        )
      }
    >
      <Axes f={F} grid />
      <path d={F.path((x) => x * x + b * x + c)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      <line x1={F.X(-b / 2)} x2={F.X(-b / 2)} y1={0} y2={320} stroke={C.purple} strokeDasharray="6 4" />
      <TexAt x={F.X(-b / 2) + 6} y={20} tex={`x=\\frac{\\alpha+\\beta}{2}`} color={C.purple} anchor="start" size={13} />
      {real && (
        <>
          <line x1={F.X(r1)} x2={F.X(r2_)} y1={F.Y(0) + 14} y2={F.Y(0) + 14} stroke={C.red} strokeWidth={3} />
          <circle cx={F.X(r1)} cy={F.Y(0)} r={6} fill={C.red} />
          <circle cx={F.X(r2_)} cy={F.Y(0)} r={6} fill={C.red} />
          <TexAt x={F.X(r1)} y={F.Y(0) - 16} tex="\alpha" color={C.red} />
          <TexAt x={F.X(r2_)} y={F.Y(0) - 16} tex="\beta" color={C.red} />
        </>
      )}
      <circle cx={F.X(0)} cy={F.Y(c)} r={5} fill={C.blue} />
      <TexAt x={F.X(0) + 8} y={F.Y(c)} tex={`c=\\alpha\\beta`} color={C.blue} anchor="start" size={13} />
    </Fig>
  )
}

/* ---------- 因数定理・剰余の定理 ---------- */

/** P(x) = x³ − 6x² + 11x − 6 を x − a で割る */
export function FactorRemainderFig({ mode }: { mode: 'factor' | 'remainder' }) {
  const [a, setA] = useFig('a', mode === 'factor' ? 2 : 3.5)
  const P = (x: number) => x ** 3 - 6 * x ** 2 + 11 * x - 6
  const F = frame([-0.5, 4.5], [-3, 6], { x: 0, y: 0, w: 560, h: 300 })
  const r = P(a)
  // 商 Q(x) = x² + (a − 6)x + (a² − 6a + 11)
  const q1 = a - 6
  const q0 = a * a - 6 * a + 11
  const zero = Math.abs(r) < 0.02
  return (
    <Fig
      w={560}
      h={300}
      controls={
        <>
          <Slider stack name="a" value={a} min={-0.3} max={4.3} step={0.05} onChange={setA} />
          <div className="chips">
            {[1, 2, 3].map((v) => (
              <button key={v} className={`chip ${Math.abs(a - v) < 1e-9 ? 'on' : ''}`} onClick={() => setA(v)}>
                a = {v}
              </button>
            ))}
          </div>
        </>
      }
      caption={
        <Tex
          block
          tex={`P(x)=(x-${r2(a)})\\bigl(x^2${q1 ? sgn(q1, 'x') : ''}+${r2(q0)}\\bigr)+\\textcolor{${zero ? C.green : C.red}}{${r2(r)}}\\qquad ${
            mode === 'factor'
              ? zero
                ? `\\textcolor{${C.green}}{P(a)=0\\ \\Rightarrow\\ \\text{割り切れる}}`
                : `P(a)\\neq0\\ \\Rightarrow\\ \\text{割り切れない}`
              : `\\text{余り}=P(${r2(a)})`
          }`}
        />
      }
    >
      <Axes f={F} grid />
      <path d={F.path(P)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      <line x1={F.X(a)} x2={F.X(a)} y1={F.Y(0)} y2={F.Y(r)} stroke={zero ? C.green : C.red} strokeWidth={4} />
      <circle cx={F.X(a)} cy={F.Y(r)} r={6} fill={zero ? C.green : C.red} />
      <TexAt x={F.X(a) + 10} y={F.Y(r / 2)} tex={`P(a)=${r2(r)}`} color={zero ? C.green : C.red} anchor="start" size={13} />
      {[1, 2, 3].map((x) => (
        <circle key={x} cx={F.X(x)} cy={F.Y(0)} r={3} fill="var(--muted)" />
      ))}
    </Fig>
  )
}

/* ---------- 代数学の基本定理（複素数平面上の n 個の根） ---------- */

type Cx = [number, number]
const cmul = (a: Cx, b: Cx): Cx => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cdiv = (a: Cx, b: Cx): Cx => {
  const d = b[0] * b[0] + b[1] * b[1] || 1e-12
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]
}
const csub = (a: Cx, b: Cx): Cx => [a[0] - b[0], a[1] - b[1]]

/** Durand–Kerner 法で z^n + a z + b = 0 の根をすべて求める */
function roots(n: number, a: number, b: number): Cx[] {
  const p = (z: Cx): Cx => {
    let zn: Cx = [1, 0]
    for (let i = 0; i < n; i++) zn = cmul(zn, z)
    return [zn[0] + a * z[0] + b, zn[1] + a * z[1]]
  }
  let rs: Cx[] = Array.from({ length: n }, (_, k) => {
    const t = (2 * Math.PI * k) / n + 0.4
    return [0.9 * Math.cos(t), 0.9 * Math.sin(t)]
  })
  for (let it = 0; it < 200; it++) {
    rs = rs.map((z, i) => {
      let den: Cx = [1, 0]
      rs.forEach((w, j) => {
        if (j !== i) den = cmul(den, csub(z, w))
      })
      return csub(z, cdiv(p(z), den))
    })
  }
  return rs
}

export function FundamentalAlgebraFig() {
  const [n, setN] = useFig('n', 5)
  const [a, setA] = useFig('a', -1)
  const [b, setB] = useFig('b', 0.5)
  const rs = roots(n, a, b)
  const F = frame([-2.2, 2.2], [-1.6, 1.6], { x: 0, y: 0, w: 560, h: 400 })
  const realCount = rs.filter((z) => Math.abs(z[1]) < 1e-6).length
  return (
    <Fig
      w={560}
      h={400}
      controls={
        <>
          <Slider stack name="n" tex="n\ (\text{次数})" value={n} min={2} max={9} step={1} onChange={setN} />
          <Slider stack name="a" value={a} min={-3} max={3} step={0.05} onChange={setA} />
          <Slider stack name="b" value={b} min={-3} max={3} step={0.05} onChange={setB} />
        </>
      }
      caption={
        <Tex
          block
          tex={`z^{${n}}${a ? sgn(a, 'z') : ''}${b ? sgn(b) : ''}=0\\ \\text{の根は複素数の範囲でちょうど ${n} 個（そのうち実数は ${realCount} 個）}`}
        />
      }
    >
      <Axes f={F} grid step={0.5} />
      <circle cx={F.X(0)} cy={F.Y(0)} r={F.X(1) - F.X(0)} fill="none" stroke="var(--muted)" strokeDasharray="4 4" />
      {rs.map((z, i) => (
        <g key={i}>
          <circle cx={F.X(z[0])} cy={F.Y(z[1])} r={7} fill={Math.abs(z[1]) < 1e-6 ? C.orange : C.purple} />
        </g>
      ))}
      <TexAt x={F.X(2.05)} y={F.Y(-0.12)} tex="\text{実軸}" size={11} color="var(--muted)" anchor="end" />
      <TexAt x={F.X(0.08)} y={F.Y(1.5)} tex="\text{虚軸}" size={11} color="var(--muted)" anchor="start" />
    </Fig>
  )
}

/* ---------- べき乗和: 1³ + 2³ + … + n³ = (1 + 2 + … + n)² ---------- */

export function PowerSumsFig() {
  const [n, setN] = useFig('n', 5)
  const T = (n * (n + 1)) / 2
  const S = Math.min(300 / T, 40)
  const x0 = 40
  const y0 = 20
  const cells: { x: number; y: number; k: number }[] = []
  for (let k = 1; k <= n; k++) {
    const a = ((k - 1) * k) / 2
    const b = (k * (k + 1)) / 2
    // k 番目の「L 字」: 外側の幅 k の帯（面積 k³）
    for (let i = 0; i < b; i++)
      for (let j = 0; j < b; j++) if (i >= a || j >= a) cells.push({ x: i, y: j, k })
  }
  return (
    <Fig
      w={560}
      h={340}
      controls={<Slider stack name="n" value={n} min={1} max={8} step={1} onChange={setN} />}
      caption={
        <>
          <Tex block tex={`1^3+2^3+\\cdots+${n}^3=${(T * T).toLocaleString()}=(1+2+\\cdots+${n})^2=${T}^2`} />
          <span className="hint">一辺 1+2+…+n の正方形を、色ごとの L 字に分けると、k 番目の L 字の面積がちょうど k³ になる。</span>
        </>
      }
    >
      {cells.map((c, i) => (
        <rect key={i} x={x0 + c.x * S} y={y0 + c.y * S} width={S - 1} height={S - 1} fill={SERIES[(c.k - 1) % SERIES.length]} opacity={0.75} />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const k = i + 1
        const b = (k * (k + 1)) / 2
        return <TexAt key={k} x={x0 + T * S + 14} y={y0 + (b - k / 2) * S} tex={`${k}^3`} color={SERIES[i % SERIES.length]} anchor="start" size={13} />
      })}
    </Fig>
  )
}

/* ---------- 数学的帰納法（ドミノ） ---------- */

export function InductionFig() {
  const [k, setK] = useFig('k', 4.5)
  const [first, setFirst] = useFig('first', true)
  const N = 9
  return (
    <Fig
      w={560}
      h={220}
      controls={
        <>
          <Slider stack name="k" tex="\text{時間}" value={k} min={0} max={N} step={0.05} onChange={setK} />
          <label className="check">
            <input type="checkbox" checked={first} onChange={(e) => setFirst(e.target.checked)} /> 最初のドミノを倒す（P(1) が成り立つ）
          </label>
        </>
      }
      caption={
        <span className="hint">
          「P(k) なら P(k+1)」はドミノが次を倒せる並び方。最初の 1 枚（P(1)）が倒れれば、すべて倒れる。最初が倒れなければ、どれも倒れない。
        </span>
      }
    >
      <line x1={20} x2={540} y1={170} y2={170} className="fig-axis" />
      {Array.from({ length: N }, (_, i) => {
        const fall = first ? clamp(k - i, 0, 1) : 0
        const ang = fall * 72
        const x = 50 + i * 55
        return (
          <g key={i} transform={`rotate(${ang} ${x + 10} 170)`}>
            <rect x={x} y={90} width={10} height={80} rx={2} fill={fall >= 1 ? C.green : fall > 0 ? C.orange : C.blue} opacity={0.85} />
            <TexAt x={x + 5} y={196} tex={`P(${i + 1})`} size={11} color="var(--muted)" />
          </g>
        )
      })}
    </Fig>
  )
}

/* ---------- 単調収束定理: (1 + 1/n)^n → e ---------- */

export function MonotoneConvergenceFig() {
  const [N, setN] = useFig('N', 25)
  const F = frame([0, 61], [1.9, 3.1], { x: 40, y: 10, w: 500, h: 260 })
  const a = (n: number) => (1 + 1 / n) ** n
  return (
    <Fig
      w={560}
      h={290}
      controls={<Slider stack name="N" tex="n\ \text{まで}" value={N} min={1} max={60} step={1} onChange={setN} />}
      caption={<Tex block tex={`a_{${N}}=\\left(1+\\frac1{${N}}\\right)^{${N}}=${r2(a(N), 5)}\\ \\nearrow\\ e=2.71828\\ldots\\quad(\\text{増加し、}3\\text{ を超えない})`} />}
    >
      <line x1={F.X(0)} x2={F.X(61)} y1={F.Y(3)} y2={F.Y(3)} stroke={C.red} strokeDasharray="6 4" />
      <TexAt x={F.X(60)} y={F.Y(3) - 12} tex="3\ (\text{上界})" color={C.red} anchor="end" size={12} />
      <line x1={F.X(0)} x2={F.X(61)} y1={F.Y(Math.E)} y2={F.Y(Math.E)} stroke={C.green} strokeWidth={2} />
      <TexAt x={F.X(60)} y={F.Y(Math.E) + 14} tex="e" color={C.green} anchor="end" size={14} />
      <line x1={F.X(0)} x2={F.X(61)} y1={F.Y(2)} y2={F.Y(2)} className="fig-axis" />
      {Array.from({ length: N }, (_, i) => (
        <circle key={i} cx={F.X(i + 1)} cy={F.Y(a(i + 1))} r={3.5} fill={C.blue} />
      ))}
      <TexAt x={F.X(0) - 6} y={F.Y(2)} tex="2" size={12} anchor="end" color="var(--muted)" />
    </Fig>
  )
}

/* ---------- 加法定理（単位円で sin(α+β) を分ける） ---------- */

export function AdditionFormulaFig() {
  const [al, setAl] = useFig('al', 35)
  const [be, setBe] = useFig('be', 30)
  const a = (al * Math.PI) / 180
  const b = (be * Math.PI) / 180
  const O: P = [180, 300]
  const R = 230
  const pt = (t: number, r = 1): P => [O[0] + R * r * Math.cos(t), O[1] - R * r * Math.sin(t)]
  const Q = pt(a + b)
  const Rp = pt(a, Math.cos(b)) // OQ を OP に落とした点（OR = cos β）
  return (
    <Fig
      w={560}
      h={330}
      controls={
        <>
          <Slider stack name="a" tex="\alpha\ (^\circ)" value={al} min={5} max={80} step={1} onChange={setAl} />
          <Slider stack name="b" tex="\beta\ (^\circ)" value={be} min={5} max={80} step={1} onChange={setBe} />
        </>
      }
      caption={
        <>
          <Tex
            block
            tex={`\\sin(\\alpha+\\beta)=\\textcolor{${C.blue}}{\\sin\\alpha\\cos\\beta}+\\textcolor{${C.red}}{\\cos\\alpha\\sin\\beta}=${r2(Math.sin(a) * Math.cos(b), 3)}+${r2(Math.cos(a) * Math.sin(b), 3)}=${r2(Math.sin(a + b), 3)}`}
          />
          <span className="hint">半径 1 の円の点 Q（角 α+β）から、角 α の線に垂線を下ろす（足 R）。OR = cos β、RQ = sin β。Q の高さは「R の高さ」と「RQ の縦の成分」の和。</span>
        </>
      }
    >
      <path d={`M${O[0] + R},${O[1]} A${R},${R} 0 0 0 ${O[0]},${O[1] - R}`} className="fig-thin" />
      <line x1={O[0]} x2={O[0] + R + 20} y1={O[1]} y2={O[1]} className="fig-axis" />
      <line x1={O[0]} y1={O[1]} x2={pt(a, 1.1)[0]} y2={pt(a, 1.1)[1]} className="fig-dash" />
      <line x1={O[0]} y1={O[1]} x2={Q[0]} y2={Q[1]} stroke="currentColor" strokeWidth={2} />
      <line x1={Q[0]} y1={Q[1]} x2={Rp[0]} y2={Rp[1]} stroke={C.purple} strokeWidth={2} />
      <line x1={Rp[0]} y1={Rp[1]} x2={Rp[0]} y2={O[1]} stroke={C.blue} strokeWidth={4} />
      <line x1={Q[0] - 14} y1={Q[1]} x2={Q[0] - 14} y2={Rp[1]} stroke={C.red} strokeWidth={4} />
      <line x1={Q[0]} y1={Q[1]} x2={Q[0]} y2={O[1]} className="fig-dash" />
      <line x1={Rp[0]} y1={Rp[1]} x2={Q[0] - 14} y2={Rp[1]} className="fig-dash" />
      <AngleArc v={O} p={[O[0] + 10, O[1]]} q={Rp} r={44} color={C.blue} label="\alpha" />
      <AngleArc v={O} p={Rp} q={Q} r={64} color={C.purple} label="\beta" />
      <TexAt x={Q[0] + 8} y={Q[1] - 10} tex="Q" anchor="start" />
      <TexAt x={Rp[0] + 10} y={Rp[1] + 6} tex="R" anchor="start" color={C.purple} />
      <TexAt x={Rp[0] + 6} y={(Rp[1] + O[1]) / 2} tex="\sin\alpha\cos\beta" color={C.blue} anchor="start" size={12} />
      <TexAt x={Q[0] - 20} y={(Q[1] + Rp[1]) / 2} tex="\cos\alpha\sin\beta" color={C.red} anchor="end" size={12} />
    </Fig>
  )
}

/* ---------- 2 倍角: 円周角を使って sin 2θ = 2 sin θ cos θ ---------- */

export function DoubleAngleFig() {
  const [td, setTd] = useFig('td', 30)
  const t = (td * Math.PI) / 180
  const O: P = [280, 190]
  const R = 140
  const A: P = [O[0] - R, O[1]]
  const Pp: P = [O[0] + R * Math.cos(2 * t), O[1] - R * Math.sin(2 * t)]
  const H: P = [Pp[0], O[1]]
  return (
    <Fig
      w={560}
      h={360}
      controls={<Slider stack name="t" tex="\theta\ (^\circ)" value={td} min={5} max={85} step={1} onChange={setTd} />}
      caption={
        <>
          <Tex block tex={`\\sin2\\theta=\\textcolor{${C.red}}{PH}=\\textcolor{${C.green}}{AP}\\sin\\theta=2\\cos\\theta\\sin\\theta=${r2(Math.sin(2 * t), 3)}`} />
          <span className="hint">円周角 ∠PAO は中心角 2θ の半分の θ。直径 2 の直角三角形で AP = 2cos θ なので、P の高さは AP·sin θ = 2 sin θ cos θ。</span>
        </>
      }
    >
      <circle cx={O[0]} cy={O[1]} r={R} className="fig-thin" />
      <line x1={A[0]} x2={O[0] + R} y1={O[1]} y2={O[1]} className="fig-axis" />
      <line x1={O[0]} y1={O[1]} x2={Pp[0]} y2={Pp[1]} stroke={C.blue} strokeWidth={2} />
      <line x1={A[0]} y1={A[1]} x2={Pp[0]} y2={Pp[1]} stroke={C.green} strokeWidth={3} />
      <line x1={Pp[0]} y1={Pp[1]} x2={H[0]} y2={H[1]} stroke={C.red} strokeWidth={4} />
      <AngleArc v={A} p={[A[0] + 10, A[1]]} q={Pp} r={40} color={C.green} label="\theta" />
      <AngleArc v={O} p={[O[0] + 10, O[1]]} q={Pp} r={30} color={C.blue} label="2\theta" />
      <TexAt x={A[0] - 10} y={A[1]} tex="A" anchor="end" />
      <TexAt x={O[0]} y={O[1] + 18} tex="O" />
      <TexAt x={Pp[0] + 10} y={Pp[1] - 8} tex="P" anchor="start" />
      <TexAt x={H[0] + 8} y={H[1] + 14} tex="H" anchor="start" size={13} />
    </Fig>
  )
}

/* ---------- 中線定理 ---------- */

export function MedianFig() {
  const [pts, setPts] = useFig<P[]>('pts', [[220, 60], [70, 320], [490, 320]])
  const [A, B, Cc] = pts
  const M: P = [(B[0] + Cc[0]) / 2, (B[1] + Cc[1]) / 2]
  const u = 60
  const sq = (p: P, q: P) => (dist(p, q) / u) ** 2
  const set = (i: number) => (x: number, y: number) => setPts(pts.map((p, j) => (j === i ? [clamp(x, 10, 550), clamp(y, 10, 340)] : p)))
  return (
    <Fig
      w={560}
      h={350}
      caption={
        <Tex
          block
          tex={`\\textcolor{${C.red}}{AB^2}+\\textcolor{${C.red}}{AC^2}=${r2(sq(A, B) + sq(A, Cc))},\\qquad 2(\\textcolor{${C.green}}{AM^2}+\\textcolor{${C.blue}}{BM^2})=${r2(2 * (sq(A, M) + sq(B, M)))}`}
        />
      }
    >
      <polygon points={poly(A, B, Cc)} fill={C.blue} fillOpacity={0.05} stroke="currentColor" strokeWidth={1.5} />
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={C.red} strokeWidth={3} />
      <line x1={A[0]} y1={A[1]} x2={Cc[0]} y2={Cc[1]} stroke={C.red} strokeWidth={3} />
      <line x1={A[0]} y1={A[1]} x2={M[0]} y2={M[1]} stroke={C.green} strokeWidth={3} strokeDasharray="6 4" />
      <line x1={B[0]} y1={B[1] + 8} x2={M[0]} y2={M[1] + 8} stroke={C.blue} strokeWidth={3} />
      <circle cx={M[0]} cy={M[1]} r={4} fill={C.green} />
      <TexAt x={A[0]} y={A[1] - 20} tex="A" />
      <TexAt x={B[0] - 14} y={B[1]} tex="B" anchor="end" />
      <TexAt x={Cc[0] + 14} y={Cc[1]} tex="C" anchor="start" />
      <TexAt x={M[0]} y={M[1] + 26} tex="M" color={C.green} />
      {pts.map((p, i) => (
        <Handle key={i} x={p[0]} y={p[1]} onMove={set(i)} />
      ))}
    </Fig>
  )
}

/* ---------- メネラウスの定理 ---------- */

/** 直線 p1p2 と直線 q1q2 の交点 */
function intersect(p1: P, p2: P, q1: P, q2: P): P | null {
  const d = (p2[0] - p1[0]) * (q2[1] - q1[1]) - (p2[1] - p1[1]) * (q2[0] - q1[0])
  if (Math.abs(d) < 1e-9) return null
  const t = ((q1[0] - p1[0]) * (q2[1] - q1[1]) - (q1[1] - p1[1]) * (q2[0] - q1[0])) / d
  return [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])]
}

export function MenelausFig() {
  const A: P = [200, 50]
  const B: P = [70, 300]
  const Cc: P = [400, 300]
  const [l1, setL1] = useFig<P>('l1', [60, 130])
  const [l2, setL2] = useFig<P>('l2', [520, 250])
  const F = intersect(l1, l2, A, B)
  const D = intersect(l1, l2, B, Cc)
  const E = intersect(l1, l2, Cc, A)
  const ok = F && D && E
  const ext = (p: P, q: P, k = 3): [P, P] => [
    [p[0] - (q[0] - p[0]) * k, p[1] - (q[1] - p[1]) * k],
    [q[0] + (q[0] - p[0]) * k, q[1] + (q[1] - p[1]) * k],
  ]
  const [e1, e2] = ext(l1, l2)
  const prod = ok ? (dist(A, F) / dist(F, B)) * (dist(B, D) / dist(D, Cc)) * (dist(Cc, E) / dist(E, A)) : NaN
  return (
    <Fig
      w={560}
      h={340}
      caption={
        <>
          {ok ? (
            <Tex
              block
              tex={`\\frac{AF}{FB}\\cdot\\frac{BD}{DC}\\cdot\\frac{CE}{EA}=${r2(dist(A, F) / dist(F, B))}\\times${r2(dist(B, D) / dist(D, Cc))}\\times${r2(dist(Cc, E) / dist(E, A))}=${r2(prod, 3)}`}
            />
          ) : (
            <span className="hint">直線が辺と平行になっていて、交点がない。</span>
          )}
          <span className="hint">青い 2 点をドラッグして、三角形を横切る直線を動かす。比の積はいつも 1。</span>
        </>
      }
    >
      {[[A, B], [B, Cc], [Cc, A]].map(([p, q], i) => {
        const [a, b] = ext(p as P, q as P, 1.2)
        return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className="fig-dash" opacity={0.5} />
      })}
      <polygon points={poly(A, B, Cc)} fill={C.blue} fillOpacity={0.06} stroke="currentColor" strokeWidth={2} />
      <line x1={e1[0]} y1={e1[1]} x2={e2[0]} y2={e2[1]} stroke={C.orange} strokeWidth={2.5} />
      {ok &&
        ([[F, 'F'], [D, 'D'], [E, 'E']] as [P, string][]).map(([p, l]) => (
          <g key={l}>
            <circle cx={p[0]} cy={p[1]} r={5} fill={C.orange} />
            <TexAt x={p[0] + 10} y={p[1] - 12} tex={l} color={C.orange} anchor="start" />
          </g>
        ))}
      <TexAt x={A[0]} y={A[1] - 18} tex="A" />
      <TexAt x={B[0] - 14} y={B[1] + 4} tex="B" anchor="end" />
      <TexAt x={Cc[0] + 14} y={Cc[1] + 4} tex="C" anchor="start" />
      <Handle x={l1[0]} y={l1[1]} color={C.blue} onMove={(x, y) => setL1([clamp(x, 5, 555), clamp(y, 5, 335)])} />
      <Handle x={l2[0]} y={l2[1]} color={C.blue} onMove={(x, y) => setL2([clamp(x, 5, 555), clamp(y, 5, 335)])} />
    </Fig>
  )
}

/* ---------- オイラーの多面体定理（回る正多面体） ---------- */

const PHI = (1 + Math.sqrt(5)) / 2
type V3 = [number, number, number]
const SOLIDS: Record<string, { name: string; v: V3[]; F: number }> = (() => {
  const cube: V3[] = []
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) cube.push([x, y, z])
  const ico: V3[] = []
  for (const a of [-1, 1]) for (const b of [-1, 1]) ico.push([0, a, b * PHI], [a, b * PHI, 0], [b * PHI, 0, a])
  const dod: V3[] = [...cube]
  for (const a of [-1, 1]) for (const b of [-1, 1]) dod.push([0, a / PHI, b * PHI], [a / PHI, b * PHI, 0], [b * PHI, 0, a / PHI])
  return {
    tetra: { name: '正四面体', v: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], F: 4 },
    cube: { name: '立方体', v: cube, F: 6 },
    octa: { name: '正八面体', v: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], F: 8 },
    dodeca: { name: '正十二面体', v: dod, F: 12 },
    icosa: { name: '正二十面体', v: ico, F: 20 },
  }
})()
/** いちばん短い距離の組を辺とする */
function edges(v: V3[]): [number, number][] {
  const d = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
  let m = Infinity
  for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) m = Math.min(m, d(v[i], v[j]))
  const out: [number, number][] = []
  for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) if (d(v[i], v[j]) < m * 1.01) out.push([i, j])
  return out
}

export function EulerPolyhedronFig() {
  const [k, setK] = useFig('k', 'cube')
  const [t, setT] = useState(0.6)
  const ref = useRef<HTMLDivElement>(null)
  const visible = useVisible(ref)
  useRaf(visible, (dt) => setT((x) => x + dt * 0.5))
  const s = SOLIDS[k]
  const es = edges(s.v)
  const r = Math.max(...s.v.map((p) => Math.hypot(...p)))
  const proj = ([x, y, z]: V3): [number, number, number] => {
    const c = Math.cos(t)
    const sn = Math.sin(t)
    const x1 = x * c + z * sn
    const z1 = -x * sn + z * c
    const y1 = y * Math.cos(0.5) - z1 * Math.sin(0.5)
    const z2 = y * Math.sin(0.5) + z1 * Math.cos(0.5)
    return [280 + (x1 / r) * 120, 150 - (y1 / r) * 120, z2]
  }
  const pv = s.v.map(proj)
  const V = s.v.length
  const E = es.length
  return (
    <div ref={ref}>
      <Fig
        w={560}
        h={300}
        controls={
          <div className="chips">
            {Object.entries(SOLIDS).map(([id, x]) => (
              <button key={id} className={`chip ${id === k ? 'on' : ''}`} onClick={() => setK(id)}>
                {x.name}
              </button>
            ))}
          </div>
        }
        caption={<Tex block tex={`V-E+F=\\textcolor{${C.red}}{${V}}-\\textcolor{${C.blue}}{${E}}+\\textcolor{${C.green}}{${s.F}}=${V - E + s.F}`} />}
      >
        {es.map(([i, j]) => (
          <line key={`${i}-${j}`} x1={pv[i][0]} y1={pv[i][1]} x2={pv[j][0]} y2={pv[j][1]} stroke={C.blue} strokeWidth={2} opacity={0.45 + 0.35 * ((pv[i][2] + pv[j][2]) / (2 * r) + 0.5)} />
        ))}
        {pv.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={4} fill={C.red} opacity={0.5 + 0.5 * (p[2] / r + 1) / 2} />
        ))}
        <TexAt x={470} y={60} tex={`\\textcolor{${C.red}}{V=${V}}`} anchor="start" />
        <TexAt x={470} y={90} tex={`\\textcolor{${C.blue}}{E=${E}}`} anchor="start" />
        <TexAt x={470} y={120} tex={`\\textcolor{${C.green}}{F=${s.F}}`} anchor="start" />
      </Fig>
    </div>
  )
}


