// ═════════════════════════════════════════════
//  APP LOGIC — Generador de Propuestas
// ════════════════════════════════════════════

let state = {
  mode: 'plan',
  ciudad: 'CDMX_EDOMEX',

  single: {
    product: 'plan',
    plan: '',
    qty: null,
    oportunidadesQty: '300',
    elitePackage: 'hasta300',
    eliteExtraBlocks: 1,
    period: 'anual',
    fecha: '',
    vigencia: '',
    desc: 0
  },

  pkg: {
    plan: { enabled: false, plan: '', oportunidadesQty: '300', elitePackage: 'hasta300', eliteExtraBlocks: 1, period: 'anual', fecha: '', vigencia: '', desc: 0 },
    dest: { enabled: false, qty: null, period: 'anual', fecha: '', vigencia: '', desc: 0 },
    prime: { enabled: false, qty: null, period: 'anual', fecha: '', vigencia: '', desc: 0 }
  },

  vs: {
    p1: { product: 'plan', plan: '', qty: null, oportunidadesQty: '300', elitePackage: 'hasta300', period: 'anual', fecha: '', vigencia: '', desc: 0 },
    p2: { product: 'destacados', plan: '', qty: null, oportunidadesQty: '300', elitePackage: 'hasta300', period: 'anual', fecha: '', vigencia: '', desc: 0 }
  },

  cliente: '',
  inventario: '',
  ciudadDisplay: '',
  asesor: 'cc',
  propuestaVigencia: ''
};

window.state = state;


const ASESORES_FALLBACK = {
  cc: { nombre: 'Contact Center', telefono: '5568181068' },
  anahi_cruz: { nombre: 'Anahi Cruz', telefono: '5215594484517' },
  doranely_gonzalez: { nombre: 'Doranely Gonzalez', telefono: '5215594486001' },
  daniel_brena: { nombre: 'Daniel Brena', telefono: '5215597712824' },
  hannali_de_la_garza: { nombre: 'Hannali de la Garza', telefono: '5215597710410' },
  asesor5: { nombre: 'Asesor 5', telefono: null },
  asesor6: { nombre: 'Asesor 6', telefono: null },
  asesor7: { nombre: 'Asesor 7', telefono: null },
  asesor8: { nombre: 'Asesor 8', telefono: null },
  asesor9: { nombre: 'Asesor 9', telefono: null }
};

function asesoresCatalog() {
  return typeof ASESORES !== 'undefined' ? ASESORES : ASESORES_FALLBACK;
}

function safeRun(fn, label = 'acción') {
  try {
    fn();
  } catch (error) {
    console.error(`Error en ${label}:`, error);
  }
}




// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  safeRun(() => initDefaultDates(), 'fechas iniciales');
  safeRun(() => bindEvents(), 'eventos');
  safeRun(() => syncUI(), 'interfaz');
  safeRun(() => render(), 'render inicial');
});

// ── DOM helpers ───────────────────────────────
function getEl(id) {
  return document.getElementById(id);
}

function setValue(id, value) {
  const el = getEl(id);
  if (el) el.value = value ?? '';
}

function setText(id, value) {
  const el = getEl(id);
  if (el) el.textContent = value;
}

function toggleEl(id, show) {
  const el = getEl(id);
  if (el) el.classList.toggle('is-hidden', !show);
}

function parseOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}


function addBusinessDaysISO(startDate, businessDays) {
  const date = new Date(startDate);
  let added = 0;

  while (added < businessDays) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();

    if (day !== 0 && day !== 6) {
      added++;
    }
  }

  return date.toISOString().split('T')[0];
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ── Defaults ──────────────────────────────────
function initDefaultDates() {
  state.single.fecha = todayISO();
  state.propuestaVigencia = addBusinessDaysISO(new Date(), 7);

  setValue('inp-single-fecha', state.single.fecha);
  setValue('inp-propuesta-vigencia', state.propuestaVigencia);

  updateSingleVigencia();
}

