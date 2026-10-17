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
await b.waitFor(`document.querySelector('path.curve')`)
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
for (const [i, expect] of [[0, ['#graph', 'a*(x - p)^2 + q']], [1, ['#structure', '(-b + sqrt']], [2, ['#steps', 'x^2 - 5x + 6 = 0']], [3, ['#geometry', null]], [4, ['#theorems', null]]]) {
  await b.goto(BASE + '#home')
  await b.evaluate(`document.querySelectorAll('.usecases .feature')[${i}].click()`)
  // 開いた先のタブの読み込みを待つ（式の入力欄か定理のカードが出るまで）
  await b.waitFor(`document.querySelector('.math-input input')?.value || document.querySelector('.theorem')`)
  const hash = decodeURIComponent(await b.evaluate('return location.hash'))
  const input = await b.evaluate(`return document.querySelector('.math-input input')?.value ?? ''`)
  const ok = hash.startsWith(expect[0]) && (expect[1] === null || input.startsWith(expect[1]))
  check(`使い方カード ${i + 1}`, ok, `${hash} / ${input}`)
}
// ベイズの計算表: スライダーで結果が変わる・行を押すと結果が切り替わる
await b.goto(BASE + '#theorems?id=bayes')
await b.waitFor(`document.querySelector('.bayes-row:not(.head):not(.foot)')`)
const res0 = await b.evaluate(`return document.querySelector('.bayes-result > strong').textContent`)
await b.evaluate(`
  const r = document.querySelector('.bayes-row:not(.head):not(.foot) input[type=range]')
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
  set.call(r, '0.8'); r.dispatchEvent(new Event('input', { bubbles: true }))
`)
await sleep(300)
const res1 = await b.evaluate(`return document.querySelector('.bayes-result > strong').textContent`)
check('ベイズ: スライダーで結果が変わる', res0 !== res1, `${res0} → ${res1}`)
await b.evaluate(`document.querySelectorAll('.bayes-row:not(.head):not(.foot)')[2].click()`)
await sleep(300)
const ask = await b.evaluate(`return document.querySelector('.bayes-ask').textContent`)
check('ベイズ: 行を押すと結果が切り替わる', ask.includes('工場3'), ask.slice(0, 20))
// トップの入力欄: 開いた直後は数式ライブラリを読まず、節が見えたら読み込んで使える
// （# 以降だけの移動ではページが読み直されないので、空のページを挟んで読み直す）
await b.goto('about:blank')
await b.goto(BASE + '#home')
await sleep(500)
const before0 = await b.evaluate(`return performance.getEntriesByType('resource').some((r) => /MathInput/.test(r.name))`)
await b.evaluate(`document.querySelector('.input-section').scrollIntoView(); return 1`)
await b.waitFor(`document.querySelector('.input-demo input')`)
await b.evaluate(`
  const i = document.querySelector('.input-demo input')
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
  set.call(i, 'sin 2x'); i.dispatchEvent(new Event('input', { bubbles: true }))
`)
await sleep(300)
const reread = await b.evaluate(`return document.querySelector('.input-demo .mi-note code')?.textContent`)
const href = decodeURIComponent(await b.evaluate(`return document.querySelector('.input-demo a.btn').getAttribute('href')`)).replace(/\+/g, ' ')
// LaTeX でも入れられる
const latexSrc = '\\frac{1}{x+1}'
await b.evaluate(`
  const i = document.querySelector('.input-demo input')
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
  set.call(i, ${JSON.stringify(latexSrc)}); i.dispatchEvent(new Event('input', { bubbles: true }))
`)
await sleep(300)
const latexErr = await b.evaluate(`return !!document.querySelector('.input-demo .mi-error')`)
const latexPreview = await b.evaluate(`return document.querySelector('.input-demo .mi-preview')?.textContent ?? ''`)
check('トップの入力欄: LaTeX（\\frac）も読める', !latexErr && latexPreview.includes('x+1'), latexPreview.slice(0, 30))
check('トップの入力欄: 後から読み込み、読み取りとリンクが出る', !before0 && reread === 'sin(2x)' && href.startsWith('#graph?f=sin 2x'), `初期に読込=${before0} / ${reread} / ${href}`)

