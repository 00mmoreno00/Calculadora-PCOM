/* ============================================================
   validators.js — Validaciones y "gating" de exportación.
   Separado de la UI: recibe estado/config y devuelve qué falta.
   ============================================================ */
window.PC = window.PC || {};
window.PC.Validators = (function () {
  "use strict";

  const D = window.PC.pricingData;
  const CFG = window.PC.config;

  // Valida un producto individual. Devuelve completitud + faltantes.
  function validateProduct(cfg, result) {
    const missing = [];
    const errors = [];

    if (!cfg.productId) missing.push("Selecciona un producto");
    if (!cfg.period) missing.push("Selecciona un periodo");
    if (!cfg.startDate) missing.push("Fecha de inicio");

    if (cfg.productId === "elite") {
      if (!cfg.eliteOption) missing.push("Opción de inventario Elite");
      if (cfg.eliteOption === "inventario" && (!cfg.inventory || cfg.inventory <= 0))
        missing.push("Inventario Elite (> 0)");
    }
    if (cfg.productId === "oportunidades") {
      if (!cfg.oppOption) missing.push("Paquete de oportunidades");
      if (cfg.oppOption === "inventario" && (!cfg.inventory || cfg.inventory <= 0))
        missing.push("Inventario Oportunidades (> 0)");
    }
    if (cfg.productId === "destacados") {
      const q = Number(cfg.quantity) || 0;
      if (q < D.destacados.minQty || q > D.destacados.maxQty)
        missing.push("Cantidad Destacados (" + D.destacados.minQty + "–" + D.destacados.maxQty + ")");
    }
    if (cfg.productId === "prime") {
      const q = Number(cfg.quantity) || 0;
      if (q < D.prime.minQty || q > D.prime.maxQty)
        missing.push("Cantidad Prime (" + D.prime.minQty + "–" + D.prime.maxQty + ")");
    }

    const pct = Number(cfg.manualDiscountPct) || 0;
    if (pct < 0 || pct > 100) errors.push("Descuento adicional debe estar entre 0 y 100");

    if (result) {
      (result.errors || []).forEach(e => errors.push(e));
      if (result.finalPrice <= 0 && missing.length === 0)
        missing.push("El precio calculado es 0 (revisar configuración)");
    }

    return {
      complete: missing.length === 0 && errors.length === 0,
      missing: missing,
      errors: errors
    };
  }

  // Advertencia de coherencia Estado <-> Zona.
  function zoneWarning(state, zone) {
    if (!state || !zone) return null;
    const suggested = CFG.suggestZone(state);
    if (zone === "FULLPRICE") {
      return { level: "info", text: "Zona FullPrice seleccionada manualmente (lista nacional, sin descuento regional)." };
    }
    if (zone !== suggested) {
      const zLabel = (CFG.zones.find(z => z.id === zone) || {}).label || zone;
      const sLabel = (CFG.zones.find(z => z.id === suggested) || {}).label || suggested;
      return {
        level: "warning",
        text: "El estado \"" + state + "\" sugiere zona " + sLabel + ", pero está seleccionada " + zLabel + ". Verifica que sea intencional."
      };
    }
    return null;
  }

  /* Valida la propuesta completa según el modo. Controla el botón PDF.
     productValidations: array de {complete, missing, errors} por producto. */
  function validateProposal(state, productValidations) {
    const missing = [];
    const warnings = [];

    if (!state.advisorId) missing.push("Selecciona un asesor");
    if (!state.clientName || !state.clientName.trim()) missing.push("Nombre del cliente o empresa");
    if (!state.zone) missing.push("Zona de pricing");
    if (!state.proposalValidUntil) missing.push("Vigencia de la propuesta");

    const zw = zoneWarning(state.state, state.zone);
    if (zw && zw.level === "warning") warnings.push(zw.text);

    const completeCount = productValidations.filter(v => v.complete).length;

    if (state.mode === "individual") {
      if (completeCount < 1) missing.push("Configura 1 producto completo");
    } else if (state.mode === "paquete") {
      if (completeCount < 2) missing.push("El paquete requiere mínimo 2 productos completos");
    } else if (state.mode === "vs") {
      if (completeCount < 2) missing.push("El comparativo VS requiere 2 productos completos");
    }

    // Reúne faltantes de cada producto (resumen).
    productValidations.forEach((v, i) => {
      v.missing.forEach(m => missing.push("Producto " + (i + 1) + ": " + m));
      v.errors.forEach(e => missing.push("Producto " + (i + 1) + ": " + e));
    });

    return {
      canExport: missing.length === 0,
      missing: missing,
      warnings: warnings,
      completeCount: completeCount
    };
  }

  return { validateProduct, validateProposal, zoneWarning };
})();
