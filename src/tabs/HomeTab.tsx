import { Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react'
import { Tex } from '../components/Tex'
import { FIGURE_IDS } from '../figures/ids'
import { FIELDS, THEOREMS } from '../lib/theorems'
import { hrefTo } from '../lib/route'
import { HeroCarousel } from '../hero/HeroCarousel'
import { BayesArt, ParabolaArt, PartsArt, TangentArt, TransformArt } from '../hero/usecaseArt'


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
    verb: '式変形を追う',
    tab: '式変形',
    text: <>展開・因数分解・方程式・微分を 1 手ずつ再生し、どこが書き換わったかを色で追う</>,
    href: hrefTo('steps', { mode: 'solve', f: 'x^2 - 5x + 6 = 0' }),
    art: <TransformArt />,
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

/** 書き方と読み方の対応（数式ライブラリを使わずに描けるよう、読み方は TeX で持つ） */
const READINGS: [string, string][] = [
  ['x² − 2x − 3', 'x^2-2x-3'],
  ['sin 2x', '\\sin(2x)'],
  ['√(x+4)', '\\sqrt{x+4}'],
  ['|x − 1|', '\\left|x-1\\right|'],
  ['ｘ＋１（全角）', 'x+1'],
  ['ax² + bx + c', 'a\\cdot x^2+b\\cdot x+c'],
  ['\\frac{1}{x+1}', '\\frac{1}{x+1}'],
  ['\\sqrt{x^{2}+1}', '\\sqrt{x^2+1}'],
  ['\\sin^2 x + \\cos^2 x', '\\sin(x)^2+\\cos(x)^2'],
]

// 入力欄は数式ライブラリ（mathjs）を使うので、節が画面に近づいてから読み込む
const InputDemo = lazy(() => import('../hero/InputDemo').then((m) => ({ default: m.InputDemo })))

function LazyInputDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return setNear(true)
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className="input-demo-wrap">
      {near && (
        <Suspense fallback={null}>
          <InputDemo />
        </Suspense>
      )}
    </div>
  )
}

const PICKS = ['bayes', 'pythagoras', 'euler-formula', 'clt', 'ftc', 'diagonalization', 'euclid-algorithm', 'am-gm']

export function HomeTab() {
  const [q, setQ] = useState('')
  const figCount = FIGURE_IDS.length
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

      <section className="input-section">
        <h2 className="usecases-title">普段の書き方でも、LaTeX でも。</h2>
        <p className="usecases-lead">x²、√x、sin 2x、全角の文字も、\frac や \sqrt を使った LaTeX も、そのまま入れられる。読み方が違うときは「読み取り」で教えてくれる。</p>
        <div className="input-grid">
          <table className="input-table">
            <thead>
              <tr>
                <th>こう書くと</th>
                <th>こう読む</th>
              </tr>
            </thead>
            <tbody>
              {READINGS.map(([raw, tex]) => (
                <tr key={raw}>
                  <td>
                    <code>{raw}</code>
                  </td>
                  <td>
                    <Tex tex={tex} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <LazyInputDemo />
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
