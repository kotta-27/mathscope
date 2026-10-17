import { useMemo } from 'react'
import { Slider } from '../components/Slider'
import { Tex } from '../components/Tex'
import { AngleArc, Arrow, Axes, Fig, Handle, TexAt } from './common'
import { useFig } from './state'
import { C, SERIES, clamp, frame, r2, type Frame } from './util'

type P = [number, number]
const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1])
const poly = (...ps: P[]) => ps.map((p) => p.join(',')).join(' ')
const snap = (v: number) => Math.round(v * 4) / 4

/** 数学座標の点をドラッグする */
function MHandle({ f, v, set, color }: { f: Frame; v: P; set: (v: P) => void; color?: string }) {
  return <Handle x={f.X(v[0])} y={f.Y(v[1])} color={color} onMove={(x, y) => set([snap(clamp(f.ix(x), f.xr[0], f.xr[1])), snap(clamp(f.iy(y), f.yr[0], f.yr[1]))])} />
}
const arrow = (f: Frame, from: P, to: P, color: string, width?: number, dashed?: boolean) => (
  <Arrow x1={f.X(from[0])} y1={f.Y(from[1])} x2={f.X(to[0])} y2={f.Y(to[1])} color={color} width={width} dashed={dashed} />
)

/* ---------- 絶対値とグラフの折り返し ---------- */

export function AbsValueFig() {
  const [c, setC] = useFig('c', -2)
  const F = frame([-4, 4], [-3, 5], { x: 0, y: 0, w: 560, h: 300 })
  const f = (x: number) => x * x + c
  return (
    <Fig
      w={560}
      h={300}
      controls={<Slider stack name="c" value={c} min={-4} max={2} step={0.1} onChange={setC} />}
      caption={
        <>
          <Tex block tex={`y=\\textcolor{${C.red}}{|x^2${c >= 0 ? '+' : ''}${r2(c)}|}\\quad:\\quad y=x^2${c >= 0 ? '+' : ''}${r2(c)}\\ \\text{の}\\ x\\ \\text{軸より下の部分を、上に折り返す}`} />
        </>
      }
    >
      <Axes f={F} grid />
      <path d={F.path(f)} stroke={C.blue} strokeWidth={1.6} strokeDasharray="6 4" fill="none" />
      <path d={F.path((x) => Math.abs(f(x)))} stroke={C.red} strokeWidth={3} fill="none" />
      <TexAt x={F.X(-3.6)} y={F.Y(4.4)} tex="y=|f(x)|" color={C.red} anchor="start" size={13} />
    </Fig>
  )
}

/* ---------- 部分分数で消える和 ---------- */

export function TelescopingFig() {
  const [n, setN] = useFig('n', 5)
  const S = 1 - 1 / (n + 1)
  const W = 480
  const x0 = 40
  const terms = Array.from({ length: n }, (_, i) => i + 1)
  return (
    <Fig
      w={560}
      h={220}
      controls={<Slider stack name="n" value={n} min={1} max={12} step={1} onChange={setN} />}
      caption={
        <>
          <Tex
            block
            tex={`\\sum_{k=1}^{${n}}\\frac{1}{k(k+1)}=\\sum_{k=1}^{${n}}\\left(\\frac1k-\\frac1{k+1}\\right)=1-\\frac1{${n + 1}}=${r2(S, 4)}`}
          />
          <span className="hint">長さ 1 の帯を、1/(k(k+1)) の長さの区間に順に切っていく。残りはいつも 1/(n+1) で、和は 1 に近づく。</span>
        </>
      }
    >
      <rect x={x0} y={70} width={W} height={46} rx={6} fill="none" stroke="var(--muted)" />
      {terms.map((k) => {
        const a = 1 - 1 / k
        const b = 1 - 1 / (k + 1)
        return (
          <g key={k}>
            <rect x={x0 + a * W} y={70} width={(b - a) * W} height={46} fill={SERIES[(k - 1) % SERIES.length]} opacity={0.75} stroke="var(--bg)" />
            {k <= 4 && <TexAt x={x0 + ((a + b) / 2) * W} y={140} tex={`\\frac{1}{${k * (k + 1)}}`} size={12} />}
          </g>
        )
      })}
      <TexAt x={x0} y={56} tex="0" size={12} color="var(--muted)" />
      <TexAt x={x0 + W} y={56} tex="1" size={12} color="var(--muted)" />
      <TexAt x={x0 + S * W + (1 - S) * W * 0.5} y={180} tex={`\\text{残り}\\ \\frac1{${n + 1}}`} size={12} color="var(--muted)" />
    </Fig>
  )
}

/* ---------- フィボナッチと黄金比 ---------- */

export function FibonacciGoldenFig() {
  const [n, setN] = useFig('n', 10)
  const PHI = (1 + Math.sqrt(5)) / 2
  const F = [1, 1]
  for (let i = 2; i < 30; i++) F.push(F[i - 1] + F[i - 2])
  const ratios = F.slice(1, n + 1).map((v, i) => v / F[i])
  const G = frame([0, 21], [0.9, 2.1], { x: 40, y: 10, w: 500, h: 240 })
  return (
    <Fig
      w={560}
      h={270}
      controls={<Slider stack name="n" value={n} min={1} max={20} step={1} onChange={setN} />}
      caption={<Tex block tex={`\\frac{F_{${n + 1}}}{F_{${n}}}=\\frac{${F[n]}}{${F[n - 1]}}=${r2(ratios[n - 1], 6)}\\ \\to\\ \\varphi=\\frac{1+\\sqrt5}{2}=1.618034\\ldots`} />}
    >
      <line x1={G.X(0)} x2={G.X(21)} y1={G.Y(PHI)} y2={G.Y(PHI)} stroke={C.orange} strokeDasharray="6 4" />
      <TexAt x={G.X(20.5)} y={G.Y(PHI) - 12} tex="\varphi" color={C.orange} anchor="end" />
      <line x1={G.X(0)} x2={G.X(21)} y1={G.Y(1)} y2={G.Y(1)} className="fig-axis" />
      <polyline points={ratios.map((r, i) => `${G.X(i + 1)},${G.Y(r)}`).join(' ')} fill="none" stroke={C.blue} strokeWidth={1.5} />
      {ratios.map((r, i) => (
        <circle key={i} cx={G.X(i + 1)} cy={G.Y(r)} r={4} fill={C.blue} />
      ))}
      <TexAt x={G.X(0) - 6} y={G.Y(2)} tex="2" anchor="end" size={12} color="var(--muted)" />
      <TexAt x={G.X(0) - 6} y={G.Y(1)} tex="1" anchor="end" size={12} color="var(--muted)" />
    </Fig>
  )
}

