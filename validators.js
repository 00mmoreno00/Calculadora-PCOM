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
      if (cfg.eliteOption === "personalizado" && (!cfg.customPackages || !cfg.customPackages.length))
        missing.push("Agrega al menos un paquete a la combinación personalizada (Elite)");
    }
    if (cfg.productId === "oportunidades") {
      if (!cfg.oppOption) missing.push("Paquete de oportunidades");
      if (cfg.oppOption === "personalizado" && (!cfg.customPackages || !cfg.customPackages.length))
        missing.push("Agrega al menos un paquete a la combinación personalizada (Oportunidades)");
    }
    if (cfg.productId === "destacados" || cfg.productId === "prime") {
      const conf = D[cfg.productId], name = cfg.productId === "destacados" ? "Destacados" : "Prime";
      if (!cfg.pkgOption) missing.push("Paquete " + name);
      if (cfg.pkgOption === "personalizado") {
        const q = Number(cfg.quantity) || 0;
        if (q < conf.minQty) missing.push("Número de avisos " + name + " (mínimo " + conf.minQty + ")");
      }
    }

    // El inventario capturado debe caer dentro del rango de la cobertura elegida.
    const inv = Number(cfg.inventory) || 0;
    const lim = inv > 0 && window.PC.PricingEngine && window.PC.PricingEngine.inventoryLimits ? window.PC.PricingEngine.inventoryLimits(cfg) : null;
    if (lim && (inv < lim.min || (lim.max != null && inv > lim.max)))
      missing.push("Inventario del cliente fuera de la cobertura (" + (lim.max != null ? "de " + lim.min + " a " + lim.max : lim.min + " o más") + ")");

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


  /* Valida la propuesta completa según el modo. Controla el botón PDF.
     productValidations: array de {complete, missing, errors} por producto. */
  function validateProposal(state, productValidations) {
    const missing = [];
    const warnings = [];

    if (!state.advisorId) missing.push("Selecciona un asesor");
    if (!state.clientName || !state.clientName.trim()) missing.push("Nombre del cliente o empresa");
    if (!state.stateName) missing.push("Estado del cliente");
    if (!state.zone) missing.push("Zona de pricing");
    if (!state.proposalValidUntil) missing.push("Vigencia de la propuesta");

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

  return { validateProduct, validateProposal };
})();
