import { Suspense, lazy, useEffect, useState } from 'react'
import { HomeTab } from './tabs/HomeTab'
import { readHash } from './lib/route'
import { HomeBackground } from './hero/HomeBackground'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Loader } from './components/Loader'
import { CopyLink } from './components/CopyLink'
import { PresentButton, ThemeButton } from './components/DisplayButtons'

// ホーム以外は開いたときに読み込む（数式ライブラリ mathjs をトップで読み込まないため）
const GraphTab = lazy(() => import('./tabs/GraphTab').then((m) => ({ default: m.GraphTab })))
const StructureTab = lazy(() => import('./tabs/StructureTab').then((m) => ({ default: m.StructureTab })))
const GeometryTab = lazy(() => import('./tabs/GeometryTab').then((m) => ({ default: m.GeometryTab })))
const StepsTab = lazy(() => import('./tabs/StepsTab').then((m) => ({ default: m.StepsTab })))
const TheoremsTab = lazy(() => import('./tabs/TheoremsTab').then((m) => ({ default: m.TheoremsTab })))

const TABS = [
  { id: 'home', label: 'ホーム', desc: '数式が、景色になる。', el: () => <HomeTab /> },
  { id: 'graph', label: 'グラフ', desc: 'パラメータを動かして形の変化を見る', el: () => <GraphTab /> },
  { id: 'structure', label: '構造', desc: '式を部品に分けて役割と値を見る', el: () => <StructureTab /> },
  { id: 'geometry', label: '図解', desc: '基本のしくみを動く図で見る（関数・微積・ベクトル・確率）', el: () => <GeometryTab /> },
  { id: 'steps', label: '式変形', desc: '展開・因数分解・平方完成・方程式・微分を 1 手ずつ追う', el: () => <StepsTab /> },
  { id: 'theorems', label: '定理', desc: '分野ごとの有名な定理と使いどころ', el: () => <TheoremsTab /> },
] as const

type TabId = (typeof TABS)[number]['id']

const currentTab = (): TabId => {
  const { tab } = readHash()
  return TABS.some((t) => t.id === tab) ? (tab as TabId) : 'home'
}

export default function App() {
  const [tab, setTab] = useState<TabId>(currentTab)
  // ハッシュ（#graph?f=... など）が変わったら、そのタブを作り直して読み込ませる
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const onHash = () => {
      setTab(currentTab())
      setHash(location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const current = TABS.find((t) => t.id === tab)!
  useEffect(() => {
    // 定理のページ（#theorems?id=...）は、そのページが定理の名前を書く
    if (tab === 'theorems' && readHash().params.get('id')) return
    document.title = tab === 'home' ? 'Mathscope | 数式が、景色になる。' : `${current.label} | Mathscope`
  }, [tab, current, hash])
  return (
    <>
    {tab === 'home' && <HomeBackground />}
    <div className="app">
      <header className="header">
        <a className="brand" href="#home">
          <img className="logo" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />
          <div>
            <h1>Math<span className="wordmark-scope">scope</span></h1>
            <p>{current.desc}</p>
          </div>
        </a>
        <div className="header-nav">
          <nav className="tabs">
            {TABS.filter((t) => t.id !== 'home').map((t) => (
              <button
                key={t.id}
                className={`tab ${tab === t.id ? 'on' : ''}`}
                aria-current={tab === t.id ? 'page' : undefined}
                // ハッシュを変えて履歴に残す（ブラウザの戻る・進むで行き来できる）
                onClick={() => {
                  // いまのタブを押しても、触った状態を消さない
                  if (t.id !== tab) location.hash = t.id
                }}
              >
                {t.label}
              </button>
            ))}
          </nav>
          {/* ホームでは使わないが、場所は取っておく（タブの位置がページごとにずれないように） */}
          <span className="header-tools" inert={tab === 'home'} data-hidden={tab === 'home' || undefined}>
            <CopyLink />
            <PresentButton />
          </span>
          <span className="theme-in-header">
            <ThemeButton />
          </span>
        </div>
      </header>
      <main key={`${tab}|${hash}`}>
        <ErrorBoundary label="このページ">
          <Suspense fallback={<Loader />}>{current.el()}</Suspense>
        </ErrorBoundary>
      </main>
      <footer className="site-footer">
        <a className="site-footer-brand" href="#home">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={22} height={22} />
          <span>Math<span className="wordmark-scope">scope</span></span>
        </a>
        <span>数式が、景色になる。</span>
        <a href="https://github.com/kotta-27/mathscope" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <span className="theme-in-footer">
          <ThemeButton />
        </span>
      </footer>
    </div>
    </>
  )
}
