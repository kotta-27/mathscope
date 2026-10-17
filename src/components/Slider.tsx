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
}) {
  return (
    <label className="slider">
      <span className="slider-name">
        <Tex tex={tex ?? name} />
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <input
        className="slider-num"
        type="number"
        step={step}
        value={Number(value.toFixed(3))}
        onChange={(e) => e.target.value !== '' && onChange(Number(e.target.value))}
      />
      {onTogglePlay && (
        <button type="button" className={`icon-btn ${playing ? 'on' : ''}`} onClick={onTogglePlay} title="自動で動かす">
          {playing ? '❚❚' : '▶'}
        </button>
      )}
    </label>
  )
}
