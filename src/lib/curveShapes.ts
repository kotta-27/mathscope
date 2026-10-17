import type { PlotCtx } from '../components/Plot'
import { evalNum } from './math'
import type { GraphExpr } from './graphExpr'
import { holds } from './graphExpr'
import { contour, paramPath, region } from './contour'

export type OkExpr = Extract<GraphExpr, { ok: true }>
const TAU = 2 * Math.PI

/** 1 本の式を、画面の path（線・塗り）にする */
export function curveShapes(e: OkExpr, scope: Record<string, number>, ctx: PlotCtx, step: number): { line: string; fill?: string; dashed?: boolean } {
  const c = e.curve
  const { view: v, w, h } = ctx
  if (c.kind === 'fn') return { line: ctx.path((x) => evalNum(c.f.code, { ...scope, x })) }
  if (c.kind === 'param' || c.kind === 'polar') {
    const X = c.kind === 'param' ? (t: number) => evalNum(c.x.code, { ...scope, t }) : (t: number) => evalNum(c.r.code, { ...scope, theta: t }) * Math.cos(t)
    const Y = c.kind === 'param' ? (t: number) => evalNum(c.y.code, { ...scope, t }) : (t: number) => evalNum(c.r.code, { ...scope, theta: t }) * Math.sin(t)
    return { line: paramPath(X, Y, 0, TAU, ctx.sx, ctx.sy, h, 1200) }
  }
  const wx = (px: number) => v.xMin + (px / w) * (v.xMax - v.xMin)
  const wy = (py: number) => v.yMax - (py / h) * (v.yMax - v.yMin)
  const F = (x: number, y: number) => evalNum(c.F.code, { ...scope, x, y })
  const line = contour({ w, h, step, wx, wy, F })
  if (c.kind === 'implicit') return { line }
  const op = c.op
  return { line, fill: region({ w, h, step, wx, wy, F, test: (val) => holds(val, op) }), dashed: op === '<' || op === '>' }
}

/** 格子の間隔（px）。画面が大きいほど粗くしてよい */
export const gridStep = (ctx: PlotCtx) => Math.max(3, Math.round(Math.min(ctx.w, ctx.h) / 120))

