/* =========================================================
   PROPRIEDADES — FUNÇÕES
   Responsável: Integrante 1
   Cada item: t = título, f = fórmula (HTML), d = quando usar,
   c = verificação numérica feita pelo app (ver base/props.js).
   ========================================================= */
(() => {
  const { fr, lim, I, S, fn, br } = PROPS.h;
  PROPS.register('funcoes', {
      sub: 'Propriedades de potências, logaritmos, módulo, trigonometria e funções polinomiais usadas para simplificar e resolver as funções do jogo.',
      slider: { min: -3, max: 3, step: 0.25, val: 1.5, label: 'Testar com x =' },
      cats: {
        'Potências': [
          { t: 'Produto de mesma base', f: 'a<sup>m</sup> · a<sup>n</sup> = a<sup>m+n</sup>', d: 'Somam-se os expoentes. Ex.: aplicar dois bônus de +20% em sequência: 1,2<sup>3</sup>·1,2<sup>2</sup> = 1,2<sup>5</sup>.', c: { k: 'eq', l: 'x^3*x^2', r: 'x^5' } },
          { t: 'Quociente de mesma base', f: `${fr('a<sup>m</sup>', 'a<sup>n</sup>')} = a<sup>m−n</sup>`, d: 'Subtraem-se os expoentes (a ≠ 0). Compara o HP de dois níveis: HP(10)/HP(7) = 1,2<sup>3</sup>.', c: { k: 'eq', l: 'x^5/x^2', r: 'x^3', cond: 'x ≠ 0' } },
          { t: 'Potência de potência', f: '(a<sup>m</sup>)<sup>n</sup> = a<sup>m·n</sup>', d: 'Multiplicam-se os expoentes.', c: { k: 'eq', l: '(x^2)^3', r: 'x^6' } },
          { t: 'Potência de um produto', f: '(a·b)<sup>n</sup> = a<sup>n</sup>·b<sup>n</sup>', d: 'O expoente vale para cada fator. Dobrar o tamanho de um objeto multiplica a área por 2² = 4.', c: { k: 'eq', l: '(2x)^3', r: '8x^3' } },
          { t: 'Expoente negativo', f: `a<sup>−n</sup> = ${fr('1', 'a<sup>n</sup>')}`, d: 'Expoente negativo é o inverso (a ≠ 0). Atração 1/d² = d<sup>−2</sup>.', c: { k: 'eq', l: 'x^(-2)', r: '1/x^2', cond: 'x ≠ 0' } },
          { t: 'Expoente fracionário', f: 'a<sup>m/n</sup> = <sup>n</sup><span class="sq">√</span>(a<sup>m</sup>)', d: 'Raízes são potências: <span class="sq">√</span>x = x<sup>1/2</sup>, ∛x = x<sup>1/3</sup>.', c: { k: 'eq', l: 'x^(1/2)', r: 'sqrt(x)', cond: 'x ≥ 0' } },
          { t: 'Expoente zero', f: 'a<sup>0</sup> = 1  (a ≠ 0)', d: 'No nível 0 o HP é o valor inicial: HP₀·1,2<sup>0</sup> = HP₀.', c: { k: 'eq', l: 'x^0', r: '1', cond: 'x ≠ 0' } },
        ],
        'Exponenciais e logaritmos': [
          { t: 'Log do produto', f: 'log<sub>b</sub>(x·y) = log<sub>b</sub>x + log<sub>b</sub>y', d: 'Transforma multiplicação em soma (x, y > 0).', c: { k: 'eq', l: 'ln(3x)', r: 'ln(3) + ln(x)', cond: 'x > 0' } },
          { t: 'Log do quociente', f: `log<sub>b</sub>${fr('x', 'y')} = log<sub>b</sub>x − log<sub>b</sub>y`, d: 'Transforma divisão em subtração. Usado em L(xp) = 1 + log₂(xp/100).', c: { k: 'eq', l: 'ln(x/2)', r: 'ln(x) - ln(2)', cond: 'x > 0' } },
          { t: 'Log da potência', f: 'log<sub>b</sub>(x<sup>n</sup>) = n·log<sub>b</sub>x', d: 'O expoente “desce” multiplicando. É assim que se resolve 1,2<sup>n</sup> = 2 ⇒ n = ln 2 / ln 1,2.', c: { k: 'eq', l: 'ln(x^3)', r: '3ln(x)', cond: 'x > 0' } },
          { t: 'Mudança de base', f: `log<sub>b</sub>x = ${fr('ln x', 'ln b')}`, d: 'Calcula log em qualquer base com ln. O app usa isso para log₂.', c: { k: 'eq', l: 'log(x)', r: 'ln(x)/ln(10)', cond: 'x > 0' } },
          { t: 'Funções inversas', f: 'e<sup>ln x</sup> = x  e  ln(e<sup>x</sup>) = x', d: 'Exponencial e logaritmo se desfazem. Por isso o nível (log) é a inversa do XP necessário (exponencial).', c: { k: 'eq', l: 'e^(ln(x))', r: 'x', cond: 'x > 0' } },
          { t: 'Produto de exponenciais', f: 'e<sup>a</sup>·e<sup>b</sup> = e<sup>a+b</sup>', d: 'Mesma regra das potências, com base e ≈ 2,718.', c: { k: 'eq', l: 'e^x*e^2', r: 'e^(x+2)' } },
          { t: 'Valores especiais', f: 'log<sub>b</sub>1 = 0   log<sub>b</sub>b = 1', d: 'No XP inicial (xp = xp₀) o log vale 0 e o jogador está no nível 1.', c: { k: 'eq', l: 'ln(1) + ln(e)', r: '1' } },
        ],
        'Módulo': [
          { t: 'Definição', f: '|x| = x se x ≥ 0;  |x| = −x se x < 0', d: 'O módulo é a distância até zero, por isso |x| ≥ 0 sempre.', c: { k: 'eq', l: 'abs(x)', r: 'sqrt(x^2)' } },
          { t: 'Módulo do produto', f: '|a·b| = |a|·|b|', d: 'Pode-se separar os fatores.', c: { k: 'eq', l: 'abs(-3x)', r: '3abs(x)' } },
          { t: 'Simetria da distância', f: '|a − b| = |b − a|', d: 'A distância do jogador ao checkpoint é a mesma nos dois sentidos.', c: { k: 'eq', l: 'abs(x - 1)', r: 'abs(1 - x)' } },
          { t: 'Desigualdade triangular', f: '|a + b| ≤ |a| + |b|', d: 'Andar em dois trechos nunca é mais curto que a distância direta.', c: { k: 'le', l: 'abs(x + 2)', r: 'abs(x) + 2' } },
        ],
        'Trigonometria': [
          { t: 'Relação fundamental', f: 'sen²x + cos²x = 1', d: 'Vale para todo x. Base de movimentos circulares (órbitas, rodas).', c: { k: 'eq', l: 'sin(x)^2 + cos(x)^2', r: '1' } },
          { t: 'Tangente', f: `tg x = ${fr('sen x', 'cos x')}`, d: 'Definida quando cos x ≠ 0. Usada no ângulo de lançamento do projétil.', c: { k: 'eq', l: 'tan(x)', r: 'sin(x)/cos(x)', cond: 'cos x ≠ 0' } },
          { t: 'Periodicidade', f: 'sen(x + 2π) = sen x', d: 'O movimento se repete a cada período; a moeda flutuante volta à mesma altura.', c: { k: 'eq', l: 'sin(x + 2pi)', r: 'sin(x)' } },
          { t: 'Paridade', f: 'sen(−x) = −sen x   cos(−x) = cos x', d: 'Seno é ímpar e cosseno é par.', c: { k: 'eq', l: 'sin(-x)', r: '-sin(x)' } },
          { t: 'Arco duplo', f: 'sen(2x) = 2·sen x·cos x', d: 'Simplifica produtos de seno e cosseno.', c: { k: 'eq', l: 'sin(2x)', r: '2sin(x)cos(x)' } },
          { t: 'Defasagem', f: 'sen(x + π/2) = cos x', d: 'Cosseno é o seno adiantado de 1/4 de volta.', c: { k: 'eq', l: 'sin(x + pi/2)', r: 'cos(x)' } },
          { t: 'Imagem limitada', f: '−1 ≤ sen x ≤ 1', d: 'Logo y₀ + A·sen(ωt) fica entre y₀ − A e y₀ + A.', c: { k: 'le', l: 'abs(sin(x))', r: '1' } },
        ],
        'Afim e quadrática': [
          { t: 'Coeficiente angular', f: `a = ${fr('Δy', 'Δx')} = ${fr('y₂ − y₁', 'x₂ − x₁')}`, d: 'Na posição x(t) = x₀ + v·t, o coeficiente angular é a velocidade.', c: { k: 'info', txt: 'Ex.: o personagem estava em 5 m em t = 0 e em 25 m em t = 5 s ⇒ a = 20/5 = 4 m/s.' } },
          { t: 'Discriminante e Bhaskara', f: `Δ = b² − 4ac   x = ${fr('−b ± <span class="sq">√</span>Δ', '2a')}`, d: 'Δ > 0: duas raízes; Δ = 0: uma; Δ < 0: nenhuma real. O alcance do projétil é a raiz positiva.', c: { k: 'eq', l: '(4 + sqrt(16 - 4*1*3))/2', r: '3', fixed: true, txt: 'x² − 4x + 3: Δ = 4 ⇒ x = (4 ± 2)/2 ⇒ raízes 1 e 3' } },
          { t: 'Vértice', f: `x<sub>v</sub> = ${fr('−b', '2a')}   y<sub>v</sub> = ${fr('−Δ', '4a')}`, d: 'O vértice é o ponto mais alto do projétil (a < 0).', c: { k: 'eq', l: 'x^2 - 4x + 3', r: '(x - 2)^2 - 1', txt: 'forma canônica: vértice em (2; −1)' } },
          { t: 'Forma fatorada', f: 'ax² + bx + c = a(x − x₁)(x − x₂)', d: 'Escreve a parábola a partir das raízes.', c: { k: 'eq', l: 'x^2 - 4x + 3', r: '(x - 1)(x - 3)' } },
          { t: 'Concavidade', f: 'a > 0 ⇒ ∪   a < 0 ⇒ ∩', d: 'No projétil a = −g/(2v₀²cos²θ) < 0: parábola para baixo com máximo.', c: { k: 'info', txt: 'y(x) = −0,0245x² + x: a < 0, portanto concavidade para baixo.' } },
        ],
      },
    });
})();
