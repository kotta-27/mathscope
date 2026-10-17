import { createContext, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import katex from 'katex'
import type { Frame } from './util'

const SvgRef = createContext<RefObject<SVGSVGElement | null> | null>(null)

/** 定理カードに入れる図の枠。controls にスライダー、caption に説明 */
export function Fig({
  w,
  h,
  children,
  controls,
  caption,
  vb,
}: {
  w: number
  h: number
  /** viewBox を内容に合わせたいとき [x, y, w, h] */
  vb?: [number, number, number, number]
  children: ReactNode
  controls?: ReactNode
  caption?: ReactNode
}) {
  const ref = useRef<SVGSVGElement>(null)
  return (
    <figure className="fig">
      <SvgRef.Provider value={ref}>
        <svg ref={ref} viewBox={vb ? vb.join(' ') : `0 0 ${w} ${h}`} className="fig-svg">
          {children}
        </svg>
      </SvgRef.Provider>
      {controls && <div className="fig-controls">{controls}</div>}
      {caption && <figcaption className="fig-caption">{caption}</figcaption>}
    </figure>
  )
}

/** ドラッグできる点。onMove には viewBox 座標が渡る */
export function Handle({
  x,
  y,
  onMove,
  color = 'currentColor',
  r = 7,
}: {
  x: number
  y: number
  onMove: (x: number, y: number) => void
  color?: string
  r?: number
}) {
  const ref = useContext(SvgRef)
  const [drag, setDrag] = useState(false)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return (
    <g className="fig-handle">
      <circle cx={x} cy={y} r={r + 10} fill="transparent"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          setDrag(true)
        }}
        onPointerMove={(e) => {
          const svg = ref?.current
          if (!drag || !svg) return
          const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()!.inverse())
          onMove(p.x, p.y)
        }}
        onPointerUp={() => setDrag(false)}
      />
      <circle cx={x} cy={y} r={drag ? r + 2 : r} fill={color} className="fig-handle-dot" />
    </g>
  )
}

/** SVG 内に KaTeX を置く */
export function TexAt({
  x,
  y,
  tex,
  color,
  anchor = 'middle',
  size = 15,
}: {
  x: number
  y: number
  tex: string
  color?: string
  anchor?: 'start' | 'middle' | 'end'
  size?: number
}) {
  const html = useMemo(() => katex.renderToString(tex, { throwOnError: false, strict: 'ignore' }), [tex])
  const w = 400
  const h = 60
  const left = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x
  return (
    <foreignObject x={left} y={y - h / 2} width={w} height={h} className="fig-fo">
      <div className={`fig-tex ${anchor}`} style={{ color, fontSize: size }} dangerouslySetInnerHTML={{ __html: html }} />
    </foreignObject>
  )
}

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = 'currentColor',
  width = 2.5,
  dashed,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  color?: string
  width?: number
  dashed?: boolean
}) {
  const len = Math.hypot(x2 - x1, y2 - y1)
  if (len < 1) return null
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len
  const hs = Math.min(12, len * 0.4)
  const bx = x2 - ux * hs
  const by = y2 - uy * hs
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeDasharray={dashed ? '5 4' : undefined} />
      <polygon points={`${x2},${y2} ${bx - uy * hs * 0.45},${by + ux * hs * 0.45} ${bx + uy * hs * 0.45},${by - ux * hs * 0.45}`} fill={color} />
    </g>
  )
}

/** 座標軸（と任意で格子） */
export function Axes({ f, grid = false, step = 1 }: { f: Frame; grid?: boolean; step?: number }) {
  const lines: ReactNode[] = []
  if (grid) {
    for (let x = Math.ceil(f.xr[0] / step) * step; x <= f.xr[1]; x += step)
      lines.push(<line key={`x${x}`} x1={f.X(x)} x2={f.X(x)} y1={f.box.y} y2={f.box.y + f.box.h} className="fig-grid" />)
    for (let y = Math.ceil(f.yr[0] / step) * step; y <= f.yr[1]; y += step)
      lines.push(<line key={`y${y}`} y1={f.Y(y)} y2={f.Y(y)} x1={f.box.x} x2={f.box.x + f.box.w} className="fig-grid" />)
  }
  const y0 = Math.max(f.yr[0], Math.min(f.yr[1], 0))
  const x0 = Math.max(f.xr[0], Math.min(f.xr[1], 0))
  return (
    <g>
      {lines}
      <line x1={f.box.x} x2={f.box.x + f.box.w} y1={f.Y(y0)} y2={f.Y(y0)} className="fig-axis" />
      <line x1={f.X(x0)} x2={f.X(x0)} y1={f.box.y} y2={f.box.y + f.box.h} className="fig-axis" />
    </g>
  )
}

/** 頂点 v で、v→p と v→q のなす角を表す弧 */
export function AngleArc({ v, p, q, r = 24, color = 'currentColor', label }: {
  v: [number, number]
  p: [number, number]
  q: [number, number]
  r?: number
  color?: string
  label?: string
}) {
  const a1 = Math.atan2(p[1] - v[1], p[0] - v[0])
  const a2 = Math.atan2(q[1] - v[1], q[0] - v[0])
  let d = a2 - a1
  while (d > Math.PI) d -= 2 * Math.PI
  while (d < -Math.PI) d += 2 * Math.PI
  const sweep = d > 0 ? 1 : 0
  const s = [v[0] + r * Math.cos(a1), v[1] + r * Math.sin(a1)]
  const e = [v[0] + r * Math.cos(a1 + d), v[1] + r * Math.sin(a1 + d)]
  const mid = a1 + d / 2
  return (
    <g>
      <path d={`M${s[0]},${s[1]} A${r},${r} 0 0 ${sweep} ${e[0]},${e[1]}`} fill="none" stroke={color} strokeWidth={1.8} />
      {label && <TexAt x={v[0] + (r + 16) * Math.cos(mid)} y={v[1] + (r + 16) * Math.sin(mid)} tex={label} color={color} size={13} />}
    </g>
  )
}
