import { useEffect, useState } from 'react'
import { flushHash } from '../lib/route'

/** いまの画面の状態をそのまま開けるリンクを、クリップボードにコピーする */
export function CopyLink() {
  const [done, setDone] = useState<'ok' | 'ng' | null>(null)
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setDone(null), 1800)
    return () => clearTimeout(t)
  }, [done])
  const copy = async () => {
    flushHash()
    const url = location.href
    try {
      await navigator.clipboard.writeText(url)
      setDone('ok')
    } catch {
      // クリップボードが使えないとき（http や古いブラウザ）は、選択してコピーする
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.append(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      setDone(ok ? 'ok' : 'ng')
    }
  }
  return (
    <button className={`copy-link ${done ?? ''}`} onClick={copy} title="いまの状態のまま開けるリンクをコピー">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
        <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
      </svg>
      <span aria-live="polite">{done === 'ok' ? 'コピーしました' : done === 'ng' ? 'コピーできません' : 'リンクをコピー'}</span>
    </button>
  )
}
