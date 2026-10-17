import { useState } from 'react'
import { Slider } from '../components/Slider'
import { Tex } from '../components/Tex'
import { Arrow, Axes, Fig, TexAt } from './common'
import { C, SERIES, clamp, frame, r2, type Frame } from './util'

/** 数値積分（シンプソン則） */
function integrate(f: (x: number) => number, a: number, b: number, n = 400) {
  const h = (b - a) / n
  let s = f(a) + f(b)
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2)
  return (s * h) / 3
}

/** 区間 [a, b] で f の下を塗る */
function area(F: Frame, f: (x: number) => number, a: number, b: number) {
  return `M${F.X(a)},${F.Y(0)} ${F.path(f, a, b, 120).replace(/^M/, 'L')} L${F.X(b)},${F.Y(0)} Z`
}

/* ---------- 導関数の定義: 割線が接線に近づく ---------- */

export function DerivativeDefFig() {
  const [a, setA] = useState(0.6)
  const [h, setH] = useState(1.5)
  const f = (x: number) => 0.25 * x ** 3 - x + 1
  const df = (x: number) => 0.75 * x * x - 1
  const F = frame([-3, 3], [-2, 4], { x: 0, y: 0, w: 560, h: 320 })
  const slope = (f(a + h) - f(a)) / h
  const line = (m: number) => (x: number) => f(a) + m * (x - a)
  return (
    <Fig
      w={560}
      h={320}
      controls={
        <>
          <Slider stack name="a" value={a} min={-2} max={2} step={0.01} onChange={setA} />
          <Slider stack name="h" value={h} min={0.01} max={2} step={0.01} onChange={setH} />
        </>
      }
      caption={
        <Tex
          block
          tex={`\\textcolor{${C.red}}{\\frac{f(a+h)-f(a)}{h}=${r2(slope, 3)}}\\ \\xrightarrow{\\,h\\to0\\,}\\ \\textcolor{${C.green}}{f'(a)=${r2(df(a), 3)}}`}
        />
      }
    >
      <Axes f={F} grid />
      <path d={F.path(f)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      <path d={F.path(line(df(a)))} stroke={C.green} strokeWidth={1.8} strokeDasharray="6 4" fill="none" />
      <path d={F.path(line(slope))} stroke={C.red} strokeWidth={2.2} fill="none" />
      <line x1={F.X(a)} x2={F.X(a + h)} y1={F.Y(f(a))} y2={F.Y(f(a))} className="fig-dash" />
      <line x1={F.X(a + h)} x2={F.X(a + h)} y1={F.Y(f(a))} y2={F.Y(f(a + h))} className="fig-dash" />
      <TexAt x={F.X(a + h / 2)} y={F.Y(f(a)) + 14} tex="h" size={13} />
      <circle cx={F.X(a)} cy={F.Y(f(a))} r={5} fill={C.blue} />
      <circle cx={F.X(a + h)} cy={F.Y(f(a + h))} r={5} fill={C.red} />
    </Fig>
  )
}

/* ---------- 積の微分: 長方形の面積の増え方 ---------- */

export function ProductRuleFig() {
  const [d, setD] = useState(0.6)
  const f = 3
  const g = 2
  const df = 1.2 * d
  const dg = 0.9 * d
  const s = 70
  const x0 = 60
  const y0 = 310
  const R = (x: number, y: number, w: number, h: number, fill: string, op: number) => (
    <rect x={x0 + x * s} y={y0 - (y + h) * s} width={w * s} height={h * s} fill={fill} fillOpacity={op} stroke="currentColor" strokeWidth={1} />
  )
  return (
    <Fig
      w={560}
      h={340}
      controls={<Slider stack name="d" tex="\Delta x" value={d} min={0.02} max={1} step={0.01} onChange={setD} />}
      caption={
        <>
          <Tex
            block
            tex={`\\Delta(fg)=\\textcolor{${C.blue}}{\\Delta f\\cdot g}+\\textcolor{${C.red}}{f\\cdot\\Delta g}+\\textcolor{${C.purple}}{\\Delta f\\,\\Delta g}=${r2(df * g)}+${r2(f * dg)}+${r2(df * dg, 3)}`}
          />
          <span className="hint">横 f・縦 g の長方形が少し広がると、増えた面積は 2 本の帯と角の小さな正方形。Δx で割って Δx → 0 にすると、角の分は消えて <Tex tex="(fg)'=f'g+fg'" /> が残る。</span>
        </>
      }
    >
      {R(0, 0, f, g, C.green, 0.12)}
      {R(f, 0, df, g, C.blue, 0.45)}
      {R(0, g, f, dg, C.red, 0.45)}
      {R(f, g, df, dg, C.purple, 0.7)}
      <TexAt x={x0 + (f * s) / 2} y={y0 - (g * s) / 2} tex="fg" size={18} />
      <TexAt x={x0 + (f * s) / 2} y={y0 + 16} tex="f" />
      <TexAt x={x0 - 14} y={y0 - (g * s) / 2} tex="g" anchor="end" />
      <TexAt x={x0 + (f + df) * s + 10} y={y0 - (g * s) / 2} tex="\Delta f\cdot g" color={C.blue} anchor="start" size={13} />
      <TexAt x={x0 + (f * s) / 2} y={y0 - (g + dg) * s - 14} tex="f\cdot\Delta g" color={C.red} size={13} />
    </Fig>
  )
}

/* ---------- 連鎖律: 3 本の数直線で伸び率を掛ける ---------- */

export function ChainRuleFig() {
  const [x, setX] = useState(1)
  const [h, setH] = useState(0.3)
  const g = (t: number) => t * t
  const f = (u: number) => Math.sin(u)
  const u0 = g(x)
  const u1 = g(x + h)
  const y0 = f(u0)
  const y1 = f(u1)
  const L = { x: 60, w: 470 }
  const lines = [
    { y: 60, lo: 0, hi: 2, a: x, b: x + h, name: 'x', c: C.blue },
    { y: 160, lo: 0, hi: 4, a: u0, b: u1, name: 'u=x^2', c: C.green },
    { y: 260, lo: -1.2, hi: 1.2, a: y0, b: y1, name: 'y=\\sin u', c: C.red },
  ]
  const P = (l: (typeof lines)[number], v: number) => L.x + ((v - l.lo) / (l.hi - l.lo)) * L.w
  const r = (a: number, b: number) => (Math.abs(b) < 1e-9 ? 0 : a / b)
  return (
    <Fig
      w={560}
      h={300}
      controls={
        <>
          <Slider stack name="x" value={x} min={0.1} max={1.6} step={0.01} onChange={setX} />
          <Slider stack name="h" tex="\Delta x" value={h} min={0.01} max={0.4} step={0.01} onChange={setH} />
        </>
      }
      caption={
        <Tex
          block
          tex={`\\frac{\\Delta y}{\\Delta x}=\\textcolor{${C.red}}{\\frac{\\Delta y}{\\Delta u}}\\cdot\\textcolor{${C.green}}{\\frac{\\Delta u}{\\Delta x}}=${r2(r(y1 - y0, u1 - u0), 3)}\\times${r2(r(u1 - u0, h), 3)}=${r2(r(y1 - y0, h), 3)}\\quad\\to\\ \\cos(x^2)\\cdot2x=${r2(Math.cos(u0) * 2 * x, 3)}`}
        />
      }
    >
      {lines.map((l, i) => (
        <g key={l.name}>
          <line x1={L.x} x2={L.x + L.w} y1={l.y} y2={l.y} className="fig-axis" />
          <rect x={Math.min(P(l, l.a), P(l, l.b))} y={l.y - 7} width={Math.abs(P(l, l.b) - P(l, l.a))} height={14} fill={l.c} opacity={0.6} rx={3} />
          <TexAt x={L.x - 10} y={l.y} tex={l.name} anchor="end" size={13} color={l.c} />
          {i < 2 && (
            <>
              <Arrow x1={P(l, l.a)} y1={l.y + 10} x2={P(lines[i + 1], lines[i + 1].a)} y2={lines[i + 1].y - 10} color="var(--muted)" width={1.2} dashed />
              <Arrow x1={P(l, l.b)} y1={l.y + 10} x2={P(lines[i + 1], lines[i + 1].b)} y2={lines[i + 1].y - 10} color="var(--muted)" width={1.2} dashed />
            </>
          )}
        </g>
      ))}
    </Fig>
  )
}

/* ---------- ロルの定理 ---------- */

export function RolleFig() {
  const [m, setM] = useState(1.2)
  const [k, setK] = useState(0.6)
  const f = (x: number) => k * x * (x - 4) * (x - m)
  // f'(x) = k(3x² − 2(4+m)x + 4m)
  const A = 3
  const B = -2 * (4 + m)
  const Cc = 4 * m
  const D = B * B - 4 * A * Cc
  const cs = D < 0 ? [] : [(-B - Math.sqrt(D)) / (2 * A), (-B + Math.sqrt(D)) / (2 * A)].filter((c) => c > 0 && c < 4)
  const F = frame([-0.6, 4.6], [-4, 4], { x: 0, y: 0, w: 560, h: 300 })
  return (
    <Fig
      w={560}
      h={300}
      controls={
        <>
          <Slider stack name="m" tex="\text{形}" value={m} min={-1} max={5} step={0.01} onChange={setM} />
          <Slider stack name="k" tex="\text{高さ}" value={k} min={-1} max={1} step={0.01} onChange={setK} />
        </>
      }
      caption={
        <Tex
          block
          tex={`f(0)=f(4)=0\\ \\Rightarrow\\ f'(c)=0\\ \\text{となる}\\ c\\ \\text{が}\\ (0,4)\\ \\text{にある：}\\ ${cs.length ? cs.map((c) => `c=${r2(c)}`).join(',\\ ') : '\\text{（}f\\text{ が定数）}'}`}
        />
      }
    >
      <Axes f={F} />
      <path d={F.path(f)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      {[0, 4].map((x) => (
        <circle key={x} cx={F.X(x)} cy={F.Y(0)} r={5} fill="currentColor" />
      ))}
      <TexAt x={F.X(0) - 10} y={F.Y(0) + 14} tex="a" anchor="end" />
      <TexAt x={F.X(4) + 10} y={F.Y(0) + 14} tex="b" anchor="start" />
      {cs.map((c) => (
        <g key={c}>
          <line x1={F.X(c - 0.7)} x2={F.X(c + 0.7)} y1={F.Y(f(c))} y2={F.Y(f(c))} stroke={C.red} strokeWidth={2.5} />
          <circle cx={F.X(c)} cy={F.Y(f(c))} r={5} fill={C.red} />
          <line x1={F.X(c)} x2={F.X(c)} y1={F.Y(f(c))} y2={F.Y(0)} className="fig-dash" />
        </g>
      ))}
    </Fig>
  )
}

/* ---------- 最大値・最小値の定理 ---------- */

export function ExtremeValueFig() {
  const [a, setA] = useState(-2.5)
  const [b, setB] = useState(2.2)
  const [open, setOpen] = useState(false)
  const f = (x: number) => Math.sin(1.4 * x) + 0.3 * x
  const F = frame([-4, 4], [-2.2, 2.2], { x: 0, y: 0, w: 560, h: 280 })
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  let mx = lo
  let mn = lo
  for (let i = 0; i <= 600; i++) {
    const x = lo + ((hi - lo) * i) / 600
    if (f(x) > f(mx)) mx = x
    if (f(x) < f(mn)) mn = x
  }
  // 開区間で端にくる最大・最小は取れない
  const atEnd = (x: number) => Math.abs(x - lo) < 1e-9 || Math.abs(x - hi) < 1e-9
  const mark = (x: number, c: string, name: string) => {
    const miss = open && atEnd(x)
    return (
      <g>
        <circle cx={F.X(x)} cy={F.Y(f(x))} r={6} fill={miss ? 'var(--bg)' : c} stroke={c} strokeWidth={2} />
        <TexAt x={F.X(x)} y={F.Y(f(x)) + (name === '最大' ? -18 : 18)} tex={`\\text{${miss ? `${name}なし` : name}}`} color={c} size={12} />
      </g>
    )
  }
  return (
    <Fig
      w={560}
      h={280}
      controls={
        <>
          <Slider stack name="a" value={a} min={-4} max={4} step={0.01} onChange={setA} />
          <Slider stack name="b" value={b} min={-4} max={4} step={0.01} onChange={setB} />
          <label className="check">
            <input type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} /> 端を含めない（開区間）
          </label>
        </>
      }
      caption={
        <span className="hint">
          閉区間なら、どう動かしても最大・最小（赤・青の点）がある。開区間にすると、端で最大・最小になるときは取れなくなる（白抜きの点）。
        </span>
      }
    >
      <Axes f={F} />
      <path d={F.path(f)} stroke="var(--muted)" strokeWidth={1.5} fill="none" />
      <path d={F.path(f, lo, hi)} stroke={C.blue} strokeWidth={3} fill="none" />
      {[lo, hi].map((x) => (
        <line key={x} x1={F.X(x)} x2={F.X(x)} y1={0} y2={280} className="fig-dash" />
      ))}
      {mark(mx, C.red, '最大')}
      {mark(mn, C.blue, '最小')}
    </Fig>
  )
}

/* ---------- 導関数の符号と増減 ---------- */

export function MonotonicFig() {
  const [x, setX] = useState(-0.5)
  const f = (t: number) => t ** 3 - 3 * t
  const df = (t: number) => 3 * t * t - 3
  const F = frame([-2.4, 2.4], [-4, 4], { x: 0, y: 5, w: 560, h: 180 })
  const G = frame([-2.4, 2.4], [-4, 14.5], { x: 0, y: 215, w: 560, h: 150 })
  const segs: { a: number; b: number; up: boolean }[] = [
    { a: -2.4, b: -1, up: true },
    { a: -1, b: 1, up: false },
    { a: 1, b: 2.4, up: true },
  ]
  const s = df(x)
  return (
    <Fig
      w={560}
      h={370}
      controls={<Slider stack name="x" value={x} min={-2.3} max={2.3} step={0.01} onChange={setX} />}
      caption={
        <Tex
          block
          tex={`f'(${r2(x)})=${r2(s)}\\ ${Math.abs(s) < 0.05 ? '=0\\ \\text{（増減の切り替わり）}' : s > 0 ? `>0\\ \\Rightarrow\\ \\textcolor{${C.green}}{\\text{増加}}` : `<0\\ \\Rightarrow\\ \\textcolor{${C.red}}{\\text{減少}}`}`}
        />
      }
    >
      <Axes f={F} />
      {segs.map((g) => (
        <path key={g.a} d={F.path(f, g.a, g.b)} stroke={g.up ? C.green : C.red} strokeWidth={3} fill="none" />
      ))}
      <path d={F.path((t) => f(x) + s * (t - x), x - 0.8, x + 0.8)} stroke="currentColor" strokeWidth={1.5} fill="none" />
      <circle cx={F.X(x)} cy={F.Y(f(x))} r={5} fill="currentColor" />
      <TexAt x={540} y={F.Y(-3.4)} tex="y=f(x)" anchor="end" size={13} />
      <Axes f={G} />
      <path d={area(G, (t) => Math.max(0, df(t)), -2.4, 2.4)} fill={C.green} opacity={0.2} />
      <path d={area(G, (t) => Math.min(0, df(t)), -2.4, 2.4)} fill={C.red} opacity={0.25} />
      <path d={G.path(df)} stroke={C.purple} strokeWidth={2.2} fill="none" />
      <line x1={G.X(x)} x2={G.X(x)} y1={F.Y(f(x))} y2={G.Y(s)} className="fig-dash" />
      <circle cx={G.X(x)} cy={G.Y(s)} r={5} fill={C.purple} />
      <TexAt x={540} y={G.Y(-2.5)} tex="y=f'(x)" anchor="end" size={13} color={C.purple} />
    </Fig>
  )
}

/* ---------- ロピタルの定理: 0 の近くでは傾きの比 ---------- */

export function LhopitalFig() {
  const [x, setX] = useState(1.2)
  const f = (t: number) => Math.sin(2 * t)
  const g = (t: number) => Math.exp(t) - 1
  const F = frame([-1.5, 1.5], [-1.5, 3], { x: 0, y: 0, w: 560, h: 300 })
  return (
    <Fig
      w={560}
      h={300}
      controls={<Slider stack name="x" tex="x\ (\to0)" value={x} min={0.01} max={1.4} step={0.01} onChange={setX} />}
      caption={
        <>
          <Tex
            block
            tex={`\\frac{\\textcolor{${C.blue}}{f(x)}}{\\textcolor{${C.red}}{g(x)}}=\\frac{\\sin2x}{e^x-1}=${r2(f(x) / g(x), 3)}\\ \\xrightarrow{\\,x\\to0\\,}\\ \\frac{f'(0)}{g'(0)}=\\frac{2}{1}=2`}
          />
          <span className="hint">どちらも 0 に近づくところでは、2 つの曲線はほぼ接線（点線）と重なる。だから値の比は傾きの比に近づく。</span>
        </>
      }
    >
      <Axes f={F} grid step={0.5} />
      <path d={F.path((t) => 2 * t)} stroke={C.blue} strokeWidth={1.4} strokeDasharray="5 4" fill="none" />
      <path d={F.path((t) => t)} stroke={C.red} strokeWidth={1.4} strokeDasharray="5 4" fill="none" />
      <path d={F.path(f)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      <path d={F.path(g)} stroke={C.red} strokeWidth={2.5} fill="none" />
      <line x1={F.X(x)} x2={F.X(x)} y1={F.Y(0)} y2={F.Y(f(x))} stroke={C.blue} strokeWidth={4} />
      <line x1={F.X(x) + 6} x2={F.X(x) + 6} y1={F.Y(0)} y2={F.Y(g(x))} stroke={C.red} strokeWidth={4} />
      <TexAt x={F.X(1.45)} y={F.Y(f(1.45)) - 14} tex="\sin2x" color={C.blue} anchor="end" size={13} />
      <TexAt x={F.X(1.1)} y={F.Y(g(1.1)) - 14} tex="e^x-1" color={C.red} anchor="end" size={13} />
    </Fig>
  )
}

/* ---------- テイラー展開 ---------- */

const TAYLOR = {
  sin: { tex: '\\sin x', f: Math.sin, term: (k: number) => (k % 2 ? (k % 4 === 1 ? 1 : -1) : 0), yr: [-2.5, 2.5] as [number, number] },
  cos: { tex: '\\cos x', f: Math.cos, term: (k: number) => (k % 2 ? 0 : k % 4 === 0 ? 1 : -1), yr: [-2.5, 2.5] as [number, number] },
  exp: { tex: 'e^x', f: Math.exp, term: () => 1, yr: [-1, 8] as [number, number] },
}

export function TaylorFig() {
  const [k, setK] = useState<keyof typeof TAYLOR>('sin')
  const [n, setN] = useState(5)
  const T = TAYLOR[k]
  const fact = (m: number): number => (m <= 1 ? 1 : m * fact(m - 1))
  const p = (x: number) => {
    let s = 0
    for (let i = 0; i <= n; i++) s += (T.term(i) * x ** i) / fact(i)
    return s
  }
  const F = frame([-7, 7], T.yr, { x: 0, y: 0, w: 560, h: 300 })
  const terms: string[] = []
  for (let i = 0; i <= n; i++) {
    const c = T.term(i)
    if (!c) continue
    const body = i === 0 ? '1' : i === 1 ? 'x' : `\\frac{x^{${i}}}{${i}!}`
    terms.push(`${c < 0 ? '-' : terms.length ? '+' : ''}${body}`)
  }
  return (
    <Fig
      w={560}
      h={300}
      controls={
        <>
          <div className="chips">
            {(Object.keys(TAYLOR) as (keyof typeof TAYLOR)[]).map((id) => (
              <button key={id} className={`chip ${id === k ? 'on' : ''}`} onClick={() => setK(id)}>
                <Tex tex={TAYLOR[id].tex} />
              </button>
            ))}
          </div>
          <Slider stack name="n" tex="n\ (\text{次数})" value={n} min={0} max={15} step={1} onChange={setN} />
        </>
      }
      caption={<Tex block tex={`${T.tex}\\approx ${terms.slice(-6).join('')}${terms.length > 6 ? '\\ (\\text{最後の 6 項})' : ''}`} />}
    >
      <Axes f={F} grid />
      <path d={F.path(T.f)} stroke={C.blue} strokeWidth={3} fill="none" opacity={0.5} />
      <path d={F.path((x) => clamp(p(x), T.yr[0] - 50, T.yr[1] + 50), -7, 7, 400)} stroke={C.red} strokeWidth={2.2} fill="none" />
    </Fig>
  )
}

/* ---------- 置換積分: x の面積と u の面積が等しい ---------- */

export function SubstitutionFig() {
  const [b, setB] = useState(1.2)
  const L = frame([0, 1.8], [-1.2, 2.2], { x: 10, y: 20, w: 255, h: 260 })
  const R = frame([0, 3.3], [-1.2, 2.2], { x: 295, y: 20, w: 255, h: 260 })
  const fx = (x: number) => 2 * x * Math.cos(x * x)
  const fu = (u: number) => Math.cos(u)
  const val = Math.sin(b * b)
  return (
    <Fig
      w={560}
      h={300}
      controls={<Slider stack name="b" value={b} min={0.05} max={1.8} step={0.01} onChange={setB} />}
      caption={
        <Tex
          block
          tex={`\\int_0^{${r2(b)}}\\textcolor{${C.blue}}{2x\\cos(x^2)}\\,dx=\\int_0^{${r2(b * b)}}\\textcolor{${C.red}}{\\cos u}\\,du=\\sin(${r2(b * b)})=${r2(val, 3)}\\qquad(u=x^2)`}
        />
      }
    >
      <Axes f={L} />
      <path d={area(L, fx, 0, b)} fill={C.blue} opacity={0.3} />
      <path d={L.path(fx)} stroke={C.blue} strokeWidth={2.2} fill="none" />
      <TexAt x={L.X(0.9)} y={30} tex="x\ \text{で見る}" size={12} color="var(--muted)" />
      <Axes f={R} />
      <path d={area(R, fu, 0, b * b)} fill={C.red} opacity={0.3} />
      <path d={R.path(fu)} stroke={C.red} strokeWidth={2.2} fill="none" />
      <TexAt x={R.X(1.65)} y={30} tex="u=x^2\ \text{で見る}" size={12} color="var(--muted)" />
      <TexAt x={L.X(b)} y={L.Y(0) + 14} tex={`${r2(b)}`} size={11} />
      <TexAt x={R.X(b * b)} y={R.Y(0) + 14} tex={`${r2(b * b)}`} size={11} />
    </Fig>
  )
}

/* ---------- 区分求積法（リーマン和） ---------- */

export function RiemannSumFig() {
  const [n, setN] = useState(8)
  const [mode, setMode] = useState<'left' | 'mid' | 'right'>('left')
  const f = (x: number) => 1 + Math.sin(x) * 0.8 + x * 0.3
  const a = 0
  const b = 4
  const F = frame([-0.3, 4.3], [-0.3, 3.4], { x: 0, y: 0, w: 560, h: 300 })
  const dx = (b - a) / n
  const off = mode === 'left' ? 0 : mode === 'mid' ? 0.5 : 1
  const heights = Array.from({ length: n }, (_, i) => f(a + (i + off) * dx))
  const S = heights.reduce((s, y) => s + y * dx, 0)
  const bars = heights.map((y, i) => {
    const x = a + i * dx
    return <rect key={i} x={F.X(x)} y={F.Y(y)} width={F.X(x + dx) - F.X(x)} height={F.Y(0) - F.Y(y)} fill={C.orange} fillOpacity={0.4} stroke={C.orange} />
  })
  const exact = integrate(f, a, b)
  return (
    <Fig
      w={560}
      h={300}
      controls={
        <>
          <Slider stack name="n" tex="n\ (\text{分割数})" value={n} min={1} max={80} step={1} onChange={setN} />
          <div className="chips">
            {(['left', 'mid', 'right'] as const).map((m) => (
              <button key={m} className={`chip ${m === mode ? 'on' : ''}`} onClick={() => setMode(m)}>
                {{ left: '左端', mid: '中点', right: '右端' }[m]}で高さを取る
              </button>
            ))}
          </div>
        </>
      }
      caption={<Tex block tex={`\\sum_{k=1}^{${n}}f(x_k)\\,\\Delta x=${r2(S, 4)}\\ \\xrightarrow{\\,n\\to\\infty\\,}\\ \\int_0^4f(x)\\,dx=${r2(exact, 4)}\\quad(\\text{差 } ${r2(Math.abs(S - exact), 4)})`} />}
    >
      <Axes f={F} />
      {bars}
      <path d={F.path(f, a, b)} stroke={C.blue} strokeWidth={2.5} fill="none" />
    </Fig>
  )
}

/* ---------- 回転体の体積: 円板を積む ---------- */

export function SolidRevolutionFig() {
  const [n, setN] = useState(8)
  const f = (x: number) => 0.6 + Math.sqrt(x) * 0.7
  const a = 0
  const b = 4
  const F = frame([-0.3, 4.6], [-2.4, 2.4], { x: 0, y: 0, w: 560, h: 320 })
  const ry = (r: number) => F.Y(0) - F.Y(r) // 半径を画面の長さに
  const dx = (b - a) / n
  const radii = Array.from({ length: n }, (_, i) => f(a + (i + 0.5) * dx))
  const V = radii.reduce((s, r) => s + Math.PI * r * r * dx, 0)
  const discs = radii.map((r, i) => {
    const x = a + i * dx
    const x1 = F.X(x)
    const x2 = F.X(x + dx)
    const R = ry(r)
    const e = R * 0.28 // 横から見た円の幅
    return (
      <g key={i}>
        <path
          d={`M${x1},${F.Y(0) - R} L${x2},${F.Y(0) - R} A${e},${R} 0 0 1 ${x2},${F.Y(0) + R} L${x1},${F.Y(0) + R} A${e},${R} 0 0 1 ${x1},${F.Y(0) - R} Z`}
          fill={SERIES[i % 2 ? 0 : 2]}
          fillOpacity={0.35}
          stroke="currentColor"
          strokeOpacity={0.4}
        />
        <ellipse cx={x2} cy={F.Y(0)} rx={e} ry={R} fill={SERIES[i % 2 ? 0 : 2]} fillOpacity={0.25} stroke="currentColor" strokeOpacity={0.4} />
      </g>
    )
  })
  const exact = Math.PI * integrate((x) => f(x) ** 2, a, b)
  return (
    <Fig
      w={560}
      h={320}
      controls={<Slider stack name="n" tex="n\ (\text{円板の数})" value={n} min={2} max={60} step={1} onChange={setN} />}
      caption={<Tex block tex={`\\sum\\pi f(x_k)^2\\,\\Delta x=${r2(V, 3)}\\ \\xrightarrow{\\,n\\to\\infty\\,}\\ \\pi\\int_0^4f(x)^2\\,dx=${r2(exact, 3)}`} />}
    >
      <line x1={0} x2={560} y1={F.Y(0)} y2={F.Y(0)} className="fig-axis" />
      {discs}
      <path d={F.path(f, a, b)} stroke={C.red} strokeWidth={2.5} fill="none" />
      <path d={F.path((x) => -f(x), a, b)} stroke={C.red} strokeWidth={1.5} strokeDasharray="5 4" fill="none" />
      <TexAt x={F.X(4.1)} y={F.Y(f(4)) - 4} tex="y=f(x)" color={C.red} anchor="start" size={13} />
    </Fig>
  )
}

/* ---------- ガウス積分 ---------- */

export function GaussianIntegralFig() {
  const [R, setR] = useState(1)
  const f = (x: number) => Math.exp(-x * x)
  const F = frame([-3.2, 3.2], [-0.1, 1.15], { x: 0, y: 40, w: 560, h: 220 })
  const I = integrate(f, -R, R)
  return (
    <Fig
      w={560}
      h={260}
      controls={<Slider stack name="R" value={R} min={0.05} max={3.2} step={0.01} onChange={setR} />}
      caption={
        <>
          <Tex block tex={`\\int_{-${r2(R)}}^{${r2(R)}}e^{-x^2}\\,dx=${r2(I, 5)}\\ \\xrightarrow{\\,R\\to\\infty\\,}\\ \\sqrt\\pi=${r2(Math.sqrt(Math.PI), 5)}`} />
          <span className="hint">2 乗すると平面全体で <Tex tex="e^{-(x^2+y^2)}" /> を積分した量になり、極座標に直すと π になる。</span>
        </>
      }
    >
      <Axes f={F} />
      <path d={area(F, f, -R, R)} fill={C.purple} opacity={0.3} />
      <path d={F.path(f)} stroke={C.purple} strokeWidth={2.5} fill="none" />
      <rect x={20} y={16} width={(Math.min(I / Math.sqrt(Math.PI), 1) * 200) | 0} height={8} fill={C.purple} rx={4} />
      <rect x={20} y={16} width={200} height={8} fill="none" stroke={C.purple} rx={4} />
      <TexAt x={226} y={20} tex={`${r2((I / Math.sqrt(Math.PI)) * 100, 1)}\\%\\ \\text{of}\\ \\sqrt\\pi`} anchor="start" size={12} color={C.purple} />
    </Fig>
  )
}
