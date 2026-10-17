import type { CSSProperties } from 'react'
import { Tex } from './Tex'

export function Slider({
  name,
  tex,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  playing,
  onTogglePlay,
  stack,
  percent,
  label,
  color,
}: {
  name: string
  tex?: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  playing?: boolean
  onTogglePlay?: () => void
  /** ラベルと値を上の段、スライダーを下の段に置く（狭い場所でもスライダーを幅いっぱいに使える） */
  stack?: boolean
  /** 0〜1 の値を % で表示・入力する */
  percent?: boolean
  /** 数式の前に置く言葉のラベル（例: 事前確率） */
  label?: string
  /** スライダーの色 */
  color?: string
}) {
  const k = percent ? 100 : 1
  const shown = Number((value * k).toFixed(percent ? 1 : 3))
  const range = (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={color ? ({ accentColor: color } as CSSProperties) : undefined}
    />
  )
  const num = (
    <input
      className="slider-num"
      type="number"
      step={Number((step * k).toPrecision(6))}
      min={min * k}
      max={max * k}
      value={shown}
      aria-label={label ?? name}
      onChange={(e) => {
        if (e.target.value === '') return
        const v = Number(e.target.value) / k
        onChange(Math.min(max, Math.max(min, v)))
      }}
    />
  )
  const play = onTogglePlay && (
    <button type="button" className={`icon-btn ${playing ? 'on' : ''}`} onClick={onTogglePlay} title="自動で動かす">
      {playing ? '❚❚' : '▶'}
    </button>
  )
  const nameEl = (
    <span className="slider-name">
      {label && <span className="slider-label">{label}</span>}
      <Tex tex={tex ?? name} />
    </span>
  )

  if (stack) {
    return (
      <label className="slider stack">
        <span className="slider-top">
          {nameEl}
          <span className="slider-value">
            {num}
            {percent && <span className="slider-unit">%</span>}
          </span>
          {play}
        </span>
        {range}
      </label>
    )
  }
  return (
    <label className="slider">
      {nameEl}
      {range}
      {num}
      {play}
    </label>
  )
}
