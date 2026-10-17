import { Slider } from '../components/Slider'
import { Tex } from '../components/Tex'
import { AngleArc, Arrow, Axes, Fig, Handle, TexAt } from './common'
import { C, angleBetween, deg, frame, r2, type Frame } from './util'
import { useFig } from './state'

type V = [number, number]
const snap = (v: number) => Math.round(v * 10) / 10
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1]
const len = (a: V) => Math.hypot(a[0], a[1])

const plane = (w = 560, h = 360, x = 5, y = (x * h) / w) => frame([-x, x], [-y, y], { x: 0, y: 0, w, h })

/** 数学座標で点を置く Handle */
function VHandle({ f, v, set, color }: { f: Frame; v: V; set: (v: V) => void; color?: string }) {
  return <Handle x={f.X(v[0])} y={f.Y(v[1])} color={color} onMove={(x, y) => set([snap(f.ix(x)), snap(f.iy(y))])} />
}
const vec = (f: Frame, from: V, to: V, color: string, width?: number, dashed?: boolean) => (
  <Arrow x1={f.X(from[0])} y1={f.Y(from[1])} x2={f.X(to[0])} y2={f.Y(to[1])} color={color} width={width} dashed={dashed} />
)
const O: V = [0, 0]

/* ---------- 内積 ---------- */

export function DotProductFig() {
  const [a, setA] = useFig<V>('a', [3, 1])
  const [b, setB] = useFig<V>('b', [1.5, 2.5])
  const f = plane()
  const k = dot(a, b) / dot(a, a)
  const proj: V = [a[0] * k, a[1] * k]
  const th = angleBetween(a[0], a[1], b[0], b[1])
  const projLen = dot(a, b) / len(a)
  const col = projLen >= 0 ? C.green : C.red
  return (
    <Fig
      w={560}
      h={360}
      caption={
        <>
          <Tex
            block
            tex={`\\vec a\\cdot\\vec b=\\underbrace{|\\vec a|}_{${r2(len(a))}}\\times\\underbrace{\\textcolor{${col}}{|\\vec b|\\cos\\theta}}_{${r2(projLen)}}=${r2(dot(a, b))},\\qquad \\theta=${r2(deg(th), 1)}^\\circ`}
          />
          <span className="hint">矢印の先をドラッグ。内積は「a の長さ × b を a 方向に落とした影の長さ」。直角なら影が消えて 0、鈍角なら影が逆向きで負になる。</span>
        </>
      }
    >
      <Axes f={f} grid />
      <line x1={f.X(-a[0] * 10)} y1={f.Y(-a[1] * 10)} x2={f.X(a[0] * 10)} y2={f.Y(a[1] * 10)} className="fig-dash" opacity={0.4} />
      <line x1={f.X(b[0])} y1={f.Y(b[1])} x2={f.X(proj[0])} y2={f.Y(proj[1])} className="fig-dash" />
      <line x1={f.X(0)} y1={f.Y(0)} x2={f.X(proj[0])} y2={f.Y(proj[1])} stroke={col} strokeWidth={7} opacity={0.5} />
      {vec(f, O, a, C.blue)}
      {vec(f, O, b, C.red)}
      <AngleArc v={[f.X(0), f.Y(0)]} p={[f.X(a[0]), f.Y(a[1])]} q={[f.X(b[0]), f.Y(b[1])]} r={30} color="var(--muted)" label="\theta" />
      <TexAt x={f.X(a[0]) + 14} y={f.Y(a[1])} tex="\vec a" color={C.blue} anchor="start" />
      <TexAt x={f.X(b[0]) + 14} y={f.Y(b[1])} tex="\vec b" color={C.red} anchor="start" />
      <VHandle f={f} v={a} set={setA} color={C.blue} />
      <VHandle f={f} v={b} set={setB} color={C.red} />
    </Fig>
  )
}

/* ---------- 点と直線の距離 ---------- */