// 式変形: 種類を切り替えて最後の手まで進む
await b.goto(BASE + '#steps')
await b.waitFor(`document.querySelector('.mode-chips')`)
await b.evaluate(`[...document.querySelectorAll('.mode-chips .chip')].find((c) => c.textContent === '因数分解').click()`)
await sleep(300)
const factorInput = await b.evaluate(`return document.querySelector('.math-input input').value`)
await b.evaluate(`document.querySelector('button[aria-label="最後へ"]').click()`)
await sleep(300)
const factorLast = await b.evaluate(`return document.querySelector('.hero-step').textContent`)
check('式変形: 因数分解に切り替えて最後まで進む', factorInput === 'x^2 - 5x + 6' && factorLast.includes('(x + m)(x + n)'), `${factorInput} / ${factorLast}`)
await b.goto(BASE + '#steps?mode=solve&f=' + encodeURIComponent('x^2 = 5x - 6'))
await b.waitFor(`document.querySelector('button[aria-label="最後へ"]')`)
await b.evaluate(`document.querySelector('button[aria-label="最後へ"]').click()`)
await sleep(300)
const solveLast = await b.evaluate(`return document.querySelector('.hero-tex').textContent`)
check('式変形: 方程式の解が出る', /x=2,\s*3/.test(solveLast.replace(/\s+/g, '')) || solveLast.includes('x=2,3'), solveLast.slice(0, 40))
await sleep(600)
check('式変形: 何手目かが URL に残る', /[?&]n=\d+/.test(await b.evaluate('return location.hash')), await b.evaluate('return location.hash'))

// 状態を URL に残す: スライダーを動かす → URL が変わる → 開き直すと同じ状態
await b.goto('about:blank')
await b.goto(BASE + '#graph?f=' + encodeURIComponent('a*(x - p)^2 + q'))
await b.waitFor(`document.querySelector('.slider input[type=range]')`)
check('開いただけでは URL を書き換えない', (await b.evaluate('return location.hash')) === '#graph?f=' + encodeURIComponent('a*(x - p)^2 + q'))
await b.evaluate(`
  const r = document.querySelectorAll('.slider input[type=range]')[1]
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
  set.call(r, '2'); r.dispatchEvent(new Event('input', { bubbles: true }))
`)
await b.waitFor(`location.hash.includes('p=2')`)
const shared = await b.evaluate('return location.href')
check('スライダーの値が URL に残る', shared.includes('p=2'), shared.split('#')[1])
const curve = await b.evaluate(`return document.querySelector('path.curve').getAttribute('d').slice(0, 120)`)
await b.goto('about:blank')
await b.goto(shared)
await b.waitFor(`document.querySelector('path.curve')`)
await sleep(300)
check('リンクを開くと同じ状態', (await b.evaluate(`return document.querySelector('path.curve').getAttribute('d').slice(0, 120)`)) === curve)
check('グラフに頂点の印と座標', await b.evaluate(`return [...document.querySelectorAll('.pt-label')].some(t => t.textContent === '頂点 (2, 1)')`), await b.evaluate(`return [...document.querySelectorAll('.pt-label')].map(t => t.textContent).join(' / ')`))
// グラフ: 円（x と y の関係式）・領域・極座標も描ける
await b.goto('about:blank')
await b.goto(BASE + '#graph?f=' + encodeURIComponent('x^2 + y^2 = 4') + '&f=' + encodeURIComponent('y > x^2') + '&f=' + encodeURIComponent('r = 1 + cos θ'))
await b.waitFor(`document.querySelectorAll('path.curve').length >= 3`)
const circle = await b.evaluate(`
  const p = document.querySelectorAll('path.curve')[0].getBBox()
  return [Math.round(p.width), Math.round(p.height), document.querySelectorAll('.mi-error').length]`)
