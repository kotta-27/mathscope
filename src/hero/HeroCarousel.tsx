import { useRef, useState } from 'react'
import { Tex } from '../components/Tex'
import { hrefTo, readHash } from '../lib/route'
import { useRaf } from '../lib/useRaf'
import { useVisible } from '../lib/useVisible'
import { HeroCanvas } from './HeroCanvas'
import { dragon, epicycles, fern, flowField, fourierSquare, goldenSpiral, harmonograph, lorenz, mandelbrot, pascalMod2, phyllotaxis, timesTable, ulam, type AnyScene } from './canvasScenes'

/** link: その絵の数学を、アプリのどこで触れるか */
type Scene = { id: string; field: string; title: string; tex: string; duration: number; scene: AnyScene; link: { label: string; href: string } }

const SCENES: Scene[] = [
  { id: 'phyllotaxis', field: '数列', title: '黄金角のヒマワリ', tex: 'r_n=c\\sqrt n,\\ \\ \\theta_n=n\\cdot 137.5^\\circ', duration: 10, scene: phyllotaxis, link: { label: '√n で広がる半径をグラフで見る', href: hrefTo('graph', { f: 'c*sqrt(x)', c: 1 }) } },
  { id: 'times', field: '整数', title: '円周上の掛け算表', tex: 'i\\ \\mapsto\\ k\\,i \\bmod N', duration: 12, scene: timesTable, link: { label: '余り（mod）が回る様子をフェルマーの小定理で見る', href: hrefTo('theorems', { id: 'fermat-little' }) } },
  { id: 'lorenz', field: '微分方程式', title: 'ローレンツ・アトラクタ', tex: '\\dot x=\\sigma(y-x),\\ \\dot y=x(\\rho-z)-y,\\ \\dot z=xy-\\beta z', duration: 12, scene: lorenz, link: { label: '微分＝接線の傾きを見る', href: hrefTo('geometry', { demo: 'deriv' }) } },
  { id: 'epicycles', field: '複素数', title: '回る円が描くハート', tex: 'z(t)=\\sum_{m} c_m\\,e^{2\\pi i m t}', duration: 10, scene: epicycles, link: { label: '回る円をオイラーの公式で見る', href: hrefTo('theorems', { id: 'euler-formula' }) } },
  { id: 'harmonograph', field: '三角関数', title: 'ハーモノグラフ', tex: 'x(t)=\\sum_k A_k\\sin(f_k t+\\varphi_k)\\,e^{-d t}', duration: 11, scene: harmonograph, link: { label: '波の重ね合わせをグラフで動かす', href: hrefTo('graph', { f: ['sin(x)', 'sin(k*x)', 'sin(x) + sin(k*x)'], k: 1.5, play: 'k' }) } },
  { id: 'fern', field: '確率', title: 'バーンズリーのシダ', tex: '\\vec x\\ \\mapsto\\ A_i\\vec x+\\vec b_i\\quad(\\text{確率 } p_i)', duration: 10, scene: fern, link: { label: '行列で平面を移す様子を見る', href: hrefTo('theorems', { id: 'inverse-matrix' }) } },
  { id: 'flow', field: 'ベクトル場', title: '流れの中の粒子', tex: '\\frac{d\\vec x}{dt}=\\vec v(\\vec x,t)', duration: 11, scene: flowField, link: { label: '速度を積分すると位置になる（微積分の基本定理）', href: hrefTo('theorems', { id: 'ftc' }) } },
  { id: 'ulam', field: '素数', title: 'ウラムのらせん', tex: '1, 2, 3, \\ldots\\ \\text{をらせんに並べ、素数だけを塗る}', duration: 11, scene: ulam, link: { label: '素数は無数にある', href: hrefTo('theorems', { id: 'infinite-primes' }) } },
  { id: 'pascal', field: '二項係数', title: 'パスカルの三角形の奇数', tex: '\\binom{n}{k}\\ \\text{が奇数のところだけ}', duration: 10, scene: pascalMod2, link: { label: '二項定理で見る', href: hrefTo('theorems', { id: 'binomial' }) } },
  { id: 'mandelbrot', field: '複素数', title: 'マンデルブロ集合', tex: 'z_{n+1}=z_n^{\\,2}+c\\ \\text{が発散しない}\\ c', duration: 12, scene: mandelbrot, link: { label: '複素数の掛け算＝拡大と回転', href: hrefTo('theorems', { id: 'polar-product' }) } },
  { id: 'fourier', field: '三角関数', title: '円を足して作る矩形波', tex: '\\frac4\\pi\\left(\\sin x+\\frac{\\sin3x}{3}+\\frac{\\sin5x}{5}+\\cdots\\right)', duration: 12, scene: fourierSquare, link: { label: 'グラフで項を足してみる', href: hrefTo('graph', { f: ['4/pi*(sin(x) + sin(3x)/3 + sin(5x)/5 + sin(7x)/7)'] }) } },
  { id: 'golden', field: '数列', title: 'フィボナッチと黄金らせん', tex: 'F_{n+2}=F_{n+1}+F_n,\\ \\ \\frac{F_{n+1}}{F_n}\\to\\frac{1+\\sqrt5}{2}', duration: 11, scene: goldenSpiral, link: { label: '漸化式で見る', href: hrefTo('theorems', { id: 'recurrence' }) } },
  { id: 'dragon', field: '再帰', title: 'ドラゴン曲線', tex: '\\text{紙を半分に折り続けて、直角に開く}', duration: 13, scene: dragon, link: { label: '90° の回転を行列で見る', href: hrefTo('theorems', { id: 'rotation-matrix' }) } },
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
        {/* 絵を押すと、その数学を触れる画面へ */}
        <a className="hero-link" href={s.link.href} aria-label={s.link.label}>
          <span>{s.link.label} →</span>
        </a>
        <button className="hero-nav prev" onClick={() => go(idx - 1)} aria-label="前へ">‹</button>
        <button className="hero-nav next" onClick={() => go(idx + 1)} aria-label="次へ">›</button>
      </div>
    </div>
  )
}
