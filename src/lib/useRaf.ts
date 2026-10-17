import { useEffect, useRef } from 'react'

/** active の間、毎フレーム dt（秒）付きで呼ぶ */
export function useRaf(active: boolean, cb: (dt: number) => void) {
  const ref = useRef(cb)
  useEffect(() => {
    ref.current = cb
  })
  useEffect(() => {
    if (!active) return
    let raf = 0
    let last = performance.now()
    const tick = (t: number) => {
      ref.current(Math.min(0.05, (t - last) / 1000))
      last = t
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])
}
