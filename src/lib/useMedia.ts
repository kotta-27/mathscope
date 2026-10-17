import { useSyncExternalStore } from 'react'

/** メディアクエリに合っているか（画面幅の変化に追従する） */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (f) => {
      const m = matchMedia(query)
      m.addEventListener('change', f)
      return () => m.removeEventListener('change', f)
    },
    () => matchMedia(query).matches,
    () => false,
  )
}
