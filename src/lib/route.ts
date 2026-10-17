import { useEffect, useRef } from 'react'

/** #tab?f=...&demo=... 形式のハッシュを読む */
export function readHash() {
  const raw = location.hash.slice(1)
  const q = raw.indexOf('?')
  const tab = q < 0 ? raw : raw.slice(0, q)
  return { tab, params: new URLSearchParams(q < 0 ? '' : raw.slice(q + 1)) }
}

/** URL に書く値。null・undefined・false は書かない */
export type HashParams = Record<string, string | string[] | number | boolean | null | undefined>

/** 数値を URL 用に短くする（小数 3 桁まで） */
export const num = (v: number) => String(Number(v.toFixed(3)))

export function hrefTo(tab: string, params: HashParams = {}) {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined || v === false) continue
    for (const x of [v].flat()) sp.append(k, typeof x === 'number' ? num(x) : x === true ? '1' : String(x))
  }
  const s = sp.toString()
  return `#${tab}${s ? `?${s}` : ''}`
}

/** URL の数値を読む。ないときや数でないときは d */
export function readNum(p: URLSearchParams, key: string, d: number) {
  const v = Number(p.get(key))
  return p.has(key) && p.get(key) !== '' && Number.isFinite(v) ? v : d
}

let pending: string | null = null
let timer = 0

function write(href: string) {
  if (location.hash !== href) history.replaceState(history.state, '', href)
}

/** まだ URL に書いていない変更を、いますぐ書く（リンクをコピーする前に呼ぶ） */
export function flushHash() {
  clearTimeout(timer)
  if (pending) write(pending)
  pending = null
}

/**
 * 画面の状態を URL に残す。履歴は増やさず、いまの URL を書き換える。
 * 開いた直後の状態のままなら書かない（タブを開いただけで URL が長くならないように）。
 * スライダーの再生中など変化が続くときは、止まってからまとめて書く。
 */
export function useSyncHash(tab: string, params: HashParams) {
  const href = hrefTo(tab, params)
  const first = useRef(href)
  const dirty = useRef(false)
  useEffect(() => {
    if (!dirty.current && href === first.current) return
    dirty.current = true
    pending = href
    clearTimeout(timer)
    timer = window.setTimeout(flushHash, 250)
  }, [href])
  // 別のタブへ移ったら、書きかけの変更は捨てる（移った先の URL を上書きしないように）
  useEffect(
    () => () => {
      clearTimeout(timer)
      pending = null
    },
    [],
  )
}

/** 画面の切り替えなどで、すぐに URL を書き換える */
export function replaceHash(tab: string, params: HashParams = {}) {
  flushHash()
  write(hrefTo(tab, params))
}
