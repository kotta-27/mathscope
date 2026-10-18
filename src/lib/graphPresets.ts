/**
 * グラフタブの例。教科書の単元ごとに並べる。
 * rows の各行は式の文字列か、導関数・面積などの表示つきの指定。
 * params はパラメータの初めの値、play は開いたときに自動で動かすパラメータ、trail は動かした跡を残すか。
 */
export type PresetRow = string | { src: string; deriv?: boolean; area?: [number, number] }
export type Preset = { label: string; rows: PresetRow[]; params?: Record<string, number>; play?: string; trail?: boolean }

export const PRESET_GROUPS: { unit: string; items: Preset[] }[] = [
  {
    unit: '数I 2次関数',
    items: [
      { label: '頂点の移動（平行移動）', rows: ['a*(x - p)^2 + q'], params: { a: 1, p: -2, q: -1 }, play: 'p', trail: true },
      { label: '一般形 ax²+bx+c', rows: ['a*x^2 + b*x + c'], params: { a: 1, b: -2, c: -3 } },
      { label: '2次不等式', rows: ['x^2 - x - 2', 'y < 0'] },
    ],
  },
  {
    unit: '数II 三角関数',
    items: [
      { label: '振幅・周期・位相', rows: ['a*sin(b*(x - c))'], params: { a: 1.5, b: 2, c: 0 } },
      { label: '合成', rows: ['a*sin(x) + b*cos(x)', 'sqrt(a^2 + b^2)*sin(x + atan2(b, a))'], params: { a: 1, b: 1.7 } },
      { label: '単位円と直線', rows: ['x^2 + y^2 = 1', 'y = tan(t)*x'], params: { t: 0.8 }, play: 't' },
    ],
  },
  {
    unit: '数II 指数・対数',
    items: [
      { label: '指数と対数（y = x で対称）', rows: ['a^x', 'log(x) / log(a)', 'x'], params: { a: 2 } },
      { label: '底による違い', rows: ['a^x'], params: { a: 0.5 }, play: 'a', trail: true },
    ],
  },
  {
    unit: '数II 図形と方程式',
    items: [
      { label: '円と直線', rows: ['(x - a)^2 + (y - b)^2 = r^2', 'y = m*x + k'], params: { a: 0, b: 0, r: 2, m: 1, k: 0 }, play: 'k' },
      { label: '不等式の表す領域', rows: ['y > x^2 - 2', 'x^2 + y^2 < r^2'], params: { r: 2 } },
      { label: '点と直線の距離', rows: ['y = m*x + k', '(x - p)^2 + (y - q)^2 = (abs(m*p - q + k) / sqrt(m^2 + 1))^2'], params: { m: 0.5, k: 1, p: 2, q: -1 } },
    ],
  },
  {
    unit: '数II 微分・積分',
    items: [
      { label: '3次関数と導関数', rows: [{ src: 'x^3 + a*x^2 + b*x', deriv: true }], params: { a: 0, b: -3 } },
      { label: '接線', rows: ['x^3 - 3*x', '(3*s^2 - 3)*(x - s) + s^3 - 3*s'], params: { s: -1.8 }, play: 's' },
      { label: '定積分と面積', rows: [{ src: 'x^2 - 2*x', area: [0, 3] }] },
    ],
  },
  {
    unit: '数III・数C',
    items: [
      { label: 'テイラー展開', rows: ['sin(x)', 'x - x^3/6', 'x - x^3/6 + x^5/120'] },
      { label: '漸近線のある分数関数', rows: ['(a*x + 1) / (x - b)'], params: { a: 2, b: 1 } },
      { label: '楕円・双曲線', rows: ['x^2/a^2 + y^2/b^2 = 1', 'x^2/a^2 - y^2/b^2 = 1'], params: { a: 2, b: 1 } },
      { label: '放物線 y² = 4px', rows: ['y^2 = 4*p*x'], params: { p: 1 } },
      { label: 'サイクロイド', rows: ['(r*(t - sin(t)), r*(1 - cos(t)))'], params: { r: 1 } },
      { label: 'カージオイド', rows: ['r = a*(1 + cos(θ))'], params: { a: 2 } },
    ],
  },
  {
    unit: '数B 統計',
    items: [{ label: '正規分布', rows: ['exp(-(x - m)^2 / (2*s^2)) / (s*sqrt(2*pi))'], params: { m: 0, s: 1 } }],
  },
  {
    unit: '眺めて楽しむ',
    items: [
      { label: '波の重ね合わせ', rows: ['sin(x)', 'sin(k*x)', 'sin(x) + sin(k*x)'], params: { k: 1.5 }, play: 'k' },
      { label: 'リサジュー', rows: ['(3*sin(a*t), 3*sin(b*t))'], params: { a: 3, b: 2 } },
      { label: 'バラ曲線', rows: ['r = 3*cos(k*θ)'], params: { k: 4 } },
      { label: 'ハート', rows: ['(x^2 + y^2 - 1)^3 = x^2*y^3'] },
    ],
  },
  {
    unit: '名前をつけて組み立てる',
    items: [
      { label: '関数の平行移動 f(x − p) + q', rows: ['f(x) = x^3 - 3x', 'f(x - p) + q'], params: { p: 2, q: 1 }, play: 'p' },
      { label: '合成関数 f(g(x))', rows: ['f(x) = x^2', 'g(x) = sin(x)', 'f(g(x))', 'g(f(x))'] },
      { label: '定数で式をまとめる', rows: ['w = 2*pi/T', 'A*sin(w*x)'], params: { A: 2, T: 4 } },
    ],
  },
]
