/**
 * 定理の主張の式を、部品ごとに説明する。
 * 各部品の TeX は、主張の式の中にそのまま現れる部分（光らせるときに、同じ文字列を探して色を付ける）。
 * 説明の中の $...$ は数式として描く。
 */
const r = String.raw

export type Part = [tex: string, desc: string]

export const PARTS: Record<string, Part[]> = {
  /* ---------- 代数・方程式 ---------- */
  'quadratic-formula': [
    [r`ax^2+bx+c=0`, '解きたい 2 次方程式。$a\\neq0$'],
    [r`-b`, '1 次の係数の符号を変えたもの。2 つの解の真ん中（軸）は $-\\frac{b}{2a}$'],
    [r`\pm`, '+ と − の 2 通り。解が 2 つ出る理由'],
    [r`b^2-4ac`, '判別式 $D$。正なら 2 つの実数解、0 なら重解、負なら実数解なし'],
    [r`2a`, '分母。$x^2$ の係数の 2 倍'],
  ],
  vieta: [
    [r`\alpha,\beta`, '2 次方程式の 2 つの解（虚数でもよい）'],
    [r`\alpha+\beta=-\frac{b}{a}`, '解の和。1 次の係数 ÷ 2 次の係数に、マイナスを付けたもの'],
    [r`\alpha\beta=\frac{c}{a}`, '解の積。定数項 ÷ 2 次の係数'],
  ],
  'factor-theorem': [
    [r`P(a)=0`, '多項式 $P(x)$ に $x=a$ を代入すると 0 になる'],
    [r`(x-a)`, '1 次式の因数。$a$ が解なら、この形の因数をもつ'],
  ],
  'remainder-theorem': [
    [r`P(x)`, '割られる多項式'],
    [r`(x-a)`, '割る 1 次式'],
    [r`P(a)`, '$x=a$ を代入した値。これが余りになる'],
  ],
  binomial: [
    [r`(a+b)^n`, '展開したい式。$(a+b)$ を $n$ 個掛けたもの'],
    [r`\sum_{k=0}^{n}`, '$k=0, 1, \\ldots, n$ の項をすべて足す'],
    [r`\binom{n}{k}`, '二項係数 ${}_n\\mathrm{C}_k$。$n$ 個のかっこから $b$ を $k$ 個選ぶ選び方の数'],
    [r`a^{n-k}b^{k}`, '$b$ を $k$ 個、残りの $n-k$ 個から $a$ を選んで掛けた項'],
  ],
  'completing-square': [
    [r`ax^2+bx+c`, '元の 2 次式'],
    [r`\left(x+\frac{b}{2a}\right)^2`, '2 乗の形。$x=-\\frac{b}{2a}$ で 0 になり、そこが頂点（軸）'],
    [r`-\frac{b^2-4ac}{4a}`, '頂点の高さ（$y$ 座標）。判別式 $b^2-4ac$ が入っている'],
  ],
  'quadratic-inequality': [
    [r`\alpha<\beta`, '2 次方程式 $(x-\\alpha)(x-\\beta)=0$ の 2 つの解。小さい方が $\\alpha$'],
    [r`(x-\alpha)(x-\beta)>0`, 'グラフが $x$ 軸より上にある範囲を求める式'],
    [r`x<\alpha,\ \beta<x`, '答え: 2 つの解の外側'],
    [r`\alpha<x<\beta`, '答え: 2 つの解の間'],
  ],
  'log-properties': [
    [r`\log_a`, '底が $a$ の対数。「$a$ を何乗すると、その数になるか」'],
    [r`\log_a MN=\log_a M+\log_a N`, '積の対数は、対数の和'],
    [r`\log_a M^r=r\log_a M`, '累乗の指数は、前に出せる'],
    [r`\log_a b=\frac{\log_c b}{\log_c a}`, '底の変換。好きな底 $c$ に直せる'],
  ],
  'abs-value': [
    [r`|a|`, '$a$ の絶対値。数直線上の 0 からの距離'],
    [r`(a<0)`, '$a$ が負のときは、符号を変えた $-a$ にする（正になる）'],
    [r`y=|f(x)|`, 'グラフの $x$ 軸より下の部分を、上に折り返した形'],
  ],

  /* ---------- 数列・極限 ---------- */
  'arithmetic-sum': [
    [r`S_n`, '初項から第 $n$ 項までの和'],
    [r`a_1+a_n`, '初項と末項の和。前後から組にすると、どの組もこの値'],
    [r`d`, '公差（隣の項との差）'],
  ],
  'geometric-sum': [
    [r`S_n=\frac{a(1-r^n)}{1-r}`, '初項 $a$、公比 $r$ の等比数列の、第 $n$ 項までの和'],
    [r`\sum_{k=0}^{\infty}ar^k`, '無限に足した和（無限等比級数）'],
    [r`(|r|<1)`, '無限に足しても有限の値になる条件。$r^n$ が 0 に近づく'],
  ],
  'power-sums': [
    [r`\sum_{k=1}^n k`, '$1+2+\\cdots+n$'],
    [r`\sum_{k=1}^n k^2`, '$1^2+2^2+\\cdots+n^2$'],
    [r`\sum_{k=1}^n k^3`, '$1^3+2^3+\\cdots+n^3$。答えは $1+2+\\cdots+n$ の 2 乗'],
  ],
  induction: [
    [r`P(1)`, '最初の場合（$n=1$）で成り立つ'],
    [r`P(k)\Rightarrow P(k+1)`, '$k$ で成り立てば、次の $k+1$ でも成り立つ'],
    [r`P(n)`, '結論: すべての自然数で成り立つ'],
  ],
  recurrence: [
    [r`a_{n+1}=pa_n+q`, '漸化式。前の項を $p$ 倍して $q$ を足すと次の項'],
    [r`\alpha=p\alpha+q`, '特性方程式。漸化式の $a_n, a_{n+1}$ を $\\alpha$ に置き換えたもの'],
    [r`p(a_n-\alpha)`, '$\\alpha$ との差が、毎回 $p$ 倍になる（等比数列）'],
    [r`a_n=\alpha+(a_1-\alpha)p^{\,n-1}`, '一般項'],
  ],
  squeeze: [
    [r`a_n\le c_n\le b_n`, '$c_n$ が、$a_n$ と $b_n$ にはさまれている'],
    [r`\lim a_n=\lim b_n=\alpha`, '両側が同じ値 $\\alpha$ に近づく'],
    [r`\lim c_n=\alpha`, '結論: はさまれた $c_n$ も $\\alpha$ に近づく'],
  ],
  'harmonic-series': [
    [r`\sum_{k=1}^{\infty}\frac1k`, '調和級数。$\\frac1k$ を限りなく足したもの'],
    [r`=\infty`, '限りなく大きくなる（発散）'],
    [r`\log(n+1)`, '和をはさむ下の値。$y=\\frac1x$ の下の面積'],
  ],
  telescoping: [
    [r`\frac{1}{k(k+1)}=\frac1k-\frac1{k+1}`, '部分分数分解。1 つの分数を 2 つの差に分ける'],
    [r`1-\frac1{n+1}`, '和の結果。最初の $1$ と最後の $-\\frac1{n+1}$ だけが残る'],
  ],
  'fibonacci-golden': [
    [r`F_{n+2}=F_{n+1}+F_n`, 'フィボナッチ数列の漸化式。前の 2 つを足すと次'],
    [r`\frac{F_{n+1}}{F_n}`, '隣り合う項の比'],
    [r`\varphi=\frac{1+\sqrt5}{2}`, '黄金比 $1.618\\ldots$。$x^2=x+1$ の正の解'],
  ],

  /* ---------- 三角関数 ---------- */
  'pythagorean-identity': [
    [r`\sin^2\theta+\cos^2\theta=1`, '単位円上の点 $(\\cos\\theta, \\sin\\theta)$ に三平方の定理を使ったもの'],
    [r`\tan\theta=\frac{\sin\theta}{\cos\theta}`, 'tan は「傾き」。原点と点を結ぶ直線の傾き'],
    [r`1+\tan^2\theta=\frac{1}{\cos^2\theta}`, '1 つ目の式を $\\cos^2\\theta$ で割ったもの'],
  ],
  'unit-circle-def': [
    [r`P=(\cos\theta,\ \sin\theta)`, '単位円上の点の座標。$x$ 座標が cos、$y$ 座標が sin'],
    [r`\tan\theta=\frac{\sin\theta}{\cos\theta}`, '原点と P を結ぶ直線の傾き'],
  ],
  'addition-formula': [
    [r`\sin(\alpha\pm\beta)`, '2 つの角を足した（引いた）角の sin'],
    [r`\sin\alpha\cos\beta\pm\cos\alpha\sin\beta`, 'sin と cos を「たすき掛け」して足す（引く）'],
    [r`\cos\alpha\cos\beta\mp\sin\alpha\sin\beta`, 'cos は同じもの同士を掛け、符号は逆（∓）'],
  ],
  'double-angle': [
    [r`\sin2\theta=2\sin\theta\cos\theta`, '加法定理で $\\beta=\\theta$ としたもの'],
    [r`\cos2\theta=1-2\sin^2\theta=2\cos^2\theta-1`, 'cos の 2 倍角。sin だけ・cos だけの形にもできる'],
    [r`\sin^2\frac{\theta}{2}=\frac{1-\cos\theta}{2}`, '半角の公式。2 倍角の式を逆に解いたもの'],
  ],
  'harmonic-addition': [
    [r`a\sin\theta+b\cos\theta`, '同じ周期の sin と cos の和'],
    [r`\sqrt{a^2+b^2}`, '振幅。点 $(a, b)$ の原点からの距離'],
    [r`\sin(\theta+\alpha)`, '1 つの sin の波。$\\alpha$ だけずれている'],
    [r`\cos\alpha=\frac{a}{\sqrt{a^2+b^2}}`, '$\\alpha$ は点 $(a, b)$ の偏角'],
  ],
  'product-to-sum': [
    [r`\sin\alpha\sin\beta`, '三角関数の積'],
    [r`\cos(\alpha+\beta)-\cos(\alpha-\beta)`, '角の和と差の cos。積が「足し算」に変わる'],
    [r`\sin A+\sin B`, '三角関数の和（和積の公式）'],
  ],
  radian: [
    [r`\pi\ \text{rad}=180^\circ`, '半円が $\\pi$ ラジアン。度との換算'],
    [r`l=r\theta`, '弧の長さ = 半径 × 中心角（ラジアン）'],
    [r`S=\frac12r^2\theta`, '扇形の面積'],
  ],
  'law-of-sines': [
    [r`\frac{a}{\sin A}`, '辺 $a$ と、その向かいの角 $A$ の sin の比'],
    [r`2R`, '外接円の直径。どの組の比もこの値'],
  ],
  'law-of-cosines': [
    [r`a^2`, '求めたい辺の 2 乗'],
    [r`b^2+c^2`, '残り 2 辺の 2 乗の和。ここまでなら三平方の定理'],
    [r`-2bc\cos A`, '直角でないぶんの補正。$A=90^\\circ$ なら 0'],
  ],
  'triangle-area': [
    [r`S=\frac12 ab\sin C`, '2 辺とその間の角から面積。$b\\sin C$ が高さ'],
    [r`\sqrt{s(s-a)(s-b)(s-c)}`, 'ヘロンの公式。3 辺だけで面積'],
    [r`s=\frac{a+b+c}{2}`, '周の長さの半分'],
  ],

  /* ---------- 平面図形 ---------- */
  pythagoras: [
    [r`\angle C=90^\circ`, '直角三角形（直角は $C$）'],
    [r`a^2+b^2`, '直角をはさむ 2 辺の正方形の面積の和'],
    [r`c^2`, '斜辺の正方形の面積'],
  ],
  'median-theorem': [
    [r`AB^2+AC^2`, '2 辺の 2 乗の和'],
    [r`AM^2`, '中線（頂点と向かいの辺の中点を結ぶ線）の 2 乗'],
    [r`BM^2`, '底辺の半分の 2 乗'],
  ],
  centroid: [
    [r`\frac{x_A+x_B+x_C}{3}`, '3 頂点の $x$ 座標の平均'],
    [r`AG:GM=2:1`, '重心は中線を頂点側から 2:1 に分ける'],
  ],
  'power-of-point': [
    [r`PA\cdot PB`, '点 P を通る 1 本目の直線と円の 2 交点までの長さの積'],
    [r`PC\cdot PD`, '2 本目の直線での積。1 本目と等しい'],
    [r`PT^2`, '接線のときは、接点までの長さの 2 乗'],
  ],
  menelaus: [
    [r`\frac{AF}{FB}`, '辺 AB を直線が分ける比'],
    [r`\frac{BD}{DC}`, '辺 BC（の延長）を分ける比'],
    [r`\frac{CE}{EA}`, '辺 CA を分ける比。A → B → C → A と一周する順に並べる'],
    [r`=1`, '3 つの比の積は必ず 1'],
  ],
  ceva: [
    [r`\frac{AF}{FB}`, '辺 AB を、C からの線が分ける比'],
    [r`\frac{BD}{DC}`, '辺 BC を、A からの線が分ける比'],
    [r`\frac{CE}{EA}`, '辺 CA を、B からの線が分ける比'],
    [r`=1`, '3 本が 1 点で交わるとき、積は 1'],
  ],
  'angle-bisector': [
    [r`BD:DC`, '二等分線が向かいの辺を分ける比'],
    [r`AB:AC`, '角をはさむ 2 辺の比。これと等しい'],
  ],
  'tangent-chord': [
    [r`\angle(\text{接線},\ AB)`, '接線と弦 AB のなす角'],
    [r`\angle ACB`, '弦 AB に対する円周角（反対側の弧の上の点 C から見た角）'],
  ],
  heron: [
    [r`S`, '三角形の面積'],
    [r`s(s-a)(s-b)(s-c)`, '半周 $s$ と、そこから各辺を引いた数の積'],
    [r`s=\frac{a+b+c}{2}`, '周の長さの半分'],
  ],
  ptolemy: [
    [r`AC\cdot BD`, '2 本の対角線の積'],
    [r`AB\cdot CD`, '向かい合う 1 組目の辺の積'],
    [r`AD\cdot BC`, '向かい合う 2 組目の辺の積'],
  ],
  pick: [
    [r`S`, '多角形の面積'],
    [r`i`, '内部にある格子点の数'],
    [r`\frac b2`, '辺の上にある格子点の数の半分'],
  ],
  'euler-polyhedron': [
    [r`V`, '頂点の数（vertex）'],
    [r`E`, '辺の数（edge）'],
    [r`F`, '面の数（face）'],
  ],
  'similar-ratio': [
    [r`1:k`, '長さの比（相似比）'],
    [r`1:k^2`, '面積は 2 方向に伸びるので $k^2$ 倍'],
    [r`1:k^3`, '体積は 3 方向に伸びるので $k^3$ 倍'],
  ],
  incenter: [
    [r`r=\frac{2S}{a+b+c}`, '内接円の半径。面積 $S$ の 2 倍を周の長さで割る'],
    [r`I=\frac{a\vec A+b\vec B+c\vec C}{a+b+c}`, '内心の位置。向かいの辺の長さで重みをつけた平均'],
  ],
  'euler-line': [
    [r`O`, '外心（3 頂点を通る円の中心）'],
    [r`G`, '重心（中線の交点）'],
    [r`H`, '垂心（頂点から向かいの辺に下ろした垂線の交点）'],
    [r`OG:GH=1:2`, '3 点の間隔の比'],
  ],

  /* ---------- ベクトル・座標 ---------- */
  'dot-product': [
    [r`\vec a\cdot\vec b`, '内積。2 つのベクトルから 1 つの数を作る'],
    [r`|\vec a||\vec b|\cos\theta`, '長さの積 × なす角の cos。向きがそろうほど大きい'],
    [r`a_1b_1+a_2b_2`, '成分ごとに掛けて足したもの。計算はこちらが楽'],
  ],
  'point-line-distance': [
    [r`|ax_0+by_0+c|`, '直線の式に点の座標を入れた値（の絶対値）'],
    [r`\sqrt{a^2+b^2}`, '法線ベクトル $(a, b)$ の長さ'],
  ],
  'section-formula': [
    [r`\frac{n\vec a+m\vec b}{m+n}`, 'A と B を m:n に分ける点。遠い方の比で重みをつける'],
    [r`\frac{\vec a+\vec b+\vec c}{3}`, '重心。3 頂点の平均'],
  ],
  'cross-area': [
    [r`|a_1b_2-a_2b_1|`, 'たすき掛けの差。2 つのベクトルが作る平行四辺形の面積'],
    [r`\frac12`, '三角形はその半分'],
  ],
  projection: [
    [r`\frac{\vec a\cdot\vec b}{|\vec a|^2}`, '$\\vec a$ の何倍かを表す数'],
    [r`(\vec b-\vec p)\perp\vec a`, '影との差は $\\vec a$ と直角'],
  ],
  'vector-line': [
    [r`\vec a`, '直線が通る 1 点（の位置ベクトル）'],
    [r`t\,\vec d`, '方向ベクトルの $t$ 倍。$t$ を動かすと直線の上を進む'],
  ],
  'linear-independence': [
    [r`s\vec a+t\vec b=\vec0`, '組み合わせて 0 になる'],
    [r`s=t=0`, 'それは両方の係数が 0 のときだけ'],
    [r`\det(\vec a\ \vec b)\neq0`, '2 本が作る平行四辺形の面積が 0 でない（平行でない）'],
  ],

  /* ---------- 微分 ---------- */
  'derivative-def': [
    [r`f'(x)`, '導関数。各点での接線の傾き'],
    [r`f(x+h)-f(x)`, '$x$ を $h$ だけ増やしたときの $y$ の増え方'],
    [r`\lim_{h\to0}`, '$h$ を 0 に限りなく近づける'],
  ],
  'tangent-line': [
    [r`f(a)`, '接点の $y$ 座標'],
    [r`f'(a)`, '接線の傾き（微分係数）'],
    [r`(x-a)`, '接点からの横の距離'],
  ],
  'product-quotient': [
    [r`(fg)'=f'g+fg'`, '積の微分。片方ずつ微分して足す'],
    [r`\frac{f'g-fg'}{g^2}`, '商の微分。分子は引き算、分母は $g$ の 2 乗'],
  ],
  'chain-rule': [
    [r`\frac{dy}{du}`, '外側の関数の微分（中身 $u$ で微分）'],
    [r`\frac{du}{dx}`, '中身の微分'],
    [r`f'(g(x))\,g'(x)`, '外の微分 × 中の微分'],
  ],
  'inverse-derivative': [
    [r`\frac{dx}{dy}`, '逆関数の微分（$y$ で微分）'],
    [r`\frac{1}{\dfrac{dy}{dx}}`, '元の関数の微分の逆数'],
  ],
  'mean-value': [
    [r`\frac{f(b)-f(a)}{b-a}`, '両端を結ぶ直線の傾き（平均の変化率）'],
    [r`f'(c)`, '間のある点 $c$ での接線の傾き'],
    [r`(a<c<b)`, '$c$ は区間の内側'],
  ],
  rolle: [
    [r`f(a)=f(b)`, '両端の高さが同じ'],
    [r`f'(c)=0`, '接線が水平な点がある'],
  ],
  ivt: [
    [r`f(a)<k<f(b)`, '$k$ は両端の値の間'],
    [r`f(c)=k`, 'ちょうど $k$ になる点 $c$ がある'],
  ],
  monotonic: [
    [r`f'>0`, '導関数が正 → 上り坂'],
    [r`f'(a)=0`, '傾きが 0。符号が変われば山か谷'],
    [r`f''>0`, '2 回微分が正 → 下に凸（傾きが増えていく）'],
  ],
  lhopital: [
    [r`\frac{f(x)}{g(x)}`, '分子・分母がどちらも 0（または ∞）に近づく比'],
    [r`\frac{f'(x)}{g'(x)}`, 'それぞれを微分した比。同じ極限になる'],
  ],
  taylor: [
    [r`\frac{f^{(n)}(a)}{n!}`, '$n$ 次の係数。$n$ 回微分した値を $n!$ で割る'],
    [r`(x-a)^n`, '中心 $a$ からの距離の $n$ 乗'],
    [r`\sin x=x-\frac{x^3}{3!}+\frac{x^5}{5!}-\cdots`, '$a=0$ の例。sin は奇数乗だけ'],
  ],
  'newton-method': [
    [r`x_{k+1}`, '次の近似値'],
    [r`\frac{f(x_k)}{f'(x_k)}`, '今の値での高さ ÷ 接線の傾き。接線が $x$ 軸と交わるまでの横の距離'],
  ],

  /* ---------- 積分 ---------- */
  ftc: [
    [r`\int_a^x f(t)\,dt`, '$a$ から $x$ までの面積を、$x$ の関数と見たもの'],
    [r`\frac{d}{dx}`, 'それを微分すると、元の $f(x)$ に戻る'],
    [r`F(b)-F(a)`, '原始関数 $F$（微分すると $f$）の差で定積分が求まる'],
  ],
  substitution: [
    [r`f(g(x))\,g'(x)`, '中身 $g(x)$ と、中身の微分が並んでいる形'],
    [r`\int f(u)\,du`, '$u=g(x)$ と置き換えた、簡単な積分'],
  ],
  'by-parts': [
    [r`\int f\,g'\,dx`, '積の積分。$g\'$ は積分しやすい方'],
    [r`fg`, '片方を積分した積'],
    [r`\int f'\,g\,dx`, '残りの積分。$f$ を微分した分、易しくなる'],
  ],
  'riemann-sum': [
    [r`\frac1n`, '細い長方形の幅'],
    [r`f\!\left(\frac kn\right)`, '長方形の高さ'],
    [r`\int_0^1 f(x)\,dx`, '幅を限りなく細くしたときの面積'],
  ],
  'solid-revolution': [
    [r`\pi`, '円の面積の $\\pi$'],
    [r`\{f(x)\}^2`, '断面の円の半径の 2 乗'],
    [r`\,dx`, '薄い円板の厚さ'],
  ],
  'area-between': [
    [r`(x-\alpha)(x-\beta)`, '2 つの交点 $\\alpha, \\beta$ で 0 になる 2 次式'],
    [r`-\frac{(\beta-\alpha)^3}{6}`, '面積は交点の幅の 3 乗だけで決まる'],
  ],
  'gaussian-integral': [
    [r`e^{-x^2}`, '釣り鐘形の関数（正規分布の形）'],
    [r`\sqrt\pi`, '実数全体で積分した面積'],
  ],
  'arc-length': [
    [r`\sqrt{1+\{f'(x)\}^2}`, '横に $dx$ 進んだときの曲線の長さ（三平方の定理）'],
    [r`\left(\frac{dx}{dt}\right)^2+\left(\frac{dy}{dt}\right)^2`, '媒介変数のときの速さの 2 乗'],
  ],
  'odd-even-integral': [
    [r`f(-x)=f(x)`, '偶関数（y 軸について対称）'],
    [r`2\int_0^{a}f\,dx`, '右半分を 2 倍すればよい'],
    [r`f(-x)=-f(x)`, '奇関数（原点について対称）。正と負が打ち消して 0'],
  ],

  /* ---------- 線形代数 ---------- */
  'inverse-matrix': [
    [r`\det A\ne0`, '行列式が 0 でない。面積がつぶれない'],
    [r`\frac{1}{ad-bc}`, '行列式で割る'],
    [r`\begin{pmatrix}d&-b\\-c&a\end{pmatrix}`, '対角を入れかえ、残りの符号を変えた行列'],
  ],
  'det-product': [
    [r`\det(AB)`, '2 回移したときの面積の倍率'],
    [r`\det A\cdot\det B`, 'それぞれの倍率の積'],
  ],
  'rotation-matrix': [
    [r`R(\theta)`, '原点のまわりに $\\theta$ 回す行列'],
    [r`R(\alpha)R(\beta)=R(\alpha+\beta)`, '続けて回すと、角が足し算'],
  ],
  'rank-solution': [
    [r`\operatorname{rank}A`, '係数行列の、独立な行（列）の数'],
    [r`\operatorname{rank}(A\,|\,\vec b)`, '右辺を加えた行列のランク。増えなければ解がある'],
  ],
  'rank-nullity': [
    [r`\dim\operatorname{Ker}A`, 'A で 0 に移る（つぶれる）方向の次元'],
    [r`\operatorname{rank}A`, '移した先に残る方向の次元'],
    [r`n`, '元の空間の次元（列の数）'],
  ],
  'cayley-hamilton': [
    [r`(a+d)`, 'トレース（対角成分の和）'],
    [r`(ad-bc)`, '行列式'],
    [r`O`, '零行列。行列が自分の特性方程式を満たす'],
  ],
  diagonalization: [
    [r`A\vec v=\lambda\vec v`, '固有ベクトル $\\vec v$ は、A で移しても向きが変わらず $\\lambda$ 倍されるだけ'],
    [r`P^{-1}AP`, '固有ベクトルを並べた $P$ で座標を取り替える'],
    [r`A^n=P\,\mathrm{diag}(\lambda_i^n)\,P^{-1}`, '対角行列なら $n$ 乗は各成分の $n$ 乗で済む'],
  ],
  spectral: [
    [r`A^{\mathsf T}=A`, '対称行列（対角線について折り返して同じ）'],
    [r`Q\Lambda Q^{\mathsf T}`, '直交行列 $Q$（回転・折り返し）と、対角行列 $\\Lambda$（固有値）に分けられる'],
  ],

  /* ---------- 確率・統計 ---------- */
  'inclusion-exclusion': [
    [r`P(A\cup B)`, 'A または B が起きる確率'],
    [r`P(A)+P(B)`, '別々の確率を足す（重なりを 2 回数えている）'],
    [r`-P(A\cap B)`, '2 回数えた重なりを 1 回分引く'],
  ],
  conditional: [
    [r`P(A\cap B)`, 'A と B が両方起きる確率'],
    [r`P(B\mid A)`, 'A が起きたと分かったときの B の確率'],
  ],
  bayes: [
    [r`P(A\mid B)`, '事後確率。B が起きたと分かったあとの A の確率'],
    [r`P(B\mid A)\,P(A)`, '「A が原因で B が起きる」確率（尤度 × 事前確率）'],
    [r`P(A)`, '事前確率。B を知る前の A の確率'],
    [r`P(B)`, 'B が起きる確率全体。原因ごとに分けて足す'],
    [r`P(B\mid \bar A)P(\bar A)`, 'A でないのに B が起きる分（偽陽性など）'],
  ],
  'monty-hall': [
    [r`\frac23`, '最初の選択が外れの確率。そのとき選び直すと必ず当たる'],
    [r`\frac13`, '最初の選択が当たりの確率'],
  ],
  'linearity-expectation': [
    [r`E[aX+bY]`, '組み合わせた量の平均'],
    [r`aE[X]+bE[Y]`, 'それぞれの平均を同じように組み合わせたもの'],
  ],
  variance: [
    [r`E[X^2]`, '2 乗の平均'],
    [r`(E[X])^2`, '平均の 2 乗'],
    [r`a^2V[X]`, '$a$ 倍すると散らばりは $a^2$ 倍。$b$ だけずらしても変わらない'],
  ],
  'binomial-dist': [
    [r`\binom nk`, '$n$ 回のうち、どの $k$ 回が成功かの選び方'],
    [r`p^k(1-p)^{n-k}`, '成功 $k$ 回・失敗 $n-k$ 回の確率'],
    [r`np`, '平均の成功回数'],
  ],
  lln: [
    [r`\bar X_n`, '$n$ 回の平均（標本平均）'],
    [r`\mu`, '本当の平均（母平均）'],
  ],
  clt: [
    [r`\bar X_n-\mu`, '標本平均と本当の平均のずれ'],
    [r`\sigma/\sqrt n`, '標本平均のばらつき。$n$ が大きいほど小さい'],
    [r`N(0,1)`, '標準正規分布'],
  ],
  chebyshev: [
    [r`|X-\mu|\ge k\sigma`, '平均から標準偏差の $k$ 倍以上離れる'],
    [r`\frac1{k^2}`, 'その確率の上限。分布の形によらない'],
  ],
  'normal-distribution': [
    [r`N(\mu,\sigma^2)`, '平均 $\\mu$、分散 $\\sigma^2$ の正規分布'],
    [r`P(|X-\mu|\le\sigma)\approx68\%`, '平均 ±1σ に約 68%'],
    [r`P(|X-\mu|\le2\sigma)\approx95\%`, '平均 ±2σ に約 95%'],
  ],
  birthday: [
    [r`\frac{364}{365}`, '2 人目が 1 人目と違う誕生日の確率'],
    [r`1-`, '「全員違う」の余事象'],
    [r`P(23)\approx50.7\%`, '23 人で 50% を超える'],
  ],
  'confidence-interval': [
    [r`\bar X`, '標本平均（測った平均）'],
    [r`1.96`, '正規分布で 95% が入る範囲の端'],
    [r`\frac{\sigma}{\sqrt n}`, '標本平均のばらつき（標準誤差）'],
  ],
  poisson: [
    [r`\lambda`, '平均の回数'],
    [r`\frac{\lambda^k}{k!}`, 'ちょうど $k$ 回起きる重み'],
    [r`e^{-\lambda}`, '全体を 1 にそろえる係数（0 回の確率）'],
  ],

  /* ---------- 整数・数論 ---------- */
  'euclid-algorithm': [
    [r`\gcd(a,b)`, '$a$ と $b$ の最大公約数'],
    [r`a \bmod b`, '$a$ を $b$ で割った余り。これに置き換えても最大公約数は同じ'],
  ],
  bezout: [
    [r`ax+by`, '$a$ と $b$ の整数倍の組み合わせ'],
    [r`\gcd(a,b)`, '最大公約数。組み合わせでちょうど作れる'],
  ],
  'fundamental-arithmetic': [
    [r`p_1^{e_1}p_2^{e_2}\cdots p_k^{e_k}`, '素数の累乗の積（素因数分解）'],
  ],
  'fermat-little': [
    [r`a^{p-1}`, '$a$ を $p-1$ 回掛けたもの'],
    [r`\equiv1`, '$p$ で割った余りが 1'],
    [r`\pmod p`, '素数 $p$ で割った余りで考える'],
  ],
  'euler-totient': [
    [r`\gcd(a,n)=1`, '$a$ と $n$ が互いに素'],
    [r`\varphi(n)`, '1〜$n$ のうち、$n$ と互いに素な数の個数'],
  ],
  crt: [
    [r`x\equiv a \pmod m`, '$m$ で割った余りが $a$'],
    [r`x\equiv b \pmod n`, '$n$ で割った余りが $b$'],
  ],
  'infinite-primes': [
    [r`p_1p_2\cdots p_n`, '知っている素数をすべて掛けた数'],
    [r`+1`, '1 を足すと、どの $p_i$ で割っても 1 余る'],
  ],
  'pythagorean-triples': [
    [r`m^2-n^2`, '1 辺目'],
    [r`2mn`, '2 辺目'],
    [r`m^2+n^2`, '斜辺'],
  ],
  'mod-arithmetic': [
    [r`a\equiv a'`, '$a$ と $a\'$ は、$m$ で割った余りが同じ'],
    [r`a+b\equiv a'+b'`, '和の余りは、余りどうしの和の余り'],
    [r`ab\equiv a'b'`, '積も同じ'],
  ],
  wilson: [
    [r`(p-1)!`, '1 から $p-1$ までの積'],
    [r`\equiv-1`, '$p$ で割った余りが $p-1$'],
  ],
  divisibility: [
    [r`\text{各位の数の和が}\ 3\ (9)\ \text{の倍数}`, '$10\\equiv1 \\pmod 9$ なので、各位を足しても余りは同じ'],
    [r`\text{交互の和が}\ 11\ \text{の倍数}`, '$10\\equiv-1 \\pmod{11}$ なので、位ごとに足し引きを交互に'],
  ],

  /* ---------- 不等式 ---------- */
  'am-gm': [
    [r`\frac{a+b}{2}`, '相加平均（足して割る）'],
    [r`\sqrt{ab}`, '相乗平均（掛けて根号）'],
    [r`a=b`, '等号が成り立つとき'],
  ],
  'power-mean': [
    [r`\frac{2ab}{a+b}`, '調和平均（逆数の平均の逆数）。平均の速さなど'],
    [r`\sqrt{ab}`, '相乗平均。平均の伸び率など'],
    [r`\frac{a+b}{2}`, '相加平均'],
    [r`\sqrt{\frac{a^2+b^2}{2}}`, '二乗平均'],
  ],
  'cauchy-schwarz': [
    [r`(a_1b_1+a_2b_2)^2`, '内積の 2 乗'],
    [r`(a_1^2+a_2^2)(b_1^2+b_2^2)`, '長さの 2 乗の積'],
  ],
  'triangle-inequality': [
    [r`|a+b|`, 'まっすぐ行った距離'],
    [r`|a|+|b|`, '寄り道した距離'],
  ],
  jensen: [
    [r`f\!\left(\frac{x_1+\cdots+x_n}{n}\right)`, '平均での値'],
    [r`\frac{f(x_1)+\cdots+f(x_n)}{n}`, '値の平均。下に凸なら、こちらが大きい'],
  ],
  bernoulli: [
    [r`(1+x)^n`, '曲線'],
    [r`1+nx`, '$x=0$ での接線'],
  ],
  rearrangement: [
    [r`\sum a_ib_{n+1-i}`, '逆の順に組んだ和（最小）'],
    [r`\sum a_ib_{\sigma(i)}`, '好きな順に組んだ和'],
    [r`\sum a_ib_i`, '同じ順に組んだ和（最大）'],
  ],

  /* ---------- 複素数 ---------- */
  'euler-formula': [
    [r`e^{i\theta}`, '複素数の指数関数'],
    [r`\cos\theta+i\sin\theta`, '単位円の上の、角 $\\theta$ の点'],
    [r`e^{i\pi}+1=0`, '$\\theta=\\pi$ とした式。$e, i, \\pi, 1, 0$ がそろう'],
  ],
  'de-moivre': [
    [r`(\cos\theta+i\sin\theta)^n`, '単位円の上の点を $n$ 乗'],
    [r`\cos n\theta+i\sin n\theta`, '角を $n$ 倍した点'],
  ],
  'polar-product': [
    [r`r_1r_2`, '長さは掛け算'],
    [r`\theta_1+\theta_2`, '角は足し算'],
  ],
  'roots-of-unity': [
    [r`z^n=1`, '$n$ 乗して 1 になる数'],
    [r`\omega=e^{2\pi i/n}`, '単位円を $n$ 等分した 1 つ目の点'],
    [r`1+\omega+\cdots+\omega^{n-1}=0`, '全部足すと 0（正 $n$ 角形の重心が原点）'],
  ],
  'conjugate-roots': [
    [r`b^2-4ac<0`, '判別式が負（実数解がない）'],
    [r`\sqrt{4ac-b^2}\,i`, '虚部。$\\pm$ で符号だけが違う 2 つの解'],
  ],
  'complex-locus': [
    [r`|z-\alpha|`, '$z$ と $\\alpha$ の距離'],
    [r`|z-\alpha|=|z-\beta|`, '2 点から等距離'],
  ],
}

