import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { readHash, useSyncHash } from '../lib/route'
import { MathText } from '../components/MathText'
import { Tex } from '../components/Tex'
import { FIELDS, THEOREMS, type FieldId, type Theorem } from '../lib/theorems'
import { FIGURES } from '../figures'
import { figStore } from '../figures/state'
import { FigScope } from '../figures/FigScope'
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
  // URL にある図の状態（#theorems?id=bayes&v.s=0.9）を、図を描く前に読み込む
  useState(() => {
    const p = readHash().params
    const vals: Record<string, string> = {}
    p.forEach((v, k) => {
      if (k.startsWith('v.')) vals[k.slice(2)] = v
    })
    figStore.load(p.get('id'), vals)
  })
  const hits = useMemo(() => THEOREMS.filter((t) => matches(t, q)), [q])
  const count = (f: FieldId) => hits.filter((t) => t.field === f).length
  useEffect(() => {
    const id = readHash().params.get('id')
    if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }, [])
  const groups = FIELDS.filter((f) => (field === 'all' || f.id === field) && count(f.id) > 0)

  return (
    <div className="layout theorems-layout">
      <HashSync q={q} field={field} />
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

/**
 * 検索語・分野と、最後に触った図の状態を URL に残す。
 * 図を動かすたびに定理の一覧ごと描き直さないよう、小さな部品に分けている。
 */
function HashSync({ q, field }: { q: string; field: FieldId | 'all' }) {
  const fig = useSyncExternalStore(figStore.subscribe, figStore.get)
  useSyncHash('theorems', {
    q: q || null,
    field: field === 'all' ? null : field,
    id: fig.id,
    ...Object.fromEntries(Object.entries(fig.vals).map(([k, v]) => [`v.${k}`, v])),
  })
  return null
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
          <FigScope id={t.id}>
            <Figure />
          </FigScope>
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
