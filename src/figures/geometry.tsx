import { Slider } from '../components/Slider'
import { Tex } from '../components/Tex'
import { AngleArc, Fig, Handle, TexAt } from './common'
import { C, angleBetween, clamp, deg, fitBox, r2 } from './util'
import { useFig } from './state'

type P = [number, number]
const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1])
const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const mid = (a: P, b: P) => lerp(a, b, 0.5)
const poly = (...ps: P[]) => ps.map((p) => p.join(',')).join(' ')
const angleAt = (v: P, p: P, q: P) => angleBetween(p[0] - v[0], p[1] - v[1], q[0] - v[0], q[1] - v[1])

/* ---------- 三平方の定理 ---------- */

export function PythagorasFig() {
  const [a, setA] = useFig('a', 3)
  const [b, setB] = useFig('b', 4)
  const S = 40
  const Cc: P = [0, 0]
  const A: P = [Cc[0], Cc[1] - b * S]
  const B: P = [Cc[0] + a * S, Cc[1]]
  const n: P = [b * S, -a * S] // AB の外向き法線
  const c = Math.hypot(a, b)
  const vb = fitBox([A, B, [B[0], B[1] + a * S], [A[0] - b * S, A[1]], [B[0] + n[0], B[1] + n[1]], [A[0] + n[0], A[1] + n[1]]], 30, 560)
  return (
    <Fig
      w={560}
      h={500}
      vb={vb}
      controls={
        <>
          <Slider stack name="a" value={a} min={1} max={5} step={0.1} onChange={setA} />
          <Slider stack name="b" value={b} min={1} max={5} step={0.1} onChange={setB} />
        </>
      }
      caption={
        <Tex block tex={`\\textcolor{${C.blue}}{a^2}+\\textcolor{${C.red}}{b^2}=${r2(a * a)}+${r2(b * b)}=\\textcolor{${C.green}}{${r2(c * c)}}=c^2`} />
      }
    >
      <polygon points={poly(Cc, B, [B[0], B[1] + a * S], [Cc[0], Cc[1] + a * S])} fill={C.blue} opacity={0.3} stroke={C.blue} />
      <polygon points={poly([A[0] - b * S, A[1]], A, Cc, [Cc[0] - b * S, Cc[1]])} fill={C.red} opacity={0.3} stroke={C.red} />
      <polygon points={poly(A, B, [B[0] + n[0], B[1] + n[1]], [A[0] + n[0], A[1] + n[1]])} fill={C.green} opacity={0.3} stroke={C.green} />
      <polygon points={poly(A, B, Cc)} fill="var(--surface)" stroke="currentColor" strokeWidth={2.5} />
      <polyline points={poly([Cc[0], Cc[1] - 12], [Cc[0] + 12, Cc[1] - 12], [Cc[0] + 12, Cc[1]])} className="fig-thin" />
      <TexAt x={Cc[0] + (a * S) / 2} y={Cc[1] + (a * S) / 2} tex={`a^2=${r2(a * a)}`} color={C.blue} />
      <TexAt x={Cc[0] - (b * S) / 2} y={Cc[1] - (b * S) / 2} tex={`b^2=${r2(b * b)}`} color={C.red} />
      <TexAt x={(A[0] + B[0] + n[0]) / 2} y={(A[1] + B[1] + n[1]) / 2} tex={`c^2=${r2(c * c)}`} color={C.green} />
      <TexAt x={Cc[0] + (a * S) / 2} y={Cc[1] - 12} tex="a" />
      <TexAt x={Cc[0] - 10} y={Cc[1] - (b * S) / 2} tex="b" anchor="end" />
      <TexAt x={(A[0] + B[0]) / 2 - 8} y={(A[1] + B[1]) / 2 - 10} tex="c" anchor="end" />
    </Fig>
  )
}

/* ---------- 余弦定理 ---------- */

