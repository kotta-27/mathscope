import { useRef, useState } from 'react'
import { Tex } from '../components/Tex'
import { readHash } from '../lib/route'
import { useRaf } from '../lib/useRaf'
import { useVisible } from '../lib/useVisible'
import { HeroCanvas } from './HeroCanvas'
import { epicycles, fern, flowField, harmonograph, lorenz, phyllotaxis, timesTable, type AnyScene } from './canvasScenes'

type Scene = { id: string; field: string; title: string; tex: string; duration: number; scene: AnyScene }

const SCENES: Scene[] = [
  { id: 'phyllotaxis', field: '数列', title: '黄金角のヒマワリ', tex: 'r_n=c\\sqrt n,\\ \\ \\theta_n=n\\cdot 137.5^\\circ', duration: 10, scene: phyllotaxis },
  { id: 'times', field: '整数', title: '円周上の掛け算表', tex: 'i\\ \\mapsto\\ k\\,i \\bmod N', duration: 12, scene: timesTable },
  { id: 'lorenz', field: '微分方程式', title: 'ローレンツ・アトラクタ', tex: '\\dot x=\\sigma(y-x),\\ \\dot y=x(\\rho-z)-y,\\ \\dot z=xy-\\beta z', duration: 12, scene: lorenz },
  { id: 'epicycles', field: '複素数', title: '回る円が描くハート', tex: 'z(t)=\\sum_{m} c_m\\,e^{2\\pi i m t}', duration: 10, scene: epicycles },
  { id: 'harmonograph', field: '三角関数', title: 'ハーモノグラフ', tex: 'x(t)=\\sum_k A_k\\sin(f_k t+\\varphi_k)\\,e^{-d t}', duration: 11, scene: harmonograph },
  { id: 'fern', field: '確率', title: 'バーンズリーのシダ', tex: '\\vec x\\ \\mapsto\\ A_i\\vec x+\\vec b_i\\quad(\\text{確率 } p_i)', duration: 10, scene: fern },
  { id: 'flow', field: 'ベクトル場', title: '流れの中の粒子', tex: '\\frac{d\\vec x}{dt}=\\vec v(\\vec x,t)', duration: 11, scene: flowField },
]

const FADE = 0.6
const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function HeroCarousel() {
  // #home?scene=lorenz で最初のシーン、&t=8 でその時刻に止めた状態を指定できる
  const [idx, setIdx] = useState(() => Math.max(0, SCENES.findIndex((sc) => sc.id === readHash().params.get('scene'))))
  const [fixedT] = useState(() => {
    const v = Number(readHash().params.get('t'))
    return Number.isFinite(v) && v > 0 ? v : null
  })
  const [still] = useState(() => fixedT !== null || reducedMotion())
  const [t, setT] = useState(0)
  const [hover, setHover] = useState(false)
  const s = SCENES[idx]
  const rootRef = useRef<HTMLDivElement>(null)
  const visible = useVisible(rootRef)

  // 画面外にあるあいだは切り替えも止める
  useRaf(!still && visible, (dt) => {
    // ホバー中は切り替えだけ止める（描画は続く）
    if (hover) return
    if (t + dt >= s.duration) {
      setIdx((i) => (i + 1) % SCENES.length)
      setT(0)
    } else setT(t + dt)
  })

  const go = (i: number) => {
    setIdx((i + SCENES.length) % SCENES.length)
    setT(0)
  }
  const opacity = still || hover ? 1 : Math.max(0, Math.min(1, t / FADE, (s.duration - t) / FADE))

  return (
    <div ref={rootRef} className="hero-carousel" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="hero-stage" style={{ opacity }} role="img" aria-label={`${s.field}: ${s.title}`}>
        <HeroCanvas key={s.id} scene={s.scene} fixedT={still ? (fixedT ?? s.duration * 0.7) : null} />
        <div className="hero-overlay">
          <span className="hero-field">{s.field}</span>
          <span className="hero-title-sm">{s.title}</span>
          <span className="hero-formula">
            <Tex tex={s.tex} />
          </span>
        </div>
        <button className="hero-nav prev" onClick={() => go(idx - 1)} aria-label="前へ">‹</button>
        <button className="hero-nav next" onClick={() => go(idx + 1)} aria-label="次へ">›</button>
      </div>
    </div>
  )
}
