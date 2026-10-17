import { useMemo, useState } from 'react'
import { MathInput } from '../components/MathInput'
import { parseExpr } from '../lib/math'
import { hrefTo } from '../lib/route'

const EXAMPLES = ['x² − 2x − 3', 'sin 2x', '√(x+4)', '|x − 1|', 'ｘ＋１', '\\frac{1}{x+1}', '\\sqrt{x^{2}+1}']

/** トップの「試してみる」入力欄。数式ライブラリを使うので、HomeTab から後で読み込む */
export function InputDemo() {
  const [src, setSrc] = useState(EXAMPLES[0])
  const parsed = useMemo(() => parseExpr(src), [src])
  return (
    <div className="input-demo">
      <MathInput value={src} onChange={setSrc} parsed={parsed} label="y =" preview="y = " placeholder="ここに式を入れてみる" />
      <div className="chips">
        {EXAMPLES.map((e) => (
          <button key={e} className="chip mono" onClick={() => setSrc(e)}>
            {e}
          </button>
        ))}
      </div>
      <a className={`btn primary ${parsed.ok ? '' : 'disabled'}`} href={parsed.ok ? hrefTo('graph', { f: src }) : undefined} aria-disabled={!parsed.ok}>
        この式をグラフで見る →
      </a>
    </div>
  )
}
