import { describe, expect, it } from 'vitest'
import { PRESET_GROUPS } from './graphPresets'
import { definedName, readGraphExpr } from './graphExpr'

describe('グラフの例', () => {
  it('すべての式が読み取れ、params と play がその式の文字を指す', () => {
    const bad: string[] = []
    for (const g of PRESET_GROUPS)
      for (const p of g.items) {
        const srcs = p.rows.map((r) => (typeof r === 'string' ? r : r.src))
        const fns = srcs.flatMap((s) => (definedName(s)?.fn ? [definedName(s)!.name] : []))
        const es = srcs.map((s) => readGraphExpr(s, fns))
        es.forEach((e, i) => !e.ok && bad.push(`${p.label} ${i}: ${e.parsed.ok ? '' : e.parsed.error}`))
        const syms = new Set(es.flatMap((e) => (e.ok ? e.symbols : [])))
        for (const k of [...Object.keys(p.params ?? {}), ...(p.play ? [p.play] : [])]) if (!syms.has(k)) bad.push(`${p.label}: ${k} がない`)
      }
    expect(bad).toEqual([])
  })
})
