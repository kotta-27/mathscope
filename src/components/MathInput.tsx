import { useRef, useState, type ReactNode } from 'react'
import { useMedia } from '../lib/useMedia'
import type { Parsed } from '../lib/math'
import { texOf } from '../lib/math'
import { Tex } from './Tex'

const squash = (s: string) => s.replace(/\s+/g, '')

/** スマホで入力欄を選んだときに出す記号。[表示, 入れる文字, カーソルを戻す数] */
const KEYS: [string, string, number][] = [
  ['x', 'x', 0],
  ['²', '^2', 0],
  ['^', '^', 0],
  ['√', 'sqrt()', 1],
  ['(', '(', 0],
  [')', ')', 0],
  ['/', '/', 0],
  ['*', '*', 0],
  ['π', 'pi', 0],
  ['sin', 'sin()', 1],
  ['cos', 'cos()', 1],
  ['|x|', 'abs()', 1],
  ['=', '=', 0],
]

/**
 * 数式の入力欄。入力を正規化して読み、
 * - 読み方が入力と違えば「こう読んだ」を表示
 * - エラーなら日本語の説明と位置を表示
 * - preview を渡すと KaTeX のプレビューも出す
 */
export function MathInput({
  value,
  onChange,
  parsed,
  label,
  before,
  after,
  preview,
  placeholder = '例: x² + 2x − 1、sin 2x、√(x+1)',
}: {
  value: string
  onChange: (v: string) => void
  parsed: Parsed
  /** 入力欄の前に置く TeX（例: "f(x) ="） */
  label?: string
  before?: ReactNode
  after?: ReactNode
  /** true なら式の KaTeX プレビューを出す。文字列なら先頭に付ける TeX */
  preview?: boolean | string
  placeholder?: string
}) {
  const reread = parsed.normalized && squash(parsed.normalized) !== squash(value)
  const touch = useMedia('(pointer: coarse)')
  const [focus, setFocus] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  /** カーソルの位置に記号を入れる */
  const insert = (text: string, back: number) => {
    const el = ref.current
    const a = el?.selectionStart ?? value.length
    const b = el?.selectionEnd ?? value.length
    onChange(value.slice(0, a) + text + value.slice(b))
    requestAnimationFrame(() => {
      const p = a + text.length - back
      el?.setSelectionRange(p, p)
    })
  }
  return (
    <div className="math-input">
      <div className="expr-input">
        {before}
        {label && <Tex tex={label} />}
        <input
          ref={ref}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-invalid={!parsed.ok && value.trim() !== ''}
        />
        {after}
      </div>
      {touch && focus && (
        <div className="mi-keys" role="toolbar" aria-label="記号を入れる">
          {KEYS.map(([label, text, back]) => (
            <button
              key={label}
              type="button"
              // 押しても入力欄からフォーカスを外さない（キーボードを閉じない）
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => insert(text, back)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {parsed.ok ? (
        <>
          {preview && (
            <div className="mi-preview">
              <Tex tex={`${typeof preview === 'string' ? preview : ''}${texOf(parsed.node)}`} />
            </div>
          )}
          {reread && (
            <div className="mi-note">
              <span>読み取り:</span> <code>{parsed.normalized}</code>
            </div>
          )}
        </>
      ) : (
        value.trim() !== '' && (
          <div className="mi-error" role="alert">
            <span>{parsed.error}</span>
            {parsed.pos !== undefined && (
              <code className="mi-where">
                {parsed.normalized.slice(0, parsed.pos)}
                <mark>{parsed.normalized[parsed.pos] ?? ' '}</mark>
                {parsed.normalized.slice(parsed.pos + 1)}
              </code>
            )}
          </div>
        )
      )}
    </div>
  )
}
