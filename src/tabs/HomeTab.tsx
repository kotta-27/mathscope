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
  ['log10 x、log_2 8', '\\log_{10}(x),\\ \\log_{2}(8)'],
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

/** トップで見せる定理と、カードに収まる短い代表式 */
const PICKS: [string, string][] = [
  ['bayes', 'P(A\\mid B)=\\frac{P(B\\mid A)\\,P(A)}{P(B)}'],
  ['pythagoras', 'a^2+b^2=c^2'],
  ['euler-formula', 'e^{i\\pi}+1=0'],
  ['clt', '\\bar X_n\\ \\to\\ N\\!\\left(\\mu,\\ \\tfrac{\\sigma^2}{n}\\right)'],
  ['ftc', '\\frac{d}{dx}\\int_a^x f(t)\\,dt=f(x)'],
  ['diagonalization', 'A\\vec v=\\lambda\\vec v'],
  ['euclid-algorithm', '\\gcd(a,b)=\\gcd(b,\\ a \\bmod b)'],
  ['am-gm', '\\frac{a+b}{2}\\ge\\sqrt{ab}'],
]

export function HomeTab() {
  const [q, setQ] = useState('')
  const figCount = FIGURE_IDS.length
  const picks = PICKS.flatMap(([id, tex]) => {
    const t = THEOREMS.find((x) => x.id === id)
    return t ? [{ t, tex }] : []
  })
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
        <SectionHead eyebrow="Features" title="Mathscope でできること" lead="気になるものを押すと、例の式が入った状態で開く。" />
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
        <SectionHead
          eyebrow="Input"
          title="数式をかんたんに入力"
          lead="x²、√x、sin 2x、全角の文字も、\frac や \sqrt を使った LaTeX も、そのまま入れられる。読み方が違うときは「読み取り」で教えてくれる。"
        />
        <div className="input-grid">
          <LazyInputDemo />
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
        </div>
      </section>

      <section>
        <SectionHead
          eyebrow="Theorems"
          title="図で見る定理"
          lead={`${THEOREMS.length} 個の定理のうち ${figCount} 個は、動かせる図つき。気になるものから開いてみる。`}
          link={{ href: '#theorems', label: '定理集をすべて見る →' }}
        />
        <div className="picks">
          {picks.map(({ t, tex }) => (
            <a key={t.id} className="pick" href={hrefTo('theorems', { q: t.id })}>
              <span className="pick-field">{FIELDS.find((f) => f.id === t.field)?.label}</span>
              <span className="pick-name">{t.name}</span>
              <span className="pick-tex">
                <Tex tex={tex} />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="closing">
        <div className="closing-text">
          <h2>まずは、式をひとつ入れてみる。</h2>
          <p>グラフにするところから始めても、定理を眺めるところから始めてもいい。</p>
          <div className="hero-cta">
            <a className="btn primary" href="#graph">グラフを触ってみる</a>
            <a className="btn" href="#theorems">定理集を見る</a>
          </div>
        </div>
        <dl className="closing-stats">
          <div><dt>見方</dt><dd>5</dd></div>
          <div><dt>分野</dt><dd>{FIELDS.length}</dd></div>
          <div><dt>定理</dt><dd>{THEOREMS.length}</dd></div>
          <div><dt>動く図</dt><dd>{figCount}</dd></div>
        </dl>
      </section>
    </div>
  )
}

/** セクションの見出し: 小さな英字ラベル → 見出し → 説明 */
function SectionHead({ eyebrow, title, lead, link }: { eyebrow: string; title: string; lead: string; link?: { href: string; label: string } }) {
  return (
    <header className="section-head">
      <p className="eyebrow">{eyebrow}</p>
      <div className="section-head-row">
        <h2>{title}</h2>
        {link && <a href={link.href}>{link.label}</a>}
      </div>
      <p className="section-lead">{lead}</p>
    </header>
  )
}
