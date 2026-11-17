/* =========================================================
   PROPRIEDADES — renderizador genérico
   Responsável: Integrante 1
   Cada módulo registra suas propriedades com
   PROPS.register('id-do-modulo', { sub, slider, cats }).
   Aqui ficam: as funções de verificação numérica (check) e a
   montagem da área "📐 Propriedades" no fim de cada seção.
   Tipos de verificação (campo c.k):
     eq/le  → calcula os dois lados no x escolhido
     lim/lat→ calcula o limite (módulo Limites)
     der, sign, conc, tan → usa o módulo Derivadas
     anti, def, defle     → usa Simpson (módulo Integrais)
     info   → só texto explicativo
   ========================================================= */
const PROPS = (() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const br = v => isFinite(v) ? CDI.fmtNum(v, 4).replace('.', ',') : (v === Infinity ? '+∞' : v === -Infinity ? '−∞' : 'indef.');
  const cache = {};
  const fn = e => cache[e] || (cache[e] = CDI.compile(CDI.parse(e).tree));
  const M = e => MathView.html(CDI.parse(e).tree);
  const S = (e, a, b) => CDI.simpson(fn(e), a, b, 2000);
  const close = (a, b) => isFinite(a) && isFinite(b) && Math.abs(a - b) <= 1e-5 * Math.max(1, Math.abs(a));
  const fr = (n, d) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;
  const lim = (sub, body) => `lim<sub>${sub}</sub> ${body}`;
  const I = (a, b, body) => `∫<sub>${a}</sub><sup>${b}</sup> ${body}`;
  const limVal = (e, a) => { const r = CDI.limit(fn(e), a); return r.exists || r.kind === 'finite' ? r.value : r.kind === 'inf' ? r.value : NaN; };

  const REG = {};
  const register = (id, data) => { REG[id] = data; };
  const has = id => !!REG[id];

  /* ======================= VERIFICAÇÕES ======================= */
  const tick = ok => ok ? '<span class="pchk ok">✓ igual</span>' : '<span class="pchk bad">✗</span>';
  function check(c, x, kind) {
    try {
      switch (c.k) {
        case 'info': return `<div class="pex">📝 ${c.txt}</div>`;
        case 'eq': case 'le': {
          const xv = c.fixed ? 0 : x;
          const l = fn(c.l)(xv), r = fn(c.r)(xv);
          const where = c.fixed ? '' : `com x = ${br(x)}: `;
          if (!isFinite(l) || !isFinite(r)) return `<div class="pex"><code>${esc(c.l)}</code> ↔ <code>${esc(c.r)}</code><br><span class="pchk warn">⚠ x = ${br(x)} está fora do domínio${c.cond ? ` (${c.cond})` : ''}. Mova o controle.</span></div>`;
          const ok = c.k === 'le' ? l <= r + 1e-12 : close(l, r);
          return `<div class="pex">${c.txt ? esc(c.txt) + '<br>' : ''}<span class="mathv">${M(c.l)}</span> ${c.k === 'le' ? '≤' : '='} <span class="mathv">${M(c.r)}</span><br>${where}<b>${br(l)}</b> ${c.k === 'le' ? '≤' : 'e'} <b>${br(r)}</b> ${c.k === 'le' ? (ok ? '<span class="pchk ok">✓ verdadeiro</span>' : tick(false)) : tick(ok)}</div>`;
        }
        case 'lim': {
          const [e, a] = c.l, Lv = limVal(e, a);
          const parts = c.parts.map(([pe, pa]) => limVal(pe, pa));
          const R = c.fn(parts), ok = (Lv === R) || close(Lv, R);
          return `<div class="pex"><span class="mathv">lim<sub>x→${a === Infinity ? '∞' : br(a)}</sub> ${M(e)}</span><br>App: <b>${br(Lv)}</b> · Propriedade: ${c.txt(parts)} = <b>${br(R)}</b> ${tick(ok)}
            <button type="button" class="mini plim" data-e="${esc(e)}" data-a="${a === Infinity ? 'inf' : a}">Abrir na calculadora →</button></div>`;
        }
        case 'lat': {
          const r = CDI.limit(fn(c.e), c.a);
          return `<div class="pex"><span class="mathv">${M(c.e)}</span> em x → ${br(c.a)}: esquerda <b>${br(r.left.v)}</b>, direita <b>${br(r.right.v)}</b> ⇒ ${r.exists ? 'o limite existe' : '<b>o limite não existe</b>'} <span class="pchk ok">✓</span>
            <button type="button" class="mini plim" data-e="${esc(c.e)}" data-a="${c.a}">Abrir na calculadora →</button></div>`;
        }
        case 'der': {
          const P = CDI.parse(c.f), D = CDI.derive(P.tree), d = CDI.compile(D.result)(x), r = fn(c.r)(x);
          if (!isFinite(d) || !isFinite(r)) return `<div class="pex"><span class="pchk warn">⚠ fora do domínio em x = ${br(x)}</span></div>`;
          return `<div class="pex">f(x) = <span class="mathv">${M(c.f)}</span> ⇒ app: <span class="mathv">${MathView.html(D.result)}</span><br>com x = ${br(x)}: app <b>${br(d)}</b> · tabela <span class="mathv">${M(c.r)}</span> = <b>${br(r)}</b> ${tick(close(d, r))}
            <button type="button" class="mini pder" data-e="${esc(c.f)}">Ver passo a passo →</button></div>`;
        }
        case 'sign': {
          const D = CDI.compile(CDI.derive(CDI.parse(c.f).tree).result), d = D(x);
          return `<div class="pex">f(x) = <span class="mathv">${M(c.f)}</span>, f′(x) = 3x² − 3<br>com x = ${br(x)}: f′ = <b>${br(d)}</b> ⇒ f é <b>${d > 1e-9 ? 'crescente ↗' : d < -1e-9 ? 'decrescente ↘' : 'estacionária (ponto crítico)'}</b> aqui.</div>`;
        }
        case 'conc': {
          const D1 = CDI.derive(CDI.parse(c.f).tree).result, D2 = CDI.compile(CDI.derive(D1).result), d = D2(x);
          return `<div class="pex">f(x) = <span class="mathv">${M(c.f)}</span>, f″(x) = 6x<br>com x = ${br(x)}: f″ = <b>${br(d)}</b> ⇒ concavidade ${d > 0 ? 'para <b>cima ∪</b>' : d < 0 ? 'para <b>baixo ∩</b>' : '<b>muda</b> (ponto de inflexão)'}.</div>`;
        }
        case 'tan': {
          const f = fn(c.f), a = x, h = 0.1;
          const yt = f(a) + 2 * a * h, yr = f(a + h);
          return `<div class="pex">f(x) = x², a = ${br(a)}: tangente y = ${br(f(a))} + ${br(2 * a)}(x − ${br(a)})<br>Em x = a + 0,1: tangente prevê <b>${br(yt)}</b>, valor real <b>${br(yr)}</b> (erro ${br(Math.abs(yt - yr))}).</div>`;
        }
        case 'anti': {
          const F = fn(c.r), f = fn(c.f), h = 1e-5, dF = (F(x + h) - F(x - h)) / (2 * h), fx = f(x);
          return `<div class="pex">Conferência derivando: <span class="mathv">(${M(c.r)})′</span> em x = ${br(x)} vale <b>${br(dF)}</b> e f(${br(x)}) = <b>${br(fx)}</b> ${tick(close(dF, fx))}
            <button type="button" class="mini pint" data-e="${esc(c.f)}">Calcular no app →</button></div>`;
        }
        case 'def': case 'defle': {
          const l = c.L(x), r = c.R(x), ok = c.k === 'defle' ? l <= r : close(l, r);
          return `<div class="pex">com b = ${br(x)}: <span class="mathv">${c.lt}</span> = <b>${br(l)}</b><br>${c.k === 'defle' ? '≤' : 'e'} <span class="mathv">${c.rt}</span> = <b>${br(r)}</b> ${c.k === 'defle' ? (ok ? '<span class="pchk ok">✓ verdadeiro</span>' : tick(false)) : tick(ok)}</div>`;
        }
      }
    } catch (e) { return `<div class="pex">${esc(e.message)}</div>`; }
    return '';
  }

  /* ======================= RENDER ======================= */
  function build(kind) {
    const D = REG[kind], host = $('props-' + kind);
    if (!host) return;
    const cats = Object.keys(D.cats);
    const total = cats.reduce((s, c) => s + D.cats[c].length, 0);
    let cur = 'Todas', x = D.slider ? D.slider.val : 0;
    host.innerHTML = `
      <summary><span class="props-tag">📐 Propriedades</span><span class="props-count">${total} propriedades usadas neste módulo</span></summary>
      <div class="props-inner">
      <p class="sub">${D.sub}</p>
      <div class="props-ctl">
        <div class="chips" aria-label="Categorias de propriedades">${['Todas', ...cats].map(c => `<button type="button" class="chip${c === cur ? ' on' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>
        ${D.slider ? `<label class="f pslider">${D.slider.label} <b class="mono pxv">${br(x)}</b><input type="range" min="${D.slider.min}" max="${D.slider.max}" step="${D.slider.step}" value="${x}" aria-label="${D.slider.label}"></label>` : ''}
        <label class="f psearch"><input type="search" placeholder="🔎 Buscar propriedade…" aria-label="Buscar propriedade"></label>
      </div>
      <div class="props-body" aria-live="polite"></div>
      </div>`;
    const body = host.querySelector('.props-body');
    const render = () => {
      const q = (host.querySelector('.psearch input').value || '').toLowerCase().trim();
      const list = cur === 'Todas' ? cats : [cur];
      let n = 0;
      body.innerHTML = list.map(c => {
        const items = D.cats[c].filter(p => !q || (p.t + ' ' + p.d + ' ' + p.f).toLowerCase().includes(q));
        n += items.length;
        if (!items.length) return '';
        return `<h4 class="props-cat">${esc(c)}</h4><div class="props-grid">${items.map((p, i) => `
          <article class="prop"><div class="prop-n">${String(i + 1).padStart(2, '0')}</div>
            <h5>${esc(p.t)}</h5>
            <div class="prop-f mathv">${p.f}</div>
            <p>${p.d}</p>
            ${check(p.c, x, kind)}
          </article>`).join('')}</div>`;
      }).join('') || '<p class="muted">Nenhuma propriedade encontrada.</p>';
      body.querySelectorAll('.plim').forEach(b => b.onclick = () => GPL.load('lm', b.dataset.e, b.dataset.a));
      body.querySelectorAll('.pder').forEach(b => b.onclick = () => GPL.load('dv', b.dataset.e));
      body.querySelectorAll('.pint').forEach(b => b.onclick = () => GPL.load('in', b.dataset.e));
    };
    host.querySelectorAll('.chip').forEach(b => b.onclick = () => { cur = b.dataset.c; host.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); render(); });
    const sl = host.querySelector('input[type=range]');
    if (sl) sl.oninput = () => { x = Number(sl.value); host.querySelector('.pxv').textContent = br(x); render(); };
    host.querySelector('.psearch input').oninput = render;
    let done = false;
    host.addEventListener('toggle', () => { if (host.open && !done) { done = true; render(); } });
  }

  const buildAll = () => Object.keys(REG).forEach(build);
  return { register, has, buildAll, h: { fr, lim, I, S, M, fn, br, esc } };
})();
