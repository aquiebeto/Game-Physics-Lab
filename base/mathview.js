/* =========================================================
   MATHVIEW — escrita matemática e leitura por extenso
   Responsável: Integrante 1
   - html(): mostra a árvore da expressão como no caderno (x², frações)
   - speak(): lê a expressão em português ("xis ao quadrado")
   - steps(): resolve na ordem das operações, passo a passo
   - say(): leitura em voz alta; hint(): dica para erros de digitação
   ========================================================= */
const MathView = (() => {
  const br = v => CDI.fmtNum(v, 4).replace('.', ',');
  const PREC = { add: 1, sub: 1, mul: 2, div: 2, neg: 3, pow: 4, fn: 5, var: 5, num: 5 };
  const prec = n => (n.type === 'num' && n.v < 0 && !n.name) ? 3 : PREC[n.type];
  const FN_PT = { sin: 'sen', cos: 'cos', tan: 'tg', ln: 'ln', log: 'log' };

  /* ---------- notação matemática (HTML) ---------- */
  function html(n, inline = false) {
    const P = (x, need) => need ? `<span class="par">(</span>${html(x, inline)}<span class="par">)</span>` : html(x, inline);
    switch (n.type) {
      case 'num': return n.name ? (n.name === 'pi' ? 'π' : '<i>e</i>') : (n.v < 0 ? '−' + br(-n.v) : br(n.v));
      case 'var': return `<i>${n.n}</i>`;
      case 'neg': return '−' + P(n.a, prec(n.a) <= 2);
      case 'add': {
        if (n.b.type === 'neg') return `${html(n.a, inline)} − ${P(n.b.a, prec(n.b.a) <= 1)}`;
        if (n.b.type === 'num' && n.b.v < 0 && !n.b.name) return `${html(n.a, inline)} − ${br(-n.b.v)}`;
        return `${html(n.a, inline)} + ${html(n.b, inline)}`;
      }
      case 'sub': return `${html(n.a, inline)} − ${P(n.b, prec(n.b) <= 1 || prec(n.b) === 3)}`;
      case 'mul': {
        const L = P(n.a, prec(n.a) < 2), R = P(n.b, prec(n.b) <= 1 || prec(n.b) === 3);
        const implicit = n.a.type === 'num' && n.b.type !== 'num' && n.b.type !== 'neg' && !(n.b.type === 'div' && !inline);
        return implicit ? L + R : `${L}·${R}`;
      }
      case 'div':
        if (inline) return `${P(n.a, prec(n.a) < 2)}/${P(n.b, prec(n.b) <= 3)}`;
        return `<span class="frac"><span>${html(n.a)}</span><span>${html(n.b)}</span></span>`;
      case 'pow': {
        const base = P(n.a, prec(n.a) <= 4 || (n.a.type === 'num' && n.a.v < 0));
        return `${base}<sup>${html(n.b, true)}</sup>`;
      }
      case 'fn': {
        const a = html(n.a, inline);
        if (n.f === 'sqrt') return `<span class="sq">√</span><span class="par">(</span>${a}<span class="par">)</span>`;
        if (n.f === 'abs') return `|${a}|`;
        if (n.f === 'exp') return `<i>e</i><sup>${html(n.a, true)}</sup>`;
        return `${FN_PT[n.f] || n.f}<span class="par">(</span>${a}<span class="par">)</span>`;
      }
    }
    return '?';
  }
  const box = n => `<span class="mathv">${html(n)}</span>`;

  /* ---------- leitura por extenso (para leitores de tela e voz) ---------- */
  const NUMW = { 2: 'ao quadrado', 3: 'ao cubo' };
  function speak(n) {
    const atom = x => ['num', 'var', 'fn'].includes(x.type) || (x.type === 'pow' && atom(x.a));
    const G = x => atom(x) ? speak(x) : `abre parênteses, ${speak(x)}, fecha parênteses`;
    switch (n.type) {
      case 'num': return n.name ? (n.name === 'pi' ? 'pi' : 'e') : (n.v < 0 ? 'menos ' + br(-n.v) : br(n.v));
      case 'var': return n.n === 'x' ? 'xis' : 'tê';
      case 'neg': return 'menos ' + G(n.a);
      case 'add': return `${speak(n.a)} mais ${speak(n.b)}`;
      case 'sub': return `${speak(n.a)} menos ${n.b.type === 'add' || n.b.type === 'sub' ? G(n.b) : speak(n.b)}`;
      case 'mul': return `${G(n.a)} vezes ${G(n.b)}`;
      case 'div': return `${G(n.a)} dividido por ${G(n.b)}`;
      case 'pow': {
        const e = n.b.type === 'num' && !n.b.name ? n.b.v : null;
        if (e === 2 || e === 3) return `${G(n.a)} ${NUMW[e]}`;
        if (n.b.type === 'div' && n.b.a.type === 'num' && n.b.b.type === 'num' && n.b.a.v === 1 && n.b.b.v === 2) return `${G(n.a)} elevado a um meio, ou seja, raiz quadrada`;
        return `${G(n.a)} elevado a ${G(n.b)}`;
      }
      case 'fn': {
        const W = { sqrt: 'raiz quadrada de', sin: 'seno de', cos: 'cosseno de', tan: 'tangente de', exp: 'e elevado a', ln: 'logaritmo natural de', log: 'logaritmo na base 10 de', abs: 'módulo de' };
        return `${W[n.f]} ${G(n.a)}`;
      }
    }
    return '';
  }

  /* ---------- ordem das operações passo a passo ---------- */
  const OPN = { add: 'Adição', sub: 'Subtração', mul: 'Multiplicação', div: 'Divisão', pow: 'Potência', neg: 'Sinal negativo', fn: 'Função' };
  const FNN = { sqrt: 'Raiz quadrada', sin: 'Seno', cos: 'Cosseno', tan: 'Tangente', exp: 'Exponencial', ln: 'Logaritmo natural', log: 'Logaritmo base 10', abs: 'Módulo' };
  function steps(tree, x) {
    const out = [];
    function go(n) {
      if (n.type === 'num') return n;
      if (n.type === 'var') return { type: 'num', v: x };
      const copy = { ...n };
      if (n.a) copy.a = go(n.a);
      if (n.b) copy.b = go(n.b);
      const v = CDI.ev(copy, x);
      out.push({ op: n.type === 'fn' ? FNN[n.f] : OPN[n.type], html: html(copy), v });
      return { type: 'num', v };
    }
    const r = go(tree);
    return { steps: out, value: r.v };
  }

  /* ---------- voz ---------- */
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
  function say(text) {
    if (!canSpeak) return false;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = 'pt-BR'; u.rate = 0.95;
      const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith('pt'));
      if (v) u.voice = v;
      speechSynthesis.speak(u); return true;
    } catch (e) { return false; }
  }

  /* ---------- dica amigável para erros ---------- */
  function hint(src, msg) {
    const s = String(src);
    const open = (s.match(/\(/g) || []).length, close = (s.match(/\)/g) || []).length;
    if (open !== close) return `Você abriu ${open} e fechou ${close} parêntese(s). Todo “(” precisa de um “)”.`;
    if (/[+\-*/^(]\s*\)/.test(s)) return 'Há um operador ou parêntese vazio antes de “)”. Complete o que falta dentro dos parênteses.';
    if (/[+\-*/^]\s*$/.test(s)) return 'A expressão termina com um operador. Complete a conta: por exemplo, “2x +” → “2x + 1”.';
    if (/\b(sin|cos|tan|sen|ln|log|sqrt|exp|abs)\s+[a-z0-9]/i.test(s)) return 'Funções precisam de parênteses: escreva sen(x), não sen x.';
    if (/[a-z]/i.test(s) && /y|z|a|b|c|n/.test(s.replace(/sin|cos|tan|sen|ln|log|sqrt|exp|abs|pi|tg/gi, ''))) return 'A única variável aceita é x (ou t). Troque outras letras por números ou por x.';
    if (/\d\s*\.\s*\./.test(s) || /\.\./.test(s)) return 'Cada número só pode ter um separador decimal.';
    return 'Confira os sinais na aba Acessibilidade → “Guia de sinais”.';
  }

  return { html, box, speak, steps, say, canSpeak, hint, br };
})();