check('グラフ: 円が円に見える・領域・極座標', Math.abs(circle[0] - circle[1]) <= 3 && circle[0] > 50 && circle[2] === 0, JSON.stringify(circle))
// グラフ: 動かした跡（残像と頂点の軌跡）
await b.goto('about:blank')
await b.goto(BASE + '#graph?f=' + encodeURIComponent('(x - p)^2 + q') + '&q=-1&p=-3&trail=1&play=p')
await b.waitFor(`document.querySelectorAll('.ghosts path').length >= 5 && document.querySelectorAll('.trail-pt').length >= 5`)
check('グラフ: 動かした跡が残る', true)
// 定理の図の状態も URL に残る
await b.goto('about:blank')
await b.goto(BASE + '#theorems?id=binomial-dist')
await b.waitFor(`document.querySelector('#binomial-dist .fig input[type=range]')`)
await b.evaluate(`
  const r = document.querySelector('#binomial-dist .fig input[type=range]')
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
  set.call(r, r.min); r.dispatchEvent(new Event('input', { bubbles: true }))
`)
await b.waitFor(`location.hash.includes('id=binomial-dist') && location.hash.includes('v.')`)
const figUrl = await b.evaluate('return location.href')
const figVal = await b.evaluate(`return document.querySelector('#binomial-dist .fig input[type=range]').value`)
await b.goto('about:blank')
await b.goto(figUrl)
await b.waitFor(`document.querySelector('#binomial-dist .fig input[type=range]')`)
check('定理の図の状態が URL に残る', (await b.evaluate(`return document.querySelector('#binomial-dist .fig input[type=range]').value`)) === figVal, figUrl.split('#')[1])
await b.goto('about:blank')
await b.goto(BASE + '#theorems?id=completing-square')
await b.waitFor(`document.querySelector('#completing-square .theorem-related a')`)
check('定理カードに「ひとことで」「動かしてみよう」', await b.evaluate(`return !!document.querySelector('#completing-square .theorem-gist') && document.querySelectorAll('#completing-square .theorem-try li').length > 0`))
await b.evaluate(`document.querySelector('#completing-square .theorem-related a').click()`)
await b.waitFor(`location.hash.includes('id=quadratic-formula')`)
await sleep(800)
check('つながる定理のページへ移る', await b.evaluate(`return !!document.getElementById('quadratic-formula') && document.title.startsWith('2次方程式の解の公式')`), await b.evaluate('return document.title'))
// 一覧 → 定理のページ → 戻ると、一覧の同じ位置に戻る
await b.goto('about:blank')
await b.goto(BASE + '#theorems')
await b.waitFor(`document.querySelectorAll('.theorem-item').length > 90`)
check('一覧には図を描かない', await b.evaluate(`return document.querySelectorAll('.fig').length === 0`))
await b.evaluate(`document.querySelectorAll('.theorem-item')[40].scrollIntoView({ block: 'center' })`)
await sleep(300)
const listY = await b.evaluate('return Math.round(scrollY)')
await b.evaluate(`document.querySelectorAll('.theorem-item')[40].click()`)
await b.waitFor(`document.querySelector('.theorem-page .fig')`)
check('一覧から定理のページを開く', await b.evaluate(`return location.hash.includes('id=') && !!document.querySelector('.crumbs')`), await b.evaluate('return location.hash'))
await b.evaluate('history.back()')
await b.waitFor(`document.querySelectorAll('.theorem-item').length > 90`)
await sleep(500)
const backY = await b.evaluate('return Math.round(scrollY)')
check('戻ると一覧の同じ位置', Math.abs(backY - listY) < 5, `${listY} → ${backY}`)
const themeBefore = await b.evaluate(`return getComputedStyle(document.body).backgroundColor`)
await b.evaluate(`document.querySelector('.icon-tool[aria-label]').click()`)
await sleep(300)
const themeAfter = await b.evaluate(`return getComputedStyle(document.body).backgroundColor`)
await b.evaluate(`document.querySelector('.icon-tool[aria-label]').click(); localStorage.removeItem('mathscope-theme'); delete document.documentElement.dataset.theme`)
check('配色を切り替えられる', themeBefore !== themeAfter, `${themeBefore} → ${themeAfter}`)
await b.evaluate(`document.querySelector('.icon-tool[aria-pressed]').click()`)
await sleep(300)
check('発表モード', await b.evaluate(`return document.documentElement.hasAttribute('data-present') && getComputedStyle(document.body).fontSize === '19px'`))
await b.evaluate(`document.querySelector('.icon-tool[aria-pressed]').click()`)
check('リンクをコピーのボタン', await b.evaluate(`return document.querySelector('.copy-link')?.textContent === 'リンクをコピー'`))
b.close()

// スマホ幅の定理集
const m = await launch(390, 800)
await m.goto(BASE + '#theorems')
await m.waitFor(`document.querySelector('.theorem-item')`)
const dir = await m.evaluate(`return getComputedStyle(document.querySelector('.field-list')).flexDirection`)
check('スマホの分野チップは横並び', dir === 'row', dir)
const top = await m.evaluate(`return Math.round(document.querySelector('.theorem-item').getBoundingClientRect().top)`)
check('スマホで最初の定理が 1 画面目付近', top < 700, `top=${top}px`)
m.close()

console.log(results.join('\n'))
if (results.some((r) => r.startsWith('FAIL'))) process.exit(1)
