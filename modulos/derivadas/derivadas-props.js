/* =========================================================
   PROPRIEDADES — DERIVADAS
   Responsável: Integrante 3
   Cada item: t = título, f = fórmula (HTML), d = quando usar,
   c = verificação numérica feita pelo app (ver base/props.js).
   ========================================================= */
(() => {
  const { fr, lim, I, S, fn, br } = PROPS.h;
  PROPS.register('derivadas', {
      sub: 'Tabela de derivadas imediatas, regras operatórias e propriedades de interpretação. Cada linha é conferida comparando a derivada calculada pelo app com a fórmula da tabela.',
      slider: { min: 0.25, max: 3, step: 0.25, val: 1, label: 'Testar com x =' },
      cats: {
        'Derivadas imediatas': [
          { t: 'Constante', f: '(c)′ = 0', d: 'A gravidade constante não varia: taxa zero.', c: { k: 'der', f: '7', r: '0' } },
          { t: 'Identidade', f: '(x)′ = 1', d: 'Caso particular da potência com n = 1.', c: { k: 'der', f: 'x', r: '1' } },
          { t: 'Potência', f: '(xⁿ)′ = n·xⁿ⁻¹', d: 'Desce o expoente e diminui 1. Vale para n real.', c: { k: 'der', f: 'x^4', r: '4x^3' } },
          { t: 'Raiz quadrada', f: `(<span class="sq">√</span>x)′ = ${fr('1', '2<span class="sq">√</span>x')}`, d: 'É a potência com n = 1/2 (x > 0).', c: { k: 'der', f: 'sqrt(x)', r: '1/(2sqrt(x))' } },
          { t: 'Inverso', f: `(${fr('1', 'x')})′ = −${fr('1', 'x²')}`, d: 'Potência com n = −1.', c: { k: 'der', f: '1/x', r: '-1/x^2' } },
          { t: 'Exponencial natural', f: '(eˣ)′ = eˣ', d: 'A única função igual à própria derivada.', c: { k: 'der', f: 'e^x', r: 'e^x' } },
          { t: 'Exponencial de base a', f: '(aˣ)′ = aˣ·ln a', d: 'Escala de HP 1,2ⁿ cresce a uma taxa proporcional ao próprio HP.', c: { k: 'der', f: '2^x', r: '2^x*ln(2)' } },
          { t: 'Logaritmo natural', f: `(ln x)′ = ${fr('1', 'x')}`, d: 'Taxa de ganho de nível cai com o XP (x > 0).', c: { k: 'der', f: 'ln(x)', r: '1/x' } },
          { t: 'Seno', f: '(sen x)′ = cos x', d: 'Velocidade da moeda flutuante.', c: { k: 'der', f: 'sin(x)', r: 'cos(x)' } },
          { t: 'Cosseno', f: '(cos x)′ = −sen x', d: 'Note o sinal negativo.', c: { k: 'der', f: 'cos(x)', r: '-sin(x)' } },
          { t: 'Tangente', f: `(tg x)′ = sec²x = ${fr('1', 'cos²x')}`, d: 'Definida onde cos x ≠ 0.', c: { k: 'der', f: 'tan(x)', r: '1/cos(x)^2' } },
        ],
        'Regras operatórias': [
          { t: 'Linearidade', f: '(a·f + b·g)′ = a·f′ + b·g′', d: 'Constantes saem e a derivada da soma é a soma das derivadas.', c: { k: 'der', f: '3x^2 + 5sin(x)', r: '6x + 5cos(x)' } },
          { t: 'Produto', f: '(f·g)′ = f′·g + f·g′', d: 'Deriva um fator de cada vez.', c: { k: 'der', f: 'x*e^x', r: 'e^x + x*e^x' } },
          { t: 'Quociente', f: `(${fr('f', 'g')})′ = ${fr('f′·g − f·g′', 'g²')}`, d: '“Derivada de cima vezes baixo, menos cima vezes derivada de baixo, sobre baixo ao quadrado” (g ≠ 0).', c: { k: 'der', f: 'sin(x)/x', r: '(x*cos(x) - sin(x))/x^2' } },
          { t: 'Cadeia', f: '[f(g(x))]′ = f′(g(x))·g′(x)', d: 'Deriva a função de fora, mantém a de dentro e multiplica pela derivada de dentro.', c: { k: 'der', f: 'cos(x^2)', r: '-2x*sin(x^2)' } },
          { t: 'Cadeia com exponencial', f: '(e<sup>u</sup>)′ = e<sup>u</sup>·u′', d: 'Ex.: dano de veneno 20e<sup>−0,5t</sup> perde 10e<sup>−0,5t</sup> por segundo.', c: { k: 'der', f: 'e^(3x)', r: '3e^(3x)' } },
        ],
        'Interpretação': [
          { t: 'Crescimento', f: 'f′(x) > 0 ⇒ f crescente;  f′(x) < 0 ⇒ f decrescente', d: 'Testado em f(x) = x³ − 3x no valor escolhido.', c: { k: 'sign', f: 'x^3 - 3x' } },
          { t: 'Ponto crítico', f: 'f′(x₀) = 0 ⇒ possível máximo ou mínimo', d: 'O pico do projétil acontece quando a velocidade vertical y′(t) = 0. Em x³ − 3x os pontos críticos são x = ±1.', c: { k: 'eq', l: '3*1^2 - 3', r: '0', fixed: true, txt: 'f′(1) = 3·1² − 3' } },
          { t: 'Concavidade', f: 'f″(x) > 0 ⇒ ∪   f″(x) < 0 ⇒ ∩', d: 'No projétil y″ = −g < 0: a trajetória é sempre côncava para baixo.', c: { k: 'conc', f: 'x^3 - 3x' } },
          { t: 'Reta tangente', f: 'y = f(a) + f′(a)·(x − a)', d: 'Melhor reta que aproxima f perto de a. Usada para prever a próxima posição em um frame.', c: { k: 'tan', f: 'x^2' } },
          { t: 'Movimento', f: 'v(t) = s′(t)   a(t) = v′(t) = s″(t)', d: 'Posição → velocidade → aceleração.', c: { k: 'der', f: '5 + 12x - 4.9x^2', r: '12 - 9.8x' } },
          { t: 'Derivável ⇒ contínua', f: 'f derivável em a ⇒ f contínua em a', d: 'A recíproca é falsa: |x| é contínua em 0, mas não derivável (bico).', c: { k: 'info', txt: 'Derivadas laterais de |x| em 0: −1 pela esquerda e +1 pela direita ⇒ f′(0) não existe.' } },
        ],
      },
    });
})();
