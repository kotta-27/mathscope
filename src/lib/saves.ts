/**
 * グラフの記録を、このブラウザに名前をつけて保存する。
 * 中身はグラフの URL（#graph?...）なので、開くときはそのまま URL を開く。
 * 保存できない環境（プライベートブラウズなど）では、空の一覧として動く。
 */
export type Save = { id: string; name: string; hash: string; savedAt: number }

const KEY = 'mathscope-graph-saves'

export function loadSaves(): Save[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((s) => s && typeof s.name === 'string' && typeof s.hash === 'string') : []
  } catch {
    return []
  }
}

function store(list: Save[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}

/** 同じ名前があれば上書きする。保存できたら新しい一覧を返す */
export function addSave(name: string, hash: string): Save[] | null {
  const list = loadSaves()
  const i = list.findIndex((s) => s.name === name)
  const item: Save = { id: i >= 0 ? list[i].id : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name, hash, savedAt: Date.now() }
  const next = i >= 0 ? list.map((s, k) => (k === i ? item : s)) : [item, ...list]
  return store(next) ? next : null
}

export function renameSave(id: string, name: string): Save[] | null {
  const next = loadSaves().map((s) => (s.id === id ? { ...s, name } : s))
  return store(next) ? next : null
}

export function removeSave(id: string): Save[] | null {
  const next = loadSaves().filter((s) => s.id !== id)
  return store(next) ? next : null
}
