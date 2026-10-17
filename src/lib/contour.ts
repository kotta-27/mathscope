/**
 * x と y の式 F(x, y) を画面に描くための計算。
 * 画面を小さな格子に分け、各格子点で F の値を求める。
 * - contour: F = 0 の線（マーチングスクエア法）
 * - region: F の符号が条件を満たす部分を、横に続くマスごとにまとめた長方形
 */

type Sampler = {
  /** 画面の幅・高さ（px）と格子の間隔（px） */
  w: number
  h: number
  step: number
  /** 画面座標 → 数学の座標 */
  wx: (px: number) => number
  wy: (py: number) => number
  F: (x: number, y: number) => number
}

function grid({ w, h, step, wx, wy, F }: Sampler) {
  const nx = Math.ceil(w / step) + 1
  const ny = Math.ceil(h / step) + 1
  const v = new Float64Array(nx * ny)
  for (let j = 0; j < ny; j++) {
    const y = wy(j * step)
    for (let i = 0; i < nx; i++) v[j * nx + i] = F(wx(i * step), y)
  }
  return { nx, ny, v }
}

/** F = 0 の線を SVG の path にする */
export function contour(s: Sampler): string {
  const { nx, ny, v } = grid(s)
  const { step } = s
  let d = ''
  const at = (i: number, j: number) => v[j * nx + i]
  // 辺の上で 0 になる位置（線形補間）
  const lerp = (a: number, b: number) => (a === b ? 0.5 : a / (a - b))
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = at(i, j)
      const b = at(i + 1, j)
      const c = at(i + 1, j + 1)
      const e = at(i, j + 1)
      if (![a, b, c, e].every(Number.isFinite)) continue
      const k = (a > 0 ? 1 : 0) | (b > 0 ? 2 : 0) | (c > 0 ? 4 : 0) | (e > 0 ? 8 : 0)
      if (k === 0 || k === 15) continue
      // 値が大きく飛ぶマス（1/x のような不連続）は線を引かない
      const big = Math.max(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(e))
      const small = Math.min(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(e))
      if (big > 1e6 && small > 1e3) continue
      const x0 = i * step
      const y0 = j * step
      const T: [number, number] = [x0 + lerp(a, b) * step, y0]
      const R: [number, number] = [x0 + step, y0 + lerp(b, c) * step]
      const B: [number, number] = [x0 + lerp(e, c) * step, y0 + step]
      const L: [number, number] = [x0, y0 + lerp(a, e) * step]
      const seg = (p: [number, number], q: [number, number]) => (d += `M${p[0].toFixed(1)},${p[1].toFixed(1)}L${q[0].toFixed(1)},${q[1].toFixed(1)}`)
      switch (k) {
        case 1: case 14: seg(L, T); break
        case 2: case 13: seg(T, R); break
        case 3: case 12: seg(L, R); break
        case 4: case 11: seg(R, B); break
        case 6: case 9: seg(T, B); break
        case 7: case 8: seg(L, B); break
        case 5: case 10: {
          // 向かい合う角だけが同じ符号: マスの中心の値で分け方を決める
          const center = (a + b + c + e) / 4 > 0
          if ((k === 5) === center) {
            seg(L, B)
            seg(T, R)
          } else {
            seg(L, T)
            seg(R, B)
          }
          break
        }
      }
    }
  }
  return d
}

/** 条件を満たすマスを、横に続く長方形にまとめて SVG の path にする */
export function region(s: Sampler & { test: (v: number) => boolean }): string {
  const { step, w, h, wx, wy, F, test } = s
  const nx = Math.ceil(w / step)
  const ny = Math.ceil(h / step)
  let d = ''
  for (let j = 0; j < ny; j++) {
    const y = wy((j + 0.5) * step)
    let start = -1
    for (let i = 0; i <= nx; i++) {
      const inside = i < nx && test(F(wx((i + 0.5) * step), y))
      if (inside && start < 0) start = i
      if (!inside && start >= 0) {
        d += `M${start * step},${j * step}h${(i - start) * step}v${step}h${-(i - start) * step}z`
        start = -1
      }
    }
  }
  return d
}

/** t を [a, b] で動かした点 (X(t), Y(t)) を、画面座標の path にする */
export function paramPath(X: (t: number) => number, Y: (t: number) => number, a: number, b: number, sx: (x: number) => number, sy: (y: number) => number, h: number, n = 800) {
  let d = ''
  let pen = false
  let prev: [number, number] | null = null
  for (let k = 0; k <= n; k++) {
    const t = a + ((b - a) * k) / n
    const x = X(t)
    const y = Y(t)
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      pen = false
      continue
    }
    const p: [number, number] = [sx(x), sy(y)]
    // 画面の何倍も飛ぶところ（漸近線）では線を切る
    const jump = prev && Math.hypot(p[0] - prev[0], p[1] - prev[1]) > h * 2
    d += `${pen && !jump ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`
    pen = true
    prev = p
  }
  return d
}
