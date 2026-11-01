/* ============================================================
   cotizador.js — COTIZADOR COMPARTIDO (sin UI, sin DOM, sin React).
   Une los CSV oficiales de precios (data/precios/), el motor de precios y
   el motor de promociones para cotizar UN producto. Lo usan la calculadora
   (Calculadora.dc.html) y Autogestión › Capturar: un solo lugar para
   cambiar cómo se calcula.
   Requiere cargados antes: utils.js, config.js, pricing-data.js,
   promotions.js, pricing-engine.js, promotion-engine.js.
   ============================================================ */
window.PC = window.PC || {};
window.PC.Cotizador = (function () {
  "use strict";

  // ---------------- CSV de precios ----------------
  // Autodetecta el separador de la primera línea: coma, punto y coma o tab.
  function csvDelimiter(line) {
    const c = (line.match(/,/g) || []).length;
    const s = (line.match(/;/g) || []).length;
    const t = (line.match(/\t/g) || []).length;
    if (t > 0 && t >= c && t >= s) return "\t";
    if (s > c) return ";";
    return ",";
  }

  function csvSplitLine(line, delim) {
    const D = delim || ",";
    const out = []; let cur = "", q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else { if (c === '"') q = true; else if (c === D) { out.push(cur); cur = ""; } else cur += c; }
    }
    out.push(cur); return out.map(s => s.trim());
  }

  // -> { header, rows, errors }
  function parseCSV(text) {
    const VIG = ["mensual", "trimestral", "semestral", "anual"];
    const ALL = ["Producto", "Oferta", "Zona", "Estados", "Vigencia", "PrecioBase", "Descuento", "PrecioFinal"];
    const REQ = ["Producto", "Oferta", "Vigencia", "PrecioFinal"];
    const errors = [], rows = [];
    const clean = String(text || "").replace(/^﻿/, "").replace(/\r\n?/g, "\n");
    const lines = clean.split("\n").filter(l => l.trim() !== "");
    if (!lines.length) return { header: [], rows: [], errors: [{ row: 0, msg: "El CSV está vacío." }] };
    const delim = csvDelimiter(lines[0]);
    const header = csvSplitLine(lines[0], delim);
    const norm = header.map(x => x.toLowerCase());
    const idx = {}; ALL.forEach(c => idx[c] = norm.indexOf(c.toLowerCase()));
    REQ.forEach(c => { if (idx[c] < 0) errors.push({ row: 0, msg: "Falta la columna obligatoria: " + c }); });
    lines.slice(1).forEach((ln, i) => {
      const rowNum = i + 2;
      const cells = csvSplitLine(ln, delim);
      const get = (c) => idx[c] >= 0 ? (cells[idx[c]] || "").trim() : "";
      const producto = get("Producto"), oferta = get("Oferta"), vig = get("Vigencia");
      const pf = get("PrecioFinal"), pb = get("PrecioBase"), desc = get("Descuento");
      if (idx["Producto"] >= 0 && !producto) errors.push({ row: rowNum, msg: "Producto vacío" });
      if (idx["Oferta"] >= 0 && !oferta) errors.push({ row: rowNum, msg: "Oferta vacía" });
      if (idx["Vigencia"] >= 0) { if (!vig) errors.push({ row: rowNum, msg: "Vigencia vacía" }); else if (VIG.indexOf(vig.toLowerCase()) < 0) errors.push({ row: rowNum, msg: "Vigencia inválida (\"" + vig + "\"): use Mensual, Trimestral, Semestral o Anual" }); }
      if (pf !== "" && isNaN(Number(pf))) errors.push({ row: rowNum, msg: "PrecioFinal no numérico (\"" + pf + "\")" });
      if (pb !== "" && isNaN(Number(pb))) errors.push({ row: rowNum, msg: "PrecioBase no numérico (\"" + pb + "\")" });
      if (desc !== "" && isNaN(Number(String(desc).replace("%", "").trim()))) errors.push({ row: rowNum, msg: "Descuento no numérico (\"" + desc + "\")" });
      rows.push({ row: rowNum, producto, oferta, zona: get("Zona"), estados: get("Estados"), vigencia: vig, precioBase: pb, descuento: desc, precioFinal: pf });
    });
    // Duplicados por Producto + Oferta + Zona + Vigencia (Zona vacía = precio general).
    const seen = {};
    rows.forEach(r => {
      const k = [r.producto, r.oferta, r.zona || "(general)", r.vigencia].join("¦").toLowerCase();
      if (seen[k]) errors.push({ row: r.row, msg: "Duplicado: " + r.producto + " / " + r.oferta + " / " + (r.zona || "cualquiera") + " / " + r.vigencia });
      seen[k] = true;
    });
    return { header, rows, errors };
  }

  function csvRowFinal(r) {
    if (r.precioFinal !== "" && r.precioFinal != null) return Number(r.precioFinal);
    const b = Number(r.precioBase) || 0, d = Number(String(r.descuento).replace("%", "").trim()) || 0;
    return Math.round(b * (1 - d / 100));
  }

  // Descarga data/precios/index.json y sus CSV desde baseUrl ("" = mismo sitio)
  // y devuelve las filas válidas de todos. Si algo falla, devuelve [].
  async function cargarCatalogo(baseUrl) {
    const base = baseUrl ? String(baseUrl).replace(/\/+$/, "") + "/" : "";
    try {
      const r = await fetch(base + "data/precios/index.json");
      const idx = r.ok ? await r.json() : null;
      if (!idx || !Array.isArray(idx.files)) return [];
      const textos = await Promise.all(idx.files.map(f =>
        fetch(base + f.file).then(x => x.ok ? x.text() : "").catch(() => "")));
      return [].concat.apply([], textos.map(t => { const res = parseCSV(t); return res.errors.length ? [] : res.rows; }));
    } catch (e) {
      return [];
    }
  }

  // ---------------- Configuración de producto ----------------
  // Opciones de cobertura por defecto (Elite / Oportunidades / Destacados / Prime).
  function defaultCoverage(id) {
    const D = window.PC.pricingData;
    if (id === "elite") return [
      { label: "Hasta 300 propiedades", value: "hasta300" },
      { label: "301 a 500 propiedades", value: "301a500" },
      { label: "Personalizado", value: "personalizado" }
    ];
    if (id === "oportunidades") return D.oportunidades.packages.map(n => ({ label: "Paquete " + n, value: String(n) })).concat([{ label: "Personalizado", value: "personalizado" }]);
    if (id === "destacados" || id === "prime") return D[id].packages.map(n => ({ label: D[id].ranges[n], value: String(n) })).concat([{ label: "Personalizado", value: "personalizado" }]);
    return [];
  }

  // Configuración efectiva de un producto (default + overrides de config.js).
  function productConfig(id) {
    const C = window.PC.config;
    const meta = C.productMeta[id];
    const ov = ((C.productOverrides || {})[id]) || {};
    const states = Array.isArray(ov.states) ? ov.states : (ov.restrictState ? [ov.restrictState] : []);
    return {
      id: id, custom: !meta,
      name: ov.name != null && ov.name !== "" ? ov.name : (meta ? meta.name : "Producto"),
      theme: ov.theme || (meta ? meta.theme : "green"),
      maxDiscount: ov.maxDiscount != null && ov.maxDiscount !== "" ? Number(ov.maxDiscount) : 100,
      basePrice: ov.basePrice != null && ov.basePrice !== "" ? Number(ov.basePrice) : null,
      states: states,
      coverage: Array.isArray(ov.coverage) ? ov.coverage : defaultCoverage(id),
      disabled: !!ov.disabled
    };
  }

  // Productos que se pueden cotizar (los activos de config.js).
  function productosDisponibles() {
    const C = window.PC.config;
    return Object.keys(C.productMeta).map(productConfig).filter(pc => !pc.disabled);
  }

  // Periodos: [{ value, label, months }]
  function periodos() {
    const P = window.PC.pricingData.PERIODS;
    return Object.keys(P).map(k => ({ value: k, label: P[k].label, months: P[k].months }));
  }

  // Estado -> zona de precios (CDMX_EDOMEX, JALISCO_NL o RESTO).
  function zonaDeEstado(estado) {
    return window.PC.config.suggestZone(estado);
  }

  // Devuelve { final, base, discountPct } del renglón del CSV (o null). base y
  // discountPct reflejan el descuento de ZONA capturado en el CSV.
  function csvPeriodInfo(rowsSrc, pc, productId, offerLabel, period, zoneId, stateName) {
    if (!rowsSrc || !rowsSrc.length) return null;
    const pname = (pc.name || "").toLowerCase();
    const ol = String(offerLabel || "").toLowerCase().trim();
    const per = String(period || "").toLowerCase();
    const zones = (window.PC.config.zones || []);
    const zoneObj = zones.find(z => z.id === zoneId) || {};
    const zlabel = (zoneObj.label || "").toLowerCase();
    // Normaliza nombres de zona: sin acentos, & / , y -> espacio, colapsa espacios.
    const nz = window.PC.pricingData.normalizeZone;
    const zoneTargets = [nz(zoneId), nz(zlabel)].filter(Boolean);
    const baseMatch = (r) => {
      const rp = (r.producto || "").toLowerCase().trim();
      if (rp && rp !== pname && rp !== String(productId).toLowerCase()) return false;
      const ro = (r.oferta || "").toLowerCase().trim();
      if (ro && ol && ro !== ol) return false;
      return true;
    };
    const zoneMatch = (r) => {
      const rz = (r.zona || "").trim(), re = (r.estados || "").trim();
      if (!rz && !re) return { ok: true, specific: false };
      let ok = false;
      if (rz) { const rzn = nz(rz); if (zoneTargets.indexOf(rzn) >= 0) ok = true; }
      if (re) { const list = re.split(/[;,]/).map(x => x.trim().toLowerCase()); if (list.indexOf(String(stateName || "").toLowerCase()) >= 0) ok = true; }
      return { ok: ok, specific: true };
    };
    // Descuento de zona a partir del renglón: base y % (si vienen capturados).
    const rowDisc = (r) => {
      const d = Number(String(r.descuento).replace("%", "").trim()) || 0;
      const b = (r.precioBase !== "" && r.precioBase != null) ? Number(r.precioBase) : null;
      const f = csvRowFinal(r);
      let base = b, pct = d;
      if (base == null && d > 0 && f > 0) base = Math.round(f / (1 - d / 100));
      if (pct === 0 && base != null && base > f) pct = Math.round((base - f) / base * 100);
      return { base: base, pct: pct };
    };
    const cands = rowsSrc.map(r => ({ r: r, z: zoneMatch(r) })).filter(x => baseMatch(x.r) && x.z.ok);
    if (!cands.length) return null;
    const pick = (arr) => arr.slice().sort((a, b) => (b.z.specific ? 1 : 0) - (a.z.specific ? 1 : 0))[0];
    const exact = cands.filter(x => (x.r.vigencia || "").toLowerCase() === per);
    if (exact.length) { const r = pick(exact).r, d = rowDisc(r); return { final: csvRowFinal(r), base: d.base, discountPct: d.pct }; }
    const monthly = cands.filter(x => (x.r.vigencia || "").toLowerCase() === "mensual");
    if (monthly.length) { const mult = (window.PC.pricingData.PERIODS[per] || {}).months || 1; const r = pick(monthly).r, d = rowDisc(r); return { final: csvRowFinal(r) * mult, base: d.base != null ? d.base * mult : null, discountPct: d.pct }; }
    return null;
  }

  // ---------------- Cotización de un producto ----------------
  // p: producto tal como lo captura la UI { productId, period, eliteOption,
  //    oppOption, pkgOption, quantity, inventory, customPackages,
  //    monthlyPromoOn, promoOn, manualDiscountPct, ... }
  // ctx: { pc (productConfig), rows (filas del CSV), zone, stateName, mode,
  //        products (ids de todo el paquete), date }
  // -> { cfg, result, promoEval, csvInfo }
  function calcularProducto(p, ctx) {
    const PE = window.PC.PricingEngine, PR = window.PC.PromotionEngine;
    const pc = ctx.pc || productConfig(p.productId);
    const date = ctx.date || window.PC.utils.todayLocal();
    const mode = ctx.mode || "individual";
    const productIds = ctx.products || [p.productId];
    // Personalizado: combinación manual de paquetes. Siempre usa el precio
    // de lista nacional (ver pricing-engine.js), nunca el CSV por zona.
    const isAvisos = p.productId === "destacados" || p.productId === "prime";
    const isPersonalizado = (p.productId === "elite" && p.eliteOption === "personalizado")
      || (p.productId === "oportunidades" && p.oppOption === "personalizado")
      || (isAvisos && p.pkgOption === "personalizado");
    // Etiqueta de "Oferta" para buscar en el CSV (según selección del producto).
    let offerLabel = "";
    if (p.productId === "elite") { const o = pc.coverage.find(c => c.value === p.eliteOption); offerLabel = o ? o.label : ""; }
    else if (p.productId === "oportunidades") { const o = pc.coverage.find(c => c.value === p.oppOption); offerLabel = o ? o.label : ""; }
    else if (isAvisos) { offerLabel = "Paquete " + (p.pkgOption || "1"); }
    else { offerLabel = String(p.quantity || "").trim(); }

    // Fuente principal: precio del CSV (total del periodo). Si no hay, fallback a la lógica actual.
    const csvInfo = isPersonalizado ? null : csvPeriodInfo(ctx.rows, pc, p.productId, offerLabel, p.period, ctx.zone, ctx.stateName);
    const csvTotal = csvInfo ? csvInfo.final : null;
    let baseOverride = isPersonalizado ? null : pc.basePrice;
    if (csvTotal != null && csvTotal > 0) {
      const mm = PE.months(p.period) || 1;
      // Precio del periodo con descuento de zona: aplica el % del catálogo sobre
      // el precio de lista y deja que se redondee UNA sola vez (al total del
      // periodo, en computePrice). Evita el desfase de redondear el mensual antes
      // de multiplicarlo por los meses (ej. Anual: 7999×12×30% = 28,796, no 28,800).
      // El Mensual no cambia: 7999×30% = 2399.7 → 2400 al redondear.
      let periodFinal = csvTotal;
      if (csvInfo.base != null && csvInfo.discountPct > 0 && csvInfo.base > csvTotal)
        periodFinal = csvInfo.base * (1 - csvInfo.discountPct / 100);
      if (p.productId === "elite" || p.productId === "oportunidades" || isAvisos) baseOverride = periodFinal / mm;
      else { const qq = Math.max(1, Number(p.quantity) || 1); baseOverride = periodFinal / (qq * mm); }
    } else if (!isPersonalizado && (p.productId === "elite" || p.productId === "oportunidades")) {
      const sel = p.productId === "elite" ? p.eliteOption : p.oppOption;
      const o = pc.coverage.find(c => c.value === sel);
      if (o && o.price != null && o.price !== "") baseOverride = Number(o.price);
    }
    const monthlyPct = (p.monthlyPromoOn && p.period === "anual") ? window.PC.config.monthlyPromo.pct : 0;
    const cfg = {
      productId: p.productId, mode: mode, zone: ctx.zone || "CDMX_EDOMEX",
      period: p.period, eliteOption: p.eliteOption, oppOption: p.oppOption,
      inventory: p.inventory, quantity: p.quantity, pkgOption: p.pkgOption,
      customPackages: p.customPackages || [],
      // El % de la Promo del mes solo aplica en periodo anual.
      // Descuento adicional del motor = Promo del mes (solo anual) combinada con el
      // % personalizado de "Promoción" (si está prendida).
      manualDiscountPct: (() => {
        const c = p.promoOn ? Math.max(0, Math.min(100, Number(p.manualDiscountPct) || 0)) : 0;
        return Math.round((1 - (1 - monthlyPct / 100) * (1 - c / 100)) * 10000) / 100;
      })(),
      monthlyPct: monthlyPct,
      customPct: p.promoOn ? (Number(p.manualDiscountPct) || 0) : 0,
      showDiscountPct: p.showDiscountPct, showZoneDiscount: p.showZoneDiscount,
      promoOn: p.promoOn, promoQty: p.promoQty, promoProduct: p.promoProduct, promoPeriod: p.promoPeriod,
      basePriceOverride: baseOverride, maxDiscount: pc.maxDiscount
    };
    const promoEval = PR.evaluateForProduct({
      mode: mode, productId: p.productId, products: productIds,
      zone: cfg.zone, period: p.period, inventory: p.inventory, quantity: p.quantity, date: date
    });
    // El botón "Promo" es SOLO para capturar una cortesía/bonificación manual
    // (cantidad + producto, ver promoBox). NUNCA debe disparar un
    // efecto de precio de promotions.js (descuento %, monto fijo o precio
    // especial): esos tipos jamás se pasan al motor de precios desde aquí,
    // sin importar si "Promo" está activo. Solo efectos que no tocan el
    // precio (cortesía de meses) pueden aplicarse, y solo con "Promo" activo.
    const PRICE_EFFECTS = ["discount_pct", "discount_fixed", "fixed_price", "replace_price"];
    const isPriceEffect = !!(promoEval.applied && PRICE_EFFECTS.indexOf(promoEval.applied.effect.type) >= 0);
    const result = PE.computePrice(cfg, (p.promoOn && !isPriceEffect) ? promoEval.applied : null);
    result.productName = pc.name; // nombre configurable (admin)
    result.theme = pc.theme;      // tema configurable (admin)
    // Descuento de ZONA proveniente del CSV (precio de lista vs precio final).
    if (csvInfo && csvInfo.base != null && csvInfo.discountPct > 0 && csvInfo.base > result.finalPrice) {
      result.zoneListPrice = Math.round(csvInfo.base);
      result.zoneDiscountPct = csvInfo.discountPct;
    }
    return { cfg, result, promoEval, csvInfo };
  }

  return {
    parseCSV, csvRowFinal, cargarCatalogo, defaultCoverage, productConfig,
    productosDisponibles, periodos, zonaDeEstado, csvPeriodInfo, calcularProducto
  };
})();
