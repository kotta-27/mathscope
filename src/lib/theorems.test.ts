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
