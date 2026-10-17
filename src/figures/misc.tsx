import { useState } from 'react'
import { Slider } from '../components/Slider'
import { Tex } from '../components/Tex'
import { Axes, Fig, TexAt } from './common'
import { C, SERIES, frame, r2 } from './util'
import { useFig } from './state'

/* ---------- 解の公式 ---------- */

export function QuadraticFig() {
  const [a, setA] = useFig('a', 1)
  const [b, setB] = useFig('b', -2)
  const [c, setC] = useFig('c', -3)
  const F = frame([-6, 6], [-6, 6], { x: 0, y: 0, w: 560, h: 360 })
  const ax = -b / (2 * a)
  const D = b * b - 4 * a * c
  const half = D >= 0 ? Math.sqrt(D) / (2 * Math.abs(a)) : 0
  const vy = a * ax * ax + b * ax + c
  return (
    <Fig
      w={560}
      h={360}
      controls={
        <>
          <Slider stack name="a" value={a} min={-3} max={3} step={0.1} onChange={(v) => setA(Math.abs(v) < 0.1 ? 0.1 : v)} />
          <Slider stack name="b" value={b} min={-6} max={6} step={0.1} onChange={setB} />
          <Slider stack name="c" value={c} min={-6} max={6} step={0.1} onChange={setC} />
        </>
      }
      caption={
        <>
          <Tex
            block
            tex={`x=\\textcolor{${C.purple}}{\\underbrace{-\\frac{b}{2a}}_{\\text{軸 }${r2(ax)}}}\\pm\\textcolor{${C.orange}}{\\underbrace{\\frac{\\sqrt{D}}{2a}}_{${D >= 0 ? r2(half) : '\\text{虚数}'}}},\\qquad D=b^2-4ac=${r2(D)}`}
          />
          <span className="hint">2 つの解は軸 x = −b/2a から左右に同じ距離 √D/2|a| だけ離れている。D &lt; 0 だと放物線が x 軸に届かず実数解はない。</span>
        </>
      }
    >
      <Axes f={F} grid />
      <line x1={F.X(ax)} x2={F.X(ax)} y1={0} y2={360} stroke={C.purple} strokeWidth={1.5} strokeDasharray="6 4" />
      <path d={F.path((x) => a * x * x + b * x + c)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      {D >= 0 && (
        <>
          <line x1={F.X(ax)} x2={F.X(ax + half)} y1={F.Y(0) + 10} y2={F.Y(0) + 10} stroke={C.orange} strokeWidth={4} />
          <line x1={F.X(ax - half)} x2={F.X(ax)} y1={F.Y(0) + 10} y2={F.Y(0) + 10} stroke={C.orange} strokeWidth={4} />
          <circle cx={F.X(ax - half)} cy={F.Y(0)} r={5} fill={C.red} />
          <circle cx={F.X(ax + half)} cy={F.Y(0)} r={5} fill={C.red} />
        </>
      )}
      <circle cx={F.X(ax)} cy={F.Y(vy)} r={4} fill={C.purple} />
    </Fig>
  )
}

/* ---------- 等差数列の和 ---------- */

export function ArithmeticSumFig() {
  const [n, setN] = useFig('n', 6)
  const S = Math.min(36, 300 / (n + 1))
  const x0 = 40
  const y0 = 330
  return (
    <Fig
      w={560}
      h={350}
      controls={<Slider stack name="n" value={n} min={1} max={15} step={1} onChange={setN} />}
      caption={
        <>
          <Tex block tex={`2S=n(n+1)=${n}\\times${n + 1}\\ \\Rightarrow\\ S=1+2+\\cdots+${n}=${(n * (n + 1)) / 2}`} />
          <span className="hint">階段（青）と、それを逆さにした同じ階段（橙）を組み合わせると n × (n+1) の長方形になる。</span>
        </>
      }
    >
      {Array.from({ length: n }, (_, i) => {
        const k = i + 1
        return (
          <g key={k}>
            {Array.from({ length: n + 1 }, (_, j) => (
              <rect
                key={j}
                x={x0 + i * S}
                y={y0 - (j + 1) * S}
                width={S - 2}
                height={S - 2}
                fill={j < k ? C.blue : C.orange}
                opacity={j < k ? 0.75 : 0.45}
                rx={3}
              />
            ))}
          </g>
        )
      })}
      <TexAt x={x0 + (n * S) / 2} y={y0 + 14} tex={`n=${n}`} />
      <TexAt x={x0 + n * S + 10} y={y0 - ((n + 1) * S) / 2} tex={`n+1=${n + 1}`} anchor="start" />
    </Fig>
  )
}

/* ---------- 等比級数 ---------- */

export function GeometricSumFig() {
  const [n, setN] = useFig('n', 5)
  const L = 300
  const x0 = 130
  const y0 = 20
  const rects: { x: number; y: number; w: number; h: number }[] = []
  let x = x0
  let y = y0
  let w = L
  let h = L
  for (let k = 0; k < n; k++) {
    if (k % 2 === 0) {
      rects.push({ x, y, w: w / 2, h })
      x += w / 2
      w /= 2
    } else {
      rects.push({ x, y, w, h: h / 2 })
      y += h / 2
      h /= 2
    }
  }
  return (
    <Fig
      w={560}
      h={340}
      controls={<Slider stack name="n" value={n} min={1} max={12} step={1} onChange={setN} />}
      caption={
        <Tex block tex={`\\frac12+\\frac14+\\cdots+\\frac1{2^{${n}}}=1-\\frac1{2^{${n}}}=${r2(1 - 1 / 2 ** n, 5)}\\ \\xrightarrow{n\\to\\infty}\\ 1=\\frac{1/2}{1-1/2}`} />
      }
    >
      <rect x={x0} y={y0} width={L} height={L} fill="none" stroke="currentColor" strokeWidth={2} />
      {rects.map((r, k) => (
        <g key={k}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={SERIES[k % SERIES.length]} opacity={0.55} stroke="var(--surface)" />
          {r.w > 30 && r.h > 24 && <TexAt x={r.x + r.w / 2} y={r.y + r.h / 2} tex={`\\tfrac1{${2 ** (k + 1)}}`} color="#fff" size={14} />}
        </g>
      ))}
      <text x={x0 + L + 16} y={y0 + 20} className="fig-muted">面積 1 の正方形を</text>
      <text x={x0 + L + 16} y={y0 + 38} className="fig-muted">半分ずつ埋めていく</text>
    </Fig>
  )
}

/* ---------- パスカルの三角形（二項定理） ---------- */

export function PascalFig() {
  const [n, setN] = useFig('n', 5)
  const rows: number[][] = [[1]]
  for (let i = 1; i <= 9; i++) rows.push(rows[i - 1].map((v, j) => v + (rows[i - 1][j - 1] ?? 0)).concat(1))
  const dx = 48
  const dy = 34
  const cx = 280
  const term = (k: number) => {
    const c = rows[n][k]
    const pa = n - k ? `a${n - k > 1 ? `^{${n - k}}` : ''}` : ''
    const pb = k ? `b${k > 1 ? `^{${k}}` : ''}` : ''
    return `${c > 1 ? c : ''}${pa}${pb}`
  }
  return (
    <Fig
      w={560}
      h={385}
      controls={<Slider stack name="n" value={n} min={0} max={9} step={1} onChange={setN} />}
      caption={<Tex block tex={`(a+b)^{${n}}=${rows[n].map((_, k) => term(k)).join('+') || '1'}`} />}
    >
      {rows.map((row, i) =>
        row.map((v, j) => {
          const x = cx + (j - i / 2) * dx
          const y = 24 + i * dy
          const on = i === n
          const parent = i === n + 1 ? false : i === n - 1
          return (
            <g key={`${i}-${j}`}>
              <circle cx={x} cy={y} r={15} fill={on ? C.blue : parent ? C.orange : 'var(--surface-2)'} opacity={on ? 0.85 : parent ? 0.4 : 1} />
              <text x={x} y={y + 4} textAnchor="middle" className="fig-label" style={{ fontSize: v > 99 ? 10 : 12, fill: on ? '#fff' : undefined }}>
                {v}
              </text>
            </g>
          )
        }),
      )}
      <text x={20} y={376} className="fig-muted">各数は左上と右上の和。n 段目が (a+b)ⁿ の係数 = nCk</text>
    </Fig>
  )
}

/* ---------- ユークリッドの互除法 ---------- */

export function EuclidFig() {
  const [a, setA] = useFig('a', 21)
  const [b, setB] = useFig('b', 8)
  const big = Math.max(a, b)
  const small = Math.min(a, b)
  const sc = Math.min(500 / big, 280 / small)
  const squares: { x: number; y: number; s: number; step: number }[] = []
  const log: string[] = []
  let x = 30
  let y = 20
  let w = big
  let h = small
  let step = 0
  // 長方形から正方形を切り取り続ける
  while (w > 0 && h > 0 && squares.length < 200) {
    if (w >= h) {
      const q = Math.floor(w / h)
      log.push(`${w}=${q}\\times${h}+${w % h}`)
      for (let i = 0; i < q; i++) squares.push({ x: x + i * h * sc, y, s: h, step })
      x += q * h * sc
      w -= q * h
    } else {
      const q = Math.floor(h / w)
      log.push(`${h}=${q}\\times${w}+${h % w}`)
      for (let i = 0; i < q; i++) squares.push({ x, y: y + i * w * sc, s: w, step })
      y += q * w * sc
      h -= q * w
    }
    step++
  }
  const g = Math.max(w, h)
  return (
    <Fig
      w={560}
      h={small * sc + 40}
      controls={
        <>
          <Slider stack name="a" value={a} min={1} max={60} step={1} onChange={setA} />
          <Slider stack name="b" value={b} min={1} max={60} step={1} onChange={setB} />
        </>
      }
      caption={
        <>
          <Tex block tex={`${log.join(',\\ ')}\\ \\Rightarrow\\ \\gcd(${a},${b})=\\textcolor{${SERIES[(step - 1) % SERIES.length]}}{${g}}`} />
          <span className="hint">{big}×{small} の長方形から、できるだけ大きな正方形を切り取り続ける。最後に残る正方形の一辺が最大公約数で、それで全体を隙間なく敷き詰められる。</span>
        </>
      }
    >
      <rect x={30} y={20} width={big * sc} height={small * sc} fill="none" stroke="currentColor" strokeWidth={2} />
      {squares.map((q, i) => (
        <rect key={i} x={q.x} y={q.y} width={q.s * sc} height={q.s * sc} fill={SERIES[q.step % SERIES.length]} opacity={0.55} stroke="var(--surface)" strokeWidth={1.5} />
      ))}
    </Fig>
  )
}

/* ---------- 中国剰余定理 ---------- */

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)

