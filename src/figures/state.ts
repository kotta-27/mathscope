import { createContext, useContext, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { num } from '../lib/route'

/**
 * 定理カードの図の状態を URL に残すための入れ物。
 * URL に残すのは、最後に触った 1 つの図の状態だけ（#theorems?id=bayes&v.s=0.9 のように）。
 */
type Snapshot = { id: string | null; vals: Record<string, string> }
let snap: Snapshot = { id: null, vals: {} }
const listeners = new Set<() => void>()

export const figStore = {
  /** URL から読んだ状態を入れる（定理タブを開いたとき） */
  load(id: string | null, vals: Record<string, string>) {
    snap = { id, vals }
  },
  set(id: string, name: string, value: string) {
    snap = { id, vals: snap.id === id ? { ...snap.vals, [name]: value } : { [name]: value } }
    listeners.forEach((f) => f())
  },
  subscribe(f: () => void) {
    listeners.add(f)
    return () => listeners.delete(f)
  },
  get: () => snap,
}

/** いま描いている図が、どの定理の図か */
export const FigId = createContext<string | null>(null)

type Plain = number | boolean | string | Plain[] | { [k: string]: Plain }

function flat(v: Plain): (number | boolean)[] {
  if (typeof v === 'number' || typeof v === 'boolean') return [v]
  if (typeof v === 'string') return []
  return (Array.isArray(v) ? v : Object.values(v)).flatMap(flat)
}

export function encode(v: Plain): string {
  if (typeof v === 'string') return v
  return flat(v)
    .map((x) => (typeof x === 'boolean' ? (x ? '1' : '0') : num(x)))
    .join(',')
}

/** 初期値と同じ形に戻す。形が合わないときは undefined */
export function decode<T extends Plain>(s: string, like: T): T | undefined {
  if (typeof like === 'string') return s as T
  const xs = s.split(',').map(Number)
  if (xs.some((x) => !Number.isFinite(x)) || xs.length !== flat(like).length) return undefined
  let i = 0
  const build = (v: Plain): Plain => {
    if (typeof v === 'number') return xs[i++]
    if (typeof v === 'boolean') return xs[i++] !== 0
    if (typeof v === 'string') return v
    if (Array.isArray(v)) return v.map(build)
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, build(x)]))
  }
  return build(like) as T
}

/**
 * useState と同じように使い、触った値を URL に残す。
 * 定理カードの外（FigScope の外）では、ただの useState として動く。
 */
export function useFig<T>(name: string, init: T): [T, Dispatch<SetStateAction<T>>] {
  const id = useContext(FigId)
  const [v, setV] = useState<T>(() => {
    const s = id && snap.id === id ? snap.vals[name] : undefined
    return ((s === undefined ? undefined : decode(s, init as Plain)) as T | undefined) ?? init
  })
  const touched = useRef(false)
  useEffect(() => {
    if (id && touched.current) figStore.set(id, name, encode(v as Plain))
  }, [id, name, v])
  const set: Dispatch<SetStateAction<T>> = (u) => {
    touched.current = true
    setV(u)
  }
  return [v, set]
}
