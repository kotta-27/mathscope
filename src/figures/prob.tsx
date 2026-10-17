import { type CSSProperties } from 'react'
import { Slider } from '../components/Slider'
import { Tex } from '../components/Tex'
import { Fig, TexAt } from './common'
import { C, SERIES, frame, r2 } from './util'
import { useFig } from './state'

/* ---------- ベイズの定理 ---------- */

type BayesState = {
  names: string[]
  prior: number[]
  like: number[]
  a: string
  /** 表の見出し「〜になる確率」 */
  likeLabel: string
  /** 結果の問い。n は原因の名前 */
  ask: (n: string) => string
}

const BAYES_PRESETS: { label: string; s: BayesState }[] = [
  {
    label: '3 つの工場と不良品',
    s: { names: ['工場1', '工場2', '工場3'], prior: [0.5, 0.3, 0.2], like: [0.02, 0.05, 0.1], a: '不良品', likeLabel: '不良品になる確率', ask: (n) => `不良品が${n}で作られた確率` },
  },
  {
    label: '病気の検査',
    s: { names: ['病気', '健康'], prior: [0.01, 0.99], like: [0.99, 0.05], a: '陽性', likeLabel: '陽性になる確率', ask: (n) => `陽性だったとき、${n}である確率` },
  },
  {
    label: '自由に動かす',
    s: { names: ['B1', 'B2', 'B3'], prior: [0.4, 0.35, 0.25], like: [0.3, 0.6, 0.85], a: 'A', likeLabel: 'A が起こる確率', ask: (n) => `A が起きたとき、原因が ${n} である確率` },
  },
]

