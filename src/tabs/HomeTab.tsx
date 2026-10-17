import { useState, type ReactNode } from 'react'
import { Tex } from '../components/Tex'
import { FIGURES } from '../figures'
import { FIELDS, THEOREMS } from '../lib/theorems'
import { hrefTo } from '../lib/route'
import { useRaf } from '../lib/useRaf'

const PALETTE = { blue: '#2e86ab', red: '#e4572e', green: '#3bb273', orange: '#f2a541', purple: '#a259ff' }

const FEATURES: { tab: string; title: string; desc: string; art: ReactNode }[] = [
  { tab: 'graph', title: 'グラフ', desc: '式の中の文字がスライダーになる。動かすと形がどう変わるかがすぐ分かる。', art: <GraphArt /> },
  { tab: 'structure', title: '構造', desc: '式を部品に分けて、それぞれの役割と値を木の形で見る。', art: <TreeArt /> },
  { tab: 'geometry', title: '図形', desc: '単位円・接線・面積で、三角関数と微分積分を目で追う。', art: <CircleArt /> },
  { tab: 'steps', title: '変形', desc: '(a+b)² のような展開を 1 手ずつ再生。どこが変わったか色で分かる。', art: <StepsArt /> },
  { tab: 'theorems', title: '定理集', desc: `${FIELDS.length} 分野・${THEOREMS.length} 個の定理を、使いどころと動く図つきで。`, art: <BayesArt /> },
]

const PICKS = ['bayes', 'pythagoras', 'euler-formula', 'clt', 'ftc', 'diagonalization', 'euclid-algorithm', 'am-gm']

