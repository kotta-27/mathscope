import { useMemo, useState } from 'react'
import { Tex } from '../components/Tex'
import { parseExpr, texOf } from '../lib/math'
import { deriveSteps } from '../lib/steps'
import { useRaf } from '../lib/useRaf'
import { readHash } from '../lib/route'

const PRESETS = ['(a+b)^2', '(x+1)*(x-2)', '(x+y)*(x-y)', '2*(x+3) - (x-1)', '(2x-3)^2', '(a+b)^3']
const HOT_BEFORE = '#e4572e'
const HOT_AFTER = '#3bb273'

export function StepsTab() {
  const [src, setSrc] = useState(() => readHash().params.get('f') ?? PRESETS[0])
  const [shown, setShown] = useState(0)
  const [play, setPlay] = useState(false)
  const [acc, setAcc] = useState(0)
  const p = useMemo(() => parseExpr(src), [src])
  const steps = useMemo(() => {
    if (!p.ok) return []
    try {
      return deriveSteps(p.node)
    } catch {
      return []
    }
  }, [p])

  const [prevSteps, setPrevSteps] = useState(steps)
  if (prevSteps !== steps) {
    setPrevSteps(steps)
    setShown(0)
    setPlay(false)
  }

  useRaf(play, (dt) => {
    if (acc + dt < 1.2) return setAcc(acc + dt)
    setAcc(0)
    if (shown >= steps.length) setPlay(false)
    else setShown(shown + 1)
  })

  const cur = shown > 0 ? steps[shown - 1] : null

  return (
    <div className="layout">
      <aside className="panel">
        <h2>展開したい式</h2>
        <input className="wide" value={src} onChange={(e) => setSrc(e.target.value)} spellCheck={false} />
        {!p.ok && <div className="error">{p.error}</div>}
        <div className="controls">
          <button className="btn" onClick={() => setShown(0)} disabled={shown === 0}>⏮</button>
          <button className="btn" onClick={() => setShown(Math.max(0, shown - 1))} disabled={shown === 0}>◀ 戻る</button>
          <button
            className="btn primary"
            onClick={() => {
              if (shown >= steps.length) setShown(0)
              setPlay(!play)
            }}
            disabled={!steps.length}
          >
            {play ? '❚❚ 停止' : '▶ 再生'}
          </button>
          <button className="btn" onClick={() => setShown(Math.min(steps.length, shown + 1))} disabled={shown >= steps.length}>進む ▶</button>
          <button className="btn" onClick={() => setShown(steps.length)} disabled={shown >= steps.length}>⏭</button>
        </div>
        <p className="hint">
          {steps.length ? `全 ${steps.length} 手。` : 'この式は展開できる箇所がない。'}
          赤は次に書き換える部分、緑は書き換えた結果。
        </p>
        <h2>例</h2>
        <div className="chips">
          {PRESETS.map((s) => (
            <button key={s} className="chip mono" onClick={() => setSrc(s)}>
              {s}
            </button>
          ))}
        </div>
      </aside>

      <section className="stage">
        {p.ok && (
          <>
            <div className="hero-tex">
              <Tex
                block
                tex={
                  cur
                    ? texOf(cur.after, cur.whole ? undefined : new Map([[cur.replacement, HOT_AFTER]]))
                    : texOf(p.node, steps[0] && !steps[0].whole ? new Map([[steps[0].target, HOT_BEFORE]]) : undefined)
                }
              />
              <div className="hero-step">{cur ? `${shown} 手目：${cur.label}` : '元の式'}</div>
            </div>

            <ol className="steps">
              <li className={`step ${shown === 0 ? 'current' : ''}`} onClick={() => setShown(0)}>
                <span className="step-label">元の式</span>
                <Tex tex={texOf(p.node)} />
              </li>
              {steps.slice(0, shown).map((s, i) => {
                const local = !s.whole
                return (
                  <li key={i} className={`step ${i + 1 === shown ? 'current' : ''}`} onClick={() => setShown(i + 1)}>
                    <span className="step-label">
                      {i + 1}. {s.label}
                    </span>
                    {local && (
                      <span className="step-rewrite">
                        <Tex tex={`\\textcolor{${HOT_BEFORE}}{${texOf(s.target)}} \\;\\Rightarrow\\; \\textcolor{${HOT_AFTER}}{${texOf(s.replacement)}}`} />
                      </span>
                    )}
                    <Tex tex={`= ${texOf(s.after, local ? new Map([[s.replacement, HOT_AFTER]]) : undefined)}`} />
                  </li>
                )
              })}
            </ol>
          </>
        )}
      </section>
    </div>
  )
}
