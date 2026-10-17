import { useRef, useState } from 'react'
import { Tex } from '../components/Tex'
import { readHash } from '../lib/route'
import { useRaf } from '../lib/useRaf'
import { useVisible } from '../lib/useVisible'

/** トップの「できること」カードの絵。見えている間だけ動く */

const P = { blue: '#2e86ab', red: '#e4572e', green: '#3bb273', orange: '#f2a541', purple: '#a259ff', muted: '#7a7f87' }

const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** カードの時計。#home?t=8 のように時刻を指定すると、その時刻で止まる（確認用） */
function useCardTime<T extends Element>() {
  const ref = useRef<T>(null)
  const visible = useVisible(ref)
  const [fixed] = useState(() => {
    const v = Number(readHash().params.get('t'))
    return Number.isFinite(v) && v > 0 ? v : reducedMotion() ? 4.5 : null
  })
  const [t, setT] = useState(fixed ?? 0)
  useRaf(fixed === null && visible, (dt) => setT((v) => v + dt))
  return { ref, t }
}

const wave = (t: number, speed: number) => 0.5 - 0.5 * Math.cos(t * speed)
const clamp01 = (x: number) => Math.max(0, Math.min(1, x))

/* ---------- 動かす: スライダーに合わせて放物線の開き方が変わる ---------- */

export function ParabolaArt() {
  const { ref, t } = useCardTime<SVGSVGElement>()
  const a = 0.3 + 1.3 * wave(t, 1.1)
  const curve = (k: number) => {
    let d = ''
    for (let i = 0; i <= 60; i++) {
      const x = -2 + (4 * i) / 60
      const y = k * (x - 0.3) ** 2 - 1.2
      d += `${i ? 'L' : 'M'}${(100 + x * 45).toFixed(1)},${(70 - y * 22).toFixed(1)}`
    }
    return d
  }
  return (
    <svg ref={ref} viewBox="0 0 200 120" aria-hidden>
      <line x1={0} x2={200} y1={70} y2={70} className="fig-axis" />
      <line x1={100} x2={100} y1={0} y2={120} className="fig-axis" />
      <path d={curve(0.3)} stroke={P.blue} strokeWidth={1.6} fill="none" opacity={0.25} />
      <path d={curve(1.6)} stroke={P.blue} strokeWidth={1.6} fill="none" opacity={0.25} />
      <path d={curve(a)} stroke={P.red} strokeWidth={2.4} fill="none" />
      <line x1={30} x2={170} y1={110} y2={110} stroke="var(--border)" strokeWidth={4} strokeLinecap="round" />
      <line x1={30} x2={30 + 140 * ((a - 0.3) / 1.3)} y1={110} y2={110} stroke={P.blue} strokeWidth={4} strokeLinecap="round" />
      <circle cx={30 + 140 * ((a - 0.3) / 1.3)} cy={110} r={6} fill={P.blue} />
    </svg>
  )
}

/* ---------- 分解する: 解の公式の部品が順に光る ---------- */

const PARTS = [
  { color: P.red, name: '−b' },
  { color: P.green, name: '判別式' },
  { color: P.blue, name: '分母' },
]