export function CrtFig() {
  const [m, setM] = useFig('m', 3)
  const [n, setN] = useFig('n', 5)
  const [hi, setHi] = useState<number | null>(null)
  const cells: number[][][] = Array.from({ length: m }, () => Array.from({ length: n }, () => []))
  for (let x = 0; x < m * n; x++) cells[x % m][x % n].push(x)
  const S = Math.min(56, 480 / n, 260 / m)
  const coprime = gcd(m, n) === 1
  return (
    <Fig
      w={560}
      h={330}
      controls={
        <>
          <Slider stack name="m" value={m} min={2} max={7} step={1} onChange={setM} />
          <Slider stack name="n" value={n} min={2} max={9} step={1} onChange={setN} />
        </>
      }
      caption={
        <>
          <Tex
            block
            tex={
              coprime
                ? `\\gcd(${m},${n})=1:\\ 0\\sim${m * n - 1}\\text{ の数が表のマスにちょうど 1 つずつ入る}`
                : `\\gcd(${m},${n})=${gcd(m, n)}\\ne1:\\ \\textcolor{${C.red}}{\\text{空のマスと重複するマスができる}}`
            }
          />
          <span className="hint">x を「{m} で割った余り（行）」「{n} で割った余り（列）」のマスに置く。互いに素なら余りの組み合わせ 1 つにつき x が 1 つだけ決まる。</span>
        </>
      }
    >
      <text x={60 + (n * S) / 2} y={18} textAnchor="middle" className="fig-muted">x mod {n}</text>
      <text x={14} y={40 + (m * S) / 2} className="fig-muted" transform={`rotate(-90 14 ${40 + (m * S) / 2})`} textAnchor="middle">x mod {m}</text>
      {cells.map((row, i) =>
        row.map((xs, j) => {
          const on = hi !== null && xs.includes(hi)
          return (
            <g key={`${i}-${j}`} onMouseEnter={() => setHi(xs[0] ?? null)} onMouseLeave={() => setHi(null)}>
              <rect
                x={60 + j * S}
                y={40 + i * S}
                width={S - 3}
                height={S - 3}
                rx={4}
                fill={xs.length === 0 ? 'transparent' : xs.length > 1 ? C.red : on ? C.blue : C.green}
                opacity={xs.length ? (on ? 0.8 : 0.3) : 1}
                stroke="var(--border)"
              />
              <text x={60 + j * S + (S - 3) / 2} y={40 + i * S + (S - 3) / 2 + 4} textAnchor="middle" className="fig-label" style={{ fontSize: xs.length > 1 ? 10 : 13 }}>
                {xs.join(',')}
              </text>
            </g>
          )
        }),
      )}
      {Array.from({ length: n }, (_, j) => (
        <text key={j} x={60 + j * S + (S - 3) / 2} y={34} textAnchor="middle" className="fig-muted">{j}</text>
      ))}
      {Array.from({ length: m }, (_, i) => (
        <text key={i} x={50} y={40 + i * S + S / 2} textAnchor="end" className="fig-muted">{i}</text>
      ))}
    </Fig>
  )
}

