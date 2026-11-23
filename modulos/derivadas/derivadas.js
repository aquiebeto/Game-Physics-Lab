/* =========================================================
   MÓDULO AULA 3 — DERIVADAS
   Responsável: Integrante 3
   - Calculadora de derivadas com regras destacadas, passo a passo,
     verificação numérica e reta tangente
   - Projétil: posição → velocidade → aceleração (pico em y' = 0)
   - Cartão "Aprenda": secante virando tangente + tabela de regras + quiz
   O módulo se registra com GPL.register(); o núcleo (base/app.js)
   cria a aba, a seção e chama init().
   ========================================================= */
(() => {
  const { $, css, br, esc, show, num, parsePoint, fmtPt, reduced, fillPresets, C1, C2, C3, C4 } = GPL.h;

  /* ======================= AULA 3 — DERIVADAS ======================= */
  const D_RULES = ['Constante', 'Potência', 'Soma/Subtração', 'Produto', 'Quociente', 'Cadeia'];
  const D_EXTRA = ['Múltiplo constante', 'Exponencial', 'Logarítmica', 'Trigonométrica'];
  const DV_PRESETS = [
    { n: 'Posição do personagem (constante, potência, soma)', e: '4t^3 - 2t^2 + 5t + 10', x0: '2', i: 's(t) é a posição em metros; s\'(t) é a velocidade em m/s. Em t = x₀ o personagem se move a f\'(x₀) m/s.' },
    { n: 'Escudo pulsante t²·sen(t) (produto)', e: 't^2*sin(t)', x0: '1', i: 'O raio do escudo é o produto de duas funções; a regra do produto dá a velocidade com que o escudo cresce/encolhe.' },
    { n: 'Barra de carregamento 100t/(t+2) (quociente)', e: '100t/(t+2)', x0: '1', i: 'P(t) é a porcentagem carregada. P\'(t) é a taxa de carregamento (% por segundo), que diminui com o tempo — a barra desacelera perto de 100%.' },
    { n: 'Item flutuante 2 + 0,5·sen(3t) (cadeia)', e: '2 + 0.5sin(3t)', x0: '0', i: 'A derivada é a velocidade vertical do item. Em t = 0 ele passa pelo centro com velocidade máxima; nos picos a velocidade é zero.' },
    { n: 'HP exponencial 100·e^(0,2t)', e: '100e^(0.2t)', x0: '5', i: 'A taxa de crescimento do HP é proporcional ao próprio HP (f\' = 0,2·f): a marca registrada da exponencial.' },
    { n: 'Nível ln(t² + 1) (cadeia + log)', e: 'ln(t^2+1)', x0: '1', i: 'A taxa de ganho de nível diminui com o tempo: depois de t = 1 a derivada cai, mostrando o “retorno decrescente”.' },
    { n: 'Distância diagonal √(1 + t²) (cadeia)', e: 'sqrt(1+t^2)', x0: '1', i: 'Distância do jogador a um ponto fixo enquanto anda em linha reta. A derivada se aproxima de 1: longe do ponto, a distância cresce na mesma velocidade da caminhada.' },
    { n: 'Polinômio sobre exponencial (produto + quociente)', e: 'x^3*e^x/(x+2)', x0: '1', i: 'Expressão que combina várias regras de uma vez — útil para conferir que o motor aplica produto, quociente e exponencial em sequência.' },
  ];
  let dvPlot, pjPlot;
  const { ruleBadges, stepsHTML } = UI; // compartilhados com Integrais (base/ui.js)
  function calcDeriv() {
    try {
      const P = CDI.parse($('dv-expr').value), x0 = num('dv-x0', 'Ponto x₀');
      show($('dv-err'), false); show($('dv-out'));
      const D = CDI.derive(P.tree), f = CDI.compile(P.tree), df = CDI.compile(D.result), v = P.v;
      $('dv-rules').innerHTML = ruleBadges(D_RULES, D_EXTRA, D.rules);
      $('dv-res').innerHTML = `<span class="mathv">f′(<i>${v}</i>) = ${MathView.html(D.result)}</span><div class="copy">para digitar: <code>${esc(CDI.str(D.result).replace(/·/g, '*'))}</code></div>`;
      const fx = f(x0), dfx = df(x0), h = 1e-5, numd = (f(x0 + h) - f(x0 - h)) / (2 * h);
      const okNum = isFinite(dfx) && isFinite(numd) && Math.abs(dfx - numd) < 1e-4 * Math.max(1, Math.abs(dfx));
      $('dv-kv').innerHTML = [
        [`f(${br(x0)})`, isFinite(fx) ? br(fx) : 'não definida'],
        [`f'(${br(x0)}) simbólica`, isFinite(dfx) ? br(dfx, 6) : 'não definida'],
        ['Verificação numérica', isFinite(numd) ? `${br(numd, 6)} ${okNum ? '✓' : '✗'}` : '—'],
        ['Reta tangente', isFinite(fx) && isFinite(dfx) ? `y = ${br(dfx)}(${v} − ${br(x0)}) + ${br(fx)}` : '—'],
      ].map(([k, val]) => `<div><b>${esc(k)}</b><span>${esc(val)}</span></div>`).join('');
      $('dv-steps').innerHTML = stepsHTML(D.steps);
      const tan = x => fx + dfx * (x - x0);
      dvPlot.draw({ xmin: x0 - 4, xmax: x0 + 4, xname: v, xlabel: v, series: [
        { f, color: C3(), label: `f(${v})` }, { f: df, color: C1(), label: `f'(${v})`, width: 2 },
        ...(isFinite(fx) && isFinite(dfx) ? [{ f: tan, color: css('--muted'), dash: [5, 4], width: 1.5, label: 'tangente', noFit: true }] : []),
      ], points: isFinite(fx) ? [{ x: x0, y: fx, color: C2(), label: `(${br(x0)}; ${br(fx, 2)})` }] : [] });
      const pre = DV_PRESETS.find(p => p.e === $('dv-expr').value);
      show($('dv-interp'));
      $('dv-interp').innerHTML = (pre ? `<b>No jogo:</b> ${esc(pre.i)} ` : '') + (isFinite(dfx) ? `Em ${v} = ${br(x0)} a função ${dfx > 0 ? '<b>cresce</b>' : dfx < 0 ? '<b>decresce</b>' : 'tem <b>tangente horizontal</b> (ponto crítico)'} com taxa ${br(dfx)} por unidade de ${v}.` : '');
    } catch (err) { $('dv-err').textContent = err.message; show($('dv-err')); show($('dv-out'), false); show($('dv-interp'), false); }
  }
  function calcProj() {
    try {
      const v0 = num('pj-v0', 'v₀'), th = num('pj-th', 'Ângulo'), h0 = num('pj-h0', 'Altura'), g = num('pj-g', 'g');
      if (v0 <= 0 || g <= 0 || h0 < 0 || th <= 0 || th >= 90) throw new CDI.MathError('Use v₀ > 0, g > 0, h₀ ≥ 0 e 0° < θ < 90°.');
      show($('pj-err'), false); show($('pj-out'));
      const vy = v0 * Math.sin(th * Math.PI / 180);
      const R = s => Math.round(s * 1e4) / 1e4;
      const yExpr = `${R(h0)} + ${R(vy)}t - ${R(g / 2)}t^2`;
      const y = CDI.parse(yExpr), d1 = CDI.derive(y.tree), d2 = CDI.derive(d1.result);
      const fy = CDI.compile(y.tree), fd = CDI.compile(d1.result);
      $('pj-y').innerHTML = `<span class="mathv">y(<i>t</i>) = ${MathView.html(CDI.simp(y.tree))}</span> <small>posição</small>`;
      $('pj-dy').innerHTML = `<span class="mathv">y′(<i>t</i>) = ${MathView.html(d1.result)}</span> <small>velocidade vertical</small>`;
      $('pj-ddy').innerHTML = `<span class="mathv">y″(<i>t</i>) = ${MathView.html(d2.result)}</span> <small>aceleração = −g</small>`;
      const used = [...new Set([...d1.rules, ...d2.rules])];
      $('pj-rules').innerHTML = ruleBadges(D_RULES, D_EXTRA, used);
      const pr = CDI.physics.projectile(v0, th, h0, g);
      const tA = R(vy) / (2 * R(g / 2)), tf = pr.tFlight;
      $('pj-kv').innerHTML = [
        ['Pico: y\'(t) = 0', `t* = ${br(tA, 3)} s`],
        ['Altura máxima y(t*)', `${br(fy(tA), 3)} m`],
        ['Tempo até o chão', `${br(tf, 3)} s`],
        ['Velocidade de impacto y\'(t_f)', `${br(fd(tf), 3)} m/s`],
      ].map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('');
      pjPlot.draw({ xmin: 0, xmax: tf, xname: 't', xlabel: 't (s)', series: [{ f: fy, color: C3(), label: 'y(t) altura' }, { f: fd, color: C1(), label: "y'(t) velocidade", width: 2 }],
        points: [{ x: tA, y: fy(tA), color: C2(), label: 'pico' }, { x: tA, y: 0, color: C1(), label: "y' = 0" }] });
      $('pj-interp').innerHTML = `<b>Interpretação:</b> a derivada da altura é a velocidade vertical. Ela começa positiva (${br(vy, 2)} m/s, subindo), diminui ${br(g)} m/s a cada segundo e <b>zera no pico</b> em t = ${br(tA, 2)} s — por isso resolver y'(t) = 0 dá o ponto mais alto sem testar valores. O sinal negativo da velocidade de impacto indica que o projétil está descendo; o jogo usa esse valor para calcular o dano da queda.`;
    } catch (err) { $('pj-err').textContent = err.message; show($('pj-err')); show($('pj-out'), false); }
  }


  /* ---------- gráfico da secante (cartão Aprenda) ---------- */
  let scPlot;
  function secantPlot(f, x0, h, ms, mt) {
    scPlot = scPlot || new Plot($('sc-plot'));
    const y0 = f(x0);
    scPlot.draw({ xmin: x0 - 3, xmax: x0 + 3, xname: 'x', xlabel: 'x', series: [
      { f, color: C3(), label: 'f(x)' },
      { f: x => y0 + ms * (x - x0), color: C2(), label: 'secante', width: 2, noFit: true },
      { f: x => y0 + mt * (x - x0), color: C1(), label: 'tangente', width: 1.5, dash: [5, 4], noFit: true },
    ], points: [{ x: x0, y: y0, color: C2() }, { x: x0 + h, y: f(x0 + h), color: C2(), open: true, label: 'x₀ + h' }] });
  }

  /* ======================= CARTÃO "APRENDA" ======================= */
  function aprenda() {
    // ---- Derivadas: secante → tangente
    const SF = [['x^2', 'x²'], ['sin(x)', 'sen(x)'], ['x^3/3 - x', 'x³/3 − x']];
    $('sc-f').innerHTML = SF.map((s, i) => `<option value="${i}">${s[1]}</option>`).join('');
    const runSec = () => {
      const P = CDI.parse(SF[+$('sc-f').value][0]), f = CDI.compile(P.tree), df = CDI.compile(CDI.derive(P.tree).result);
      const x0 = Number($('sc-x0').value), h = Number($('sc-h').value);
      $('sc-x0-out').textContent = br(x0); $('sc-h-out').textContent = br(h);
      const ms = (f(x0 + h) - f(x0)) / h, mt = df(x0);
      $('sc-ms').textContent = br(ms); $('sc-mt').textContent = br(mt); $('sc-err').textContent = br(Math.abs(ms - mt));
      secantPlot(f, x0, h, ms, mt);
    };
    ['sc-f', 'sc-x0', 'sc-h'].forEach(id => $(id).oninput = runSec); $('sc-f').onchange = runSec; runSec();
    const D_TABLE = [
      ['Constante', '(c)′ = 0', '7'], ['Potência', '(xⁿ)′ = n·xⁿ⁻¹', 'x^5'], ['Soma/Subtração', '(f ± g)′ = f′ ± g′', 'x^3 + x^2 - x'],
      ['Produto', '(f·g)′ = f′·g + f·g′', 'x^2*sin(x)'], ['Quociente', '(f/g)′ = (f′·g − f·g′)/g²', '(x+1)/(x-1)'], ['Cadeia', '[f(g(x))]′ = f′(g(x))·g′(x)', 'sin(x^2)'],
    ];
    $('rules-d').innerHTML = D_TABLE.map(r => `<div class="rule-card"><b>${r[0]}</b><div class="mathv">${r[1]}</div><button type="button" class="mini" data-e="${esc(r[2])}">Exemplo: ${MathView.html(CDI.parse(r[2]).tree, true)} →</button></div>`).join('');
    $('rules-d').querySelectorAll('button').forEach(b => b.onclick = () => GPL.load('dv', b.dataset.e));
    UI.quiz($('q-der'), [
      { q: 'A derivada de 5x³ é:', o: ['15x²', '5x²', '15x³', '3x²'], c: 0, e: 'Potência: 3·5·x³⁻¹ = 15x².' },
      { q: 'Para derivar sen(x²) usamos principalmente a regra…', o: ['do produto', 'da cadeia', 'do quociente', 'da constante'], c: 1, e: 'É uma composição: seno de (x²). Resultado: cos(x²)·2x.' },
      { q: 'Se s(t) é a posição, s′(t) representa:', o: ['a distância total', 'a aceleração', 'a velocidade', 'o tempo'], c: 2, e: 'A taxa de variação da posição é a velocidade.' },
      { q: 'No ponto mais alto de um pulo, a velocidade vertical y′(t) é:', o: ['máxima', 'zero', 'negativa', 'igual a g'], c: 1, e: 'Ela muda de positiva (subindo) para negativa (descendo), passando por zero.' },
    ]);

  }

  /* ======================= HTML DA SEÇÃO ======================= */
  const HTML = `
  <div class="mod-head"><span class="mod-badge">AULA 3</span><div>
    <h2>Derivadas: a taxa de variação de cada mecânica</h2>
    <p>A derivada da posição é a velocidade; a derivada da velocidade é a aceleração. O app deriva simbolicamente, mostra cada regra usada e confere o resultado com uma derivada numérica.</p>
  </div></div>

  <details class="card learn" open>
    <summary><h3>📘 Aprenda: da reta secante à derivada</h3></summary>
    <p>A derivada é a <b>inclinação da reta tangente</b>: a taxa de variação <i>instantânea</i>. Ela nasce de um limite: pegamos dois pontos, x₀ e x₀ + h, traçamos a reta <b>secante</b> e fazemos h → 0.</p>
    <div class="formula" style="white-space:normal"><span class="mathv">f′(x₀) = lim<sub>h→0</sub> <span class="frac"><span>f(x₀ + h) − f(x₀)</span><span>h</span></span></span></div>
    <div class="grid2">
      <div>
        <div class="fields">
          <label class="f wide">Função<select id="sc-f"></select></label>
          <label class="f wide">Ponto x₀ = <b id="sc-x0-out" class="mono"></b><input type="range" id="sc-x0" min="-2" max="2" step="0.25" value="1" aria-label="Ponto x zero"></label>
          <label class="f wide">Distância h = <b id="sc-h-out" class="mono"></b><input type="range" id="sc-h" min="0.01" max="2" step="0.01" value="1.5" aria-label="Distância h"></label>
        </div>
        <div class="kv"><div><b>Inclinação da secante</b><span id="sc-ms"></span></div><div><b>Derivada f′(x₀)</b><span id="sc-mt"></span></div><div><b>Diferença</b><span id="sc-err"></span></div></div>
        <p class="m-msg">Arraste <b>h</b> para perto de zero: a secante “gira” até virar a tangente.</p>
      </div>
      <div><div class="plot"><canvas id="sc-plot"></canvas><div class="tip"></div></div></div>
    </div>
    <h4 class="sec-h">As 6 regras de derivação (toque no exemplo para calcular)</h4>
    <div class="rules-grid" id="rules-d"></div>
    <div class="quiz" id="q-der"></div>
  </details>
  <div class="card">
    <h3>Calculadora de derivadas <span class="tag">simbólica</span></h3>
    <div class="grid2">
      <div>
        <div class="fields">
          <label class="f wide">Exemplo de jogo<select id="dv-preset"></select></label>
          <label class="f wide">f(x) =<input id="dv-expr"></label>
          <label class="f">Ponto x₀<input id="dv-x0" value="1" inputmode="decimal"></label>
        </div>
        <div class="row"><button id="dv-go">Derivar</button></div>
        <div id="dv-err" class="error hidden"></div>
        <div id="dv-out" class="hidden">
          <div class="rules" id="dv-rules"></div>
          <div class="formula" id="dv-res"></div>
          <div class="kv" id="dv-kv"></div>
        </div>
      </div>
      <div><div class="plot"><canvas id="dv-plot"></canvas><div class="tip"></div></div></div>
    </div>
    <div class="interp hidden" id="dv-interp"></div>
    <details id="dv-det"><summary>Passo a passo das regras aplicadas</summary><ol class="steps" id="dv-steps"></ol></details>
  </div>

  <div class="card">
    <h3>Projétil: posição → velocidade → aceleração <span class="tag">y'(t) = 0 no ponto mais alto</span></h3>
    <p class="sub">A altura do projétil é y(t) = h₀ + v₀·sen(θ)·t − (g/2)·t². Derivando, encontramos o instante do pico (y' = 0) e a velocidade de impacto.</p>
    <div class="grid2">
      <div>
        <div class="fields">
          <label class="f">v₀ (m/s)<input id="pj-v0" value="25" inputmode="decimal"></label>
          <label class="f">Ângulo θ (°)<input id="pj-th" value="60" inputmode="decimal"></label>
          <label class="f">Altura h₀ (m)<input id="pj-h0" value="2" inputmode="decimal"></label>
          <label class="f">g (m/s²)<input id="pj-g" value="9.8" inputmode="decimal"></label>
        </div>
        <div id="pj-err" class="error hidden"></div>
        <div id="pj-out">
          <div class="formula" id="pj-y"></div>
          <div class="formula" id="pj-dy"></div>
          <div class="formula" id="pj-ddy"></div>
          <div class="rules" id="pj-rules"></div>
          <div class="kv" id="pj-kv"></div>
        </div>
      </div>
      <div><div class="plot"><canvas id="pj-plot"></canvas><div class="tip"></div></div></div>
    </div>
    <div class="interp" id="pj-interp"></div>
  </div>
`;

  GPL.register({
    id: 'derivadas', ordem: 3, aba: 'Derivadas', numero: '03', cor: 'var(--c3)', mod: '3',
    card: { k: 'AULA 3', titulo: 'Derivadas', resumo: 'Derivação simbólica com registro de cada regra aplicada.', itens: ['Constante, potência, soma/subtração', 'Produto, quociente e cadeia', 'Velocidade e aceleração do projétil'] },
    html: HTML,
    init() {
      dvPlot = new Plot($('dv-plot')); pjPlot = new Plot($('pj-plot'));
      fillPresets('dv-preset', DV_PRESETS, p => { $('dv-expr').value = p.e; $('dv-x0').value = p.x0; calcDeriv(); });
      $('dv-expr').value = DV_PRESETS[0].e; $('dv-x0').value = DV_PRESETS[0].x0;
      $('dv-go').onclick = calcDeriv;
      ['dv-expr', 'dv-x0'].forEach(id => $(id).addEventListener('keydown', e => e.key === 'Enter' && calcDeriv()));
      $('dv-expr').addEventListener('input', () => $('dv-preset').value = '-1');
      ['pj-v0', 'pj-th', 'pj-h0', 'pj-g'].forEach(id => $(id).oninput = calcProj);
      UI.enhance($('dv-expr'));
      aprenda();
    },
    onShow: () => { calcDeriv(); calcProj(); },
    loaders: { dv: expr => { $('dv-expr').value = expr; $('dv-preset').value = '-1'; calcDeriv(); $('dv-expr').closest('.card').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' }); } },
  });
})();
