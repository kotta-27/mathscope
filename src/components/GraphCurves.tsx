import { useMemo } from 'react'
import type { PlotCtx } from './Plot'
import { PALETTE } from '../lib/math'
import type { GraphExpr } from '../lib/graphExpr'
import { curveShapes, gridStep } from '../lib/curveShapes'

/** 今の式を描く */
export function Curves({ exprs, ids, scope, ctx, hidden }: { exprs: GraphExpr[]; ids: number[]; scope: Record<string, number>; ctx: PlotCtx; hidden?: Set<number> }) {
  const step = gridStep(ctx)
  return (
    <>
      {exprs.map((e, i) => {
        if (!e.ok || hidden?.has(ids[i])) return null
        const color = PALETTE[i % PALETTE.length]
        const s = curveShapes(e, scope, ctx, step)
        return (
          <g key={ids[i]}>
            {s.fill && <path d={s.fill} fill={color} opacity={0.2} />}
            <path d={s.line} stroke={color} className="curve" strokeDasharray={s.dashed ? '7 5' : undefined} />
          </g>
        )
      })}
    </>
  )
}

/**
 * 残像: 以前のパラメータの値で描いた形を、古いものほど薄く重ねる。
 * 表示範囲か残像が変わったときだけ計算し直す。
 */
export function Ghosts({ exprs, ids, snaps, ctx, hidden }: { exprs: GraphExpr[]; ids: number[]; snaps: Record<string, number>[]; ctx: PlotCtx; hidden?: Set<number> }) {
  const { xMin, xMax, yMin, yMax } = ctx.view
  const paths = useMemo(
    () => snaps.map((sc) => exprs.map((e, i) => (e.ok && !hidden?.has(ids[i]) ? curveShapes(e, sc, ctx, gridStep(ctx) * 2).line : null))),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ctx は毎回新しいので、表示範囲と大きさで判断する
    [snaps, exprs, hidden, xMin, xMax, yMin, yMax, ctx.w, ctx.h],
  )
  return (
    <g className="ghosts" aria-hidden>
      {paths.map((row, k) =>
        row.map((d, i) =>
          d ? <path key={`${k}-${i}`} d={d} stroke={PALETTE[i % PALETTE.length]} fill="none" strokeWidth={1.6} opacity={0.08 + (0.32 * (k + 1)) / paths.length} /> : null,
        ),
      )}
    </g>
  )
}
