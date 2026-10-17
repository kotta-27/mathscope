import { useState } from 'react'
import { Slider } from '../components/Slider'
import { Tex } from '../components/Tex'
import { Axes, Fig, TexAt } from './common'
import { C, frame, r2 } from './util'

/* ---------- 平均値の定理 ---------- */

export function MeanValueFig() {
  const [a, setA] = useState(-2.6)
  const [b, setB] = useState(2.2)
  const f = (x: number) => x ** 3 / 6 - x + 2
  const df = (x: number) => x * x / 2 - 1
  const F = frame([-3.2, 3.2], [-0.5, 5], { x: 10, y: 10, w: 540, h: 300 })
  const m = (f(b) - f(a)) / (b - a)
  const cs = [Math.sqrt(2 * (m + 1)), -Math.sqrt(2 * (m + 1))].filter((c) => c > a && c < b)
  const line = (x0: number, y0: number, k: number, col: string, w = 2) => (
    <line x1={F.X(-3.2)} y1={F.Y(y0 + k * (-3.2 - x0))} x2={F.X(3.2)} y2={F.Y(y0 + k * (3.2 - x0))} stroke={col} strokeWidth={w} />
  )
  return (
    <Fig
      w={560}
      h={320}
      controls={
        <>
          <Slider name="a" value={a} min={-3} max={b - 0.2} step={0.05} onChange={setA} />
          <Slider name="b" value={b} min={a + 0.2} max={3} step={0.05} onChange={setB} />
        </>
      }
      caption={
        <Tex
          block
          tex={`\\textcolor{${C.orange}}{\\frac{f(b)-f(a)}{b-a}=${r2(m, 3)}}=\\textcolor{${C.green}}{f'(c)}\\quad(c=${cs.map((c) => r2(c)).join(',\\ ')})`}
        />
      }
    >
      <Axes f={F} />
      {line(a, f(a), m, C.orange)}
      {cs.map((c) => (
        <g key={c}>
          {line(c, f(c), df(c), C.green)}
          <circle cx={F.X(c)} cy={F.Y(f(c))} r={5} fill={C.green} />
          <TexAt x={F.X(c)} y={F.Y(-0.25)} tex="c" color={C.green} />
          <line x1={F.X(c)} x2={F.X(c)} y1={F.Y(f(c))} y2={F.Y(0)} className="fig-dash" />
        </g>
      ))}
      <path d={F.path(f)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      <circle cx={F.X(a)} cy={F.Y(f(a))} r={5} fill={C.orange} />
      <circle cx={F.X(b)} cy={F.Y(f(b))} r={5} fill={C.orange} />
      <TexAt x={F.X(a)} y={F.Y(-0.25)} tex="a" />
      <TexAt x={F.X(b)} y={F.Y(-0.25)} tex="b" />
      <text x={20} y={30} className="fig-muted">平均の傾き（橙）と平行な接線（緑）が区間の中に必ずある</text>
    </Fig>
  )
}

/* ---------- 中間値の定理 ---------- */

export function IvtFig() {
  const [k, setK] = useState(0.5)
  const f = (x: number) => 0.3 * x ** 3 - x + 0.3 + 0.25 * Math.sin(3 * x)
  const a = -2.4
  const b = 2.4
  const F = frame([-2.8, 2.8], [-2.5, 2.5], { x: 10, y: 10, w: 540, h: 300 })
  const roots: number[] = []
  const N = 600
  for (let i = 0; i < N; i++) {
    const x1 = a + ((b - a) * i) / N
    const x2 = a + ((b - a) * (i + 1)) / N
    const g1 = f(x1) - k
    const g2 = f(x2) - k
    if (g1 === 0 || g1 * g2 < 0) roots.push(x1 - (g1 * (x2 - x1)) / (g2 - g1))
  }
  const lo = Math.min(f(a), f(b))
  const hi = Math.max(f(a), f(b))
  return (
    <Fig
      w={560}
      h={320}
      controls={<Slider name="k" value={k} min={lo} max={hi} step={0.01} onChange={setK} />}
      caption={
        <>
          <Tex block tex={`f(a)=${r2(f(a))}<k=${r2(k)}<f(b)=${r2(f(b))}\\ \\Rightarrow\\ f(c)=k\\ \\text{となる } c \\text{ が ${roots.length} 個}`} />
          <span className="hint">連続な曲線が下（f(a)）から上（f(b)）へ行くなら、途中の高さ k の線を必ず横切る。何個あるかまでは分からない。</span>
        </>
      }
    >
      <Axes f={F} />
      <rect x={F.X(a)} y={F.Y(hi)} width={F.X(b) - F.X(a)} height={F.Y(lo) - F.Y(hi)} fill={C.orange} opacity={0.07} />
      <line x1={F.X(-2.8)} x2={F.X(2.8)} y1={F.Y(k)} y2={F.Y(k)} stroke={C.orange} strokeWidth={2} />
      <path d={F.path(f, a, b)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      {roots.map((c, i) => (
        <g key={i}>
          <line x1={F.X(c)} x2={F.X(c)} y1={F.Y(k)} y2={F.Y(0)} className="fig-dash" />
          <circle cx={F.X(c)} cy={F.Y(k)} r={5} fill={C.green} />
        </g>
      ))}
      <circle cx={F.X(a)} cy={F.Y(f(a))} r={5} fill={C.blue} />
      <circle cx={F.X(b)} cy={F.Y(f(b))} r={5} fill={C.blue} />
      <TexAt x={F.X(a) - 8} y={F.Y(f(a))} tex="f(a)" anchor="end" size={13} />
      <TexAt x={F.X(b) + 8} y={F.Y(f(b))} tex="f(b)" anchor="start" size={13} />
      <TexAt x={F.X(2.6)} y={F.Y(k) - 14} tex="k" color={C.orange} />
    </Fig>
  )
}

/* ---------- 微分積分学の基本定理 ---------- */

export function FtcFig() {
  const [x, setX] = useState(3)
  const f = (t: number) => 1 + 0.6 * Math.sin(1.4 * t) + 0.15 * t
  const Fn = (t: number) => {
    // 数値積分（シンプソン）
    const n = 200
    const h = t / n
    let s = f(0) + f(t)
    for (let i = 1; i < n; i++) s += f(i * h) * (i % 2 ? 4 : 2)
    return (s * h) / 3
  }
  const top = frame([0, 6], [0, 2.5], { x: 30, y: 10, w: 520, h: 150 })
  const bot = frame([0, 6], [0, 10], { x: 30, y: 190, w: 520, h: 170 })
  const Fx = Fn(x)
  const fx = f(x)
  const dx = 0.15
  let area = `M${top.X(0)},${top.Y(0)}`
  for (let i = 0; i <= 100; i++) {
    const t = (x * i) / 100
    area += `L${top.X(t)},${top.Y(f(t))}`
  }
  area += `L${top.X(x)},${top.Y(0)}Z`
  return (
    <Fig
      w={560}
      h={380}
      controls={<Slider name="x" value={x} min={0.1} max={5.6} step={0.01} onChange={setX} />}
      caption={
        <>
          <Tex
            block
            tex={`\\textcolor{${C.blue}}{F(x)=\\int_0^x f(t)\\,dt=${r2(Fx)}},\\qquad F'(x)=\\textcolor{${C.red}}{\\text{接線の傾き}=${r2(fx)}}=f(x)`}
          />
          <span className="hint">x を少し増やすと、面積は「高さ f(x) × 幅 Δx」（赤の細い帯）だけ増える。だから面積関数 F の傾きは f(x) になる。</span>
        </>
      }
    >
      <line x1={30} x2={550} y1={top.Y(0)} y2={top.Y(0)} className="fig-axis" />
      <path d={area} fill={C.blue} opacity={0.25} />
      <rect x={top.X(x)} y={top.Y(fx)} width={top.X(x + dx) - top.X(x)} height={top.Y(0) - top.Y(fx)} fill={C.red} opacity={0.6} />
      <path d={top.path(f)} stroke="currentColor" strokeWidth={2} fill="none" />
      <TexAt x={top.X(5.6)} y={top.Y(f(5.6)) + 18} tex="f(t)" anchor="end" size={13} />
      <TexAt x={top.X(x / 2)} y={top.Y(0.5)} tex="F(x)" color={C.blue} />

      <line x1={30} x2={550} y1={bot.Y(0)} y2={bot.Y(0)} className="fig-axis" />
      <line x1={30} x2={30} y1={190} y2={360} className="fig-axis" />
      <path d={bot.path(Fn, 0, 6, 120)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      <line x1={bot.X(x - 1.2)} y1={bot.Y(Fx - 1.2 * fx)} x2={bot.X(x + 1.2)} y2={bot.Y(Fx + 1.2 * fx)} stroke={C.red} strokeWidth={2} />
      <circle cx={bot.X(x)} cy={bot.Y(Fx)} r={5} fill={C.blue} />
      <line x1={top.X(x)} x2={bot.X(x)} y1={top.Y(0)} y2={bot.Y(Fx)} className="fig-dash" />
      <TexAt x={bot.X(5.9)} y={bot.Y(Fn(5.9)) + 16} tex="F(x)" anchor="end" color={C.blue} size={13} />
    </Fig>
  )
}

/* ---------- 部分積分 ---------- */

export function ByPartsFig() {
  const [t1, setT1] = useState(3)
  const t0 = 1
  const u = (t: number) => t
  const v = (t: number) => 0.25 * t * t + 0.5
  const F = frame([0, 5], [0, 7], { x: 40, y: 10, w: 480, h: 320 })
  const u0 = u(t0)
  const u1 = u(t1)
  const v0 = v(t0)
  const v1 = v(t1)
  let curve = ''
  for (let i = 0; i <= 80; i++) {
    const t = t0 + ((t1 - t0) * i) / 80
    curve += `${i ? 'L' : 'M'}${F.X(u(t))},${F.Y(v(t))}`
  }
  const below = `${curve}L${F.X(u1)},${F.Y(0)}L${F.X(u0)},${F.Y(0)}Z`
  const left = `${curve}L${F.X(0)},${F.Y(v1)}L${F.X(0)},${F.Y(v0)}Z`
  const vdu = (0.25 * (u1 ** 3 - u0 ** 3)) / 3 + 0.5 * (u1 - u0)
  const udv = u1 * v1 - u0 * v0 - vdu
  return (
    <Fig
      w={560}
      h={350}
      controls={<Slider name="t" tex="\text{終点}" value={t1} min={1.3} max={4.6} step={0.01} onChange={setT1} />}
      caption={
        <>
          <Tex
            block
            tex={`\\textcolor{${C.red}}{\\int u\\,dv}+\\textcolor{${C.blue}}{\\int v\\,du}=\\bigl[uv\\bigr]=${r2(u1 * v1)}-${r2(u0 * v0)}\\quad(${r2(udv)}+${r2(vdu)})`}
          />
          <span className="hint">大きな長方形 u₁v₁ から小さな長方形 u₀v₀ を除いた L 字型が、曲線で 2 つに分かれる。下側が ∫v du、左側が ∫u dv。だから ∫u dv = [uv] − ∫v du。</span>
        </>
      }
    >
      <path d={below} fill={C.blue} opacity={0.3} />
      <path d={left} fill={C.red} opacity={0.3} />
      <rect x={F.X(0)} y={F.Y(v0)} width={F.X(u0) - F.X(0)} height={F.Y(0) - F.Y(v0)} fill="var(--muted)" opacity={0.15} />
      <path d={curve} stroke="currentColor" strokeWidth={2.5} fill="none" />
      <line x1={F.X(0)} x2={F.X(5)} y1={F.Y(0)} y2={F.Y(0)} className="fig-axis" />
      <line x1={F.X(0)} x2={F.X(0)} y1={F.Y(0)} y2={F.Y(7)} className="fig-axis" />
      <line x1={F.X(u1)} x2={F.X(u1)} y1={F.Y(0)} y2={F.Y(v1)} className="fig-dash" />
      <line x1={F.X(0)} x2={F.X(u1)} y1={F.Y(v1)} y2={F.Y(v1)} className="fig-dash" />
      <TexAt x={F.X(5)} y={F.Y(0) + 16} tex="u" anchor="end" />
      <TexAt x={F.X(0) - 8} y={F.Y(7)} tex="v" anchor="end" />
      <TexAt x={F.X(u0)} y={F.Y(0) + 16} tex="u_0" size={13} />
      <TexAt x={F.X(u1)} y={F.Y(0) + 16} tex="u_1" size={13} />
      <TexAt x={F.X(0) - 6} y={F.Y(v0)} tex="v_0" anchor="end" size={13} />
      <TexAt x={F.X(0) - 6} y={F.Y(v1)} tex="v_1" anchor="end" size={13} />
      <TexAt x={F.X((u0 + u1) / 2 + 0.3)} y={F.Y(v0 / 2)} tex="\int v\,du" color={C.blue} />
      <TexAt x={F.X(u0 * 0.6)} y={F.Y((v0 + v1) / 2 + 0.3)} tex="\int u\,dv" color={C.red} />
    </Fig>
  )
}