export function HomeTab() {
  const [q, setQ] = useState('')
  const figCount = THEOREMS.filter((t) => FIGURES[t.id]).length
  const picks = PICKS.map((id) => THEOREMS.find((t) => t.id === id)!).filter(Boolean)
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">Mathscope</p>
          <h2 className="hero-title">
            <span className="nowrap">数式を、</span>
            <br />
            <span className="nowrap">見て・触って・わかる。</span>
          </h2>
          <p className="hero-lead">
            式を入れるとグラフになり、文字を動かすと形が変わる。定理は図で確かめられる。
            暗記ではなく「なぜそうなるか」を目で追うための道具。
          </p>
          <div className="hero-cta">
            <a className="btn primary" href="#graph">グラフを触ってみる</a>
            <a className="btn" href="#theorems">定理集を見る</a>
          </div>
          <form
            className="hero-search"
            onSubmit={(e) => {
              e.preventDefault()
              location.hash = hrefTo('theorems', q.trim() ? { q: q.trim() } : {})
            }}
          >
            <input className="wide" placeholder="定理を探す（例：ベイズ、最大値、角度）" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn" type="submit">検索</button>
          </form>
        </div>
        <HeroArt />
      </section>

      <section className="stats">
        <div><strong>5</strong><span>つの見方</span></div>
        <div><strong>{FIELDS.length}</strong><span>分野</span></div>
        <div><strong>{THEOREMS.length}</strong><span>個の定理</span></div>
        <div><strong>{figCount}</strong><span>個の動く図</span></div>
      </section>

      <section>
        <h2 className="section-title">できること</h2>
        <div className="features">
          {FEATURES.map((f) => (
            <a key={f.tab} className="feature" href={`#${f.tab}`}>
              <div className="feature-art">{f.art}</div>
              <h3>{f.title} →</h3>
              <p>{f.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">図で見る定理から</h2>
        <div className="picks">
          {picks.map((t) => (
            <a key={t.id} className="pick" href={hrefTo('theorems', { q: t.id })}>
              <span className="pick-field">{FIELDS.find((f) => f.id === t.field)?.label}</span>
              <span className="pick-name">{t.name}</span>
              <span className="pick-tex">
                <Tex tex={t.statement} />
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

/* ---------- ヒーローのアニメーション：曲線上を虫眼鏡が動き、接線を見せる ---------- */

function HeroArt() {
  const [t, setT] = useState(0)
  useRaf(true, (dt) => setT((v) => v + dt))
  const W = 480
  const H = 360
  const f = (x: number) => 1.1 * Math.sin(1.3 * x + 0.4 * Math.sin(t * 0.5)) + 0.25 * x
  const df = (x: number) => 1.43 * Math.cos(1.3 * x + 0.4 * Math.sin(t * 0.5)) + 0.25
  const X = (x: number) => ((x + 4) / 8) * W
  const Y = (y: number) => H / 2 - y * 55
  let d = ''
  for (let i = 0; i <= 160; i++) {
    const x = -4 + (8 * i) / 160
    d += `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(f(x)).toFixed(1)}`
  }
  const px = 2.8 * Math.sin(t * 0.45)
  const py = f(px)
  const k = df(px)
  const cx = X(px)
  const cy = Y(py)
  const R = 62
  const L = 1.6
  return (
    <svg className="hero-art" viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <defs>
        <clipPath id="hero-lens">
          <circle cx={cx} cy={cy} r={R} />
        </clipPath>
      </defs>
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`v${i}`} x1={(i * W) / 8} x2={(i * W) / 8} y1={0} y2={H} className="fig-grid" />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={`h${i}`} y1={(i * H) / 6} y2={(i * H) / 6} x1={0} x2={W} className="fig-grid" />
      ))}
      <line x1={0} x2={W} y1={H / 2} y2={H / 2} className="fig-axis" />
      <line x1={W / 2} x2={W / 2} y1={0} y2={H} className="fig-axis" />
      <path d={d} fill="none" stroke={PALETTE.blue} strokeWidth={3} opacity={0.55} />

      {/* レンズの中は拡大表示 */}
      <circle cx={cx} cy={cy} r={R} fill="var(--surface)" />
      <g clipPath="url(#hero-lens)">
        <g transform={`translate(${cx} ${cy}) scale(1.8) translate(${-cx} ${-cy})`}>
          {Array.from({ length: 17 }, (_, i) => (
            <line key={`lv${i}`} x1={(i * W) / 16} x2={(i * W) / 16} y1={0} y2={H} className="fig-grid" />
          ))}
          {Array.from({ length: 13 }, (_, i) => (
            <line key={`lh${i}`} y1={(i * H) / 12} y2={(i * H) / 12} x1={0} x2={W} className="fig-grid" />
          ))}
          <path d={d} fill="none" stroke={PALETTE.blue} strokeWidth={2} />
          <line x1={X(px - L)} y1={Y(py - k * L)} x2={X(px + L)} y2={Y(py + k * L)} stroke={PALETTE.green} strokeWidth={1.6} />
          <circle cx={cx} cy={cy} r={3} fill={PALETTE.green} />
        </g>
      </g>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--text)" strokeWidth={5} />
      <line x1={cx + R * 0.72} y1={cy + R * 0.72} x2={cx + R * 1.25} y2={cy + R * 1.25} stroke={PALETTE.orange} strokeWidth={11} strokeLinecap="round" />
      <foreignObject x={Math.min(W - 170, cx + R * 0.9)} y={Math.max(4, cy - R - 34)} width={170} height={30} className="fig-fo">
        <div className="hero-slope">
          <Tex tex={`f'(x)=${k.toFixed(2)}`} />
        </div>
      </foreignObject>
    </svg>
  )
}

/* ---------- 機能カードの小さな絵 ---------- */

function GraphArt() {
  const curve = (a: number, b: number) => {
    let d = ''
    for (let i = 0; i <= 60; i++) {
      const x = (i / 60) * 200
      d += `${i ? 'L' : 'M'}${x},${60 - a * Math.sin((x / 200) * Math.PI * 2 * b) * 32}`
    }
    return d
  }
  return (
    <svg viewBox="0 0 200 120">
      <line x1={0} x2={200} y1={60} y2={60} className="fig-axis" />
      <path d={curve(0.4, 1)} stroke={PALETTE.blue} strokeWidth={2} fill="none" opacity={0.4} />
      <path d={curve(0.7, 1.5)} stroke={PALETTE.blue} strokeWidth={2} fill="none" opacity={0.7} />
      <path d={curve(1, 2)} stroke={PALETTE.red} strokeWidth={2.5} fill="none" />
      <line x1={30} x2={170} y1={108} y2={108} stroke="var(--border)" strokeWidth={4} strokeLinecap="round" />
      <circle cx={120} cy={108} r={7} fill={PALETTE.blue} />
    </svg>
  )
}

function TreeArt() {
  const nodes: [number, number, string][] = [
    [100, 18, PALETTE.blue],
    [55, 60, PALETTE.red],
    [145, 60, PALETTE.green],
    [30, 102, PALETTE.orange],
    [80, 102, PALETTE.orange],
    [125, 102, PALETTE.purple],
    [170, 102, PALETTE.purple],
  ]
  const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]]
  return (
    <svg viewBox="0 0 200 120">
      {edges.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} className="fig-thin" />
      ))}
      {nodes.map(([x, y, c], i) => (
        <circle key={i} cx={x} cy={y} r={11} fill={c} opacity={0.85} />
      ))}
      {['+', '×', '÷'].map((s, i) => (
        <text key={s} x={nodes[i][0]} y={nodes[i][1] + 5} textAnchor="middle" fill="#fff" fontSize={14} fontWeight={700}>
          {s}
        </text>
      ))}
    </svg>
  )
}