/** 主張の式の中で、部品と同じ文字列に色を付ける（\operatorname などの命令の名前の中は除く） */
export function highlight(statement: string, part: string, color: string): string {
  // 細い空白（\,）の有無だけが違う書き方も、同じ部品として光らせる
  const forms = [...new Set([part, part.replace(/\\,/g, '')])].sort((x, y) => y.length - x.length)
  let out = ''
  let i = 0
  while (i < statement.length) {
    const hit = forms.find((f) => statement.startsWith(f, i))
    if (hit && hit !== part && !/\\[A-Za-z]*$/.test(statement.slice(0, i))) {
      out += `{\\textcolor{${color}}{${hit}}}`
      i += hit.length
      continue
    }
    const inCommand = /\\[A-Za-z]*$/.test(statement.slice(0, i)) && /[A-Za-z]/.test(statement[i])
    // 部品が文字で終わるなら、すぐ後ろに文字が続く所（別の名前の一部）は除く
    const tail = statement[i + part.length]
    const cutsWord = /[A-Za-z]$/.test(part) && tail !== undefined && /[A-Za-z]/.test(tail) && part.length === 1
    if (!inCommand && !cutsWord && statement.startsWith(part, i)) {
      out += `{\\textcolor{${color}}{${part}}}`
      i += part.length
    } else {
      out += statement[i]
      i++
    }
  }
  return out
}
