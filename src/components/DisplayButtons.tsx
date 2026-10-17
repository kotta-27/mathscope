import { setPresent, setTheme, usePresent, useTheme } from '../lib/display'

const icon = { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

/** 明るい／暗いの切り替え */
export function ThemeButton() {
  const t = useTheme()
  const next = t === 'dark' ? 'light' : 'dark'
  return (
    <button className="icon-tool" onClick={() => setTheme(next)} title={next === 'light' ? '明るい表示にする' : '暗い表示にする'} aria-label={next === 'light' ? '明るい表示にする' : '暗い表示にする'}>
      {t === 'dark' ? (
        <svg {...icon}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg {...icon}>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  )
}

/** 発表モードの切り替え */
export function PresentButton() {
  const on = usePresent()
  return (
    <button className={`icon-tool ${on ? 'on' : ''}`} onClick={() => setPresent(!on)} title={on ? '発表モードを終える（Esc）' : '発表モード（文字を大きくして全画面）'} aria-pressed={on}>
      <svg {...icon}>
        <rect x="3" y="4" width="18" height="12" rx="1.5" />
        <path d="M12 16v4M8 20h8" />
      </svg>
      <span>{on ? '終える' : '発表'}</span>
    </button>
  )
}
