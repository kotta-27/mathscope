/**
 * 教科書の書き方・全角文字などを mathjs が読める式に直す。
 *
 * - 全角英数記号 → 半角（ｘ＋１ → x+1）
 * - × ÷ − ・ π ∞ ** → * / - * pi Infinity ^
 * - 上付き文字 x² x⁻¹ → x^2 x^(-1)
 * - √x √(x+1) ∛x → sqrt(x) sqrt(x+1) cbrt(x)
 * - |x| → abs(x)
 * - 括弧なしの関数 sinx sin 2x sin²x ln x → sin(x) sin(2x) sin(x)^2 log(x)
 * - 複数文字の変数は 1 文字ずつの積（ax → a*x）。pi・theta などの名前と関数名は除く
 * - 先頭の「y =」「f(x) =」は取り除く
 */

/** 長いものから順に照合する */
const FUNCS = [
  'asinh', 'acosh', 'atanh', 'sinh', 'cosh', 'tanh', 'asin', 'acos', 'atan', 'sqrt', 'cbrt',
  'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'exp', 'log', 'abs', 'ln',
]
const NAMES = [
  'Infinity', 'epsilon', 'lambda', 'alpha', 'gamma', 'delta', 'theta', 'sigma', 'omega',
  'beta', 'zeta', 'kappa', 'phi', 'psi', 'rho', 'tau', 'eta', 'chi', 'pi', 'mu', 'nu', 'xi',
]
const RENAME: Record<string, string> = { ln: 'log' }

const SUP: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  '⁻': '-', '⁺': '+', 'ⁿ': 'n', 'ˣ': 'x', 'ʸ': 'y', '⁽': '(', '⁾': ')',
}

const CHARS: [RegExp, string][] = [
  [/\*\*/g, '^'],
  [/[×✕]/g, '*'],
  [/[·・⋅∙•]/g, '*'],
  [/÷/g, '/'],
  [/[−–—‐]/g, '-'],
  [/π/g, 'pi'],
  [/∞/g, 'Infinity'],
]

const isLetter = (c: string) => /[A-Za-zͰ-Ͽ]/.test(c)
const isDigit = (c: string) => /[0-9.]/.test(c)

function superscripts(s: string) {
  return s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ⁿˣʸ⁽⁾]+/g, (m) => {
    const t = [...m].map((c) => SUP[c]).join('')
    return /^\d+$/.test(t) || /^[a-z]$/.test(t) ? `^${t} ` : `^(${t}) `
  })
}

/** |x| → abs(x)。左から順に開き・閉じを交互に割り当てる */
function bars(s: string) {
  let open = false
  return s.replace(/\|/g, () => {
    open = !open
    return open ? 'abs(' : ')'
  })
}

/** 英字の並びを、関数名・既知の名前・1 文字の変数に分ける */
function splitWord(w: string): { t: string; fn: boolean }[] {
  const out: { t: string; fn: boolean }[] = []
  let i = 0
  while (i < w.length) {
    const rest = w.slice(i)
    const f = FUNCS.find((x) => rest.startsWith(x))
    const n = NAMES.find((x) => rest.startsWith(x))
    // 関数名と名前が重なるとき（例: "pi" と "p"）は長い方
    if (f && (!n || f.length >= n.length)) {
      out.push({ t: RENAME[f] ?? f, fn: true })
      i += f.length
    } else if (n) {
      out.push({ t: n, fn: false })
      i += n.length
    } else {
      out.push({ t: w[i], fn: false })
      i += 1
    }
  }
  return out
}