const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`

export function BayesFig() {
  const [s, setS] = useFig('s', BAYES_PRESETS[0].s)
  const [sel, setSel] = useFig('sel', 0)
  const k = s.prior.length
  const joint = s.prior.map((p, i) => p * s.like[i])
  const pa = joint.reduce((a, b) => a + b, 0)
  const post = joint.map((j) => j / pa)
  // 尤度が小さいと見えないので縦方向を拡大（比は変わらない）
  const maxLike = Math.max(...s.like)
  const zoom = maxLike > 0 && maxLike < 0.45 ? Math.min(20, Math.floor(0.85 / maxLike)) : 1

  const setPrior = (i: number, v: number) => {
    v = Math.min(0.98, Math.max(0.005, v))
    const rest = 1 - s.prior[i]
    const prior = s.prior.map((p, j) => (j === i ? v : rest > 0 ? (p / rest) * (1 - v) : (1 - v) / (k - 1)))
    setS({ ...s, prior })
  }
  const setLike = (i: number, v: number) => setS({ ...s, like: s.like.map((l, j) => (j === i ? v : l)) })

  const X0 = 20
  const Y0 = 40
  const BW = 440
  const BH = 260
  const xs = s.prior.reduce<number[]>((acc, p) => [...acc, acc[acc.length - 1] + p * BW], [X0])
  const BAR = 565
  const name = (i: number) => `\\text{${s.names[i]}}`
  const aTex = s.a === 'A' ? 'A' : `\\text{${s.a}}`

  // 事後確率バーの各区間
  const barYs = post.reduce<number[]>((acc, p) => [...acc, acc[acc.length - 1] + p * BH], [Y0])

  return (
    <Fig
      w={680}
      h={340}
      controls={
        <>
          <div className="chips">
            {BAYES_PRESETS.map((p) => (
              <button key={p.label} className={`chip ${p.s.names === s.names ? 'on' : ''}`} onClick={() => { setS(p.s); setSel(0) }}>
                {p.label}
              </button>
            ))}
          </div>
          {/* 計算表: 事前確率 × 起こる確率 = 同時確率 → 内訳の割合 */}
          <div className="bayes-table-wrap">
            <div className="bayes-table" role="table" aria-label="ベイズの定理の計算">
              <div className="bayes-row head" role="row">
                <span role="columnheader">原因</span>
                <span role="columnheader">事前確率</span>
                <span aria-hidden>×</span>
                <span role="columnheader">{s.likeLabel}</span>
                <span aria-hidden>=</span>
                <span role="columnheader">同時確率</span>
                <span role="columnheader">{s.a}の中での割合</span>
              </div>
              {s.names.map((n, i) => (
                <div key={n} className={`bayes-row ${sel === i ? 'on' : ''}`} role="row" onClick={() => setSel(i)} style={{ '--c': SERIES[i] } as CSSProperties}>
                  <span className="bayes-name" role="cell">
                    <span className="bayes-swatch" />
                    {n}
                  </span>
                  <label className="bayes-cell" role="cell">
                    <span className="bayes-num">{pct(s.prior[i])}</span>
                    <input type="range" min={0.005} max={0.98} step={0.005} value={s.prior[i]} aria-label={`${n}の事前確率`} onChange={(e) => setPrior(i, Number(e.target.value))} />
                  </label>
                  <span className="bayes-op" aria-hidden>×</span>
                  <label className="bayes-cell" role="cell">
                    <span className="bayes-num">{pct(s.like[i])}</span>
                    <input type="range" min={0} max={1} step={0.005} value={s.like[i]} aria-label={`${n}のとき${s.likeLabel}`} onChange={(e) => setLike(i, Number(e.target.value))} />
                  </label>
                  <span className="bayes-op" aria-hidden>=</span>
                  <span className="bayes-joint" role="cell">{pct(joint[i], 2)}</span>
                  <span className="bayes-post" role="cell">
                    <span className="bayes-bar">
                      <span style={{ width: `${post[i] * 100}%` }} />
                    </span>
                    <strong>{pct(post[i])}</strong>
                  </span>
                </div>
              ))}
              <div className="bayes-row foot" role="row">
                <span role="cell">合計</span>
                <span role="cell">100%</span>
                <span />
                <span />
                <span />
                <strong role="cell">{pct(pa, 2)}</strong>
                <span role="cell">← {s.a}になる確率 <Tex tex={`P(${aTex})`} /></span>
              </div>
            </div>
          </div>
          <div className="bayes-result" style={{ '--c': SERIES[sel] } as CSSProperties}>
            <span className="bayes-ask">
              {s.ask(s.names[sel])}
              <Tex tex={`P(${name(sel)}\\mid ${aTex})=${r2(joint[sel] * 100, 2)}\\%\\div ${r2(pa * 100, 2)}\\%`} />
            </span>
            <strong>{pct(post[sel])}</strong>
          </div>
        </>
      }
      caption={
        <span className="hint">
          図の列の幅が事前確率、色の部分の高さが「その原因のもとで{s.a}になる確率」。表の行か図の列を押すと、下の結果がその原因に切り替わる。
        </span>
      }
    >
      <text x={X0 + BW / 2} y={22} textAnchor="middle" className="fig-label">全事象 Ω</text>
      {s.prior.map((_, i) => {
        const x = xs[i]
        const w = xs[i + 1] - xs[i]
        const hA = s.like[i] * BH * zoom
        const col = SERIES[i]
        return (
          <g key={i} onClick={() => setSel(i)} style={{ cursor: 'pointer' }}>
            <rect x={x} y={Y0} width={w} height={BH} fill={col} opacity={0.1} />
            <rect x={x} y={Y0 + BH - hA} width={w} height={hA} fill={col} opacity={sel === i ? 0.75 : 0.45} />
            <rect x={x} y={Y0} width={w} height={BH} fill="none" stroke={col} strokeWidth={sel === i ? 3 : 1.2} />
            {w > 34 && <TexAt x={x + w / 2} y={Y0 + 18} tex={name(i)} color={col} />}
            {w > 34 && <TexAt x={x + w / 2} y={Y0 + 40} tex={`\\text{${r2(s.prior[i] * 100, 1)}\\%}`} color="var(--muted)" size={12} />}
            {w > (s.a.length + s.names[i].length) * 15 + 20 && hA > 24 && <TexAt x={x + w / 2} y={Y0 + BH - hA / 2} tex={`${aTex}\\cap ${name(i)}`} color="#fff" size={13} />}
          </g>
        )
      })}
      <rect x={X0} y={Y0} width={BW} height={BH} fill="none" stroke="var(--text)" strokeWidth={2} />

      <text x={BAR + 30} y={22} textAnchor="middle" className="fig-label">{s.a} の内訳</text>
      {post.map((p, i) => (
        <g key={i} onClick={() => setSel(i)} style={{ cursor: 'pointer' }}>
          <rect x={BAR} y={barYs[i]} width={60} height={Math.max(0, p * BH)} fill={SERIES[i]} opacity={sel === i ? 0.85 : 0.5} stroke="var(--surface)" />
          {p * BH > 16 && <TexAt x={BAR + 66} y={barYs[i] + (p * BH) / 2} tex={`\\text{${r2(p * 100, 1)}\\%}`} color={SERIES[i]} anchor="start" size={13} />}
        </g>
      ))}
      <rect x={BAR} y={Y0} width={60} height={BH} fill="none" stroke="var(--text)" strokeWidth={1.5} />
      <line x1={X0 + BW + 6} x2={BAR - 6} y1={Y0 + BH / 2} y2={Y0 + BH / 2} className="fig-dash" />
      <text x={(X0 + BW + BAR) / 2} y={Y0 + BH / 2 - 8} textAnchor="middle" className="fig-muted">集める</text>
      {zoom > 1 && (
        <text x={X0 + BW} y={Y0 + BH + 18} textAnchor="end" className="fig-muted">
          ※ 見やすさのため色の部分を縦に ×{zoom} 拡大（比率は同じ）
        </text>
      )}
    </Fig>
  )
}

/* ---------- 包除原理 ---------- */

export function InclusionExclusionFig() {
  const [d, setD] = useFig('d', 110)
  const R = 100
  const lens = d >= 2 * R ? 0 : 2 * R * R * Math.acos(d / (2 * R)) - (d / 2) * Math.sqrt(4 * R * R - d * d)
  const area = Math.PI * R * R
  const u = 2 * area - lens
  const pct = (v: number) => r2((v / area) * 100, 0)
  const cy = 150
  const cx = 300
  return (
    <Fig
      w={600}
      h={300}
      controls={<Slider stack name="d" tex="d" value={d} min={0} max={220} step={1} onChange={setD} />}
      caption={
        <Tex
          block
          tex={`|A\\cup B|=\\textcolor{${C.red}}{|A|}+\\textcolor{${C.blue}}{|B|}-\\textcolor{${C.purple}}{|A\\cap B|}=${pct(area)}+${pct(area)}-${pct(lens)}=${pct(u)}`}
        />
      }
    >
      <rect x={20} y={20} width={560} height={260} fill="none" className="fig-thin" />
      <text x={36} y={42} className="fig-muted">Ω</text>
      <circle cx={cx - d / 2} cy={cy} r={R} fill={C.red} opacity={0.3} stroke={C.red} strokeWidth={2} />
      <circle cx={cx + d / 2} cy={cy} r={R} fill={C.blue} opacity={0.3} stroke={C.blue} strokeWidth={2} />
      <TexAt x={cx - d / 2 - R / 2} y={cy} tex="A" color={C.red} size={20} />
      <TexAt x={cx + d / 2 + R / 2} y={cy} tex="B" color={C.blue} size={20} />
      {lens > 0 && <text x={cx} y={cy + 5} textAnchor="middle" className="fig-label" style={{ fill: C.purple, fontWeight: 600, fontSize: 12 }}>2回数えた</text>}
    </Fig>
  )
}

/* ---------- 条件付き確率 ---------- */

export function ConditionalFig() {
  const [a, setA] = useFig('a', 0.45)
  const [bx, setBx] = useFig('bx', 0.3)
  const bw = 0.45
  const bTop = 0.2
  const bH = 0.6
  const W = 260
  const H = 220
  const ov = Math.max(0, Math.min(a, bx + bw) - Math.max(0, bx))
  const pAB = ov * bH
  const pBgA = pAB / a
  const L = { x: 20, y: 40 }
  const Rt = { x: 340, y: 40 }
  return (
    <Fig
      w={620}
      h={290}
      controls={
        <>
          <Slider stack name="a" tex="P(A)" value={a} min={0.1} max={1} onChange={setA} />
          <Slider stack name="b" tex="B\text{ の位置}" value={bx} min={0} max={1 - bw} onChange={setBx} />
        </>
      }
      caption={
        <Tex
          block
          tex={`P(B\\mid A)=\\frac{P(A\\cap B)}{P(A)}=\\frac{${r2(pAB, 3)}}{${r2(a, 3)}}=${r2(pBgA, 3)}\\qquad(P(B)=${r2(bw * bH, 3)})`}
        />
      }
    >
      <text x={L.x + W / 2} y={24} textAnchor="middle" className="fig-label">全体 Ω</text>
      <rect x={L.x} y={L.y} width={W} height={H} className="fig-thin" />
      <rect x={L.x} y={L.y} width={a * W} height={H} fill={C.red} opacity={0.18} />
      <rect x={L.x + bx * W} y={L.y + bTop * H} width={bw * W} height={bH * H} fill={C.blue} opacity={0.3} stroke={C.blue} />
      {ov > 0 && <rect x={L.x + Math.max(0, bx) * W} y={L.y + bTop * H} width={ov * W} height={bH * H} fill={C.purple} opacity={0.55} />}
      <TexAt x={L.x + 16} y={L.y + 14} tex="A" color={C.red} />
      <TexAt x={L.x + (bx + bw) * W - 14} y={L.y + bTop * H + 14} tex="B" color={C.blue} />
      <line x1={L.x + a * W} x2={L.x + a * W} y1={L.y} y2={L.y + H} stroke={C.red} strokeWidth={2} />

      <line x1={L.x + W + 14} x2={Rt.x - 14} y1={L.y + H / 2} y2={L.y + H / 2} className="fig-dash" />
      <text x={(L.x + W + Rt.x) / 2} y={L.y + H / 2 - 8} textAnchor="middle" className="fig-muted">A に絞る</text>

      <text x={Rt.x + W / 2} y={24} textAnchor="middle" className="fig-label">A を全体とみた世界</text>
      <rect x={Rt.x} y={Rt.y} width={W} height={H} fill={C.red} opacity={0.18} stroke={C.red} strokeWidth={2} />
      {ov > 0 && (
        <rect x={Rt.x + (Math.max(0, bx) / a) * W} y={Rt.y + bTop * H} width={(ov / a) * W} height={bH * H} fill={C.purple} opacity={0.55} />
      )}
      <TexAt x={Rt.x + W / 2} y={Rt.y + H + 22} tex={`\\text{紫の割合} = ${r2(pBgA * 100, 1)}\\%`} color={C.purple} size={14} />
    </Fig>
  )
}

/* ---------- 二項分布 ---------- */

const choose = (n: number, k: number) => {
  let r = 1
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i
  return r
}

export function BinomialDistFig() {
  const [n, setN] = useFig('n', 20)
  const [p, setP] = useFig('p', 0.3)
  const ps = Array.from({ length: n + 1 }, (_, k) => choose(n, k) * p ** k * (1 - p) ** (n - k))
  const max = Math.max(...ps)
  const f = frame([-0.5, n + 0.5], [0, max * 1.15], { x: 40, y: 20, w: 560, h: 220 })
  const mu = n * p
  const sd = Math.sqrt(n * p * (1 - p))
  const bw = (f.X(1) - f.X(0)) * 0.8
  return (
    <Fig
      w={620}
      h={270}
      controls={
        <>
          <Slider stack name="n" value={n} min={1} max={60} step={1} onChange={setN} />
          <Slider stack name="p" value={p} min={0.01} max={0.99} step={0.01} onChange={setP} />
        </>
      }
      caption={<Tex block tex={`E[X]=np=${r2(mu)},\\quad \\sigma=\\sqrt{np(1-p)}=${r2(sd)}`} />}
    >
      <rect x={f.X(mu - sd)} y={20} width={f.X(mu + sd) - f.X(mu - sd)} height={220} fill={C.orange} opacity={0.12} />
      {ps.map((v, k) => (
        <rect key={k} x={f.X(k) - bw / 2} y={f.Y(v)} width={bw} height={f.Y(0) - f.Y(v)} fill={C.blue} opacity={0.75} />
      ))}
      <line x1={f.X(mu)} x2={f.X(mu)} y1={20} y2={240} stroke={C.red} strokeWidth={2} />
      <TexAt x={f.X(mu)} y={12} tex={`np`} color={C.red} size={13} />
      <line x1={40} x2={600} y1={240} y2={240} className="fig-axis" />
      {ps.map((_, k) =>
        n <= 20 || k % 5 === 0 ? (
          <text key={k} x={f.X(k)} y={256} textAnchor="middle" className="fig-muted">{k}</text>
        ) : null,
      )}
    </Fig>
  )
}

/* ---------- 中心極限定理 ---------- */

export function CltFig() {
  const [n, setN] = useFig('n', 1)
  // n 個のサイコロの和の分布（畳み込み）
  let dist = [1]
  for (let i = 0; i < n; i++) {
    const next = new Array(dist.length + 6).fill(0)
    dist.forEach((v, s) => {
      for (let d = 1; d <= 6; d++) next[s + d] += v / 6
    })
    dist = next
  }
  const mu = 3.5 * n
  const sd = Math.sqrt((35 / 12) * n)
  const max = Math.max(...dist, 1 / (sd * Math.sqrt(2 * Math.PI)))
  const f = frame([n - 0.5, 6 * n + 0.5], [0, max * 1.12], { x: 30, y: 20, w: 570, h: 220 })
  const bw = Math.max(1, (f.X(1) - f.X(0)) * 0.85)
  const normal = (x: number) => Math.exp(-((x - mu) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI))
  return (
    <Fig
      w={620}
      h={270}
      controls={<Slider stack name="n" tex="n\ (\text{個})" value={n} min={1} max={30} step={1} onChange={setN} />}
      caption={
        <span className="hint">
          サイコロ 1 個の目は一様分布（平らな形）だが、n 個の和の分布は n を増やすと正規分布（赤線）に近づく。
        </span>
      }
    >
      {dist.map((v, s) =>
        s >= n ? <rect key={s} x={f.X(s) - bw / 2} y={f.Y(v)} width={bw} height={f.Y(0) - f.Y(v)} fill={C.blue} opacity={0.7} /> : null,
      )}
      {n > 1 && <path d={f.path(normal)} stroke={C.red} strokeWidth={2.5} fill="none" />}
      <line x1={30} x2={600} y1={240} y2={240} className="fig-axis" />
      <text x={f.X(n)} y={256} textAnchor="middle" className="fig-muted">{n}</text>
      <text x={f.X(6 * n)} y={256} textAnchor="middle" className="fig-muted">{6 * n}</text>
      <TexAt x={315} y={14} tex={`\\text{サイコロ } ${n} \\text{ 個の目の和の分布}`} size={13} color="var(--muted)" />
    </Fig>
  )
}
