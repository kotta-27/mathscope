import type { CSSProperties } from 'react'
import { Tex } from '../components/Tex'

/** 背景に漂わせる数式（x は横位置 %、y は上からの px、s は文字の大きさ） */
const FORMULAS: { tex: string; x: number; y: number; s: number }[] = [
  { tex: 'e^{i\\pi}+1=0', x: 33, y: 112, s: 26 },
  { tex: '\\int_{-\\infty}^{\\infty}e^{-x^2}\\,dx=\\sqrt{\\pi}', x: 55, y: 22, s: 20 },
  { tex: '\\sum_{n=1}^{\\infty}\\frac{1}{n^2}=\\frac{\\pi^2}{6}', x: 66, y: 66, s: 18 },
  { tex: '\\varphi=\\frac{1+\\sqrt5}{2}', x: 8, y: 630, s: 22 },
  { tex: '\\nabla\\cdot\\vec E=\\frac{\\rho}{\\varepsilon_0}', x: 36, y: 600, s: 18 },
  { tex: '\\zeta(s)=\\sum_{n\\ge1}n^{-s}', x: 46, y: 640, s: 16 },
  { tex: 'a^2+b^2=c^2', x: 17, y: 108, s: 17 },
  { tex: '\\det(A-\\lambda I)=0', x: 74, y: 636, s: 17 },
  { tex: "f'(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}", x: 58, y: 766, s: 16 },
  { tex: 'V-E+F=2', x: 1, y: 570, s: 17 },
  { tex: 'P(A\\mid B)=\\frac{P(B\\mid A)P(A)}{P(B)}', x: 22, y: 770, s: 16 },
  { tex: '\\frac{d}{dx}e^x=e^x', x: 84, y: 780, s: 16 },
]

/** 横に繰り返す波（2 周期ぶん描いて、1 周期ずらすと継ぎ目なく流れる） */
function wave(f: (x: number) => number, y0: number, period = 1600) {
  let d = ''
  for (let i = 0; i <= 400; i++) {
    const x = (i / 400) * period * 2
    d += `${i ? 'L' : 'M'}${x.toFixed(1)},${(y0 + f(x)).toFixed(1)}`
  }
  return d
}

const SINE = wave((x) => 70 * Math.sin((x / 1600) * Math.PI * 6), 520)
const DAMPED = wave((x) => {
  const u = (x % 1600) / 1600
  return -110 * Math.exp(-3 * u) * Math.cos(u * Math.PI * 14)
}, 300)
let BELL = ''
for (let i = 0; i <= 200; i++) {
  const x = 700 + (i / 200) * 900
  const y = 820 - 330 * Math.exp(-(((x - 1150) / 150) ** 2) / 2)
  BELL += `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`
}

/** ホームの上部に敷く背景。方眼・座標軸・流れる曲線・漂う数式・光 */
export function HomeBackground() {
  return (
    <div className="home-bg" aria-hidden>
      <div className="home-bg-glow" />
      <svg className="home-bg-svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMin slice">
        <defs>
          <pattern id="bg-minor" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M25 0H0V25" fill="none" className="bg-grid-minor" />
          </pattern>
          <pattern id="bg-major" width="125" height="125" patternUnits="userSpaceOnUse">
            <rect width="125" height="125" fill="url(#bg-minor)" />
            <path d="M125 0H0V125" fill="none" className="bg-grid-major" />
          </pattern>
          <linearGradient id="bg-line-a" x1="0" x2="1">
            <stop offset="0" stopColor="#2e86ab" stopOpacity="0" />
            <stop offset="0.5" stopColor="#2e86ab" />
            <stop offset="1" stopColor="#a259ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bg-line-b" x1="0" x2="1">
            <stop offset="0" stopColor="#a259ff" stopOpacity="0" />
            <stop offset="0.4" stopColor="#a259ff" />
            <stop offset="1" stopColor="#e4572e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="1600" height="1000" fill="url(#bg-major)" />
        {/* 座標軸と目盛り */}
        <g className="bg-axis">
          <line x1="0" x2="1600" y1="500" y2="500" />
          <line x1="1000" x2="1000" y1="0" y2="1000" />
          {Array.from({ length: 13 }, (_, i) => (
            <line key={`tx${i}`} x1={i * 125} x2={i * 125} y1="494" y2="506" />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`ty${i}`} x1="994" x2="1006" y1={i * 125} y2={i * 125} />
          ))}
        </g>
        <g className="bg-drift slow">
          <path d={SINE} className="bg-curve" stroke="url(#bg-line-a)" style={{ '--delay': '0.2s' } as CSSProperties} />
        </g>
        <g className="bg-drift">
          <path d={DAMPED} className="bg-curve" stroke="url(#bg-line-b)" style={{ '--delay': '0.6s' } as CSSProperties} />
        </g>
        <path d={BELL} className="bg-curve bell" style={{ '--delay': '1s' } as CSSProperties} />
      </svg>
      {FORMULAS.map((f, i) => (
        <span
          key={i}
          className="bg-formula"
          style={{ left: `${f.x}%`, top: f.y, fontSize: f.s, '--dur': `${9 + (i % 5) * 2}s`, '--delay': `${-i * 1.7}s` } as CSSProperties}
        >
          <Tex tex={f.tex} />
        </span>
      ))}
    </div>
  )
}
