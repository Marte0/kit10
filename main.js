'use strict';

(() => {
  const { rows } = window.KIT10_DATA;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const NS = 'http://www.w3.org/2000/svg';
  const colors = ['#B9DA49', '#FFD12E', '#95D9E5', '#FFB3D2', '#ED7770', '#ACB5F8'];
  const inks = ['#3e5412', '#785000', '#005573', '#8C0040', '#802e29', '#33489E'];
  const branchNames = {
    1: 'Prodotti alimentari', 2: 'Tessile e cuoio', 3: 'Carta e stampa', 4: 'Prodotti chimici e farmaceutici',
    5: 'Cemento e calcestruzzo', 6: 'Altri minerali non ferrosi', 7: 'Metallo e ferro', 8: 'Metalli non ferrosi',
    9: 'Metalli e apparecchi', 10: 'Fabbricazione di macchinari', 11: 'Altre industrie', 12: 'Costruzioni',
    13: 'Commercio', 14: 'Alberghi e ristorazione', 15: 'Credito e assicurazioni', 16: 'Amministrazione',
    17: 'Istruzione', 18: 'Servizi sanitari e sociali', 19: 'Altri servizi',
  };
  const makeGroups = (items) => items.map(([id, name, ids, icon], i) => ({ id, name, ids, icon, color: colors[i], ink: inks[i] }));
  const industry = makeGroups([
    ['chem', 'Chimica e farmaceutica', [4], 'chem'],
    ['food', 'Alimentare', [1], 'food'],
    ['paper', 'Carta e tessile', [2, 3], 'paper'],
    ['mineral', 'Cemento e minerali', [5, 6], 'mineral'],
    ['metal', 'Metalli e macchinari', [7, 8, 9, 10], 'metal'],
    ['other-ind', 'Altre industrie e costruzioni', [11, 12], 'crane'],
  ]);
  const services = makeGroups([
    ['trade', 'Commercio', [13], 'shop'],
    ['hospitality', 'Alberghi e ristoranti', [14], 'food'],
    ['finance', 'Banche e assicurazioni', [15], 'bank'],
    ['school', 'Scuole e amministrazione', [16, 17], 'school'],
    ['health', 'Salute e assistenza', [18], 'health'],
    ['other-serv', 'Altri servizi', [19], 'city'],
  ]);
  const families = [
    { id: 'industry', name: 'Industria e costruzioni', ids: Array.from({ length: 12 }, (_, i) => i + 1), color: colors[0], ink: inks[0], icon: 'factory' },
    { id: 'services', name: 'Servizi', ids: Array.from({ length: 7 }, (_, i) => i + 13), color: colors[2], ink: inks[2], icon: 'city' },
  ];
  const groupsFor = (scope) => scope === 'all' ? families : scope === 'industry' ? industry : services;
  const scopeNames = { all: 'Tutte le attività', industry: 'Industria e costruzioni', services: 'Servizi' };
  const valueOf = (row, group) => group.ids.reduce((sum, id) => sum + row.values[id], 0);
  const totalOf = (row, scope) => groupsFor(scope).reduce((sum, group) => sum + valueOf(row, group), 0);
  const formatNumber = (n) => new Intl.NumberFormat('it-CH', { maximumFractionDigits: 0 }).format(n);
  const formatDecimal = (n) => new Intl.NumberFormat('it-CH', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(n);
  const percent = (n) => n < 1 && n > 0 ? '<1' : String(Math.round(n));
  const deltaOf = (row, group) => (valueOf(row, group) / valueOf(rows[0], group) - 1) * 100;
  const formatDelta = (n) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${formatDecimal(Math.abs(n))}%`;
  const state = { year: 2025, scope: 'all', view: 'share', metric: 'absolute', selected: ['industry', 'services'], hover: null, timer: null };
  const currentRow = () => rows[state.year - 2002];

  function icon(kind, color) {
    const shapes = {
      factory: '<path d="M17 76V41l22 12V39l24 13V29h18v47Z"/><path d="M63 29l3-18h12l3 18M28 62h8v8h-8zm18 0h8v8h-8zm18 0h8v8h-8z"/><path d="M65 6c-9-8 0-15 10-10" fill="none"/><path d="M10 79h80"/>',
      city: '<path d="M9 77V40h24v37m0 0V19h33v58m0 0V48h25v29Z"/><path d="M41 28h7v8h-7zm13 0h5v8h-5zM41 43h7v8h-7zm13 0h5v8h-5zM44 77V61h12v16M16 49h9v7h-9zm0 14h9v7h-9zm59-5h8v7h-8z"/><path d="M4 80h93"/>',
      chem: '<path d="M32 13h30M38 14v25L17 72q-4 9 6 9h49q10 0 6-9L56 39V14"/><path d="M29 57h39l11 18q2 6-6 6H23q-9 0-5-8Z" fill="'+color+'"/><circle cx="45" cy="66" r="4"/><circle cx="58" cy="73" r="2"/><path d="M75 22h16v27a8 8 0 0 1-16 0zm0 14h16"/><circle cx="24" cy="25" r="4"/>',
      food: '<path d="M22 74h55a10 10 0 0 0 10-10V51H12v13a10 10 0 0 0 10 10Z"/><path d="M18 51c0-19 12-29 31-29s31 10 31 29"/><path d="M33 36l6-5m12 4 5-5m10 10 4-3M17 80h66"/><path d="M32 16c-5-5 5-7 0-12m18 12c-5-5 5-7 0-12m18 12c-5-5 5-7 0-12" fill="none"/>',
      paper: '<path d="M22 14h38l17 18v47H22Z"/><path d="M60 14v19h17M33 44h31M33 55h31M33 66h22"/><path d="m8 32 10-6v46L8 78Zm76 3 9 6v40l-9-5"/>',
      mineral: '<path d="M11 78 23 44l26 3 12 31Zm29 0 19-50 24 12 11 38Z"/><path d="m23 44 15 14-8 20m29-50 9 24-6 26m6-26 15-12M5 82h92"/><path d="M19 26h24V12H19Zm0 7h24"/>',
      metal: '<path d="m39 12 18 0 3 11 10 5 11-2 9 15-8 9v10l8 9-9 15-12-2-10 5H39l-3-11-10-5-11 2-9-15 8-9V39l-8-9 9-15 11 2 10-5Z" transform="translate(4 0) scale(.95)"/><circle cx="49" cy="49" r="18" fill="'+color+'"/><circle cx="49" cy="49" r="7"/>',
      crane: '<path d="M43 81V12h12v69M12 22h76V12H43L12 22Zm12 59h51M49 26l-6 13 12 14-12 14 12 14M80 23v26a8 8 0 1 1-8 8"/><path d="M8 81V59h22v22Z"/>',
      shop: '<path d="M14 41h72v39H14Z"/><path d="m9 41 9-24h64l9 24Z"/><path d="M9 41c0 14 16 14 16 0 0 14 17 14 17 0 0 14 16 14 16 0 0 14 17 14 17 0 0 14 16 14 16 0M35 17l-3 24m17-24v24m17-24 4 24M24 59h23v21H24m34-21h18v13H58"/>',
      bank: '<path d="m9 32 40-22 42 22Zm5 44h72v8H14ZM24 35v37m18-37v37m18-37v37m18-37v37"/><circle cx="49" cy="25" r="4"/>',
      school: '<path d="M12 80V39h25V22h25v17h25v41Zm25-41v41m25-41v41M44 80V62h11v18M20 49h9v9h-9zm0 17h9v7h-9zm50-17h9v9h-9zm0 17h9v7h-9z"/><circle cx="49" cy="44" r="9"/><path d="M49 38v6l5 3M49 22V7h20v10H49"/>',
      health: '<path d="M13 80V30h24V14h27v16h24v50ZM39 80V62h22v18"/><path d="M46 23h9v10h10v9H55v10h-9V42H36v-9h10Z" fill="'+color+'"/><path d="M21 43h7v9h-7zm0 18h7v9h-7zm52-18h7v9h-7zm0 18h7v9h-7z"/>',
    };
    return `<svg viewBox="0 0 100 100" fill="#f8efe0" stroke="#24251f" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="50" cy="61" rx="44" ry="33" fill="${color}" stroke="none"/>${shapes[kind] || shapes.city}</svg>`;
  }

  function el(tag, attrs = {}) {
    const element = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }
  function arcPath(start, end) {
    const point = (angle, radius) => [225 + Math.cos(angle) * radius, 225 + Math.sin(angle) * radius];
    const [a, b, c, d] = [point(start, 183), point(end, 183), point(end, 122), point(start, 122)];
    const large = end - start > Math.PI ? 1 : 0;
    return `M${a} A183 183 0 ${large} 1 ${b} L${c} A122 122 0 ${large} 0 ${d} Z`;
  }
  function setCenter(group = null) {
    const row = currentRow();
    const total = totalOf(row, state.scope);
    const value = group ? valueOf(row, group) : total;
    $('#center-name').textContent = group ? group.name.toUpperCase() : 'CONSUMO COMPLESSIVO';
    $('#center-value').textContent = formatDecimal(value / 1000);
    $('#center-extra').textContent = group ? `${formatDecimal(value / total * 100)}% ${state.scope === 'all' ? 'del totale' : 'della famiglia'}` : 'nell’anno selezionato';
  }
  function highlight(id) {
    state.hover = id;
    const group = groupsFor(state.scope).find((g) => g.id === id);
    $$('.donut-segment').forEach((p) => p.classList.toggle('dimmed', Boolean(id && p.dataset.group !== id)));
    $$('.category-card').forEach((c) => c.classList.toggle('highlighted', c.dataset.group === id));
    setCenter(group || null);
    if (group && state.scope !== 'all') {
      $('#category-detail').textContent = `Comprende: ${group.ids.map((i) => branchNames[i].toLowerCase()).join('; ')}.`;
    } else {
      $('#category-detail').textContent = state.scope === 'all' ? 'Le percentuali si riferiscono all’insieme di industria, costruzioni e servizi.' : 'Le percentuali si riferiscono alla famiglia selezionata. Seleziona un gruppo per scoprirne le attività.';
    }
  }
  let donutFrame = null, lastDonutScope = null, lastDonutValues = null;
  function renderDonut() {
    if (donutFrame !== null) cancelAnimationFrame(donutFrame);
    const svg = $('#donut');
    svg.replaceChildren();
    svg.insertAdjacentHTML('afterbegin', '<defs><filter id="slice-shadow" x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx="-3" dy="4" stdDeviation="0" flood-color="#24251f"/></filter></defs>');
    svg.append(el('circle', { cx: 225, cy: 225, r: 207, fill: 'none', stroke: '#d9cfbb', 'stroke-dasharray': '2 7', 'stroke-width': 1 }));
    const groups = groupsFor(state.scope);
    const row = currentRow();
    const total = totalOf(row, state.scope);
    const targetValues = groups.map((group) => valueOf(row, group));
    const startValues = lastDonutScope === state.scope && lastDonutValues ? [...lastDonutValues] : [...targetValues];
    const segments = [];
    let angle = -Math.PI / 2;
    groups.forEach((group) => {
      const value = valueOf(row, group);
      const sweep = value / total * Math.PI * 2;
      const gap = Math.min(.035, sweep * .13);
      const path = el('path', { d: arcPath(angle + gap / 2, angle + sweep - gap / 2), fill: group.color, class: 'donut-segment', tabindex: 0, role: 'button', 'aria-label': `${group.name}: ${formatNumber(value)} TJ, ${formatDecimal(value / total * 100)}%. ${state.scope === 'all' ? 'Esplora questa famiglia.' : 'Evidenzia il gruppo.'}`, 'data-group': group.id });
      const title = el('title'); title.textContent = `${group.name}: ${formatNumber(value)} TJ`; path.append(title);
      path.addEventListener('pointerenter', () => highlight(group.id));
      path.addEventListener('pointerleave', () => highlight(null));
      path.addEventListener('focus', () => highlight(group.id));
      path.addEventListener('blur', () => highlight(null));
      const choose = () => state.scope === 'all' ? setScope(group.id) : highlight(state.hover === group.id ? null : group.id);
      path.addEventListener('click', choose);
      path.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(); } });
      svg.append(path);
      segments.push(path);
      angle += sweep;
    });
    lastDonutScope = state.scope;
    const drawAmounts = (amounts) => {
      lastDonutValues = amounts;
      const sum = amounts.reduce((a, b) => a + b, 0);
      let a = -Math.PI / 2;
      amounts.forEach((value, i) => {
        const sweep = value / sum * Math.PI * 2;
        const gap = Math.min(.035, sweep * .13);
        segments[i].setAttribute('d', arcPath(a + gap / 2, a + sweep - gap / 2));
        a += sweep;
      });
    };
    const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches && startValues.some((v, i) => Math.abs(v - targetValues[i]) > .01);
    if (animate) {
      const began = performance.now();
      drawAmounts(startValues);
      const frame = (time) => {
        const t = Math.min(1, (time - began) / 300), ease = 1 - (1 - t) ** 3;
        drawAmounts(startValues.map((value, i) => value + (targetValues[i] - value) * ease));
        if (t < 1) donutFrame = requestAnimationFrame(frame); else donutFrame = null;
      };
      donutFrame = requestAnimationFrame(frame);
    } else drawAmounts(targetValues);
    $('#chart-year').textContent = state.year;
    $('#chart-kicker').textContent = scopeNames[state.scope].toUpperCase();
    setCenter();
  }
  function renderCards() {
    const groups = groupsFor(state.scope);
    const row = currentRow(), total = totalOf(row, state.scope);
    const grid = $('#category-grid');
    grid.classList.toggle('overview', state.scope === 'all');
    grid.innerHTML = groups.map((group) => {
      const value = valueOf(row, group);
      return `<button type="button" class="category-card ${state.scope === 'all' ? 'overview-card' : ''}" data-group="${group.id}" style="--card-tint:${group.color}28;--card-ink:${group.ink}" aria-label="${group.name}: ${formatDecimal(value / total * 100)}%, ${formatNumber(value)} TJ. ${state.scope === 'all' ? 'Esplora la famiglia' : 'Scopri le attività incluse'}"><span class="card-percent">${percent(value / total * 100)}<small>%</small></span><span class="card-icon">${icon(group.icon, group.color)}</span><span class="card-name">${group.name.toUpperCase()}</span><span class="card-value">${formatNumber(value)} TJ</span>${state.scope === 'all' ? '<span class="card-arrow" aria-hidden="true">↗</span>' : ''}</button>`;
    }).join('');
    $$('.category-card').forEach((card) => {
      card.addEventListener('pointerenter', () => highlight(card.dataset.group));
      card.addEventListener('pointerleave', () => highlight(null));
      card.addEventListener('focus', () => highlight(card.dataset.group));
      card.addEventListener('blur', () => highlight(null));
      card.addEventListener('click', () => state.scope === 'all' ? setScope(card.dataset.group) : highlight(card.dataset.group));
    });
    $('#categories-title').textContent = state.scope === 'all' ? 'DOVE VA L’ENERGIA' : 'DENTRO QUESTA FAMIGLIA';
    $('#categories-count').textContent = state.scope === 'all' ? '02 FAMIGLIE' : '06 GRUPPI';
    $('#chart-instruction').innerHTML = state.scope === 'all' ? 'Scegli una famiglia per scoprire cosa c’è dentro <span>↗</span>' : 'Ogni colore è un gruppo di attività. Esploralo!';
    highlight(null);
  }

  let trendGeometry;
  function renderTrend() {
    const svg = $('#line-chart'); svg.replaceChildren();
    const mobile = window.innerWidth < 760;
    const W = mobile ? Math.max(280, window.innerWidth - 40) : 1120, H = mobile ? 300 : 340;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const margin = { left: 56, right: 25, top: 39, bottom: 38 };
    const groups = groupsFor(state.scope).filter((g) => state.selected.includes(g.id));
    const getValue = (row, group) => state.metric === 'absolute' ? valueOf(row, group) / 1000 : deltaOf(row, group);
    const values = rows.flatMap((row) => groups.map((g) => getValue(row, g)));
    let min = Math.min(0, ...values), max = Math.max(0, ...values);
    const step = niceStep((max - min || 1) / 4);
    min = Math.floor(min / step) * step; max = Math.ceil(max / step) * step;
    if (min === max) max = min + step;
    const x = (year) => margin.left + (year - 2002) / 23 * (W - margin.left - margin.right);
    const y = (value) => H - margin.bottom - (value - min) / (max - min) * (H - margin.top - margin.bottom);
    const textNode = (text, attrs) => { const t = el('text', attrs); t.textContent = text; svg.append(t); };
    textNode(state.metric === 'absolute' ? 'MIGLIAIA DI TJ' : 'VARIAZIONE DAL 2002 (%)', { x: margin.left, y: 17, class: 'axis-label' });
    textNode(String(state.year), { x: W - margin.right, y: 17, class: 'axis-label', 'text-anchor': 'end' });
    for (let tick = min; tick <= max + step / 10; tick += step) {
      svg.append(el('line', { x1: margin.left, x2: W - margin.right, y1: y(tick), y2: y(tick), class: 'grid-line' }));
      textNode(`${Math.round(tick)}${state.metric === 'change' ? '%' : ''}`, { x: margin.left - 13, y: y(tick) + 4, class: 'axis-text', 'text-anchor': 'end' });
    }
    (mobile ? [2002, 2010, 2018, 2025] : [2002, 2005, 2010, 2015, 2020, 2025]).forEach((year) => textNode(String(year), { x: x(year), y: H - 10, class: 'axis-text', 'text-anchor': 'middle' }));
    groups.forEach((group) => {
      const d = rows.map((row, i) => `${i ? 'L' : 'M'}${x(row.year)},${y(getValue(row, group))}`).join(' ');
      svg.append(el('path', { d, stroke: group.ink, class: 'trend-line' }));
    });
    svg.append(el('line', { x1: x(state.year), x2: x(state.year), y1: margin.top, y2: H - margin.bottom, class: 'cursor-line', id: 'trend-cursor' }));
    groups.forEach((group) => svg.append(el('circle', { cx: x(state.year), cy: y(getValue(currentRow(), group)), r: 5, fill: group.color, stroke: group.ink, 'stroke-width': 2, 'data-dot': group.id })));
    const hit = el('rect', { x: margin.left, y: margin.top, width: W - margin.left - margin.right, height: H - margin.top - margin.bottom, fill: 'transparent' });
    hit.addEventListener('pointermove', (event) => { if (event.pointerType !== 'touch') moveOnChart(event); });
    hit.addEventListener('click', moveOnChart);
    hit.addEventListener('pointerleave', () => { $('#chart-tooltip').hidden = true; });
    svg.append(hit);
    trendGeometry = { x, y, W, margin, getValue, groups };
    $('#trend-caption').textContent = state.metric === 'absolute' ? 'Più in alto è la linea, più energia viene usata. Esplora un anno con il cursore o con lo slider.' : 'Tutti partono da zero: qui confronti quanto sono cambiati i consumi rispetto al 2002, anche se le attività hanno dimensioni diverse.';
    renderLegend();
  }
  function niceStep(value) {
    const power = 10 ** Math.floor(Math.log10(value));
    const normalized = value / power;
    return (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * power;
  }
  function moveOnChart(event) {
    stopPlaying();
    const svg = $('#line-chart'), { W, margin } = trendGeometry;
    const rect = svg.getBoundingClientRect();
    // The SVG uses its default xMidYMid meet behavior on narrow displays.
    const vb = svg.viewBox.baseVal;
    const scale = Math.min(rect.width / vb.width, rect.height / vb.height);
    const offsetX = (rect.width - vb.width * scale) / 2;
    const px = (event.clientX - rect.left - offsetX) / scale;
    const year = Math.max(2002, Math.min(2025, Math.round(2002 + (px - margin.left) / (W - margin.left - margin.right) * 23)));
    setYear(year, false);
    showTooltip();
  }
  function updateTrendCursor() {
    if (!trendGeometry || state.view !== 'trend') return;
    const { x, y, groups, getValue } = trendGeometry;
    const line = $('#trend-cursor');
    line.setAttribute('x1', x(state.year)); line.setAttribute('x2', x(state.year));
    groups.forEach((group) => {
      const dot = document.querySelector(`[data-dot="${group.id}"]`);
      if (dot) { dot.setAttribute('cx', x(state.year)); dot.setAttribute('cy', y(getValue(currentRow(), group))); }
    });
    const yearLabel = $$('#line-chart .axis-label').at(-1); if (yearLabel) yearLabel.textContent = state.year;
    updateLegendValues();
  }
  function showTooltip() {
    const tooltip = $('#chart-tooltip');
    const { groups } = trendGeometry;
    tooltip.innerHTML = `<strong>${state.year}</strong>${groups.map((group) => `<div class="tooltip-row"><span><i class="legend-dot" style="background:${group.color}"></i>${group.name}</span><b>${state.metric === 'absolute' ? `${formatNumber(valueOf(currentRow(), group))} TJ` : formatDelta(deltaOf(currentRow(), group))}</b></div>`).join('')}`;
    tooltip.hidden = false;
    const width = $('.line-chart-wrap').clientWidth;
    tooltip.style.left = `${Math.max(0, Math.min(width - tooltip.offsetWidth, (state.year - 2002) / 23 * width - tooltip.offsetWidth / 2))}px`;
  }
  function renderLegend() {
    $('#trend-legend').innerHTML = groupsFor(state.scope).map((group) => `<button type="button" data-legend="${group.id}" class="${state.selected.includes(group.id) ? 'active' : ''}" aria-pressed="${state.selected.includes(group.id)}"><i class="legend-dot" style="background:${group.color}"></i><span>${group.name}</span><span class="legend-value"></span></button>`).join('');
    $$('[data-legend]').forEach((button) => button.addEventListener('click', () => {
      const id = button.dataset.legend;
      if (state.selected.includes(id)) {
        if (state.selected.length === 1) { $('#selection-message').textContent = 'Lascia almeno un gruppo selezionato per vedere il grafico.'; return; }
        state.selected = state.selected.filter((selected) => selected !== id);
      } else if (state.selected.length < 3) { state.selected.push(id); }
      else { $('#selection-message').textContent = 'Puoi confrontare fino a 3 gruppi. Deselezionane uno per aggiungerne un altro.'; return; }
      $('#chart-tooltip').hidden = true;
      renderTrend();
      document.querySelector(`[data-legend="${id}"]`).focus({ preventScroll: true });
    }));
    updateLegendValues();
    $('#selection-message').textContent = state.scope === 'all' ? 'Scegli Industria e costruzioni o Servizi per esplorare i singoli gruppi.' : 'Confronta fino a 3 gruppi alla volta. Clicca i nomi per aggiungerli o toglierli.';
  }
  function updateLegendValues() {
    $$('[data-legend]').forEach((button) => {
      const group = groupsFor(state.scope).find((g) => g.id === button.dataset.legend);
      button.querySelector('.legend-value').textContent = state.selected.includes(group.id) ? state.metric === 'absolute' ? `${formatDecimal(valueOf(currentRow(), group) / 1000)} mila TJ` : formatDelta(deltaOf(currentRow(), group)) : '';
    });
  }
  function renderInsight() {
    const row = currentRow();
    const total = totalOf(row, state.scope), first = totalOf(rows[0], state.scope);
    const delta = (total / first - 1) * 100;
    if (state.year === 2002) {
      $('#insight-text').innerHTML = `<b>Si parte dal 2002.</b> ${state.scope === 'all' ? 'Industria, costruzioni e servizi' : scopeNames[state.scope]} usano ${formatNumber(total)} TJ. Muovi lo slider e scopri cosa succede dopo.`;
    } else if (state.view === 'trend' || state.scope !== 'all') {
      $('#insight-text').innerHTML = `<b>${formatDelta(delta)} rispetto al 2002.</b> È il cambiamento dei consumi ${state.scope === 'all' ? 'di tutte queste attività' : state.scope === 'industry' ? 'dell’industria e delle costruzioni' : 'dei servizi'} nel ${state.year}. Il grafico racconta quanta energia si usa, non quante cose si producono.`;
    } else {
      const share = valueOf(row, families[0]) / total * 100;
      $('#insight-text').innerHTML = `<b>Nel ${state.year}, circa ${Math.round(share)} parti su 100</b> dell’energia qui rappresentata vanno all’industria e alle costruzioni. Le altre ${100 - Math.round(share)} ai servizi, dai negozi alle scuole.`;
    }
  }
  function setYear(year, draw = true) {
    state.year = year;
    $('#year-slider').value = year;
    $('#year-slider').style.setProperty('--progress', `${(year - 2002) / 23 * 100}%`);
    $('#year-output').value = year;
    if (state.view === 'share') { renderDonut(); renderCards(); }
    else if (draw) { $('#chart-tooltip').hidden = true; updateTrendCursor(); }
    else { updateTrendCursor(); }
    renderInsight();
  }
  function setScope(scope) {
    state.scope = scope; state.hover = null;
    const groups = groupsFor(scope);
    state.selected = scope === 'all' ? groups.map((g) => g.id) : [...groups].sort((a, b) => valueOf(rows.at(-1), b) - valueOf(rows.at(-1), a)).slice(0, 3).map((g) => g.id);
    $$('[data-scope]').forEach((b) => { b.classList.toggle('active', b.dataset.scope === scope); b.setAttribute('aria-pressed', b.dataset.scope === scope); });
    $('#explore-hint').textContent = scope === 'all' ? 'Due famiglie, tante attività.' : 'Sei gruppi, una famiglia.';
    $('#chart-tooltip').hidden = true;
    renderDonut(); renderCards(); renderTrend(); renderInsight();
  }
  function setView(view) {
    state.view = view;
    $$('[data-view]').forEach((b) => { b.classList.toggle('active', b.dataset.view === view); b.setAttribute('aria-pressed', b.dataset.view === view); });
    $('#share-view').hidden = view !== 'share'; $('#trend-view').hidden = view !== 'trend';
    $('#chart-tooltip').hidden = true;
    if (view === 'trend') renderTrend(); else { renderDonut(); renderCards(); }
    renderInsight();
  }
  function stopPlaying() {
    if (state.timer) window.clearInterval(state.timer);
    state.timer = null;
    $('#play').setAttribute('aria-label', 'Riproduci gli anni');
    $('#play').setAttribute('aria-pressed', 'false');
    $('#play').innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5L19 12L8 19Z" fill="currentColor"/></svg>';
  }
  $('#play').addEventListener('click', () => {
    if (state.timer) { stopPlaying(); return; }
    $('#play').setAttribute('aria-label', 'Metti in pausa'); $('#play').setAttribute('aria-pressed', 'true');
    $('#play').innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zm6 0h4v14h-4z" fill="currentColor"/></svg>';
    if (state.year === 2025) setYear(2002);
    state.timer = window.setInterval(() => { if (state.year === 2025) stopPlaying(); else setYear(state.year + 1); }, 950);
  });
  $('#year-slider').addEventListener('input', (event) => { stopPlaying(); setYear(Number(event.target.value)); });
  $$('[data-scope]').forEach((b) => b.addEventListener('click', () => setScope(b.dataset.scope)));
  $$('[data-view]').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
  $$('[data-metric]').forEach((b) => b.addEventListener('click', () => {
    state.metric = b.dataset.metric;
    $$('[data-metric]').forEach((m) => { m.classList.toggle('active', m === b); m.setAttribute('aria-pressed', m === b); });
    $('#chart-tooltip').hidden = true; renderTrend();
  }));
  const dialog = $('#about-dialog');
  $('#about-open').addEventListener('click', () => { stopPlaying(); $('#chart-tooltip').hidden = true; dialog.showModal(); });
  $('#about-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  $('#group-definitions').innerHTML = [['Industria e costruzioni', industry], ['Servizi', services]].map(([name, groups]) => `<p class="definition-family">${name}</p><ul>${groups.map((g) => `<li><b>${g.name}:</b> ${g.ids.map((id) => branchNames[id]).join('; ')}.</li>`).join('')}</ul>`).join('');
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopPlaying(); });
  let resizeFrame;
  window.addEventListener('resize', () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(() => { if (state.view === 'trend') renderTrend(); }); });
  setScope('all'); setYear(2025);
})();
