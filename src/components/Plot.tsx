import { useEffect, useRef, useState, type ReactNode } from 'react'

export type View = { xMin: number; xMax: number; yMin: number; yMax: number }

export type PlotCtx = {
  view: View
  w: number
  h: number
  sx: (x: number) => number
  sy: (y: number) => number
  toWorld: (clientX: number, clientY: number) => { x: number; y: number }
  /** 関数のグラフを SVG path にする。不連続点では線を切る */
  path: (f: (x: number) => number, from?: number, to?: number) => string
}

function niceStep(range: number) {
  const raw = range / 8
  const p = 10 ** Math.floor(Math.log10(raw))
  const m = raw / p
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p
}

const label = (v: number, step: number) => {
  const d = Math.max(0, -Math.floor(Math.log10(step)))
  return Number(v.toFixed(d)).toString()
}

export function Plot({
  initial,
  height = 440,
  children,
  onView,
  equal = false,
  onHover,
  overlay,
}: {
  initial: View
  height?: number
  children: (ctx: PlotCtx) => ReactNode
  /** 表示範囲が変わったとき */
  onView?: (v: View) => void
  /** x と y の 1 目盛りを同じ長さにする（円が円に見えるように）。y の範囲は中心を保って合わせる */
  equal?: boolean
  /** マウスを乗せた位置（指ではタップした位置）。離れたら null */
  onHover?: (p: { x: number; y: number } | null) => void
  /** グラフの上に重ねる HTML（凡例など） */
  overlay?: ReactNode
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<SVGSVGElement | null>(null)
  const [w, setW] = useState(640)
  const [rawView, setView] = useState(initial)
  const drag = useRef<{ x: number; y: number; view: View } | null>(null)
  // 2 本の指で拡大縮小するときの、指の位置と始めの表示範囲
  const touches = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ d: number; cx: number; cy: number; view: View } | null>(null)
  const h = height
  // equal: 1 目盛りを縦横同じ長さにし、指定した範囲がすべて入るように広げる
  const view: View = equal
    ? (() => {
        const k = Math.max((rawView.xMax - rawView.xMin) / w, (rawView.yMax - rawView.yMin) / h)
        const xc = (rawView.xMin + rawView.xMax) / 2
        const yc = (rawView.yMin + rawView.yMax) / 2
        return { xMin: xc - (k * w) / 2, xMax: xc + (k * w) / 2, yMin: yc - (k * h) / 2, yMax: yc + (k * h) / 2 }
      })()
    : rawView
  const onViewRef = useRef(onView)
  useEffect(() => {
    onViewRef.current = onView
  })
  useEffect(() => {
    onViewRef.current?.(view)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 値が変わったときだけ知らせる（equal では毎回新しいオブジェクトになるため）
  }, [view.xMin, view.xMax, view.yMin, view.yMax])

  useEffect(() => {
    const el = wrapRef.current!
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!svg) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const r = svg.getBoundingClientRect()
      const fx = (e.clientX - r.left) / r.width
      const fy = 1 - (e.clientY - r.top) / r.height
      const k = Math.exp(e.deltaY * 0.0015)
      setView((v) => {
        const cx = v.xMin + fx * (v.xMax - v.xMin)
        const cy = v.yMin + fy * (v.yMax - v.yMin)
        return {
          xMin: cx - (cx - v.xMin) * k,
          xMax: cx + (v.xMax - cx) * k,
          yMin: cy - (cy - v.yMin) * k,
          yMax: cy + (v.yMax - cy) * k,
        }
      })
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [svg])

  const dx = view.xMax - view.xMin
  const dy = view.yMax - view.yMin
  const sx = (x: number) => ((x - view.xMin) / dx) * w
  const sy = (y: number) => h - ((y - view.yMin) / dy) * h
  const toWorld = (cx: number, cy: number) => {
    const r = svg!.getBoundingClientRect()
    return { x: view.xMin + ((cx - r.left) / r.width) * dx, y: view.yMin + (1 - (cy - r.top) / r.height) * dy }
  }
  const path = (f: (x: number) => number, from = view.xMin, to = view.xMax) => {
    let d = ''
    let prev: number | null = null
    const a = Math.max(from, view.xMin)
    const b = Math.min(to, view.xMax)
    const n = Math.ceil(((b - a) / dx) * w * 1.5)
    for (let i = 0; i <= n; i++) {
      const x = a + ((b - a) * i) / n
      const y = f(x)
      if (!Number.isFinite(y)) {
        prev = null
        continue
      }
      const py = Math.max(-h * 2, Math.min(h * 3, sy(y)))
      const jump = prev !== null && Math.abs(py - prev) > h * 1.5
      d += `${prev === null || jump ? 'M' : 'L'}${sx(x).toFixed(1)},${py.toFixed(1)}`
      prev = py
    }
    return d
  }

  const xs = niceStep(dx)
  const ys = niceStep(dy)
  const grid: ReactNode[] = []
  const x0 = Math.max(4, Math.min(w - 4, sx(0)))
  const y0 = Math.max(4, Math.min(h - 4, sy(0)))
  for (let x = Math.ceil(view.xMin / xs) * xs; x <= view.xMax; x += xs) {
    const px = sx(x)
    grid.push(<line key={`gx${x}`} x1={px} x2={px} y1={0} y2={h} className="grid" />)
    if (Math.abs(x) > xs / 2 && px > 12 && px < w - 12)
      grid.push(
        <text key={`lx${x}`} x={px} y={Math.min(h - 6, y0 + 14)} className="tick" textAnchor="middle">
          {label(x, xs)}
        </text>,
      )
  }
  for (let y = Math.ceil(view.yMin / ys) * ys; y <= view.yMax; y += ys) {
    const py = sy(y)
    grid.push(<line key={`gy${y}`} x1={0} x2={w} y1={py} y2={py} className="grid" />)
    if (Math.abs(y) > ys / 2 && py > 10 && py < h - 6)
      grid.push(
        <text key={`ly${y}`} x={Math.min(w - 6, x0 + 6)} y={py + 4} className="tick">
          {label(y, ys)}
        </text>,
      )
  }

  return (
    <div className="plot" ref={wrapRef}>
      <svg
        ref={setSvg}
        width={w}
        height={h}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
          if (touches.current.size === 2) {
            const [a, b] = [...touches.current.values()]
            const r = e.currentTarget.getBoundingClientRect()
            pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, cx: ((a.x + b.x) / 2 - r.left) / r.width, cy: 1 - ((a.y + b.y) / 2 - r.top) / r.height, view }
            drag.current = null
          } else drag.current = { x: e.clientX, y: e.clientY, view }
        }}
        onPointerMove={(e) => {
          if (touches.current.has(e.pointerId)) touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
          const p = pinch.current
          if (p && touches.current.size === 2) {
            const [a, b] = [...touches.current.values()]
            const k = p.d / (Math.hypot(a.x - b.x, a.y - b.y) || 1)
            const v = p.view
            const fx = v.xMin + p.cx * (v.xMax - v.xMin)
            const fy = v.yMin + p.cy * (v.yMax - v.yMin)
            setView({ xMin: fx - (fx - v.xMin) * k, xMax: fx + (v.xMax - fx) * k, yMin: fy - (fy - v.yMin) * k, yMax: fy + (v.yMax - fy) * k })
            return
          }
          const d = drag.current
          if (!d) {
            if (e.pointerType === 'mouse' && onHover) onHover(toWorld(e.clientX, e.clientY))
            return
          }
          const mx = ((e.clientX - d.x) / w) * dx
          const my = ((e.clientY - d.y) / h) * dy
          setView({ xMin: d.view.xMin - mx, xMax: d.view.xMax - mx, yMin: d.view.yMin + my, yMax: d.view.yMax + my })
        }}
        onPointerUp={(e) => {
          // 指でほとんど動かさずに離したら、その位置をなぞった点にする
          const d = drag.current
          if (d && e.pointerType !== 'mouse' && onHover && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) onHover(toWorld(e.clientX, e.clientY))
          touches.current.delete(e.pointerId)
          pinch.current = null
          drag.current = null
        }}
        onPointerLeave={(e) => e.pointerType === 'mouse' && onHover?.(null)}
        onPointerCancel={(e) => {
          touches.current.delete(e.pointerId)
          pinch.current = null
          drag.current = null
        }}
      >
        {grid}
        <line x1={0} x2={w} y1={sy(0)} y2={sy(0)} className="axis" />
        <line x1={sx(0)} x2={sx(0)} y1={0} y2={h} className="axis" />
        {children({ view, w, h, sx, sy, toWorld, path })}
      </svg>
      {overlay}
      <button className="plot-reset" onClick={() => setView(initial)}>
        表示をリセット
      </button>
    </div>
  )
}

