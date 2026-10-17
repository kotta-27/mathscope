import type { ReactNode } from 'react'
import type { Parsed } from '../lib/math'
import { texOf } from '../lib/math'
import { Tex } from './Tex'

const squash = (s: string) => s.replace(/\s+/g, '')

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
  return (
    <div className="math-input">
      <div className="expr-input">
        {before}
        {label && <Tex tex={label} />}
        <input
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
