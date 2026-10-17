import type { ReactNode } from 'react'
import { FigId } from './state'

/** この中の図は、id の定理の図として状態を URL に残す */
export function FigScope({ id, children }: { id: string; children: ReactNode }) {
  return <FigId.Provider value={id}>{children}</FigId.Provider>
}