// ── Events ────────────────────────────────────
function bindEvents() {
  document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => safeRun(() => {
      setActive('[data-mode]', btn);
      state.mode = btn.dataset.mode;
      syncUI();
      render();
    }, 'cambio de tipo de propuesta'));
  });

  getEl('sel-ciudad').addEventListener('change', e => {
    state.ciudad = e.target.value;
    syncUI();
    render();
  });

  document.querySelectorAll('[data-single-product]').forEach(btn => {
    btn.addEventListener('click', () => safeRun(() => {
      setActive('[data-single-product]', btn);
      state.single.product = btn.dataset.singleProduct;
      syncUI();
      render();
    }, 'cambio de producto individual'));
  });

  getEl('sel-single-plan').addEventListener('change', e => {
    state.single.plan = e.target.value;
    syncUI();
    render();
  });

  getEl('sel-single-oportunidades-qty').addEventListener('change', e => {
    state.single.oportunidadesQty = e.target.value;
    render();
  });

  getEl('sel-single-elite-package').addEventListener('change', e => {
    state.single.elitePackage = e.target.value;
    syncUI();
    render();
  });

  ['input', 'change'].forEach(evt => {
    getEl('inp-single-qty').addEventListener(evt, e => {
      state.single.qty = parseOptionalNumber(e.target.value);
      render();
    });
  });

  getEl('inp-single-desc').addEventListener('input', e => {
    const value = normalizeDiscountValue(e.target.value);
    state.single.desc = value;
    if ((parseOptionalNumber(e.target.value) || 0) !== value) {
      e.target.value = value > 0 ? String(value) : '';
    }
    render();
  });

  getEl('inp-single-fecha').addEventListener('change', e => {
    state.single.fecha = e.target.value;
    updateSingleVigencia();
    render();
  });

  bindPackageSwitch('chk-pkg-plan', 'plan');
  bindPackageSwitch('chk-pkg-dest', 'dest');
  bindPackageSwitch('chk-pkg-prime', 'prime');

  getEl('sel-pkg-plan').addEventListener('change', e => {
    state.pkg.plan.plan = e.target.value;
    syncUI();
    render();
  });

  getEl('sel-pkg-oportunidades-qty').addEventListener('change', e => {
    state.pkg.plan.oportunidadesQty = e.target.value;
    render();
  });

  getEl('sel-pkg-elite-package').addEventListener('change', e => {
    state.pkg.plan.elitePackage = e.target.value;
    syncUI();
    render();
  });

  ['input', 'change'].forEach(evt => {
    getEl('inp-pkg-dest-qty').addEventListener(evt, e => {
      state.pkg.dest.qty = parseOptionalNumber(e.target.value);
      render();
    });

    getEl('inp-pkg-prime-qty').addEventListener(evt, e => {
      state.pkg.prime.qty = parseOptionalNumber(e.target.value);
      render();
    });
  });

  bindPackageDate('inp-pkg-plan-fecha', 'plan');
  bindPackageDate('inp-pkg-dest-fecha', 'dest');
  bindPackageDate('inp-pkg-prime-fecha', 'prime');

  bindPackageDiscount('inp-pkg-plan-desc', 'plan');
  bindPackageDiscount('inp-pkg-dest-desc', 'dest');
  bindPackageDiscount('inp-pkg-prime-desc', 'prime');

  document.addEventListener('click', e => safeRun(() => {
    const btn = e.target.closest('.period-btn');
    if (!btn || btn.disabled || btn.classList.contains('disabled')) return;

    if (btn.dataset.periodScope === 'single') {
      setActive('[data-period-scope="single"]', btn);
      state.single.period = btn.dataset.period;
      updateSingleVigencia();
      render();
      return;
    }

    if (btn.dataset.periodScope === 'pkg') {
      const product = btn.dataset.pkgProduct;
      const group = btn.closest('.period-group');

      group.querySelectorAll('.period-btn').forEach(item => item.classList.remove('active'));
      btn.classList.add('active');

      state.pkg[product].period = btn.dataset.period;
      updatePkgVigencia(product);
      render();
      return;
    }

    if (btn.dataset.periodScope === 'vs') {
      const slot = btn.dataset.vsSlot;
      const group = btn.closest('.period-group');

      group.querySelectorAll('.period-btn').forEach(item => item.classList.remove('active'));
      btn.classList.add('active');

      state.vs[slot].period = btn.dataset.period;
      updateVsVigencia(slot);
      render();
    }
  }, 'cambio de periodo'));


  getEl('sel-asesor').addEventListener('change', e => {
    state.asesor = e.target.value;
    render();
  });

  getEl('inp-propuesta-vigencia').addEventListener('change', e => {
    state.propuestaVigencia = e.target.value;
    render();
  });

  getEl('inp-cliente').addEventListener('input', e => {
    state.cliente = e.target.value;
    render();
  });

  getEl('inp-inventario').addEventListener('input', e => {
    state.inventario = e.target.value;
    render();
  });

  ['input', 'change'].forEach(evt => {
    getEl('inp-ciudad-display').addEventListener(evt, e => {
      state.ciudadDisplay = e.target.value;
      render();
    });
  });

  ['p1', 'p2'].forEach(slot => {
    document.querySelectorAll(`[data-vs-slot="${slot}"][data-vs-product]`).forEach(btn => {
      btn.addEventListener('click', () => safeRun(() => {
        setActive(`[data-vs-slot="${slot}"][data-vs-product]`, btn);
        state.vs[slot].product = btn.dataset.vsProduct;
        syncVsSlot(slot);
        render();
      }, `cambio de producto VS ${slot}`));
    });

    getEl(`sel-vs-${slot}-plan`).addEventListener('change', e => {
      state.vs[slot].plan = e.target.value;
      syncVsSlot(slot);
      render();
    });

    getEl(`sel-vs-${slot}-elite-package`).addEventListener('change', e => {
      state.vs[slot].elitePackage = e.target.value;
      render();
    });

    getEl(`sel-vs-${slot}-oportunidades-qty`).addEventListener('change', e => {
      state.vs[slot].oportunidadesQty = e.target.value;
      render();
    });

    ['input', 'change'].forEach(evt => {
      getEl(`inp-vs-${slot}-qty`).addEventListener(evt, e => {
        state.vs[slot].qty = parseOptionalNumber(e.target.value);
        render();
      });
    });

    getEl(`inp-vs-${slot}-fecha`).addEventListener('change', e => {
      state.vs[slot].fecha = e.target.value;
      updateVsVigencia(slot);
      render();
    });

    getEl(`inp-vs-${slot}-desc`).addEventListener('input', e => {
      const value = normalizeDiscountValue(e.target.value);
      state.vs[slot].desc = value;
      if ((parseOptionalNumber(e.target.value) || 0) !== value) {
        e.target.value = value > 0 ? String(value) : '';
      }
      render();
    });
  });
}

function setActive(selector, activeBtn) {
  document.querySelectorAll(selector).forEach(btn => btn.classList.remove('active'));
  activeBtn.classList.add('active');
}

function bindPackageSwitch(id, key) {
  getEl(id).addEventListener('change', e => {
    state.pkg[key].enabled = e.target.checked;

    if (state.pkg[key].enabled) {
      initPackageProduct(key);
    } else {
      clearPackageProduct(key);
    }

    syncUI();
    render();
  });
}

function bindPackageDate(id, key) {
  getEl(id).addEventListener('change', e => {
    state.pkg[key].fecha = e.target.value;
    updatePkgVigencia(key);
    render();
  });
}

function bindPackageDiscount(id, key) {
  getEl(id).addEventListener('input', e => {
    const value = normalizeDiscountValue(e.target.value);
    state.pkg[key].desc = value;
    if ((parseOptionalNumber(e.target.value) || 0) !== value) {
      e.target.value = value > 0 ? String(value) : '';
    }
    lockPackageDiscounts();
    render();
  });
}


function discountCap() {
  return regionalDiscountPct();
}

function discountCapText() {
  const cap = discountCap();

  if (!cap) {
    return 'FullPrice seleccionado: sin descuento regional. Puedes capturar descuento adicional si aplica.';
  }

  return `Descuento regional incluido: ${cap}%. Captura aquí un descuento adicional si aplica.`;
}

function normalizeDiscountValue(value) {
  const n = parseOptionalNumber(value) || 0;

  if (n < 0) return 0;
  if (n > 100) return 100;

  return n;
}

function updateDiscountNote(helpId) {
  const help = getEl(helpId);
  if (help) help.textContent = discountCapText();
}

function updateSingleDiscountAvailability() {
  const input = getEl('inp-single-desc');
  if (input) {
    input.disabled = false;
    input.max = '100';
    input.placeholder = '0 a 100';
    input.classList.remove('calculated-field');
  }

  updateDiscountNote('help-single-desc');
}

