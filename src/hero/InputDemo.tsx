import { useMemo, useState } from 'react'
import { MathInput } from '../components/MathInput'
import { evalNum, parseExpr } from '../lib/math'
import { hrefTo } from '../lib/route'

const EXAMPLES = ['x² − 2x − 3', 'sin 2x', '√(x+4)', '|x − 1|', 'ｘ＋１', '\\frac{1}{x+1}', '\\sqrt{x^{2}+1}']

const W = 400
const H = 150
const X0 = -5
const X1 = 5

/** 入力した式の小さなグラフ。x 以外の文字は 1 として描く */
function MiniPlot({ f }: { f: (x: number) => number }) {
  const pts: [number, number][] = []
  for (let i = 0; i <= 200; i++) {
    const x = X0 + ((X1 - X0) * i) / 200
    pts.push([x, f(x)])
  }
  const ys = pts.map((p) => p[1]).filter((y) => Number.isFinite(y) && Math.abs(y) < 1e6).sort((a, b) => a - b)
  if (ys.length < 2) return <div className="mini-plot empty">この範囲では描けない</div>
  // 外れ値（1/x の近くなど）に引っぱられないよう、上下 5% を除いて範囲を決める
  let lo = ys[Math.floor(ys.length * 0.05)]
  let hi = ys[Math.ceil(ys.length * 0.95) - 1]
  if (hi - lo < 1e-9) {
    lo -= 1
    hi += 1
  }
  const pad = (hi - lo) * 0.15
  lo -= pad
  hi += pad
  const sx = (x: number) => ((x - X0) / (X1 - X0)) * W
  const sy = (y: number) => H - ((y - lo) / (hi - lo)) * H
  let d = ''
  let prev: number | null = null
  for (const [x, y] of pts) {
    if (!Number.isFinite(y)) {
      prev = null
      continue
    }
    const py = Math.max(-H, Math.min(2 * H, sy(y)))
    d += `${prev === null || Math.abs(py - prev) > H ? 'M' : 'L'}${sx(x).toFixed(1)},${py.toFixed(1)}`
    prev = py
  }
  const y0 = sy(0)
  return (
    <svg className="mini-plot" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
      {y0 >= 0 && y0 <= H && <line x1={0} x2={W} y1={y0} y2={y0} className="fig-axis" />}
      <line x1={sx(0)} x2={sx(0)} y1={0} y2={H} className="fig-axis" />
      <path d={d} fill="none" stroke="#e4572e" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/** トップの「試してみる」入力欄。数式ライブラリを使うので、HomeTab から後で読み込む */
export function InputDemo() {
  const [src, setSrc] = useState(EXAMPLES[0])
  const parsed = useMemo(() => parseExpr(src), [src])
  const f = useMemo(() => {
    if (!parsed.ok) return null
    const scope = Object.fromEntries(parsed.symbols.filter((s) => s !== 'x').map((s) => [s, 1]))
    return (x: number) => evalNum(parsed.code, { ...scope, x })
  }, [parsed])
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
      {f ? <MiniPlot f={f} /> : <div className="mini-plot empty">式を読み取れると、ここにグラフが出る</div>}
      <a className={`btn primary ${parsed.ok ? '' : 'disabled'}`} href={parsed.ok ? hrefTo('graph', { f: src }) : undefined} aria-disabled={!parsed.ok}>
        この式をグラフで見る →
      </a>
    </div>
  )
}
