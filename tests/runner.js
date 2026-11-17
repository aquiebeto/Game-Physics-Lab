/* =========================================================
   EXECUTOR DE TESTES — Responsável: Integrante 1
   Cada arquivo tests/test-*.js chama Testes.add(nome, fn).
   No navegador: aba Testes. No terminal: node tests/run-node.js
   ========================================================= */
const Testes = (() => {
  const grupos = [];
  const add = (nome, fn) => grupos.push({ nome, fn });
  function run() {
    const rows = [];
    const ok = (grupo, nome, esperado, obtido, pass) => rows.push({ grupo, nome, esperado: String(esperado), obtido: String(obtido), pass: !!pass });
    const close = (a, b, tol = 1e-4) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
    const numDeriv = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);
    const f4 = v => CDI.fmtNum(v, 4);
    for (const g of grupos) {
      try { g.fn({ ok, close, numDeriv, f4 }); }
      catch (e) { ok(g.nome, 'Execução do grupo de testes', 'sem erro', e.message, false); }
    }
    return rows;
  }
  return { add, run };
})();