export function LawOfCosinesFig() {
  const [b, setB] = useFig('b', 3)
  const [c, setC] = useFig('c', 4.5)
  const [A, setAng] = useFig('A', 60)
  const S = 45
  const t = (A * Math.PI) / 180
  const pA: P = [0, 0]
  const pB: P = [pA[0] + c * S, pA[1]]
  const pC: P = [pA[0] + b * S * Math.cos(t), pA[1] - b * S * Math.sin(t)]
  const H: P = [pC[0], pA[1]]
  const a = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(t))
  const bc = b * Math.cos(t)
  const vb = fitBox([pA, pB, pC, [H[0], H[1] + 60]], 40, 560)
  return (
    <Fig
      w={560}
      h={350}
      vb={vb}
      controls={
        <>
          <Slider stack name="b" value={b} min={1} max={5} step={0.1} onChange={setB} />
          <Slider stack name="c" value={c} min={1} max={5} step={0.1} onChange={setC} />
          <Slider stack name="A" tex="A\ (^\circ)" value={A} min={5} max={175} step={1} onChange={setAng} />
        </>
      }
      caption={
        <>
          <Tex
            block
            tex={`a^2=(\\textcolor{${C.orange}}{c-b\\cos A})^2+(\\textcolor{${C.purple}}{b\\sin A})^2=b^2+c^2-2bc\\cos A=${r2(a * a)}`}
          />
          <span className="hint">C から AB（の延長）に垂線を下ろすと直角三角形ができ、三平方の定理から導ける。A が鈍角なら cos A &lt; 0 で、a は三平方の場合より長くなる。</span>
        </>
      }
    >
      {(H[0] < Math.min(pA[0], pB[0]) || H[0] > Math.max(pA[0], pB[0])) && (
        <line x1={H[0]} y1={H[1]} x2={H[0] < pA[0] ? pA[0] : pB[0]} y2={pA[1]} className="fig-dash" />
      )}
      <line x1={pC[0]} y1={pC[1]} x2={H[0]} y2={H[1]} stroke={C.purple} strokeWidth={2} strokeDasharray="5 4" />
      <line x1={H[0]} y1={H[1] + 36} x2={pB[0]} y2={pB[1] + 36} stroke={C.orange} strokeWidth={3} />
      <polygon points={poly(pA, pB, pC)} fill={C.blue} fillOpacity={0.08} stroke="currentColor" strokeWidth={2.5} />
      <AngleArc v={pA} p={pB} q={pC} r={26} color={C.red} label="A" />
      <TexAt x={pA[0] - 10} y={pA[1] + 14} tex="A" anchor="end" />
      <TexAt x={pB[0] + 10} y={pB[1] + 14} tex="B" anchor="start" />
      <TexAt x={pC[0]} y={pC[1] - 16} tex="C" />
      <TexAt x={(pA[0] + pB[0]) / 2} y={pA[1] + 16} tex={`c=${r2(c, 1)}`} size={13} />
      <TexAt x={(pA[0] + pC[0]) / 2 - 12} y={(pA[1] + pC[1]) / 2} tex={`b=${r2(b, 1)}`} anchor="end" />
      <TexAt x={(pB[0] + pC[0]) / 2 + 12} y={(pB[1] + pC[1]) / 2} tex={`a=${r2(a)}`} color={C.green} anchor="start" />
      <TexAt x={pC[0] + 6} y={(pC[1] + H[1]) / 2} tex="b\sin A" color={C.purple} anchor="start" size={13} />
      <TexAt x={(H[0] + pB[0]) / 2} y={H[1] + 52} tex={`c-b\\cos A=${r2(c - bc)}`} color={C.orange} size={13} />
    </Fig>
  )
}

/* ---------- 正弦定理 ---------- */

