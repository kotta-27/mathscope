import { Tex } from './Tex'

/** アルキメデスの螺旋 r = aθ（3 周）。viewBox 0 0 100 100 の中心から */
const SPIRAL = (() => {
  const turns = 3
  const n = 180
  const R = 42
  let d = ''
  for (let i = 0; i <= n; i++) {
    const th = (i / n) * turns * 2 * Math.PI
    const r = (R * th) / (turns * 2 * Math.PI)
    d += `${i ? 'L' : 'M'}${(50 + r * Math.cos(th)).toFixed(2)} ${(50 + r * Math.sin(th)).toFixed(2)}`
  }
  return d
})()

/** 読み込み中の表示。螺旋が描かれては消え、先端の点が曲線に沿って走る */
export function Loader({ label = '読み込み中' }: { label?: string }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <svg viewBox="0 0 100 100" className="loader-svg" aria-hidden>
        <defs>
          <linearGradient id="loader-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2e86ab" />
            <stop offset="1" stopColor="#a259ff" />
          </linearGradient>
        </defs>
        <g className="loader-spin">
          <path d={SPIRAL} pathLength={1} className="loader-track" />
          <path d={SPIRAL} pathLength={1} className="loader-spiral" stroke="url(#loader-grad)" />
          <circle r={2.4} className="loader-dot" style={{ offsetPath: `path('${SPIRAL}')` }} />
        </g>
      </svg>
      <div className="loader-caption">
        <Tex tex="r=a\theta" />
        <span>{label}</span>
      </div>
    </div>
  )
}
