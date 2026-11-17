/* Testes — Funções e validação das entradas
   Responsável: Integrante 1 */
Testes.add('Funções', ({ ok, close, numDeriv, f4 }) => {
  /* ---- Aula 1: Funções ---- */
  const pr = CDI.physics.projectile(20, 45, 0, 9.8);
  ok('Funções', 'Alcance do projétil (v0=20, θ=45°, g=9,8)', '40.8163', f4(pr.range), close(pr.range, 400 / 9.8));
  ok('Funções', 'Altura máxima do projétil', '10.2041', f4(pr.hmax), close(pr.hmax, 100 / 9.8));
  const traj = x => pr.c + pr.b * x + pr.a * x * x;
  ok('Funções', 'Trajetória quadrática y(alcance) = 0', '0', f4(traj(pr.range)), Math.abs(traj(pr.range)) < 1e-9);
  const hp = CDI.compile(CDI.parse('100*1.2^x').tree);
  ok('Funções', 'Exponencial HP(3) = 100·1,2³', '172.8', f4(hp(3)), close(hp(3), 172.8));
  const lv = CDI.compile(CDI.parse('1 + log(x/100)/log(2)').tree);
  ok('Funções', 'Logarítmica nível(800 XP) = 1 + log₂(8)', '4', f4(lv(800)), close(lv(800), 4));
  const md = CDI.compile(CDI.parse('abs(x - 50)').tree);
  ok('Funções', 'Modular |x − 50| em x = 20', '30', md(20), md(20) === 30);
  const tr = CDI.compile(CDI.parse('2 + 0.5sin(2pi*x)').tree);
  ok('Funções', 'Trigonométrica y(0,25) = 2,5 (pico)', '2.5', f4(tr(0.25)), close(tr(0.25), 2.5));
  ok('Funções', 'Logaritmo fora do domínio (x ≤ 0) → indefinido', 'NaN', lv(-5), Number.isNaN(lv(-5)));

});
Testes.add('Validação', ({ ok, close, numDeriv, f4 }) => {
  /* ---- Entradas inválidas ---- */
  const bad = ['', '2x+', 'y + 1', 'sin x', '(x+1', 'x + t', '3..2', 'x $ 2', 'sec(x)'];
  for (const e of bad) {
    let msg = 'aceitou';
    try { CDI.parse(e); } catch (err) { msg = err instanceof CDI.MathError ? err.message : 'erro inesperado'; }
    ok('Validação', `Rejeita entrada inválida "${e}"`, 'mensagem de erro', msg, msg !== 'aceitou' && msg !== 'erro inesperado');
  }
  const good = ['2x^2+3x-1', '3sin(2t)', '(x+1)(x-1)', '2,5x', 'sen(x)', 'π*x', '−x', 'x²+1', '6÷2', 'x**3', '[x+1]*2'];
  for (const e of good) {
    let msg = 'ok';
    try { CDI.parse(e); } catch (err) { msg = err.message; }
    ok('Validação', `Aceita entrada válida "${e}"`, 'ok', msg, msg === 'ok');
  }
  const eq = (a, b, x = 1.7) => close(CDI.compile(CDI.parse(a).tree)(x), CDI.compile(CDI.parse(b).tree)(x), 1e-12);
  ok('Validação', 'x² é lido como x^2', 'iguais', eq('x²+1', 'x^2+1') ? 'iguais' : 'diferentes', eq('x²+1', 'x^2+1'));
  ok('Validação', '6÷2 é lido como 6/2', '3', CDI.compile(CDI.parse('6÷2').tree)(0), eq('6÷2', '3'));
  ok('Validação', 'Precedência: −x^2 = −(x²)', 'negativo', f4(CDI.compile(CDI.parse('-x^2').tree)(3)), CDI.compile(CDI.parse('-x^2').tree)(3) === -9);
  ok('Validação', 'Potência à direita: 2^3^2 = 2^9', '512', CDI.compile(CDI.parse('2^3^2').tree)(0), CDI.compile(CDI.parse('2^3^2').tree)(0) === 512);
  ok('Validação', '1/2x = (1/2)·x (esquerda p/ direita)', '2', CDI.compile(CDI.parse('1/2x').tree)(4), CDI.compile(CDI.parse('1/2x').tree)(4) === 2);
});