/* ---------- 約数の個数（素因数分解） ---------- */

export function DivisorGridFig() {
  const [e2, setE2] = useFig('e2', 3)
  const [e3, setE3] = useFig('e3', 2)
  const S = Math.min(64, 440 / (e2 + 1), 250 / (e3 + 1))
  const N = 2 ** e2 * 3 ** e3
  return (
    <Fig
      w={560}
      h={310}
      controls={
        <>
          <Slider stack name="p" tex="2\text{ の指数}" value={e2} min={0} max={6} step={1} onChange={setE2} />
          <Slider stack name="q" tex="3\text{ の指数}" value={e3} min={0} max={4} step={1} onChange={setE3} />
        </>
      }
      caption={
        <Tex block tex={`${N}=2^{${e2}}\\cdot3^{${e3}}\\ \\Rightarrow\\ \\text{約数の個数}=(${e2}+1)(${e3}+1)=${(e2 + 1) * (e3 + 1)}`} />
      }
    >
      {Array.from({ length: e3 + 1 }, (_, j) =>
        Array.from({ length: e2 + 1 }, (_, i) => (
          <g key={`${i}-${j}`}>
            <rect x={70 + i * S} y={30 + j * S} width={S - 4} height={S - 4} rx={6} fill={C.blue} opacity={0.12 + 0.12 * (i + j)} />
            <text x={70 + i * S + (S - 4) / 2} y={30 + j * S + (S - 4) / 2 + 5} textAnchor="middle" className="fig-label" style={{ fontSize: 13 }}>
              {2 ** i * 3 ** j}
            </text>
          </g>
        )),
      )}
      {Array.from({ length: e2 + 1 }, (_, i) => (
        <TexAt key={i} x={70 + i * S + (S - 4) / 2} y={16} tex={`2^{${i}}`} color={C.red} size={13} />
      ))}
      {Array.from({ length: e3 + 1 }, (_, j) => (
        <TexAt key={j} x={56} y={30 + j * S + (S - 4) / 2} tex={`3^{${j}}`} color={C.green} size={13} anchor="end" />
      ))}
    </Fig>
  )
}

