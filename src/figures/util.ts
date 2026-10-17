export const C = {
  red: '#e4572e',
  blue: '#2e86ab',
  green: '#3bb273',
  purple: '#a259ff',
  orange: '#f2a541',
  pink: '#d63a8c',
}
export const SERIES = [C.blue, C.red, C.green, C.purple, C.orange, C.pink]

/** 数学座標 ↔ SVG 座標の変換 */
export function frame(xr: [number, number], yr: [number, number], box: { x: number; y: number; w: number; h: number }) {
  const X = (x: number) => box.x + ((x - xr[0]) / (xr[1] - xr[0])) * box.w
  const Y = (y: number) => box.y + box.h - ((y - yr[0]) / (yr[1] - yr[0])) * box.h
  const ix = (px: number) => xr[0] + ((px - box.x) / box.w) * (xr[1] - xr[0])
  const iy = (py: number) => yr[0] + ((box.y + box.h - py) / box.h) * (yr[1] - yr[0])
  const path = (f: (x: number) => number, a = xr[0], b = xr[1], n = 200) => {
    let d = ''
    for (let i = 0; i <= n; i++) {
      const x = a + ((b - a) * i) / n
      const y = f(x)
      if (Number.isFinite(y)) d += `${d ? 'L' : 'M'}${X(x).toFixed(1)},${Y(y).toFixed(1)}`
    }
    return d
  }
  return { X, Y, ix, iy, path, xr, yr, box }
}
export type Frame = ReturnType<typeof frame>

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
export const r2 = (v: number, d = 2) => {
  const s = Number(v.toFixed(d))
  return Object.is(s, -0) ? 0 : s
}
/** 係数を符号つきで書く（+1.5 / −1.5）。k を渡すと 1 を省いて「+x」「−x」にする */
export const sgn = (v: number, k = '') => {
  const a = r2(Math.abs(v))
  return `${v < 0 ? '-' : '+'}${k && a === 1 ? '' : a}${k}`
}
/** 負の数をかっこで包む */
export const par = (v: number) => (v < 0 ? `(${r2(v)})` : `${r2(v)}`)
export const deg = (rad: number) => (rad * 180) / Math.PI
/** 2 ベクトルのなす角（ラジアン） */
export const angleBetween = (ax: number, ay: number, bx: number, by: number) =>
  Math.acos(clamp((ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by) || 1), -1, 1))


/** 点群を囲む viewBox（余白つき） */
export function fitBox(pts: [number, number][], pad = 30, minW = 0): [number, number, number, number] {
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  let x0 = Math.min(...xs) - pad
  let w = Math.max(...xs) + pad - x0
  if (w < minW) {
    x0 -= (minW - w) / 2
    w = minW
  }
  const y0 = Math.min(...ys) - pad
  return [x0, y0, w, Math.max(...ys) + pad - y0]
}
