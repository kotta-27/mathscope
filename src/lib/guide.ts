/**
 * 定理カードの読み方の手引き。
 * - gist: 主張をふだんの言葉で 1 文に（式を読む前に、何の話かが分かるように）
 * - try: 図で試してほしいこと（何を動かし、何に気づくか）
 * - related: つながる定理の id（前に知っておくもの・次に進むもの・同じ形のもの）
 * 文の中の $...$ は数式として描く。
 */
const r = String.raw

export type Guide = { gist: string; try: string[]; related: string[] }

export const GUIDE: Record<string, Guide> = {
  /* ---------- 代数・方程式 ---------- */
  'quadratic-formula': {
    gist: '2 次方程式は、係数 a, b, c を公式に入れるだけで必ず解ける。',
    try: [r`$b^2-4ac$ が 0 を下回るように c を大きくすると、放物線が x 軸から離れて実数の解がなくなる。`],
    related: ['completing-square', 'vieta', 'conjugate-roots'],
  },
  vieta: {
    gist: '2 つの解の和と積は、解かなくても係数から分かる。',
    try: [r`b を動かすと 2 つの解は同じだけ左右に動き、軸 $x=\frac{\alpha+\beta}{2}$ がその真ん中にある。`, 'c を動かすと、y 軸との交点（= 解の積）の高さが変わる。'],
    related: ['quadratic-formula', 'conjugate-roots', 'factor-theorem'],
  },
  'factor-theorem': {
    gist: 'x = a を代入して 0 になれば、(x − a) で割り切れる。',
    try: ['a = 1, 2, 3 のボタンを押すと、グラフが x 軸を通る点で余りがちょうど 0 になる。'],
    related: ['remainder-theorem', 'fundamental-algebra', 'vieta'],
  },
  'remainder-theorem': {
    gist: 'x − a で割った余りは、x = a を代入した値になる。',
    try: ['a を動かすと、グラフの高さ P(a) がそのまま余りとして表示される。'],
    related: ['factor-theorem', 'fundamental-algebra'],
  },
  binomial: {
    gist: '(a + b)ⁿ を展開したときの係数は、パスカルの三角形に並ぶ。',
    try: ['n を 1 ずつ増やすと、上の段の隣どうしを足した数が下の段にできる。'],
    related: ['binomial-dist', 'bernoulli', 'power-sums'],
  },
  'fundamental-algebra': {
    gist: 'n 次方程式は、複素数まで広げればちょうど n 個の解をもつ。',
    try: ['次数 n を 1 つ増やすと、点（解）も必ず 1 つ増える。', 'a, b を動かすと解は動くが、数は変わらない。実数の解（橙）は増えたり減ったりする。'],
    related: ['factor-theorem', 'conjugate-roots', 'roots-of-unity'],
  },
  'completing-square': {
    gist: '2 次式を「(x − p)² の形 + 定数」に直すと、頂点が読める。',
    try: ['a = 1 のまま b だけを動かすと、頂点は放物線 y = −x² + c の上をすべるように動く。', 'a を負にすると上に凸になり、頂点が最大値になる。'],
    related: ['quadratic-formula', 'quadratic-inequality', 'am-gm'],
  },
  'quadratic-inequality': {
    gist: '2 次不等式の答えは、グラフが x 軸より上（下）にある範囲。',
    try: ['c を大きくしてグラフを x 軸から浮かせると、「> 0」はすべての実数、「< 0」は解なしになる。'],
    related: ['completing-square', 'quadratic-formula', 'ivt'],
  },
  'log-properties': {
    gist: '対数を使うと、掛け算が足し算に、累乗が掛け算に変わる。',
    try: ['M と N を動かすと、右の 2 本（log M と log N）を積んだ高さが、いつも log MN と等しい。', '底を変えても、この関係はそのまま成り立つ。'],
    related: ['monotone-convergence', 'harmonic-series', 'euler-formula'],
  },

  /* ---------- 数列・極限 ---------- */
  'arithmetic-sum': {
    gist: '等差数列の和は、逆に並べたものと足すと「(初項 + 末項) × 個数」の 2 倍になる。',
    try: ['n を増やしても、階段を 2 つ組み合わせた形はいつも長方形になる。'],
    related: ['geometric-sum', 'power-sums', 'induction'],
  },
  'geometric-sum': {
    gist: '等比数列の和は、公比を掛けてずらしたものを引くと求まる。',
    try: ['n を増やすと、面積 1 の正方形が半分ずつ埋まっていき、和 1/2 + 1/4 + … が 1 に近づく。'],
    related: ['arithmetic-sum', 'harmonic-series', 'recurrence'],
  },
  'power-sums': {
    gist: '1³ から n³ までの和は、1 から n までの和の 2 乗になる。',
    try: ['n を 1 ずつ増やすと、正方形に L 字が 1 つずつ足され、その面積が k³ になっている。'],
    related: ['arithmetic-sum', 'induction', 'binomial'],
  },
  induction: {
    gist: '最初が正しく、1 つ前が正しければ次も正しいなら、すべて正しい。',
    try: ['「最初のドミノを倒す」を外すと、時間を進めても 1 枚も倒れない。'],
    related: ['power-sums', 'arithmetic-sum', 'recurrence'],
  },
  recurrence: {
    gist: '「前の項の p 倍 + q」の数列は、動かない点 α との差が p 倍ずつ変わる。',
    try: ['p を 1 より大きくすると、くもの巣が外へ広がって数列が発散する。', 'p を負にすると、α の左右を行き来しながら近づく。'],
    related: ['geometric-sum', 'induction', 'monotone-convergence'],
  },
  squeeze: {
    gist: '両側から同じ値ではさまれたものは、その値に近づくしかない。',
    try: [r`x を 0 に近づけると、両側の面積の比がどちらも 1 に近づき、$\frac{\sin x}{x}$ もはさまれて 1 になる。`],
    related: ['monotone-convergence', 'lhopital', 'derivative-def'],
  },
  'monotone-convergence': {
    gist: '増え続けるのに上限を超えない数列は、必ずある値に落ち着く。',
    try: [r`n を増やすと点は増え続けるが、3 の線は越えず、$e$ の線に近づく。`],
    related: ['squeeze', 'recurrence', 'euler-formula'],
  },
  'harmonic-series': {
    gist: '1/k は 0 に近づくのに、全部足すと限りなく大きくなる。',
    try: ['n を 80 まで増やしても、和は 5 程度。それでも上限はなく、log(n+1) のようにゆっくり増え続ける。'],
    related: ['geometric-sum', 'riemann-sum', 'log-properties'],
  },

  /* ---------- 三角関数 ---------- */
  'pythagorean-identity': {
    gist: '単位円の上の点 (cos θ, sin θ) は、三平方の定理で sin² + cos² = 1 を満たす。',
    try: ['θ を動かしても、2 つの辺の 2 乗の和はいつも 1 のまま。'],
    related: ['pythagoras', 'addition-formula', 'euler-formula'],
  },
  'addition-formula': {
    gist: 'sin(α + β) は、角 α の線に垂線を下ろすと 2 つの長さの和に分かれる。',
    try: ['β を 0 に近づけると、赤い長さが 0 になり、sin(α + 0) = sin α になる。'],
    related: ['double-angle', 'harmonic-addition', 'rotation-matrix'],
  },
  'double-angle': {
    gist: 'sin 2θ は、円周角 θ と中心角 2θ の関係から 2 sin θ cos θ になる。',
    try: ['θ を 45° にすると、P の高さが最大の 1 になる（sin 90° = 1）。'],
    related: ['addition-formula', 'inscribed-angle', 'product-to-sum'],
  },
  'harmonic-addition': {
    gist: 'sin と cos を足しても、振幅と位置がずれた 1 つの sin の波になる。',
    try: ['a と b を動かすと、緑の波の高さ（振幅）が斜辺の長さ √(a² + b²) と一緒に変わる。', 'b を 0 にすると、ずれ α も 0 になり、ただの a sin θ に戻る。'],
    related: ['addition-formula', 'pythagoras', 'product-to-sum'],
  },
  'product-to-sum': {
    gist: '三角関数の積は、周波数の差と和の波の足し算に直せる。',
    try: ['α と β を 1 違いにすると、赤い波がゆっくりふくらんだりしぼんだりする（うなり）。'],
    related: ['addition-formula', 'harmonic-addition', 'double-angle'],
  },
  radian: {
    gist: '半径と同じ長さの弧に対する角が 1 ラジアン。弧の長さは rθ で済む。',
    try: ['θ を 1 にすると、赤い弧の長さが半径 r とちょうど等しくなる。', 'θ を 2π まで動かすと、扇形が円全体（面積 πr²）になる。'],
    related: ['pythagorean-identity', 'euler-formula', 'derivative-def'],
  },
  'law-of-sines': {
    gist: '辺とその向かいの角の sin の比は、どの組でも外接円の直径になる。',
    try: ['頂点をドラッグして三角形の形を変えても、3 つの比は同じ値（2R）のまま。'],
    related: ['law-of-cosines', 'inscribed-angle', 'triangle-area'],
  },
  'law-of-cosines': {
    gist: '三平方の定理を、直角でない三角形にも使えるように直したもの。',
    try: ['角 A を 90° にすると、cos A = 0 になって三平方の定理と同じ式になる。'],
    related: ['pythagoras', 'law-of-sines', 'dot-product'],
  },
  'triangle-area': {
    gist: '2 辺とその間の角が分かれば、三角形の面積が出せる。',
    try: ['角 C を 90° にすると面積が最大になる（底辺 × 高さ ÷ 2 そのもの）。'],
    related: ['heron', 'cross-area', 'law-of-cosines'],
  },

  /* ---------- 平面図形 ---------- */
  pythagoras: {
    gist: '直角三角形では、斜辺の正方形の面積が、残り 2 辺の正方形の面積の和になる。',
    try: ['a と b を動かしても、2 つの小さい正方形の面積の和は、いつも大きい正方形と等しい。'],
    related: ['law-of-cosines', 'pythagorean-identity', 'pythagorean-triples'],
  },
  'median-theorem': {
    gist: '2 辺の 2 乗の和は、中線と、底辺の半分の 2 乗の和の 2 倍になる。',
    try: ['頂点 A をドラッグしても、左右の値はいつも等しい。'],
    related: ['pythagoras', 'centroid', 'law-of-cosines'],
  },
  centroid: {
    gist: '3 本の中線は 1 点で交わり、その点が各中線を 2:1 に分ける。',
    try: ['どの頂点をドラッグしても、赤（AG）がちょうど青（GM）の 2 倍の長さになる。'],
    related: ['median-theorem', 'section-formula', 'ceva'],
  },
  'inscribed-angle': {
    gist: '同じ弧に対する円周角はどこでも等しく、中心角の半分になる。',
    try: ['円周上の点をドラッグしても、弧が同じなら角の大きさは変わらない。'],
    related: ['tangent-chord', 'double-angle', 'law-of-sines'],
  },
  'tangent-chord': {
    gist: '接線と弦のなす角は、その弦に対する円周角と等しい。',
    try: ['C を動かしても、反対側の弧にある限り 2 つの角は同じ。'],
    related: ['inscribed-angle', 'power-of-point'],
  },
  'power-of-point': {
    gist: '点を通る直線が円と交わる 2 点までの長さの積は、直線の向きによらない。',
    try: ['θ₁, θ₂ で 2 本の直線の向きを変えても、PA·PB と PC·PD はいつも等しい。'],
    related: ['inscribed-angle', 'tangent-chord', 'ptolemy'],
  },
  menelaus: {
    gist: '三角形を横切る直線が 3 辺（の延長）を分ける比を掛けると 1 になる。',
    try: ['直線を三角形の外まで動かすと、交点が辺の延長上（外分）に移るが、積は 1 のまま。'],
    related: ['ceva', 'section-formula', 'angle-bisector'],
  },
  ceva: {
    gist: '頂点から引いた 3 本の線が 1 点で交わるとき、辺を分ける比の積は 1。',
    try: ['内部の点 P をドラッグすると、3 つの比はばらばらに変わるが、積はいつも 1。'],
    related: ['menelaus', 'centroid', 'angle-bisector'],
  },
  'angle-bisector': {
    gist: '角の二等分線は、向かいの辺を、角をはさむ 2 辺の比に分ける。',
    try: ['頂点をドラッグして AB と AC の長さを変えると、BD:DC も同じ比で変わる。'],
    related: ['menelaus', 'ceva', 'section-formula'],
  },
  heron: {
    gist: '3 辺の長さだけで三角形の面積が求まる。',
    try: ['頂点をドラッグして三角形をつぶしていくと、s − a などのどれかが 0 に近づき、面積も 0 になる。'],
    related: ['triangle-area', 'law-of-cosines', 'cross-area'],
  },
  ptolemy: {
    gist: '円に内接する四角形では、対角線の積が、向かい合う辺の積の和になる。',
    try: ['4 点をドラッグして長方形にすると、三平方の定理と同じ式になる。'],
    related: ['inscribed-angle', 'power-of-point', 'addition-formula'],
  },
  pick: {
    gist: '格子点の上の多角形の面積は、点を数えるだけで分かる。',
    try: ['頂点を 1 つ動かして面積を 1 増やすと、内部の点か辺の上の点の数が、それに合うように変わる。'],
    related: ['euler-polyhedron', 'cross-area', 'triangle-area'],
  },
  'euler-polyhedron': {
    gist: 'へこみのない多面体では、頂点 − 辺 + 面 がいつも 2。',
    try: ['5 つの正多面体を切り替えると、V, E, F はどれも違うのに、V − E + F は必ず 2。'],
    related: ['pick', 'induction'],
  },

  /* ---------- ベクトル・座標 ---------- */
  'dot-product': {
    gist: '内積は「片方の長さ × もう片方をその向きに落とした影の長さ」。',
    try: ['矢印を直角にすると影が消えて内積が 0、鈍角にすると影が逆向きで負になる。'],
    related: ['cauchy-schwarz', 'law-of-cosines', 'point-line-distance'],
  },
  'point-line-distance': {
    gist: '点から直線までの距離は、直線の式に点の座標を入れた値から求まる。',
    try: ['点を直線の上に乗せると、分子 |ax + by + c| が 0 になる。'],
    related: ['dot-product', 'section-formula'],
  },
  'section-formula': {
    gist: '2 点を m:n に分ける点は、両端を「遠いほうの比」で重みづけた平均。',
    try: ['m = n にすると、ちょうど中点になる。'],
    related: ['centroid', 'menelaus', 'jensen'],
  },
  'cross-area': {
    gist: '2 つのベクトルが作る平行四辺形の面積は、成分のたすき掛けの差。',
    try: ['b を a と同じ向きにそろえると、平行四辺形がつぶれて面積が 0 になる。'],
    related: ['det-product', 'triangle-area', 'inverse-matrix'],
  },

  /* ---------- 微分 ---------- */
  'derivative-def': {
    gist: '導関数は、2 点を結ぶ線の傾きで、2 点を限りなく近づけたもの。',
    try: ['h を 0 に近づけると、赤い割線が緑の接線にぴったり重なっていく。'],
    related: ['tangent-line', 'mean-value', 'product-quotient'],
  },
  'tangent-line': {
    gist: '接線は、接点を通り、傾きが微分係数の直線。',
    try: ['a を山や谷の頂上に合わせると、接線が水平（傾き 0）になる。'],
    related: ['derivative-def', 'newton-method', 'monotonic'],
  },
  'product-quotient': {
    gist: '積の微分は「片方だけ微分」を 2 通り足したもの。',
    try: ['Δx を小さくすると、角の紫の正方形は 2 本の帯よりずっと早く小さくなって消える。'],
    related: ['derivative-def', 'chain-rule', 'by-parts'],
  },
  'chain-rule': {
    gist: '関数を重ねたときの伸び率は、それぞれの伸び率の掛け算。',
    try: ['Δx を小さくすると、2 つの比の積が cos(x²)·2x にどんどん近づく。'],
    related: ['product-quotient', 'substitution', 'derivative-def'],
  },
  'mean-value': {
    gist: '2 点を結ぶ線と同じ傾きの接線が、間のどこかに必ずある。',
    try: ['a と b を動かしても、両端を結ぶ線と平行な接線がいつも見つかる。'],
    related: ['rolle', 'ivt', 'taylor'],
  },
  rolle: {
    gist: '両端の高さが同じなら、間のどこかで接線が水平になる。',
    try: ['形や高さを変えても、0 と 4 の間に、接線が水平な点（赤）が必ず 1 つ以上ある。'],
    related: ['mean-value', 'extreme-value', 'ivt'],
  },
  ivt: {
    gist: 'つながった曲線は、途中の値をすべて通る。',
    try: ['k を f(a) と f(b) の間で動かすと、y = k と曲線の交点が必ずある。'],
    related: ['extreme-value', 'rolle', 'newton-method'],
  },
  'extreme-value': {
    gist: '端を含む区間で途切れない関数には、必ず一番高い点と一番低い点がある。',
    try: ['「端を含めない」にして、最大か最小が端にくるように a, b を動かすと、その点が取れなくなる。'],
    related: ['ivt', 'rolle', 'monotonic'],
  },
  monotonic: {
    gist: '導関数が正なら増加、負なら減少。符号が変わる所が山と谷。',
    try: ['点を動かすと、下のグラフ（導関数）が 0 より上の間、上のグラフは上り坂（緑）になる。'],
    related: ['tangent-line', 'extreme-value', 'rolle'],
  },
  lhopital: {
    gist: 'どちらも 0 に近づく比は、傾き（導関数）の比で求まる。',
    try: ['x を 0 に近づけると、2 本の曲線が点線の接線に重なり、比が 2 に近づく。'],
    related: ['squeeze', 'taylor', 'derivative-def'],
  },
  taylor: {
    gist: '関数は、1 点での値と導関数を使った多項式でいくらでも近づけられる。',
    try: ['次数 n を増やすと、赤い多項式が本物の曲線に重なる範囲が外へ広がる。', 'e^x に切り替えると、少ない次数でも原点の近くはよく合う。'],
    related: ['lhopital', 'mean-value', 'euler-formula'],
  },
  'newton-method': {
    gist: '接線が x 軸と交わる点を次の予想にすると、解に一気に近づく。',
    try: ['くり返す回数を 1 ずつ増やすと、x₂, x₃ と正しい桁がおよそ倍々に増える。', '初めの値 x₀ を極値の近くにすると、接線がほぼ水平になって大きく外れる。'],
    related: ['tangent-line', 'ivt', 'taylor'],
  },

  /* ---------- 積分 ---------- */
  ftc: {
    gist: '面積を求める（積分）ことと、傾きを求める（微分）ことは、逆の操作。',
    try: ['x を少し動かすと、増える面積は赤い細い帯（高さ f(x) × 幅）だけ。だから面積の増え方が f(x) になる。'],
    related: ['riemann-sum', 'substitution', 'by-parts'],
  },
  substitution: {
    gist: '置き換えた変数で見ても、面積は変わらない。',
    try: ['b を動かすと、左（x で見た面積）と右（u = x² で見た面積）がいつも等しい。'],
    related: ['chain-rule', 'ftc', 'gaussian-integral'],
  },
  'by-parts': {
    gist: '積の微分を逆にたどると、積の積分を別の積分に移せる。',
    try: ['終点を動かすと、大きな長方形から小さな長方形を除いた L 字が、曲線で下側（∫v du）と左側（∫u dv）に分かれる。'],
    related: ['product-quotient', 'ftc', 'substitution'],
  },
  'riemann-sum': {
    gist: '細い長方形の面積を足し、幅を限りなく細くしたものが積分。',
    try: ['分割数を増やすと、長方形の和と本当の面積の差が 0 に近づく。', '「中点」は「左端」「右端」より、少ない分割数でよく合う。'],
    related: ['ftc', 'harmonic-series', 'solid-revolution'],
  },
  'solid-revolution': {
    gist: '回転体の体積は、薄い円板の体積 πr² × 厚さ を足し合わせたもの。',
    try: ['円板の数を増やすと、円板の体積の和が積分の値に近づく。'],
    related: ['riemann-sum', 'ftc', 'area-between'],
  },
  'area-between': {
    gist: '放物線と直線で囲まれた面積は、2 つの交点の距離だけで決まる。',
    try: ['m を変えて直線を傾けても、交点の間の幅が同じなら面積も同じ。'],
    related: ['ftc', 'riemann-sum', 'quadratic-formula'],
  },
  'gaussian-integral': {
    gist: 'e^{−x²} の下の面積は、全部足すとちょうど √π になる。',
    try: ['R を 2 まで広げただけで、面積は √π の 99% を超える。'],
    related: ['normal-distribution', 'substitution', 'clt'],
  },

  /* ---------- 線形代数 ---------- */
  'inverse-matrix': {
    gist: '行列で移した平面を元に戻す行列が逆行列。面積が 0 につぶれると戻せない。',
    try: ['ad − bc が 0 になるように動かすと、平行四辺形が線につぶれ、逆行列がなくなる。'],
    related: ['det-product', 'rotation-matrix', 'rank-nullity'],
  },
  'det-product': {
    gist: '行列式は面積の倍率。2 回移せば、倍率は掛け算になる。',
    try: ['a〜d を動かすと、色の平行四辺形の面積が |det A| 倍として表示される。'],
    related: ['inverse-matrix', 'cross-area', 'rotation-matrix'],
  },
  'rotation-matrix': {
    gist: '平面を θ だけ回す行列。2 回回すと、角度が足し算になる。',
    try: ['θ をいくら動かしても形の大きさは変わらない（行列式が 1）。'],
    related: ['addition-formula', 'polar-product', 'det-product'],
  },
  'rank-solution': {
    gist: '連立方程式の解は、2 直線が 1 点で交わるか、平行か、重なるかで決まる。',
    try: ['「平行にする」を押すと解がなくなり、「重ねる」を押すと解が無数になる。'],
    related: ['rank-nullity', 'inverse-matrix'],
  },
  'rank-nullity': {
    gist: 'つぶれて消える次元と、残る次元を足すと、元の次元になる。',
    try: ['s = 1 にすると、平面が 1 本の線につぶれ、赤い線上の点がすべて原点に移る。'],
    related: ['rank-solution', 'inverse-matrix', 'diagonalization'],
  },
  'cayley-hamilton': {
    gist: '2×2 の行列は、自分の特性方程式を満たす。',
    try: ['a〜d をどう動かしても、A²v は点線の平行四辺形の頂点にぴったり重なる。'],
    related: ['diagonalization', 'vieta', 'det-product'],
  },
  diagonalization: {
    gist: '向きを変えずに伸び縮みするだけの方向（固有ベクトル）を軸にすると、行列が簡単になる。',
    try: ['紫のベクトルを赤や緑の線に重ねると、Ax が同じ向きのまま λ 倍になる。', '回転を含むように b と c を逆の符号にすると、実数の固有値がなくなる。'],
    related: ['spectral', 'cayley-hamilton', 'rotation-matrix'],
  },
  spectral: {
    gist: '対称な行列の固有ベクトルは、必ず直交する。',
    try: ['a〜d を動かしても、楕円の長軸と短軸（固有ベクトル）はいつも直角に交わる。'],
    related: ['diagonalization', 'dot-product', 'cauchy-schwarz'],
  },

  /* ---------- 確率・統計 ---------- */
  'inclusion-exclusion': {
    gist: '重なりを二重に数えないよう、足したあとで重なりを引く。',
    try: ['円を離して重なりをなくすと、引く分が 0 になってただの足し算になる。'],
    related: ['conditional', 'bayes'],
  },
  conditional: {
    gist: 'B が起きたと分かったら、全体を B に絞って A の割合を見る。',
    try: ['B の位置を動かして A との重なりを変えると、P(A|B) が P(A) と違う値になる。'],
    related: ['bayes', 'inclusion-exclusion', 'birthday'],
  },
  bayes: {
    gist: '結果（陽性など）から原因の確率を、元の割合を使って見直す。',
    try: ['事前確率を小さくすると、検査が正確でも「陽性なら病気」の確率は意外に低くなる。'],
    related: ['conditional', 'inclusion-exclusion'],
  },
  'linearity-expectation': {
    gist: '和の期待値は、それぞれの期待値の和。独立かどうかは関係ない。',
    try: ['a と b を動かしても、棒の重心（平均）はいつも a × 3.5 + b × 0.5 の位置。'],
    related: ['variance', 'binomial-dist', 'lln'],
  },
  variance: {
    gist: '分散は「2 乗の平均 − 平均の 2 乗」。全体をずらしても変わらず、a 倍すると a² 倍になる。',
    try: ['b を動かすと点が左右にずれるだけで、散らばり（紫の幅）は変わらない。'],
    related: ['linearity-expectation', 'chebyshev', 'normal-distribution'],
  },
  'binomial-dist': {
    gist: '成功の確率 p の試行を n 回したときの成功回数の分布。',
    try: ['n を大きくすると、棒の形が左右対称な山（正規分布）に近づく。'],
    related: ['binomial', 'normal-distribution', 'clt'],
  },
  lln: {
    gist: '回数を増やすほど、平均は本当の確率に近づく。',
    try: ['回数を増やすと 5 本の線が μ に集まる。「もう一度試す」で何度やっても同じ。'],
    related: ['clt', 'chebyshev', 'confidence-interval'],
  },
  clt: {
    gist: 'どんな分布でも、たくさん足した平均は正規分布に近づく。',
    try: ['n を増やすと、元の形によらず、ヒストグラムが釣り鐘形になる。'],
    related: ['lln', 'normal-distribution', 'confidence-interval'],
  },
  chebyshev: {
    gist: '平均から kσ 以上離れる確率は、どんな分布でも 1/k² 以下。',
    try: ['分布を切り替えても、赤い棒（実際の確率）は紫の棒（1/k²）を超えない。'],
    related: ['variance', 'lln', 'normal-distribution'],
  },
  'normal-distribution': {
    gist: '正規分布では、平均 ±σ に約 68%、±2σ に約 95%、±3σ に約 99.7% が入る。',
    try: ['μ や σ を変えても、±1σ の範囲の割合は 68.27% のまま。'],
    related: ['clt', 'gaussian-integral', 'confidence-interval'],
  },
  birthday: {
    gist: '23 人いれば、同じ誕生日の 2 人がいる確率は 50% を超える。',
    try: ['人数を 23 にしてから 40, 60 と増やすと、確率がすぐ 100% 近くまで上がる。'],
    related: ['conditional', 'inclusion-exclusion'],
  },
  'confidence-interval': {
    gist: '「100 回作れば 95 回は本当の平均を含む区間」が 95% 信頼区間。',
    try: ['n を大きくすると区間が短くなるが、μ を含む本数の割合は 95% のまま。', '「もう一度取る」を何度か押すと、赤（外れた区間）の数が 0〜3 本くらいで入れかわる。'],
    related: ['clt', 'normal-distribution', 'lln'],
  },

  /* ---------- 整数・数論 ---------- */
  'euclid-algorithm': {
    gist: '大きい数を小さい数で割った余りに置き換えても、最大公約数は変わらない。',
    try: ['a と b を動かすと、正方形を切り取っていって最後に残る正方形の辺が最大公約数。'],
    related: ['bezout', 'fundamental-arithmetic', 'crt'],
  },
  bezout: {
    gist: 'ax + by が取れる値は、ちょうど最大公約数の倍数。',
    try: ['a と b を互いに素にすると、青い点がすべての整数に並ぶ（1 が作れる）。'],
    related: ['euclid-algorithm', 'crt', 'fermat-little'],
  },
  'fundamental-arithmetic': {
    gist: '2 以上の整数は、素数の掛け算でただ 1 通りに表せる。',
    try: ['2 と 3 の指数を動かすと、約数がちょうど (指数 + 1) × (指数 + 1) 個の長方形に並ぶ。'],
    related: ['infinite-primes', 'euclid-algorithm', 'euler-totient'],
  },
  'fermat-little': {
    gist: '素数 p で割った余りの世界では、a を p − 1 回掛けると 1 に戻る。',
    try: ['a を変えると回り方は変わるが、どれも p − 1 の約数の回数で 1 に戻る。'],
    related: ['euler-totient', 'crt', 'roots-of-unity'],
  },
  'euler-totient': {
    gist: 'フェルマーの小定理を、素数でない数にも広げたもの。',
    try: ['n を素数にすると、1 以外のすべてが緑（互いに素）になり、φ(n) = n − 1。'],
    related: ['fermat-little', 'fundamental-arithmetic', 'crt'],
  },
  crt: {
    gist: '互いに素な数で割った余りの組から、元の数がただ 1 つに決まる。',
    try: ['m と n を互いに素でなくすると、表の中に一度も現れない組ができる。'],
    related: ['bezout', 'euclid-algorithm', 'fermat-little'],
  },
  'infinite-primes': {
    gist: '知っている素数を全部掛けて 1 を足すと、どれでも割り切れない数ができる。',
    try: ['n を 6 以上にすると、N は素数ではなくなるが、その素因数はリストにない新しい素数。'],
    related: ['fundamental-arithmetic', 'euclid-algorithm'],
  },
  'pythagorean-triples': {
    gist: '2 つの整数 m, n から、辺がすべて整数の直角三角形が作れる。',
    try: ['m, n を互いに素で偶奇が違うように選ぶと、3 辺に共通の約数がない（既約）。'],
    related: ['pythagoras', 'fundamental-arithmetic'],
  },

  /* ---------- 不等式 ---------- */
  'am-gm': {
    gist: '2 数の足し算の平均は、掛け算の平均より小さくならない。',
    try: ['a と b を等しくすると、2 つの平均がぴったり一致する（等号）。'],
    related: ['jensen', 'cauchy-schwarz', 'rearrangement'],
  },
  'cauchy-schwarz': {
    gist: '内積は、2 つの長さの積より大きくならない。',
    try: ['2 本の矢印を同じ直線の上にそろえると、緑と紫の棒が同じ長さになる（等号）。'],
    related: ['dot-product', 'triangle-inequality', 'am-gm'],
  },
  'triangle-inequality': {
    gist: '寄り道をすると、まっすぐ行くより遠くなる。',
    try: ['a と b を同じ向きにそろえると、回り道と近道が同じ長さになる（等号）。'],
    related: ['cauchy-schwarz', 'dot-product'],
  },
  jensen: {
    gist: '下に凸な関数では、平均の値は、値の平均より小さい。',
    try: ['λ を動かすと、弦の上の点がいつも曲線より上にある。'],
    related: ['am-gm', 'bernoulli', 'section-formula'],
  },
  bernoulli: {
    gist: '(1 + x)ⁿ は、x = 0 での接線 1 + nx より下に来ない。',
    try: ['n を 1 にすると、曲線と接線がぴったり重なる（等号）。'],
    related: ['binomial', 'jensen', 'tangent-line'],
  },
  rearrangement: {
    gist: '大きいもの同士を組むと積の和は最大、逆に組むと最小。',
    try: ['「同じ順」と「逆順」を切り替えると、面積の合計が最大値と最小値の両端に動く。'],
    related: ['am-gm', 'cauchy-schwarz', 'jensen'],
  },

  /* ---------- 複素数 ---------- */
  'euler-formula': {
    gist: 'e^{iθ} は、単位円の上で角 θ の点。指数関数と三角関数が 1 つにつながる。',
    try: ['θ を π まで動かすと、点がちょうど −1 に来る（e^{iπ} = −1）。'],
    related: ['de-moivre', 'pythagorean-identity', 'taylor'],
  },
  'de-moivre': {
    gist: '複素数の n 乗は、角を n 倍、長さを n 乗する。',
    try: ['z をドラッグして長さを 1 より大きく（小さく）すると、z, z², z³, … のらせんが外へ（内へ）広がる。長さを 1 にすると円の上を回る。'],
    related: ['euler-formula', 'polar-product', 'roots-of-unity'],
  },
  'polar-product': {
    gist: '複素数の掛け算は、長さの掛け算と角の足し算。',
    try: ['片方を長さ 1 の点にすると、掛け算がただの回転になる。'],
    related: ['de-moivre', 'rotation-matrix', 'euler-formula'],
  },
  'roots-of-unity': {
    gist: 'n 乗して 1 になる数は、単位円を n 等分する点に並ぶ。',
    try: ['n を変えると正 n 角形になり、橙の矢印をすべてつなぐと必ず原点に戻る（和が 0）。'],
    related: ['de-moivre', 'euler-formula', 'fundamental-algebra'],
  },
  'conjugate-roots': {
    gist: '係数が実数なら、虚数の解は実軸について対称な 2 つの組で出てくる。',
    try: ['c を大きくして判別式を負にすると、実軸の上の 2 点が、上下に対称な 2 点に分かれる。'],
    related: ['quadratic-formula', 'vieta', 'fundamental-algebra'],
  },
}