/* ---------- 単位円による三角関数の定義 ---------- */

export function UnitCircleDefFig() {
  const [deg, setDeg] = useFig('t', 140)
  const t = (deg * Math.PI) / 180
  const F = frame([-1.6, 1.6], [-1.25, 1.25], { x: 0, y: 0, w: 560, h: 340 })
  const Pp: P = [Math.cos(t), Math.sin(t)]
  const q = Math.floor((((deg % 360) + 360) % 360) / 90) + 1
  const sign = (v: number) => (Math.abs(v) < 1e-9 ? '0' : v > 0 ? '+' : '-')
  return (
    <Fig
      w={560}
      h={340}
      controls={<Slider stack name="t" tex="\theta\ (^\circ)" value={deg} min={0} max={360} step={1} onChange={setDeg} />}
      caption={
        <Tex
          block
          tex={`P(\\textcolor{${C.blue}}{\\cos\\theta},\\ \\textcolor{${C.red}}{\\sin\\theta})=(${r2(Pp[0], 3)},\\ ${r2(Pp[1], 3)}),\\quad \\tan\\theta=\\frac{y}{x}=${Math.abs(Pp[0]) < 1e-9 ? '\\text{なし}' : r2(Pp[1] / Pp[0], 3)}\\qquad \\text{第 ${q} 象限}:\\ \\sin\\ ${sign(Pp[1])},\\ \\cos\\ ${sign(Pp[0])}`}
        />
      }
    >
      <Axes f={F} />
      <circle cx={F.X(0)} cy={F.Y(0)} r={F.X(1) - F.X(0)} className="fig-thin" />
      {[1, 2, 3, 4].map((k) => (
        <rect key={k} x={k === 2 || k === 3 ? F.X(-1.6) : F.X(0)} y={k <= 2 ? F.Y(1.25) : F.Y(0)} width={F.X(1.6) - F.X(0)} height={F.Y(0) - F.Y(1.25)} fill={k === q ? C.purple : 'none'} opacity={0.07} />
      ))}
      <line x1={F.X(0)} y1={F.Y(0)} x2={F.X(Pp[0])} y2={F.Y(Pp[1])} stroke="currentColor" strokeWidth={2} />
      <line x1={F.X(0)} y1={F.Y(0)} x2={F.X(Pp[0])} y2={F.Y(0)} stroke={C.blue} strokeWidth={4} />
      <line x1={F.X(Pp[0])} y1={F.Y(0)} x2={F.X(Pp[0])} y2={F.Y(Pp[1])} stroke={C.red} strokeWidth={4} />
      <AngleArc v={[F.X(0), F.Y(0)]} p={[F.X(0.3), F.Y(0)]} q={[F.X(Pp[0]), F.Y(Pp[1])]} r={26} color={C.purple} label="\theta" />
      <circle cx={F.X(Pp[0])} cy={F.Y(Pp[1])} r={6} fill={C.purple} />
      <TexAt x={F.X(Pp[0] * 1.18)} y={F.Y(Pp[1] * 1.18)} tex="P" />
      {[
        ['\\text{I}', 1.3, 1.05],
        ['\\text{II}', -1.3, 1.05],
        ['\\text{III}', -1.3, -1.05],
        ['\\text{IV}', 1.3, -1.05],
      ].map(([l, x, y]) => (
        <TexAt key={l as string} x={F.X(x as number)} y={F.Y(y as number)} tex={l as string} size={12} color="var(--muted)" />
      ))}
    </Fig>
  )
}

/* ---------- 相似比と面積比・体積比 ---------- */

export function SimilarRatioFig() {
  const [k, setK] = useFig('k', 2)
  const s = 46
  const base: P[] = [
    [0, 0],
    [2, 0],
    [0.6, 1.6],
  ]
  const draw = (sc: number, ox: number) => poly(...base.map(([x, y]) => [ox + x * s * sc, 280 - y * s * sc] as P))
  return (
    <Fig
      w={560}
      h={300}
      controls={<Slider stack name="k" tex="k\ (\text{相似比})" value={k} min={0.5} max={3} step={0.1} onChange={setK} />}
      caption={<Tex block tex={`\\text{相似比}\\ 1:${r2(k)}\\ \\Rightarrow\\ \\text{面積比}\\ 1:${r2(k * k)}\\ (=k^2),\\quad \\text{体積比}\\ 1:${r2(k ** 3)}\\ (=k^3)`} />}
    >
      <polygon points={draw(1, 40)} fill={C.blue} fillOpacity={0.25} stroke={C.blue} strokeWidth={2} />
      <polygon points={draw(k, 180)} fill={C.red} fillOpacity={0.2} stroke={C.red} strokeWidth={2} />
      {/* 面積比が k² になる理由: 小さい三角形を k² 個敷き詰める（k が整数のとき） */}
      {Number.isInteger(k) &&
        Array.from({ length: k }, (_, r) =>
          Array.from({ length: k - r }, (_, c2) => {
            const ox = 180 + (c2 * 2 + r * 0.6) * s
            const oy = 280 - r * 1.6 * s
            return <polygon key={`${r}-${c2}`} points={poly(...base.map(([x, y]) => [ox + x * s, oy - y * s] as P))} fill="none" stroke={C.red} strokeOpacity={0.5} strokeDasharray="3 3" />
          }),
        )}
      <TexAt x={80} y={296} tex="1" color={C.blue} size={13} />
      <TexAt x={180 + k * s} y={296} tex={`k=${r2(k)}`} color={C.red} size={13} />
    </Fig>
  )
}

/* ---------- 内心と内接円 ---------- */

