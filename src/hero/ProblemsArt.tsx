/**
 * 「こんなこと、ありませんか？」のイラスト。
 * 頬づえをついて困る学生。頭の中のもつれた線が、見えるとすっきりした放物線になる。
 * 背景や吹き出しはテーマの色（明るい表示・暗い表示）に合わせる。
 */
export function ProblemsArt() {
  return (
    <svg className="problems-art" viewBox="0 0 640 560" role="img" aria-label="頭の中でもつれた線が、見えるとすっきりした放物線になる様子のイラスト">
      <circle cx="300" cy="300" r="230" className="pa-bg" />

      {/* 吹き出し（もつれ） */}
      <path
        d="M120 96 C120 60 150 40 200 40 L300 40 C346 40 372 62 372 96 L372 150 C372 186 346 206 300 206 L214 206 L186 236 L192 206 C150 204 120 186 120 150 Z"
        className="pa-bubble"
      />
      <g fill="none" strokeLinecap="round" strokeWidth="4">
        <path d="M152 156 C170 70 196 190 224 104 C246 40 262 172 290 112 C310 70 326 160 344 96" stroke="#e4572e" />
        <path d="M150 124 C186 160 202 72 238 142 C262 186 290 70 340 140" stroke="#f2a541" opacity="0.9" />
        <path d="M160 90 C200 120 236 96 252 132 C268 168 308 98 336 120" stroke="#a259ff" opacity="0.75" />
      </g>

      {/* 吹き出し（すっきり）と、そこへ向かう矢印 */}
      <rect x="404" y="120" width="196" height="150" rx="22" className="pa-clear" />
      <path d="M404 210 L380 236 L414 222" className="pa-clear" />
      <path d="M430 240 L578 240 M450 140 L450 256" className="pa-axis" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M462 148 C488 260 540 260 568 148" stroke="#3bb273" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="515" cy="232" r="7" fill="#e4572e" />
      <path d="M376 112 C392 98 410 98 428 108" stroke="#2e86ab" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M418 98 L430 109 L414 116" stroke="#2e86ab" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* 人物 */}
      <path d="M172 512 C168 418 206 372 268 362 L332 362 C394 372 432 418 428 512 Z" fill="#2e86ab" />
      <path d="M262 362 C272 384 328 384 338 362" fill="#24708f" />
      <rect x="282" y="330" width="36" height="40" rx="10" fill="#e9b892" />
      <ellipse cx="300" cy="284" rx="62" ry="68" fill="#f2c9a5" />
      <path d="M236 280 C226 220 262 196 304 196 C352 196 378 228 366 282 C358 252 336 240 316 242 C296 230 268 236 254 254 C246 262 240 270 236 280 Z" fill="#2b3a55" />
      <path d="M300 198 C294 186 302 176 314 180" stroke="#2b3a55" strokeWidth="7" fill="none" strokeLinecap="round" />
      <ellipse cx="238" cy="292" rx="10" ry="14" fill="#e9b892" />
      <ellipse cx="362" cy="292" rx="10" ry="14" fill="#e9b892" />
      <path d="M264 276 C272 268 282 266 290 270 M310 270 C318 266 328 268 336 276" stroke="#3d2c22" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="278" cy="294" rx="5" ry="6" fill="#3d2c22" />
      <ellipse cx="322" cy="294" rx="5" ry="6" fill="#3d2c22" />
      <path d="M286 324 C292 318 300 318 306 322 C310 325 314 326 318 322" stroke="#3d2c22" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <ellipse cx="262" cy="312" rx="10" ry="6" fill="#e4572e" opacity="0.25" />
      <ellipse cx="338" cy="312" rx="10" ry="6" fill="#e4572e" opacity="0.25" />
      <path d="M372 238 C366 252 364 260 370 264 C376 268 382 262 380 254 C379 248 376 242 372 238 Z" fill="#8fcbe4" />
      {/* 頬づえの腕 */}
      <path d="M200 512 C196 456 206 404 236 372 C248 360 262 360 266 372 C270 384 260 396 252 410 C240 432 236 470 238 512 Z" fill="#2a78a0" />
      <ellipse cx="258" cy="352" rx="22" ry="18" fill="#f2c9a5" />

      {/* 机と教科書 */}
      <rect x="60" y="500" width="520" height="22" rx="8" className="pa-desk" />
      <path d="M330 500 L500 500 L486 470 L344 470 Z" className="pa-clear" />
      <path d="M415 470 L415 500" className="pa-axis" strokeWidth="2" />
      <path d="M356 480 L400 480 M356 490 L392 490 M430 480 L474 480 M430 490 L462 490" className="pa-axis" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