export function PointLineDistanceFig() {
  const [p1, setP1] = useFig<V>('p1', [-4, -1])
  const [p2, setP2] = useFig<V>('p2', [3, 1.5])
  const [q, setQ] = useFig<V>('q', [-1, 2])
  const f = plane()
  // 2 点を通る直線 ax + by + c = 0
  const a = p2[1] - p1[1]
  const b = p1[0] - p2[0]
  const c = -(a * p1[0] + b * p1[1])
  const n2 = a * a + b * b || 1
  const t = (a * q[0] + b * q[1] + c) / n2
  const H: V = [q[0] - a * t, q[1] - b * t]
  const d = Math.abs(a * q[0] + b * q[1] + c) / Math.sqrt(n2)
  const p = (v: number, d = 2) => (v < 0 ? `(${r2(v, d)})` : `${r2(v, d)}`)
  const far = (k: number): V => [p1[0] + (p2[0] - p1[0]) * k, p1[1] + (p2[1] - p1[1]) * k]
  return (
    <Fig
      w={560}
      h={360}
      caption={
        <Tex
          block
          tex={`${r2(a, 1)}x+${r2(b, 1)}y+${r2(c, 2)}=0,\\quad d=\\frac{|${p(a, 1)}\\cdot${p(q[0])}+${p(b, 1)}\\cdot${p(q[1])}+${p(c)}|}{\\sqrt{${p(a, 1)}^2+${p(b, 1)}^2}}=\\textcolor{${C.red}}{${r2(d)}}`.replace(/\+-/g, '-')}
        />
      }
    >
      <Axes f={f} grid />
      <line x1={f.X(far(-10)[0])} y1={f.Y(far(-10)[1])} x2={f.X(far(10)[0])} y2={f.Y(far(10)[1])} stroke={C.blue} strokeWidth={2.5} />
      <line x1={f.X(q[0])} y1={f.Y(q[1])} x2={f.X(H[0])} y2={f.Y(H[1])} stroke={C.red} strokeWidth={3} strokeDasharray="6 4" />
      <circle cx={f.X(H[0])} cy={f.Y(H[1])} r={4} fill={C.red} />
      <TexAt x={f.X(q[0]) + 14} y={f.Y(q[1]) - 10} tex={`(x_0,y_0)`} anchor="start" size={13} />
      <TexAt x={(f.X(q[0]) + f.X(H[0])) / 2 + 10} y={(f.Y(q[1]) + f.Y(H[1])) / 2} tex="d" color={C.red} anchor="start" />
      <VHandle f={f} v={p1} set={setP1} color={C.blue} />
      <VHandle f={f} v={p2} set={setP2} color={C.blue} />
      <VHandle f={f} v={q} set={setQ} color={C.red} />
    </Fig>
  )
}

/* ---------- 内分点 ---------- */

export function SectionFig() {
  const [A, setA] = useFig<V>('A', [-3, -1.5])
  const [B, setB] = useFig<V>('B', [3.5, 2])
  const [m, setM] = useFig('m', 2)
  const [n, setN] = useFig('n', 1)
  const f = plane()
  const Pp: V = [(n * A[0] + m * B[0]) / (m + n), (n * A[1] + m * B[1]) / (m + n)]
  const ticks = Array.from({ length: m + n - 1 }, (_, i) => {
    const t = (i + 1) / (m + n)
    return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t] as V
  })
  return (
    <Fig
      w={560}
      h={360}
      controls={
        <>
          <Slider stack name="m" value={m} min={1} max={6} step={1} onChange={setM} />
          <Slider stack name="n" value={n} min={1} max={6} step={1} onChange={setN} />
        </>
      }
      caption={<Tex block tex={`\\vec p=\\frac{${n}\\,\\vec a+${m}\\,\\vec b}{${m}+${n}}=(${r2(Pp[0])},\\ ${r2(Pp[1])})`} />}
    >
      <Axes f={f} grid />
      {vec(f, O, A, C.blue, 2)}
      {vec(f, O, B, C.red, 2)}
      {vec(f, O, Pp, C.green, 3)}
      <line x1={f.X(A[0])} y1={f.Y(A[1])} x2={f.X(Pp[0])} y2={f.Y(Pp[1])} stroke={C.orange} strokeWidth={5} opacity={0.6} />
      <line x1={f.X(Pp[0])} y1={f.Y(Pp[1])} x2={f.X(B[0])} y2={f.Y(B[1])} stroke={C.purple} strokeWidth={5} opacity={0.6} />
      {ticks.map((t, i) => (
        <circle key={i} cx={f.X(t[0])} cy={f.Y(t[1])} r={3} fill="currentColor" />
      ))}
      <TexAt x={f.X((A[0] + Pp[0]) / 2) - 10} y={f.Y((A[1] + Pp[1]) / 2) - 14} tex={`${m}`} color={C.orange} />
      <TexAt x={f.X((B[0] + Pp[0]) / 2) - 10} y={f.Y((B[1] + Pp[1]) / 2) - 14} tex={`${n}`} color={C.purple} />
      <TexAt x={f.X(A[0]) - 12} y={f.Y(A[1])} tex="A" anchor="end" />
      <TexAt x={f.X(B[0]) + 12} y={f.Y(B[1])} tex="B" anchor="start" />
      <TexAt x={f.X(Pp[0]) + 12} y={f.Y(Pp[1]) + 14} tex="P" color={C.green} anchor="start" />
      <VHandle f={f} v={A} set={setA} color={C.blue} />
      <VHandle f={f} v={B} set={setB} color={C.red} />
    </Fig>
  )
}

