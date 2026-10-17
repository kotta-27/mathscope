import { useEffect, useRef } from 'react'
import type { AnyScene, Ctx } from './canvasScenes'

const surfaceColor = (el: Element) => getComputedStyle(el).getPropertyValue('--surface').trim() || '#1d2024'
const isDark = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches

/**
 * シーンを Canvas に描き続ける。fixedT を渡すと、その時刻まで早送りして止める。
 * 幅は親要素に合わせ、高さは 4:3。
 */
export function HeroCanvas({ scene, fixedT }: { scene: AnyScene; fixedT: number | null }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const parent = canvas.parentElement!
    const ctx = canvas.getContext('2d')!
    let c!: Ctx
    let state: unknown
    let t = 0
    let raf = 0

    const setup = () => {
      const w = parent.clientWidth
      const h = Math.round(w * 0.75)
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      c = { ctx, w, h, dark: isDark(), bg: surfaceColor(canvas) }
      ctx.fillStyle = c.bg
      ctx.fillRect(0, 0, w, h)
      state = scene.init(c)
      t = 0
    }
    setup()

    if (fixedT !== null) {
      const dt = 1 / 60
      const n = Math.ceil(fixedT / dt)
      for (let k = 1; k <= n; k++) {
        t += dt
        scene.frame(c, state, t, dt, k === n)
      }
      return
    }

    // 画面外にあるあいだは描かない
    let visible = true
    let last = performance.now()
    const loop = (now: number) => {
      if (!visible) {
        raf = 0
        return
      }
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      t += dt
      scene.frame(c, state, t, dt, true)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) {
        last = performance.now()
        raf = requestAnimationFrame(loop)
      }
    })
    io.observe(canvas)
    const ro = new ResizeObserver(() => {
      if (Math.abs(parent.clientWidth - c.w) > 2) setup()
    })
    ro.observe(parent)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [scene, fixedT])

  return <canvas ref={ref} className="hero-canvas" />
}
