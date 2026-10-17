import { useSyncExternalStore } from 'react'

/* 明るい／暗い表示と、発表モード */

export type Theme = 'light' | 'dark'
const KEY = 'mathscope-theme'
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((f) => f())
const subscribe = (f: () => void) => {
  listeners.add(f)
  return () => listeners.delete(f)
}

const systemDark = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches

/** いま見えている配色（自分で選んでいなければ OS の設定） */
export function currentTheme(): Theme {
  const t = document.documentElement.dataset.theme
  return t === 'light' || t === 'dark' ? t : systemDark() ? 'dark' : 'light'
}

export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t
  try {
    localStorage.setItem(KEY, t)
  } catch {
    // 保存できなくても、この画面では切り替わる
  }
  emit()
}

if (typeof matchMedia !== 'undefined') matchMedia('(prefers-color-scheme: dark)').addEventListener('change', emit)

export const useTheme = () => useSyncExternalStore(subscribe, currentTheme, () => 'light' as Theme)

/** 発表モード: 文字を大きくし、余計な部分を隠して、できれば全画面にする */
let present = false

export function setPresent(on: boolean) {
  present = on
  document.documentElement.toggleAttribute('data-present', on)
  if (on && !document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {})
  if (!on && document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
  emit()
}

if (typeof document !== 'undefined')
  document.addEventListener('fullscreenchange', () => {
    // Esc で全画面を抜けたら、発表モードも終える
    if (!document.fullscreenElement && present) setPresent(false)
  })

export const usePresent = () => useSyncExternalStore(subscribe, () => present, () => false)
