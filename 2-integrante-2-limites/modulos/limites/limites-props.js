/* =========================================================
   PROPRIEDADES — LIMITES
   Responsável: Integrante 2
   Cada item: t = título, f = fórmula (HTML), d = quando usar,
   c = verificação numérica feita pelo app (ver base/props.js).
   ========================================================= */
(() => {
  const { fr, lim, I, S, fn, br } = PROPS.h;
  PROPS.register('limites', {
      sub: 'Propriedades operatórias, limites fundamentais e técnicas para indeterminações. Cada verificação foi calculada numericamente pelo app.',
      cats: {
        'Propriedades operatórias': [
          { t: 'Limite da constante', f: `${lim('x→a', 'c')} = c`, d: 'Uma constante não depende de x.', c: { k: 'lim', l: ['7', 2], parts: [], fn: () => 7, txt: () => 'c = 7' } },
          { t: 'Soma e diferença', f: `${lim('x→a', '[f ± g]')} = ${lim('x→a', 'f')} ± ${lim('x→a', 'g')}`, d: 'O limite da soma é a soma dos limites (se ambos existirem).', c: { k: 'lim', l: ['x^2 + 3x', 2], parts: [['x^2', 2], ['3x', 2]], fn: L => L[0] + L[1], txt: L => `${br(L[0])} + ${br(L[1])}` } },
          { t: 'Produto', f: `${lim('x→a', '[f·g]')} = ${lim('x→a', 'f')} · ${lim('x→a', 'g')}`, d: 'Vale quando os dois limites existem.', c: { k: 'lim', l: ['(x+1)*sqrt(x)', 4], parts: [['x+1', 4], ['sqrt(x)', 4]], fn: L => L[0] * L[1], txt: L => `${br(L[0])} · ${br(L[1])}` } },
          { t: 'Constante multiplicativa', f: `${lim('x→a', 'k·f')} = k·${lim('x→a', 'f')}`, d: 'A constante sai do limite.', c: { k: 'lim', l: ['5x^2', 3], parts: [['x^2', 3]], fn: L => 5 * L[0], txt: L => `5 · ${br(L[0])}` } },
          { t: 'Quociente', f: `${lim('x→a', fr('f', 'g'))} = ${fr(lim('', 'f'), lim('', 'g'))}`, d: 'Só vale se lim g ≠ 0. Se der 0/0, é indeterminação (veja abaixo).', c: { k: 'lim', l: ['(x^2+1)/(x+3)', 1], parts: [['x^2+1', 1], ['x+3', 1]], fn: L => L[0] / L[1], txt: L => `${br(L[0])} / ${br(L[1])}` } },
          { t: 'Potência e raiz', f: `${lim('x→a', 'fⁿ')} = (${lim('x→a', 'f')})ⁿ`, d: 'Também vale para raízes: lim <span class="sq">√</span>f = <span class="sq">√</span>(lim f), com lim f ≥ 0.', c: { k: 'lim', l: ['(2x-1)^3', 2], parts: [['2x-1', 2]], fn: L => L[0] ** 3, txt: L => `${br(L[0])}³` } },
          { t: 'Substituição direta', f: `f contínua em a ⇒ ${lim('x→a', 'f(x)')} = f(a)`, d: 'Polinômios, exponenciais, seno e cosseno são contínuos: basta substituir.', c: { k: 'lim', l: ['x^3 - 2x + 1', 2], parts: [], fn: () => fn('x^3 - 2x + 1')(2), txt: () => 'f(2) = 8 − 4 + 1' } },
          { t: 'Existência do limite', f: `${lim('x→a', 'f')} = L ⇔ ${lim('x→a⁻', 'f')} = ${lim('x→a⁺', 'f')} = L`, d: 'Se os limites laterais forem diferentes, o limite não existe (ex.: direção |x|/x).', c: { k: 'lat', e: 'abs(x)/x', a: 0 } },
        ],
        'Limites fundamentais': [
          { t: 'Fundamental trigonométrico', f: `${lim('x→0', fr('sen x', 'x'))} = 1`, d: 'Base da derivada do seno. Usado em filtros de suavização de câmera.', c: { k: 'lim', l: ['sin(x)/x', 0], parts: [], fn: () => 1, txt: () => '1' } },
          { t: 'Fundamental exponencial', f: `${lim('x→∞', '(1 + 1/x)<sup>x</sup>')} = e`, d: 'Define o número e ≈ 2,71828 (juros compostos contínuos).', c: { k: 'lim', l: ['(1 + 1/x)^x', Infinity], parts: [], fn: () => Math.E, txt: () => 'e' } },
          { t: 'Exponencial em zero', f: `${lim('x→0', fr('eˣ − 1', 'x'))} = 1`, d: 'Base da derivada de eˣ.', c: { k: 'lim', l: ['(e^x - 1)/x', 0], parts: [], fn: () => 1, txt: () => '1' } },
          { t: 'Exponencial negativa', f: `${lim('x→∞', 'e<sup>−x</sup>')} = 0`, d: 'É o que faz a velocidade de queda parar de crescer: v(t) = v<sub>T</sub>(1 − e<sup>−kt/m</sup>) → v<sub>T</sub>.', c: { k: 'lim', l: ['e^(-x)', Infinity], parts: [], fn: () => 0, txt: () => '0' } },
        ],
        'Limites infinitos e no infinito': [
          { t: 'Inverso de potência', f: `${lim('x→∞', fr('1', 'xⁿ'))} = 0  (n > 0)`, d: 'Algo dividido por um número enorme fica quase zero.', c: { k: 'lim', l: ['1/x^2', Infinity], parts: [], fn: () => 0, txt: () => '0' } },
          { t: 'Racionais no infinito', f: `${lim('x→∞', fr('aₙxⁿ + …', 'bₙxⁿ + …'))} = ${fr('aₙ', 'bₙ')}`, d: 'Com graus iguais, o limite é a razão dos coeficientes dos termos de maior grau.', c: { k: 'lim', l: ['(3x^2 + x)/(2x^2 - 5)', Infinity], parts: [], fn: () => 1.5, txt: () => '3/2' } },
          { t: 'Limite infinito', f: `${lim('x→0', fr('1', 'x²'))} = +∞`, d: 'O valor cresce sem parar: há assíntota vertical. O jogo deve limitar o valor (clamp).', c: { k: 'lim', l: ['1/x^2', 0], parts: [], fn: () => Infinity, txt: () => '+∞' } },
        ],
        'Indeterminações': [
          { t: 'Indeterminação 0/0 — fatorar', f: `${lim('x→3', fr('x² − 9', 'x − 3'))} = ${lim('x→3', '(x + 3)')} = 6`, d: 'Fatore e simplifique o fator que zera: x² − 9 = (x − 3)(x + 3).', c: { k: 'lim', l: ['(x^2 - 9)/(x - 3)', 3], parts: [['x + 3', 3]], fn: L => L[0], txt: L => `lim (x + 3) = ${br(L[0])}` } },
          { t: 'Indeterminação 0/0 — racionalizar', f: `${lim('x→0', fr('<span class="sq">√</span>(x+1) − 1', 'x'))} = ${lim('x→0', fr('1', '<span class="sq">√</span>(x+1) + 1'))} = ${fr('1', '2')}`, d: 'Multiplique pelo conjugado <span class="sq">√</span>(x+1) + 1.', c: { k: 'lim', l: ['(sqrt(x+1) - 1)/x', 0], parts: [['1/(sqrt(x+1) + 1)', 0]], fn: L => L[0], txt: L => `lim 1/(<span class="sq">√</span>(x+1)+1) = ${br(L[0])}` } },
          { t: 'Teorema do confronto', f: 'g ≤ f ≤ h  e  lim g = lim h = L ⇒ lim f = L', d: 'Ex.: −x² ≤ x²·sen(1/x) ≤ x², e os dois lados tendem a 0.', c: { k: 'lim', l: ['x^2*sin(1/x)', 0], parts: [['-x^2', 0], ['x^2', 0]], fn: L => L[1], txt: L => `entre ${br(L[0])} e ${br(L[1])}` } },
          { t: 'Formas indeterminadas', f: '0/0  ∞/∞  ∞ − ∞  0·∞  1<sup>∞</sup>', d: 'Não têm valor fixo: é preciso transformar a expressão (fatorar, racionalizar, dividir pelo termo dominante) antes de calcular.', c: { k: 'info', txt: 'Ex.: (x²−4)/(x−2) em x = 2 dá 0/0, mas o limite é 4.' } },
        ],
      },
    });
})();
