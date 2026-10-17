/** 式変形の 1 手 */
export type Move = {
  /** 何をしたか（例: 共通因数でくくる） */
  label: string
  /** その手のあとの式（TeX）。変わった所は色付け済み */
  tex: string
  /** 書き換えた部分だけを示す補足（TeX、任意） */
  sub?: string
}

export type TransformResult =
  | {
      ok: true
      /** 最初の式（TeX） */
      start: string
      moves: Move[]
      /** 最終結果を mathjs が読める形で（テストで値を確かめる用） */
      result?: string
      /** 方程式の解（テスト用） */
      roots?: number[]
    }
  | { ok: false; error: string }

export const HOT = '#3bb273'
export const HOT_BEFORE = '#e4572e'
export const hot = (tex: string) => `\\textcolor{${HOT}}{${tex}}`
