import type { ReactElement } from 'react'

/**
 * 「こんなこと、ありませんか？」の、悩みごとの小さなイラスト（Claude Design の D 案）。
 * 色はテーマに合わせる（sp-* のクラス）。並びは HomeTab の PROBLEMS と同じ。
 */
const Frame = ({ label, children }: { label: string; children: ReactElement | ReactElement[] }) => (
  <svg className="problem-spot" viewBox="0 0 180 120" role="img" aria-label={label}>
    <rect x="0" y="0" width="180" height="120" rx="10" className="sp-bg" />
    {children}
  </svg>
)

const hand = { fontFamily: "Caveat, 'Comic Sans MS', cursive" }
const serif = { fontFamily: 'Georgia, serif', fontStyle: 'italic' as const }

const SPOTS: ReactElement[] = [
  // 01 グラフの形がイメージできない: 式を見ても、頭の中のグラフは点線のまま
  <Frame key="graph" label="式のカードを見ても、頭の中のグラフが点線のまま">
    <rect x="14" y="66" width="74" height="34" rx="6" className="sp-card" />
    <text x="22" y="89" fontSize="16" className="sp-ink" style={hand}>a(x−p)²+q</text>
    <path d="M100 30 C100 16 112 10 130 10 L150 10 C164 10 172 18 172 30 L172 56 C172 68 164 76 150 76 L126 76 L112 90 L114 76 C104 74 100 68 100 56 Z" className="sp-card" />
    <path d="M112 64 L160 64 M120 22 L120 70" className="sp-line" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M126 26 C136 70 148 70 158 26" stroke="#f2a541" strokeWidth="2.6" strokeDasharray="2 6" strokeLinecap="round" fill="none" />
    <circle cx="52" cy="38" r="16" className="sp-stroke" strokeWidth="2.4" />
    <path d="M44 34 L48 34 M56 34 L60 34 M46 45 C50 42 54 42 58 45" className="sp-stroke" strokeWidth="2" strokeLinecap="round" />
  </Frame>,
  // 02 記号の意味が分からない: 虫めがねでのぞいても分からない
  <Frame key="symbols" label="式の記号を虫めがねでのぞいても、意味が分からない">
    <text x="16" y="70" fontSize="24" className="sp-muted" style={serif}>P(A|B)</text>
    <text x="20" y="34" fontSize="18" className="sp-faint" style={serif}>Σ</text>
    <text x="58" y="104" fontSize="18" className="sp-faint" style={serif}>θ</text>
    <text x="148" y="30" fontSize="16" className="sp-faint" style={serif}>λ</text>
    <circle cx="122" cy="60" r="26" className="sp-lens" strokeWidth="3" />
    <text x="111" y="70" fontSize="26" fill="#e4572e" style={serif}>|</text>
    <path d="M141 79 L162 102" className="sp-stroke" strokeWidth="7" strokeLinecap="round" />
  </Frame>,
  // 03 途中式が追えない: 式の階段の途中で迷う
  <Frame key="steps" label="式の階段の途中で、どこから来たのか分からなくなった人">
    <path d="M14 106 L54 106 L54 82 L94 82 L94 58 L134 58 L134 34 L170 34" fill="none" className="sp-line" strokeWidth="2.4" strokeLinejoin="round" />
    <text x="18" y="100" fontSize="13" className="sp-muted" style={hand}>2x²−8x+3</text>
    <text x="58" y="76" fontSize="13" className="sp-muted" style={hand}>2(x²−4x)</text>
    <text x="138" y="28" fontSize="13" fill="#3bb273" style={hand}>= ?</text>
    <circle cx="112" cy="36" r="7" className="sp-fill" />
    <path d="M112 43 L112 54 M104 48 L120 48" className="sp-stroke" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M70 40 C72 34 80 34 81 40 C82 44 77 46 77 50" stroke="#f2a541" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <circle cx="77" cy="56" r="1.8" fill="#f2a541" />
  </Frame>,
  // 04 微分・積分がピンとこない: 割線と接線、lim の記号の前で首をかしげる
  <Frame key="calculus" label="曲線と割線を前に、極限の意味がピンとこない">
    <path d="M18 100 L170 100 M30 108 L30 14" className="sp-line" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M36 92 C70 88 96 70 116 46 C130 30 146 20 166 16" stroke="#2e86ab" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M52 100 L160 18" stroke="#f2a541" strokeWidth="2.2" strokeDasharray="5 4" strokeLinecap="round" />
    <circle cx="76" cy="81" r="4.5" fill="#3bb273" />
    <circle cx="140" cy="28" r="4.5" fill="#f2a541" />
    <text x="40" y="34" fontSize="16" className="sp-faint" style={serif}>lim</text>
    <text x="44" y="50" fontSize="11" className="sp-faint" style={serif}>h→0</text>
    <path d="M150 64 C152 56 162 56 163 63 C164 69 157 71 157 77" stroke="#f2a541" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <circle cx="157" cy="84" r="2" fill="#f2a541" />
  </Frame>,
  // 05 どうしてこうなるのか分からない: 覚えた公式の上に「なぜ？」
  <Frame key="why" label="覚えた公式の上に、大きな「なぜ？」">
    <rect x="18" y="58" width="104" height="44" rx="6" className="sp-card" />
    <text x="28" y="87" fontSize="20" className="sp-ink" style={hand}>a²+b²=c²</text>
    <path d="M116 60 L116 90 L144 90 Z" fill="none" stroke="#2e86ab" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M116 84 L122 84 L122 90" stroke="#2e86ab" strokeWidth="1.8" fill="none" />
    <path d="M128 18 C132 6 154 6 156 20 C158 32 142 34 142 48" stroke="#f2a541" strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="142" cy="60" r="3.6" fill="#f2a541" />
    <text x="30" y="40" fontSize="18" fontWeight="700" className="sp-ink">なぜ？</text>
  </Frame>,
]

/** i 番目の悩みのイラスト */
export function ProblemSpot({ index }: { index: number }) {
  return SPOTS[index] ?? null
}
