/**
 * 定理の「なぜ成り立つか」。厳密な証明ではなく、筋道を 2〜4 文で。
 * 文の中の $...$ は数式として描く。
 */
const r = String.raw

export const PROOFS: Record<string, string> = {
  /* ---------- 代数・方程式 ---------- */
  'quadratic-formula': r`両辺を $a$ で割り、平方完成すると $\left(x+\frac{b}{2a}\right)^2=\frac{b^2-4ac}{4a^2}$ になる。両辺の平方根をとって $\frac{b}{2a}$ を移項すれば公式になる。`,
  vieta: r`解が $\alpha,\beta$ なら $ax^2+bx+c=a(x-\alpha)(x-\beta)$ と因数分解できる。右辺を展開して $a x^2-a(\alpha+\beta)x+a\alpha\beta$ とし、係数を比べると $\alpha+\beta=-\frac ba,\ \alpha\beta=\frac ca$。`,
  'factor-theorem': r`$P(x)$ を $x-a$ で割ると $P(x)=(x-a)Q(x)+R$（$R$ は定数）。$x=a$ を代入すると $P(a)=R$ なので、$P(a)=0$ と「余り 0（割り切れる）」は同じこと。`,
  'remainder-theorem': r`$P(x)=(x-a)Q(x)+R$ と書ける（1 次式で割った余りは定数）。$x=a$ を代入すると $(x-a)$ の項が消えて $P(a)=R$。`,
  binomial: r`$(a+b)^n=(a+b)(a+b)\cdots(a+b)$ を展開すると、各かっこから $a$ か $b$ を 1 つずつ選んで掛けた項が並ぶ。$b$ を $k$ 個選ぶ選び方は $ {}_n\mathrm{C}_k$ 通りなので、$a^{n-k}b^k$ の係数は $ {}_n\mathrm{C}_k$。`,
  'fundamental-algebra': r`「1 次以上の多項式は複素数の解を少なくとも 1 つもつ」ことが核心（証明には複素関数論などを使う）。解 $\alpha$ があれば因数定理で $(x-\alpha)$ をくくり出せ、次数が 1 つ下がるので、くり返すとちょうど $n$ 個の解（重複を含む）が出る。`,
  'completing-square': r`$a(x+h)^2=ax^2+2ahx+ah^2$ なので、$h=\frac{b}{2a}$ と選べば $x$ の項が $bx$ に一致する。余分な $ah^2=\frac{b^2}{4a}$ を引いて帳尻を合わせると、$c-\frac{b^2}{4a}$ が残る。`,
  'quadratic-inequality': r`$\alpha<\beta$ のとき、$(x-\alpha)(x-\beta)$ の符号は 2 つのかっこの符号で決まる。$x<\alpha$ ではどちらも負、$x>\beta$ ではどちらも正で積は正。間ではかっこの符号が違うので積は負。`,
  'log-properties': r`$M=a^p,\ N=a^q$ と置くと $MN=a^{p+q}$（指数法則）。両辺の対数をとると $\log_a MN=p+q=\log_a M+\log_a N$。累乗や底の変換も、指数法則を対数に言い直したもの。`,
  'abs-value': r`$|a|$ は $a$ が負のときだけ符号を変える。だから $y=|f(x)|$ は、$f(x)\ge0$ の部分はそのまま、$f(x)<0$ の部分は $-f(x)$（$x$ 軸について対称）になり、グラフでは下の部分が折り返される。`,

  /* ---------- 数列・極限 ---------- */
  'arithmetic-sum': r`和 $S$ を、前から並べたものと後ろから並べたものの 2 通りに書いて足す。縦に並んだ組はどれも「初項 + 末項」になり、それが $n$ 組なので $2S=n(a+l)$。`,
  'geometric-sum': r`$S=a+ar+\cdots+ar^{n-1}$ と、それに $r$ を掛けた $rS=ar+\cdots+ar^n$ を引くと、間の項が全部消えて $(1-r)S=a(1-r^n)$。$|r|<1$ なら $r^n\to0$ なので $S\to\frac{a}{1-r}$。`,
  'power-sums': r`$(k+1)^4-k^4=4k^3+6k^2+4k+1$ を $k=1$ から $n$ まで足すと、左辺は打ち消し合って $(n+1)^4-1$ になる。$\sum k^2,\ \sum k$ が分かっていれば、残る $\sum k^3$ が求まる（$\sum k^2$ も同じ方法で 3 乗から出せる）。`,
  induction: r`もし成り立たない $n$ があるとすると、その中で一番小さいもの $m$ がある。$m\neq1$ なので $m-1$ では成り立つが、すると「$k$ で成り立てば $k+1$ でも」から $m$ でも成り立ち、矛盾する。`,
  recurrence: r`$a_{n+1}=pa_n+q$ と $\alpha=p\alpha+q$ を引くと、$q$ が消えて $a_{n+1}-\alpha=p(a_n-\alpha)$。数列 $a_n-\alpha$ は公比 $p$ の等比数列なので $a_n-\alpha=(a_1-\alpha)p^{n-1}$。`,
  squeeze: r`$a_n$ と $c_n$ がともに $L$ に近づくなら、十分先では両方とも $L$ の近く（たとえば $\pm\varepsilon$ の範囲）にある。$b_n$ はその 2 つの間にあるので、同じ範囲に入るしかない。`,
  'monotone-convergence': r`上に有界な数の集まりには「上限」（一番小さい上界）がある、というのが実数の性質。増加し続ける数列は、上限より少し小さい値を超えたあとはずっと上限とその値の間にいるので、上限に収束する。`,
  'harmonic-series': r`$\frac1k$ は、$k\le x\le k+1$ で $\frac1x$ 以上。だから長方形の面積の和は曲線 $y=\frac1x$ の下の面積より大きく、$\sum_{k=1}^n\frac1k>\int_1^{n+1}\frac{dx}{x}=\log(n+1)\to\infty$。`,
  telescoping: r`$\frac1k-\frac1{k+1}=\frac{(k+1)-k}{k(k+1)}=\frac{1}{k(k+1)}$。和を書き並べると $-\frac12$ と次の項の $+\frac12$ のように隣どうしが消えて、最初の $1$ と最後の $-\frac1{n+1}$ だけが残る。`,
  'fibonacci-golden': r`比 $r_n=\frac{F_{n+1}}{F_n}$ は $r_{n+1}=1+\frac1{r_n}$ を満たす。収束するなら極限 $r$ は $r=1+\frac1r$、つまり $r^2=r+1$ の正の解 $\frac{1+\sqrt5}2$。実際、$r_n$ は極限の上下を交互にとりながら、差がどんどん小さくなる。`,

  /* ---------- 三角関数 ---------- */
  'pythagorean-identity': r`単位円上の点 $(\cos\theta,\sin\theta)$ は原点からの距離が 1 なので、三平方の定理より $\cos^2\theta+\sin^2\theta=1$。両辺を $\cos^2\theta$ で割ると $1+\tan^2\theta=\frac1{\cos^2\theta}$。`,
  'unit-circle-def': r`直角三角形の比で決めた $\sin,\cos$ は鋭角にしか使えない。単位円上の点の座標で決め直すと、鋭角では元の比と一致し、しかもどんな角にも広げられる（座標が負なら値も負）。`,
  'addition-formula': r`単位円上の 2 点 $A(\cos\alpha,\sin\alpha),\ B(\cos\beta,\sin\beta)$ の距離を 2 通りに計算する。座標から求めた $AB^2$ と、中心角 $\alpha-\beta$ を使って余弦定理で求めた $AB^2$ を比べると $\cos(\alpha-\beta)$ の公式が出る。残りは $\beta$ を $-\beta$ や $90^\circ-\beta$ に置き換えて作れる。`,
  'double-angle': r`加法定理で $\beta=\alpha$ とおくと $\sin2\alpha=2\sin\alpha\cos\alpha$、$\cos2\alpha=\cos^2\alpha-\sin^2\alpha$。$\sin^2+\cos^2=1$ で書き換えると $2\cos^2\alpha-1=1-2\sin^2\alpha$ の形になり、半角の公式はこれを逆に解いたもの。`,
  'harmonic-addition': r`点 $(a,b)$ の原点からの距離を $r=\sqrt{a^2+b^2}$、偏角を $\alpha$ とすると $a=r\cos\alpha,\ b=r\sin\alpha$。代入すると $a\sin\theta+b\cos\theta=r(\sin\theta\cos\alpha+\cos\theta\sin\alpha)=r\sin(\theta+\alpha)$（加法定理）。`,
  'product-to-sum': r`$\cos(\alpha-\beta)=\cos\alpha\cos\beta+\sin\alpha\sin\beta$ から $\cos(\alpha+\beta)=\cos\alpha\cos\beta-\sin\alpha\sin\beta$ を引くと $2\sin\alpha\sin\beta$ だけが残る。和積の公式は、$A=\alpha+\beta,\ B=\alpha-\beta$ と置き換えたもの。`,
  radian: r`半径 $r$ の円で、中心角に比例して弧が長くなる。半径と同じ長さの弧に対する角を 1 ラジアンと決めると、角 $\theta$ の弧は半径の $\theta$ 倍で $l=r\theta$。扇形の面積は円の面積 $\pi r^2$ の $\frac{\theta}{2\pi}$ 倍で $\frac12r^2\theta$。`,
  'law-of-sines': r`外接円の直径 $BD$ を引くと、円周角の定理より $\angle D=\angle A$、直径に対する円周角なので $\angle BCD=90^\circ$。直角三角形 $BCD$ で $a=BC=2R\sin D=2R\sin A$。ほかの辺も同じ。`,
  'law-of-cosines': r`$C$ を原点、$CB$ を $x$ 軸にとると $B(a,0),\ A(b\cos C,\ b\sin C)$。$c^2=AB^2=(a-b\cos C)^2+(b\sin C)^2$ を展開し、$\sin^2+\cos^2=1$ を使うと $a^2+b^2-2ab\cos C$。`,
  'triangle-area': r`辺 $a$ を底辺とすると、高さは $b\sin C$（$A$ から辺 $BC$ に下ろした垂線）。面積は $\frac12\times\text{底辺}\times\text{高さ}=\frac12ab\sin C$。`,

  /* ---------- 平面図形 ---------- */
  pythagoras: r`1 辺 $a+b$ の正方形の中に、直角三角形 4 つを回して並べると、真ん中に 1 辺 $c$ の正方形ができる。面積を 2 通りに書くと $(a+b)^2=4\cdot\frac12ab+c^2$ で、整理すると $a^2+b^2=c^2$。`,
  'median-theorem': r`M を原点、BC を $x$ 軸にとり、$B(-m,0),\ C(m,0),\ A(p,q)$ とする。$AB^2+AC^2=(p+m)^2+q^2+(p-m)^2+q^2=2(p^2+q^2+m^2)=2(AM^2+BM^2)$。`,
  centroid: r`位置ベクトルで、中線 $AM$ を $2:1$ に内分する点は $\frac{\vec a+2\cdot\frac{\vec b+\vec c}{2}}{3}=\frac{\vec a+\vec b+\vec c}{3}$。式が $a, b, c$ について対称なので、ほかの中線を $2:1$ に分ける点も同じ点になる。`,
  'inscribed-angle': r`中心 O と円周上の点 P を結ぶと、$OA=OP$ の二等辺三角形ができ、その外角（中心角の一部）は底角の 2 倍。直径をはさんで 2 つの部分に分けて足すと、中心角 = 円周角 × 2。円周角は弧だけで決まるので、どこでも等しい。`,
  'tangent-chord': r`A を通る直径 AD を引くと、接線と半径は垂直なので、接線と弦のなす角 $=90^\circ-\angle DAB$。一方、直径に対する円周角 $\angle ABD=90^\circ$ から $\angle ADB=90^\circ-\angle DAB$。$\angle ADB$ は弧 AB に対する円周角なので $\angle ACB$ と等しい。`,
  'power-of-point': r`P を通る 2 本の直線で、$\triangle PAC$ と $\triangle PDB$ を比べる。$\angle P$ は共通、$\angle PAC=\angle PDB$（同じ弧に対する円周角、または内接四角形の外角）なので相似。対応する辺の比から $PA:PD=PC:PB$、つまり $PA\cdot PB=PC\cdot PD$。`,
  menelaus: r`C を通って直線 DEF に平行な線を引き、AB との交点を G とする。平行線と比の関係で $\frac{BD}{DC}=\frac{BF}{FG},\ \frac{CE}{EA}=\frac{GF}{FA}$。これらと $\frac{AF}{FB}$ を掛けると、すべて約分されて 1 になる。`,
  ceva: r`$\frac{AF}{FB}$ は、底辺を共有する $\triangle APC$ と $\triangle BPC$ の面積比に等しい（高さの比が $AF:FB$）。3 つの比を同じように面積比に直して掛けると、$\triangle APB, \triangle BPC, \triangle CPA$ の面積が分子と分母に 1 回ずつ現れて約分され、1 になる。`,
  'angle-bisector': r`$\triangle ABD$ と $\triangle ACD$ は、AD を共有し、D から AB・AC までの距離が等しい（角の二等分線上の点）。面積比は $AB:AC$。一方、BC を底辺と見ると高さが共通なので面積比は $BD:DC$。2 つを比べて $BD:DC=AB:AC$。`,
  'similar-ratio': r`長さがすべて $k$ 倍の図形は、1 辺 1 の小さな正方形で埋めた図を、1 辺 $k$ の正方形で埋めたものに当たる。小さな正方形の面積は $k^2$ 倍になるので全体も $k^2$ 倍。立体なら小さな立方体の体積が $k^3$ 倍になる。`,
  incenter: r`内心 I は 3 辺から等距離 $r$ にある。I と 3 頂点を結ぶと三角形は 3 つに分かれ、それぞれ底辺 $a, b, c$、高さ $r$。面積を足すと $S=\frac12r(a+b+c)$ なので $r=\frac{2S}{a+b+c}$。`,
  'euler-line': r`外心 O を原点にとり $\vec h=\vec a+\vec b+\vec c$ と置くと、$\vec{AH}\cdot\vec{BC}=(\vec b+\vec c)\cdot(\vec c-\vec b)=|\vec c|^2-|\vec b|^2=0$（外接円の半径が等しい）なので H は垂心。重心は $\vec g=\frac{\vec a+\vec b+\vec c}{3}=\frac13\vec h$ なので、O, G, H は一直線上で $OG:GH=1:2$。`,
  heron: r`余弦定理で $\cos C$ を $a, b, c$ で表し、$\sin C=\sqrt{1-\cos^2C}$ を面積の公式 $\frac12ab\sin C$ に入れる。根号の中を 2 乗の差として 2 回因数分解すると $16S^2=(a+b+c)(-a+b+c)(a-b+c)(a+b-c)$ になり、$s$ を使って書くと公式になる。`,
  ptolemy: r`対角線 BD 上に、$\angle BAE=\angle CAD$ となる点 E をとる。円周角を使うと $\triangle ABE\sim\triangle ACD$、$\triangle AED\sim\triangle ABC$ が言える。2 組の相似から $BE=\frac{AB\cdot CD}{AC},\ ED=\frac{AD\cdot BC}{AC}$ で、足すと $BD$ になる。`,
  pick: r`格子の三角形で成り立つことを示し、多角形を三角形に分けて足すと、内部・辺上の点の数え方がうまく合う。三角形は、内部にも辺上にも格子点がない「最小の三角形」（面積 $\frac12$）に分けられ、その個数を点の数で数えると $2i+b-2$ になる。`,
  'euler-polyhedron': r`多面体の 1 つの面を取り除いて平面に広げると、$V-E+F$ は 1 減る。平面の図で、辺を 1 本消して面を 1 つ減らす操作をくり返しても $V-E+F$ は変わらず、最後に三角形 1 つ（$3-3+1=1$）になる。だから元は $1+1=2$。`,

  /* ---------- ベクトル・座標 ---------- */
  'dot-product': r`$|\vec b-\vec a|^2$ を 2 通りに書く。成分で展開すると $|\vec a|^2+|\vec b|^2-2(a_1b_1+a_2b_2)$、余弦定理で書くと $|\vec a|^2+|\vec b|^2-2|\vec a||\vec b|\cos\theta$。比べると、成分の式と $|\vec a||\vec b|\cos\theta$ が等しい。`,
  'point-line-distance': r`直線 $ax+by+c=0$ の法線ベクトルは $(a,b)$。点 $(p,q)$ から直線上の点 $(x_0,y_0)$ へのベクトルを法線の向きに正射影すると、その長さが距離で $\frac{|a(p-x_0)+b(q-y_0)|}{\sqrt{a^2+b^2}}=\frac{|ap+bq+c|}{\sqrt{a^2+b^2}}$。`,
  'section-formula': r`A から B へ $\frac{m}{m+n}$ だけ進んだ点なので $\vec a+\frac{m}{m+n}(\vec b-\vec a)=\frac{n\vec a+m\vec b}{m+n}$。外分は、B を越えた先まで進む（$m$ と $-n$ の比）と考える。`,
  'cross-area': r`三角形の面積 $\frac12|\vec a||\vec b|\sin\theta$ を 2 乗すると $\frac14(|\vec a|^2|\vec b|^2-(\vec a\cdot\vec b)^2)$。成分で計算すると $\frac14(a_1b_2-a_2b_1)^2$ になるので、平行四辺形の面積は $|a_1b_2-a_2b_1|$。`,
  projection: r`$\vec p=k\vec a$ と置き、$\vec b-\vec p$ が $\vec a$ と垂直になる $k$ を探す。$(\vec b-k\vec a)\cdot\vec a=0$ を解くと $k=\frac{\vec a\cdot\vec b}{|\vec a|^2}$。`,
  'vector-line': r`直線上の点 P は、点 A から方向ベクトル $\vec d$ と平行に進んだ先なので $\vec{AP}=t\vec d$。原点から見ると $\vec p=\vec a+t\vec d$。$t$ を消すと、ふつうの直線の式になる。`,
  'linear-independence': r`平面の点 $\vec p$ を $s\vec a+t\vec b$ と書くには、$\begin{pmatrix}a_1&b_1\\a_2&b_2\end{pmatrix}\begin{pmatrix}s\\t\end{pmatrix}=\vec p$ を解けばよい。行列式が 0 でなければ逆行列でただ 1 つ解ける。0 なら $\vec a, \vec b$ が平行で、その直線上の点しか作れない。`,

  /* ---------- 微分 ---------- */
  'derivative-def': r`2 点を結ぶ直線（割線）の傾き $\frac{f(x+h)-f(x)}{h}$ は、$h$ を小さくすると接線の傾きに近づく。導関数はその極限を、各点 $x$ ごとに求めて関数として並べたもの（定義なので、証明ではなく「こう決める」）。`,
  'tangent-line': r`接線は点 $(a,f(a))$ を通り、傾きは微分係数 $f'(a)$。傾き $m$ で点 $(x_1,y_1)$ を通る直線は $y-y_1=m(x-x_1)$ なので、そのまま当てはめる。`,
  'product-quotient': r`$f(x+h)g(x+h)-f(x)g(x)$ に $-f(x)g(x+h)+f(x)g(x+h)$ を足して、$\{f(x+h)-f(x)\}g(x+h)+f(x)\{g(x+h)-g(x)\}$ に分ける。$h$ で割って $h\to0$ とすると $f'g+fg'$。商は $f=\frac fg\cdot g$ に積の微分を使う。`,
  'chain-rule': r`$u=g(x)$ の変化 $\Delta u$ を使って $\frac{\Delta y}{\Delta x}=\frac{\Delta y}{\Delta u}\cdot\frac{\Delta u}{\Delta x}$ と分ける。$\Delta x\to0$ のとき $\Delta u\to0$ なので、それぞれの比が $f'(u)$ と $g'(x)$ に近づく（$\Delta u=0$ になる場合は少し工夫がいる）。`,
  'inverse-derivative': r`$x=f^{-1}(y)$ とすると $y=f(x)$。両辺を $y$ で微分すると、連鎖律で $1=f'(x)\cdot\frac{dx}{dy}$ なので $\frac{dx}{dy}=\frac{1}{f'(x)}$。グラフでは $y=x$ で折り返すと縦と横が入れかわり、傾きが逆数になる。`,
  rolle: r`閉区間で連続なので最大値と最小値がある。両方が端なら $f(a)=f(b)$ より関数は定数で、どこでも $f'=0$。そうでなければ、最大か最小が区間の内側の点 $c$ にあり、そこでは山の頂上（谷の底）なので $f'(c)=0$。`,
  'mean-value': r`$f$ から、両端を結ぶ直線を引いた $g(x)=f(x)-\left\{f(a)+\frac{f(b)-f(a)}{b-a}(x-a)\right\}$ を考えると $g(a)=g(b)=0$。ロルの定理で $g'(c)=0$ となる $c$ があり、それは $f'(c)=\frac{f(b)-f(a)}{b-a}$ のこと。`,
  ivt: r`$f(a)<k<f(b)$ とする。$f(x)<k$ となる $x$ の集まりの右の端（上限）を $c$ とすると、連続なので $f(c)<k$ でも $f(c)>k$ でも、$c$ の近くの点と矛盾する。だから $f(c)=k$。`,
  'extreme-value': r`閉区間で連続な関数の値は有界になり（そうでないと、どこかに値が限りなく大きくなる点が集まり、連続性に反する）、上限がある。上限に近づく点を選んでいくと、閉区間の中の点に集まり、連続性からその点で上限そのものの値をとる。`,
  monotonic: r`区間の 2 点 $x_1<x_2$ に平均値の定理を使うと $f(x_2)-f(x_1)=f'(c)(x_2-x_1)$。$f'>0$ なら右辺は正なので $f(x_2)>f(x_1)$、つまり増加。符号が正から負に変わる点では、増加から減少に変わるので極大。`,
  lhopital: r`$f(a)=g(a)=0$ のとき、コーシーの平均値の定理（平均値の定理を 2 つの関数に広げたもの）で $\frac{f(x)}{g(x)}=\frac{f(x)-f(a)}{g(x)-g(a)}=\frac{f'(c)}{g'(c)}$ となる $c$ が $a$ と $x$ の間にある。$x\to a$ なら $c\to a$。`,
  taylor: r`$f(x)=c_0+c_1x+c_2x^2+\cdots$ と書けると仮定し、両辺を $k$ 回微分して $x=0$ を代入すると $f^{(k)}(0)=k!\,c_k$。だから $c_k=\frac{f^{(k)}(0)}{k!}$。実際に一致することは、誤差（剰余項）が 0 に近づくことで確かめる。`,
  'newton-method': r`解の近くでは、曲線は接線とほぼ同じ。接線 $y=f(x_k)+f'(x_k)(x-x_k)$ が $x$ 軸と交わる点を次の近似にすると $x_{k+1}=x_k-\frac{f(x_k)}{f'(x_k)}$。誤差はおよそ前の誤差の 2 乗に比例して小さくなる。`,

  /* ---------- 積分 ---------- */
  ftc: r`$F(x)=\int_a^xf(t)\,dt$ とすると、$F(x+h)-F(x)$ は幅 $h$ の細い帯の面積で、ほぼ $f(x)\,h$。$h$ で割って $h\to0$ とすると $F'(x)=f(x)$。だから定積分は、原始関数の差で計算できる。`,
  substitution: r`$F'(u)=f(u)$ とすると、連鎖律で $\frac{d}{dx}F(g(x))=f(g(x))\,g'(x)$。両辺を積分すると $\int f(g(x))g'(x)\,dx=F(g(x))=\int f(u)\,du$（$u=g(x)$）。`,
  'by-parts': r`積の微分 $(fg)'=f'g+fg'$ の両辺を積分すると $fg=\int f'g\,dx+\int fg'\,dx$。移項すれば $\int fg'\,dx=fg-\int f'g\,dx$。`,
  'riemann-sum': r`区間を $n$ 等分して、各小区間の長方形の面積 $f(x_k)\Delta x$ を足す。関数が連続なら、$n$ を増やすと長方形の和と曲線の下の面積の差はいくらでも小さくなり、極限が定積分になる。`,
  'solid-revolution': r`$x$ で切った断面は半径 $f(x)$ の円で、面積 $\pi f(x)^2$。厚さ $\Delta x$ の薄い円板の体積 $\pi f(x)^2\Delta x$ を足して、区分求積と同じように極限をとると $\pi\int_a^b f(x)^2\,dx$。`,
  'area-between': r`$(x-\alpha)(x-\beta)=(x-\alpha)^2-(\beta-\alpha)(x-\alpha)$ と書き直して $\alpha$ から $\beta$ まで積分すると $\frac{(\beta-\alpha)^3}{3}-\frac{(\beta-\alpha)^3}{2}=-\frac{(\beta-\alpha)^3}{6}$。放物線と直線の差はこの形に $a$ を掛けたもの。`,
  'gaussian-integral': r`$I=\int e^{-x^2}dx$ の 2 乗を、平面全体での $\iint e^{-(x^2+y^2)}dx\,dy$ と見る。極座標に直すと $\int_0^{2\pi}\int_0^\infty e^{-r^2}r\,dr\,d\theta=2\pi\cdot\frac12=\pi$。だから $I=\sqrt\pi$。`,
  'arc-length': r`曲線を短い線分に分けると、1 本の長さは三平方の定理で $\sqrt{\Delta x^2+\Delta y^2}=\sqrt{1+\left(\frac{\Delta y}{\Delta x}\right)^2}\Delta x$。分け方を細かくすると $\frac{\Delta y}{\Delta x}\to f'(x)$ で、和が積分になる。`,
  'odd-even-integral': r`$\int_{-a}^0f(x)\,dx$ で $x=-t$ と置換すると $\int_0^af(-t)\,dt$。偶関数なら $f(-t)=f(t)$ で右半分と同じ値、奇関数なら $-f(t)$ で右半分を打ち消す。`,

  /* ---------- 線形代数 ---------- */
  'inverse-matrix': r`$A\begin{pmatrix}d&-b\\-c&a\end{pmatrix}=\begin{pmatrix}ad-bc&0\\0&ad-bc\end{pmatrix}$ と計算できる。$ad-bc\neq0$ なら $\frac{1}{ad-bc}$ を掛ければ単位行列になる。$ad-bc=0$ のときは平面が線につぶれ、元に戻す行列はない。`,
  'det-product': r`$\det A$ は「A で移したときの面積の倍率」（向きも込み）。B で移して面積が $\det B$ 倍、さらに A で $\det A$ 倍になるので、AB による倍率は積 $\det A\det B$。`,
  'rotation-matrix': r`基本ベクトル $(1,0)$ を $\theta$ 回すと $(\cos\theta,\sin\theta)$、$(0,1)$ を回すと $(-\sin\theta,\cos\theta)$。行列の列はこの 2 つの行き先なので $R(\theta)$ の形になる。$\alpha$ 回してから $\beta$ 回すと $\alpha+\beta$ 回すことになり、積を計算すると加法定理が出る。`,
  'rank-solution': r`$A\vec x$ は A の列ベクトルの組み合わせ。だから $A\vec x=\vec b$ が解をもつのは、$\vec b$ が列ベクトルの組み合わせで作れるとき。それは、$\vec b$ を列に加えても独立な列の数（ランク）が増えないことと同じ。`,
  'rank-nullity': r`$A\vec x=\vec0$ を掃き出し法で解くと、先頭の 1 がある列（rank A 個）の文字は決まり、残りの $n-\operatorname{rank}A$ 個の文字は自由に選べる。自由に選べる文字の数が、解の空間（核）の次元。`,
  'cayley-hamilton': r`$A^2=\begin{pmatrix}a^2+bc&ab+bd\\ca+dc&cb+d^2\end{pmatrix}$ を計算し、$-(a+d)A+(ad-bc)E$ を足すと、どの成分も打ち消し合って 0 になる。$n\times n$ でも、固有多項式に $A$ を代入すると $O$ になる。`,
  diagonalization: r`固有ベクトルを並べた行列を $P$ とすると、$AP$ の各列は $\lambda_i$ 倍された固有ベクトルなので $AP=P\,\mathrm{diag}(\lambda_i)$。$P$ が逆行列をもてば $P^{-1}AP=\mathrm{diag}(\lambda_i)$。$A^n=P\,\mathrm{diag}(\lambda_i^n)P^{-1}$ は、間の $P^{-1}P$ が消えることから。`,
  spectral: r`対称行列では $(A\vec u)\cdot\vec v=\vec u\cdot(A\vec v)$。固有値 $\lambda\neq\mu$ の固有ベクトルで計算すると $\lambda\,\vec u\cdot\vec v=\mu\,\vec u\cdot\vec v$ なので $\vec u\cdot\vec v=0$（直交）。固有値が実数になることも同じ考え方で示せる。`,

  /* ---------- 確率・統計 ---------- */
  'inclusion-exclusion': r`$A$ と $B$ を足すと、両方に入る部分 $A\cap B$ を 2 回数えている。1 回分を引けば正しい個数になる。3 つの場合は、2 つずつの重なりを引きすぎた分（3 つ全部の重なり）を足し戻す。`,
  conditional: r`B が起きたと分かったら、全体を B に絞る。その中で A も起きている割合が $P(A|B)=\frac{P(A\cap B)}{P(B)}$。分母を払うと乗法定理 $P(A\cap B)=P(B)P(A|B)$。`,
  bayes: r`$P(A\cap B)$ を 2 通りに書くと $P(B)P(A|B)=P(A)P(B|A)$。両辺を $P(B)$ で割ればベイズの定理。分母の $P(B)$ は、原因ごとに分けて $\sum P(A_i)P(B|A_i)$ と計算する。`,
  'monty-hall': r`最初に選んだ扉が当たりの確率は $\frac13$ で、司会者が扉を開けてもこれは変わらない。最初が外れ（確率 $\frac23$）なら、司会者はもう 1 つの外れを開けるしかないので、残った扉は必ず当たり。だから選び直すと $\frac23$。`,
  'linearity-expectation': r`期待値は「値 × 確率」の和。$aX+bY$ の値ごとに分けて足す代わりに、各結果 $\omega$ ごとに $aX(\omega)+bY(\omega)$ を足すと、和を分けて $a\sum X(\omega)P+b\sum Y(\omega)P$ にできる。独立かどうかは使っていない。`,
  variance: r`$V[X]=E[(X-\mu)^2]=E[X^2-2\mu X+\mu^2]$。期待値の線形性で $E[X^2]-2\mu E[X]+\mu^2=E[X^2]-\mu^2$。$aX+b$ は平均も $a\mu+b$ にずれるので、平均からの差は $a(X-\mu)$ で、2 乗すると $a^2$ 倍。`,
  'binomial-dist': r`$n$ 回のうちどの $k$ 回が成功かの選び方が $ {}_n\mathrm{C}_k$ 通りあり、どの並びも確率は $p^k(1-p)^{n-k}$（独立なので掛ける）。足すと公式になる。平均 $np$ は、1 回ごとの成功（0 か 1）の期待値 $p$ を $n$ 回足したもの。`,
  lln: r`平均 $\bar X_n$ の分散は $\frac{\sigma^2}{n}$（独立な和の分散は足し算、$\frac1n$ 倍で $\frac1{n^2}$ 倍）。チェビシェフの不等式で、$\bar X_n$ が $\mu$ から $\varepsilon$ 以上離れる確率は $\frac{\sigma^2}{n\varepsilon^2}$ 以下で、$n\to\infty$ で 0。`,
  clt: r`標準化した和の「モーメント母関数」（または特性関数）を計算すると、$n\to\infty$ で $e^{t^2/2}$ に近づく。これは標準正規分布の母関数そのものなので、分布も正規分布に近づく。元の分布の形は、高次の項として消えていく。`,
  chebyshev: r`$V[X]=E[(X-\mu)^2]$ の和のうち、$|X-\mu|\ge k\sigma$ の部分だけを残すと、そこでは $(X-\mu)^2\ge k^2\sigma^2$。だから $\sigma^2\ge k^2\sigma^2P(|X-\mu|\ge k\sigma)$ で、両辺を $k^2\sigma^2$ で割る。`,
  'normal-distribution': r`標準化 $Z=\frac{X-\mu}{\sigma}$ で、どんな正規分布も標準正規分布に直る。$P(|Z|\le1)$ は $\int_{-1}^1\frac{1}{\sqrt{2\pi}}e^{-z^2/2}dz\approx0.6827$ を数値計算した値（2, 3 も同様）。`,
  birthday: r`「全員の誕生日が違う」確率を先に求める。2 人目が 1 人目と違う確率 $\frac{364}{365}$、3 人目が前の 2 人と違う確率 $\frac{363}{365}$、… と掛けていき、1 から引く。2 人の組が $\frac{n(n-1)}{2}$ 組もあるので、意外に早く 50% を超える。`,
  'confidence-interval': r`中心極限定理で $\bar X$ はほぼ $N\left(\mu,\frac{\sigma^2}{n}\right)$ に従うので、$P\left(|\bar X-\mu|\le1.96\frac{\sigma}{\sqrt n}\right)\approx0.95$。不等式を $\mu$ について解き直すと信頼区間の形になる。`,
  poisson: r`二項分布 $ {}_n\mathrm{C}_kp^k(1-p)^{n-k}$ で $p=\frac\lambda n$ とおき、$n\to\infty$ とする。$ {}_n\mathrm{C}_k\,p^k\to\frac{\lambda^k}{k!}$、$(1-\frac\lambda n)^{n-k}\to e^{-\lambda}$ なので、ポアソン分布の式になる。`,

  /* ---------- 整数・数論 ---------- */
  'euclid-algorithm': r`$a=bq+r$ のとき、$a$ と $b$ の公約数は $r=a-bq$ も割り切る。逆に $b$ と $r$ の公約数は $a=bq+r$ を割り切る。公約数の集まりが同じなので、最大公約数も同じ。余りは減り続けるので、必ず終わる。`,
  bezout: r`$ax+by$ の形で表せる正の数のうち、一番小さいものを $d$ とする。$a$ を $d$ で割った余りも $ax+by$ の形になり、$d$ より小さいので 0 しかありえない。だから $d$ は $a$ と $b$ の公約数で、どの公約数も $d$ を割り切るので $d=\gcd(a,b)$。`,
  'fundamental-arithmetic': r`分けられるのは、素数でなければ 2 つの小さな数の積に分けられ、それをくり返すと素数だけになるから。ただ 1 通りなのは、「素数 $p$ が積 $ab$ を割り切れば、$a$ か $b$ を割り切る」（ベズーの等式から示せる）を使って、両方の分け方の素数を 1 つずつ消していけるから。`,
  'fermat-little': r`$a, 2a, \ldots, (p-1)a$ を $p$ で割った余りは、$1, 2, \ldots, p-1$ の並べ替えになる（同じ余りが出ると $p$ が差を割り切って矛盾）。全部掛けると $a^{p-1}(p-1)!\equiv(p-1)!$ で、$(p-1)!$ は $p$ と互いに素なので割れる。`,
  'euler-totient': r`フェルマーの小定理と同じ考え方で、$n$ と互いに素な $\varphi(n)$ 個の数 $r_1,\ldots,r_{\varphi(n)}$ に $a$ を掛けると、余りは同じ $\varphi(n)$ 個の並べ替えになる。全部掛けて比べると $a^{\varphi(n)}\equiv1$。`,
  crt: r`$m$ と $n$ が互いに素なら、ベズーの等式で $mu+nv=1$ となる整数がある。$x=a\cdot nv+b\cdot mu$ とすると、$m$ で割った余りは $a$、$n$ で割った余りは $b$。2 つの解の差は $m$ でも $n$ でも割り切れるので、$mn$ の倍数。`,
  'infinite-primes': r`素数が $p_1,\ldots,p_n$ だけだとする。$N=p_1\cdots p_n+1$ はどの $p_i$ で割っても 1 余る。でも $N\ge2$ はどれかの素数で割り切れるはずなので、リストにない素数がある。矛盾。`,
  'pythagorean-triples': r`$(m^2-n^2)^2+(2mn)^2=m^4-2m^2n^2+n^4+4m^2n^2=(m^2+n^2)^2$ と展開して確かめられる。逆に既約なものがこの形に限ることは、$c^2-a^2=b^2$ を $(c-a)(c+a)$ と分けて、それぞれが平方数になることから示す。`,
  'mod-arithmetic': r`$a\equiv a'$ は $a-a'$ が $m$ の倍数ということ。$(a+b)-(a'+b')=(a-a')+(b-b')$ も $m$ の倍数。積は $ab-a'b'=a(b-b')+b'(a-a')$ と分けると、どちらの項も $m$ の倍数。`,
  wilson: r`$p$ が素数なら、$1$ から $p-1$ のどの $k$ にも、掛けて $1$ になる相手 $k'$ がただ 1 つある。自分自身が相手になるのは $k^2\equiv1$、つまり $k=1, p-1$ だけ。残りは 2 つずつ組になって消え、$(p-1)!\equiv1\cdot(p-1)\equiv-1$。`,
  divisibility: r`$10\equiv1\pmod9$ なので $10^k\equiv1$。$n=\sum d_k10^k\equiv\sum d_k$ で、9 で割った余りは各位の和と同じ（3 も同様）。$10\equiv-1\pmod{11}$ なので、11 では $\sum d_k(-1)^k$、つまり交互の和になる。`,

  /* ---------- 不等式 ---------- */
  'am-gm': r`$\frac{a+b}{2}-\sqrt{ab}=\frac{(\sqrt a-\sqrt b)^2}{2}\ge0$。2 乗は負にならないので、相加平均は相乗平均以上。等号は $\sqrt a=\sqrt b$、つまり $a=b$ のとき。`,
  'power-mean': r`相乗 ≤ 相加は相加・相乗平均の不等式。調和平均は $\frac{2ab}{a+b}=\frac{ab}{\frac{a+b}{2}}\le\frac{ab}{\sqrt{ab}}=\sqrt{ab}$。二乗平均は $\frac{a^2+b^2}{2}-\left(\frac{a+b}{2}\right)^2=\frac{(a-b)^2}{4}\ge0$ から。`,
  'cauchy-schwarz': r`どんな $t$ でも $(a_1t-b_1)^2+(a_2t-b_2)^2\ge0$。$t$ の 2 次式として展開すると、いつも 0 以上なので判別式が 0 以下。その式を整理すると $(a_1b_1+a_2b_2)^2\le(a_1^2+a_2^2)(b_1^2+b_2^2)$。`,
  'triangle-inequality': r`$|\vec a+\vec b|^2=|\vec a|^2+2\vec a\cdot\vec b+|\vec b|^2\le|\vec a|^2+2|\vec a||\vec b|+|\vec b|^2=(|\vec a|+|\vec b|)^2$（コーシー・シュワルツ）。両辺は 0 以上なので、2 乗を外してよい。`,
  jensen: r`下に凸な関数では、グラフ上の 2 点を結ぶ弦が、間でいつもグラフより上にある。$\lambda f(x_1)+(1-\lambda)f(x_2)$ は弦の上の点の高さ、$f(\lambda x_1+(1-\lambda)x_2)$ はその真下のグラフの高さなので、後者が小さい。`,
  bernoulli: r`$n$ についての帰納法。$(1+x)^{n+1}=(1+x)^n(1+x)\ge(1+nx)(1+x)=1+(n+1)x+nx^2\ge1+(n+1)x$（$1+x\ge0$ なので不等号の向きが保たれる）。`,
  rearrangement: r`同じ順に並んでいない組 $a_i<a_j,\ b_{\sigma(i)}>b_{\sigma(j)}$ があれば、相手を入れかえると和は $(a_j-a_i)(b_{\sigma(i)}-b_{\sigma(j)})>0$ だけ増える。入れかえをくり返すと同じ順になるので、同じ順が最大。逆順が最小なのも同じ考え方。`,

  /* ---------- 複素数 ---------- */
  'euler-formula': r`$e^x,\ \cos x,\ \sin x$ のテイラー展開に $x=i\theta$ を入れて、$i^2=-1$ を使って実部と虚部に分ける。実部は $1-\frac{\theta^2}{2!}+\cdots=\cos\theta$、虚部は $\theta-\frac{\theta^3}{3!}+\cdots=\sin\theta$ になる。`,
  'de-moivre': r`極形式の積で、掛けると長さは掛け算・角は足し算になる。$\cos\theta+i\sin\theta$ を $n$ 回掛けると、角が $n$ 回足されて $n\theta$。オイラーの公式で書けば $(e^{i\theta})^n=e^{in\theta}$ そのもの。`,
  'polar-product': r`$z_1z_2=r_1r_2(\cos\theta_1+i\sin\theta_1)(\cos\theta_2+i\sin\theta_2)$ を展開すると、実部は $\cos\theta_1\cos\theta_2-\sin\theta_1\sin\theta_2=\cos(\theta_1+\theta_2)$、虚部は $\sin(\theta_1+\theta_2)$（加法定理）。`,
  'roots-of-unity': r`$z=re^{i\theta}$ とおくと $z^n=r^ne^{in\theta}=1$ から $r=1$、$n\theta=2\pi k$。$\theta=\frac{2\pi k}{n}$（$k=0,\ldots,n-1$）で $n$ 個。和は公比 $\omega$ の等比数列の和 $\frac{1-\omega^n}{1-\omega}=0$（$\omega^n=1$）。`,
  'conjugate-roots': r`係数がすべて実数なら、方程式の共役をとっても同じ方程式になる（$\overline{az^2+bz+c}=a\bar z^2+b\bar z+c$）。だから $z$ が解なら $\bar z$ も解。2 次方程式なら解の公式の $\pm\sqrt{\text{負の数}}$ からも直接わかる。`,
  'complex-locus': r`$|z-\alpha|$ は複素数平面での $z$ と $\alpha$ の距離。「$\alpha$ からの距離が $r$」の点の集まりは円。「$\alpha$ と $\beta$ から等距離」の点の集まりは、2 点を結ぶ線分の垂直二等分線（平面図形での性質と同じ）。`,
}
