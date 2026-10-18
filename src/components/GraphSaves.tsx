import { useEffect, useRef, useState } from 'react'
import { flushHash } from '../lib/route'
import { addSave, loadSaves, removeSave, renameSave, type Save } from '../lib/saves'

const fmtDate = (t: number) => {
  const d = new Date(t)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** グラフの「保存」と「保存した記録」。保存先はこのブラウザ */
export function GraphSaves({ suggest }: { suggest: string }) {
  const [list, setList] = useState<Save[]>(loadSaves)
  const [mode, setMode] = useState<'idle' | 'save' | 'list'>('idle')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 2000)
    return () => clearTimeout(t)
  }, [msg])
  // 一覧の外を押したら閉じる
  useEffect(() => {
    if (mode !== 'list') return
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setMode('idle')
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [mode])

  const save = () => {
    const n = name.trim()
    if (!n) return
    flushHash()
    const next = addSave(n, location.hash)
    if (!next) return setMsg('このブラウザでは保存できません')
    const over = list.some((s) => s.name === n)
    setList(next)
    setMode('idle')
    setMsg(over ? `「${n}」を上書きしました` : `「${n}」を保存しました`)
  }

  return (
    <div className="saves" ref={root}>
      <div className="saves-bar">
        <button
          className="chip"
          onClick={() => {
            setName(suggest)
            setMode(mode === 'save' ? 'idle' : 'save')
          }}
          aria-expanded={mode === 'save'}
        >
          名前をつけて保存
        </button>
        <button className="chip" onClick={() => setMode(mode === 'list' ? 'idle' : 'list')} aria-expanded={mode === 'list'} disabled={!list.length}>
          保存した記録{list.length ? `（${list.length}）` : ''}
        </button>
        {msg && (
          <span className="saves-msg" role="status">
            {msg}
          </span>
        )}
      </div>

      {mode === 'save' && (
        <form
          className="saves-form"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="名前（例: 放物線の平行移動）" maxLength={60} aria-label="記録の名前" />
          <button className="btn primary" type="submit" disabled={!name.trim()}>
            {list.some((s) => s.name === name.trim()) ? '上書き' : '保存'}
          </button>
        </form>
      )}

      {mode === 'list' && (
        <ul className="saves-list">
          {list.map((s) => (
            <li key={s.id}>
              {editing === s.id ? (
                <form
                  className="saves-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const v = (new FormData(e.currentTarget).get('n') as string).trim()
                    if (v) {
                      const next = renameSave(s.id, v)
                      if (next) setList(next)
                    }
                    setEditing(null)
                  }}
                >
                  <input name="n" autoFocus defaultValue={s.name} maxLength={60} aria-label="新しい名前" />
                  <button className="btn" type="submit">
                    決定
                  </button>
                </form>
              ) : (
                <>
                  <a
                    className="saves-open"
                    href={s.hash}
                    onClick={() => setMode('idle')}
                    title="この記録を開く"
                  >
                    <span className="saves-name">{s.name}</span>
                    <span className="saves-date">{fmtDate(s.savedAt)}</span>
                  </a>
                  <button className="icon-btn" onClick={() => setEditing(s.id)} title="名前を変える" aria-label={`「${s.name}」の名前を変える`}>
                    ✎
                  </button>
                  <button
                    className={`icon-btn ${confirm === s.id ? 'danger' : ''}`}
                    onClick={() => {
                      if (confirm !== s.id) return setConfirm(s.id)
                      const next = removeSave(s.id)
                      if (next) setList(next)
                      setConfirm(null)
                      if (next && !next.length) setMode('idle')
                    }}
                    onBlur={() => setConfirm(null)}
                    title={confirm === s.id ? 'もう一度押すと削除' : '削除'}
                    aria-label={confirm === s.id ? `もう一度押すと「${s.name}」を削除` : `「${s.name}」を削除`}
                  >
                    {confirm === s.id ? '削除？' : '×'}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
