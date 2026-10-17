import { readHash } from './route'

/**
 * 匿名のアクセス解析（GoatCounter）。Cookie を使わず、個人を特定する情報は送らない。
 * ビルド時に VITE_GOATCOUNTER_URL（例: https://mathscope.goatcounter.com/count）があるときだけ動く。
 */
const ENDPOINT: string | undefined = import.meta.env.VITE_GOATCOUNTER_URL

type GC = { count?: (o: { path: string; title?: string; event?: boolean }) => void; no_onload?: boolean }
declare global {
  interface Window {
    goatcounter?: GC
  }
}

const sent = new Set<string>()

/** 数える画面の名前。定理はどの定理を開いたかまで（#theorems?id=bayes → /theorems/bayes） */
function pagePath() {
  const { tab, params } = readHash()
  const id = tab === 'theorems' ? params.get('id') : null
  return `/${tab || 'home'}${id ? `/${id}` : ''}`
}

function pageview() {
  window.goatcounter?.count?.({ path: pagePath() })
}

/** 出来事を数える。once を付けると、開いているあいだ 1 回だけ */
export function track(name: string, once = false) {
  if (!ENDPOINT) return
  if (once) {
    if (sent.has(name)) return
    sent.add(name)
  }
  window.goatcounter?.count?.({ path: name, title: name, event: true })
}

export function initAnalytics() {
  if (!ENDPOINT || typeof document === 'undefined') return
  window.goatcounter = { no_onload: true }
  const s = document.createElement('script')
  s.async = true
  s.src = 'https://gc.zgo.at/count.js'
  s.dataset.goatcounter = ENDPOINT
  s.onload = () => {
    pageview()
    // 状態つきのリンク（#graph?f=... など）から開かれたか
    if (location.hash.includes('?')) track('open-shared-link')
  }
  document.head.append(s)
  addEventListener('hashchange', pageview)
  // 図やグラフを実際に触ったか（タブごとに 1 回）
  const touched = (e: Event) => {
    const el = e.target as Element | null
    if (el?.closest('input[type=range], .fig-svg, .plot svg, .fig-handle')) track(`touch/${readHash().tab || 'home'}`, true)
  }
  addEventListener('input', touched, true)
  addEventListener('pointerdown', touched, true)
}