/* ---------- 相加平均・相乗平均 ---------- */

export function AmGmFig() {
  const [a, setA] = useFig('a', 5)
  const [b, setB] = useFig('b', 2)
  const sc = 420 / (a + b)
  const R = ((a + b) / 2) * sc
  const x0 = 70
  const base = 300
  const cx = x0 + R
  const px = x0 + a * sc
  const h = Math.sqrt(a * b) * sc
  return (
    <Fig
      w={560}
      h={320}
      controls={
        <>
          <Slider stack name="a" value={a} min={0.2} max={10} step={0.1} onChange={setA} />
          <Slider stack name="b" value={b} min={0.2} max={10} step={0.1} onChange={setB} />
        </>
      }
      caption={
        <>
          <Tex block tex={`\\textcolor{${C.red}}{\\frac{a+b}{2}=${r2((a + b) / 2)}}\\ \\ge\\ \\textcolor{${C.blue}}{\\sqrt{ab}=${r2(Math.sqrt(a * b))}}`} />
          <span className="hint">直径 a+b の半円で、半径（赤）が相加平均、分割点から立てた垂線（青）が相乗平均（方べきの定理より h² = ab）。垂線は半径より長くなれず、等しいのは a = b で中心に立つときだけ。</span>
        </>
      }
    >
      <path d={`M${x0},${base} A${R},${R} 0 0 1 ${x0 + 2 * R},${base}`} className="fig-thin" />
      <line x1={x0} x2={x0 + 2 * R} y1={base} y2={base} stroke="currentColor" strokeWidth={2} />
      <line x1={cx} y1={base} x2={cx} y2={base - R} stroke={C.red} strokeWidth={3} />
      <line x1={px} y1={base} x2={px} y2={base - h} stroke={C.blue} strokeWidth={3} />
      <line x1={x0} y1={base} x2={px} y2={base - h} className="fig-dash" />
      <line x1={x0 + 2 * R} y1={base} x2={px} y2={base - h} className="fig-dash" />
      <TexAt x={(x0 + px) / 2} y={base + 16} tex="a" />
      <TexAt x={(px + x0 + 2 * R) / 2} y={base + 16} tex="b" />
      <TexAt x={cx + (px > cx ? -8 : 8)} y={base - R / 2} tex="\frac{a+b}{2}" color={C.red} anchor={px > cx ? 'end' : 'start'} size={13} />
      <TexAt x={px + (px > cx ? 8 : -8)} y={base - h / 2} tex="\sqrt{ab}" color={C.blue} anchor={px > cx ? 'start' : 'end'} size={13} />
    </Fig>
  )
}

