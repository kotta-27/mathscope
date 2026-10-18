import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { flushHash, hrefTo, readHash, useSyncHash } from '../lib/route'
import { COURSES, TOPICS, type Course } from '../lib/courses'
import { GUIDE } from '../lib/guide'
import { PROOFS } from '../lib/proofs'
import { matches, norm } from '../lib/search'
import { track } from '../lib/analytics'
import { MathText } from '../components/MathText'
import { Tex } from '../components/Tex'
import { FIELDS, THEOREMS, type FieldId, type Theorem } from '../lib/theorems'
import { FIGURES } from '../figures'
import { figStore } from '../figures/state'
import { FigScope } from '../figures/FigScope'
import { ErrorBoundary } from '../components/ErrorBoundary'

/** 科目の並び（学ぶ順） */
const COURSE_LIST: Course[] = ['中学', '数I', '数A', '数II', '数B', '数III', '数C', '大学']

/** 一覧のスクロール位置（定理のページから戻ったときに元の位置へ戻す） */
let listScroll: { hash: string; y: number } | null = null

export function TheoremsTab() {
  const id = readHash().params.get('id')
  const t = id ? THEOREMS.find((x) => x.id === id) : undefined
  return t ? <TheoremPage t={t} /> : <TheoremList />
}

/** 定理の一覧: 分野ごとに、名前・単元・ひとことだけを並べる */
function TheoremList() {
  const [field, setField] = useState<FieldId | 'all'>(() => {
    const f = readHash().params.get('field')
    return FIELDS.find((x) => x.id === f)?.id ?? 'all'
  })
  const [q, setQ] = useState(() => readHash().params.get('q') ?? '')
  const [course, setCourse] = useState<Course | 'all'>(() => {
    const c = readHash().params.get('course')
    return COURSE_LIST.find((x) => x === c) ?? 'all'
  })
  const hits = useMemo(() => THEOREMS.filter((t) => matches(t, q) && (course === 'all' || COURSES[t.id]?.course === course)), [q, course])
  const count = (f: FieldId) => hits.filter((t) => t.field === f).length
  const groups = FIELDS.filter((f) => (field === 'all' || f.id === field) && count(f.id) > 0)
  useSyncHash('theorems', { q: q || null, field: field === 'all' ? null : field, course: course === 'all' ? null : course })
  // 定理のページから「戻る」で来たら、前のスクロール位置へ
  useEffect(() => {
    if (listScroll && listScroll.hash === location.hash) window.scrollTo(0, listScroll.y)
    listScroll = null
  }, [])
  const remember = () => {
    flushHash()
    listScroll = { hash: location.hash, y: window.scrollY }
  }

  return (
    <div className="layout theorems-layout">
      <aside className="panel sticky theorems-side">
        <h2>検索</h2>
        <input className="wide" placeholder="定理名・単元名・英語で検索" value={q} onChange={(e) => setQ(e.target.value)} />
        <h2>科目</h2>
        <div className="chips course-chips">
          {(['all', ...COURSE_LIST] as const).map((c) => {
            const n = c === 'all' ? THEOREMS.filter((t) => matches(t, q)).length : THEOREMS.filter((t) => matches(t, q) && COURSES[t.id]?.course === c).length
            return (
              <button key={c} className={`chip ${course === c ? 'on' : ''}`} onClick={() => setCourse(c)} disabled={!n}>
                {c === 'all' ? 'すべて' : c}
              </button>
            )
          })}
        </div>
        <h2>分野</h2>
        <nav className="field-list">
          <button className={`field-item ${field === 'all' ? 'on' : ''}`} onClick={() => setField('all')}>
            すべて <span className="count">{hits.length}</span>
          </button>
          {FIELDS.map((f) => (
            <button
              key={f.id}
              className={`field-item ${field === f.id ? 'on' : ''}`}
              onClick={() => setField(f.id)}
              disabled={!count(f.id)}
            >
              {f.label} <span className="count">{count(f.id)}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="theorems">
        {groups.length === 0 && <NoHits q={q} clear={() => setQ('')} />}
        {groups.map((f) => (
          <div key={f.id} className="field-group">
            <h2 className="field-title">{f.label}</h2>
            <div className="theorem-grid">
              {hits
                .filter((t) => t.field === f.id)
                .map((t) => {
                  const c = COURSES[t.id]
                  return (
                    <a key={t.id} className="theorem-item" href={hrefTo('theorems', { id: t.id })} onClick={remember}>
                      <span className="theorem-item-head">
                        <span className="theorem-item-name">{t.name}</span>
                        {c && <span className="course">{c.course}</span>}
                      </span>
                      {GUIDE[t.id] && (
                        <span className="theorem-item-gist">
                          <MathText text={GUIDE[t.id].gist} />
                        </span>
                      )}
                    </a>
                  )
                })}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

/** 1 つの定理のページ。上に分野への道、下に同じ分野の前後の定理 */
function TheoremPage({ t }: { t: Theorem }) {
  const f = FIELDS.find((x) => x.id === t.field)!
  const same = THEOREMS.filter((x) => x.field === t.field)
  const k = same.indexOf(t)
  const prev = same[k - 1]
  const next = same[k + 1]
  // URL にある図の状態（#theorems?id=bayes&v.s=0.9）を、図を描く前に読み込む
  useState(() => {
    const vals: Record<string, string> = {}
    readHash().params.forEach((v, key) => {
      if (key.startsWith('v.')) vals[key.slice(2)] = v
    })
    figStore.load(t.id, vals)
  })
  useEffect(() => {
    document.title = `${t.name} | Mathscope`
  }, [t])
  return (
    <div className="theorem-page">
      <HashSync id={t.id} />
      <nav className="crumbs" aria-label="現在地">
        <a href={hrefTo('theorems')}>定理集</a>
        <span aria-hidden>›</span>
        <a href={hrefTo('theorems', { field: f.id })}>{f.label}</a>
        <span aria-hidden>›</span>
        <span>{t.name}</span>
      </nav>
      <TheoremCard t={t} />
      <nav className="theorem-pager" aria-label="同じ分野の定理">
        {prev ? (
          <a className="prev" href={hrefTo('theorems', { id: prev.id })}>
            <span>← 前の定理</span>
            <strong>{prev.name}</strong>
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a className="next" href={hrefTo('theorems', { id: next.id })}>
            <span>次の定理 →</span>
            <strong>{next.name}</strong>
          </a>
        ) : (
          <span />
        )}
      </nav>
    </div>
  )
}

/**
 * 定理のページの URL に、図の状態を残す（#theorems?id=bayes&v.s=0.9）。
 * 図を動かすたびにページ全体を描き直さないよう、小さな部品に分けている。
 */
function HashSync({ id }: { id: string }) {
  const fig = useSyncExternalStore(figStore.subscribe, figStore.get)
  useSyncHash('theorems', {
    id,
    ...(fig.id === id ? Object.fromEntries(Object.entries(fig.vals).map(([k, v]) => [`v.${k}`, v])) : {}),
  })
  return null
}

/** 見つからなかったときに、ほかのタブで扱っている話題やグラフへ案内する */
function NoHits({ q, clear }: { q: string; clear: () => void }) {
  const n = norm(q)
  // 打ち終わってから 1.5 秒たっても 0 件なら、見つからなかった言葉として数える
  useEffect(() => {
    if (n.length < 2) return
    const t = setTimeout(() => track(`search-none/${n}`, true), 1500)
    return () => clearTimeout(t)
  }, [n])
  const topics = TOPICS.filter((x) => x.words.some((w) => n.includes(norm(w)) || (n.length >= 2 && norm(w).includes(n))))
  // x を含む式のように見えるなら、グラフで描けるようにする
  const formula = /x/i.test(q) && /[0-9+\-*/^²³√()=]/.test(q) && !/[ぁ-んァ-ン一-龥]/.test(q)
  return (
    <div className="no-hits">
      <p>「{q}」に当てはまる定理は見つからなかった。</p>
      {(topics.length > 0 || formula) && (
        <ul className="no-hits-links">
          {formula && (
            <li>
              <a href={hrefTo('graph', { f: q.replace(/^\s*y\s*=/, '') })}>グラフで y = {q.replace(/^\s*y\s*=/, '')} を描く →</a>
            </li>
          )}
          {topics.map((x) => (
            <li key={x.href}>
              <a href={x.href}>{x.label} →</a>
            </li>
          ))}
        </ul>
      )}
      <p className="hint">
        定理名（例: 加法定理）・単元名（例: 数列、図形と計量）・英語（例: eigenvalue）でも探せる。{' '}
        <button className="link-btn" onClick={clear}>
          検索をやめてすべて表示
        </button>
      </p>
    </div>
  )
}

function TheoremCard({ t }: { t: Theorem }) {
  const c = COURSES[t.id]
  const g = GUIDE[t.id]
  const Figure = FIGURES[t.id]
  return (
    <article className="theorem" id={t.id}>
      <header className="theorem-head">
        <h3>{t.name}</h3>
        {t.aka && <span className="aka">{t.aka}</span>}
        {c && (
          <span className="course" title={c.en}>
            {c.course}・{c.unit}
          </span>
        )}
        <a className="permalink" href={`#theorems?id=${t.id}`} title="この定理へのリンク">#</a>
      </header>
      {g && (
        <p className="theorem-gist">
          <MathText text={g.gist} />
        </p>
      )}
      <div className="theorem-statement">
        <Tex block tex={t.statement} />
      </div>
      {Figure && (
        <ErrorBoundary label="この図">
          <FigScope id={t.id}>
            <Figure />
          </FigScope>
        </ErrorBoundary>
      )}
      {g && g.try.length > 0 && (
        <div className="theorem-try">
          <span className="tag">動かしてみよう</span>
          <ul>
            {g.try.map((x, i) => (
              <li key={i}>
                <MathText text={x} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {PROOFS[t.id] && (
        <details className="theorem-why">
          <summary>
            <span className="tag">なぜ成り立つか</span>
            <span className="why-hint">証明の筋を見る</span>
          </summary>
          <p>
            <MathText text={PROOFS[t.id]} />
          </p>
        </details>
      )}
      {t.conditions && (
        <p className="theorem-cond">
          <span className="tag">条件</span>
          <MathText text={t.conditions} />
        </p>
      )}
      <div className="theorem-usage">
        <span className="tag">使いどころ</span>
        <ul>
          {t.usage.map((u, i) => (
            <li key={i}>
              <MathText text={u} />
            </li>
          ))}
        </ul>
      </div>
      {t.example && (
        <details className="theorem-example">
          <summary>
            <span className="tag">例</span>
            <MathText text={t.example.q} />
          </summary>
          <p>
            <MathText text={t.example.a} />
          </p>
        </details>
      )}
      {t.links && (
        <div className="theorem-links">
          {t.links.map((l) => (
            <a key={l.href} className="chip" href={l.href}>
              {l.label} →
            </a>
          ))}
        </div>
      )}
      {g && g.related.length > 0 && (
        <nav className="theorem-related" aria-label="つながる定理">
          <span className="tag">つながる定理</span>
          {g.related.map((id) => {
            const r = THEOREMS.find((x) => x.id === id)
            return r ? (
              <a key={id} href={hrefTo('theorems', { id })}>
                {r.name}
              </a>
            ) : null
          })}
        </nav>
      )}
    </article>
  )
}
