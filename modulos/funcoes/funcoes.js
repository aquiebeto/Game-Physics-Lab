/* =========================================================
   MÓDULO AULA 1 — FUNÇÕES
   Responsável: Integrante 1
   - 8 funções do jogo (constante, linear, afim, quadrática,
     exponencial, logarítmica, modular, trigonométrica) com
     domínio, imagem, entradas/saídas, gráfico, tabela e simulação
   - Cartão "Aprenda": máquina de função + quiz
   O módulo se registra com GPL.register(); o núcleo (base/app.js)
   cria a aba, a seção e chama init().
   ========================================================= */
(() => {
  const { $, css, br, esc, show, num, parsePoint, fmtPt, reduced, fillPresets, C1, C2, C3, C4 } = GPL.h;

  /* ======================= AULA 1 — FUNÇÕES ======================= */
  const FUNS = [
    {
      id: 'const', nome: 'Constante', tipo: 'Função constante', titulo: 'Gravidade do mundo',
      ctx: 'Em um jogo de plataforma a aceleração da gravidade é a mesma em qualquer instante: não importa o tempo t, g(t) devolve sempre o mesmo valor.',
      params: [{ k: 'c', l: 'Gravidade c (m/s²)', d: 9.8 }, { k: 'T', l: 'Duração T (s)', d: 10 }],
      check: p => p.T > 0 ? null : 'A duração T deve ser positiva.',
      formula: p => `g(t) = ${br(p.c)}`,
      f: p => () => p.c, dom: p => [0, p.T], xname: 't', yname: 'g(t)',
      info: p => ({ 'Tipo': 'Constante: f(x) = c', 'Domínio (matemático)': 'ℝ', 'Imagem (matemático)': `{${br(p.c)}}`, 'Domínio no jogo': `t ∈ [0; ${br(p.T)}] s`, 'Imagem no jogo': `{${br(p.c)}} m/s²`, 'Entrada → saída': 'tempo (s) → aceleração (m/s²)' }),
      interp: p => `O gráfico é uma reta horizontal na altura ${br(p.c)}: a gravidade não depende do tempo. Por isso a <b>taxa de variação é zero</b> (será a regra da constante na Aula 3) e, integrando g(t), obteremos a velocidade que cresce linearmente.`,
    },
    {
      id: 'lin', nome: 'Linear', tipo: 'Função linear', titulo: 'Moedas por inimigos derrotados',
      ctx: 'Cada inimigo derrotado dá a mesma quantidade de moedas. O total é proporcional ao número de inimigos — uma função linear que passa pela origem.',
      params: [{ k: 'k', l: 'Moedas por inimigo k', d: 15 }, { k: 'N', l: 'Máx. de inimigos N', d: 20 }],
      check: p => (Number.isInteger(p.N) && p.N > 0 && p.N <= 200) ? null : 'N deve ser um inteiro entre 1 e 200.',
      formula: p => `M(n) = ${br(p.k)}·n`,
      f: p => n => p.k * n, dom: p => [0, p.N], discrete: true, xname: 'n', yname: 'M(n)',
      info: p => ({ 'Tipo': 'Linear: f(x) = a·x (b = 0)', 'Domínio (matemático)': 'ℝ', 'Imagem (matemático)': p.k === 0 ? '{0}' : 'ℝ', 'Domínio no jogo': `n ∈ {0, 1, …, ${p.N}} (inteiros)`, 'Imagem no jogo': `{0, ${br(p.k)}, …, ${br(p.k * p.N)}}`, 'Entrada → saída': 'inimigos → moedas' }),
      interp: p => `Como M(0) = 0 e cada inimigo soma ${br(p.k)} moedas, os pontos estão sobre uma reta que passa pela origem com inclinação ${br(p.k)}. O domínio no jogo é <b>discreto</b> (não existe meio inimigo), por isso o gráfico é de pontos.`,
    },
    {
      id: 'afim', nome: 'Afim', tipo: 'Função afim', titulo: 'Posição do personagem andando',
      ctx: 'O personagem começa na posição x₀ e anda com velocidade constante v. Sua posição em cada instante é uma função afim do tempo.',
      params: [{ k: 'x0', l: 'Posição inicial x₀ (m)', d: 5 }, { k: 'v', l: 'Velocidade v (m/s)', d: 4 }, { k: 'T', l: 'Duração T (s)', d: 10 }],
      check: p => p.T > 0 ? null : 'A duração T deve ser positiva.',
      formula: p => `x(t) = ${br(p.x0)} + ${br(p.v)}·t`,
      f: p => t => p.x0 + p.v * t, dom: p => [0, p.T], xname: 't', yname: 'x(t)',
      info: p => {
        const a = p.x0, b = p.x0 + p.v * p.T;
        return { 'Tipo': 'Afim: f(x) = a·x + b', 'Domínio (matemático)': 'ℝ', 'Imagem (matemático)': p.v === 0 ? `{${br(p.x0)}}` : 'ℝ', 'Domínio no jogo': `t ∈ [0; ${br(p.T)}] s`, 'Imagem no jogo': `[${br(Math.min(a, b))}; ${br(Math.max(a, b))}] m`, 'Entrada → saída': 'tempo (s) → posição (m)' };
      },
      interp: p => `O coeficiente angular ${br(p.v)} é a velocidade (metros por segundo) e o coeficiente linear ${br(p.x0)} é a posição inicial (onde a reta corta o eixo vertical). ${p.v > 0 ? 'Como v > 0 a função é crescente: o personagem anda para a direita.' : p.v < 0 ? 'Como v < 0 a função é decrescente: o personagem anda para a esquerda.' : 'Com v = 0 a função vira constante: o personagem está parado.'}`,
    },
    {
      id: 'quad', nome: 'Quadrática', tipo: 'Função quadrática', titulo: 'Trajetória de um projétil',
      ctx: 'Uma flecha é lançada com velocidade v₀ e ângulo θ. Eliminando o tempo das equações do movimento, a altura y em função da distância horizontal x é uma parábola.',
      params: [{ k: 'v0', l: 'Velocidade v₀ (m/s)', d: 20 }, { k: 'th', l: 'Ângulo θ (°)', d: 45 }, { k: 'h0', l: 'Altura inicial h₀ (m)', d: 0 }, { k: 'g', l: 'Gravidade g (m/s²)', d: 9.8 }],
      check: p => p.v0 <= 0 ? 'v₀ deve ser positiva.' : (p.th <= 0 || p.th >= 90) ? 'O ângulo deve estar entre 0° e 90° (exclusive).' : p.g <= 0 ? 'g deve ser positiva.' : p.h0 < 0 ? 'h₀ não pode ser negativa.' : null,
      pr: p => CDI.physics.projectile(p.v0, p.th, p.h0, p.g),
      formula: p => { const r = CDI.physics.projectile(p.v0, p.th, p.h0, p.g); return `y(x) = ${br(r.a, 5)}x² + ${br(r.b)}x + ${br(r.c)}`; },
      f: p => { const r = CDI.physics.projectile(p.v0, p.th, p.h0, p.g); return x => r.a * x * x + r.b * x + r.c; },
      dom: p => [0, CDI.physics.projectile(p.v0, p.th, p.h0, p.g).range], xname: 'x', yname: 'y(x)',
      info: p => {
        const r = CDI.physics.projectile(p.v0, p.th, p.h0, p.g);
        const xv = -r.b / (2 * r.a);
        return { 'Tipo': 'Quadrática: a·x² + b·x + c (a < 0)', 'Domínio (matemático)': 'ℝ', 'Imagem (matemático)': `(−∞; ${br(r.hmax)}]`, 'Domínio no jogo': `x ∈ [0; ${br(r.range)}] m`, 'Imagem no jogo': `[0; ${br(r.hmax)}] m`, 'Vértice (pico)': `(${br(xv)}; ${br(r.hmax)})`, 'Alcance (raiz)': `${br(r.range)} m`, 'Entrada → saída': 'distância (m) → altura (m)' };
      },
      interp: p => { const r = CDI.physics.projectile(p.v0, p.th, p.h0, p.g); return `Como a < 0 a parábola tem concavidade para baixo: o <b>vértice</b> é o ponto mais alto (${br(r.hmax)} m) e a <b>raiz positiva</b> é onde a flecha toca o chão (${br(r.range)} m). O jogo usa o alcance para posicionar o alvo e o vértice para checar colisão com o teto. Fora de [0; alcance] a fórmula ainda existe, mas não tem sentido físico (a flecha já caiu).`; },
    },
    {
      id: 'exp', nome: 'Exponencial', tipo: 'Função exponencial', titulo: 'Escala de vida (HP) dos inimigos',
      ctx: 'Em RPGs o HP dos inimigos cresce uma porcentagem fixa por nível. Crescimento percentual constante gera uma função exponencial.',
      params: [{ k: 'H', l: 'HP no nível 0', d: 100 }, { k: 'r', l: 'Aumento por nível (%)', d: 20 }, { k: 'N', l: 'Nível máximo N', d: 15 }],
      check: p => p.H <= 0 ? 'O HP inicial deve ser positivo.' : p.r <= -100 ? 'O aumento deve ser maior que −100%.' : (!Number.isInteger(p.N) || p.N < 1 || p.N > 100) ? 'N deve ser inteiro entre 1 e 100.' : null,
      formula: p => `HP(n) = ${br(p.H)}·${br(1 + p.r / 100)}ⁿ`,
      f: p => n => p.H * Math.pow(1 + p.r / 100, n), dom: p => [0, p.N], discrete: true, xname: 'n', yname: 'HP(n)',
      info: p => {
        const q = 1 + p.r / 100, end = p.H * q ** p.N;
        return { 'Tipo': 'Exponencial: a·bˣ (b > 0, b ≠ 1)', 'Domínio (matemático)': 'ℝ', 'Imagem (matemático)': q === 1 ? `{${br(p.H)}}` : '(0; +∞)', 'Domínio no jogo': `n ∈ {0, 1, …, ${p.N}}`, 'Imagem no jogo': `[${br(Math.min(p.H, end), 1)}; ${br(Math.max(p.H, end), 1)}] HP`, 'Dobra a cada': q > 1 ? `${br(Math.log(2) / Math.log(q), 2)} níveis` : '—', 'Entrada → saída': 'nível → pontos de vida' };
      },
      interp: p => { const q = 1 + p.r / 100; return q > 1 ? `A base ${br(q)} > 1 faz a função crescer cada vez mais rápido: o HP <b>dobra a cada ${br(Math.log(2) / Math.log(q), 2)} níveis</b> (resolvido com logaritmo: n = ln 2 / ln ${br(q)}). Isso mantém o jogo desafiador, mas o designer precisa limitar N para os números não explodirem.` : q < 1 ? `Base ${br(q)} < 1: o HP decresce exponencialmente e se aproxima de 0 sem nunca chegar (assíntota y = 0).` : 'Base 1: a função vira constante.'; },
    },
    {
      id: 'log', nome: 'Logarítmica', tipo: 'Função logarítmica', titulo: 'Nível do jogador pela experiência (XP)',
      ctx: 'Subir de nível fica cada vez mais difícil: cada nível exige o dobro de XP do anterior. O nível em função do XP é um logaritmo (a inversa da exponencial).',
      params: [{ k: 'b', l: 'Base b (fator de XP)', d: 2 }, { k: 'x0', l: 'XP do nível 1', d: 100 }, { k: 'xm', l: 'XP máximo', d: 12800 }],
      check: p => (p.b <= 0 || p.b === 1) ? 'A base deve ser positiva e diferente de 1.' : p.x0 <= 0 ? 'O XP do nível 1 deve ser positivo.' : p.xm <= p.x0 ? 'O XP máximo deve ser maior que o XP do nível 1.' : null,
      formula: p => `L(xp) = 1 + log_${br(p.b)}(xp / ${br(p.x0)})`,
      f: p => x => x > 0 ? 1 + Math.log(x / p.x0) / Math.log(p.b) : NaN, dom: p => [p.x0, p.xm], xname: 'xp', yname: 'L(xp)',
      info: p => ({ 'Tipo': 'Logarítmica: a + log_b(x/c)', 'Domínio (matemático)': 'xp > 0  ⇒  (0; +∞)', 'Imagem (matemático)': 'ℝ', 'Domínio no jogo': `xp ∈ [${br(p.x0)}; ${br(p.xm)}]`, 'Imagem no jogo': `[1; ${br(1 + Math.log(p.xm / p.x0) / Math.log(p.b), 3)}]`, 'Entrada → saída': 'experiência → nível' }),
      interp: p => `O logaritmo cresce cada vez mais devagar: de ${br(p.x0)} para ${br(p.x0 * p.b)} XP o jogador sobe 1 nível, mas para subir mais 1 precisa ir até ${br(p.x0 * p.b * p.b)} XP. A restrição <b>xp > 0</b> do domínio vem do logaritmo, que não existe para valores ≤ 0 — o app trata esses valores como indefinidos.`,
    },
    {
      id: 'mod', nome: 'Modular', tipo: 'Função modular', titulo: 'Distância até o checkpoint',
      ctx: 'Em um mapa horizontal o volume do sinal do checkpoint depende da distância até ele, e distância nunca é negativa: d(x) = |x − c|.',
      params: [{ k: 'c', l: 'Posição do checkpoint c (m)', d: 60 }, { k: 'L', l: 'Largura do mapa (m)', d: 100 }],
      check: p => p.L <= 0 ? 'A largura do mapa deve ser positiva.' : (p.c < 0 || p.c > p.L) ? 'O checkpoint deve estar dentro do mapa [0; L].' : null,
      formula: p => `d(x) = |x − ${br(p.c)}|`,
      f: p => x => Math.abs(x - p.c), dom: p => [0, p.L], xname: 'x', yname: 'd(x)',
      info: p => ({ 'Tipo': 'Modular: |x − c|', 'Domínio (matemático)': 'ℝ', 'Imagem (matemático)': '[0; +∞)', 'Domínio no jogo': `x ∈ [0; ${br(p.L)}] m`, 'Imagem no jogo': `[0; ${br(Math.max(p.c, p.L - p.c))}] m`, 'Entrada → saída': 'posição do jogador → distância' }),
      interp: p => `O gráfico em “V” tem o bico em x = ${br(p.c)}, onde a distância é zero. À esquerda do checkpoint d(x) = ${br(p.c)} − x e à direita d(x) = x − ${br(p.c)}. No bico a função é contínua mas <b>não é derivável</b> (as inclinações laterais são −1 e +1) — ligação direta com limites laterais na Aula 2.`,
    },
    {
      id: 'trig', nome: 'Trigonométrica', tipo: 'Função trigonométrica', titulo: 'Moeda flutuante (oscilação)',
      ctx: 'Itens coletáveis “flutuam” subindo e descendo suavemente. Esse movimento periódico é modelado por uma função seno.',
      params: [{ k: 'y0', l: 'Altura média y₀ (m)', d: 2 }, { k: 'A', l: 'Amplitude A (m)', d: 0.5 }, { k: 'fr', l: 'Frequência (Hz)', d: 0.5 }, { k: 'T', l: 'Duração (s)', d: 6 }],
      check: p => p.fr <= 0 ? 'A frequência deve ser positiva.' : p.T <= 0 ? 'A duração deve ser positiva.' : null,
      formula: p => `y(t) = ${br(p.y0)} + ${br(p.A)}·sen(2π·${br(p.fr)}·t)`,
      f: p => t => p.y0 + p.A * Math.sin(2 * Math.PI * p.fr * t), dom: p => [0, p.T], xname: 't', yname: 'y(t)',
      info: p => ({ 'Tipo': 'Trigonométrica: a + A·sen(ωt)', 'Domínio (matemático)': 'ℝ', 'Imagem (matemático)': `[${br(p.y0 - Math.abs(p.A))}; ${br(p.y0 + Math.abs(p.A))}]`, 'Domínio no jogo': `t ∈ [0; ${br(p.T)}] s`, 'Imagem no jogo': `[${br(p.y0 - Math.abs(p.A))}; ${br(p.y0 + Math.abs(p.A))}] m`, 'Período': `${br(1 / p.fr)} s`, 'Entrada → saída': 'tempo (s) → altura (m)' }),
      interp: p => `A imagem é limitada porque −1 ≤ sen ≤ 1: a moeda nunca passa de ${br(p.y0 + Math.abs(p.A))} m nem desce abaixo de ${br(p.y0 - Math.abs(p.A))} m. O <b>período</b> 1/f = ${br(1 / p.fr)} s é o tempo de um ciclo completo; o jogo repete a animação sem “emendas” visíveis.`,
    },
  ];
  let curFn = FUNS[3], fnPlot, fnAnim = null;
  const fnVals = {};
  function buildFnChips() {
    $('fn-chips').innerHTML = FUNS.map(F => `<button class="chip${F === curFn ? ' on' : ''}" data-id="${F.id}">${F.nome}<small>${esc(F.titulo.split(' ')[0])}</small></button>`).join('');
    $('fn-chips').querySelectorAll('.chip').forEach(b => b.onclick = () => { curFn = FUNS.find(F => F.id === b.dataset.id); buildFnChips(); buildFnParams(); updateFn(); });
  }
  function buildFnParams() {
    const F = curFn; fnVals[F.id] = fnVals[F.id] || Object.fromEntries(F.params.map(p => [p.k, p.d]));
    $('fn-title').innerHTML = `${esc(F.titulo)} <span class="tag">${esc(F.tipo)}</span>`;
    $('fn-ctx').textContent = F.ctx;
    $('fn-params').innerHTML = F.params.map(p => `<label class="f">${esc(p.l)}<input data-k="${p.k}" value="${fnVals[F.id][p.k]}" inputmode="decimal"></label>`).join('');
    $('fn-params').querySelectorAll('input').forEach(i => i.oninput = updateFn);
  }
  function readFnParams() {
    const p = {};
    for (const i of $('fn-params').querySelectorAll('input')) {
      const raw = i.value.trim().replace(',', '.'); const v = Number(raw);
      const bad = raw === '' || !isFinite(v); i.classList.toggle('err', bad);
      if (bad) throw new CDI.MathError(`“${curFn.params.find(q => q.k === i.dataset.k).l}” precisa ser um número.`);
      p[i.dataset.k] = v;
    }
    return p;
  }
  function updateFn() {
    stopFnAnim();
    const F = curFn;
    try {
      const p = readFnParams();
      const e = F.check(p); if (e) throw new CDI.MathError(e);
      fnVals[F.id] = p;
      show($('fn-err'), false);
      $('fn-formula').textContent = F.formula(p);
      $('fn-kv').innerHTML = Object.entries(F.info(p)).map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('');
      $('fn-interp').innerHTML = F.interp(p);
      const f = F.f(p), [a, b] = F.dom(p);
      let cfg;
      if (F.discrete) {
        const pts = []; for (let n = a; n <= b; n++) pts.push({ x: n, y: f(n) });
        cfg = { xmin: a - 0.5, xmax: b + 0.5, series: [{ pts, color: C1(), discrete: true, label: F.yname }], xname: F.xname, xlabel: F.xname };
        cfg.series[0].f = x => { const n = Math.round(x); return n >= a && n <= b ? f(n) : NaN; };
      } else {
        const m = (b - a) * 0.04;
        cfg = { xmin: a - m, xmax: b + m, series: [{ f: x => (x >= a - 1e-9 && x <= b + 1e-9) ? f(x) : NaN, color: C1(), label: F.yname }], xname: F.xname, xlabel: F.xname };
        if (F.id === 'quad') cfg.zero = true;
      }
      if (F.id === 'quad') {
        const r = F.pr(p);
        cfg.points = [{ x: -r.b / (2 * r.a), y: r.hmax, color: C2(), label: 'vértice' }, { x: r.range, y: 0, color: C3(), label: 'alcance' }];
      }
      fnPlot.draw(cfg);
      // tabela
      const rows = [];
      if (F.discrete) { const step = Math.max(1, Math.ceil((b - a) / 10)); for (let n = a; n <= b; n += step) rows.push(n); if (rows[rows.length - 1] !== b) rows.push(b); }
      else for (let i = 0; i <= 10; i++) rows.push(a + (b - a) * i / 10);
      $('fn-table').innerHTML = `<table><tr><th>Entrada ${esc(F.xname)}</th>${rows.map(x => `<td>${br(x, 3)}</td>`).join('')}</tr><tr><th>Saída ${esc(F.yname)}</th>${rows.map(x => `<td>${br(f(x), 3)}</td>`).join('')}</tr></table>`;
      $('fn-sim').disabled = false;
    } catch (err) {
      $('fn-err').textContent = err.message; show($('fn-err'));
      $('fn-sim').disabled = true;
    }
  }
  function stopFnAnim() { if (fnAnim) cancelAnimationFrame(fnAnim); fnAnim = null; $('fn-sim-out').textContent = ''; if (fnPlot) { fnPlot.marker = null; fnPlot.render(); } }
  function simFn() {
    stopFnAnim();
    const F = curFn, p = fnVals[F.id], f = F.f(p), [a, b] = F.dom(p);
    const dur = 3000, t0 = performance.now();
    const step = now => {
      const k = reduced() ? 1 : Math.min(1, (now - t0) / dur);
      let x = a + (b - a) * k; if (F.discrete) x = Math.round(x);
      fnPlot.marker = { x, y: f(x), color: css('--c2') }; fnPlot.render();
      $('fn-sim-out').textContent = `${F.xname} = ${br(x, 2)}  →  ${F.yname} = ${br(f(x), 3)}`;
      if (k < 1) fnAnim = requestAnimationFrame(step); else fnAnim = null;
    };
    fnAnim = requestAnimationFrame(step);
  }



  /* ======================= CARTÃO "APRENDA" ======================= */
  function aprenda() {
    // ---- Funções: máquina de função
    const MACH = [['x^2', 'Quadrado'], ['2x + 1', 'Afim'], ['sqrt(x)', 'Raiz'], ['1/x', 'Inverso'], ['ln(x)', 'Logaritmo']];
    $('mf-sel').innerHTML = MACH.map((m, i) => `<option value="${i}">${m[1]}: ${m[0]}</option>`).join('');
    const runMach = () => {
      const [e] = MACH[+$('mf-sel').value], P = CDI.parse(e), x = Number($('mf-x').value);
      $('mf-x-out').textContent = br(x);
      const y = CDI.ev(P.tree, x);
      $('mf-in').textContent = br(x);
      $('mf-f').innerHTML = `f(<i>x</i>) = ${MathView.html(P.tree)}`;
      $('mf-out').textContent = isFinite(y) ? br(y) : '✖';
      $('mf-out').parentElement.classList.toggle('bad', !isFinite(y));
      const why = { 'sqrt(x)': 'não existe raiz quadrada real de número negativo', '1/x': 'não se divide por zero', 'ln(x)': 'o logaritmo só existe para números positivos' }[e];
      $('mf-msg').innerHTML = isFinite(y) ? `A entrada <b>${br(x)}</b> pertence ao domínio e gera a saída <b>${br(y)}</b>.` : `A entrada <b>${br(x)}</b> está <b>fora do domínio</b>: ${why}.`;
      if (!reduced()) $('mf-machine').animate([{ filter: 'brightness(1.6)' }, { filter: 'brightness(1)' }], { duration: 300 });
    };
    $('mf-sel').onchange = runMach; $('mf-x').oninput = runMach; runMach();
    UI.quiz($('q-fun'), [
      { q: 'Qual é o domínio de f(x) = ln(x)?', o: ['Todos os reais', 'x > 0', 'x ≥ 0', 'x ≠ 1'], c: 1, e: 'O logaritmo só é definido para valores positivos.' },
      { q: 'A imagem de y = 2 + 0,5·sen(t) é:', o: ['[−1; 1]', '[1,5; 2,5]', '[0; 2,5]', 'Todos os reais'], c: 1, e: 'Como −1 ≤ sen(t) ≤ 1, y varia entre 2 − 0,5 e 2 + 0,5.' },
      { q: 'Em x(t) = 10 − 3t, o personagem…', o: ['anda para a direita', 'fica parado', 'anda para a esquerda', 'acelera'], c: 2, e: 'O coeficiente angular −3 é negativo: a posição diminui com o tempo.' },
      { q: 'Qual mecânica é melhor modelada por uma função exponencial?', o: ['Moeda flutuando', 'HP que cresce 20% por nível', 'Distância até um ponto', 'Gravidade'], c: 1, e: 'Crescimento percentual constante gera bⁿ.' },
    ]);

  }

  /* ======================= HTML DA SEÇÃO ======================= */
  const HTML = `
  <div class="mod-head"><span class="mod-badge">AULA 1</span><div>
    <h2>Funções que movem o jogo</h2>
    <p>Escolha uma mecânica. Para cada função o app identifica o tipo, a lei de formação, o domínio, a imagem, as entradas e saídas e gera o gráfico e a tabela. Altere os parâmetros para ver a função mudar.</p>
  </div></div>
  <details class="card learn" open>
    <summary><h3>📘 Aprenda: o que é uma função?</h3></summary>
    <div class="grid2">
      <div>
        <p>Uma <b>função</b> é uma regra que transforma cada <b>entrada</b> em <b>exatamente uma saída</b> — como uma máquina. No jogo, a entrada pode ser o tempo, o nível ou a posição, e a saída a altura, o HP ou a distância.</p>
        <ul class="gloss">
          <li><b>Domínio:</b> todas as entradas permitidas.</li>
          <li><b>Imagem:</b> todas as saídas que a função realmente produz.</li>
          <li><b>Variável independente</b> (x ou t) é a entrada; a <b>dependente</b> (y) é a saída.</li>
          <li><b>Gráfico:</b> o desenho de todos os pares (entrada, saída).</li>
        </ul>
      </div>
      <div>
        <div class="machine-ctl"><label class="f">Máquina<select id="mf-sel"></select></label>
        <label class="f">Entrada x = <b id="mf-x-out" class="mono"></b><input type="range" id="mf-x" min="-4" max="4" step="0.5" value="2" aria-label="Entrada da máquina"></label></div>
        <div class="machine" id="mf-machine" aria-live="polite"><div class="m-io"><small>entrada</small><b id="mf-in"></b></div><div class="m-arrow">→</div><div class="m-box" id="mf-f"></div><div class="m-arrow">→</div><div class="m-io"><small>saída</small><b id="mf-out"></b></div></div>
        <p id="mf-msg" class="m-msg"></p>
      </div>
    </div>
    <div class="quiz" id="q-fun"></div>
  </details>
  <h3 class="sec-h">🛠 Funções do jogo</h3>
  <div class="chips" id="fn-chips"></div>
  <div class="card">
    <h3 id="fn-title"></h3>
    <p class="sub" id="fn-ctx"></p>
    <div class="grid2">
      <div>
        <div class="fields" id="fn-params"></div>
        <div class="formula" id="fn-formula"></div>
        <div id="fn-err" class="error hidden"></div>
        <div class="kv" id="fn-kv"></div>
      </div>
      <div>
        <div class="plot"><canvas id="fn-plot"></canvas><div class="tip"></div></div>
        <div class="row" style="margin-top:0"><button id="fn-sim">▶ Simular movimento</button><span id="fn-sim-out" class="mono" style="color:var(--muted);font-size:13px"></span></div>
      </div>
    </div>
    <div class="interp" id="fn-interp"></div>
    <details open><summary>Tabela de valores (entrada → saída)</summary><div class="tbl-wrap" id="fn-table"></div></details>
  </div>
`;

  GPL.register({
    id: 'funcoes', ordem: 1, aba: 'Funções', numero: '01', cor: 'var(--c1)', mod: '1',
    card: { k: 'AULA 1', titulo: 'Funções', resumo: '8 tipos de função modelando mecânicas do jogo.', itens: ['Máquina de função interativa + quiz', 'Domínio, imagem, entradas e saídas', 'Gráfico + tabela de valores', 'Simulação animada'] },
    html: HTML,
    init() {
      fnPlot = new Plot($('fn-plot'));
      buildFnChips(); buildFnParams();
      $('fn-sim').onclick = simFn;
      aprenda();
    },
    onShow: updateFn,
    
  });
})();