/* ---------- 外積・行列式と面積 ---------- */

export function CrossAreaFig() {
  const [a, setA] = useFig<V>('a', [3, 0.5])
  const [b, setB] = useFig<V>('b', [1, 2])
  const f = plane()
  const det = a[0] * b[1] - a[1] * b[0]
  const col = det >= 0 ? C.blue : C.red
  const pts = [O, a, [a[0] + b[0], a[1] + b[1]] as V, b].map((p) => `${f.X(p[0])},${f.Y(p[1])}`).join(' ')
  return (
    <Fig
      w={560}
      h={360}
      caption={
        <>
          <Tex block tex={`a_1b_2-a_2b_1=${a[0]}\\cdot${b[1]}-${a[1]}\\cdot${b[0]}=\\textcolor{${col}}{${r2(det)}}\\quad(\\text{平行四辺形の面積}=${r2(Math.abs(det))},\\ \\triangle=${r2(Math.abs(det) / 2)})`} />
          <span className="hint">b が a の反時計回り側にあれば正、時計回り側なら負（向き付き面積）。平行になると 0。</span>
        </>
      }
    >
      <Axes f={f} grid />
      <polygon points={pts} fill={col} opacity={0.2} stroke={col} />
      <polygon points={[O, a, b].map((p) => `${f.X(p[0])},${f.Y(p[1])}`).join(' ')} fill={col} opacity={0.2} />
      {vec(f, O, a, C.blue)}
      {vec(f, O, b, C.green)}
      <TexAt x={f.X(a[0]) + 14} y={f.Y(a[1])} tex="\vec a" color={C.blue} anchor="start" />
      <TexAt x={f.X(b[0]) + 14} y={f.Y(b[1])} tex="\vec b" color={C.green} anchor="start" />
      <VHandle f={f} v={a} set={setA} color={C.blue} />
      <VHandle f={f} v={b} set={setB} color={C.green} />
    </Fig>
  )
}

/* ---------- 行列による変換（逆行列・行列式） ---------- */