export function LawOfSinesFig() {
  const [ang, setAng] = useFig('ang', [110, 215, 330])
  const O: P = [220, 200]
  const R = 160
  const pt = (d: number): P => [O[0] + R * Math.cos((d * Math.PI) / 180), O[1] - R * Math.sin((d * Math.PI) / 180)]
  const [pA, pB, pC] = ang.map(pt)
  const Bp: P = [2 * O[0] - pB[0], 2 * O[1] - pB[1]]
  const a = dist(pB, pC) / R
  const b = dist(pA, pC) / R
  const c = dist(pA, pB) / R
  const A = angleAt(pA, pB, pC)
  const B = angleAt(pB, pA, pC)
  const Cg = angleAt(pC, pA, pB)
  const move = (i: number) => (x: number, y: number) => {
    const d = (Math.atan2(O[1] - y, x - O[0]) * 180) / Math.PI
    setAng(ang.map((v, j) => (j === i ? d : v)))
  }
  return (
    <Fig
      w={600}
      h={400}
      caption={
        <>
          <Tex
            block
            tex={`\\frac{a}{\\sin A}=${r2(a / Math.sin(A))},\\quad \\frac{b}{\\sin B}=${r2(b / Math.sin(B))},\\quad \\frac{c}{\\sin C}=${r2(c / Math.sin(Cg))},\\quad 2R=2`}
          />
          <span className="hint">
            頂点をドラッグできる。B から直径 BB′ を引くと、∠B′ は ∠A と同じ弧 BC に対する円周角なので等しく、∠BCB′ = 90°。だから a = 2R sin A。
          </span>
        </>
      }
    >
      <circle cx={O[0]} cy={O[1]} r={R} className="fig-thin" />
      <line x1={pB[0]} y1={pB[1]} x2={Bp[0]} y2={Bp[1]} className="fig-dash" />
      <polyline points={poly(pB, Bp, pC)} fill="none" stroke={C.purple} strokeWidth={1.5} strokeDasharray="5 4" />
      <AngleArc v={Bp} p={pB} q={pC} r={22} color={C.purple} label="A" />
      <polygon points={poly(pA, pB, pC)} fill={C.blue} fillOpacity={0.08} stroke="currentColor" strokeWidth={2.5} />
      <line x1={pB[0]} y1={pB[1]} x2={pC[0]} y2={pC[1]} stroke={C.red} strokeWidth={3.5} />
      <AngleArc v={pA} p={pB} q={pC} r={24} color={C.red} label="A" />
      <circle cx={O[0]} cy={O[1]} r={3} fill="var(--muted)" />
      <TexAt x={O[0] + 8} y={O[1] - 10} tex="O" anchor="start" size={13} color="var(--muted)" />
      <TexAt x={Bp[0] + (Bp[0] - O[0]) * 0.12} y={Bp[1] + (Bp[1] - O[1]) * 0.12} tex="B'" color={C.purple} />
      {(['A', 'B', 'C'] as const).map((l, i) => {
        const p = [pA, pB, pC][i]
        return <TexAt key={l} x={p[0] + (p[0] - O[0]) * 0.14} y={p[1] + (p[1] - O[1]) * 0.14} tex={l} />
      })}
      <TexAt x={(pB[0] + pC[0]) / 2 + (mid(pB, pC)[0] - O[0]) * 0.15} y={(pB[1] + pC[1]) / 2 + (mid(pB, pC)[1] - O[1]) * 0.15} tex="a" color={C.red} />
      <Handle x={pA[0]} y={pA[1]} onMove={move(0)} />
      <Handle x={pB[0]} y={pB[1]} onMove={move(1)} />
      <Handle x={pC[0]} y={pC[1]} onMove={move(2)} />
      <TexAt x={480} y={60} tex={`\\angle A=${r2(deg(A), 1)}^\\circ`} color={C.red} anchor="start" />
      <TexAt x={480} y={90} tex={`\\angle B'=${r2(deg(angleAt(Bp, pB, pC)), 1)}^\\circ`} color={C.purple} anchor="start" />
    </Fig>
  )
}

/* ---------- 円周角の定理 ---------- */

export function InscribedAngleFig() {
  const [ang, setAng] = useFig('ang', [200, 340, 90])
  const O: P = [240, 200]
  const R = 160
  const pt = (d: number): P => [O[0] + R * Math.cos((d * Math.PI) / 180), O[1] - R * Math.sin((d * Math.PI) / 180)]
  const [pA, pB, pP] = ang.map(pt)
  const move = (i: number) => (x: number, y: number) => {
    const d = (Math.atan2(O[1] - y, x - O[0]) * 180) / Math.PI
    setAng(ang.map((v, j) => (j === i ? d : v)))
  }
  const inscribed = deg(angleAt(pP, pA, pB))
  // 弧 AB（P を含まない側）の中心角
  const norm = (d: number) => ((d % 360) + 360) % 360
  const arcAB = norm(ang[1] - ang[0])
  const pOn = norm(ang[2] - ang[0]) < arcAB
  const central = pOn ? 360 - arcAB : arcAB
  // 中心角の扇形（P を含まない弧の側）
  const start = pOn ? ang[1] : ang[0]
  const sweep = central
  const big = sweep > 180 ? 1 : 0
  const s = pt(start)
  const e = pt(start + sweep)
  return (
    <Fig
      w={560}
      h={400}
      caption={
        <Tex
          block
          tex={`\\textcolor{${C.red}}{\\angle APB=${r2(inscribed, 1)}^\\circ}=\\frac12\\times\\textcolor{${C.blue}}{${r2(central, 1)}^\\circ}`}
        />
      }
    >
      <circle cx={O[0]} cy={O[1]} r={R} className="fig-thin" />
      <path d={`M${O[0]},${O[1]} L${s[0]},${s[1]} A${R},${R} 0 ${big} 0 ${e[0]},${e[1]} Z`} fill={C.blue} opacity={0.12} />
      <path d={`M${s[0]},${s[1]} A${R},${R} 0 ${big} 0 ${e[0]},${e[1]}`} fill="none" stroke={C.blue} strokeWidth={4} />
      <polyline points={poly(pA, O, pB)} fill="none" stroke={C.blue} strokeWidth={2} />
      <polyline points={poly(pA, pP, pB)} fill="none" stroke={C.red} strokeWidth={2.5} />
      <AngleArc v={pP} p={pA} q={pB} r={28} color={C.red} />
      <AngleArc v={O} p={pA} q={pB} r={22} color={C.blue} />
      <TexAt x={pA[0] + (pA[0] - O[0]) * 0.12} y={pA[1] + (pA[1] - O[1]) * 0.12} tex="A" />
      <TexAt x={pB[0] + (pB[0] - O[0]) * 0.12} y={pB[1] + (pB[1] - O[1]) * 0.12} tex="B" />
      <TexAt x={pP[0] + (pP[0] - O[0]) * 0.12} y={pP[1] + (pP[1] - O[1]) * 0.12} tex="P" color={C.red} />
      <TexAt x={O[0] + 14} y={O[1] + 4} tex="O" anchor="start" size={13} color={C.blue} />
      <Handle x={pA[0]} y={pA[1]} onMove={move(0)} />
      <Handle x={pB[0]} y={pB[1]} onMove={move(1)} />
      <Handle x={pP[0]} y={pP[1]} onMove={move(2)} color={C.red} />
      <text x={420} y={370} className="fig-muted">P を動かしても角は変わらない</text>
    </Fig>
  )
}

