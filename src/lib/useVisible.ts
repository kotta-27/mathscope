import { useEffect, useState, type RefObject } from 'react'

/** 要素が画面に見えているか */
export function useVisible(ref: RefObject<Element | null>) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return visible
}