function words(s: string): string {
  let out = ''
  let i = 0

  const skipSpaces = () => {
    while (s[i] === ' ') i++
  }
  /** 関数の引数になる「数 + 文字」のかたまりを読む（例: 2x, 3, x, theta） */
  const readAtom = (): string => {
    const start = i
    while (i < s.length && isDigit(s[i])) i++
    const num = s.slice(start, i)
    const ws = i
    while (i < s.length && isLetter(s[i])) i++
    const word = s.slice(ws, i)
    if (!word) return num
    const parts = splitWord(word)
    if (parts.some((p) => p.fn)) {
      // 引数の中にさらに関数がある場合は諦めて元に戻す
      i = ws
      return num
    }
    return num + parts.map((p) => p.t).join('*')
  }
  /** 関数 f を処理する。続く部分 rest（同じ単語内の残り）があればそれが引数 */
  const applyFn = (f: string, rest: { t: string; fn: boolean }[]) => {
    if (rest.length) {
      const k = rest.findIndex((p) => p.fn)
      const argParts = k < 0 ? rest : rest.slice(0, k)
      out += `${f}(${argParts.map((p) => p.t).join('*')})`
      if (k >= 0) emitParts(rest.slice(k))
      return
    }
    const save = i
    skipSpaces()
    if (s[i] === '(') {
      out += f
      return
    }
    // sin^2 x → sin(x)^2
    let pow = ''
    const m = /^\^\s*(\(?-?[0-9]+\)?)\s*/.exec(s.slice(i))
    if (m) {
      pow = m[1]
      i += m[0].length
      if (s[i] === '(') {
        // sin^2(x) → sin(x)^2
        let depth = 0
        const st = i
        for (; i < s.length; i++) {
          if (s[i] === '(') depth++
          if (s[i] === ')' && --depth === 0) break
        }
        out += `${f}${s.slice(st, i + 1)}^${pow}`
        i++
        return
      }
    }
    const arg = readAtom()
    if (!arg) {
      i = save
      out += f
      return
    }
    out += `${f}(${arg})${pow ? `^${pow}` : ''}`
  }
  const emitParts = (parts: { t: string; fn: boolean }[]) => {
    for (let k = 0; k < parts.length; k++) {
      const p = parts[k]
      if (p.fn) {
        if (k > 0) out += '*'
        applyFn(p.t, parts.slice(k + 1))
        return
      }
      if (k > 0) out += '*'
      out += p.t
    }
  }

  while (i < s.length) {
    const c = s[i]
    if (c === '√' || c === '∛') {
      const f = c === '√' ? 'sqrt' : 'cbrt'
      i++
      skipSpaces()
      if (s[i] === '(') {
        out += f
      } else {
        const arg = readAtom()
        out += arg ? `${f}(${arg})` : f
      }
      continue
    }
    if (isLetter(c)) {
      const st = i
      while (i < s.length && (isLetter(s[i]) || s[i] === '_')) i++
      const w = s.slice(st, i)
      const parts = splitWord(w)
      const hasFn = parts.some((p) => p.fn)
      const next = s.slice(i).trimStart()[0] ?? ''
      // そのまま残すもの: x_1 のような添字つきの名前、数字が続く名前（x2）、
      // 括弧が続く未知の関数名（floor(x), max(a, b)）
      if (
        w.includes('_') ||
        (!hasFn && /[0-9]/.test(s[i] ?? '')) ||
        (w.length > 1 && next === '(' && !(hasFn && parts.length === 1) && !parts[parts.length - 1].fn && !NAMES.includes(w))
      ) {
        out += w
        continue
      }
      emitParts(parts)
      continue
    }
    out += c
    i++
  }
  return out
}

/* ---------- LaTeX ---------- */

const GREEK = [
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'varepsilon', 'zeta', 'eta', 'theta', 'vartheta',
  'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'sigma', 'tau', 'phi', 'varphi', 'chi', 'psi', 'omega',
]
const LATEX_FUNCS: Record<string, string> = {
  arcsin: 'asin', arccos: 'acos', arctan: 'atan', sinh: 'sinh', cosh: 'cosh', tanh: 'tanh',
  sin: 'sin', cos: 'cos', tan: 'tan', sec: 'sec', csc: 'csc', cot: 'cot', log: 'log', ln: 'log', exp: 'exp',
}
const LATEX_SPACES = [',', ';', ':', '!', ' ', 'quad', 'qquad']
const LATEX_STYLES = ['mathrm', 'mathit', 'mathbf', 'operatorname', 'text', 'textrm']
const LATEX_DROP = ['left', 'right', 'big', 'Big', 'bigg', 'Bigg', 'displaystyle']