/* ---------- 方べきの定理 ---------- */

export function PowerOfPointFig() {
  const [P0, setP] = useFig<P>('P0', [100, 150])
  const [t1, setT1] = useFig('t1', 4)
  const [t2, setT2] = useFig('t2', 26)
  const O: P = [340, 210]
  const R = 120
  const pow = (P0[0] - O[0]) ** 2 + (P0[1] - O[1]) ** 2 - R * R
  const cut = (th: number) => {
    const u: P = [Math.cos((th * Math.PI) / 180), Math.sin((th * Math.PI) / 180)]
    const w: P = [P0[0] - O[0], P0[1] - O[1]]
    const bb = u[0] * w[0] + u[1] * w[1]
    const D = bb * bb - pow
    if (D < 0) return { miss: true as const, ext: [[P0[0] - u[0] * 40, P0[1] - u[1] * 40], [P0[0] + u[0] * 600, P0[1] + u[1] * 600]] as P[] }
    const s1 = -bb - Math.sqrt(D)
    const s2 = -bb + Math.sqrt(D)
    const at = (s: number): P => [P0[0] + u[0] * s, P0[1] + u[1] * s]
    return { miss: false as const, A: at(s1), B: at(s2), la: Math.abs(s1), lb: Math.abs(s2), ext: [at(Math.min(s1, s2, 0) - 30), at(Math.max(s1, s2, 0) + 30)] as P[] }
  }
  const lines = [cut(t1), cut(t2)]
  const sc = (v: number) => r2(v / 40, 2)
  return (
    <Fig
      w={560}
      h={400}
      controls={
        <>
          <Slider stack name="t1" tex="\theta_1" value={t1} min={-90} max={90} step={1} onChange={setT1} />
          <Slider stack name="t2" tex="\theta_2" value={t2} min={-90} max={90} step={1} onChange={setT2} />
        </>
      }
      caption={
        <>
          <Tex
            block
            tex={lines
              .map((l, i) => (!l.miss ? `\\textcolor{${i ? C.blue : C.red}}{${i ? 'PC\\cdot PD' : 'PA\\cdot PB'}=${sc(l.la)}\\times${sc(l.lb)}=${r2((l.la * l.lb) / 1600)}}` : ''))
              .filter(Boolean)
              .join('\\qquad')}
          />
          <span className="hint">点 P をドラッグできる（円の内側でも成り立つ）。積はいつも |OP² − r²| に等しい。</span>
        </>
      }
    >
      <circle cx={O[0]} cy={O[1]} r={R} className="fig-thin" />
      {lines.map((l, i) =>
        l.miss ? (
          <line key={i} x1={l.ext[0][0]} y1={l.ext[0][1]} x2={l.ext[1][0]} y2={l.ext[1][1]} stroke={i ? C.blue : C.red} strokeWidth={1.2} strokeDasharray="4 4" opacity={0.6} />
        ) : (
          <g key={i}>
            <line x1={l.ext[0][0]} y1={l.ext[0][1]} x2={l.ext[1][0]} y2={l.ext[1][1]} stroke={i ? C.blue : C.red} strokeWidth={1.2} opacity={0.5} />
            <line x1={P0[0]} y1={P0[1]} x2={l.A[0]} y2={l.A[1]} stroke={i ? C.blue : C.red} strokeWidth={4} opacity={0.5} />
            <line x1={P0[0]} y1={P0[1]} x2={l.B[0]} y2={l.B[1]} stroke={i ? C.blue : C.red} strokeWidth={2} />
            <circle cx={l.A[0]} cy={l.A[1]} r={4} fill={i ? C.blue : C.red} />
            <circle cx={l.B[0]} cy={l.B[1]} r={4} fill={i ? C.blue : C.red} />
            <TexAt x={l.A[0] + 4} y={l.A[1] - 14} tex={i ? 'C' : 'A'} color={i ? C.blue : C.red} anchor="start" size={13} />
            <TexAt x={l.B[0] + 4} y={l.B[1] - 14} tex={i ? 'D' : 'B'} color={i ? C.blue : C.red} anchor="start" size={13} />
          </g>
        ),
      )}
      <circle cx={O[0]} cy={O[1]} r={3} fill="var(--muted)" />
      <TexAt x={P0[0] - 10} y={P0[1] - 12} tex="P" anchor="end" />
      <Handle x={P0[0]} y={P0[1]} onMove={(x, y) => setP([clamp(x, 10, 550), clamp(y, 10, 390)])} />
    </Fig>
  )
}