export function IncenterFig() {
  const [pts, setPts] = useFig<P[]>('pts', [
    [220, 40],
    [60, 310],
    [500, 300],
  ])
  const [A, B, Cc] = pts
  const a = dist(B, Cc)
  const b = dist(Cc, A)
  const c = dist(A, B)
  const I: P = [(a * A[0] + b * B[0] + c * Cc[0]) / (a + b + c), (a * A[1] + b * B[1] + c * Cc[1]) / (a + b + c)]
  const S = Math.abs((B[0] - A[0]) * (Cc[1] - A[1]) - (Cc[0] - A[0]) * (B[1] - A[1])) / 2
  const r = (2 * S) / (a + b + c)
  const set = (i: number) => (x: number, y: number) => setPts(pts.map((p, j) => (j === i ? [r2(clamp(x, 10, 550), 0), r2(clamp(y, 10, 330), 0)] : p)))
  const u = 50
  return (
    <Fig w={560} h={340} caption={<Tex block tex={`r=\\frac{2S}{a+b+c}=\\frac{2\\times${r2(S / (u * u))}}{${r2((a + b + c) / u)}}=${r2(r / u)}\\qquad I=\\frac{aA+bB+cC}{a+b+c}`} />}>
      <polygon points={poly(A, B, Cc)} fill={C.blue} fillOpacity={0.05} stroke="currentColor" strokeWidth={2} />
      {[A, B, Cc].map((p, i) => (
        <line key={i} x1={p[0]} y1={p[1]} x2={I[0]} y2={I[1]} stroke="var(--muted)" strokeDasharray="5 4" />
      ))}
      <circle cx={I[0]} cy={I[1]} r={r} fill={C.green} fillOpacity={0.12} stroke={C.green} strokeWidth={2} />
      <circle cx={I[0]} cy={I[1]} r={5} fill={C.green} />
      <TexAt x={I[0] + 10} y={I[1] - 10} tex="I" color={C.green} anchor="start" />
      {pts.map((p, i) => (
        <Handle key={i} x={p[0]} y={p[1]} onMove={set(i)} />
      ))}
    </Fig>
  )
}

/* ---------- オイラー線 ---------- */

export function EulerLineFig() {
  const [pts, setPts] = useFig<P[]>('pts', [
    [200, 50],
    [70, 300],
    [470, 300],
  ])
  const [A, B, Cc] = pts
  const G: P = [(A[0] + B[0] + Cc[0]) / 3, (A[1] + B[1] + Cc[1]) / 3]
  // 外心 O: 3 頂点から等距離
  const d = 2 * (A[0] * (B[1] - Cc[1]) + B[0] * (Cc[1] - A[1]) + Cc[0] * (A[1] - B[1]))
  const sq = (p: P) => p[0] * p[0] + p[1] * p[1]
  const O: P = Math.abs(d) < 1e-9 ? G : [(sq(A) * (B[1] - Cc[1]) + sq(B) * (Cc[1] - A[1]) + sq(Cc) * (A[1] - B[1])) / d, (sq(A) * (Cc[0] - B[0]) + sq(B) * (A[0] - Cc[0]) + sq(Cc) * (B[0] - A[0])) / d]
  // 垂心 H = A + B + C − 2O（ベクトルで OH = OA + OB + OC）
  const H: P = [A[0] + B[0] + Cc[0] - 2 * O[0], A[1] + B[1] + Cc[1] - 2 * O[1]]
  const set = (i: number) => (x: number, y: number) => setPts(pts.map((p, j) => (j === i ? [r2(clamp(x, 10, 550), 0), r2(clamp(y, 10, 330), 0)] : p)))
  const far = (p: P, q: P, k: number): P => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k]
  return (
    <Fig w={560} h={340} caption={<Tex block tex={`\\textcolor{${C.blue}}{O},\\ \\textcolor{${C.green}}{G},\\ \\textcolor{${C.red}}{H}\\ \\text{は一直線上},\\quad OG:GH=${r2(dist(O, G), 0)}:${r2(dist(G, H), 0)}=1:${r2(dist(G, H) / Math.max(dist(O, G), 1e-9), 2)}`} />}>
      <polygon points={poly(A, B, Cc)} fill={C.blue} fillOpacity={0.04} stroke="currentColor" strokeWidth={2} />
      <circle cx={O[0]} cy={O[1]} r={dist(O, A)} className="fig-thin" />
      {dist(O, H) > 1 && <line x1={far(O, H, -0.6)[0]} y1={far(O, H, -0.6)[1]} x2={far(O, H, 1.6)[0]} y2={far(O, H, 1.6)[1]} stroke={C.purple} strokeWidth={2} strokeDasharray="8 5" />}
      {[
        [O, C.blue, 'O'],
        [G, C.green, 'G'],
        [H, C.red, 'H'],
      ].map(([p, col, l]) => (
        <g key={l as string}>
          <circle cx={(p as P)[0]} cy={(p as P)[1]} r={6} fill={col as string} />
          <TexAt x={(p as P)[0] + 10} y={(p as P)[1] - 10} tex={l as string} color={col as string} anchor="start" />
        </g>
      ))}
      {pts.map((p, i) => (
        <Handle key={i} x={p[0]} y={p[1]} onMove={set(i)} />
      ))}
    </Fig>
  )
}

/* ---------- 正射影ベクトル ---------- */

export function ProjectionFig() {
  const [a, setA] = useFig<P>('a', [3, 1])
  const [b, setB] = useFig<P>('b', [1, 2.5])
  const f = frame([-1, 4.5], [-1, 3.2], { x: 0, y: 0, w: 560, h: 340 })
  const aa = a[0] * a[0] + a[1] * a[1] || 1e-9
  const k = (a[0] * b[0] + a[1] * b[1]) / aa
  const pr: P = [a[0] * k, a[1] * k]
  return (
    <Fig
      w={560}
      h={340}
      caption={<Tex block tex={`\\textcolor{${C.green}}{\\vec p}=\\frac{\\vec a\\cdot\\vec b}{|\\vec a|^2}\\vec a=${r2(k, 3)}\\,\\vec a=(${r2(pr[0])},\\ ${r2(pr[1])}),\\qquad (\\vec b-\\vec p)\\perp\\vec a`} />}
    >
      <Axes f={f} grid step={0.5} />
      <line x1={f.X(-a[0] * 2)} y1={f.Y(-a[1] * 2)} x2={f.X(a[0] * 3)} y2={f.Y(a[1] * 3)} className="fig-dash" opacity={0.5} />
      <line x1={f.X(b[0])} y1={f.Y(b[1])} x2={f.X(pr[0])} y2={f.Y(pr[1])} stroke={C.orange} strokeWidth={2} strokeDasharray="5 4" />
      {arrow(f, [0, 0], pr, C.green, 5)}
      {arrow(f, [0, 0], a, C.blue)}
      {arrow(f, [0, 0], b, C.red)}
      <TexAt x={f.X(a[0]) + 12} y={f.Y(a[1]) + 6} tex="\vec a" color={C.blue} anchor="start" />
      <TexAt x={f.X(b[0]) + 10} y={f.Y(b[1]) - 10} tex="\vec b" color={C.red} anchor="start" />
      <TexAt x={f.X(pr[0] / 2)} y={f.Y(pr[1] / 2) + 18} tex="\vec p" color={C.green} />
      <MHandle f={f} v={a} set={setA} color={C.blue} />
      <MHandle f={f} v={b} set={setB} color={C.red} />
    </Fig>
  )
}

