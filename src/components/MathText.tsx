import { Tex } from './Tex'

/** 「文章 $数式$ 文章」をインライン KaTeX 混じりで表示する */
export function MathText({ text }: { text: string }) {
  const parts = text.split(/\$([^$]+)\$/)
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <Tex key={i} tex={p} /> : <span key={i}>{p}</span>))}
    </>
  )
}