/* ---------- 角の二等分線の定理 ---------- */

export function AngleBisectorFig() {
  const [pts, setPts] = useFig<P[]>('pts', [[200, 60], [60, 330], [500, 330]])
  const [A, B, Cc] = pts
  const ab = dist(A, B)
  const ac = dist(A, Cc)
  const D = lerp(B, Cc, ab / (ab + ac))
  const set = (i: number) => (x: number, y: number) => setPts(pts.map((p, j) => (j === i ? [clamp(x, 10, 550), clamp(y, 10, 370)] : p)))
  const sc = (v: number) => r2(v / 50, 2)
  return (
    <Fig
      w={560}
      h={380}
      caption={
        <Tex
          block
          tex={`\\textcolor{${C.red}}{BD}:\\textcolor{${C.blue}}{DC}=${sc(dist(B, D))}:${sc(dist(D, Cc))}=${r2(dist(B, D) / dist(D, Cc), 3)},\\qquad \\textcolor{${C.red}}{AB}:\\textcolor{${C.blue}}{AC}=${sc(ab)}:${sc(ac)}=${r2(ab / ac, 3)}`}
        />
      }
    >
      <polygon points={poly(A, B, Cc)} fill={C.blue} fillOpacity={0.05} stroke="currentColor" strokeWidth={1.5} />
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={C.red} strokeWidth={3} />
      <line x1={A[0]} y1={A[1]} x2={Cc[0]} y2={Cc[1]} stroke={C.blue} strokeWidth={3} />
      <line x1={B[0]} y1={B[1] + 8} x2={D[0]} y2={D[1] + 8} stroke={C.red} strokeWidth={3} />
      <line x1={D[0]} y1={D[1] + 8} x2={Cc[0]} y2={Cc[1] + 8} stroke={C.blue} strokeWidth={3} />
      <line x1={A[0]} y1={A[1]} x2={D[0]} y2={D[1]} stroke={C.green} strokeWidth={2} strokeDasharray="6 4" />
      <AngleArc v={A} p={B} q={D} r={30} color={C.green} label="\circ" />
      <AngleArc v={A} p={D} q={Cc} r={36} color={C.green} label="\circ" />
      <TexAt x={A[0]} y={A[1] - 22} tex="A" />
      <TexAt x={B[0] - 14} y={B[1] + 4} tex="B" anchor="end" />
      <TexAt x={Cc[0] + 14} y={Cc[1] + 4} tex="C" anchor="start" />
      <TexAt x={D[0]} y={D[1] + 28} tex="D" color={C.green} />
      {pts.map((p, i) => (
        <Handle key={i} x={p[0]} y={p[1]} onMove={set(i)} />
      ))}
    </Fig>
  )
}

/* ---------- チェバの定理 ---------- */

