import type { CSSProperties } from 'react'

/** 横に繰り返す波（2 周期ぶん描いて、1 周期ずらすと継ぎ目なく流れる） */
function wave(f: (x: number) => number, y0: number, period = 1600) {
  let d = ''
  for (let i = 0; i <= 400; i++) {
    const x = (i / 400) * period * 2
    d += `${i ? 'L' : 'M'}${x.toFixed(1)},${(y0 + f(x)).toFixed(1)}`
  }
  return d
}

// 原点（左上寄り）
const OX = 250
const OY = 375

const SINE = wave((x) => 80 * Math.sin((x / 1600) * Math.PI * 6), OY)
const DAMPED = wave((x) => {
  const u = (x % 1600) / 1600
  return -130 * Math.exp(-3 * u) * Math.cos(u * Math.PI * 14)
}, OY)

/** ホームの左上に敷くグラフの背景。方眼・座標軸・流れる曲線だけで、文字は置かない */
export function HomeBackground() {
  return (
    <div className="home-bg" aria-hidden>
      <svg className="home-bg-svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMinYMin slice">
        <defs>
          <pattern id="bg-minor" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M25 0H0V25" fill="none" className="bg-grid-minor" />
          </pattern>
          <pattern id="bg-major" width="125" height="125" patternUnits="userSpaceOnUse">
            <rect width="125" height="125" fill="url(#bg-minor)" />
            <path d="M125 0H0V125" fill="none" className="bg-grid-major" />
          </pattern>
          <linearGradient id="bg-line-a" x1="0" x2="1">
            <stop offset="0" stopColor="#2e86ab" />
            <stop offset="0.5" stopColor="#a259ff" />
            <stop offset="1" stopColor="#2e86ab" />
          </linearGradient>
        </defs>
        <rect width="1600" height="1000" fill="url(#bg-major)" />
        <g className="bg-axis">
          <line x1="0" x2="1600" y1={OY} y2={OY} />
          <line x1={OX} x2={OX} y1="0" y2="1000" />
          {Array.from({ length: 13 }, (_, i) => (
            <line key={`tx${i}`} x1={i * 125} x2={i * 125} y1={OY - 6} y2={OY + 6} />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`ty${i}`} x1={OX - 6} x2={OX + 6} y1={i * 125} y2={i * 125} />
          ))}
        </g>
        <g className="bg-drift slow">
          <path d={SINE} className="bg-curve" stroke="url(#bg-line-a)" style={{ '--delay': '0.2s' } as CSSProperties} />
        </g>
        <g className="bg-drift">
          <path d={DAMPED} className="bg-curve sub" style={{ '--delay': '0.7s' } as CSSProperties} />
        </g>
      </svg>
    </div>
  )
}