// ── UI sync ───────────────────────────────────
function syncUI() {
  toggleEl('section-individual', state.mode === 'plan');
  toggleEl('section-paquete', state.mode === 'paquete');
  toggleEl('section-vs', state.mode === 'vs');
  syncVsSlot('p1');
  syncVsSlot('p2');

  const isPlan = state.single.product === 'plan';
  const isDest = state.single.product === 'destacados';
  const isPrime = state.single.product === 'prime';

  toggleEl('field-single-plan', isPlan);
  toggleEl('field-single-elite-package', isPlan && state.single.plan === 'elite');
  toggleEl('field-single-oportunidades-qty', isPlan && state.single.plan === 'oportunidades');
  toggleEl('field-single-qty', !isPlan);

  if (isDest) {
    setText('single-qty-label', 'Cantidad de avisos Destacados');
    setText('single-desc-label', 'Descuento adicional a destacado (%)');
  } else if (isPrime) {
    setText('single-qty-label', 'Cantidad de avisos Prime');
    setText('single-desc-label', 'Descuento adicional a prime (%)');
  } else {
    setText('single-desc-label', 'Descuento adicional (%)');
  }

  updateSingleDiscountAvailability();

  setPackageBlockVisibility('plan', state.pkg.plan.enabled);
  setPackageBlockVisibility('dest', state.pkg.dest.enabled);
  setPackageBlockVisibility('prime', state.pkg.prime.enabled);
  toggleEl('field-pkg-elite-package', state.pkg.plan.enabled && state.pkg.plan.plan === 'elite');
  toggleEl('field-pkg-oportunidades-qty', state.pkg.plan.enabled && state.pkg.plan.plan === 'oportunidades');

  lockPackageDiscounts();
  updateExportButton();
}

function setPackageBlockVisibility(key, visible) {
  const blocks = {
    plan: 'pkg-plan-block',
    dest: 'pkg-dest-block',
    prime: 'pkg-prime-block'
  };

  toggleEl(blocks[key], visible);
}

function lockPackageDiscounts() {
  const config = [
    { key: 'plan', id: 'inp-pkg-plan-desc', help: 'help-pkg-plan-desc' },
    { key: 'dest', id: 'inp-pkg-dest-desc', help: 'help-pkg-dest-desc' },
    { key: 'prime', id: 'inp-pkg-prime-desc', help: 'help-pkg-prime-desc' }
  ];

  config.forEach(item => {
    const input = getEl(item.id);
    const help = getEl(item.help);
    if (!input) return;

    input.max = '100';
    input.placeholder = '0 a 100';

    if (help) help.textContent = discountCapText();

    const enabled = state.pkg[item.key].enabled;
    input.disabled = !enabled;

    if (!enabled) {
      state.pkg[item.key].desc = 0;
      input.value = '';
      input.classList.add('calculated-field');
    } else {
      input.classList.remove('calculated-field');
    }
  });
}

function updateExportButton() {
  const btn = getEl('btn-export-pdf');
  if (!btn) return;

  const packageNeedsMoreProducts = state.mode === 'paquete' && countEnabledPackageProducts() < 2;
  const vsNeedsProducts = state.mode === 'vs' && getSelectedItems().length < 2;
  btn.disabled = packageNeedsMoreProducts || vsNeedsProducts;
}

// ── Package values ────────────────────────────
function initPackageProduct(key) {
  if (!state.pkg[key].fecha) {
    state.pkg[key].fecha = todayISO();
  }

  const dateInputs = {
    plan: 'inp-pkg-plan-fecha',
    dest: 'inp-pkg-dest-fecha',
    prime: 'inp-pkg-prime-fecha'
  };

  setValue(dateInputs[key], state.pkg[key].fecha);
  updatePkgVigencia(key);
}

function clearPackageProduct(key) {
  if (key === 'plan') {
    state.pkg.plan.plan = '';
    state.pkg.plan.oportunidadesQty = '300';
    state.pkg.plan.elitePackage = 'hasta300';
    state.pkg.plan.eliteExtraBlocks = 1;
    state.pkg.plan.fecha = '';
    state.pkg.plan.vigencia = '';
    state.pkg.plan.desc = 0;

    setValue('sel-pkg-plan', '');
    setValue('sel-pkg-oportunidades-qty', '300');
    setValue('sel-pkg-elite-package', 'hasta300');
    setValue('inp-pkg-plan-fecha', '');
    setValue('inp-pkg-plan-vigencia', '');
    setValue('inp-pkg-plan-desc', '');
  }

  if (key === 'dest') {
    state.pkg.dest.qty = null;
    state.pkg.dest.fecha = '';
    state.pkg.dest.vigencia = '';
    state.pkg.dest.desc = 0;

    setValue('inp-pkg-dest-qty', '');
    setValue('inp-pkg-dest-fecha', '');
    setValue('inp-pkg-dest-vigencia', '');
    setValue('inp-pkg-dest-desc', '');
  }

  if (key === 'prime') {
    state.pkg.prime.qty = null;
    state.pkg.prime.fecha = '';
    state.pkg.prime.vigencia = '';
    state.pkg.prime.desc = 0;

    setValue('inp-pkg-prime-qty', '');
    setValue('inp-pkg-prime-fecha', '');
    setValue('inp-pkg-prime-vigencia', '');
    setValue('inp-pkg-prime-desc', '');
  }
}

function countEnabledPackageProducts() {
  return Number(state.pkg.plan.enabled) + Number(state.pkg.dest.enabled) + Number(state.pkg.prime.enabled);
}

// ── Dates ─────────────────────────────────────
function updateSingleVigencia() {
  state.single.vigencia = addMonths(state.single.fecha, monthsByPeriod(state.single.period));
  setValue('inp-single-vigencia', state.single.vigencia);
}

function updatePkgVigencia(product) {
  state.pkg[product].vigencia = addMonths(state.pkg[product].fecha, monthsByPeriod(state.pkg[product].period));

  const inputs = {
    plan: 'inp-pkg-plan-vigencia',
    dest: 'inp-pkg-dest-vigencia',
    prime: 'inp-pkg-prime-vigencia'
  };

  setValue(inputs[product], state.pkg[product].vigencia);
}

function monthsByPeriod(period) {
  return mesesPorPeriodo(period);
}

function addMonths(dateStr, months) {
  if (!dateStr) return '';

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setMonth(date.getMonth() + months);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}


function regionalDiscountPct() {
  const zone = state.ciudad;

  if (zone === 'FullPrice') return 0;
  if (zone === 'CDMX_EDOMEX') return 20;
  if (zone === 'JALISCO_NL') return 50;
  if (zone === 'QUERETARO') return 65;
  if (zone === 'RESTO') return 70;

  if (typeof getDescuentoMaximo === 'function') {
    return getDescuentoMaximo(zone);
  }

  return 0;
}

function applyAdditionalDiscount(subtotal, manualPct, original = null) {
  const pct = normalizeDiscountValue(manualPct);
  const final = Math.round(Number(subtotal || 0) * (1 - pct / 100));
  const originalValue = original && original > final ? original : (pct > 0 ? Number(subtotal || 0) : null);
  const displayPct = originalValue ? Math.round((1 - final / originalValue) * 100) : 0;

  return {
    final,
    original: originalValue,
    pct: displayPct,
    manualPct: pct
  };
}