/* ---------- 直線のベクトル方程式 ---------- */

export function VectorLineFig() {
  const [t, setT] = useFig('t', 0.8)
  const [a, setA] = useFig<P>('a', [-1, 1])
  const [d, setD] = useFig<P>('d', [2, 0.75])
  const f = frame([-4, 5], [-2.5, 3.5], { x: 0, y: 0, w: 560, h: 340 })
  const p: P = [a[0] + t * d[0], a[1] + t * d[1]]
  const dEnd: P = [a[0] + d[0], a[1] + d[1]]
  return (
    <Fig
      w={560}
      h={340}
      controls={<Slider stack name="t" value={t} min={-2} max={2} step={0.01} onChange={setT} />}
      caption={<Tex block tex={`\\vec p=\\vec a+t\\,\\vec d=(${r2(a[0])},\\ ${r2(a[1])})+${r2(t)}\\,(${r2(d[0])},\\ ${r2(d[1])})=(${r2(p[0])},\\ ${r2(p[1])})`} />}
    >
      <Axes f={f} grid />
      <line x1={f.X(a[0] - d[0] * 6)} y1={f.Y(a[1] - d[1] * 6)} x2={f.X(a[0] + d[0] * 6)} y2={f.Y(a[1] + d[1] * 6)} stroke={C.purple} strokeWidth={2} opacity={0.6} />
      {arrow(f, [0, 0], a, C.blue)}
      {arrow(f, a, dEnd, C.orange)}
      {arrow(f, a, p, C.green, 2, true)}
      <circle cx={f.X(p[0])} cy={f.Y(p[1])} r={7} fill={C.red} />
      <TexAt x={f.X(a[0]) - 10} y={f.Y(a[1]) - 12} tex="\vec a" color={C.blue} anchor="end" />
      <TexAt x={f.X(dEnd[0]) + 8} y={f.Y(dEnd[1]) - 12} tex="\vec d" color={C.orange} anchor="start" />
      <TexAt x={f.X(p[0]) + 10} y={f.Y(p[1]) + 16} tex="P" color={C.red} anchor="start" />
      <MHandle f={f} v={a} set={setA} color={C.blue} />
      <MHandle f={f} v={dEnd} set={(v) => setD([v[0] - a[0], v[1] - a[1]])} color={C.orange} />
    </Fig>
  )
}

/* ---------- 一次独立 ---------- */

export function LinearIndependenceFig() {
  const [a, setA] = useFig<P>('a', [2, 0.5])
  const [b, setB] = useFig<P>('b', [0.5, 1.5])
  const f = frame([-5, 5], [-3.2, 3.2], { x: 0, y: 0, w: 560, h: 340 })
  const det = a[0] * b[1] - a[1] * b[0]
  const indep = Math.abs(det) > 1e-6
  const lines: { p: P; q: P }[] = []
  for (let k = -6; k <= 6; k++) {
    lines.push({ p: [a[0] * k - b[0] * 8, a[1] * k - b[1] * 8], q: [a[0] * k + b[0] * 8, a[1] * k + b[1] * 8] })
    lines.push({ p: [b[0] * k - a[0] * 8, b[1] * k - a[1] * 8], q: [b[0] * k + a[0] * 8, b[1] * k + a[1] * 8] })
  }
  return (
    <Fig
      w={560}
      h={340}
      caption={
        <Tex
          block
          tex={`\\det(\\vec a\\ \\vec b)=${r2(det)}\\ \\Rightarrow\\ ${indep ? `\\textcolor{${C.green}}{\\text{一次独立：}\\ s\\vec a+t\\vec b\\ \\text{で平面のすべての点を表せる}}` : `\\textcolor{${C.red}}{\\text{一次従属：1 本の直線しか表せない}}`}`}
        />
      }
    >
      <Axes f={f} />
      {indep && lines.map((l, i) => <line key={i} x1={f.X(l.p[0])} y1={f.Y(l.p[1])} x2={f.X(l.q[0])} y2={f.Y(l.q[1])} stroke="var(--muted)" strokeWidth={0.8} opacity={0.5} />)}
      {!indep && <line x1={f.X(-a[0] * 10)} y1={f.Y(-a[1] * 10)} x2={f.X(a[0] * 10)} y2={f.Y(a[1] * 10)} stroke={C.red} strokeWidth={3} opacity={0.5} />}
      {arrow(f, [0, 0], a, C.blue)}
      {arrow(f, [0, 0], b, C.orange)}
      <TexAt x={f.X(a[0]) + 10} y={f.Y(a[1]) + 12} tex="\vec a" color={C.blue} anchor="start" />
      <TexAt x={f.X(b[0]) + 10} y={f.Y(b[1]) - 10} tex="\vec b" color={C.orange} anchor="start" />
      <MHandle f={f} v={a} set={setA} color={C.blue} />
      <MHandle f={f} v={b} set={setB} color={C.orange} />
    </Fig>
  )
}

/* ---------- 逆関数の微分 ---------- */

