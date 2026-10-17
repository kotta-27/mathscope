import { useEffect, useMemo, useState } from 'react'
import { readHash, useSyncHash } from '../lib/route'
import { MathText } from '../components/MathText'
import { Tex } from '../components/Tex'
import { FIELDS, THEOREMS, type FieldId, type Theorem } from '../lib/theorems'
import { FIGURES } from '../figures'
import { ErrorBoundary } from '../components/ErrorBoundary'

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '')

function matches(t: Theorem, q: string) {
  if (!q) return true
  const hay = norm([t.id, t.name, t.aka ?? '', t.conditions ?? '', ...t.usage].join(' '))
  return hay.includes(norm(q))
}

export function TheoremsTab() {
  const [field, setField] = useState<FieldId | 'all'>(() => {
    const f = readHash().params.get('field')
    return FIELDS.find((x) => x.id === f)?.id ?? 'all'
  })
  const [q, setQ] = useState(() => readHash().params.get('q') ?? '')
  const hits = useMemo(() => THEOREMS.filter((t) => matches(t, q)), [q])
  // 検索語と分野を URL に残す
  useSyncHash('theorems', { q: q || null, field: field === 'all' ? null : field })
  const count = (f: FieldId) => hits.filter((t) => t.field === f).length
  useEffect(() => {
    const id = readHash().params.get('id')
    if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }, [])
  const groups = FIELDS.filter((f) => (field === 'all' || f.id === field) && count(f.id) > 0)

  return (
    <div className="layout theorems-layout">
      <aside className="panel sticky theorems-side">
        <h2>検索</h2>
        <input className="wide" placeholder="定理名・用途で検索" value={q} onChange={(e) => setQ(e.target.value)} />
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
        {groups.length === 0 && <p className="hint">該当する定理がない。</p>}
        {groups.map((f) => (
          <div key={f.id} className="field-group">
            <h2 className="field-title">{f.label}</h2>
            {hits
              .filter((t) => t.field === f.id)
              .map((t) => (
                <TheoremCard key={t.id} t={t} />
              ))}
          </div>
        ))}
      </section>
    </div>
  )
}

function TheoremCard({ t }: { t: Theorem }) {
  const Figure = FIGURES[t.id]
  return (
    <article className="theorem" id={t.id}>
      <header className="theorem-head">
        <h3>{t.name}</h3>
        {t.aka && <span className="aka">{t.aka}</span>}
        <a className="permalink" href={`#theorems?id=${t.id}`} title="この定理へのリンク">#</a>
      </header>
      <div className="theorem-statement">
        <Tex block tex={t.statement} />
      </div>
      {Figure && (
        <ErrorBoundary label="この図">
          <Figure />
        </ErrorBoundary>
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
    </article>
  )
}
