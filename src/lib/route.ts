/** #tab?f=...&demo=... 形式のハッシュを読む */
export function readHash() {
  const raw = location.hash.slice(1)
  const q = raw.indexOf('?')
  const tab = q < 0 ? raw : raw.slice(0, q)
  return { tab, params: new URLSearchParams(q < 0 ? '' : raw.slice(q + 1)) }
}

export function hrefTo(tab: string, params: Record<string, string | string[]> = {}) {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) for (const x of [v].flat()) sp.append(k, x)
  const s = sp.toString()
  return `#${tab}${s ? `?${s}` : ''}`
}
