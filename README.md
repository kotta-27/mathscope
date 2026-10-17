# Mathscope

数式が、景色になる。

式を入れるとグラフになり、文字を動かせば形が変わる。定理も図で確かめられる。見て、触って、わかるための数学の道具。

**https://kotta-27.github.io/mathscope/**

![Mathscope のトップ](public/og.jpg)

## できること

| タブ | 内容 |
|---|---|
| ホーム | 7 分野のアニメーション（ヒマワリ、掛け算表、ローレンツ・アトラクタなど）と、使い方の例 |
| グラフ | 式の中の x 以外の文字が自動でスライダーになり、動かすと形の変化が見える |
| 構造 | 式を木構造に分解し、各部分の役割（分子・底・引数など）と値を表示 |
| 図形 | 単位円と三角関数、割線から接線への微分、リーマン和による積分 |
| 式変形 | 展開・因数分解・整理（通分と約分）・方程式を解く・微分を 1 手ずつ再生し、書き換えた箇所を色で示す |
| 定理 | 12 分野・77 個の定理を、条件・使いどころ・例題つきで。41 個に動かせる図がある |

### 式の書き方

`x²` `√x` `sin 2x` `|x|` `ax+b` や全角文字、`\frac{1}{x}` `\sqrt{x}` `x^{2}` のような LaTeX もそのまま書ける。入力は mathjs が読める形に直してから解析し、読み方が入力と違うときは「読み取り:」で表示する。

| 入力 | 読み取り |
|---|---|
| `ｘ＋１` `2×x` `6÷3` | `x+1` `2*x` `6/3` |
| `x²` `x⁻¹` `√(x+1)` `|x|` | `x^2` `x^(-1)` `sqrt(x+1)` `abs(x)` |
| `sinx` `sin²x` `ln x` | `sin(x)` `sin(x)^2` `log(x)`（`log` だけなら自然対数） |
| `log10 x` `log_10(x)` `\log_{10} x` `lg x` `log₁₀x` | `log10(x)`（常用対数） |
| `log_2 8` `log_3(x+1)` `log_a x` | `log2(8)` `log(x+1, 3)` `log(x, a)` |
| `ax^2+bx+c` | `a*x^2+b*x+c`（2 文字以上の変数は 1 文字ずつの積。`pi` `theta` などは除く） |

### URL で状態を指定する

| URL | 開く状態 |
|---|---|
| `#graph?f=sin(x)&f=x-x^3/6` | グラフに 2 つの式を入れて開く |
| `#structure?f=...` | 構造に式を入れて開く |
| `#steps?mode=solve&f=x^2=5x-6` | 式変形の種類と式を指定して開く（mode: `expand` `factor` `simplify` `solve` `derive`） |
| `#geometry?demo=deriv` | 図形の微分デモ（`circle` `integral` も） |
| `#theorems?q=bayes` | 定理集を検索した状態 |
| `#home?scene=lorenz&t=8` | トップのアニメーションをそのシーン・時刻で止める |

## 開発

```sh
npm install
npm run dev     # 開発サーバー（http://localhost:5173/mathscope/）
npm test        # 単体テスト（Vitest）
npm run lint
npm run build   # 型チェック + 本番ビルド
npm run e2e     # クリック操作の検証。開発サーバーと手元の Chrome が必要
```

`npm run e2e` は `E2E_BASE` で対象の URL、`CHROME_PATH` で Chrome の場所を変えられる（例: `E2E_BASE=https://kotta-27.github.io/mathscope/ npm run e2e`）。

### 開発の流れ

- 機能ごとに `dev/<内容>` のブランチを切り、PR を出す
- PR と main への push で CI（lint・テスト・ビルド）が走る
- main に入ると GitHub Actions で GitHub Pages にデプロイされる

## 構成

| パス | 内容 |
|---|---|
| `src/tabs/` | 各タブ。ホーム以外は開いたときに読み込む（`React.lazy`） |
| `src/hero/` | トップのアニメーション（Canvas）と背景 |
| `src/figures/` | 定理ごとの説明図。`index.tsx` で定理 id と対応付け、`ids.ts` に id の一覧 |
| `src/lib/theorems.ts` | 定理のデータ |
| `src/lib/normalize.ts` | 式の書き方の正規化 |
| `src/lib/steps.ts` | 式の展開を 1 手ずつ行うエンジン |
| `src/lib/transforms/` | 式変形の各モード（展開・因数分解・整理・方程式・微分）。どれも「1 手 = ラベル + 色付きの式」を返す |
| `src/components/` | グラフ描画（Plot）、数式の入力欄（MathInput）、KaTeX 表示など |
| `e2e/` | DevTools プロトコルでクリック操作を確かめるスクリプト |

技術: Vite + React + TypeScript、[KaTeX](https://katex.org/)、[math.js](https://mathjs.org/)
