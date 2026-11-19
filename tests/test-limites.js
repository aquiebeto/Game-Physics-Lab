/* Testes — Limites
   Responsável: Integrante 2 */
Testes.add('Limites', ({ ok, close, numDeriv, f4 }) => {
  /* ---- Aula 2: Limites ---- */
  const lim = (e, a) => { const p = CDI.parse(e); return CDI.limit(CDI.compile(p.tree), a); };
  let r = lim('sin(x)/x', 0); ok('Limites', 'lim x→0 sin(x)/x', '1', r.value, r.exists && r.value === 1);
  r = lim('(x^2-4)/(x-2)', 2); ok('Limites', 'lim x→2 (x²−4)/(x−2) (removível)', '4', r.value, r.exists && r.value === 4 && r.continuity.includes('removível'));
  r = lim('abs(x)/x', 0); ok('Limites', 'lim x→0 |x|/x (laterais −1 e 1)', 'não existe', r.exists ? r.value : 'não existe', !r.exists && r.kind === 'jump');
  r = lim('1/x^2', 0); ok('Limites', 'lim x→0 1/x² (infinito)', '+∞', r.kind === 'inf' ? CDI.fmtNum(r.value) : r.kind, r.kind === 'inf' && r.value === Infinity);
  r = lim('1/x', 0); ok('Limites', 'lim x→0 1/x (−∞ e +∞)', 'não existe', r.exists ? r.value : 'não existe', !r.exists);
  r = lim('(3x^2+1)/(x^2+2)', Infinity); ok('Limites', 'lim x→∞ (3x²+1)/(x²+2)', '3', r.value, r.exists && r.value === 3);
  r = lim('sin(1/x)', 0); ok('Limites', 'lim x→0 sin(1/x) (oscila)', 'não existe', r.exists ? r.value : 'não existe', !r.exists);
  const vt = CDI.physics.vtLinear(80, 12, 9.8);
  const v = CDI.physics.vLinear(80, 12, 9.8);
  const vl = CDI.atInfinity(v, 1);
  ok('Limites', 'Velocidade terminal mg/k (m=80, k=12)', f4(vt), vl.v, vl.kind === 'finite' && close(vl.v, vt));
  r = lim('x^2 + 3', 1); ok('Limites', 'Continuidade de x²+3 em x=1', 'contínua', r.continuity, r.continuity === 'contínua');

});
