import { useMemo, useState } from 'react'
import { MathInput } from '../components/MathInput'
import { Tex } from '../components/Tex'
import { parseExpr, type Parsed } from '../lib/math'
import { MODES, type ModeId } from '../lib/transforms'
import { useRaf } from '../lib/useRaf'
import { readHash } from '../lib/route'

const HINTS: Record<ModeId, string> = {
  expand: '括弧をはずし、同類項をまとめる。',
  factor: '1 つの文字の多項式を、積の形にする。',
  simplify: '分数式は通分と約分。それ以外は展開して同類項をまとめる。',
  solve: '「=」を含む 1 つの文字の方程式（1 次〜3 次）。',
  derive: '和・積・商・合成関数の規則を、外側から 1 つずつ当てる。',
}

const PLACEHOLDERS: Record<ModeId, string> = {
  expand: '例: (a+b)², (x+1)(x−2)',
  factor: '例: x² − 5x + 6',
  simplify: '例: 1/x + 1/(x+1)',
  solve: '例: 2x + 3 = 7, x² = 5x − 6',
  derive: '例: x² sin x, (3x+1)⁵',
}

/** 方程式の入力欄用: 左辺と右辺をそれぞれ読む */
function parseEquation(src: string): Parsed {
  const sides = src.normalize('NFKC').split('=')
  if (sides.length !== 2) return { ok: false, error: '「=」を 1 つ入れてください', normalized: src }
  const l = parseExpr(sides[0])
  const r = parseExpr(sides[1])
  const normalized = `${l.normalized} = ${r.normalized}`
  if (!l.ok) return { ok: false, error: `左辺: ${l.error}`, normalized }
  if (!r.ok) return { ok: false, error: `右辺: ${r.error}`, normalized }
  const both = parseExpr(`(${l.normalized}) - (${r.normalized})`)
  return both.ok ? { ...both, normalized } : { ok: false, error: both.error, normalized }
}

export function StepsTab() {
  const params = readHash().params
  const [mode, setMode] = useState<ModeId>(() => MODES.find((m) => m.id === params.get('mode'))?.id ?? 'expand')
  const m = MODES.find((x) => x.id === mode)!
  const [src, setSrc] = useState(() => params.get('f') ?? m.presets[0])
  const [shown, setShown] = useState(0)
  const [play, setPlay] = useState(false)
  const [acc, setAcc] = useState(0)

  const parsed = useMemo(() => (mode === 'solve' ? parseEquation(src) : parseExpr(src)), [mode, src])
  const result = useMemo(() => (parsed.ok ? m.run(src) : null), [m, src, parsed])
  const moves = result?.ok ? result.moves : []

  // 式や種類が変わったら、はじめから
  const [prev, setPrev] = useState(result)
  if (prev !== result) {
    setPrev(result)
    setShown(0)
    setPlay(false)
  }

  useRaf(play, (dt) => {
    if (acc + dt < 1.2) return setAcc(acc + dt)
    setAcc(0)
    if (shown >= moves.length) setPlay(false)
    else setShown(shown + 1)
  })

  const pickMode = (id: ModeId) => {
    if (id === mode) return
    setMode(id)
    setSrc(MODES.find((x) => x.id === id)!.presets[0])
  }
  const cur = shown > 0 ? moves[shown - 1] : null

  return (
    <div className="layout">
      <aside className="panel">
        <h2>変形の種類</h2>
        <div className="chips mode-chips" role="tablist" aria-label="変形の種類">
          {MODES.map((x) => (
            <button key={x.id} role="tab" aria-selected={x.id === mode} className={`chip ${x.id === mode ? 'on' : ''}`} onClick={() => pickMode(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
        <p className="hint">{HINTS[mode]}</p>

        <h2>式</h2>
        <MathInput value={src} onChange={setSrc} parsed={parsed} placeholder={PLACEHOLDERS[mode]} />
        {result && !result.ok && <div className="error">{result.error}</div>}

        <div className="controls">
          <button className="btn" onClick={() => setShown(0)} disabled={shown === 0} aria-label="最初へ">⏮</button>
          <button className="btn" onClick={() => setShown(Math.max(0, shown - 1))} disabled={shown === 0}>◀ 戻る</button>
          <button
            className="btn primary"
            onClick={() => {
              if (shown >= moves.length) setShown(0)
              setPlay(!play)
            }}
            disabled={!moves.length}
          >
            {play ? '❚❚ 停止' : '▶ 再生'}
          </button>
          <button className="btn" onClick={() => setShown(Math.min(moves.length, shown + 1))} disabled={shown >= moves.length}>進む ▶</button>
          <button className="btn" onClick={() => setShown(moves.length)} disabled={shown >= moves.length} aria-label="最後へ">⏭</button>
        </div>
        <p className="hint">
          {result?.ok ? (moves.length ? `全 ${moves.length} 手。` : 'この式は、これ以上変形できない。') : ''}
          緑は書き換えた結果、赤は書き換える前の部分。
        </p>

        <h2>例</h2>
        <div className="chips">
          {m.presets.map((s) => (
            <button key={s} className="chip mono" onClick={() => setSrc(s)}>
              {s}
            </button>
          ))}
        </div>
      </aside>

      <section className="stage">
        {result?.ok && (
          <>
            <div className="hero-tex">
              <Tex block tex={cur ? cur.tex : result.start} />
              <div className="hero-step">{cur ? `${shown} 手目：${cur.label}` : '元の式'}</div>
            </div>

            <ol className="steps">
              <li className={`step ${shown === 0 ? 'current' : ''}`} onClick={() => setShown(0)}>
                <span className="step-label">元の式</span>
                <Tex tex={result.start} />
              </li>
              {moves.slice(0, shown).map((s, i) => (
                <li key={i} className={`step ${i + 1 === shown ? 'current' : ''}`} onClick={() => setShown(i + 1)}>
                  <span className="step-label">
                    {i + 1}. {s.label}
                  </span>
                  {s.sub && (
                    <span className="step-rewrite">
                      <Tex tex={s.sub} />
                    </span>
                  )}
                  <Tex tex={s.tex} />
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </div>
  )
}