export function LinearMapFig() {
  const [m, setM] = useFig('m', { a: 1.5, b: 0.5, c: 0.3, d: 1 })
  const f = plane(560, 360, 4.5)
  const map = (v: V): V => [m.a * v[0] + m.b * v[1], m.c * v[0] + m.d * v[1]]
  const det = m.a * m.d - m.b * m.c
  const grid = []
  for (let i = -6; i <= 6; i++) {
    const p1 = map([i, -6])
    const p2 = map([i, 6])
    const q1 = map([-6, i])
    const q2 = map([6, i])
    grid.push(<line key={`v${i}`} x1={f.X(p1[0])} y1={f.Y(p1[1])} x2={f.X(p2[0])} y2={f.Y(p2[1])} stroke={C.blue} strokeWidth={0.8} opacity={0.35} />)
    grid.push(<line key={`h${i}`} x1={f.X(q1[0])} y1={f.Y(q1[1])} x2={f.X(q2[0])} y2={f.Y(q2[1])} stroke={C.blue} strokeWidth={0.8} opacity={0.35} />)
  }
  const sq = ([[0, 0], [1, 0], [1, 1], [0, 1]] as V[]).map(map).map((p) => `${f.X(p[0])},${f.Y(p[1])}`).join(' ')
  const flat = Math.abs(det) < 0.05
  const set = (k: keyof typeof m) => (v: number) => setM({ ...m, [k]: v })
  return (
    <Fig
      w={560}
      h={360}
      controls={
        <>
          <Slider stack name="a" value={m.a} min={-2} max={2} step={0.1} onChange={set('a')} />
          <Slider stack name="b" value={m.b} min={-2} max={2} step={0.1} onChange={set('b')} />
          <Slider stack name="c" value={m.c} min={-2} max={2} step={0.1} onChange={set('c')} />
          <Slider stack name="d" value={m.d} min={-2} max={2} step={0.1} onChange={set('d')} />
        </>
      }
      caption={
        <>
          <Tex
            block
            tex={`A=\\begin{pmatrix}${m.a}&${m.b}\\\\${m.c}&${m.d}\\end{pmatrix},\\quad \\det A=${r2(det)}\\quad ${flat ? '\\Rightarrow\\ \\textcolor{' + C.red + '}{\\text{平面が線（点）に潰れる → 逆行列なし}}' : '\\Rightarrow\\ \\text{面積が } |' + r2(det) + '| \\text{ 倍}'}`}
          />
          <span className="hint">格子が A でどう変形されるか。単位正方形（灰）が平行四辺形（色）に移り、その面積が |det A|。det A = 0 だと潰れた情報が戻せないので逆行列がない。</span>
        </>
      }
    >
      <Axes f={f} />
      {grid}
      <polygon points={[[0, 0], [1, 0], [1, 1], [0, 1]].map((p) => `${f.X(p[0])},${f.Y(p[1])}`).join(' ')} fill="var(--muted)" opacity={0.15} />
      <polygon points={sq} fill={flat ? C.red : det > 0 ? C.green : C.orange} opacity={0.35} stroke={flat ? C.red : C.green} strokeWidth={1.5} />
      {vec(f, O, map([1, 0]), C.red)}
      {vec(f, O, map([0, 1]), C.purple)}
      <TexAt x={f.X(map([1, 0])[0]) + 12} y={f.Y(map([1, 0])[1]) + 12} tex="A\vec e_1" color={C.red} anchor="start" size={13} />
      <TexAt x={f.X(map([0, 1])[0]) + 12} y={f.Y(map([0, 1])[1]) - 12} tex="A\vec e_2" color={C.purple} anchor="start" size={13} />
    </Fig>
  )
}

/* ---------- 固有ベクトル ---------- */

