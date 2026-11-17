/* =========================================================
   NÚCLEO DO SITE — registro de módulos, navegação e testes
   Responsável: Integrante 1

   Cada módulo (Funções, Limites, Derivadas, Integrais,
   Acessibilidade) chama GPL.register({...}) no seu próprio
   arquivo. Ao carregar a página, este núcleo:
     1. ordena os módulos registrados;
     2. cria as abas, os cartões da página inicial e as seções;
     3. chama init() de cada módulo;
     4. monta a área PROPRIEDADES de quem registrou propriedades;
     5. mostra a aba indicada no endereço (#funcoes, #limites...).
   Se um módulo ainda não foi adicionado ao projeto, o site
   continua funcionando sem ele.
   ========================================================= */
const GPL = (() => {
  /* ---------- utilitários compartilhados ---------- */
  const $ = id => document.getElementById(id);
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const br = (v, d = 4) => CDI.fmtNum(v, d).replace('.', ',');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const show = (el, on = true) => el.classList.toggle('hidden', !on);
  const reduced = () => document.body.classList.contains('rm');
  const num = (id, label) => {
    const el = $(id); const raw = el.value.trim().replace(',', '.');
    const v = Number(raw);
    const bad = raw === '' || !isFinite(v);
    el.classList.toggle('err', bad);
    if (bad) throw new CDI.MathError(`“${label}” precisa ser um número.`);
    return v;
  };
  const parsePoint = s => {
    const t = s.trim().toLowerCase().replace(',', '.').replace(/\s/g, '');
    if (['inf', '+inf', '∞', '+∞', 'infinito', '+infinito'].includes(t)) return Infinity;
    if (['-inf', '-∞', '-infinito'].includes(t)) return -Infinity;
    if (t === 'pi' || t === 'π') return Math.PI;
    const v = Number(t);
    if (t === '' || !isFinite(v)) throw new CDI.MathError('O ponto deve ser um número, “inf” ou “-inf”.');
    return v;
  };
  const fmtPt = a => a === Infinity ? '+∞' : a === -Infinity ? '−∞' : br(a);
  function fillPresets(sel, list, apply) {
    $(sel).innerHTML = list.map((p, i) => `<option value="${i}">${esc(p.n)}</option>`).join('') + '<option value="-1">— Expressão livre —</option>';
    $(sel).onchange = () => { const p = list[+$(sel).value]; if (p) apply(p); };
  }
  const h = {
    $, css, br, esc, show, reduced, num, parsePoint, fmtPt, fillPresets,
    C1: () => css('--c1'), C2: () => css('--c2'), C3: () => css('--c3'), C4: () => css('--c4'),
  };

  /* ---------- registro de módulos ---------- */
  const modules = [];
  const loaders = {};
  function register(m) {
    modules.push(m);
    if (m.loaders) Object.assign(loaders, m.loaders);
  }
  // abre um exemplo na calculadora de outro módulo (ex.: botões das Propriedades)
  function load(kind, ...args) { if (loaders[kind]) loaders[kind](...args); }

  /* ---------- montagem da página ---------- */
  let views = ['inicio', 'testes'];
  const onShow = {};
  function buildDOM() {
    modules.sort((a, b) => a.ordem - b.ordem);
    views = ['inicio', ...modules.map(m => m.id), 'testes'];
    $('tabs').innerHTML = `<a href="#inicio" data-v="inicio">Início</a>` +
      modules.map(m => `<a href="#${m.id}" data-v="${m.id}" style="--tc:${m.cor}"><span class="n" aria-hidden="true">${m.numero}</span>${esc(m.aba)}</a>`).join('') +
      `<a href="#testes" data-v="testes" style="--tc:var(--ok)"><span class="n" aria-hidden="true">✓</span>Testes</a>`;
    $('home-cards').innerHTML = modules.map(m => `
      <a class="card modcard" data-mod="${m.mod}" href="#${m.id}">
        <div class="k">${m.card.k}</div><h4>${m.card.titulo}</h4>
        <p>${m.card.resumo}</p>
        ${m.card.itens ? `<ul>${m.card.itens.map(i => `<li>${i}</li>`).join('')}</ul>` : ''}
      </a>`).join('') || '<p class="muted">Nenhum módulo adicionado ainda.</p>';
    const testes = $('v-testes');
    for (const m of modules) {
      const sec = document.createElement('section');
      sec.className = 'view'; sec.id = 'v-' + m.id; sec.dataset.mod = m.mod;
      sec.innerHTML = m.html + (typeof PROPS !== 'undefined' && PROPS.has(m.id) ? `<details class="props" id="props-${m.id}"></details>` : '');
      testes.before(sec);
      if (m.onShow) onShow[m.id] = m.onShow;
    }
  }
  function route() {
    const hsh = location.hash.replace('#', '');
    const v = views.includes(hsh) ? hsh : 'inicio';
    views.forEach(n => { const el = $('v-' + n); if (el) el.classList.toggle('on', n === v); });
    document.querySelectorAll('#tabs a').forEach(a => a.classList.toggle('on', a.dataset.v === v));
    if (onShow[v]) requestAnimationFrame(onShow[v]);
    window.scrollTo({ top: 0 });
  }
  window.addEventListener('hashchange', route);

  /* ---------- aba Testes ---------- */
  function runAll() {
    const rows = Testes.run();
    const pass = rows.filter(r => r.pass).length;
    $('ts-count').textContent = `${pass}/${rows.length}`;
    $('ts-pill').innerHTML = pass === rows.length ? '<span class="pill ok">todos os testes passaram</span>' : `<span class="pill bad">${rows.length - pass} falharam</span>`;
    $('ts-table').innerHTML = `<tr><th>Módulo</th><th>Teste</th><th>Esperado</th><th>Obtido</th><th>Status</th></tr>` +
      rows.map(r => `<tr><td>${esc(r.grupo)}</td><td style="text-align:left">${esc(r.nome)}</td><td>${esc(r.esperado)}</td><td style="text-align:left">${esc(r.obtido)}</td><td class="${r.pass ? 'ok' : 'bad'}">${r.pass ? '✔ passou' : '✘ falhou'}</td></tr>`).join('');
  }
  onShow.testes = runAll;

  document.addEventListener('DOMContentLoaded', () => {
    buildDOM();
    for (const m of modules) {
      try { if (m.init) m.init(); } catch (e) { console.error(`Erro ao iniciar o módulo ${m.id}:`, e); }
    }
    if (typeof PROPS !== 'undefined') PROPS.buildAll();
    $('ts-run').onclick = runAll;
    route();
  });

  return {
    h, register, load, route, modules,
    redrawAll: () => Plot.all.forEach(p => p.cfg && p.render()),
  };
})();
