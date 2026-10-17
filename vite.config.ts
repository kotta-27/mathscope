import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages（https://kotta-27.github.io/mathscope/）で配信するため
  base: '/mathscope/',
  plugins: [react()],
  build: {
    // 最初に読む JS は KaTeX と React が大半（約 530KB）。数式ライブラリ mathjs は
    // 各タブを開いたときに別ファイルで読むので、警告の基準をこの大きさに合わせる
    chunkSizeWarningLimit: 800,
    // フォントの小さな断片を CSS に埋め込まない（埋め込むと CSS がふくれ、表示が遅くなる）。
    // 別ファイルにしておけば、画面に出る字のファイルだけが読み込まれる
    assetsInlineLimit: (file) => (/\.woff2?$/.test(file) ? false : undefined),
  },
})
