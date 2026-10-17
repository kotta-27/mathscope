# Mathscope

数式が、景色になる。

式を入れるとグラフになり、文字を動かせば形が変わる。定理も図で確かめられる。見て、触って、わかるための数学の道具。

**https://kotta-27.github.io/mathscope/**

## 機能

- **グラフ**: 式の中の x 以外の文字が自動でスライダーになり、動かすと形の変化が見える
- **構造**: 式を木構造に分解し、各部分の役割（分子・底・引数など）と値を表示
- **図形**: 単位円と三角関数、割線から接線への微分、リーマン和による積分
- **変形**: (a+b)² などの展開を 1 手ずつ再生し、書き換えた箇所を色で示す
- **定理集**: 12 分野・77 個の定理を、条件・使いどころ・例題・動かせる図つきで収録

URL のハッシュで状態を指定できる（例: `#graph?f=sin(x)&f=x-x^3/6`、`#geometry?demo=deriv`、`#theorems?q=bayes`）。

## 開発

```sh
npm install
npm run dev     # 開発サーバー
npm run build   # 型チェック + 本番ビルド
npm run lint
```

`main` に push すると GitHub Actions（`.github/workflows/deploy.yml`）で GitHub Pages にデプロイされる。

## 構成

| パス | 内容 |
|---|---|
| `src/tabs/` | 各タブ（ホーム・グラフ・構造・図形・変形・定理） |
| `src/lib/theorems.ts` | 定理データ |
| `src/figures/` | 定理ごとの説明図。`index.tsx` で定理 id と対応付け |
| `src/lib/steps.ts` | 式の展開を 1 手ずつ行うエンジン |
| `src/components/` | グラフ描画（Plot）、KaTeX 表示、スライダーなど |

技術: Vite + React + TypeScript、[KaTeX](https://katex.org/)、[math.js](https://mathjs.org/)