/** グラフ上でドラッグできる点 */
export function DragPoint({
  ctx,
  x,
  y,
  color,
  onDrag,
}: {
  ctx: PlotCtx
  x: number
  y: number
  color: string
  onDrag: (p: { x: number; y: number }) => void
}) {
  const [active, setActive] = useState(false)
  if (!Number.isFinite(y)) return null
  return (
    <circle
      cx={ctx.sx(x)}
      cy={ctx.sy(y)}
      r={active ? 9 : 7}
      fill={color}
      className="drag-point"
      onPointerDown={(e) => {
        e.stopPropagation()
        e.currentTarget.setPointerCapture(e.pointerId)
        setActive(true)
      }}
      onPointerMove={(e) => {
        if (!active) return
        e.stopPropagation()
        onDrag(ctx.toWorld(e.clientX, e.clientY))
      }}
      onPointerUp={() => setActive(false)}
    />
  )
}

export function Dot({ ctx, x, y, color, r = 4 }: { ctx: PlotCtx; x: number; y: number; color: string; r?: number }) {
  if (!Number.isFinite(y)) return null
  return <circle cx={ctx.sx(x)} cy={ctx.sy(y)} r={r} fill={color} />
}

/** 点 (x0, y0) を通る傾き m の直線（画面いっぱい） */
export function Line({ ctx, x0, y0, m, className }: { ctx: PlotCtx; x0: number; y0: number; m: number; className?: string }) {
  if (!Number.isFinite(y0) || !Number.isFinite(m)) return null
  const { xMin, xMax } = ctx.view
  return (
    <line
      x1={ctx.sx(xMin)}
      y1={ctx.sy(y0 + m * (xMin - x0))}
      x2={ctx.sx(xMax)}
      y2={ctx.sy(y0 + m * (xMax - x0))}
      className={className}
    />
  )
}