/* ---------- イェンセンの不等式 ---------- */

export function JensenFig() {
  const [x1, setX1] = useFig('x1', -2.2)
  const [x2, setX2] = useFig('x2', 2.5)
  const [lam, setLam] = useFig('lam', 0.4)
  const f = (x: number) => 0.25 * x * x + 0.15 * x + 0.5
  const F = frame([-3.2, 3.2], [0, 3.6], { x: 20, y: 10, w: 520, h: 290 })
  const xm = lam * x1 + (1 - lam) * x2
  const chord = lam * f(x1) + (1 - lam) * f(x2)
  return (
    <Fig
      w={560}
      h={320}
      controls={
        <>
          <Slider stack name="x1" tex="x_1" value={x1} min={-3} max={3} step={0.05} onChange={setX1} />
          <Slider stack name="x2" tex="x_2" value={x2} min={-3} max={3} step={0.05} onChange={setX2} />
          <Slider stack name="l" tex="\lambda" value={lam} min={0} max={1} step={0.01} onChange={setLam} />
        </>
      }
      caption={
        <>
          <Tex block tex={`\\textcolor{${C.blue}}{f(\\lambda x_1+(1-\\lambda)x_2)=${r2(f(xm))}}\\ \\le\\ \\textcolor{${C.red}}{\\lambda f(x_1)+(1-\\lambda)f(x_2)=${r2(chord)}}`} />
          <span className="hint">下に凸な関数では、2 点を結ぶ弦（赤）がいつもグラフ（青）の上にある。</span>
        </>
      }
    >
      <Axes f={F} />
      <path d={F.path(f)} stroke={C.blue} strokeWidth={2.5} fill="none" />
      <line x1={F.X(x1)} y1={F.Y(f(x1))} x2={F.X(x2)} y2={F.Y(f(x2))} stroke={C.red} strokeWidth={2} />
      <line x1={F.X(xm)} x2={F.X(xm)} y1={F.Y(0)} y2={F.Y(chord)} className="fig-dash" />
      <circle cx={F.X(xm)} cy={F.Y(chord)} r={5} fill={C.red} />
      <circle cx={F.X(xm)} cy={F.Y(f(xm))} r={5} fill={C.blue} />
      <circle cx={F.X(x1)} cy={F.Y(f(x1))} r={4} fill="currentColor" />
      <circle cx={F.X(x2)} cy={F.Y(f(x2))} r={4} fill="currentColor" />
      <TexAt x={F.X(x1)} y={F.Y(0) - 10} tex="x_1" size={13} />
      <TexAt x={F.X(x2)} y={F.Y(0) - 10} tex="x_2" size={13} />
    </Fig>
  )
}