export function InverseDerivativeFig() {
  const [x0, setX0] = useFig('x', 0.6)
  const f = (x: number) => Math.exp(x)
  const df = (x: number) => Math.exp(x)
  const F = frame([-2.5, 4], [-2.5, 4], { x: 60, y: 0, w: 380, h: 380 })
  const y0 = f(x0)
  const m = df(x0)
  return (
    <Fig
      w={560}
      h={380}
      controls={<Slider stack name="x" tex="a" value={x0} min={-1.5} max={1.3} step={0.01} onChange={setX0} />}
      caption={
        <Tex
          block
          tex={`\\textcolor{${C.blue}}{y=e^x}\\ \\text{の傾き}\\ ${r2(m, 3)},\\quad \\textcolor{${C.red}}{y=\\log x}\\ \\text{の傾き}\\ \\frac{1}{${r2(m, 3)}}=${r2(1 / m, 3)}\\qquad \\frac{dx}{dy}=\\frac{1}{dy/dx}`}
        />
      }
    >
      <Axes f={F} grid />
      <path d={F.path((x) => x)} stroke="var(--muted)" strokeDasharray="5 4" fill="none" />
      <path d={F.path(f)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      <path d={F.path(Math.log, 0.02, 4)} stroke={C.red} strokeWidth={2.5} fill="none" />
      <path d={F.path((x) => y0 + m * (x - x0))} stroke={C.blue} strokeWidth={1.4} fill="none" />
      <path d={F.path((x) => x0 + (x - y0) / m)} stroke={C.red} strokeWidth={1.4} fill="none" />
      <line x1={F.X(x0)} y1={F.Y(y0)} x2={F.X(y0)} y2={F.Y(x0)} stroke={C.purple} strokeDasharray="3 3" />
      <circle cx={F.X(x0)} cy={F.Y(y0)} r={5} fill={C.blue} />
      <circle cx={F.X(y0)} cy={F.Y(x0)} r={5} fill={C.red} />
      <TexAt x={480} y={60} tex="y=x\ \text{で折り返すと、}" anchor="start" size={12} color="var(--muted)" />
      <TexAt x={480} y={84} tex="\text{傾きは逆数になる}" anchor="start" size={12} color="var(--muted)" />
    </Fig>
  )
}

/* ---------- 曲線の長さ ---------- */

export function ArcLengthFig() {
  const [n, setN] = useFig('n', 4)
  const f = (x: number) => Math.sin(x) + 1.5
  const a = 0
  const b = Math.PI * 1.5
  const F = frame([-0.3, 5], [-0.2, 3], { x: 0, y: 0, w: 560, h: 280 })
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const x = a + ((b - a) * i) / n
    return [x, f(x)] as P
  })
  const L = pts.slice(1).reduce((s, p, i) => s + dist(p, pts[i]), 0)
  // 本当の長さ ∫√(1 + cos²x) dx（シンプソン則）
  const exact = useMemo(() => {
    const N = 400
    const h = (b - a) / N
    let s = 0
    for (let i = 0; i <= N; i++) {
      const v = Math.sqrt(1 + Math.cos(a + i * h) ** 2)
      s += v * (i === 0 || i === N ? 1 : i % 2 ? 4 : 2)
    }
    return (s * h) / 3
  }, [a, b])
  return (
    <Fig
      w={560}
      h={280}
      controls={<Slider stack name="n" tex="n\ (\text{折れ線の本数})" value={n} min={1} max={40} step={1} onChange={setN} />}
      caption={<Tex block tex={`\\sum\\sqrt{\\Delta x^2+\\Delta y^2}=${r2(L, 4)}\\ \\xrightarrow{\\,n\\to\\infty\\,}\\ \\int_0^{3\\pi/2}\\sqrt{1+\\{f'(x)\\}^2}\\,dx=${r2(exact, 4)}`} />}
    >
      <Axes f={F} />
      <path d={F.path(f, a, b)} stroke={C.blue} strokeWidth={6} opacity={0.25} fill="none" />
      <polyline points={pts.map(([x, y]) => `${F.X(x)},${F.Y(y)}`).join(' ')} fill="none" stroke={C.red} strokeWidth={2.2} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={F.X(x)} cy={F.Y(y)} r={n > 20 ? 2 : 3.5} fill={C.red} />
      ))}
    </Fig>
  )
}

/* ---------- 偶関数・奇関数の定積分 ---------- */

const PARITY = [
  { name: '偶関数 x²', f: (x: number) => x * x, even: true },
  { name: '偶関数 cos x', f: (x: number) => Math.cos(x) + 0.0, even: true },
  { name: '奇関数 x³ − x', f: (x: number) => x ** 3 - x, even: false },
  { name: '奇関数 sin x', f: Math.sin, even: false },
]

export function OddEvenIntegralFig() {
  const [k, setK] = useFig('f', 2)
  const [a, setA] = useFig('a', 1.5)
  const P = PARITY[k]
  const F = frame([-3, 3], [-2.5, 3], { x: 0, y: 0, w: 560, h: 290 })
  const N = 300
  const shade = (lo: number, hi: number) => {
    let d = `M${F.X(lo)},${F.Y(0)}`
    for (let i = 0; i <= N; i++) {
      const x = lo + ((hi - lo) * i) / N
      d += ` L${F.X(x)},${F.Y(P.f(x))}`
    }
    return d + ` L${F.X(hi)},${F.Y(0)} Z`
  }
  let s = 0
  const h = (2 * a) / N
  for (let i = 0; i <= N; i++) s += P.f(-a + i * h) * (i === 0 || i === N ? 1 : i % 2 ? 4 : 2)
  const val = (s * h) / 3
  return (
    <Fig
      w={560}
      h={290}
      controls={
        <>
          <div className="chips">
            {PARITY.map((p, i) => (
              <button key={p.name} className={`chip ${i === k ? 'on' : ''}`} onClick={() => setK(i)}>
                {p.name}
              </button>
            ))}
          </div>
          <Slider stack name="a" value={a} min={0.2} max={2.8} step={0.01} onChange={setA} />
        </>
      }
      caption={
        <Tex
          block
          tex={
            P.even
              ? `\\int_{-a}^{a}f(x)\\,dx=2\\int_0^a f(x)\\,dx=${r2(val, 4)}\\quad(\\text{左右が同じ面積})`
              : `\\int_{-a}^{a}f(x)\\,dx=${r2(val, 4)}=0\\quad(\\text{原点について対称なので、正と負が打ち消す})`
          }
        />
      }
    >
      <Axes f={F} grid />
      <path d={shade(-a, 0)} fill={P.even ? C.blue : C.red} opacity={0.25} />
      <path d={shade(0, a)} fill={C.blue} opacity={0.25} />
      <path d={F.path(P.f)} stroke={C.purple} strokeWidth={2.5} fill="none" />
      {[-a, a].map((x) => (
        <line key={x} x1={F.X(x)} x2={F.X(x)} y1={0} y2={290} className="fig-dash" />
      ))}
    </Fig>
  )
}

