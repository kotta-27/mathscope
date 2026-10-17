import { describe, expect, it } from 'vitest'
import { FIGURES } from '.'
import { FIGURE_IDS } from './ids'
import { THEOREMS } from '../lib/theorems'

describe('FIGURE_IDS', () => {
  it('図の一覧と一致する', () => {
    expect([...FIGURE_IDS].sort()).toEqual(Object.keys(FIGURES).sort())
  })
  it('どれも存在する定理の id', () => {
    const ids = new Set(THEOREMS.map((t) => t.id))
    for (const id of FIGURE_IDS) expect(ids.has(id), id).toBe(true)
  })
})
