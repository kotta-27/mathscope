import katex from 'katex'
import { describe, expect, it } from 'vitest'
import { THEOREMS } from './theorems'
import { FIGURE_IDS } from '../figures/ids'

/** $...$ の中の数式を取り出す */
const inline = (s: string) => [...s.matchAll(/\$([^$]+)\$/g)].map((m) => m[1])
const ok = (tex: string, displayMode = false) => {
  try {
    katex.renderToString(tex, { throwOnError: true, displayMode, strict: 'ignore' })
    return true
  } catch (e) {
    return String(e)
  }
}

describe('定理のデータ', () => {
  it('id が重複しない', () => {
    expect(new Set(THEOREMS.map((t) => t.id)).size).toBe(THEOREMS.length)
  })
  it('すべてに条件・例題・図がある', () => {
    const lack = THEOREMS.filter((t) => !t.conditions || !t.example || !FIGURE_IDS.includes(t.id)).map((t) => t.id)
    expect(lack).toEqual([])
  })
  it('数式がすべて KaTeX で描ける', () => {
    const bad: string[] = []
    for (const t of THEOREMS) {
      if (ok(t.statement, true) !== true) bad.push(`${t.id} statement: ${ok(t.statement, true)}`)
      for (const s of [t.conditions ?? '', ...t.usage, t.example?.q ?? '', t.example?.a ?? ''])
        for (const x of inline(s)) if (ok(x) !== true) bad.push(`${t.id}: ${x} → ${ok(x)}`)
    }
    expect(bad).toEqual([])
  })
})

describe('定理の手引き', () => {
  it('すべての定理に「ひとことで」「図の見どころ」「つながる定理」がある', async () => {
    const { GUIDE } = await import('./guide')
    const lack = THEOREMS.filter((t) => !GUIDE[t.id] || !GUIDE[t.id].gist || !GUIDE[t.id].try.length || !GUIDE[t.id].related.length).map((t) => t.id)
    expect(lack).toEqual([])
    const ids = new Set(THEOREMS.map((t) => t.id))
    const bad = Object.entries(GUIDE).flatMap(([id, g]) => [...(ids.has(id) ? [] : [`${id}（定理がない）`]), ...g.related.filter((x) => !ids.has(x) || x === id).map((x) => `${id} → ${x}`)])
    expect(bad).toEqual([])
  })
  it('手引きの数式が KaTeX で描ける', async () => {
    const { GUIDE } = await import('./guide')
    const bad: string[] = []
    for (const [id, g] of Object.entries(GUIDE)) for (const s of [g.gist, ...g.try]) for (const x of inline(s)) if (ok(x) !== true) bad.push(`${id}: ${x}`)
    expect(bad).toEqual([])
  })
})

describe('なぜ成り立つか', () => {
  it('すべての定理にあり、数式が描ける', async () => {
    const { PROOFS } = await import('./proofs')
    expect(THEOREMS.filter((t) => !PROOFS[t.id]).map((t) => t.id)).toEqual([])
    const bad: string[] = []
    for (const [id, s] of Object.entries(PROOFS)) for (const x of inline(s)) if (ok(x) !== true) bad.push(`${id}: ${x} → ${ok(x)}`)
    expect(bad).toEqual([])
  })
})