/* ---------- モンティ・ホール問題 ---------- */

function mulberry(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function MontyHallFig() {
  const [n, setN] = useFig('n', 200)
  const [seed, setSeed] = useFig('seed', 1)
  const res = useMemo(() => {
    const r = mulberry(seed * 104729)
    let stay = 0
    let sw = 0
    const curve: [number, number][] = []
    for (let i = 1; i <= 1000; i++) {
      const car = Math.floor(r() * 3)
      const pick = Math.floor(r() * 3)
      if (pick === car) stay++
      else sw++
      curve.push([stay / i, sw / i])
    }
    return curve
  }, [seed])
  const F = frame([0, n], [0, 1], { x: 40, y: 10, w: 500, h: 230 })
  const line = (k: 0 | 1) => res.slice(0, n).map((p, i) => `${i ? 'L' : 'M'}${F.X(i + 1).toFixed(1)},${F.Y(p[k]).toFixed(1)}`).join('')
  const last = res[n - 1]
  return (
    <Fig
      w={560}
      h={260}
      controls={
        <>
          <Slider stack name="n" tex="n\ (\text{回数})" value={n} min={10} max={1000} step={10} onChange={setN} />
          <div className="chips">
            <button className="chip" onClick={() => setSeed(seed + 1)}>
              もう一度試す
            </button>
          </div>
        </>
      }
      caption={
        <>
          <Tex block tex={`\\textcolor{${C.red}}{\\text{変える}:\\ ${r2(last[1] * 100, 1)}\\%}\\ \\to\\ \\frac23,\\qquad \\textcolor{${C.blue}}{\\text{変えない}:\\ ${r2(last[0] * 100, 1)}\\%}\\ \\to\\ \\frac13`} />
          <span className="hint">3 つの扉の 1 つに当たり。1 つ選ぶと、司会者が残りの外れを 1 つ開ける。最初の選択が外れ（確率 2/3）なら、変えると必ず当たる。</span>
        </>
      }
    >
      {[1 / 3, 2 / 3].map((v) => (
        <line key={v} x1={F.X(0)} x2={F.X(n)} y1={F.Y(v)} y2={F.Y(v)} className="fig-dash" />
      ))}
      <line x1={F.X(0)} x2={F.X(n)} y1={F.Y(0)} y2={F.Y(0)} className="fig-axis" />
      <path d={line(1)} stroke={C.red} strokeWidth={2} fill="none" />
      <path d={line(0)} stroke={C.blue} strokeWidth={2} fill="none" />
      <TexAt x={F.X(0) - 6} y={F.Y(2 / 3)} tex="\tfrac23" anchor="end" size={12} />
      <TexAt x={F.X(0) - 6} y={F.Y(1 / 3)} tex="\tfrac13" anchor="end" size={12} />
    </Fig>
  )
}

/* ---------- ポアソン分布 ---------- */

export function PoissonFig() {
  const [lam, setLam] = useFig('l', 3)
  const [n, setN] = useFig('n', 30)
  const K = 16
  const fact = (m: number): number => (m <= 1 ? 1 : m * fact(m - 1))
  const pois = Array.from({ length: K }, (_, k) => (Math.exp(-lam) * lam ** k) / fact(k))
  const p = Math.min(1, lam / n)
  const comb = (a: number, b: number) => {
    let r = 1
    for (let i = 1; i <= b; i++) r = (r * (a - b + i)) / i
    return r
  }
  const bin = Array.from({ length: K }, (_, k) => (k <= n ? comb(n, k) * p ** k * (1 - p) ** (n - k) : 0))
  const top = Math.max(...pois, ...bin) * 1.15
  const F = frame([-0.7, K - 0.3], [0, top], { x: 20, y: 10, w: 520, h: 230 })
  const w = (F.X(1) - F.X(0)) * 0.36
  return (
    <Fig
      w={560}
      h={270}
      controls={
        <>
          <Slider stack name="l" tex="\lambda\ (\text{平均})" value={lam} min={0.5} max={8} step={0.1} onChange={setLam} />
          <Slider stack name="n" tex="n\ (\text{二項分布の回数})" value={n} min={8} max={200} step={1} onChange={setN} />
        </>
      }
      caption={<Tex block tex={`\\textcolor{${C.blue}}{P(X=k)=e^{-\\lambda}\\frac{\\lambda^k}{k!}}\\quad\\approx\\quad \\textcolor{${C.orange}}{{}_{n}\\mathrm{C}_k\\,p^k(1-p)^{n-k}}\\ \\ (p=\\lambda/n=${r2(p, 4)})`} />}
    >
      <line x1={F.box.x} x2={F.box.x + F.box.w} y1={F.Y(0)} y2={F.Y(0)} className="fig-axis" />
      {pois.map((v, k) => (
        <g key={k}>
          <rect x={F.X(k) - w} y={F.Y(v)} width={w} height={F.Y(0) - F.Y(v)} fill={C.blue} opacity={0.75} />
          <rect x={F.X(k)} y={F.Y(bin[k])} width={w} height={F.Y(0) - F.Y(bin[k])} fill={C.orange} opacity={0.75} />
          <TexAt x={F.X(k)} y={F.Y(0) + 13} tex={`${k}`} size={11} color="var(--muted)" />
        </g>
      ))}
    </Fig>
  )
}

/* ---------- 合同式の性質（時計の算数） ---------- */

export function ModArithmeticFig() {
  const [m, setM] = useFig('m', 7)
  const [a, setA] = useFig('a', 5)
  const [b, setB] = useFig('b', 4)
  const cx = 170
  const cy = 165
  const R = 120
  const pos = (k: number): P => [cx + R * Math.sin((2 * Math.PI * k) / m), cy - R * Math.cos((2 * Math.PI * k) / m)]
  const sum = (a + b) % m
  const prod = (a * b) % m
  return (
    <Fig
      w={560}
      h={330}
      controls={
        <>
          <Slider stack name="m" tex="m\ (\text{法})" value={m} min={2} max={12} step={1} onChange={setM} />
          <Slider stack name="a" value={a} min={0} max={30} step={1} onChange={setA} />
          <Slider stack name="b" value={b} min={0} max={30} step={1} onChange={setB} />
        </>
      }
      caption={
        <Tex
          block
          tex={`${a}\\equiv${a % m},\\ ${b}\\equiv${b % m}\\pmod{${m}}\\ \\Rightarrow\\ \\textcolor{${C.green}}{${a}+${b}\\equiv${a % m}+${b % m}\\equiv${sum}},\\quad \\textcolor{${C.red}}{${a}\\times${b}\\equiv${a % m}\\times${b % m}\\equiv${prod}}`}
        />
      }
    >
      <circle cx={cx} cy={cy} r={R} className="fig-thin" />
      {Array.from({ length: m }, (_, k) => {
        const [x, y] = pos(k)
        const hit = k === sum || k === prod || k === a % m || k === b % m
        return (
          <g key={k}>
            <circle cx={x} cy={y} r={hit ? 10 : 6} fill={k === sum ? C.green : k === prod ? C.red : k === a % m || k === b % m ? C.blue : 'var(--muted)'} opacity={hit ? 1 : 0.5} />
            <TexAt x={cx + (R + 22) * Math.sin((2 * Math.PI * k) / m)} y={cy - (R + 22) * Math.cos((2 * Math.PI * k) / m)} tex={`${k}`} size={12} />
          </g>
        )
      })}
      <TexAt x={340} y={110} tex={`\\textcolor{${C.blue}}{\\text{青}}:\\ a, b\\ \\text{の余り}`} anchor="start" size={13} />
      <TexAt x={340} y={140} tex={`\\textcolor{${C.green}}{\\text{緑}}:\\ \\text{和の余り}`} anchor="start" size={13} />
      <TexAt x={340} y={170} tex={`\\textcolor{${C.red}}{\\text{赤}}:\\ \\text{積の余り}`} anchor="start" size={13} />
    </Fig>
  )
}

/* ---------- ウィルソンの定理 ---------- */

const W_PRIMES = [5, 7, 11, 13, 17, 19]

export function WilsonFig() {
  const [p, setP] = useFig('p', 11)
  const cx = 280
  const cy = 170
  const R = 130
  const pos = (k: number): P => [cx + R * Math.sin((2 * Math.PI * k) / p), cy - R * Math.cos((2 * Math.PI * k) / p)]
  // k と、k × k' ≡ 1 となる k'（逆元）を線で結ぶ。1 と p − 1 だけが自分自身と組になる
  const inv = (k: number) => {
    for (let j = 1; j < p; j++) if ((k * j) % p === 1) return j
    return 0
  }
  const pairs: [number, number][] = []
  for (let k = 2; k < p - 1; k++) if (k < inv(k)) pairs.push([k, inv(k)])
  return (
    <Fig
      w={560}
      h={340}
      controls={
        <div className="chips">
          {W_PRIMES.map((q) => (
            <button key={q} className={`chip ${q === p ? 'on' : ''}`} onClick={() => setP(q)}>
              p = {q}
            </button>
          ))}
        </div>
      }
      caption={
        <>
          <Tex block tex={`(${p}-1)!=${Array.from({ length: p - 1 }, (_, i) => i + 1).join('\\cdot')}\\equiv\\textcolor{${C.red}}{-1}\\pmod{${p}}`} />
          <span className="hint">2 から p − 2 までは、掛けて 1 になる相手（線で結んだ数）と組になって消える。残るのは 1 × (p − 1) ≡ −1。</span>
        </>
      }
    >
      <circle cx={cx} cy={cy} r={R} className="fig-thin" />
      {pairs.map(([a, b], i) => {
        const [x1, y1] = pos(a)
        const [x2, y2] = pos(b)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={SERIES[i % SERIES.length]} strokeWidth={2.5} />
      })}
      {Array.from({ length: p - 1 }, (_, i) => {
        const k = i + 1
        const [x, y] = pos(k)
        const self = k === 1 || k === p - 1
        return (
          <g key={k}>
            <circle cx={x} cy={y} r={8} fill={self ? C.red : 'var(--surface-2)'} stroke={self ? C.red : 'var(--muted)'} />
            <TexAt x={cx + (R + 22) * Math.sin((2 * Math.PI * k) / p)} y={cy - (R + 22) * Math.cos((2 * Math.PI * k) / p)} tex={`${k}`} size={12} color={self ? C.red : undefined} />
          </g>
        )
      })}
    </Fig>
  )
}

/* ---------- 平均の大小関係 ---------- */

export function PowerMeanFig() {
  const [a, setA] = useFig('a', 1.2)
  const [b, setB] = useFig('b', 4)
  const S = 50
  const cx = 60 + ((a + b) / 2) * S
  const base = 290
  const AM = (a + b) / 2
  const GM = Math.sqrt(a * b)
  const HM = (2 * a * b) / (a + b)
  const QM = Math.sqrt((a * a + b * b) / 2)
  const D: P = [60 + a * S, base] // 直径の上で、a と b の境目
  const top: P = [D[0], base - GM * S]
  const O: P = [cx, base]
  const bars: [string, number, string][] = [
    ['調和', HM, C.purple],
    ['相乗', GM, C.green],
    ['相加', AM, C.blue],
    ['二乗', QM, C.red],
  ]
  return (
    <Fig
      w={560}
      h={320}
      controls={
        <>
          <Slider stack name="a" value={a} min={0.2} max={5} step={0.05} onChange={setA} />
          <Slider stack name="b" value={b} min={0.2} max={5} step={0.05} onChange={setB} />
        </>
      }
      caption={
        <Tex
          block
          tex={`\\textcolor{${C.purple}}{\\frac{2ab}{a+b}=${r2(HM)}}\\le\\textcolor{${C.green}}{\\sqrt{ab}=${r2(GM)}}\\le\\textcolor{${C.blue}}{\\frac{a+b}{2}=${r2(AM)}}\\le\\textcolor{${C.red}}{\\sqrt{\\frac{a^2+b^2}{2}}=${r2(QM)}}`}
        />
      }
    >
      <path d={`M${60},${base} A${AM * S},${AM * S} 0 0 1 ${60 + (a + b) * S},${base}`} className="fig-thin" />
      <line x1={60} x2={60 + (a + b) * S} y1={base} y2={base} stroke="currentColor" strokeWidth={2} />
      <line x1={O[0]} y1={O[1]} x2={O[0]} y2={base - AM * S} stroke={C.blue} strokeWidth={3} />
      <line x1={top[0]} y1={top[1]} x2={D[0]} y2={D[1]} stroke={C.green} strokeWidth={3} />
      <line x1={O[0]} y1={O[1]} x2={top[0]} y2={top[1]} stroke="var(--muted)" strokeDasharray="4 3" />
      <TexAt x={60 + (a * S) / 2} y={base + 16} tex="a" size={13} />
      <TexAt x={60 + a * S + (b * S) / 2} y={base + 16} tex="b" size={13} />
      {bars.map(([l, v, col], i) => (
        <g key={l}>
          <rect x={430 + i * 30} y={base - v * S * 0.55} width={22} height={v * S * 0.55} fill={col} opacity={0.75} />
          <TexAt x={441 + i * 30} y={base + 14} tex={`\\text{${l}}`} size={10} color={col} />
        </g>
      ))}
    </Fig>
  )
}

/* ---------- 複素数平面の円と垂直二等分線 ---------- */

export function ComplexLocusFig() {
  const [al, setAl] = useFig<P>('a', [-1, 0.5])
  const [be, setBe] = useFig<P>('b', [1.5, -0.5])
  const [r, setR] = useFig('r', 1.2)
  const f = frame([-3.5, 3.5], [-2.2, 2.2], { x: 0, y: 0, w: 560, h: 350 })
  const M: P = [(al[0] + be[0]) / 2, (al[1] + be[1]) / 2]
  const d: P = [-(be[1] - al[1]), be[0] - al[0]]
  return (
    <Fig
      w={560}
      h={350}
      controls={<Slider stack name="r" value={r} min={0.2} max={2.5} step={0.05} onChange={setR} />}
      caption={
        <Tex
          block
          tex={`\\textcolor{${C.blue}}{|z-\\alpha|=${r2(r)}}:\\ \\alpha\\ \\text{が中心の円},\\qquad \\textcolor{${C.red}}{|z-\\alpha|=|z-\\beta|}:\\ \\alpha, \\beta\\ \\text{を結ぶ線分の垂直二等分線}`}
        />
      }
    >
      <Axes f={f} grid step={0.5} />
      <circle cx={f.X(al[0])} cy={f.Y(al[1])} r={f.X(r) - f.X(0)} fill={C.blue} fillOpacity={0.08} stroke={C.blue} strokeWidth={2.2} />
      <line x1={f.X(M[0] - d[0] * 8)} y1={f.Y(M[1] - d[1] * 8)} x2={f.X(M[0] + d[0] * 8)} y2={f.Y(M[1] + d[1] * 8)} stroke={C.red} strokeWidth={2.2} />
      <line x1={f.X(al[0])} y1={f.Y(al[1])} x2={f.X(be[0])} y2={f.Y(be[1])} className="fig-dash" />
      <TexAt x={f.X(al[0]) - 10} y={f.Y(al[1]) - 14} tex="\alpha" color={C.blue} anchor="end" />
      <TexAt x={f.X(be[0]) + 10} y={f.Y(be[1]) - 14} tex="\beta" color={C.red} anchor="start" />
      <MHandle f={f} v={al} set={setAl} color={C.blue} />
      <MHandle f={f} v={be} set={setBe} color={C.red} />
    </Fig>
  )
}

/* ---------- 倍数の判定法 ---------- */

export function DivisibilityFig() {
  const [n, setN] = useFig('n', 7425)
  const digits = String(n).split('').map(Number)
  const sum = digits.reduce((s, d) => s + d, 0)
  const alt = digits.reverse().reduce((s, d, i) => s + (i % 2 ? -d : d), 0)
  const rows: [string, boolean, string][] = [
    ['2', n % 2 === 0, `\\text{一の位}\\ ${n % 10}\\ \\text{が偶数}`],
    ['3', n % 3 === 0, `\\text{各位の和}\\ ${sum}\\ \\text{が 3 の倍数}`],
    ['4', n % 4 === 0, `\\text{下 2 桁}\\ ${n % 100}\\ \\text{が 4 の倍数}`],
    ['5', n % 5 === 0, `\\text{一の位が 0 か 5}`],
    ['9', n % 9 === 0, `\\text{各位の和}\\ ${sum}\\ \\text{が 9 の倍数}`],
    ['11', n % 11 === 0, `\\text{交互の和}\\ ${alt}\\ \\text{が 11 の倍数}`],
  ]
  return (
    <Fig
      w={560}
      h={290}
      controls={<Slider stack name="n" value={n} min={10} max={99999} step={1} onChange={setN} />}
      caption={<span className="hint">10 ≡ 1 (mod 9) なので、各位の数を足しても 9 で割った余りは変わらない。10 ≡ −1 (mod 11) なので、11 は交互に足し引きする。</span>}
    >
      <TexAt x={280} y={30} tex={`n=${n}`} size={22} />
      {rows.map(([k, ok, why], i) => (
        <g key={k}>
          <rect x={40} y={60 + i * 36} width={480} height={30} rx={8} fill={ok ? C.green : 'var(--surface-2)'} opacity={ok ? 0.2 : 1} />
          <TexAt x={60} y={75 + i * 36} tex={`${k}\\ \\text{の倍数}`} anchor="start" size={14} />
          <TexAt x={170} y={75 + i * 36} tex={why} anchor="start" size={13} color="var(--muted)" />
          <TexAt x={500} y={75 + i * 36} tex={ok ? '\\checkmark' : '\\times'} anchor="end" size={16} color={ok ? C.green : 'var(--muted)'} />
        </g>
      ))}
    </Fig>
  )
}
