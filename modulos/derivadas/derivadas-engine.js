/* =========================================================
   MOTOR — DERIVAÇÃO SIMBÓLICA (Aula 3)
   Responsável: Integrante 3
   Percorre a árvore da expressão aplicando, em cada nó, a regra
   de derivação correspondente (constante, potência, soma/subtração,
   produto, quociente, cadeia...) e registra cada regra usada.
   ========================================================= */
(() => {
  const { N, B, Neg, F } = CDI._;
  const { hasVar, str, simp, MathError } = CDI;

  /* ---------- Derivação simbólica com registro de regras ---------- */
  // Regras exigidas no roteiro: constante, potência, soma/subtração, produto, quociente, cadeia
  function derive(tree) {
    const rules = new Set(), steps = [];
    const log = (rule, text) => { rules.add(rule); if (steps.length < 40) steps.push({ rule, text }); };
    function chain(u, outer) {
      if (u.type === 'var') return outer;
      log('Cadeia', `Regra da cadeia: derivada externa avaliada em u = ${str(u)} multiplicada por u' (u = ${str(u)})`);
      return B('mul', outer, d(u));
    }
    function d(n) {
      if (!hasVar(n)) { log('Constante', `Regra da constante: (${str(n)})' = 0`); return N(0); }
      switch (n.type) {
        case 'var': log('Potência', `Regra da potência: (${n.n})' = 1·${n.n}^0 = 1`); return N(1);
        case 'neg': return Neg(d(n.a));
        case 'add': case 'sub':
          log('Soma/Subtração', `Regra da ${n.type === 'add' ? 'soma' : 'subtração'}: (${str(n.a)} ${n.type === 'add' ? '+' : '-'} ${str(n.b)})' = derivada de cada parcela`);
          return B(n.type, d(n.a), d(n.b));
        case 'mul':
          if (!hasVar(n.a)) { log('Múltiplo constante', `Constante multiplicativa: (${str(n.a)}·f)' = ${str(n.a)}·f'`); return B('mul', n.a, d(n.b)); }
          if (!hasVar(n.b)) { log('Múltiplo constante', `Constante multiplicativa: (f·${str(n.b)})' = ${str(n.b)}·f'`); return B('mul', n.b, d(n.a)); }
          log('Produto', `Regra do produto: (u·v)' = u'·v + u·v', com u = ${str(n.a)} e v = ${str(n.b)}`);
          return B('add', B('mul', d(n.a), n.b), B('mul', n.a, d(n.b)));
        case 'div':
          if (!hasVar(n.b)) { log('Múltiplo constante', `Divisão por constante: (f/${str(n.b)})' = f'/${str(n.b)}`); return B('div', d(n.a), n.b); }
          log('Quociente', `Regra do quociente: (u/v)' = (u'·v - u·v')/v², com u = ${str(n.a)} e v = ${str(n.b)}`);
          return B('div', B('sub', B('mul', d(n.a), n.b), B('mul', n.a, d(n.b))), B('pow', n.b, N(2)));
        case 'pow': {
          const u = n.a, e = n.b;
          if (!hasVar(e)) {
            log('Potência', `Regra da potência: (u^n)' = n·u^(n-1)·u', com n = ${str(e)}`);
            return chain(u, B('mul', e, B('pow', u, simp(B('sub', e, N(1))))));
          }
          if (!hasVar(u)) {
            log('Exponencial', `Exponencial: (a^u)' = a^u·ln(a)·u', com a = ${str(u)}`);
            const lnA = u.name === 'e' ? N(1) : F('ln', u);
            return chain(e, B('mul', n, lnA));
          }
          log('Exponencial', 'Potência geral f^g: (f^g)\' = f^g·(g\'·ln f + g·f\'/f)');
          return B('mul', n, B('add', B('mul', d(e), F('ln', u)), B('div', B('mul', e, d(u)), u)));
        }
        case 'fn': {
          const u = n.a;
          const T = {
            sin: () => { log('Trigonométrica', `(sin u)' = cos u`); return F('cos', u); },
            cos: () => { log('Trigonométrica', `(cos u)' = -sin u`); return Neg(F('sin', u)); },
            tan: () => { log('Trigonométrica', `(tan u)' = 1/cos²u`); return B('div', N(1), B('pow', F('cos', u), N(2))); },
            exp: () => { log('Exponencial', `(e^u)' = e^u`); return F('exp', u); },
            ln: () => { log('Logarítmica', `(ln u)' = 1/u`); return B('div', N(1), u); },
            log: () => { log('Logarítmica', `(log₁₀ u)' = 1/(u·ln 10)`); return B('div', N(1), B('mul', u, F('ln', N(10)))); },
            sqrt: () => { log('Potência', `(√u)' = (u^(1/2))' = 1/(2√u)`); return B('div', N(1), B('mul', N(2), F('sqrt', u))); },
            abs: () => { log('Modular', `(|u|)' = u/|u| (u ≠ 0)`); return B('div', u, F('abs', u)); },
          };
          return chain(u, T[n.f]());
        }
      }
      throw new MathError('Não foi possível derivar.');
    }
    const raw = d(tree);
    return { result: simp(simp(raw)), raw, rules: [...rules], steps };
  }

  CDI.derive = derive;
})();
