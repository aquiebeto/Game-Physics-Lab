/* Testes — Derivadas
   Responsável: Integrante 3 */
Testes.add('Derivadas', ({ ok, close, numDeriv, f4 }) => {
  /* ---- Aula 3: Derivadas ---- */
  const dcases = [
    ['5', ['Constante']], ['x^4', ['Potência']], ['3x^2 - 2x + 7', ['Soma/Subtração', 'Potência']],
    ['x^2*sin(x)', ['Produto']], ['(x^2+1)/(x-1)', ['Quociente']], ['sin(3x^2)', ['Cadeia']],
    ['e^(2x)', ['Exponencial', 'Cadeia']], ['ln(x^2+1)', ['Logarítmica', 'Cadeia']], ['sqrt(1+x^2)', ['Cadeia']],
    ['x^3*e^x/(x+2)', ['Produto', 'Quociente']], ['tan(x)', ['Trigonométrica']], ['2^x', ['Exponencial']],
  ];
  for (const [e, need] of dcases) {
    const p = CDI.parse(e), d = CDI.derive(p.tree), f = CDI.compile(p.tree), df = CDI.compile(d.result);
    const pts = [0.3, 0.7, 1.4, 2.6];
    const good = pts.every(x => close(df(x), numDeriv(f, x), 1e-4));
    const rulesOk = need.every(n => d.rules.includes(n));
    ok('Derivadas', `d/dx ${e}  [${need.join(', ')}]`, 'f\'(x) ≈ diferença central', CDI.str(d.result), good && rulesOk);
  }

});
