import { useState, type ReactNode } from 'react'
import { Tex } from '../components/Tex'
import { FIGURES } from '../figures'
import { FIELDS, THEOREMS } from '../lib/theorems'
import { hrefTo } from '../lib/route'
import { HeroCarousel } from '../hero/HeroCarousel'

const PALETTE = { blue: '#2e86ab', red: '#e4572e', green: '#3bb273', orange: '#f2a541', purple: '#a259ff' }

const QUAD = '(-b + sqrt(b^2 - 4*a*c)) / (2*a)'

/** 初めての人向けに、具体的な使い方を「動詞＋例」で見せる。href はその例を入れた状態のタブ */
const USECASES: { verb: string; tab: string; text: ReactNode; href: string; art: ReactNode }[] = [
  {
    verb: '動かす',
    tab: 'グラフ',
    text: <>放物線 <Tex tex="a(x-p)^2+q" /> の <Tex tex="a,p,q" /> をスライダーで動かし、形の変わり方を見る</>,
    href: hrefTo('graph', { f: 'a*(x - p)^2 + q' }),
    art: <ParabolaArt />,
  },
  {
    verb: '分解する',
    tab: '構造',
    text: <>解の公式を部品に分け、どこが分子・分母・判別式かと、それぞれの値を見る</>,
    href: hrefTo('structure', { f: QUAD }),
    art: <PartsArt />,
  },
  {
    verb: '展開する',
    tab: '変形',
    text: <><Tex tex="(a+b)^2" /> の展開を 1 手ずつ再生し、どこが書き換わったかを色で追う</>,
    href: hrefTo('steps', { f: '(a+b)^2' }),
    art: <ExpandArt />,
  },
  {
    verb: '体感する',
    tab: '図形',
    text: <>幅 <Tex tex="h" /> を縮めて、割線が接線に重なっていく＝微分を目で見る</>,
    href: hrefTo('geometry', { demo: 'deriv' }),
    art: <TangentArt />,
  },
  {
    verb: '確かめる',
    tab: '定理集',
    text: <>ベイズの定理を面積の図で確かめる。ほかにも {THEOREMS.length} 個の定理を図つきで</>,
    href: hrefTo('theorems', { q: 'bayes' }),
    art: <BayesArt />,
  },
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
            <span className="nowrap">数式が、</span>
            <br />
            <span className="nowrap">景色になる。</span>
          </h2>
          <p className="hero-lead">
            式を入れるとグラフになり、文字を動かせば形が変わる。定理も図で確かめられる。見て、触って、わかるための数学の道具。
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
        <HeroCarousel />
      </section>

      <section className="usecases">
        <h2 className="usecases-title">Mathscope でできること</h2>
        <p className="usecases-lead">気になるものを押すと、例の式が入った状態で開く。</p>
        <div className="features">
          {USECASES.map((u) => (
            <a key={u.verb} className="feature" href={u.href}>
              <div className="feature-art">{u.art}</div>
              <div className="feature-head">
                <h3>{u.verb}</h3>
                <span className="feature-tab">{u.tab}</span>
              </div>
              <p>{u.text}</p>
              <span className="feature-go">試す →</span>
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

      <section className="stats">
        <div><strong>5</strong><span>つの見方</span></div>
        <div><strong>{FIELDS.length}</strong><span>分野</span></div>
        <div><strong>{THEOREMS.length}</strong><span>個の定理</span></div>
        <div><strong>{figCount}</strong><span>個の動く図</span></div>
      </section>
    </div>
  )
}

/* ---------- 使い方カードの小さな絵 ---------- */

/** a を変えた放物線を重ねる */
function ParabolaArt() {
  const curve = (a: number, col: string, op: number) => {
    let d = ''
    for (let i = 0; i <= 60; i++) {
      const x = -2 + (4 * i) / 60
      const y = a * (x - 0.3) ** 2 - 1.2
      d += `${i ? 'L' : 'M'}${(100 + x * 45).toFixed(1)},${(70 - y * 22).toFixed(1)}`
    }
    return <path d={d} stroke={col} strokeWidth={2.2} fill="none" opacity={op} />
  }
  return (
    <svg viewBox="0 0 200 120">
      <line x1={0} x2={200} y1={70} y2={70} className="fig-axis" />
      <line x1={100} x2={100} y1={0} y2={120} className="fig-axis" />
      {curve(0.35, PALETTE.blue, 0.35)}
      {curve(0.7, PALETTE.blue, 0.6)}
      {curve(1.4, PALETTE.red, 1)}
      <line x1={30} x2={170} y1={110} y2={110} stroke="var(--border)" strokeWidth={4} strokeLinecap="round" />
      <circle cx={130} cy={110} r={6} fill={PALETTE.blue} />
    </svg>
  )
}

/** 解の公式を色分けして見せる */
function PartsArt() {
  return (
    <div className="feature-tex">
      <Tex
        block
        tex={`\\frac{\\textcolor{${PALETTE.red}}{-b}\\pm\\sqrt{\\textcolor{${PALETTE.green}}{b^2-4ac}}}{\\textcolor{${PALETTE.blue}}{2a}}`}
      />
      <div className="feature-legend">
        <span style={{ color: PALETTE.green }}>判別式</span>
        <span style={{ color: PALETTE.blue }}>分母</span>
      </div>
    </div>
  )
}

/** 展開の途中を 3 行で */
function ExpandArt() {
  return (
    <div className="feature-tex steps-mini">
      <Tex tex="(a+b)^2" />
      <Tex tex={`=\\textcolor{${PALETTE.green}}{(a+b)(a+b)}`} />
      <Tex tex={`=\\textcolor{${PALETTE.green}}{a^2+2ab+b^2}`} />
    </div>
  )
}

/** h を縮めると割線が接線に近づく */
function TangentArt() {
  const f = (x: number) => 0.18 * x ** 3 - 0.9 * x
  const X = (x: number) => 100 + x * 38
  const Y = (y: number) => 60 - y * 30
  const x0 = 1.2
  let d = ''
  for (let i = 0; i <= 60; i++) {
    const x = -2.6 + (5.2 * i) / 60
    d += `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(f(x)).toFixed(1)}`
  }
  const line = (m: number, col: string, op: number) => (
    <line x1={X(x0 - 2.4)} y1={Y(f(x0) - m * 2.4)} x2={X(x0 + 2.4)} y2={Y(f(x0) + m * 2.4)} stroke={col} strokeWidth={1.6} opacity={op} />
  )
  const sec = (h: number) => (f(x0 + h) - f(x0)) / h
  return (
    <svg viewBox="0 0 200 120">
      <path d={d} stroke={PALETTE.blue} strokeWidth={2.2} fill="none" />
      {line(sec(1.4), PALETTE.orange, 0.35)}
      {line(sec(0.8), PALETTE.orange, 0.6)}
      {line(0.54 * x0 * x0 - 0.9, PALETTE.green, 1)}
      <circle cx={X(x0)} cy={Y(f(x0))} r={4} fill={PALETTE.green} />
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
