import { launch, sleep } from './cdp.mjs'
// 開発サーバー（npm run dev）を起動してから実行する
const BASE = process.env.E2E_BASE ?? 'http://localhost:5173/mathscope/'
const results = []
const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`)

const b = await launch()
await b.goto(BASE + '#home')
check('ホームのタイトル', (await b.evaluate('return document.title')) === 'Mathscope | 数式が、景色になる。', await b.evaluate('return document.title'))

// タブを押す → URL・タイトル・aria-current
await b.evaluate(`[...document.querySelectorAll('.tab')].find(t => t.textContent === 'グラフ').click()`)
await sleep(1500)
check('タブでハッシュが変わる', (await b.evaluate('return location.hash')) === '#graph')
check('タブでタイトルが変わる', (await b.evaluate('return document.title')) === 'グラフ | Mathscope')
check('aria-current', (await b.evaluate(`return document.querySelector('.tab[aria-current=page]')?.textContent`)) === 'グラフ')
await b.evaluate(`[...document.querySelectorAll('.tab')].find(t => t.textContent === '定理').click()`)
await sleep(1500)
await b.evaluate('history.back()')
await sleep(1500)
check('戻るで前のタブへ', (await b.evaluate('return location.hash')) === '#graph' && (await b.evaluate(`return document.querySelector('.tab.on')?.textContent`)) === 'グラフ')
await b.evaluate('history.back()')
await sleep(1500)
check('さらに戻るとホーム', (await b.evaluate('return !!document.querySelector(".hero-title")')))

// スライダーで曲線が変わる
await b.goto(BASE + '#graph')
const before = await b.evaluate(`return document.querySelector('path.curve').getAttribute('d').slice(0, 200)`)
await b.evaluate(`
  const r = document.querySelector('.slider input[type=range]')
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
  set.call(r, '3'); r.dispatchEvent(new Event('input', { bubbles: true }))
`)
await sleep(500)
const after = await b.evaluate(`return document.querySelector('path.curve').getAttribute('d').slice(0, 200)`)
check('スライダーで曲線が変わる', before !== after)

// 入力欄の正規化
await b.evaluate(`
  const i = document.querySelector('.math-input input')
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
  set.call(i, 'ｘ²＋1'); i.dispatchEvent(new Event('input', { bubbles: true }))
`)
await sleep(500)
check('全角入力の読み取り', (await b.evaluate(`return document.querySelector('.mi-note code')?.textContent`)) === 'x^2 +1', await b.evaluate(`return document.querySelector('.mi-note code')?.textContent`))

// ホームの使い方カード
for (const [i, expect] of [[0, ['#graph', 'a*(x - p)^2 + q']], [1, ['#structure', '(-b + sqrt']], [2, ['#steps', '(a+b)^2']], [3, ['#geometry', null]], [4, ['#theorems', null]]]) {
  await b.goto(BASE + '#home')
  await b.evaluate(`document.querySelectorAll('.usecases .feature')[${i}].click()`)
  await sleep(2000)
  const hash = decodeURIComponent(await b.evaluate('return location.hash'))
  const input = await b.evaluate(`return document.querySelector('.math-input input')?.value ?? ''`)
  const ok = hash.startsWith(expect[0]) && (expect[1] === null || input.startsWith(expect[1]))
  check(`使い方カード ${i + 1}`, ok, `${hash} / ${input}`)
}
b.close()

// スマホ幅の定理集
const m = await launch(390, 800)
await m.goto(BASE + '#theorems')
const dir = await m.evaluate(`return getComputedStyle(document.querySelector('.field-list')).flexDirection`)
check('スマホの分野チップは横並び', dir === 'row', dir)
const top = await m.evaluate(`return Math.round(document.querySelector('.theorem').getBoundingClientRect().top)`)
check('スマホで最初の定理が 1 画面目付近', top < 700, `top=${top}px`)
m.close()

console.log(results.join('\n'))
if (results.some((r) => r.startsWith('FAIL'))) process.exit(1)
