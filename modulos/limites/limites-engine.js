/* =========================================================
   MOTOR — LIMITES (Aula 2)
   Responsável: Integrante 2
   - Limites laterais: aproxima x do ponto com h = 10⁻¹ … 10⁻⁸
   - Limites no infinito: x = 10 … 10⁸
   - Classifica: finito, infinito, oscilação, salto, indefinido
   - Física da velocidade terminal (limite quando t → ∞)
   ========================================================= */
(() => {
  const { fmtNum } = CDI;

  /* ---------- Limites numéricos ---------- */
  function classify(vals) {
    const fin = vals.filter(isFinite);
    if (fin.length < 4) return { kind: 'undef' };
    const tail = vals.slice(-5);
    if (tail.every(isFinite) && tail.every(v => v > 1e6) && tail[4] > tail[0]) return { kind: 'inf', v: Infinity };
    if (tail.every(isFinite) && tail.every(v => v < -1e6) && tail[4] < tail[0]) return { kind: 'inf', v: -Infinity };
    const t = vals.slice(-6, -1).filter(isFinite); // evita o último passo (erro de arredondamento)
    if (t.length < 3) return { kind: 'undef' };
    const spread = Math.max(...t.slice(-3)) - Math.min(...t.slice(-3));
    const scale = Math.max(1, Math.abs(t[t.length - 1]));
    if (spread / scale < 1e-4) {
      let L = t[t.length - 1];
      const r = Math.round(L);
      if (Math.abs(L - r) < 1e-5) L = r; else L = Math.round(L * 1e6) / 1e6;
      return { kind: 'finite', v: L === 0 ? 0 : L };
    }
    return { kind: 'osc' };
  }
  function lateral(f, a, dir) {
    const hs = [1e-1, 1e-2, 1e-3, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8];
    const rows = hs.map(h => ({ x: a + dir * h, y: f(a + dir * h) }));
    return { rows, ...classify(rows.map(r => r.y)) };
  }
  function atInfinity(f, sign) {
    const xs = [1e1, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8].map(x => sign * x);
    const rows = xs.map(x => ({ x, y: f(x) }));
    return { rows, ...classify(rows.map(r => r.y)) };
  }
  function limit(f, a) {
    if (a === Infinity || a === -Infinity) {
      const s = atInfinity(f, a > 0 ? 1 : -1);
      return { atInf: true, side: s, exists: s.kind === 'finite', value: s.v, kind: s.kind };
    }
    const L = lateral(f, a, -1), R = lateral(f, a, 1);
    const fa = f(a);
    let exists = false, value, kind, reason;
    if (L.kind === 'finite' && R.kind === 'finite') {
      if (Math.abs(L.v - R.v) < 1e-4 * Math.max(1, Math.abs(L.v))) { exists = true; value = L.v; kind = 'finite'; }
      else { kind = 'jump'; reason = `Os limites laterais são diferentes (${fmtNum(L.v)} ≠ ${fmtNum(R.v)}), então o limite não existe.`; }
    } else if (L.kind === 'inf' && R.kind === 'inf') {
      if (L.v === R.v) { kind = 'inf'; value = L.v; reason = `Os dois lados tendem a ${L.v > 0 ? '+∞' : '-∞'}: o limite é infinito (não existe como número real) e há assíntota vertical em x = ${fmtNum(a)}.`; }
      else { kind = 'jump'; reason = 'Um lado tende a +∞ e o outro a -∞: o limite não existe (assíntota vertical).'; }
    } else if (L.kind === 'osc' || R.kind === 'osc') { kind = 'osc'; reason = 'A função oscila sem se aproximar de um valor: o limite não existe.'; }
    else if (L.kind === 'undef' && R.kind === 'undef') { kind = 'undef'; reason = 'A função não está definida perto do ponto (fora do domínio).'; }
    else if (L.kind === 'undef' || R.kind === 'undef') {
      const s = L.kind === 'undef' ? R : L;
      kind = 'onesided'; value = s.v;
      reason = `A função só está definida de um lado (${L.kind === 'undef' ? 'direita' : 'esquerda'}). O limite bilateral não existe; o limite lateral vale ${fmtNum(s.v)}.`;
    } else { kind = 'jump'; reason = 'Os comportamentos laterais são diferentes: o limite não existe.'; }
    let continuity;
    if (exists && isFinite(fa) && Math.abs(fa - value) < 1e-6 * Math.max(1, Math.abs(value))) continuity = 'contínua';
    else if (exists && !isFinite(fa)) continuity = 'descontinuidade removível (f(a) não definida, mas o limite existe)';
    else if (exists) continuity = 'descontinuidade removível (f(a) ≠ limite)';
    else if (kind === 'jump' && L.kind === 'finite') continuity = 'descontinuidade de salto';
    else if (kind === 'inf' || (kind === 'jump')) continuity = 'descontinuidade infinita (assíntota vertical)';
    else continuity = 'descontínua';
    return { atInf: false, left: L, right: R, fa, exists, value, kind, reason, continuity };
  }

  /* ---------- Física: velocidade terminal ---------- */
  Object.assign(CDI.physics, {
    vLinear: (m, k, g) => t => (m * g / k) * (1 - Math.exp(-k * t / m)),
    vtLinear: (m, k, g) => m * g / k,
    vQuad: (m, c, g) => { const vt = Math.sqrt(m * g / c); return t => vt * Math.tanh(g * t / vt); },
    vtQuad: (m, c, g) => Math.sqrt(m * g / c),
  });
  Object.assign(CDI, { lateral, atInfinity, limit });
})();