function calculateFullPriceWithZone(fullMensual, quantity, period, manualPct) {
  const qty = Math.max(1, Math.round(Number(quantity) || 1));
  const months = monthsByPeriod(period);
  const zonePct = regionalDiscountPct();

  const mensualConZona = Math.round(Number(fullMensual || 0) * (1 - zonePct / 100));
  const subtotalConZona = mensualConZona * qty * months;
  const fullSubtotal = Number(fullMensual || 0) * qty * months;

  return {
    ...applyAdditionalDiscount(subtotalConZona, manualPct, zonePct > 0 ? fullSubtotal : null),
    zonePct,
    monthlyBase: Number(fullMensual || 0),
    monthlyZone: mensualConZona,
    quantity: qty,
    months
  };
}

function calculatePackageFullWithZone(fullSubtotal, manualPct) {
  const zonePct = regionalDiscountPct();
  const subtotalConZona = Math.round(Number(fullSubtotal || 0) * (1 - zonePct / 100));

  return {
    ...applyAdditionalDiscount(subtotalConZona, manualPct, zonePct > 0 ? Number(fullSubtotal || 0) : null),
    zonePct
  };
}

function calculateRegionalTablePrice(subtotal, manualPct) {
  return applyAdditionalDiscount(subtotal, manualPct);
}

function ciudadLabel(value) {
  const labels = {
    FullPrice: 'FullPrice',
    CDMX_EDOMEX: 'CDMX - Edo Mex',
    JALISCO_NL: 'Jalisco - Nuevo León',
    QUERETARO: 'Querétaro',
    RESTO: 'Resto del país'
  };

  return labels[value] || value || '—';
}

function regionalPriceFromFull(fullPrice) {
  const zonePct = regionalDiscountPct();
  const subtotalConZona = Math.round(Number(fullPrice || 0) * (1 - zonePct / 100));

  return {
    base: subtotalConZona,
    original: zonePct > 0 ? Number(fullPrice || 0) : null,
    regionalPct: zonePct
  };
}

function applyManualDiscountToBase(base, manualPct, original = null) {
  return applyAdditionalDiscount(base, manualPct, original);
}


function periodLabel(period) {
  if (period === 'mensual') return 'Mensual';
  if (period === 'trimestral') return 'Trimestral';
  if (period === 'semestral') return 'Semestral';
  return 'Anual';
}

// ── Pricing ───────────────────────────────────
function getEliteInventory(elitePackage = 'hasta300') {
  const inventarioCliente = Math.max(1, Math.round(Number(state.inventario) || 300));

  if (elitePackage === 'hasta300') return 300;
  if (elitePackage === 'hasta500') return 500;
  if (elitePackage === 'custom') return inventarioCliente;

  return 300;
}

function getEliteCoverageLabel(elitePackage = 'hasta300', inventario = 300) {
  const inv = Math.max(1, Math.round(Number(inventario) || 300));

  if (elitePackage === 'hasta300') return 'Hasta 300 propiedades';
  if (elitePackage === 'hasta500') return '301 a 500 propiedades';

  if (elitePackage === 'custom') {
    const extras = inv > 500 ? Math.ceil((inv - 500) / 500) : 0;

    if (extras > 0) {
      return `${inv.toLocaleString('es-MX')} propiedades (${extras} bloque${extras === 1 ? '' : 's'} extra de 500)`;
    }

    return `${inv.toLocaleString('es-MX')} propiedades`;
  }

  return 'Hasta 300 propiedades';
}

function getPlanInventory(planKey, oportunidadesQty, elitePackage = 'hasta300') {
  if (planKey === 'oportunidades' && oportunidadesQty && oportunidadesQty !== 'custom') {
    return Number(oportunidadesQty) || 300;
  }

  if (planKey === 'elite') {
    return getEliteInventory(elitePackage);
  }

  return Number(state.inventario) || 300;
}

function getPlanPrice(planKey, periodo, desc, oportunidadesQty = '300', elitePackage = 'hasta300') {
  const inventario = getPlanInventory(planKey, oportunidadesQty, elitePackage);

  if (planKey === 'elite') {
    const eliteInfo = precioEliteMensual(state.ciudad, inventario);
    const base = getPrecioElite(state.ciudad, inventario, periodo);

    return {
      ...calculateRegionalTablePrice(base, desc),
      productName: 'Elite',
      coverage: getEliteCoverageLabel(elitePackage, inventario),
      coverageQty: inventario,
      elitePackage,
      eliteExtraBlocks: eliteInfo.extras || 0,
      region: eliteInfo.region,
      automaticDiscount: false
    };
  }

  if (planKey === 'oportunidades') {
    const full = getPrecioOportunidadesFull(inventario, periodo);

    return {
      ...calculatePackageFullWithZone(full, desc),
      productName: 'Oportunidades Ilimitadas',
      coverage: inventario,
      regionalDiscount: regionalDiscountPct(),
      region: state.ciudad,
      automaticDiscount: false
    };
  }

  return null;
}

function getSelectedItems() {
  const items = [];

  if (state.mode === 'plan') {
    addSingleItem(items);
  } else if (state.mode === 'vs') {
    addVsItems(items);
  } else {
    addPackageItems(items);
  }

  return items;
}

function addSingleItem(items) {
  const s = state.single;

  if (s.product === 'plan' && s.plan && s.fecha) {
    items.push({
      kind: 'plan',
      planKey: s.plan,
      period: s.period,
      fecha: s.fecha,
      vigencia: s.vigencia,
      price: getPlanPrice(s.plan, s.period, s.desc, s.oportunidadesQty, s.elitePackage, s.eliteExtraBlocks)
    });
  }

  if (s.product === 'destacados' && s.qty && s.fecha) {
    items.push({
      kind: 'destacados',
      qty: s.qty,
      period: s.period,
      fecha: s.fecha,
      vigencia: s.vigencia,
      price: calculateRegionalTablePrice(getPrecioDestacados(s.qty, s.period), s.desc)
    });
  }

  if (s.product === 'prime' && s.qty && s.fecha) {
    items.push({
      kind: 'prime',
      qty: s.qty,
      period: s.period,
      fecha: s.fecha,
      vigencia: s.vigencia,
      price: calculateRegionalTablePrice(getPrecioPrime(s.qty, s.period), s.desc)
    });
  }
}