export function EigenFig({ symmetric = false }: { symmetric?: boolean }) {
  const [m, setM] = useFig('m', symmetric ? { a: 2, b: 1, c: 1, d: 1.5 } : { a: 2, b: 1, c: 0.5, d: 1 })
  const [x, setX] = useFig<V>('x', [1, 1.6])
  const f = plane(560, 380, 4.5)
  const map = (v: V): V => [m.a * v[0] + m.b * v[1], m.c * v[0] + m.d * v[1]]
  const tr = m.a + m.d
  const det = m.a * m.d - m.b * m.c
  const disc = tr * tr - 4 * det
  const eig: { l: number; v: V }[] = []
  if (disc >= 0) {
    for (const s of [1, -1]) {
      const l = (tr + s * Math.sqrt(disc)) / 2
      let v: V = Math.abs(m.b) > 1e-9 ? [m.b, l - m.a] : Math.abs(m.c) > 1e-9 ? [l - m.d, m.c] : s > 0 ? [1, 0] : [0, 1]
      const n = len(v) || 1
      v = [v[0] / n, v[1] / n]
      eig.push({ l, v })
    }
  }
  const ellipse = Array.from({ length: 121 }, (_, i) => {
    const t = (i / 120) * 2 * Math.PI
    const p = map([Math.cos(t), Math.sin(t)])
    return `${f.X(p[0])},${f.Y(p[1])}`
  }).join(' ')
  const Ax = map(x)
  const setK = (k: keyof typeof m) => (v: number) =>
    setM(symmetric && (k === 'b' || k === 'c') ? { ...m, b: v, c: v } : { ...m, [k]: v })
  const ecol = [C.red, C.green]
  return (
    <Fig
      w={560}
      h={380}
      controls={
        <>
          <Slider stack name="a" value={m.a} min={-2} max={3} step={0.1} onChange={setK('a')} />
          <Slider stack name="b" value={m.b} min={-2} max={2} step={0.1} onChange={setK('b')} />
          {!symmetric && <Slider stack name="c" value={m.c} min={-2} max={2} step={0.1} onChange={setK('c')} />}
          <Slider stack name="d" value={m.d} min={-2} max={3} step={0.1} onChange={setK('d')} />
        </>
      }
      caption={
        <>
          <Tex
            block
            tex={`A=\\begin{pmatrix}${m.a}&${m.b}\\\\${m.c}&${m.d}\\end{pmatrix},\\quad ${
              eig.length ? eig.map((e, i) => `\\textcolor{${ecol[i]}}{\\lambda_${i + 1}=${r2(e.l)}}`).join(',\\ ') : '\\text{実数の固有値なし（回転を含む）}'
            }`}
          />
          <span className="hint">
            {symmetric
              ? '対称行列では、単位円が楕円に移り、その長軸・短軸の方向が固有ベクトル。2 本は必ず直交する。'
              : '紫のベクトル x をドラッグ。ふつうは Ax の向きが変わるが、固有ベクトル（赤・緑の線上）だけは向きを変えずに λ 倍される。'}
          </span>
        </>
      }
    >
      <Axes f={f} grid />
      <circle cx={f.X(0)} cy={f.Y(0)} r={f.X(1) - f.X(0)} fill="none" stroke="var(--muted)" strokeDasharray="4 4" />
      <polygon points={ellipse} fill={C.blue} opacity={0.12} stroke={C.blue} strokeWidth={1.5} />
      {eig.map((e, i) => (
        <g key={i}>
          <line x1={f.X(-e.v[0] * 10)} y1={f.Y(-e.v[1] * 10)} x2={f.X(e.v[0] * 10)} y2={f.Y(e.v[1] * 10)} stroke={ecol[i]} strokeWidth={1} opacity={0.5} />
          {vec(f, O, [e.v[0] * e.l, e.v[1] * e.l], ecol[i], 3)}
          {vec(f, O, e.v, ecol[i], 2, true)}
        </g>
      ))}
      {!symmetric && (
        <>
          {vec(f, O, x, C.purple, 2.5)}
          {vec(f, O, Ax, C.purple, 2.5, true)}
          <TexAt x={f.X(x[0]) + 12} y={f.Y(x[1]) - 10} tex="\vec x" color={C.purple} anchor="start" />
          <TexAt x={f.X(Ax[0]) + 12} y={f.Y(Ax[1]) - 10} tex="A\vec x" color={C.purple} anchor="start" />
          <VHandle f={f} v={x} set={setX} color={C.purple} />
        </>
      )}
    </Fig>
  )
}

/* ---------- 三角不等式 ---------- */

export function TriangleInequalityFig() {
  const [a, setA] = useFig<V>('a', [2.5, 1])
  const [b, setB] = useFig<V>('b', [0.5, 1.5])
  const f = plane()
  const ab: V = [a[0] + b[0], a[1] + b[1]]
  return (
    <Fig
      w={560}
      h={360}
      caption={
        <>
          <Tex block tex={`\\textcolor{${C.green}}{|\\vec a+\\vec b|}=${r2(len(ab))}\\ \\le\\ \\textcolor{${C.blue}}{|\\vec a|}+\\textcolor{${C.red}}{|\\vec b|}=${r2(len(a) + len(b))}`} />
          <span className="hint">回り道（a → b）は近道（a + b）より長い。等号は a と b が同じ向きのとき。</span>
        </>
      }
    >
      <Axes f={f} grid />
      {vec(f, O, a, C.blue)}
      {vec(f, a, ab, C.red)}
      {vec(f, O, ab, C.green, 3)}
      <TexAt x={f.X(a[0] / 2) + 6} y={f.Y(a[1] / 2) + 16} tex="\vec a" color={C.blue} anchor="start" />
      <TexAt x={f.X(a[0] + b[0] / 2) + 12} y={f.Y(a[1] + b[1] / 2)} tex="\vec b" color={C.red} anchor="start" />
      <TexAt x={f.X(ab[0] / 2) - 12} y={f.Y(ab[1] / 2) - 10} tex="\vec a+\vec b" color={C.green} anchor="end" />
      <VHandle f={f} v={a} set={setA} color={C.blue} />
      <Handle x={f.X(ab[0])} y={f.Y(ab[1])} color={C.red} onMove={(x, y) => setB([snap(f.ix(x) - a[0]), snap(f.iy(y) - a[1])])} />
    </Fig>
  )
}