export function CevaFig() {
  const A: P = [260, 40]
  const B: P = [50, 360]
  const Cc: P = [520, 360]
  const [Pp, setP] = useFig<P>('Pp', [280, 250])
  // 重心座標（面積比）
  const area = (p: P, q: P, r: P) => Math.abs((q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1])) / 2
  const T = area(A, B, Cc)
  const al = area(Pp, B, Cc) / T
  const be = area(A, Pp, Cc) / T
  const ga = area(A, B, Pp) / T
  const D = lerp(B, Cc, ga / (be + ga))
  const E = lerp(Cc, A, al / (ga + al))
  const F = lerp(A, B, be / (al + be))
  const inside = (x: number, y: number) => {
    const q: P = [x, y]
    const s = area(q, B, Cc) + area(A, q, Cc) + area(A, B, q)
    return Math.abs(s - T) < 1
  }
  const r1 = dist(A, F) / dist(F, B)
  const r2_ = dist(B, D) / dist(D, Cc)
  const r3 = dist(Cc, E) / dist(E, A)
  return (
    <Fig
      w={570}
      h={390}
      caption={
        <>
          <Tex
            block
            tex={`\\textcolor{${C.red}}{\\frac{AF}{FB}}\\cdot\\textcolor{${C.blue}}{\\frac{BD}{DC}}\\cdot\\textcolor{${C.green}}{\\frac{CE}{EA}}=${r2(r1)}\\times${r2(r2_)}\\times${r2(r3)}=${r2(r1 * r2_ * r3, 3)}`}
          />
          <span className="hint">内部の点 P をドラッグ。各比は変わるが積はいつも 1。</span>
        </>
      }
    >
      <polygon points={poly(A, B, Cc)} fill={C.blue} fillOpacity={0.05} stroke="currentColor" strokeWidth={2} />
      <line x1={A[0]} y1={A[1]} x2={D[0]} y2={D[1]} className="fig-dash" />
      <line x1={B[0]} y1={B[1]} x2={E[0]} y2={E[1]} className="fig-dash" />
      <line x1={Cc[0]} y1={Cc[1]} x2={F[0]} y2={F[1]} className="fig-dash" />
      <line x1={A[0]} y1={A[1]} x2={F[0]} y2={F[1]} stroke={C.red} strokeWidth={3.5} />
      <line x1={B[0]} y1={B[1]} x2={D[0]} y2={D[1]} stroke={C.blue} strokeWidth={3.5} />
      <line x1={Cc[0]} y1={Cc[1]} x2={E[0]} y2={E[1]} stroke={C.green} strokeWidth={3.5} />
      {(
        [
          [A, 'A', 0, -18],
          [B, 'B', -14, 8],
          [Cc, 'C', 14, 8],
          [D, 'D', 0, 22],
          [E, 'E', 16, -6],
          [F, 'F', -16, -6],
        ] as [P, string, number, number][]
      ).map(([p, l, dx, dy]) => (
        <g key={l}>
          <circle cx={p[0]} cy={p[1]} r={3.5} fill="currentColor" />
          <TexAt x={p[0] + dx} y={p[1] + dy} tex={l} />
        </g>
      ))}
      <TexAt x={Pp[0] + 14} y={Pp[1] - 12} tex="P" anchor="start" color={C.purple} />
      <Handle x={Pp[0]} y={Pp[1]} color={C.purple} onMove={(x, y) => inside(x, y) && setP([x, y])} />
    </Fig>
  )
}

/* ---------- 三角形の面積 ---------- */

export function TriangleAreaFig() {
  const [a, setA] = useFig('a', 3.5)
  const [b, setB] = useFig('b', 5)
  const [Cd, setCd] = useFig('Cd', 55)
  const S = 50
  const t = (Cd * Math.PI) / 180
  const pC: P = [190, 300]
  const pA: P = [pC[0] + b * S, pC[1]]
  const pB: P = [pC[0] + a * S * Math.cos(t), pC[1] - a * S * Math.sin(t)]
  const H: P = [pB[0], pC[1]]
  return (
    <Fig
      w={560}
      h={330}
      controls={
        <>
          <Slider stack name="a" value={a} min={1} max={5} step={0.1} onChange={setA} />
          <Slider stack name="b" value={b} min={1} max={6} step={0.1} onChange={setB} />
          <Slider stack name="C" tex="C\ (^\circ)" value={Cd} min={5} max={175} step={1} onChange={setCd} />
        </>
      }
      caption={<Tex block tex={`S=\\frac12\\times\\underbrace{b}_{\\text{底辺}}\\times\\underbrace{\\textcolor{${C.purple}}{a\\sin C}}_{\\text{高さ}}=\\frac12\\times${r2(b, 1)}\\times${r2(a * Math.sin(t))}=${r2(0.5 * a * b * Math.sin(t))}`} />}
    >
      {(H[0] < pC[0] || H[0] > pA[0]) && <line x1={H[0]} y1={H[1]} x2={H[0] < pC[0] ? pC[0] : pA[0]} y2={pC[1]} className="fig-dash" />}
      <polygon points={poly(pA, pB, pC)} fill={C.blue} fillOpacity={0.15} stroke="currentColor" strokeWidth={2.5} />
      <line x1={pB[0]} y1={pB[1]} x2={H[0]} y2={H[1]} stroke={C.purple} strokeWidth={2.5} strokeDasharray="6 4" />
      <AngleArc v={pC} p={pA} q={pB} r={26} color={C.red} label="C" />
      <TexAt x={(pC[0] + pA[0]) / 2} y={pC[1] + 20} tex="b" />
      <TexAt x={(pC[0] + pB[0]) / 2 - 12} y={(pC[1] + pB[1]) / 2} tex="a" anchor="end" />
      <TexAt x={pB[0] + 8} y={(pB[1] + H[1]) / 2} tex="a\sin C" color={C.purple} anchor="start" />
    </Fig>
  )
}