/** s[i] から始まる引数を取り出す。{…} なら中身、そうでなければ 1 文字（\frac12 など）。[中身, 次の位置] */
function group(s: string, i: number): [string, number] {
  while (s[i] === ' ') i++
  if (s[i] !== '{') return [s[i] ?? '', i + 1]
  let depth = 0
  for (let j = i; j < s.length; j++) {
    if (s[j] === '{') depth++
    else if (s[j] === '}' && --depth === 0) return [s.slice(i + 1, j), j + 1]
  }
  return [s.slice(i + 1), s.length]
}

/** LaTeX の書き方（\frac{1}{x}、\sqrt{x}、x^{2}、\sin x など）を mathjs が読める形にする */
function latex(s: string): string {
  if (!s.includes('\\') && !s.includes('{')) return s
  let out = ''
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === '\\') {
      const m = /^\\([A-Za-z]+|.)/.exec(s.slice(i))
      if (!m) {
        i++
        continue
      }
      const cmd = m[1]
      i += m[0].length
      if (cmd === 'frac' || cmd === 'dfrac' || cmd === 'tfrac') {
        const [a, j] = group(s, i)
        const [b, k] = group(s, j)
        i = k
        // 1 語（1、x、2a など）の分子・分母には括弧を付けない
        const w = (x: string) => (/^\s*[A-Za-z0-9.]+\s*$/.test(x) ? x.trim() : `(${x})`)
        out += `(${w(latex(a))}/${w(latex(b))})`
      } else if (cmd === 'sqrt') {
        while (s[i] === ' ') i++
        if (s[i] === '[') {
          const e = s.indexOf(']', i)
          const n = s.slice(i + 1, e < 0 ? s.length : e)
          const [a, j] = group(s, e < 0 ? s.length : e + 1)
          i = j
          out += `nthRoot(${latex(a)}, ${latex(n)})`
        } else {
          const [a, j] = group(s, i)
          i = j
          out += `sqrt(${latex(a)})`
        }
      } else if (cmd === 'cdot' || cmd === 'times' || cmd === 'ast') out += '*'
      else if (cmd === 'div') out += '/'
      else if (cmd === 'infty') out += 'Infinity'
      else if (cmd === '{') out += '('
      else if (cmd === '}') out += ')'
      else if (LATEX_SPACES.includes(cmd)) out += ' '
      else if (LATEX_DROP.includes(cmd)) {
        // \left. のような見えない区切りも消す
        if (s[i] === '.') i++
      } else if (LATEX_STYLES.includes(cmd)) {
        const [a, j] = group(s, i)
        i = j
        out += ` ${a} `
      } else if (GREEK.includes(cmd)) out += ` ${cmd.replace(/^var/, '')} `
      else if (LATEX_FUNCS[cmd]) out += ` ${LATEX_FUNCS[cmd]} `
      else out += cmd
    } else if (c === '_' && s[i + 1] === '{') {
      // 添字 x_{1} → x_1
      const [a, j] = group(s, i + 1)
      i = j
      out += `_${a.replace(/[^A-Za-z0-9]/g, '')}`
    } else if (c === '{') {
      out += '('
      i++
    } else if (c === '}') {
      out += ')'
      i++
    } else {
      out += c
      i++
    }
  }
  return out
}

export function normalizeExpr(src: string): string {
  let s = superscripts(src)
  s = s.normalize('NFKC')
  for (const [re, to] of CHARS) s = s.replace(re, to)
  s = latex(s)
  s = s.replace(/^\s*(?:y|f\s*\(\s*x\s*\))\s*=/, '')
  s = bars(s)
  s = words(s)
  return s.replace(/\s+/g, ' ').trim()
}