/* ---------- 複素数 ---------- */

const cmul = (a: V, b: V): V => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const arg = (z: V) => Math.atan2(z[1], z[0])

export function PolarProductFig() {
  const [z1, setZ1] = useFig<V>('z1', [1.5, 0.6])
  const [z2, setZ2] = useFig<V>('z2', [0.8, 1])
  const f = plane(560, 380, 4)
  const p = cmul(z1, z2)
  const unit = f.X(1) - f.X(0)
  const arc = (z: V, r: number, col: string) => {
    const t = arg(z)
    const big = Math.abs(t) > Math.PI ? 1 : 0
    return <path d={`M${f.X(r)},${f.Y(0)} A${r * unit},${r * unit} 0 ${big} ${t > 0 ? 0 : 1} ${f.X(r * Math.cos(t))},${f.Y(r * Math.sin(t))}`} fill="none" stroke={col} strokeWidth={2} />
  }
  return (
    <Fig
      w={560}
      h={380}
      caption={
        <Tex
          block
          tex={`|z_1z_2|=\\textcolor{${C.blue}}{${r2(len(z1))}}\\times\\textcolor{${C.red}}{${r2(len(z2))}}=\\textcolor{${C.green}}{${r2(len(p))}},\\quad \\arg z_1z_2=\\textcolor{${C.blue}}{${r2(deg(arg(z1)), 1)}^\\circ}+\\textcolor{${C.red}}{${r2(deg(arg(z2)), 1)}^\\circ}=\\textcolor{${C.green}}{${r2(deg(arg(z1) + arg(z2)), 1)}^\\circ}`}
        />
      }
    >
      <Axes f={f} grid />
      <circle cx={f.X(0)} cy={f.Y(0)} r={unit} fill="none" stroke="var(--muted)" strokeDasharray="4 4" />
      {arc(z1, 0.5, C.blue)}
      {arc(z2, 0.7, C.red)}
      {arc(p, 0.9, C.green)}
      {vec(f, O, z1, C.blue)}
      {vec(f, O, z2, C.red)}
      {vec(f, O, p, C.green, 3)}
      <TexAt x={f.X(z1[0]) + 12} y={f.Y(z1[1])} tex="z_1" color={C.blue} anchor="start" />
      <TexAt x={f.X(z2[0]) + 12} y={f.Y(z2[1])} tex="z_2" color={C.red} anchor="start" />
      <TexAt x={f.X(p[0]) + 12} y={f.Y(p[1])} tex="z_1z_2" color={C.green} anchor="start" />
      <TexAt x={f.X(3.2)} y={f.Y(-2.6)} tex="\text{実軸}" size={12} color="var(--muted)" />
      <VHandle f={f} v={z1} set={setZ1} color={C.blue} />
      <VHandle f={f} v={z2} set={setZ2} color={C.red} />
    </Fig>
  )
}