/* ---------- はさみうち（sin x / x） ---------- */

export function SqueezeFig() {
  const [th, setTh] = useFig('th', 0.7)
  const O: P = [80, 330]
  const R = 260
  const A: P = [O[0] + R, O[1]]
  const Pp: P = [O[0] + R * Math.cos(th), O[1] - R * Math.sin(th)]
  const T: P = [O[0] + R, O[1] - R * Math.tan(th)]
  const s1 = Math.sin(th) / 2
  const s2 = th / 2
  const s3 = Math.tan(th) / 2
  return (
    <Fig
      w={560}
      h={360}
      controls={<Slider stack name="x" value={th} min={0.05} max={1.2} step={0.01} onChange={setTh} />}
      caption={
        <>
          <Tex
            block
            tex={`\\textcolor{${C.blue}}{\\tfrac12\\sin x}<\\textcolor{${C.green}}{\\tfrac12 x}<\\textcolor{${C.red}}{\\tfrac12\\tan x}:\\quad ${r2(s1, 3)}<${r2(s2, 3)}<${r2(s3, 3)}\\;\\Longrightarrow\\;\\cos x<\\frac{\\sin x}{x}<1,\\quad \\frac{\\sin x}{x}=${r2(Math.sin(th) / th, 4)}`}
          />
          <span className="hint">半径 1 の円で、三角形 OAP ⊂ 扇形 OAP ⊂ 三角形 OAT。x → 0 で両端が 1 に近づき、はさまれた sin x / x も 1 に近づく。</span>
        </>
      }
    >
      <path d={`M${O[0]},${O[1]} L${A[0]},${A[1]} L${T[0]},${T[1]} Z`} fill={C.red} opacity={0.15} stroke={C.red} />
      <path d={`M${O[0]},${O[1]} L${A[0]},${A[1]} A${R},${R} 0 0 0 ${Pp[0]},${Pp[1]} Z`} fill={C.green} opacity={0.2} stroke={C.green} />
      <path d={`M${O[0]},${O[1]} L${A[0]},${A[1]} L${Pp[0]},${Pp[1]} Z`} fill={C.blue} opacity={0.25} stroke={C.blue} strokeWidth={2} />
      <path d={`M${A[0]},${A[1]} A${R},${R} 0 0 0 ${O[0]},${O[1] - R}`} className="fig-thin" />
      <line x1={A[0]} y1={O[1] + 10} x2={A[0]} y2={20} className="fig-thin" />
      <TexAt x={O[0] - 10} y={O[1] + 10} tex="O" anchor="end" />
      <TexAt x={A[0] + 10} y={A[1] + 10} tex="A" anchor="start" />
      <TexAt x={Pp[0] - 8} y={Pp[1] - 14} tex="P" anchor="end" />
      <TexAt x={T[0] + 10} y={T[1]} tex="T" anchor="start" color={C.red} />
      <AngleArc v={O} p={A} q={Pp} r={40} color="var(--muted)" label="x" />
    </Fig>
  )
}

/* ---------- 三角関数の相互関係 ---------- */

