/* =========================================================
   NÚCLEO DO MOTOR MATEMÁTICO — Game Physics Lab (CDI AP2)
   Responsável: Integrante 1
   Lê o texto digitado (tokenização + parser), monta a árvore
   da expressão, avalia, simplifica e formata.
   Os módulos de Limites, Derivadas e Integrais acrescentam
   suas funções ao objeto CDI (arquivos modulos/<modulo>/<modulo>-engine.js).
   ========================================================= */
const CDI = (() => {
  const FUNCS = ['sqrt', 'sin', 'cos', 'tan', 'exp', 'ln', 'log', 'abs'];
  const NAMES = ['sqrt', 'sin', 'cos', 'tan', 'exp', 'ln', 'log', 'abs', 'pi', 'π', 'e', 'x', 't'];

  class MathError extends Error {}

  /* ---------- Tokenização ---------- */
  /* Normaliza a escrita do usuário e registra o que foi corrigido (usado no modo educacional) */
  const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
  function normalize(src) {
    const notes = [];
    let s = String(src);
    const rep = (re, to, note) => { if (re.test(s)) { notes.push(note); s = s.replace(re, to); } };
    rep(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, m => '^(' + [...m].map(c => SUP[c]).join('') + ')', 'Expoente sobrescrito (como ²) foi lido como ^2');
    rep(/\*\*/g, '^', '“**” foi lido como potência ^');
    rep(/[÷:]/g, '/', '“÷” ou “:” foi lido como divisão /');
    rep(/[·×∙]/g, '*', '“×” ou “·” foi lido como multiplicação *');
    rep(/[−–]/g, '-', 'Sinal de menos tipográfico foi lido como -');
    rep(/(\d),(\d)/g, '$1.$2', 'Vírgula decimal (2,5) foi lida como ponto (2.5)');
    rep(/\bsen\b/gi, 'sin', '“sen” (português) foi lido como sin');
    rep(/\btg\b/gi, 'tan', '“tg” foi lido como tan');
    rep(/√/g, 'sqrt', '“√” foi lido como sqrt');
    rep(/[\[{]/g, '(', 'Colchetes/chaves foram lidos como parênteses');
    rep(/[\]}]/g, ')', '');
    return { s, notes: notes.filter(Boolean) };
  }

  function tokenize(src) {
    if (typeof src !== 'string' || !src.trim()) throw new MathError('Digite uma expressão.');
    const s = normalize(src).s.toLowerCase().replace(/,/g, '.');
    const toks = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        const m = s.slice(i).match(/^(\d+\.?\d*|\.\d+)/);
        if (!m || (m[0].match(/\./g) || []).length > 1) throw new MathError(`Número inválido perto de "${s.slice(i, i + 6)}".`);
        toks.push({ t: 'num', v: parseFloat(m[0]) });
        i += m[0].length;
        if (s[i] === '.') throw new MathError('Número com dois pontos decimais.');
        continue;
      }
      if (/[a-zπ]/.test(c)) {
        const m = s.slice(i).match(/^[a-zπ]+/)[0];
        let j = 0;
        while (j < m.length) {
          const name = NAMES.find(n => m.startsWith(n, j));
          if (!name) throw new MathError(`Símbolo desconhecido: "${m.slice(j)}". Use x ou t como variável.`);
          if (FUNCS.includes(name)) toks.push({ t: 'fn', v: name });
          else if (name === 'pi' || name === 'π') toks.push({ t: 'const', v: 'pi' });
          else if (name === 'e') toks.push({ t: 'const', v: 'e' });
          else toks.push({ t: 'var', v: name });
          j += name.length;
        }
        i += m.length;
        continue;
      }
      if ('+-*/^()'.includes(c)) { toks.push({ t: 'op', v: c }); i++; continue; }
      throw new MathError(`Caractere inválido: "${c}".`);
    }
    // multiplicação implícita: 2x, 3sin(x), (x+1)(x-1), x(x+1)
    const out = [];
    for (let k = 0; k < toks.length; k++) {
      const a = out[out.length - 1], b = toks[k];
      const endsVal = a && (a.t === 'num' || a.t === 'var' || a.t === 'const' || (a.t === 'op' && a.v === ')'));
      const startsVal = b.t === 'num' || b.t === 'var' || b.t === 'const' || b.t === 'fn' || (b.t === 'op' && b.v === '(');
      if (endsVal && startsVal) out.push({ t: 'op', v: '*' });
      out.push(b);
    }
    return out;
  }

  /* ---------- Parser (descida recursiva) ---------- */
  const N = v => ({ type: 'num', v });
  const C = n => ({ type: 'num', v: n === 'pi' ? Math.PI : Math.E, name: n });
  const V = n => ({ type: 'var', n });
  const B = (type, a, b) => ({ type, a, b });
  const Neg = a => ({ type: 'neg', a });
  const F = (f, a) => ({ type: 'fn', f, a });

  function parse(src) {
    const toks = tokenize(src);
    let p = 0;
    const peek = () => toks[p];
    const isOp = v => peek() && peek().t === 'op' && peek().v === v;
    function expr() {
      let n = term();
      while (isOp('+') || isOp('-')) { const o = toks[p++].v; n = B(o === '+' ? 'add' : 'sub', n, term()); }
      return n;
    }
    function term() {
      let n = unary();
      while (isOp('*') || isOp('/')) { const o = toks[p++].v; n = B(o === '*' ? 'mul' : 'div', n, unary()); }
      return n;
    }
    function unary() {
      if (isOp('-')) { p++; return Neg(unary()); }
      if (isOp('+')) { p++; return unary(); }
      return power();
    }
    function power() {
      const base = primary();
      if (isOp('^')) { p++; return B('pow', base, unary()); }
      return base;
    }
    function primary() {
      const tk = peek();
      if (!tk) throw new MathError('Expressão incompleta: falta um termo no final.');
      if (tk.t === 'num') { p++; return N(tk.v); }
      if (tk.t === 'const') { p++; return C(tk.v); }
      if (tk.t === 'var') { p++; return V(tk.v); }
      if (tk.t === 'fn') {
        p++;
        if (!isOp('(')) throw new MathError(`Use parênteses após ${tk.v}: ${tk.v}(x).`);
        p++;
        const a = expr();
        if (!isOp(')')) throw new MathError('Parêntese não fechado.');
        p++;
        return F(tk.v, a);
      }
      if (isOp('(')) {
        p++;
        const a = expr();
        if (!isOp(')')) throw new MathError('Parêntese não fechado.');
        p++;
        return a;
      }
      throw new MathError(`Termo inesperado: "${tk.v}".`);
    }
    const tree = expr();
    if (p < toks.length) throw new MathError(`Sobrou algo na expressão: "${toks[p].v}".`);
    const vars = new Set();
    (function walk(n) { if (!n) return; if (n.type === 'var') vars.add(n.n); walk(n.a); walk(n.b); })(tree);
    if (vars.size > 1) throw new MathError('Use apenas uma variável (x ou t), não as duas.');
    return { tree, v: vars.size ? [...vars][0] : 'x' };
  }

  /* ---------- Avaliação ---------- */
  function ev(n, x) {
    switch (n.type) {
      case 'num': return n.v;
      case 'var': return x;
      case 'neg': return -ev(n.a, x);
      case 'add': return ev(n.a, x) + ev(n.b, x);
      case 'sub': return ev(n.a, x) - ev(n.b, x);
      case 'mul': return ev(n.a, x) * ev(n.b, x);
      case 'div': { const d = ev(n.b, x); return d === 0 ? NaN : ev(n.a, x) / d; }
      case 'pow': {
        const b = ev(n.a, x), e = ev(n.b, x);
        if (b < 0 && !Number.isInteger(e)) {
          // raiz ímpar de negativo (ex.: x^(1/3))
          const q = Math.round(1 / e);
          if (Math.abs(1 / e - q) < 1e-9 && q % 2 !== 0) return -Math.pow(-b, e);
          return NaN;
        }
        if (b === 0 && e < 0) return NaN;
        return Math.pow(b, e);
      }
      case 'fn': {
        const a = ev(n.a, x);
        switch (n.f) {
          case 'sin': return Math.sin(a);
          case 'cos': return Math.cos(a);
          case 'tan': return Math.abs(Math.cos(a)) < 1e-12 ? NaN : Math.tan(a);
          case 'exp': return Math.exp(a);
          case 'ln': return a > 0 ? Math.log(a) : NaN;
          case 'log': return a > 0 ? Math.log10(a) : NaN;
          case 'sqrt': return a >= 0 ? Math.sqrt(a) : NaN;
          case 'abs': return Math.abs(a);
        }
      }
    }
    return NaN;
  }
  const compile = tree => x => ev(tree, x);
  const hasVar = n => !!n && (n.type === 'var' || hasVar(n.a) || hasVar(n.b));

  /* ---------- Formatação ---------- */
  function fmtNum(v, dec = 4) {
    if (!isFinite(v)) return v > 0 ? '∞' : v < 0 ? '-∞' : 'indef.';
    const r = Math.round(v * 10 ** dec) / 10 ** dec;
    if (Object.is(r, -0) || r === 0) return '0';
    return String(r);
  }
  const PREC = { add: 1, sub: 1, mul: 2, div: 2, neg: 3, pow: 4, fn: 5, var: 5, num: 5 };
  const prec = n => (n.type === 'num' && n.v < 0 && !n.name) ? 3 : PREC[n.type];
  function str(n) {
    switch (n.type) {
      case 'num': return n.name ? (n.name === 'pi' ? 'π' : 'e') : fmtNum(n.v, 6);
      case 'var': return n.n;
      case 'fn': return n.f === 'exp' ? (n.a.type === 'var' ? `e^${n.a.n}` : `e^(${str(n.a)})`) : `${n.f}(${str(n.a)})`;
      case 'neg': return '-' + wrap(n.a, prec(n.a) <= 1);
      case 'add': {
        const r = n.b;
        if (r.type === 'neg') return `${str(n.a)} - ${wrap(r.a, prec(r.a) <= 1)}`;
        if (r.type === 'num' && r.v < 0 && !r.name) return `${str(n.a)} - ${fmtNum(-r.v, 6)}`;
        return `${str(n.a)} + ${str(r)}`;
      }
      case 'sub': return `${str(n.a)} - ${wrap(n.b, prec(n.b) <= 1 || n.b.type === 'neg' || (n.b.type === 'num' && n.b.v < 0))}`;
      case 'mul': {
        const L = wrap(n.a, prec(n.a) < 2 || (prec(n.a) === 3 && false));
        const rb = n.b;
        const R = wrap(rb, prec(rb) <= 1 || prec(rb) === 3);
        const implicit = n.a.type === 'num' && !n.a.name && rb.type !== 'num' &&
          (rb.type === 'var' || rb.type === 'fn' || (rb.type === 'pow' && rb.a.type !== 'num') || prec(rb) <= 1 ||
           (rb.type === 'mul' && (varLike(rb.a) || rb.a.type === 'fn')) || (rb.type === 'div' && (varLike(rb.a) || rb.a.type === 'fn')));
        return implicit ? L + R : `${L}·${R}`;
      }
      case 'div': return `${wrap(n.a, prec(n.a) < 2)}/${wrap(n.b, prec(n.b) <= 3 || n.b.type === 'div' || n.b.type === 'mul')}`;
      case 'pow': {
        const base = wrap(n.a, prec(n.a) <= 4 || (n.a.type === 'num' && n.a.v < 0));
        const e = n.b;
        const ex = (e.type === 'num' && e.v >= 0) || e.type === 'var' || e.type === 'fn' ? str(e) : `(${str(e)})`;
        return `${base}^${ex}`;
      }
    }
    return '?';
  }
  const wrap = (n, need) => need ? `(${str(n)})` : str(n);

  /* ---------- Simplificação ---------- */
  const isNum = (n, v) => n.type === 'num' && (v === undefined || (!n.name && Math.abs(n.v - v) < 1e-12));
  const nice = v => isFinite(v) && Math.abs(v * 1e6 - Math.round(v * 1e6)) < 1e-6 && Math.abs(v) < 1e12;
  const plainNum = n => n.type === 'num' && !n.name;
  const same = (a, b) => str(a) === str(b);
  const varLike = n => n.type === 'var' || (n.type === 'pow' && n.a.type === 'var' && plainNum(n.b));
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
  function numNode(v) {
    if (nice(v)) return N(Math.round(v * 1e6) / 1e6);
    for (let q = 2; q <= 24; q++) {
      const p = v * q;
      if (Math.abs(p - Math.round(p)) < 1e-9) return B('div', N(Math.round(p)), N(q));
    }
    return N(v);
  }

  function simp(n) {
    if (!n) return n;
    if (n.type === 'num' || n.type === 'var') return n;
    if (n.type === 'neg') {
      const a = simp(n.a);
      if (plainNum(a)) return N(-a.v);
      if (a.type === 'neg') return a.a;
      if (a.type === 'mul' && plainNum(a.a)) return simp(B('mul', N(-a.a.v), a.b));
      if (a.type === 'div' && plainNum(a.a)) return B('div', N(-a.a.v), a.b);
      return Neg(a);
    }
    if (n.type === 'fn') {
      const a = simp(n.a);
      const out = F(n.f, a);
      if (!hasVar(a)) { const v = ev(out, 0); if (Number.isInteger(Math.round(v * 1e9) / 1e9) && Math.abs(v - Math.round(v)) < 1e-9) return N(Math.round(v)); }
      if (n.f === 'exp' && isNum(a, 1)) return C('e');
      return out;
    }
    const a = simp(n.a), b = simp(n.b);
    switch (n.type) {
      case 'add':
        if (isNum(a, 0)) return b;
        if (isNum(b, 0)) return a;
        if (plainNum(a) && plainNum(b)) return N(a.v + b.v);
        if (b.type === 'neg') return simp(B('sub', a, b.a));
        if (plainNum(b) && b.v < 0) return B('sub', a, N(-b.v));
        if (a.type === 'neg') return simp(B('sub', b, a.a));
        if (same(a, b)) return simp(B('mul', N(2), a));
        return B('add', a, b);
      case 'sub':
        if (isNum(b, 0)) return a;
        if (isNum(a, 0)) return simp(Neg(b));
        if (plainNum(a) && plainNum(b)) return N(a.v - b.v);
        if (same(a, b)) return N(0);
        if (b.type === 'neg') return simp(B('add', a, b.a));
        if (plainNum(b) && b.v < 0) return B('add', a, N(-b.v));
        return B('sub', a, b);
      case 'mul': {
        if (isNum(a, 0) || isNum(b, 0)) return N(0);
        if (isNum(a, 1)) return b;
        if (isNum(b, 1)) return a;
        if (plainNum(a) && plainNum(b)) return N(a.v * b.v);
        if (plainNum(b) && !plainNum(a)) return simp(B('mul', b, a));
        if (isNum(a, -1)) return simp(Neg(b));
        if (a.type === 'neg') return simp(Neg(B('mul', a.a, b)));
        if (b.type === 'neg') return simp(Neg(B('mul', a, b.a)));
        if (plainNum(a) && b.type === 'mul' && plainNum(b.a)) return simp(B('mul', N(a.v * b.a.v), b.b));
        if (plainNum(a) && b.type === 'div' && plainNum(b.b)) {
          const r = a.v / b.b.v;
          if (nice(r)) return simp(B('mul', N(r), b.a));
          const g = gcd(a.v, b.b.v);
          if (Number.isInteger(a.v) && Number.isInteger(b.b.v) && g > 1) return simp(B('div', B('mul', N(a.v / g), b.a), N(b.b.v / g)));
          return B('div', simp(B('mul', a, b.a)), b.b);
        }
        if (plainNum(a) && b.type === 'div' && plainNum(b.a)) return simp(B('div', N(a.v * b.a.v), b.b));
        if (plainNum(a) && b.type === 'div' && !plainNum(b.b)) return simp(B('div', B('mul', a, b.a), b.b));
        if (a.type === 'div' && plainNum(a.a) && plainNum(a.b) && b.type !== 'num') return simp(B('div', B('mul', a.a, b), a.b));
        if (b.type === 'mul' && plainNum(b.a) && !plainNum(a)) return simp(B('mul', b.a, B('mul', a, b.b)));
        if (a.type === 'div' && !plainNum(b)) return simp(B('div', B('mul', a.a, b), a.b));
        if (b.type === 'div' && !plainNum(a)) return simp(B('div', B('mul', a, b.a), b.b));
        if (plainNum(a) && b.type === 'mul' && !plainNum(b.a) && varLike(b.b) && !varLike(b.a)) return B('mul', a, B('mul', b.b, b.a));
        if (!plainNum(a) && !varLike(a) && varLike(b)) return simp(B('mul', b, a));
        if (same(a, b)) return B('pow', a, N(2));
        if (a.type === 'pow' && same(a.a, b) && plainNum(a.b)) return simp(B('pow', b, N(a.b.v + 1)));
        if (b.type === 'pow' && same(b.a, a) && plainNum(b.b)) return simp(B('pow', a, N(b.b.v + 1)));
        if (a.type === 'pow' && b.type === 'pow' && same(a.a, b.a) && plainNum(a.b) && plainNum(b.b)) return simp(B('pow', a.a, N(a.b.v + b.b.v)));
        return B('mul', a, b);
      }
      case 'div': {
        if (isNum(b, 0)) return B('div', a, b);
        if (isNum(a, 0)) return N(0);
        if (isNum(b, 1)) return a;
        if (plainNum(a) && plainNum(b)) {
          const r = a.v / b.v;
          if (nice(r)) return N(r);
          if (Number.isInteger(a.v) && Number.isInteger(b.v)) {
            const g = gcd(a.v, b.v); let p = a.v / g, q = b.v / g;
            if (q < 0) { p = -p; q = -q; }
            return B('div', N(p), N(q));
          }
          return N(r);
        }
        if (same(a, b)) return N(1);
        if (a.type === 'neg') return simp(Neg(B('div', a.a, b)));
        if (plainNum(b) && a.type === 'mul' && plainNum(a.a)) {
          const r = a.a.v / b.v; if (nice(r)) return simp(B('mul', N(r), a.b));
        }
        if (plainNum(b) && b.v < 0) return simp(Neg(B('div', a, N(-b.v))));
        if (b.type === 'div') return simp(B('div', B('mul', a, b.b), b.a));
        if (a.type === 'div' && plainNum(a.b) && plainNum(b)) return simp(B('div', a.a, N(a.b.v * b.v)));
        {
          const ca = a.type === 'mul' && plainNum(a.a) ? a.a.v : plainNum(a) ? a.v : 1;
          const cb = b.type === 'mul' && plainNum(b.a) ? b.a.v : 1;
          if (cb !== 1 && Number.isInteger(ca) && Number.isInteger(cb)) {
            const g = gcd(ca, cb);
            if (g > 1) {
              const ra = plainNum(a) ? N(a.v / g) : B('mul', N(ca / g), a.b);
              return simp(B('div', ra, B('mul', N(cb / g), b.b)));
            }
          }
        }
        return B('div', a, b);
      }
      case 'pow':
        if (isNum(b, 0)) return N(1);
        if (isNum(b, 1)) return a;
        if (isNum(a, 1)) return N(1);
        if (plainNum(a) && plainNum(b)) { const r = Math.pow(a.v, b.v); if (nice(r)) return N(r); }
        if (a.type === 'pow' && plainNum(a.b) && plainNum(b)) return simp(B('pow', a.a, N(a.b.v * b.v)));
        if (a.type === 'num' && a.name === 'e') return F('exp', b);
        return B('pow', a, b);
    }
    return n;
  }

  /* ---------- Física do projétil (usada em Funções e Derivadas) ---------- */
  const physics = {
    projectile(v0, deg, h0, g) {
      const th = deg * Math.PI / 180, vx = v0 * Math.cos(th), vy = v0 * Math.sin(th);
      const tFlight = (vy + Math.sqrt(vy * vy + 2 * g * h0)) / g;
      return { vx, vy, tFlight, range: vx * tFlight, hmax: h0 + vy * vy / (2 * g), tApex: vy / g,
        a: -g / (2 * vx * vx), b: Math.tan(th), c: h0 };
    },
  };

  return {
    normalize, tokenize, parse, ev, compile, str, simp, fmtNum, hasVar, MathError, physics,
    // construtores de nós e utilitários internos, usados pelos módulos
    _: { N, C, V, B, Neg, F, isNum, numNode, plainNum, nice },
  };
})();