export function DeMoivreFig() {
  const [n, setN] = useFig('n', 6)
  const [z, setZ] = useFig<V>('z', [0.95, 0.4])
  const f = plane(560, 380, 2.2)
  const pows: V[] = [[1, 0]]
  for (let k = 1; k <= n; k++) pows.push(cmul(pows[k - 1], z))
  const roots = Array.from({ length: n }, (_, k) => [Math.cos((2 * Math.PI * k) / n), Math.sin((2 * Math.PI * k) / n)] as V)
  const unit = f.X(1) - f.X(0)
  return (
    <Fig
      w={560}
      h={380}
      controls={<Slider stack name="n" value={n} min={2} max={12} step={1} onChange={setN} />}
      caption={
        <>
          <Tex block tex={`z=${r2(len(z))}\\,e^{i\\,${r2(deg(arg(z)), 1)}^\\circ}\\ \\Rightarrow\\ z^{${n}}=${r2(len(z) ** n)}\\,e^{i\\,${r2(deg(arg(z)) * n, 1)}^\\circ}`} />
          <span className="hint">z をドラッグ。z, z², z³, … は「長さを |z| 倍、角を arg z ずつ回す」のでらせんになる。橙の点は zⁿ = 1 の解で、単位円を n 等分する。</span>
        </>
      }
    >
      <Axes f={f} grid step={0.5} />
      <circle cx={f.X(0)} cy={f.Y(0)} r={unit} fill="none" stroke="var(--muted)" strokeDasharray="4 4" />
      <polygon points={roots.map((p) => `${f.X(p[0])},${f.Y(p[1])}`).join(' ')} fill={C.orange} opacity={0.1} stroke={C.orange} />
      {roots.map((p, i) => (
        <circle key={i} cx={f.X(p[0])} cy={f.Y(p[1])} r={4} fill={C.orange} />
      ))}
      <polyline points={pows.map((p) => `${f.X(p[0])},${f.Y(p[1])}`).join(' ')} fill="none" stroke={C.blue} strokeWidth={1.5} />
      {pows.slice(1).map((p, k) => (
        <g key={k}>
          <circle cx={f.X(p[0])} cy={f.Y(p[1])} r={4} fill={C.blue} />
          <TexAt x={f.X(p[0]) + 8} y={f.Y(p[1]) - 10} tex={`z^{${k + 1}}`} color={C.blue} anchor="start" size={11} />
        </g>
      ))}
      <VHandle f={f} v={z} set={setZ} color={C.red} />
    </Fig>
  )
}

export function EulerFormulaFig() {
  const [th, setTh] = useFig('th', Math.PI / 3)
  const f = plane(560, 360, 2.3)
  const p: V = [Math.cos(th), Math.sin(th)]
  const unit = f.X(1) - f.X(0)
  return (
    <Fig
      w={560}
      h={360}
      controls={<Slider stack name="t" tex="\theta" value={th} min={0} max={2 * Math.PI} step={0.01} onChange={setTh} />}
      caption={<Tex block tex={`e^{i\\theta}=\\textcolor{${C.blue}}{\\cos\\theta}+i\\,\\textcolor{${C.red}}{\\sin\\theta}=${r2(p[0], 3)}+${r2(p[1], 3)}i`.replace('+-', '-')} />}
    >
      <Axes f={f} grid step={0.5} />
      <circle cx={f.X(0)} cy={f.Y(0)} r={unit} fill="none" className="fig-thin" />
      <line x1={f.X(0)} y1={f.Y(0)} x2={f.X(p[0])} y2={f.Y(0)} stroke={C.blue} strokeWidth={4} />
      <line x1={f.X(p[0])} y1={f.Y(0)} x2={f.X(p[0])} y2={f.Y(p[1])} stroke={C.red} strokeWidth={4} />
      {vec(f, O, p, 'currentColor')}
      <AngleArc v={[f.X(0), f.Y(0)]} p={[f.X(1), f.Y(0)]} q={[f.X(p[0]), f.Y(p[1])]} r={30} color="var(--muted)" label="\theta" />
      <TexAt x={f.X(p[0]) + 12} y={f.Y(p[1]) - 12} tex="e^{i\theta}" anchor="start" />
      <TexAt x={f.X(1.05)} y={f.Y(-0.12)} tex="1" size={12} anchor="start" />
      <TexAt x={f.X(0.06)} y={f.Y(1.1)} tex="i" size={12} anchor="start" />
      <Handle x={f.X(p[0])} y={f.Y(p[1])} onMove={(x, y) => setTh((Math.atan2(f.iy(y), f.ix(x)) + 2 * Math.PI) % (2 * Math.PI))} />
      <text x={20} y={340} className="fig-muted">θ = π で e^(iπ) = −1</text>
    </Fig>
  )
}
