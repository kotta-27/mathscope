import { useMemo, useRef, useState } from 'react'
import { ConstantNode, ParenthesisNode, isSymbolNode, type MathNode } from 'mathjs'
import { Plot } from '../components/Plot'
import { Slider } from '../components/Slider'
import { MathInput } from '../components/MathInput'
import { Tex } from '../components/Tex'
import { PALETTE, evalNum, parseExpr, texOf } from '../lib/math'
import { useRaf } from '../lib/useRaf'
import { readHash } from '../lib/route'

type Row = { id: number; src: string }

const PRESETS: { label: string; rows: string[] }[] = [
  { label: '正弦波', rows: ['a*sin(b*x + c)'] },
  { label: '放物線（頂点形）', rows: ['a*(x - p)^2 + q'] },
  { label: '3次関数', rows: ['x^3 + a*x^2 + b*x'] },
  { label: '正規分布', rows: ['exp(-(x - m)^2 / (2*s^2)) / (s*sqrt(2*pi))'] },
  { label: '指数と対数', rows: ['a^x', 'log(x) / log(a)'] },
  { label: '波の重ね合わせ', rows: ['sin(x)', 'sin(k*x)', 'sin(x) + sin(k*x)'] },
]

const RANGE = { min: -5, max: 5 }

function substitute(node: MathNode, scope: Record<string, number>): MathNode {
  return node.transform((n) => {
    if (!isSymbolNode(n) || !(n.name in scope)) return n
    const v = Math.round(scope[n.name] * 100) / 100
    return v < 0 ? new ParenthesisNode(new ConstantNode(v)) : new ConstantNode(v)
  })
}

export function GraphTab() {
  const nextId = useRef(100)
  const [rows, setRows] = useState<Row[]>(() => {
    const fs = readHash().params.getAll('f')
    return (fs.length ? fs : ['a*sin(b*x + c)']).map((src, i) => ({ id: i + 1, src }))
  })
  const [params, setParams] = useState<Record<string, number>>({})
  const [playing, setPlaying] = useState<Record<string, boolean>>({})
  const dirs = useRef<Record<string, number>>({})

  const parsed = useMemo(() => rows.map((r) => parseExpr(r.src)), [rows])
  const names = useMemo(() => {
    const s = new Set<string>()
    parsed.forEach((p) => p.ok && p.symbols.forEach((n) => n !== 'x' && s.add(n)))
    return [...s].sort()
  }, [parsed])
  const scope = Object.fromEntries(names.map((n) => [n, params[n] ?? 1]))
  const active = names.filter((n) => playing[n])

  useRaf(active.length > 0, (dt) => {
    setParams((p) => {
      const next = { ...p }
      for (const k of active) {
        let d = dirs.current[k] ?? 1
        let v = (next[k] ?? 1) + d * dt * 1.5
        if (v > RANGE.max) [v, d] = [RANGE.max, -1]
        if (v < RANGE.min) [v, d] = [RANGE.min, 1]
        dirs.current[k] = d
        next[k] = v
      }
      return next
    })
  })

  const setRow = (id: number, src: string) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, src } : r)))
  const loadPreset = (srcs: string[]) => {
    setRows(srcs.map((src) => ({ id: nextId.current++, src })))
    setPlaying({})
  }

  return (
    <div className="layout">
      <aside className="panel">
        <h2>式</h2>
        <p className="hint">x 以外の文字はパラメータになり、スライダーで動かせる。x²・√x・sin 2x・|x| のような書き方もそのまま使える。</p>
        {rows.map((r, i) => {
          const p = parsed[i]
          const color = PALETTE[i % PALETTE.length]
          return (
            <div key={r.id} className="expr-row">
              <MathInput
                value={r.src}
                onChange={(v) => setRow(r.id, v)}
                parsed={p}
                before={<span className="swatch" style={{ background: color }} />}
                after={
                  rows.length > 1 && (
                    <button className="icon-btn" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} title="削除">
                      ×
                    </button>
                  )
                }
              />
              {p.ok && (
                <div className="expr-tex">
                  <Tex tex={`y = ${texOf(p.node)}`} />
                  {names.some((n) => p.symbols.includes(n)) && (
                    <Tex className="sub" tex={`= ${texOf(substitute(p.node, scope))}`} />
                  )}
                </div>
              )}
            </div>
          )
        })}
        <button className="btn" onClick={() => setRows((rs) => [...rs, { id: nextId.current++, src: '' }])}>
          + 式を追加
        </button>

        {names.length > 0 && (
          <>
            <h2>パラメータ</h2>
            {names.map((n) => (
              <Slider
                key={n}
                name={n}
                value={scope[n]}
                {...RANGE}
                onChange={(v) => setParams((p) => ({ ...p, [n]: v }))}
                playing={!!playing[n]}
                onTogglePlay={() => setPlaying((p) => ({ ...p, [n]: !p[n] }))}
              />
            ))}
          </>
        )}

        <h2>例</h2>
        <div className="chips">
          {PRESETS.map((p) => (
            <button key={p.label} className="chip" onClick={() => loadPreset(p.rows)}>
              {p.label}
            </button>
          ))}
        </div>
      </aside>

      <section className="stage">
        <Plot initial={{ xMin: -8, xMax: 8, yMin: -5, yMax: 5 }} height={520}>
          {(ctx) =>
            parsed.map((p, i) =>
              p.ok ? (
                <path
                  key={rows[i].id}
                  d={ctx.path((x) => evalNum(p.code, { ...scope, x }))}
                  stroke={PALETTE[i % PALETTE.length]}
                  className="curve"
                />
              ) : null,
            )
          }
        </Plot>
        <p className="hint">ドラッグで移動、ホイールで拡大縮小。</p>
      </section>
    </div>
  )
}
