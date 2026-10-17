import { useEffect, useState } from 'react'
import { GraphTab } from './tabs/GraphTab'
import { StructureTab } from './tabs/StructureTab'
import { GeometryTab } from './tabs/GeometryTab'
import { StepsTab } from './tabs/StepsTab'
import { TheoremsTab } from './tabs/TheoremsTab'
import { HomeTab } from './tabs/HomeTab'
import { readHash } from './lib/route'
import { HomeBackground } from './hero/HomeBackground'

const TABS = [
  { id: 'home', label: 'ホーム', desc: '数式が、景色になる。', el: () => <HomeTab /> },
  { id: 'graph', label: 'グラフ', desc: 'パラメータを動かして形の変化を見る', el: () => <GraphTab /> },
  { id: 'structure', label: '構造', desc: '式を部品に分けて役割と値を見る', el: () => <StructureTab /> },
  { id: 'geometry', label: '図形', desc: '三角関数・微分・積分を図で見る', el: () => <GeometryTab /> },
  { id: 'steps', label: '変形', desc: '展開を 1 手ずつ追う', el: () => <StepsTab /> },
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
  return (
    <>
    {tab === 'home' && <HomeBackground />}
    <div className="app">
      <header className="header">
        <a className="brand" href="#home">
          <img className="logo" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />
          <div>
            <h1>Mathscope</h1>
            <p>{current.desc}</p>
          </div>
        </a>
        <nav className="tabs">
          {TABS.filter((t) => t.id !== 'home').map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? 'on' : ''}`}
              onClick={() => {
                setTab(t.id)
                history.replaceState(null, '', `#${t.id}`)
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main key={`${tab}|${hash}`}>{current.el()}</main>
    </div>
    </>
  )
}
