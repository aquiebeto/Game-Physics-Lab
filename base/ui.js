/* =========================================================
   COMPONENTES DE INTERFACE COMPARTILHADOS
   Responsável: Integrante 1
   - keypad(): teclado matemático virtual
   - enhance(): pré-visualização ao digitar ("Entendi: ...")
   - quiz(): perguntas de múltipla escolha com explicação
   ========================================================= */
const UI = (() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* =================== TECLADO MATEMÁTICO =================== */
  const KEYS = [
    { k: 'x', ins: 'x', aria: 'variável x' }, { k: 't', ins: 't', aria: 'variável t' },
    { k: '+', ins: '+', aria: 'mais' }, { k: '−', ins: '-', typed: '-', aria: 'menos' },
    { k: '×', ins: '*', typed: '*', aria: 'vezes' }, { k: '÷', ins: '/', typed: '/', aria: 'dividido por' },
    { k: 'xⁿ', ins: '^', typed: '^', aria: 'elevado a' }, { k: 'x²', ins: '^2', typed: '^2', aria: 'ao quadrado' },
    { k: '(', ins: '(', aria: 'abre parênteses' }, { k: ')', ins: ')', aria: 'fecha parênteses' },
    { k: '√', ins: 'sqrt()', back: 1, typed: 'sqrt()', aria: 'raiz quadrada' }, { k: '|x|', ins: 'abs()', back: 1, typed: 'abs()', aria: 'módulo' },
    { k: 'sen', ins: 'sin()', back: 1, typed: 'sin()', aria: 'seno' }, { k: 'cos', ins: 'cos()', back: 1, aria: 'cosseno' },
    { k: 'tg', ins: 'tan()', back: 1, typed: 'tan()', aria: 'tangente' }, { k: 'eˣ', ins: 'e^()', back: 1, typed: 'e^()', aria: 'e elevado a' },
    { k: 'ln', ins: 'ln()', back: 1, aria: 'logaritmo natural' }, { k: 'log', ins: 'log()', back: 1, aria: 'logaritmo base 10' },
    { k: 'π', ins: 'pi', typed: 'pi', aria: 'pi' }, { k: ',', ins: '.', typed: '.', aria: 'vírgula decimal' },
    { k: '⌫', act: 'del', aria: 'apagar' }, { k: 'limpar', act: 'clear', aria: 'limpar tudo' },
  ];
  function keypad(input) {
    const wrap = document.createElement('div');
    wrap.className = 'keypad'; wrap.setAttribute('role', 'group'); wrap.setAttribute('aria-label', 'Teclado matemático');
    wrap.innerHTML = KEYS.map((K, i) => `<button type="button" class="key${K.act ? ' act' : ''}" data-i="${i}" aria-label="${K.aria}" title="${K.typed ? 'digita: ' + K.typed : K.aria}">${K.k}${K.typed && !K.act ? `<small>${esc(K.typed)}</small>` : ''}</button>`).join('');
    wrap.addEventListener('mousedown', e => e.preventDefault());
    wrap.addEventListener('click', e => {
      const b = e.target.closest('.key'); if (!b) return;
      const K = KEYS[+b.dataset.i];
      const s = input.selectionStart ?? input.value.length, en = input.selectionEnd ?? s;
      if (K.act === 'clear') input.value = '';
      else if (K.act === 'del') {
        if (s !== en) input.setRangeText('', s, en, 'end');
        else if (s > 0) { input.setRangeText('', s - 1, s, 'end'); }
      } else {
        input.setRangeText(K.ins, s, en, 'end');
        if (K.back) { const p = input.selectionStart - K.back; input.setSelectionRange(p, p); }
      }
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    });
    return wrap;
  }

  /* =================== PRÉ-VISUALIZAÇÃO AO DIGITAR =================== */
  function enhance(input, opts = {}) {
    const host = document.createElement('div'); host.className = 'expr-help';
    host.innerHTML = `<div class="pv" aria-live="polite"></div>
      <div class="pv-tools"><button type="button" class="mini kb-toggle" aria-expanded="${opts.open ? 'true' : 'false'}">⌨ Teclado matemático</button>
      ${MathView.canSpeak ? '<button type="button" class="mini say">🔊 Ouvir</button>' : ''}</div>`;
    const label = input.closest('label') || input;
    label.after(host);
    const kp = keypad(input); host.appendChild(kp);
    if (!opts.open) kp.classList.add('hidden');
    host.querySelector('.kb-toggle').onclick = e => { kp.classList.toggle('hidden'); e.target.setAttribute('aria-expanded', !kp.classList.contains('hidden')); };
    const pv = host.querySelector('.pv');
    let last = null;
    const refresh = () => {
      if (input.value === last) return; last = input.value;
      if (!input.value.trim()) { pv.innerHTML = '<span class="muted">Digite uma expressão para ver como o programa a entende.</span>'; return; }
      const notes = CDI.normalize(input.value).notes;
      try {
        const P = CDI.parse(input.value);
        input.classList.remove('err'); input.setAttribute('aria-invalid', 'false');
        pv.innerHTML = `<div class="pv-row"><span class="pv-k">Entendi:</span> ${MathView.box(P.tree)}</div>
          <div class="pv-read">“${esc(MathView.speak(P.tree))}”</div>
          ${notes.length ? `<div class="pv-note">✎ ${notes.map(esc).join(' · ')}</div>` : ''}`;
        pv.dataset.read = MathView.speak(P.tree);
      } catch (err) {
        input.classList.add('err'); input.setAttribute('aria-invalid', 'true');
        pv.innerHTML = `<div class="pv-err">⚠ ${esc(err.message)}</div><div class="pv-tip">💡 ${esc(MathView.hint(input.value, err.message))}</div>`;
        pv.dataset.read = err.message + '. ' + MathView.hint(input.value, err.message);
      }
    };
    input.addEventListener('input', refresh);
    setInterval(refresh, 350); // acompanha valores definidos pelos exemplos
    const sb = host.querySelector('.say'); if (sb) sb.onclick = () => MathView.say(pv.dataset.read || '');
    input.setAttribute('autocomplete', 'off'); input.setAttribute('autocapitalize', 'off'); input.setAttribute('spellcheck', 'false');
    refresh();
    return { refresh };
  }

  /* =================== QUIZ =================== */
  function quiz(el, qs) {
    let score = 0, answered = 0;
    el.innerHTML = `<div class="quiz-head"><b>🎯 Teste seu conhecimento</b><span class="qscore" aria-live="polite">0/${qs.length}</span></div>` +
      qs.map((q, i) => `<div class="q" data-i="${i}"><p class="qq">${i + 1}. ${q.q}</p><div class="qopts">${q.o.map((o, j) => `<button type="button" class="qo" data-j="${j}">${o}</button>`).join('')}</div><div class="qexp hidden" aria-live="polite"></div></div>`).join('') +
      `<button type="button" class="ghost qreset">↺ Refazer</button>`;
    el.querySelectorAll('.q').forEach(qd => {
      const q = qs[+qd.dataset.i];
      qd.querySelectorAll('.qo').forEach(b => b.onclick = () => {
        if (qd.dataset.done) return; qd.dataset.done = 1; answered++;
        const j = +b.dataset.j, right = j === q.c;
        if (right) score++;
        qd.querySelectorAll('.qo').forEach(x => { x.disabled = true; if (+x.dataset.j === q.c) x.classList.add('right'); });
        if (!right) b.classList.add('wrong');
        const ex = qd.querySelector('.qexp'); ex.classList.remove('hidden');
        ex.innerHTML = `${right ? '✅ <b>Certo!</b>' : '❌ <b>Não foi dessa vez.</b>'} ${q.e}`;
        el.querySelector('.qscore').textContent = `${score}/${qs.length}${answered === qs.length ? (score === qs.length ? ' 🏆' : '') : ''}`;
      });
    });
    el.querySelector('.qreset').onclick = () => quiz(el, qs);
  }

  /* =================== REGRAS E PASSO A PASSO (Derivadas e Integrais) =================== */
  const ruleBadges = (all, extra, used) => all.map(r => `<span class="rule${used.includes(r) ? ' on' : ''}">${used.includes(r) ? '✓ ' : ''}${r}</span>`).join('') + extra.filter(r => used.includes(r)).map(r => `<span class="rule extra on">+ ${r}</span>`).join('');
  const stepsHTML = steps => { const seen = new Set(); return steps.filter(s => !seen.has(s.text) && seen.add(s.text)).map(s => `<li><em>${esc(s.rule)}</em> — ${esc(s.text)}</li>`).join(''); };

  return { keypad, enhance, quiz, ruleBadges, stepsHTML };
})();
