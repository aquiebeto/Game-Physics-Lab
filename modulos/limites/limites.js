/* =========================================================
   MÓDULO AULA 2 — LIMITES
   Responsável: Integrante 2
   - Velocidade terminal do personagem (lim t→∞) com animação
   - Calculadora de limites: laterais, infinitos, continuidade
   - Cartão "Aprenda": aproximação pela esquerda/direita + quiz
   O módulo se registra com GPL.register(); o núcleo (base/app.js)
   cria a aba, a seção e chama init().
   ========================================================= */
(() => {
  const { $, css, br, esc, show, num, parsePoint, fmtPt, reduced, fillPresets, C1, C2, C3, C4 } = GPL.h;

  /* ======================= AULA 2 — LIMITES ======================= */
  let tvPlot, tvSimRaf = null, tvState = null;
  function updateTV() {
    const model = $('tv-model').value;
    $('tv-k-lbl').textContent = model === 'lin' ? 'Coef. k (kg/s)' : 'Coef. c (kg/m)';
    try {
      const m = num('tv-m', 'Massa'), k = num('tv-k', 'Coeficiente'), g = num('tv-g', 'Gravidade');
      if (m <= 0 || k <= 0 || g <= 0) throw new CDI.MathError('Massa, coeficiente e gravidade devem ser positivos (k = 0 significaria queda sem resistência, sem velocidade terminal).');
      show($('tv-err'), false);
      const v = model === 'lin' ? CDI.physics.vLinear(m, k, g) : CDI.physics.vQuad(m, k, g);
      const vt = model === 'lin' ? CDI.physics.vtLinear(m, k, g) : CDI.physics.vtQuad(m, k, g);
      const t95 = model === 'lin' ? -(m / k) * Math.log(0.05) : (vt / g) * Math.atanh(0.95);
      const num_ = CDI.atInfinity(v, 1);
      $('tv-formula').innerHTML = model === 'lin'
        ? `v(t) = (m·g/k)·(1 − e<sup>−k·t/m</sup>) <small>= ${br(vt)}·(1 − e<sup>−${br(k / m)}·t</sup>)</small>`
        : `v(t) = v<sub>T</sub>·tanh(g·t / v<sub>T</sub>) <small>com v<sub>T</sub> = √(m·g/c)</small>`;
      $('tv-verdict').innerHTML = `lim<sub style="font-size:12px">t→∞</sub> v(t) = ${br(vt)} m/s<small>${model === 'lin' ? `Como e<sup>−k·t/m</sup> → 0 quando t → ∞, sobra m·g/k = ${br(m)}·${br(g)}/${br(k)}.` : `Como tanh(u) → 1 quando u → ∞, sobra v<sub>T</sub> = √(${br(m)}·${br(g)}/${br(k)}).`} Verificação numérica (t = 10⁸ s): ${num_.kind === 'finite' ? br(num_.v) : '—'} m/s.</small>`;
      $('tv-kv').innerHTML = [
        ['Velocidade terminal', `${br(vt, 2)} m/s (${br(vt * 3.6, 1)} km/h)`],
        ['95% de v_T em', `t ≈ ${br(t95, 2)} s`],
        ['Sem resistência em t = ' + br(t95, 1) + ' s', `${br(g * t95, 2)} m/s (e continua → ∞)`],
        ['Tipo de limite', 'Limite no infinito (assíntota horizontal)'],
      ].map(([a, b]) => `<div><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join('');
      const T = Math.max(t95 * 2, 5);
      tvPlot.draw({ xmin: 0, xmax: T, ymin: 0, ymax: vt * 1.45, xname: 't', xlabel: 't (s)', series: [
        { f: t => g * t, color: css('--muted'), dash: [4, 4], width: 1.5, label: 'sem ar: g·t', noFit: true },
        { f: v, color: C2(), label: 'v(t)' },
      ], hlines: [{ y: vt, color: C3(), label: `v_T = ${br(vt, 2)} m/s` }] });
      const ts = [0, 1, 2, 5, 10, 20, 50, 100, 1000];
      $('tv-table').innerHTML = `<table><tr><th>t (s)</th><th>v(t) (m/s)</th><th>% de v_T</th><th>sem ar g·t</th></tr>${ts.map(t => `<tr><td>${br(t)}</td><td>${br(v(t), 4)}</td><td>${br(100 * v(t) / vt, 2)}%</td><td>${br(g * t, 1)}</td></tr>`).join('')}<tr><td>→ ∞</td><td>→ ${br(vt, 4)}</td><td>→ 100%</td><td>→ ∞</td></tr></table>`;
      $('tv-interp').innerHTML = `<b>Interpretação:</b> sem ar a velocidade cresceria sem limite (lim g·t = ∞) e o personagem atravessaria o chão entre dois frames. Com resistência, o arrasto cresce com a velocidade até equilibrar o peso; a partir daí a aceleração é praticamente zero. O jogo usa o limite <b>${br(vt, 2)} m/s</b> como velocidade máxima de queda (o “clamp” dos motores de física) e sabe que ela é atingida, na prática, em cerca de ${br(t95, 1)} s.`;
      tvState = { v, vt, g, T: t95 * 1.6 };
      drawFall(0, 0);
    } catch (err) { $('tv-err').textContent = err.message; show($('tv-err')); tvState = null; }
  }
  function drawFall(t, scroll) {
    const c = $('tv-sim'), g = c.getContext('2d'), dpr = window.devicePixelRatio || 1;
    const W = c.clientWidth, H = c.clientHeight; if (!W) return;
    if (c.width !== W * dpr) { c.width = W * dpr; c.height = H * dpr; }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#1b1f45'); grd.addColorStop(1, '#0a0b1a');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    if (!tvState) return;
    const v = tvState.v(t), vt = tvState.vt;
    // linhas de vento
    g.strokeStyle = 'rgba(169,139,255,.35)'; g.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const x = (i * 97) % (W - 90) + 10, len = 8 + 50 * (v / vt);
      const y = H - ((scroll * 3 + i * 53) % (H + 60));
      g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + len); g.stroke();
    }
    // personagem
    const cx = (W - 80) / 2, cy = H / 2 - 10;
    g.fillStyle = css('--c2'); g.fillRect(cx - 10, cy - 22, 20, 20);
    g.fillStyle = '#0a0b1a'; g.fillRect(cx - 5, cy - 16, 3, 4); g.fillRect(cx + 2, cy - 16, 3, 4);
    g.fillStyle = css('--c1'); g.fillRect(cx - 12, cy, 24, 22);
    g.fillRect(cx - 24, cy - 8 - 6 * Math.sin(scroll / 6), 12, 5); g.fillRect(cx + 12, cy - 8 + 6 * Math.sin(scroll / 6), 12, 5);
    g.fillStyle = css('--c3'); g.fillRect(cx - 10, cy + 22, 7, 12); g.fillRect(cx + 3, cy + 22, 7, 12);
    // velocímetro
    const bx = W - 58, bh = H - 40;
    g.fillStyle = '#0d0f22'; g.fillRect(bx, 20, 24, bh); g.strokeStyle = css('--line'); g.strokeRect(bx, 20, 24, bh);
    const hv = bh * Math.min(1, v / (vt * 1.15));
    g.fillStyle = css('--c2'); g.fillRect(bx + 3, 20 + bh - hv, 18, hv);
    const yT = 20 + bh - bh / 1.15; g.strokeStyle = css('--c3'); g.setLineDash([4, 3]); g.beginPath(); g.moveTo(bx - 6, yT); g.lineTo(bx + 30, yT); g.stroke(); g.setLineDash([]);
    g.fillStyle = css('--c3'); g.font = '700 11px ui-monospace, monospace'; g.textAlign = 'right'; g.fillText('v_T', bx - 8, yT + 4);
    g.fillStyle = css('--text'); g.textAlign = 'left'; g.font = '700 13px ui-monospace, monospace';
    g.fillText(`t = ${br(t, 1)} s`, 12, 22); g.fillText(`v = ${br(v, 1)} m/s`, 12, 40);
    g.fillStyle = css('--muted'); g.fillText(`${br(100 * v / vt, 1)}% de v_T`, 12, 58);
  }
  function dropTV() {
    if (!tvState) return;
    if (tvSimRaf) cancelAnimationFrame(tvSimRaf);
    const t0 = performance.now(), dur = 6000; let scroll = 0;
    const step = now => {
      const k = reduced() ? 1 : Math.min(1, (now - t0) / dur), t = tvState.T * k;
      scroll += 1 + 6 * tvState.v(t) / tvState.vt; drawFall(t, scroll);
      tvPlot.marker = { x: t, y: tvState.v(t), color: css('--c3') }; tvPlot.render();
      if (k < 1) tvSimRaf = requestAnimationFrame(step); else tvSimRaf = null;
    };
    tvSimRaf = requestAnimationFrame(step);
  }

  const LIM_PRESETS = [
    { n: 'Colisão no frame indefinido (removível)', e: '(x^2-4)/(x-2)', a: '2', i: 'A função de colisão não está definida em x = 2 (divisão 0/0), mas o limite existe e vale 4. O motor pode “tapar o buraco” definindo f(2) = 4 — isso é remover a descontinuidade, e evita que o jogo trave com NaN.' },
    { n: 'Direção do personagem |x|/x (laterais diferentes)', e: 'abs(x)/x', a: '0', i: 'À esquerda do ponto o personagem olha para −1, à direita para +1. Os limites laterais são diferentes, então o limite em 0 não existe: o jogo precisa escolher explicitamente a direção quando a velocidade é zero.' },
    { n: 'Atração de um buraco negro 1/x² (limite infinito)', e: '1/x^2', a: '0', i: 'A força cresce sem limite perto do centro (assíntota vertical). Como nenhum número representa ∞, o jogo deve limitar a força (clamp) ou usar um raio mínimo — senão a física “explode”.' },
    { n: 'Força com sinal 1/x (laterais ±∞)', e: '1/x', a: '0', i: 'Pela esquerda tende a −∞, pela direita a +∞: o limite não existe. Em jogos isso aparece em divisões pela distância; é preciso tratar o caso x = 0 separadamente.' },
    { n: 'Suavização de câmera sin(x)/x', e: 'sin(x)/x', a: '0', i: 'A expressão vira 0/0 em x = 0, mas o limite fundamental vale 1. Filtros de suavização (função sinc) usam esse limite para definir o valor no centro.' },
    { n: 'Custo médio por item no infinito', e: '(3x^2+1)/(x^2+2)', a: 'inf', i: 'Quando o jogador compra muitos itens, o custo médio se aproxima de 3 moedas: limite no infinito com assíntota horizontal y = 3.' },
    { n: 'Velocidade terminal 50(1 − e^(−t))', e: '50(1 - e^(-0.2t))', a: 'inf', i: 'Mesmo fenômeno do primeiro cartão: a exponencial negativa vai a zero e a velocidade se estabiliza em 50 m/s.' },
    { n: 'Tremor de tela sin(1/x) (oscila)', e: 'sin(1/x)', a: '0', i: 'Perto de 0 a função oscila infinitas vezes entre −1 e 1 sem se aproximar de nenhum valor: o limite não existe. Um efeito de tremor assim ficaria “serrilhado” na tela.' },
    { n: 'Velocidade contínua x² + 3', e: 'x^2 + 3', a: '1', i: 'Função polinomial: contínua em todo ponto, então o limite é simplesmente f(1) = 4 (propriedade da substituição direta).' },
  ];
  let lmPlot;
  function calcLimit() {
    try {
      const P = CDI.parse($('lm-expr').value), f = CDI.compile(P.tree), a = parsePoint($('lm-a').value);
      show($('lm-err'), false); show($('lm-out'));
      const r = CDI.limit(f, a);
      const vname = P.v;
      const expr = CDI.str(P.tree);
      let big, sub, ok = true;
      if (r.atInf) {
        if (r.kind === 'finite') { big = `lim ${vname}→${fmtPt(a)} = ${br(r.value)}`; sub = `Assíntota horizontal y = ${br(r.value)}.`; }
        else if (r.kind === 'inf') { big = `lim ${vname}→${fmtPt(a)} = ${fmtPt(r.value)}`; sub = 'A função cresce sem limite (limite infinito).'; ok = false; }
        else { big = 'Limite não existe'; sub = 'A função oscila ou não está definida para valores grandes.'; ok = false; }
      } else if (r.exists) { big = `lim ${vname}→${fmtPt(a)} = ${br(r.value)}`; sub = 'Os limites laterais existem e são iguais.'; }
      else if (r.kind === 'inf') { big = `lim ${vname}→${fmtPt(a)} = ${fmtPt(r.value)}`; sub = r.reason; ok = false; }
      else { big = 'Limite não existe'; sub = r.reason; ok = false; }
      $('lm-verdict').className = 'verdict' + (ok ? '' : ' no');
      $('lm-verdict').innerHTML = `${esc(big)}<small>${esc(sub)}</small>`;
      const sideTxt = s => s.kind === 'finite' ? br(s.v) : s.kind === 'inf' ? fmtPt(s.v) : s.kind === 'osc' ? 'oscila' : 'indefinido';
      const kv = r.atInf ? [['Função', `f(${vname}) = ${expr}`], ['Tendência', sideTxt(r.side)], ['Método', `${vname} = ±10, ±10², …, ±10⁸`]]
        : [['Função', `f(${vname}) = ${expr}`], [`Limite à esquerda (${vname}→${fmtPt(a)}⁻)`, sideTxt(r.left)], [`Limite à direita (${vname}→${fmtPt(a)}⁺)`, sideTxt(r.right)], [`f(${fmtPt(a)})`, isFinite(r.fa) ? br(r.fa) : 'não definida'], ['Continuidade', r.continuity]];
      $('lm-kv').innerHTML = kv.map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('');
      const tbl = (title, rows) => `<div class="tbl-wrap"><table><tr><th>${esc(title)}</th><th>f(${vname})</th></tr>${rows.map(p => `<tr><td>${br(p.x, 9)}</td><td>${isFinite(p.y) ? br(p.y, 8) : 'indef.'}</td></tr>`).join('')}</table></div>`;
      $('lm-tables').innerHTML = r.atInf ? tbl(`${vname} → ${fmtPt(a)}`, r.side.rows) : tbl(`${vname} → ${fmtPt(a)}⁻ (esquerda)`, r.left.rows) + tbl(`${vname} → ${fmtPt(a)}⁺ (direita)`, r.right.rows);
      $('lm-det').open = true;
      // gráfico
      if (r.atInf) {
        const s = a > 0 ? 1 : -1, xmax = 60;
        lmPlot.draw({ xmin: s > 0 ? 0 : -xmax, xmax: s > 0 ? xmax : 0, xname: vname, xlabel: vname, series: [{ f, color: C2(), label: `f(${vname})` }],
          hlines: r.kind === 'finite' ? [{ y: r.value, color: C3(), label: `y = ${br(r.value)}` }] : [] });
      } else {
        const pts = [];
        if (r.left.kind === 'finite') pts.push({ x: a, y: r.left.v, color: C3(), open: true });
        if (r.right.kind === 'finite' && !(r.exists)) pts.push({ x: a, y: r.right.v, color: C3(), open: true });
        if (isFinite(r.fa)) pts.push({ x: a, y: r.fa, color: C1(), label: `f(${br(a)})` });
        const ys = [];
        for (let i = 0; i <= 200; i++) { const x = a - 3 + 6 * i / 200; const y = f(x); if (isFinite(y)) ys.push(y); }
        ys.sort((p, q) => p - q);
        let ymin = ys.length ? ys[Math.floor(ys.length * 0.05)] : -5, ymax = ys.length ? ys[Math.ceil(ys.length * 0.95) - 1] : 5;
        if (r.kind === 'inf' || r.kind === 'jump') { ymin = Math.max(ymin, -12); ymax = Math.min(ymax, 12); }
        if (ymax - ymin < 1) { ymin -= 1; ymax += 1; }
        const mg = (ymax - ymin) * 0.15;
        lmPlot.draw({ xmin: a - 3, xmax: a + 3, ymin: Math.min(ymin - mg, -0.5), ymax: ymax + mg, xname: vname, xlabel: vname, series: [{ f: x => Math.abs(x - a) < 1e-9 ? NaN : f(x), color: C2(), label: `f(${vname})` }], points: pts, vlines: [{ x: a, color: 'rgba(255,111,174,.6)', label: `${vname} = ${br(a)}` }] });
      }
      const pre = LIM_PRESETS.find(p => p.e === $('lm-expr').value && p.a === $('lm-a').value);
      show($('lm-interp'), !!pre);
      if (pre) $('lm-interp').innerHTML = `<b>No jogo:</b> ${esc(pre.i)}`;
    } catch (err) { $('lm-err').textContent = err.message; show($('lm-err')); show($('lm-out'), false); show($('lm-interp'), false); }
  }



  /* ======================= CARTÃO "APRENDA" ======================= */
  function aprenda() {
    // ---- Limites: aproximação
    const LF = { rem: ['(x^2-4)/(x-2)', 2], salto: ['abs(x)/x', 0], inf: ['1/x^2', 0] };
    const runApr = () => {
      const [e, a] = LF[$('ap-f').value], P = CDI.parse(e), k = +$('ap-k').value, h = 10 ** -k;
      $('ap-h').textContent = `h = ${br(h).length > 12 ? '10^−' + k : br(h)}`;
      const L = CDI.ev(P.tree, a - h), R = CDI.ev(P.tree, a + h);
      $('ap-expr').innerHTML = `f(<i>x</i>) = ${MathView.html(P.tree)} &nbsp; com <i>x</i> → ${br(a)}`;
      $('ap-l').innerHTML = `<span>x = ${br(a - h).slice(0, 14)}</span><b>${isFinite(L) ? (Math.abs(L) > 1e6 ? L.toExponential(2) : br(L)) : 'indef.'}</b>`;
      $('ap-r').innerHTML = `<span>x = ${br(a + h).slice(0, 14)}</span><b>${isFinite(R) ? (Math.abs(R) > 1e6 ? R.toExponential(2) : br(R)) : 'indef.'}</b>`;
      const msg = { rem: 'Os dois lados chegam cada vez mais perto de <b>4</b>: o limite existe e vale 4, mesmo com f(2) indefinido.', salto: 'Pela esquerda o valor fica em <b>−1</b> e pela direita em <b>+1</b>. Como os lados discordam, o limite <b>não existe</b>.', inf: 'Os valores crescem sem parar: o limite é <b>+∞</b> (não é um número real).' }[$('ap-f').value];
      $('ap-msg').innerHTML = msg;
    };
    $('ap-f').onchange = runApr; $('ap-k').oninput = runApr; runApr();
    UI.quiz($('q-lim'), [
      { q: 'Se o limite pela esquerda é 3 e pela direita é 5, o limite bilateral…', o: ['vale 4', 'vale 3', 'não existe', 'vale 5'], c: 2, e: 'O limite só existe quando os dois limites laterais são iguais.' },
      { q: 'lim (t→∞) de 50·(1 − e^(−t)) é:', o: ['0', '50', '∞', 'não existe'], c: 1, e: 'e^(−t) → 0, então sobra 50·1.' },
      { q: 'Uma função tem f(2) indefinido, mas lim (x→2) f(x) = 4. Isso é:', o: ['descontinuidade removível', 'assíntota vertical', 'função contínua', 'erro de cálculo'], c: 0, e: 'Basta definir f(2) = 4 para “tapar o buraco”.' },
    ]);

  }

  /* ======================= HTML DA SEÇÃO ======================= */
  const HTML = `
  <div class="mod-head"><span class="mod-badge">AULA 2</span><div>
    <h2>Limites: até onde a velocidade chega?</h2>
    <p>Sem resistência do ar a velocidade de queda cresce para sempre (v = g·t → ∞). Com resistência, ela se aproxima de um valor fixo: a <b>velocidade terminal</b>, que é um limite no infinito.</p>
  </div></div>

  <details class="card learn" open>
    <summary><h3>📘 Aprenda: o que é um limite?</h3></summary>
    <div class="grid2">
      <div>
        <p>O <b>limite</b> responde: “de que valor f(x) se aproxima quando x chega <i>muito perto</i> de um ponto?” — sem precisar calcular f exatamente no ponto.</p>
        <ul class="gloss">
          <li><b>lim<sub>x→a⁻</sub></b>: aproximando pela esquerda (valores menores que a).</li>
          <li><b>lim<sub>x→a⁺</sub></b>: aproximando pela direita (valores maiores que a).</li>
          <li>O limite <b>existe</b> só se os dois lados chegam ao mesmo número.</li>
          <li><b>lim<sub>x→∞</sub></b>: o que acontece quando x cresce sem parar.</li>
        </ul>
      </div>
      <div>
        <div class="fields"><label class="f wide">Função<select id="ap-f"><option value="rem">(x²−4)/(x−2) perto de 2</option><option value="salto">|x|/x perto de 0</option><option value="inf">1/x² perto de 0</option></select></label>
        <label class="f wide">Chegue mais perto: <b id="ap-h" class="mono"></b><input type="range" id="ap-k" min="0" max="7" step="1" value="1" aria-label="Distância até o ponto"></label></div>
        <div class="formula" id="ap-expr" style="white-space:normal"></div>
        <div class="two"><div class="side"><small>⬅ pela esquerda</small><div id="ap-l"></div></div><div class="side"><small>pela direita ➡</small><div id="ap-r"></div></div></div>
        <p id="ap-msg" class="m-msg" aria-live="polite"></p>
      </div>
    </div>
    <div class="quiz" id="q-lim"></div>
  </details>
  <div class="card">
    <h3>Velocidade terminal do personagem <span class="tag">lim t→∞</span></h3>
    <p class="sub">Força resultante: m·a = m·g − arrasto. Resolvendo a equação, obtemos v(t); o limite quando t → ∞ dá a velocidade máxima de queda.</p>
    <div class="grid2">
      <div>
        <div class="fields">
          <label class="f wide">Modelo de resistência do ar
            <select id="tv-model"><option value="lin">Linear (arrasto = k·v)</option><option value="quad">Quadrático (arrasto = c·v²)</option></select></label>
          <label class="f">Massa m (kg)<input id="tv-m" value="80" inputmode="decimal"></label>
          <label class="f"><span id="tv-k-lbl">Coef. k (kg/s)</span><input id="tv-k" value="12" inputmode="decimal"></label>
          <label class="f">Gravidade g (m/s²)<input id="tv-g" value="9.8" inputmode="decimal"></label>
        </div>
        <div id="tv-err" class="error hidden"></div>
        <div class="formula" id="tv-formula"></div>
        <div class="verdict" id="tv-verdict"></div>
        <div class="kv" id="tv-kv"></div>
      </div>
      <div>
        <div class="plot"><canvas id="tv-plot"></canvas><div class="tip"></div></div>
        <div class="sim"><canvas id="tv-sim"></canvas></div>
        <div class="row"><button id="tv-drop">▶ Soltar personagem</button><span class="mono" style="color:var(--muted);font-size:13px">tempo acelerado</span></div>
      </div>
    </div>
    <div class="interp" id="tv-interp"></div>
    <details><summary>Tabela: v(t) se aproximando do limite</summary><div class="tbl-wrap" id="tv-table"></div></details>
  </div>

  <div class="card">
    <h3>Calculadora de limites <span class="tag">laterais · infinitos · continuidade</span></h3>
    <p class="sub">Calcula os limites laterais aproximando x do ponto pelos dois lados, decide se o limite existe e classifica a continuidade.</p>
    <div class="grid2">
      <div>
        <div class="fields">
          <label class="f wide">Exemplo de jogo<select id="lm-preset"></select></label>
          <label class="f wide">f(x) =<input id="lm-expr" value="(x^2-4)/(x-2)"></label>
          <label class="f">x tende a (número, inf ou -inf)<input id="lm-a" value="2"></label>
        </div>
        <div class="row"><button id="lm-go">Calcular limite</button></div>
        <div id="lm-err" class="error hidden"></div>
        <div id="lm-out" class="hidden">
          <div class="verdict" id="lm-verdict"></div>
          <div class="kv" id="lm-kv"></div>
        </div>
      </div>
      <div>
        <div class="plot"><canvas id="lm-plot"></canvas><div class="tip"></div></div>
      </div>
    </div>
    <div class="interp hidden" id="lm-interp"></div>
    <details id="lm-det"><summary>Tabelas de aproximação</summary><div class="two" id="lm-tables"></div></details>
  </div>
`;

  GPL.register({
    id: 'limites', ordem: 2, aba: 'Limites', numero: '02', cor: 'var(--c2)', mod: '2',
    card: { k: 'AULA 2', titulo: 'Limites', resumo: 'Velocidade terminal em queda livre (limite no infinito).', itens: ['Limites laterais e infinitos', 'Casos em que o limite não existe', 'Continuidade e descontinuidades'] },
    html: HTML,
    init() {
      tvPlot = new Plot($('tv-plot')); lmPlot = new Plot($('lm-plot'));
      ['tv-m', 'tv-k', 'tv-g'].forEach(id => $(id).oninput = updateTV);
      $('tv-model').onchange = () => { $('tv-k').value = $('tv-model').value === 'lin' ? 12 : 0.25; updateTV(); };
      $('tv-drop').onclick = dropTV;
      fillPresets('lm-preset', LIM_PRESETS, p => { $('lm-expr').value = p.e; $('lm-a').value = p.a; calcLimit(); });
      $('lm-go').onclick = calcLimit;
      ['lm-expr', 'lm-a'].forEach(id => $(id).addEventListener('keydown', e => e.key === 'Enter' && calcLimit()));
      $('lm-expr').addEventListener('input', () => $('lm-preset').value = '-1');
      UI.enhance($('lm-expr'));
      aprenda();
    },
    onShow: () => { updateTV(); calcLimit(); },
    loaders: { lm: (expr, pt) => { $('lm-expr').value = expr; $('lm-a').value = pt; $('lm-preset').value = '-1'; calcLimit(); $('lm-expr').closest('.card').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' }); } },
  });
})();