function addPackageItems(items) {
  const plan = state.pkg.plan;
  const dest = state.pkg.dest;
  const prime = state.pkg.prime;

  if (plan.enabled && plan.plan && plan.fecha) {
    items.push({
      kind: 'plan',
      planKey: plan.plan,
      period: plan.period,
      fecha: plan.fecha,
      vigencia: plan.vigencia,
      price: getPlanPrice(plan.plan, plan.period, plan.desc, plan.oportunidadesQty, plan.elitePackage, plan.eliteExtraBlocks)
    });
  }

  if (dest.enabled && dest.qty && dest.fecha) {
    items.push({
      kind: 'destacados',
      qty: dest.qty,
      period: dest.period,
      fecha: dest.fecha,
      vigencia: dest.vigencia,
      price: calculateRegionalTablePrice(getPrecioDestacados(dest.qty, dest.period), dest.desc)
    });
  }

  if (prime.enabled && prime.qty && prime.fecha) {
    items.push({
      kind: 'prime',
      qty: prime.qty,
      period: prime.period,
      fecha: prime.fecha,
      vigencia: prime.vigencia,
      price: calculateRegionalTablePrice(getPrecioPrime(prime.qty, prime.period), prime.desc)
    });
  }
}

function totalAmount(items) {
  return items.reduce((acc, item) => acc + item.price.final, 0);
}

// ── Cards ─────────────────────────────────────
function planCardHTML(item) {
  const isElite = item.planKey === 'elite';
  const planName = item.price.productName || (isElite ? 'Elite' : 'Oportunidades Ilimitadas');
  const cardClass = isElite ? 'elite' : 'simples';
  const planDesc = isElite
    ? 'Publicaciones con etiqueta Exclusivo · Primeros resultados de búsqueda'
    : 'Publicaciones con oportunidades ilimitadas';

  const inv = item.price.coverage || '—';

  const featuresElite = `
    <li><span class="feature-icon green">${checkSVG()}</span><span class="feature-text">Etiqueta <strong>"Exclusivo"</strong> en todas tus publicaciones</span></li>
    <li><span class="feature-icon green">${checkSVG()}</span><span class="feature-text">Posicionamiento <strong>prioritario</strong> sobre publicaciones simples</span></li>
    <li><span class="feature-icon green">${checkSVG()}</span><span class="feature-text">Más de <strong>2 millones de personas</strong> podrían ver tus propiedades este mes</span></li>`;

  const featuresSimples = `
    <li><span class="feature-icon green">${checkSVG()}</span><span class="feature-text">Posicionamiento <strong>prioritario</strong> sobre publicaciones simples</span></li>
    <li><span class="feature-icon green">${checkSVG()}</span><span class="feature-text">Más de <strong>2 millones de personas</strong> podrían ver tus propiedades este mes</span></li>`;

  return `
  <div class="plan-card elite-card">
    <div class="plan-card-header ${cardClass}">
      <div class="plan-card-header-left">
        <span class="plan-card-icon">⭐</span>
        <div>
          <div class="plan-card-name">${planName}</div>
          <div class="plan-card-desc">${planDesc}</div>
        </div>
      </div>
      <span class="plan-card-badge badge-recomendado">RECOMENDADO</span>
    </div>
    <div class="plan-card-body">
      ${state.mode === 'paquete' ? '' : priceBlockHTML(item.price, true)}
      <div class="inventory-label">Inventario Cubierto</div>
      <div class="inventory-value">${inv}</div>
      <ul class="features-list">${isElite ? featuresElite : featuresSimples}</ul>
    </div>
  </div>`;
}

function compCardHTML(item) {
  const isDest = item.kind === 'destacados';
  const headerClass = isDest ? 'destacados' : 'prime';
  const name = isDest ? 'Destacados' : 'Avisos Prime';
  const icon = isDest ? '🏆' : '💎';
  const avisosClass = isDest ? '' : 'prime-color';

  const featuresDest = `
    <li><span class="feature-icon gold">${checkSVG()}</span><span class="feature-text">Aparecen <strong>por encima</strong> de las publicaciones Elite</span></li>
    <li><span class="feature-icon gold">${checkSVG()}</span><span class="feature-text">Se muestran en los <strong>primeros</strong> resultados</span></li>
    <li><span class="feature-icon gold">${checkSVG()}</span><span class="feature-text">Etiqueta <strong>"Destacado"</strong> de alta visibilidad</span></li>
    <li><span class="feature-icon gold">${checkSVG()}</span><span class="feature-text"><strong>Asignación automática de anuncio a destacar:</strong> El sistema identifica los mejores anuncios a destacar de acuerdo a tu inventario y al comportamiento del mercado.</span></li>`;

  const featuresPrime = `
    <li><span class="feature-icon blue">${checkSVG()}</span><span class="feature-text">Aparecen <strong>por encima</strong> de los destacados</span></li>
    <li><span class="feature-icon blue">${checkSVG()}</span><span class="feature-text">Se mantienen <strong>fijos</strong> en los resultados de búsqueda</span></li>
    <li><span class="feature-icon blue">${checkSVG()}</span><span class="feature-text">Etiqueta <strong>"Prime"</strong> de alta visibilidad</span></li>`;

  return `
  <div class="plan-card ${isDest ? 'destacados-card' : 'prime-card'}">
    <div class="plan-card-header ${headerClass}">
      <div class="plan-card-header-left">
        <span class="plan-card-icon">${icon}</span>
        <div>
          <div class="plan-card-name">${name}</div>
          <div class="plan-card-desc">Posiciona tus mejores propiedades al tope de los resultados</div>
        </div>
      </div>
      <span class="plan-card-badge ${isDest ? 'badge-complemento-destacados' : 'badge-complemento-prime'}">COMPLEMENTO</span>
    </div>
    <div class="plan-card-body">
      ${state.mode === 'paquete' ? '' : priceBlockHTML(item.price, true)}
      <div class="avisos-label">Avisos ${name}</div>
      <div class="avisos-value ${avisosClass}">${item.qty}</div>
      <ul class="features-list">${isDest ? featuresDest : featuresPrime}</ul>
    </div>
  </div>`;
}

function priceBlockHTML(price, showDiscount = false) {
  const discountLine = showDiscount && price.original && price.pct > 0
    ? `
      <div class="price-discount-line">
        <span class="price-original">${fmt(price.original)}</span>
        <span class="price-discount-pct">| ${price.pct}% de Descuento</span>
      </div>`
    : '';

  return `
    <div class="price-block">
      ${discountLine}
      <div class="price-row">
        <span class="price-main">${fmt(price.final)}</span>
        <span class="price-iva">+IVA</span>
      </div>
    </div>`;
}

