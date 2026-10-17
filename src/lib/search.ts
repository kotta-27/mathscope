import { COURSES } from './courses'
import type { Theorem } from './theorems'

/** 検索用にそろえる: 全角・半角、大文字・小文字、アクセント記号、空白と記号、漢数字の 二・三 */
export const norm = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s'’\-–・]/g, '')
    .replace(/二/g, '2')
    .replace(/三/g, '3')

export function matches(t: Theorem, q: string) {
  if (!q) return true
  const c = COURSES[t.id]
  const hay = norm([t.id, t.name, t.aka ?? '', t.conditions ?? '', ...t.usage, c?.course ?? '', c?.unit ?? '', c?.en ?? '', c?.words ?? ''].join(' '))
  return hay.includes(norm(q))
}

