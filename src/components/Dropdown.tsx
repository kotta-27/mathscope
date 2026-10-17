import { useEffect, useId, useRef, useState } from 'react'

export type DropdownGroup<T> = { label: string; items: { label: string; value: T }[] }

/**
 * 見出しつきの選択メニュー。ボタンを押すと一覧が開き、選ぶと閉じる。
 * キーボード: ↑↓ で移動、Enter で選ぶ、Esc で閉じる。外を押しても閉じる。
 */
export function Dropdown<T>({ label, groups, onSelect }: { label: string; groups: DropdownGroup<T>[]; onSelect: (v: T) => void }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const id = useId()
  const flat = groups.flatMap((g) => g.items)

  // 外を押したら閉じる
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  // 選んでいる項目が見えるようにスクロールする
  useEffect(() => {
    if (open) list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  const choose = (i: number) => {
    const it = flat[i]
    if (!it) return
    onSelect(it.value)
    setOpen(false)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setOpen(true)
      }
      return
    }
    if (e.key === 'ArrowDown') setActive((a) => Math.min(flat.length - 1, a + 1))
    else if (e.key === 'ArrowUp') setActive((a) => Math.max(0, a - 1))
    else if (e.key === 'Home') setActive(0)
    else if (e.key === 'End') setActive(flat.length - 1)
    else if (e.key === 'Enter' || e.key === ' ') choose(active)
    else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false)
      if (e.key === 'Tab') return
    } else return
    e.preventDefault()
  }

  // 各見出しの最初の項目が、全体で何番目か
  const starts = groups.map((_, gi) => groups.slice(0, gi).reduce((t, g) => t + g.items.length, 0))
  return (
    <div className={`dropdown ${open ? 'open' : ''}`} ref={root}>
      <button
        type="button"
        className="dropdown-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={onKey}
      >
        <span>{label}</span>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="dropdown-list" role="listbox" id={id} ref={list} aria-label={label}>
          {groups.map((g, gi) => (
            <div key={g.label} role="group" aria-label={g.label}>
              <div className="dropdown-group">{g.label}</div>
              {g.items.map((it, k) => {
                const i = starts[gi] + k
                return (
                  <div
                    key={it.label}
                    id={`${id}-${i}`}
                    data-i={i}
                    role="option"
                    aria-selected={i === active}
                    className={`dropdown-item ${i === active ? 'active' : ''}`}
                    onPointerEnter={() => setActive(i)}
                    // 押した瞬間にボタンからフォーカスが外れないように
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => choose(i)}
                  >
                    {it.label}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