function checkSVG() {
  return `<svg viewBox="0 0 10 10" fill="white"><path d="M2 5l2.5 2.5L8 3" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// ── Document sections ─────────────────────────
function totalBoxHTML(items) {
  const desc = items.map(item => {
    if (item.kind === 'plan') {
      const name = item.planKey === 'elite' ? 'Elite' : 'Oportunidades Ilimitadas';
      return `${name} ${periodLabel(item.period).toLowerCase()}`;
    }

    if (item.kind === 'destacados') {
      return `${item.qty} avisos Destacados ${periodLabel(item.period).toLowerCase()}`;
    }

    return `${item.qty} avisos Prime ${periodLabel(item.period).toLowerCase()}`;
  });

  const title = state.mode === 'paquete'
    ? 'INVERSIÓN TOTAL DEL PAQUETE'
    : `INVERSIÓN TOTAL ${periodLabel(items[0].period).toUpperCase()}`;

  const finalTotal = totalAmount(items);
  const fullTotal = items.reduce((acc, item) => acc + (item.price.original || item.price.final), 0);
  const hasPackageDiscount = state.mode === 'paquete' && fullTotal > finalTotal;

  const totalHTML = state.mode === 'paquete'
    ? `
      ${hasPackageDiscount ? `<div class="total-original">${fmt(fullTotal)}</div>` : ''}
      <div class="total-preferential-label">Precio preferencial</div>
      <div class="total-amount total-amount-preferential">${fmt(finalTotal)}</div>
      <div class="total-iva">+IVA</div>`
    : `
      <div class="total-amount">${fmt(finalTotal)}</div>
      <div class="total-iva">+IVA</div>`;

  return `
  <div class="total-box">
    <div class="total-box-left">
      <div class="total-period">${title}</div>
      <div class="total-desc">${desc.join(' + ')}</div>
    </div>
    <div class="total-box-right">
      ${totalHTML}
    </div>
  </div>`;
}



function getAsesorDisplayName() {
  const catalog = asesoresCatalog();
  const asesor = catalog[state.asesor] || catalog.cc;
  return asesor.nombre || 'Contact Center';
}

function proposalInfoHTML() {
  const vigencia = state.propuestaVigencia ? fmtDate(state.propuestaVigencia) : '—';

  return `
  <div class="proposal-info-box">
    <div class="proposal-info-item"><strong>Ejecutivo comercial:</strong> ${getAsesorDisplayName()}</div>
    <div class="proposal-info-item"><strong>Vigencia de propuesta:</strong> ${vigencia}</div>
  </div>`;
}

function legalNoteHTML() {
  return `
  <div class="proposal-legal-note">
    Cotización válida hasta la fecha de vigencia indicada. Los precios mostrados corresponden a las condiciones comerciales vigentes al momento de su emisión.
  </div>`;
}

// ── ÚNICA FUNCIÓN MODIFICADA ───────────────────
function bankDetailsHTML() {
  return `
  <div class="bank-details-card">
    <div class="bank-details-header">
      <span class="bank-details-header-icon">🏦</span>
      <span class="bank-details-title">Datos para transferencia</span>
    </div>
    <div class="bank-details-body">
      <div class="bank-details-field">
        <span class="bank-details-field-label">Banco</span>
        <span class="bank-details-field-value">BBVA BANCOMER</span>
      </div>
      <div class="bank-details-field">
        <span class="bank-details-field-label">Cuenta</span>
        <span class="bank-details-field-value mono">0118381968</span>
      </div>
      <div class="bank-details-field">
        <span class="bank-details-field-label">CLABE Interbancaria</span>
        <span class="bank-details-field-value mono">012180001183819685</span>
      </div>
      <div class="bank-details-field">
        <span class="bank-details-field-label">Razón Social</span>
        <span class="bank-details-field-value">CORPORATIVO MCNEMEXICO S DE RL DE CV</span>
      </div>
      <div class="bank-details-field last">
        <span class="bank-details-field-label">RFC</span>
        <span class="bank-details-field-value mono">CMC210701L19</span>
      </div>
    </div>
  </div>`;
}

function vigenciaBoxHTML(items) {
  if (items.length === 1) {
    return `
    <div class="vigencia-box">
      <span class="vigencia-icon">📅</span>
      <span class="vigencia-text"><span>Vigencia del producto</span>: ${fmtDate(items[0].vigencia)}</span>
    </div>`;
  }

  const lines = items.map(item => {
    const label = item.kind === 'plan'
      ? mainProductLabel(item.planKey)
      : item.kind === 'destacados'
        ? 'Destacado'
        : 'Prime';

    return `${label}: ${fmtDate(item.fecha)} - ${fmtDate(item.vigencia)}`;
  });

  return `
  <div class="vigencia-box">
    <span class="vigencia-icon">📅</span>
    <span class="vigencia-text"><span>Vigencias</span>: ${lines.join(' · ')}</span>
  </div>`;
}

function disclaimerHTML() {
  return '';
}

function logoHTML() {
  return `<img src="logo_pcom.png" style="height:36px;" alt="Propiedades.com">`;
}


// ── WhatsApp ──────────────────────────────────
function getAsesorSeleccionado() {
  const catalog = asesoresCatalog();
  const asesor = catalog[state.asesor] || catalog.cc;
  return asesor.telefono ? asesor : catalog.cc;
}

function whatsappLink() {
  const asesor = getAsesorSeleccionado();
  const rawTelefono = String(asesor.telefono || '').replace(/\D/g, '');
  const telefono = rawTelefono.startsWith('52') ? rawTelefono : `52${rawTelefono}`;
  const cliente = state.cliente ? ` para ${state.cliente}` : '';
  const mensaje = `Hola, me interesa esta propuesta comercial de Propiedades.com${cliente}. ¿Me pueden apoyar con más información?`;

  return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
}

// ── Render ────────────────────────────────────
function render() {
  const doc = getEl('proposal-doc');
  const items = getSelectedItems();

  const cliente = state.cliente || 'Cliente';
  const inventario = state.inventario || '—';
  const ciudadDisp = state.ciudadDisplay || ciudadLabel(state.ciudad);
  const title = proposalTitle();
  const firstDate = items[0]?.fecha || state.single.fecha;

  let mainSection = '';

  if (state.mode === 'vs') {
    const cardHTML = item => vsCardHTML(item);
    if (items.length === 2) {
      mainSection = `
        <div class="vs-grid">
          <div class="vs-col">${cardHTML(items[0])}</div>
          <div class="vs-divider"><div class="vs-badge-circle">VS</div></div>
          <div class="vs-col">${cardHTML(items[1])}</div>
        </div>
        ${proposalInfoHTML()}`;
    } else if (items.length === 1) {
      mainSection = `
        <div class="vs-grid">
          <div class="vs-col">${cardHTML(items[0])}</div>
          <div class="vs-divider"><div class="vs-badge-circle">VS</div></div>
          <div class="vs-col vs-col-empty"><div class="vs-empty-card">Configura el Producto 2</div></div>
        </div>
        ${proposalInfoHTML()}`;
    } else {
      mainSection = `<div style="padding:40px;text-align:center;color:#9ca3af;font-size:14px;">Configura los dos productos para ver la comparación.</div>`;
    }
  } else if (items.length > 0) {
    const gridClass = items.length === 3 ? 'three-cards' : items.length > 1 ? 'two-cards' : 'one-card';

    mainSection = `
      <div class="cards-grid ${gridClass}">
        ${items.map(item => item.kind === 'plan' ? planCardHTML(item) : compCardHTML(item)).join('')}
      </div>
      ${totalBoxHTML(items)}
      ${proposalInfoHTML()}`;
  } else {
    mainSection = `<div style="padding:40px;text-align:center;color:#9ca3af;font-size:14px;">Completa la configuración para ver la propuesta.</div>`;
  }

  doc.innerHTML = `
    <div class="doc-header">
      ${logoHTML()}
    </div>

    <div class="doc-meta">
      <div class="doc-meta-item">
        <div class="label">Cliente</div>
        <div class="value">${cliente}</div>
      </div>
      <div class="doc-meta-item">
        <div class="label">Inventario</div>
        <div class="value">${inventario} propiedades · ${ciudadDisp}</div>
      </div>
      <div class="doc-meta-item">
        <div class="label">Fecha de inicio</div>
        <div class="value">${firstDate ? fmtDate(firstDate) : '—'}</div>
      </div>
    </div>

    <div class="client-legend">
      <strong>${cliente}</strong>, tus propiedades merecen estar donde los compradores ya están buscando.
    </div>

    <div class="doc-plan-label">Propuesta Comercial</div>
    <div class="doc-plan-title">${title}</div>

    ${mainSection}

    <div class="payment-section">
      <div class="payment-title">Formas de Pago</div>
      <div class="payment-subtitle">Opciones de pago disponibles</div>
      <div class="payment-options">
        <div class="payment-option">
          <div class="payment-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
          </div>
          <div>
            <div class="payment-option-name">Meses sin intereses (MSI) vía PayPal</div>
            <div class="payment-option-desc">Disponible con cualquier tarjeta de crédito. El cobro total se aplica en tu tarjeta.</div>
          </div>
        </div>

        <div class="payment-option">
          <div class="payment-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <div>
            <div class="payment-option-name">Transferencia bancaria</div>
            <div class="payment-option-desc">Pago único directo. Puedes usar los datos bancarios de esta propuesta.</div>
          </div>
        </div>
      </div>

      ${bankDetailsHTML()}
      ${disclaimerHTML()}
    </div>

    <div class="doc-footer">
      <div>
        <div class="footer-site">propiedades.com</div>
        <div class="footer-desc">El portal inmobiliario con mayor tráfico orgánico de México.</div>
      </div>
      <a class="footer-cta" href="${whatsappLink()}" target="_blank" rel="noopener">Contactar con mi asesor</a>
    </div>

    ${legalNoteHTML()}
  `;

  updateExportButton();
}

function mainProductLabel(planKey) {
  if (planKey === 'elite') return 'Elite';
  if (planKey === 'oportunidades') return 'Oportunidades Ilimitadas';
  return 'Producto principal';
}

function proposalTitle() {
  if (state.mode === 'vs') return 'Comparación de productos';

  if (state.mode === 'plan') {
    if (state.single.product === 'plan') return mainProductLabel(state.single.plan);
    if (state.single.product === 'destacados') return 'Destacado';
    if (state.single.product === 'prime') return 'Prime';
  }

  const parts = [];
  if (state.pkg.plan.enabled) parts.push(mainProductLabel(state.pkg.plan.plan));
  if (state.pkg.dest.enabled) parts.push('Destacado');
  if (state.pkg.prime.enabled) parts.push('Prime');

  return parts.length ? `Paquete ${parts.join(' + ')}` : 'Paquete';
}

function vsDestacadosCardHTML(item) {
  const price = item.price;
  const hasDiscount = price.pct > 0 && price.original;

  const subtotalRow = hasDiscount ? `
    <div class="vs-price-row">
      <span class="vs-price-lbl">Subtotal</span>
      <span class="vs-subtotal-val">${fmt(price.original)}</span>
    </div>` : '';

  return `
  <div class="plan-card destacados-card">
    <div class="plan-card-header destacados">
      <div class="plan-card-header-left">
        <span class="plan-card-icon">🏆</span>
        <div>
          <div class="plan-card-name">Destacados</div>
          <div class="plan-card-desc">Posiciona tus mejores propiedades al tope de los resultados</div>
        </div>
      </div>
      <span class="plan-card-badge badge-complemento-destacados">COMPLEMENTO</span>
    </div>
    <div class="plan-card-body">
      ${priceBlockHTML(price, true)}
      <div class="avisos-label">Avisos Destacados</div>
      <div class="avisos-value">${item.qty}</div>
      <ul class="features-list">
        <li><span class="feature-icon gold">${checkSVG()}</span><span class="feature-text">Se muestran en los <strong>primeros</strong> resultados</span></li>
        <li><span class="feature-icon gold">${checkSVG()}</span><span class="feature-text">Etiqueta <strong>"Destacado"</strong> de alta visibilidad</span></li>
        <li><span class="feature-icon gold">${checkSVG()}</span><span class="feature-text"><strong>Asignación automática de anuncio a destacar:</strong> El sistema identifica los mejores anuncios a destacar de acuerdo a tu inventario y al comportamiento del mercado.</span></li>
      </ul>
      <div class="vs-details" style="margin-top:14px;border-top:1px solid var(--border);padding-top:4px;">
        <div class="vs-detail-row">
          <span class="vs-detail-label">Periodo</span>
          <span class="vs-detail-value">${periodLabel(item.period)}</span>
        </div>
        <div class="vs-detail-row" style="border-bottom:none;">
          <span class="vs-detail-label">Cantidad de avisos</span>
          <span class="vs-detail-value">${item.qty}</span>
        </div>
      </div>
      <div class="vs-price-block">
        ${subtotalRow}
        <div class="vs-price-row">
          <span class="vs-price-lbl">Total</span>
          <span class="vs-total-val">${fmt(price.final)} <span class="price-iva">+IVA</span></span>
        </div>
      </div>
    </div>
  </div>`;
}

// ── VS card ───────────────────────────────────
function vsCardHTML(item) {
  const isElite = item.kind === 'plan' && item.planKey === 'elite';
  const isDest  = item.kind === 'destacados';
  const isPrime = item.kind === 'prime';

  if (isDest) return vsDestacadosCardHTML(item);

  const name = item.price?.productName
    || (isElite ? 'Elite' : item.kind === 'plan' ? 'Oportunidades Ilimitadas' : isDest ? 'Destacados' : 'Prime');

  const icon        = isElite ? '⭐' : item.kind === 'plan' ? '⭐' : isDest ? '🏆' : '💎';
  const headerClass = isElite ? 'elite' : item.kind === 'plan' ? 'simples' : isDest ? 'destacados' : 'prime';

  const desc = isElite
    ? 'Publicaciones con etiqueta Exclusivo · Primeros resultados'
    : item.kind === 'plan'
      ? 'Publicaciones con oportunidades ilimitadas'
      : isDest
        ? 'Asignación automática de anuncio a destacar: El sistema identifica los mejores anuncios a destacar de acuerdo a tu inventario y al comportamiento del mercado.'
        : 'Posicionamiento premium · Fijos en resultados';

  const price      = item.price;
  const hasDiscount = price.pct > 0 && price.original;

  const rows = [];

  rows.push(`<div class="vs-detail-row">
    <span class="vs-detail-label">Periodo</span>
    <span class="vs-detail-value">${periodLabel(item.period)}</span>
  </div>`);

  if (item.kind === 'plan') {
    rows.push(`<div class="vs-detail-row">
      <span class="vs-detail-label">Inventario cubierto</span>
      <span class="vs-detail-value">${price.coverage || '—'}</span>
    </div>`);
  } else {
    rows.push(`<div class="vs-detail-row">
      <span class="vs-detail-label">Cantidad de avisos</span>
      <span class="vs-detail-value">${item.qty}</span>
    </div>`);
  }

  rows.push(`<div class="vs-detail-row">
    <span class="vs-detail-label">Vigencia</span>
    <span class="vs-detail-value">${isDest ? periodLabel(item.period) : fmtDate(item.fecha) + ' — ' + fmtDate(item.vigencia)}</span>
  </div>`);

  if (hasDiscount) {
    rows.push(`<div class="vs-detail-row">
      <span class="vs-detail-label">Descuento adicional</span>
      <span class="vs-detail-value vs-detail-discount">${price.pct}%</span>
    </div>`);
  }

  const subtotalRow = hasDiscount ? `
    <div class="vs-price-row">
      <span class="vs-price-lbl">Subtotal</span>
      <span class="vs-subtotal-val">${fmt(price.original)}</span>
    </div>` : '';

  return `
  <div class="plan-card">
    <div class="plan-card-header ${headerClass}">
      <div class="plan-card-header-left">
        <span class="plan-card-icon">${icon}</span>
        <div>
          <div class="plan-card-name">${name}</div>
          <div class="plan-card-desc">${desc}</div>
        </div>
      </div>
    </div>
    <div class="plan-card-body">
      <div class="vs-details">${rows.join('')}</div>
      <div class="vs-price-block">
        ${subtotalRow}
        <div class="vs-price-row">
          <span class="vs-price-lbl">Total</span>
          <span class="vs-total-val">${fmt(price.final)} <span class="price-iva">+IVA</span></span>
        </div>
      </div>
    </div>
  </div>`;
}

// ── VS helpers ────────────────────────────────
function syncVsSlot(slot) {
  const s = state.vs[slot];
  const isPlan = s.product === 'plan';
  const isDest = s.product === 'destacados';

  toggleEl(`field-vs-${slot}-plan`, isPlan);
  toggleEl(`field-vs-${slot}-elite-package`, isPlan && s.plan === 'elite');
  toggleEl(`field-vs-${slot}-oportunidades-qty`, isPlan && s.plan === 'oportunidades');
  toggleEl(`field-vs-${slot}-qty`, !isPlan);

  const qtyLabel = getEl(`vs-${slot}-qty-label`);
  if (qtyLabel) qtyLabel.textContent = isDest ? 'Cantidad de avisos Destacados' : 'Cantidad de avisos Prime';

  const descHelp = getEl(`help-vs-${slot}-desc`);
  if (descHelp) descHelp.textContent = discountCapText();
}

function updateVsVigencia(slot) {
  state.vs[slot].vigencia = addMonths(state.vs[slot].fecha, monthsByPeriod(state.vs[slot].period));
  setValue(`inp-vs-${slot}-vigencia`, state.vs[slot].vigencia);
}

function addVsItems(items) {
  ['p1', 'p2'].forEach(slot => {
    const s = state.vs[slot];

    if (s.product === 'plan' && s.plan && s.fecha) {
      items.push({
        kind: 'plan',
        planKey: s.plan,
        period: s.period,
        fecha: s.fecha,
        vigencia: s.vigencia,
        price: getPlanPrice(s.plan, s.period, s.desc, s.oportunidadesQty, s.elitePackage),
        vsSlot: slot
      });
    }

    if (s.product === 'destacados' && s.qty && s.fecha) {
      items.push({
        kind: 'destacados',
        qty: s.qty,
        period: s.period,
        fecha: s.fecha,
        vigencia: s.vigencia,
        price: calculateRegionalTablePrice(getPrecioDestacados(s.qty, s.period), s.desc),
        vsSlot: slot
      });
    }

    if (s.product === 'prime' && s.qty && s.fecha) {
      items.push({
        kind: 'prime',
        qty: s.qty,
        period: s.period,
        fecha: s.fecha,
        vigencia: s.vigencia,
        price: calculateRegionalTablePrice(getPrecioPrime(s.qty, s.period), s.desc),
        vsSlot: slot
      });
    }
  });
}

// ── PDF ───────────────────────────────────────
function exportPDF() {
  if (state.mode === 'paquete' && countEnabledPackageProducts() < 2) return;

  const element = getEl('proposal-doc');
  const cliente = (state.cliente || 'propuesta').replace(/\s+/g, '_').toLowerCase();
  const filename = `propuesta_${cliente}.pdf`;

  const prevTransform = element.style.transform;
  const prevMarginLeft = element.style.marginLeft;
  const prevMarginBottom = element.style.marginBottom;
  const prevWidth = element.style.width;

  element.style.transform = 'none';
  element.style.marginLeft = '0';
  element.style.marginBottom = '0';
  element.style.width = '794px';

  setTimeout(() => {
    const height = element.scrollHeight;
    const opt = {
      margin: 0,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
        windowHeight: height,
        width: 794,
        height,
        x: 0,
        y: 0,
        backgroundColor: '#ffffff',
        ignoreElements: el => el.classList.contains('sidebar') || el.classList.contains('preview-label')
      },
      jsPDF: {
        unit: 'px',
        format: [794, height],
        orientation: 'portrait'
      }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      element.style.transform = prevTransform;
      element.style.marginLeft = prevMarginLeft;
      element.style.marginBottom = prevMarginBottom;
      element.style.width = prevWidth;
    });

    
  }, 200);
}