export function PartsArt() {
  const { ref, t } = useCardTime<HTMLDivElement>()
  const k = Math.floor(t / 1.4) % PARTS.length
  const c = (i: number) => (i === k ? PARTS[i].color : P.muted)
  return (
    <div ref={ref} className="feature-tex" aria-hidden>
      <Tex block tex={`\\frac{\\textcolor{${c(0)}}{-b}\\pm\\sqrt{\\textcolor{${c(1)}}{b^2-4ac}}}{\\textcolor{${c(2)}}{2a}}`} />
      <div className="feature-legend">
        {PARTS.map((p, i) => (
          <span key={p.name} style={{ color: i === k ? p.color : P.muted, fontWeight: i === k ? 700 : 400 }}>
            {p.name}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------- 式変形を追う: 方程式を解く 3 行が 1 行ずつ現れる ---------- */

const LINES = [
  'x^2-5x+6=0',
  `\\textcolor{${P.green}}{(x-2)(x-3)}=0`,
  `x=\\textcolor{${P.green}}{2},\\ \\textcolor{${P.green}}{3}`,
]

export function TransformArt() {
  const { ref, t } = useCardTime<HTMLDivElement>()
  const cycle = 6
  const tt = t % cycle
  // 1.2 秒ごとに 1 行ずつ現れ、最後にまとめて消える
  const out = clamp01((tt - 5.3) / 0.6)
  return (
    <div ref={ref} className="feature-tex steps-mini" aria-hidden>
      {LINES.map((tex, i) => {
        const inn = clamp01((tt - 0.3 - i * 1.2) / 0.4)
        return (
          <div key={i} style={{ opacity: inn * (1 - out), transform: `translateY(${(1 - inn) * 6}px)` }}>
            <Tex tex={tex} />
          </div>
        )
      })}
    </div>
  )
}

/* ---------- 体感する: h が縮んで割線が接線に重なる ---------- */

export function TangentArt() {
  const { ref, t } = useCardTime<SVGSVGElement>()
  const f = (x: number) => 0.18 * x ** 3 - 0.9 * x
  const df = (x: number) => 0.54 * x * x - 0.9
  const X = (x: number) => 100 + x * 38
  const Y = (y: number) => 60 - y * 30
  const x0 = 1.2
  const phase = (t * 0.32) % 1
  const h = 1.5 * (1 - phase) ** 2 + 0.03
  const m = (f(x0 + h) - f(x0)) / h
  let d = ''
  for (let i = 0; i <= 60; i++) {
    const x = -2.6 + (5.2 * i) / 60
    d += `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(f(x)).toFixed(1)}`
  }
  const line = (k: number, col: string, op: number, w = 1.6) => (
    <line x1={X(x0 - 2.4)} y1={Y(f(x0) - k * 2.4)} x2={X(x0 + 2.4)} y2={Y(f(x0) + k * 2.4)} stroke={col} strokeWidth={w} opacity={op} />
  )
  return (
    <svg ref={ref} viewBox="0 0 200 120" aria-hidden>
      <path d={d} stroke={P.blue} strokeWidth={2.2} fill="none" />
      {line(df(x0), P.green, 0.9)}
      {line(m, P.orange, 1, 1.8)}
      <circle cx={X(x0 + h)} cy={Y(f(x0 + h))} r={3.5} fill={P.orange} />
      <circle cx={X(x0)} cy={Y(f(x0))} r={4} fill={P.green} />
    </svg>
  )
}

/* ---------- 確かめる: ベイズの面積図がゆっくり変わり、内訳も連動する ---------- */

export function BayesArt() {
  const { ref, t } = useCardTime<SVGSVGElement>()
  const w1 = 0.5 + 0.14 * Math.sin(t * 0.7)
  const w2 = 0.3 - 0.08 * Math.sin(t * 0.7 + 0.8)
  const prior = [w1, w2, 1 - w1 - w2]
  const like = [0.25 + 0.12 * Math.sin(t * 0.9 + 1), 0.6 + 0.15 * Math.sin(t * 0.8), 0.88 - 0.1 * Math.sin(t * 1.1 + 2)]
  const cols = [P.blue, P.red, P.green]
  const joint = prior.map((p, i) => p * like[i])
  const sum = joint.reduce((s, v) => s + v, 0)
  const X0 = 12
  const W = 140
  const Y0 = 12
  const H = 96
  let x = X0
  let by = Y0
  return (
    <svg ref={ref} viewBox="0 0 200 120" aria-hidden>
      {prior.map((p, i) => {
        const w = p * W
        const el = (
          <g key={i}>
            <rect x={x} y={Y0} width={w} height={H} fill={cols[i]} opacity={0.12} stroke={cols[i]} strokeWidth={0.8} />
            <rect x={x} y={Y0 + H * (1 - like[i])} width={w} height={H * like[i]} fill={cols[i]} opacity={0.65} />
          </g>
        )
        x += w
        return el
      })}
      {joint.map((j, i) => {
        const hh = (j / sum) * H
        const el = <rect key={i} x={166} y={by} width={22} height={hh} fill={cols[i]} opacity={0.8} />
        by += hh
        return el
      })}
      <rect x={166} y={Y0} width={22} height={H} fill="none" stroke="var(--text)" strokeOpacity={0.5} />
    </svg>
  )
}
