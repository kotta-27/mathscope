// 最小限の CDP クライアント。Chrome をヘッドレスで起動して、ページ内で JS を実行する
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export async function launch(width = 1280, height = 900) {
  const dir = mkdtempSync(join(tmpdir(), 'cdp-'))
  const port = 9300 + Math.floor(Math.random() * 500)
  const proc = spawn(process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, `--window-size=${width},${height}`, 'about:blank',
  ], { stdio: 'ignore' })
  let ws
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
      const page = list.find((t) => t.type === 'page')
      if (page) { ws = new WebSocket(page.webSocketDebuggerUrl); break }
    } catch {}
    await new Promise((r) => setTimeout(r, 200))
  }
  await new Promise((r) => ws.addEventListener('open', r, { once: true }))
  let id = 0
  const pending = new Map()
  /** Chrome から届くイベント（Page.loadEventFired など）を待つ人たち */
  const waiters = new Set()
  ws.addEventListener('message', (m) => {
    const msg = JSON.parse(m.data)
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id) }
    if (msg.method) for (const w of waiters) w(msg.method)
  })
  /** 返事が来ないまま固まらないよう、30 秒で諦めてエラーの返事として扱う */
  const send = (method, params = {}) => new Promise((res) => {
    const i = ++id
    const timer = setTimeout(() => { pending.delete(i); res({ id: i, error: { message: `timeout: ${method}` } }) }, 30000)
    pending.set(i, (msg) => { clearTimeout(timer); res(msg) })
    ws.send(JSON.stringify({ id: i, method, params }))
  })
  /** いずれかのイベントが来るまで待つ（来なければ timeout ミリ秒で先へ進む） */
  const waitEvent = (names, timeout) => new Promise((res) => {
    const done = (ok) => { waiters.delete(w); clearTimeout(timer); res(ok) }
    const w = (name) => names.includes(name) && done(true)
    const timer = setTimeout(() => done(false), timeout)
    waiters.add(w)
  })
  await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 })
  const evaluate = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true })
    if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails))
    return r.result?.result?.value
  }
  /**
   * 読み込み（load イベント）が終わるまで待つ。終わる前に location.hash を変えると、Chrome は
   * ユーザー操作によらない移動を履歴に積まずに置き換えるため、「戻る」の確認が不安定になる。
   * ハッシュだけが変わる移動では load は来ないので、navigatedWithinDocument でも先へ進む
   */
  const goto = async (url) => {
    const loaded = waitEvent(['Page.loadEventFired', 'Page.navigatedWithinDocument'], 20000)
    await send('Page.navigate', { url })
    await loaded
    await sleep(1200)
  }
  /** 式 expr が真になるまで待つ（タブの遅延読み込みなど）。最大 timeout ミリ秒 */
  const waitFor = async (expr, timeout = 8000) => {
    for (let t = 0; t < timeout; t += 200) {
      if (await evaluate(`return !!(${expr})`)) return true
      await sleep(200)
    }
    return false
  }
  const close = () => { ws.close(); proc.kill() }
  return { send, evaluate, goto, waitFor, close }
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