function CircleArt() {
  const th = 0.8
  const cx = 60
  const cy = 62
  const r = 44
  const px = cx + r * Math.cos(th)
  const py = cy - r * Math.sin(th)
  let wave = ''
  for (let i = 0; i <= 60; i++) {
    const a = (i / 60) * Math.PI * 2
    wave += `${i ? 'L' : 'M'}${115 + (a / (Math.PI * 2)) * 80},${cy - r * Math.sin(a)}`
  }
  return (
    <svg viewBox="0 0 200 120">
      <circle cx={cx} cy={cy} r={r} className="fig-thin" />
      <line x1={cx} y1={cy} x2={px} y2={cy} stroke={PALETTE.blue} strokeWidth={3} />
      <line x1={px} y1={cy} x2={px} y2={py} stroke={PALETTE.red} strokeWidth={3} />
      <line x1={cx} y1={cy} x2={px} y2={py} stroke="currentColor" strokeWidth={1.5} />
      <path d={wave} stroke={PALETTE.red} strokeWidth={2} fill="none" />
      <line x1={px} y1={py} x2={115 + (th / (Math.PI * 2)) * 80} y2={py} className="fig-dash" />
      <circle cx={px} cy={py} r={4} fill="currentColor" />
    </svg>
  )
}

function StepsArt() {
  const rows = [
    { w: 70, c: 'var(--muted)' },
    { w: 110, c: 'var(--muted)' },
    { w: 150, c: PALETTE.green },
    { w: 120, c: 'var(--muted)' },
  ]
  return (
    <svg viewBox="0 0 200 120">
      {rows.map((r, i) => (
        <g key={i}>
          <rect x={20} y={12 + i * 26} width={r.w} height={16} rx={5} fill={r.c} opacity={i === 2 ? 0.8 : 0.3} />
          {i === 2 && <rect x={60} y={12 + i * 26} width={50} height={16} rx={5} fill={PALETTE.red} opacity={0.8} />}
        </g>
      ))}
      <text x={180} y={78} textAnchor="end" fontSize={16} fill={PALETTE.green}>▶</text>
    </svg>
  )
}

function BayesArt() {
  const cols = [
    { w: 90, h: 0.25, c: PALETTE.blue },
    { w: 50, h: 0.6, c: PALETTE.red },
    { w: 30, h: 0.9, c: PALETTE.green },
  ]
  let x = 15
  return (
    <svg viewBox="0 0 200 120">
      {cols.map((c, i) => {
        const el = (
          <g key={i}>
            <rect x={x} y={12} width={c.w} height={96} fill={c.c} opacity={0.12} stroke={c.c} />
            <rect x={x} y={12 + 96 * (1 - c.h)} width={c.w} height={96 * c.h} fill={c.c} opacity={0.6} />
          </g>
        )
        x += c.w
        return el
      })}
    </svg>
  )
}
