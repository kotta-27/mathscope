import { Tex } from './Tex'

/** 文中だと縮んで読みにくくなる記号（分数・Σ・∫ など）。これを含む数式は別行立ての大きさで描く */
const TALL = /\\(frac|dfrac|sum|int|prod|lim|binom)\b/

/** 「文章 $数式$ 文章」をインライン KaTeX 混じりで表示する */
export function MathText({ text }: { text: string }) {
  const parts = text.split(/\$([^$]+)\$/)
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <Tex key={i} tex={TALL.test(p) ? `\\displaystyle ${p}` : p} /> : <span key={i}>{p}</span>))}
    </>
  )
}
