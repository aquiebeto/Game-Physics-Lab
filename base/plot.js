/* =========================================================
   GRÁFICOS (Canvas 2D) — Game Physics Lab
   Responsável: Integrante 1
   new Plot(canvas).draw({ xmin, xmax, series:[{ f, color, label }], ... })
   Suporta: várias curvas, pontos discretos, área sombreada,
   retângulos (somas de Riemann), linhas guia, marcador animado,
   leitura do valor ao passar o mouse/dedo e descrição para
   leitores de tela.
   ========================================================= */
const Plot = (() => {
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const br = (v, d = 4) => CDI.fmtNum(v, d).replace('.', ',');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ======================= GRÁFICO ======================= */
  const ALL_PLOTS = [];
  const reduced = () => document.body.classList.contains('rm');
  class Plot {
    constructor(canvas) {
      this.c = canvas; this.ctx = canvas.getContext('2d'); this.tip = canvas.parentElement.querySelector('.tip');
      this.cfg = null; this.marker = null; this.hoverX = null;
      ALL_PLOTS.push(this);
      canvas.setAttribute('role', 'img'); canvas.tabIndex = 0;
      const move = e => {
        const r = this.c.getBoundingClientRect();
        const p = e.touches ? e.touches[0] : e;
        this.hoverX = p.clientX - r.left; this.render();
      };
      canvas.addEventListener('mousemove', move);
      canvas.addEventListener('touchstart', move, { passive: true });
      canvas.addEventListener('touchmove', move, { passive: true });
      canvas.addEventListener('mouseleave', () => { this.hoverX = null; this.render(); });
      if (window.ResizeObserver) new ResizeObserver(() => this.render()).observe(canvas);
    }
    draw(cfg) {
      this.cfg = cfg; this.marker = null;
      const names = cfg.series.map(s => s.label).filter(Boolean).join(', ');
      this.c.setAttribute('aria-label', cfg.desc || `Gráfico de ${names || 'função'} para ${cfg.xname || 'x'} entre ${br(cfg.xmin, 2)} e ${br(cfg.xmax, 2)}`);
      this.render();
    }
    ticks(lo, hi, n) {
      const span = hi - lo, step0 = span / n, mag = 10 ** Math.floor(Math.log10(step0));
      const step = [1, 2, 5, 10].map(k => k * mag).find(s => s >= step0) || step0;
      const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
      return out;
    }
    render() {
      const cfg = this.cfg; if (!cfg) return;
      const c = this.c, dpr = window.devicePixelRatio || 1;
      const W = c.clientWidth, H = c.clientHeight; if (!W || !H) return;
      if (c.width !== W * dpr || c.height !== H * dpr) { c.width = W * dpr; c.height = H * dpr; }
      const g = this.ctx; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      const pad = { l: 48, r: 14, t: 26, b: 30 };
      const xmin = cfg.xmin, xmax = cfg.xmax;
      // amostragem
      const S = 700;
      const sampled = cfg.series.map(s => {
        if (s.pts) return s.pts;
        const pts = [];
        for (let i = 0; i <= S; i++) { const x = xmin + (xmax - xmin) * i / S; pts.push({ x, y: s.f(x) }); }
        return pts;
      });
      let ymin = cfg.ymin, ymax = cfg.ymax;
      if (ymin === undefined || ymax === undefined) {
        const ys = [];
        sampled.forEach((pts, i) => { if (!cfg.series[i].noFit) pts.forEach(p => isFinite(p.y) && ys.push(p.y)); });
        (cfg.hlines || []).forEach(h => ys.push(h.y));
        (cfg.points || []).forEach(p => isFinite(p.y) && ys.push(p.y));
        ys.sort((a, b) => a - b);
        let lo = ys.length ? ys[Math.floor(ys.length * 0.02)] : -1, hi = ys.length ? ys[Math.ceil(ys.length * 0.98) - 1] : 1;
        if (ys.length && (ys[ys.length - 1] - ys[0]) <= 3 * (hi - lo + 1e-12)) { lo = ys[0]; hi = ys[ys.length - 1]; }
        if (cfg.zero !== false) { lo = Math.min(lo, 0); hi = Math.max(hi, 0); }
        if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
        const m = (hi - lo) * 0.1;
        if (ymin === undefined) ymin = lo - m;
        if (ymax === undefined) ymax = hi + m;
      }
      const X = x => pad.l + (x - xmin) / (xmax - xmin) * (W - pad.l - pad.r);
      const Y = y => pad.t + (ymax - y) / (ymax - ymin) * (H - pad.t - pad.b);
      this.map = { X, Y, xmin, xmax, ymin, ymax, pad, W, H };
      // grade
      g.font = '11px ui-monospace, monospace'; g.lineWidth = 1;
      g.strokeStyle = 'rgba(80,88,150,.22)'; g.fillStyle = css('--dim');
      g.textAlign = 'center'; g.textBaseline = 'top';
      for (const v of this.ticks(xmin, xmax, Math.max(3, Math.floor(W / 80)))) {
        g.beginPath(); g.moveTo(X(v), pad.t); g.lineTo(X(v), H - pad.b); g.stroke();
        g.fillText(br(v, 3), X(v), H - pad.b + 6);
      }
      g.textAlign = 'right'; g.textBaseline = 'middle';
      for (const v of this.ticks(ymin, ymax, Math.max(3, Math.floor(H / 55)))) {
        g.beginPath(); g.moveTo(pad.l, Y(v)); g.lineTo(W - pad.r, Y(v)); g.stroke();
        g.fillText(br(v, 3), pad.l - 6, Y(v));
      }
      g.strokeStyle = 'rgba(160,168,220,.55)';
      if (ymin < 0 && ymax > 0) { g.beginPath(); g.moveTo(pad.l, Y(0)); g.lineTo(W - pad.r, Y(0)); g.stroke(); }
      if (xmin < 0 && xmax > 0) { g.beginPath(); g.moveTo(X(0), pad.t); g.lineTo(X(0), H - pad.b); g.stroke(); }
      if (cfg.xlabel) { g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillStyle = css('--muted'); g.fillText(cfg.xlabel, W - pad.r, H - pad.b - 3); }
      g.save(); g.beginPath(); g.rect(pad.l, pad.t, W - pad.l - pad.r, H - pad.t - pad.b); g.clip();
      // área sombreada
      if (cfg.shade) {
        const { f, a, b } = cfg.shade, lo = Math.min(a, b), hi = Math.max(a, b), n = 400;
        for (let i = 0; i < n; i++) {
          const x0 = lo + (hi - lo) * i / n, x1 = lo + (hi - lo) * (i + 1) / n;
          const y0 = f(x0), y1 = f(x1); if (!isFinite(y0) || !isFinite(y1)) continue;
          g.fillStyle = (y0 + y1) / 2 >= 0 ? cfg.shade.pos : cfg.shade.neg;
          g.beginPath(); g.moveTo(X(x0), Y(0)); g.lineTo(X(x0), Y(y0)); g.lineTo(X(x1), Y(y1)); g.lineTo(X(x1), Y(0)); g.closePath(); g.fill();
        }
      }
      // retângulos (somas de Riemann)
      (cfg.rects || []).forEach(r => {
        if (!isFinite(r.y)) return;
        g.fillStyle = r.y >= 0 ? 'rgba(169,139,255,.30)' : 'rgba(255,107,107,.28)'; g.strokeStyle = 'rgba(200,185,255,.8)'; g.lineWidth = 1;
        const x0 = X(r.x0), x1 = X(r.x1), y0 = Y(0), y1 = Y(r.y);
        g.fillRect(x0, Math.min(y0, y1), x1 - x0, Math.abs(y1 - y0)); g.strokeRect(x0, Math.min(y0, y1), x1 - x0, Math.abs(y1 - y0));
      });
      // linhas guia
      const guide = (x1, y1, x2, y2, col) => { g.strokeStyle = col; g.setLineDash([6, 5]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.setLineDash([]); };
      (cfg.hlines || []).forEach(h => { guide(pad.l, Y(h.y), W - pad.r, Y(h.y), h.color); if (h.label) { g.fillStyle = h.color; g.textAlign = 'left'; g.textBaseline = 'bottom'; g.fillText(h.label, pad.l + 6, Y(h.y) - 3); } });
      (cfg.vlines || []).forEach(v => { guide(X(v.x), pad.t, X(v.x), H - pad.b, v.color); if (v.label) { g.fillStyle = v.color; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(v.label, X(v.x) + 4, pad.t + 4); } });
      // séries
      const range = ymax - ymin;
      cfg.series.forEach((s, i) => {
        const pts = sampled[i];
        g.strokeStyle = s.color; g.fillStyle = s.color; g.lineWidth = s.width || 2.5; g.setLineDash(s.dash || []);
        if (s.discrete) {
          pts.forEach(p => { if (!isFinite(p.y)) return; g.globalAlpha = .35; g.beginPath(); g.moveTo(X(p.x), Y(0)); g.lineTo(X(p.x), Y(p.y)); g.stroke(); g.globalAlpha = 1; g.beginPath(); g.arc(X(p.x), Y(p.y), 4, 0, 7); g.fill(); });
          return;
        }
        g.beginPath(); let pen = false, prev = null;
        for (const p of pts) {
          if (!isFinite(p.y) || (prev && Math.abs(p.y - prev.y) > range * 2)) { pen = false; prev = isFinite(p.y) ? p : null; if (!isFinite(p.y)) continue; }
          const yy = Math.max(-1e5, Math.min(1e5, Y(p.y)));
          if (!pen) { g.moveTo(X(p.x), yy); pen = true; } else g.lineTo(X(p.x), yy);
          prev = p;
        }
        g.stroke(); g.setLineDash([]);
      });
      (cfg.points || []).forEach(p => {
        if (!isFinite(p.y)) return;
        g.beginPath(); g.arc(X(p.x), Y(p.y), 5.5, 0, 7); g.lineWidth = 2.5; g.strokeStyle = p.color;
        if (p.open) { g.fillStyle = '#0a0b1a'; g.fill(); g.stroke(); } else { g.fillStyle = p.color; g.fill(); }
        if (p.label) { g.fillStyle = p.color; const right = X(p.x) > W - 90; g.textAlign = right ? 'right' : 'left'; g.textBaseline = 'bottom'; g.fillText(p.label, X(p.x) + (right ? -8 : 8), Y(p.y) - 6); }
      });
      if (this.marker && isFinite(this.marker.y)) {
        const m = this.marker; g.shadowColor = m.color; g.shadowBlur = 18; g.fillStyle = m.color;
        g.beginPath(); g.arc(X(m.x), Y(m.y), 8, 0, 7); g.fill(); g.shadowBlur = 0;
        g.fillStyle = '#0a0b1a'; g.beginPath(); g.arc(X(m.x), Y(m.y), 3, 0, 7); g.fill();
      }
      g.restore();
      // legenda
      let lx = pad.l + 6;
      g.font = '600 11.5px system-ui, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle';
      cfg.series.forEach(s => { if (!s.label) return; g.fillStyle = s.color; g.fillRect(lx, 9, 14, 3); g.fillStyle = css('--text'); g.fillText(s.label, lx + 19, 11); lx += g.measureText(s.label).width + 34; });
      // hover
      if (this.hoverX !== null && this.hoverX >= pad.l && this.hoverX <= W - pad.r) {
        const x = xmin + (this.hoverX - pad.l) / (W - pad.l - pad.r) * (xmax - xmin);
        g.strokeStyle = 'rgba(236,238,254,.35)'; g.beginPath(); g.moveTo(this.hoverX, pad.t); g.lineTo(this.hoverX, H - pad.b); g.stroke();
        const lines = [`${cfg.xname || 'x'} = ${br(x, 3)}`];
        cfg.series.forEach(s => {
          if (!s.f || s.noTip) return; const y = s.f(x);
          lines.push(`${s.label || 'y'}: ${isFinite(y) ? br(y, 4) : 'indefinido'}`);
          if (isFinite(y)) { g.fillStyle = s.color; g.beginPath(); g.arc(this.hoverX, Y(y), 4, 0, 7); g.fill(); }
        });
        this.tip.innerHTML = lines.map(esc).join('<br>'); this.tip.style.display = 'block';
        const left = this.hoverX + 14 + 170 > W ? this.hoverX - 180 : this.hoverX + 14;
        this.tip.style.left = Math.max(4, left) + 'px'; this.tip.style.top = (pad.t + 6) + 'px';
      } else if (this.tip) this.tip.style.display = 'none';
    }
  }

  Plot.all = ALL_PLOTS;
  return Plot;
})();