export function TrigIdentityFig() {
  const [th, setTh] = useFig('th', 0.9)
  const O: P = [200, 200]
  const R = 150
  const Pp: P = [O[0] + R * Math.cos(th), O[1] - R * Math.sin(th)]
  const H: P = [Pp[0], O[1]]
  return (
    <Fig
      w={560}
      h={380}
      controls={<Slider stack name="t" tex="\theta" value={th} min={0} max={2 * Math.PI} step={0.01} onChange={setTh} />}
      caption={<Tex block tex={`\\textcolor{${C.blue}}{\\cos^2\\theta}+\\textcolor{${C.red}}{\\sin^2\\theta}=${r2(Math.cos(th) ** 2, 3)}+${r2(Math.sin(th) ** 2, 3)}=1^2`} />}
    >
      <line x1={O[0] - R - 20} x2={O[0] + R + 20} y1={O[1]} y2={O[1]} className="fig-axis" />
      <line x1={O[0]} x2={O[0]} y1={O[1] - R - 20} y2={O[1] + R + 20} className="fig-axis" />
      <circle cx={O[0]} cy={O[1]} r={R} className="fig-thin" />
      <polygon points={poly(O, H, Pp)} fill={C.purple} fillOpacity={0.1} />
      <line x1={O[0]} y1={O[1]} x2={H[0]} y2={H[1]} stroke={C.blue} strokeWidth={4} />
      <line x1={H[0]} y1={H[1]} x2={Pp[0]} y2={Pp[1]} stroke={C.red} strokeWidth={4} />
      <line x1={O[0]} y1={O[1]} x2={Pp[0]} y2={Pp[1]} stroke="currentColor" strokeWidth={2} />
      <TexAt x={(O[0] + H[0]) / 2} y={O[1] + (Math.sin(th) >= 0 ? 16 : -16)} tex="\cos\theta" color={C.blue} size={13} />
      <TexAt x={H[0] + (Math.cos(th) >= 0 ? 8 : -8)} y={(H[1] + Pp[1]) / 2} tex="\sin\theta" color={C.red} size={13} anchor={Math.cos(th) >= 0 ? 'start' : 'end'} />
      <TexAt x={(O[0] + Pp[0]) / 2 - 10 * Math.sin(th)} y={(O[1] + Pp[1]) / 2 - 10 * Math.cos(th)} tex="1" size={13} />
      <Handle x={Pp[0]} y={Pp[1]} onMove={(x, y) => setTh((Math.atan2(O[1] - y, x - O[0]) + 2 * Math.PI) % (2 * Math.PI))} />
      <text x={400} y={200} className="fig-muted">斜辺 1 の直角三角形に</text>
      <text x={400} y={220} className="fig-muted">三平方の定理を使うだけ</text>
    </Fig>
  )
}

/* ---------- 三角関数の合成 ---------- */

export function HarmonicFig() {
  const [a, setA] = useFig('a', 1)
  const [b, setB] = useFig('b', 1.7)
  const S = 42
  const O: P = [150, 170]
  const X: P = [O[0] + a * S, O[1]]
  const Y: P = [X[0], O[1] - b * S]
  const R = Math.hypot(a, b)
  const al = Math.atan2(b, a)
  // 右側に波
  const W0 = 320
  const wave = (f: (t: number) => number) => {
    let d = ''
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * 2 * Math.PI
      d += `${i ? 'L' : 'M'}${(W0 + (i / 200) * 220).toFixed(1)},${(170 - f(t) * 30).toFixed(1)}`
    }
    return d
  }
  return (
    <Fig
      w={560}
      h={320}
      controls={
        <>
          <Slider stack name="a" value={a} min={-3} max={3} step={0.1} onChange={setA} />
          <Slider stack name="b" value={b} min={-3} max={3} step={0.1} onChange={setB} />
        </>
      }
      caption={
        <Tex block tex={`${r2(a, 1)}\\sin\\theta+${r2(b, 1)}\\cos\\theta=\\textcolor{${C.green}}{${r2(R)}}\\sin(\\theta+\\textcolor{${C.red}}{${r2(deg(al), 1)}^\\circ})`} />
      }
    >
      <line x1={10} x2={290} y1={O[1]} y2={O[1]} className="fig-axis" />
      <line x1={O[0]} x2={O[0]} y1={20} y2={310} className="fig-axis" />
      <line x1={O[0]} y1={O[1]} x2={X[0]} y2={X[1]} stroke={C.blue} strokeWidth={4} />
      <line x1={X[0]} y1={X[1]} x2={Y[0]} y2={Y[1]} stroke={C.orange} strokeWidth={4} />
      <line x1={O[0]} y1={O[1]} x2={Y[0]} y2={Y[1]} stroke={C.green} strokeWidth={3} />
      <AngleArc v={O} p={[O[0] + 10, O[1]]} q={Y} r={30} color={C.red} label="\alpha" />
      <TexAt x={(O[0] + X[0]) / 2} y={O[1] + 16} tex="a" color={C.blue} />
      <TexAt x={X[0] + 10} y={(X[1] + Y[1]) / 2} tex="b" color={C.orange} anchor="start" />
      <TexAt x={(O[0] + Y[0]) / 2 - 12} y={(O[1] + Y[1]) / 2 - 8} tex="\sqrt{a^2+b^2}" color={C.green} anchor="end" size={13} />
      <line x1={W0} x2={W0 + 220} y1={170} y2={170} className="fig-axis" />
      <path d={wave((t) => a * Math.sin(t))} stroke={C.blue} strokeWidth={1.5} fill="none" opacity={0.6} />
      <path d={wave((t) => b * Math.cos(t))} stroke={C.orange} strokeWidth={1.5} fill="none" opacity={0.6} />
      <path d={wave((t) => a * Math.sin(t) + b * Math.cos(t))} stroke={C.green} strokeWidth={3} fill="none" />
      <text x={W0} y={300} className="fig-muted">2 つの波の和も同じ周期の波</text>
    </Fig>
  )
}
