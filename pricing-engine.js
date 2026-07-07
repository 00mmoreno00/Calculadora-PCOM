/* ============================================================
   pricing-engine.js — MOTOR DE PRECIOS (separado de la UI).
   Recibe una configuración de producto y devuelve un objeto de
   resultado completo y auditable. No conoce el DOM ni React.
   ------------------------------------------------------------
   Aplica en ESTE orden (evita doble descuento):
     regionalPrice  ->  (- descuento manual)  ->  (- efecto promoción)
   El motor de PROMOCIONES decide QUÉ promo aplica; este motor la
   aplica numéricamente sobre el precio.
   ============================================================ */
window.PC = window.PC || {};
window.PC.PricingEngine = (function () {
  "use strict";

  const D = window.PC.pricingData;
  const U = window.PC.utils;
  const CFG = window.PC.config;

  function months(period) {
    return (D.PERIODS[period] && D.PERIODS[period].months) || 1;
  }

  function productQty(cfg) {
    return Math.max(1, Math.round(Number(cfg.quantity) || 1));
  }

  function unitFormulaMonthly(cfg, meta) {
    if (!D.getUnitFormulaMonthlyPrice) return null;
    const zoneObj = (CFG.zones || []).find(z => z.id === cfg.zone) || {};
    return D.getUnitFormulaMonthlyPrice(cfg.productId, meta.name, cfg.zone, zoneObj.label);
  }

  // ---- ELITE: precio mensual + cobertura de inventario -------------
  function eliteMonthly(cfg) {
    const warnings = [];
    const z = D.elite.zones[cfg.zone] || {};
    const list = D.elite.zones.FULLPRICE;

    let monthly = null, coveredLabel = "", coveredInv = null;
    const opt = cfg.eliteOption || "hasta300";

    if (opt === "hasta300") {
      monthly = z.p300; coveredLabel = "Hasta 300 propiedades"; coveredInv = 300;
    } else if (opt === "301a500") {
      monthly = z.p500; coveredLabel = "301 a 500 propiedades"; coveredInv = 500;
    } else { // inventario capturado
      const inv = Number(cfg.inventory) || 0;
      coveredInv = inv;
      if (inv <= 300) { monthly = z.p300; }
      else if (inv <= 500) { monthly = z.p500; }
      else {
        const blocks = Math.ceil((inv - 500) / 500);
        monthly = (z.p500 || 0) + blocks * (z.extra || 0);
        coveredLabel = inv + " propiedades (" + blocks + " bloque(s) de 500 extra)";
      }
      if (!coveredLabel) coveredLabel = inv + " propiedades";
    }

    // Lista nacional (FullPrice) para el precio original comparativo.
    let listMonthly = null;
    if (!list._todo && list.p300 != null) {
      if (opt === "hasta300") listMonthly = list.p300;
      else if (opt === "301a500") listMonthly = list.p500;
      else {
        const inv = coveredInv;
        if (inv <= 300) listMonthly = list.p300;
        else if (inv <= 500) listMonthly = list.p500;
        else listMonthly = list.p500 + Math.ceil((inv - 500) / 500) * list.extra;
      }
    }
    if (listMonthly == null) listMonthly = monthly;

    if (monthly == null) {
      warnings.push("No hay precio Elite para la zona seleccionada (revisar tabla / FullPrice pendiente).");
      monthly = 0; listMonthly = 0;
    }
    return { monthly, listMonthly, coveredLabel, coveredInv, warnings };
  }

  // ---- OPORTUNIDADES: precio mensual por paquete / inventario ------
  function oppMonthly(cfg) {
    const warnings = [];
    const z = D.oportunidades.zones[cfg.zone] || {};
    const list = D.oportunidades.zones.FULLPRICE;
    let monthly = null, listMonthly = null, coveredLabel = "";

    const opt = cfg.oppOption || "10";
    if (opt !== "inventario") {
      monthly = z[opt];
      listMonthly = list[opt];
      coveredLabel = "Paquete " + opt + " oportunidades";
    } else {
      const inv = Number(cfg.inventory) || 0;
      if (inv <= 500) {
        // Elige el paquete más pequeño que cubre el inventario.
        const pkg = D.oportunidades.packages.find(p => p >= inv) || 500;
        monthly = z[String(pkg)];
        listMonthly = list[String(pkg)];
        coveredLabel = inv + " (inventario capturado · paquete " + pkg + ")";
      } else {
        const blocks = Math.ceil((inv - 500) / 500);
        monthly = (z["500"] || 0) + blocks * (z.extra || 0);
        listMonthly = (list["500"] || 0) + blocks * (list.extra || 0);
        coveredLabel = inv + " oportunidades (paquete 500 + " + blocks + " bloque(s) de 500)";
      }
    }
    if (monthly == null) {
      warnings.push("No hay precio Oportunidades para la zona/paquete seleccionado.");
      monthly = 0; listMonthly = 0;
    }
    if (listMonthly == null) listMonthly = monthly;
    return { monthly, listMonthly, coveredLabel, warnings };
  }

  // ---- DESTACADOS: total por cantidad y periodo (tabla) ------------
  function destacadosTotal(cfg) {
    const warnings = [], errors = [];
    const q = Math.round(Number(cfg.quantity) || 0);
    const t = D.destacados;
    let total = 0;
    if (q < t.minQty) errors.push("Destacados requiere mínimo " + t.minQty + " aviso.");
    if (q > t.maxQty) errors.push("Destacados: máximo " + t.maxQty + " avisos en la tabla actual.");
    const idx = U.clamp(q, t.minQty, t.maxQty) - 1;
    const row = t.table[cfg.period];
    if (!row) { errors.push("Periodo inválido para Destacados."); }
    else { total = row[idx]; }
    return {
      total, listTotal: total, coveredLabel: q + " aviso(s) destacado(s)",
      quantity: q, warnings, errors
    };
  }

  // ---- PRIME: total por cantidad y periodo (fórmula) ---------------
  function primeTotal(cfg) {
    const warnings = [], errors = [];
    const q = Math.round(Number(cfg.quantity) || 0);
    const p = D.prime;
    if (q < p.minQty) errors.push("Prime requiere mínimo " + p.minQty + " aviso.");
    if (q > p.maxQty) errors.push("Prime: máximo " + p.maxQty + " avisos configurados.");
    const qEff = U.clamp(q, p.minQty, p.maxQty);
    const total = p.unit * qEff * months(cfg.period);
    return {
      total, listTotal: total, coveredLabel: q + " aviso(s) Prime",
      quantity: q, warnings, errors,
      calcMode: cfg.primeCalcMode || p.defaultCalcMode
    };
  }

  /* ----------------------------------------------------------------
     computePrice(cfg, appliedPromotion)
     appliedPromotion: objeto de promoción ya resuelto por el motor de
     promociones (o null). Solo se aplican aquí efectos a NIVEL PRODUCTO.
     ---------------------------------------------------------------- */
  function computePrice(cfg, appliedPromotion) {
    const m = months(cfg.period);
    const warnings = [], errors = [];
    const breakdown = [];
    const meta = CFG.productMeta[cfg.productId] || { name: cfg.productId };

    // 1) Precio base y regional (periodo completo)
    let regionalPrice = 0, listPrice = 0, coveredLabel = "", inventory = null, quantity = null;

    if (cfg.productId === "elite") {
      const r = eliteMonthly(cfg);
      regionalPrice = r.monthly * m;
      listPrice = r.listMonthly * m;
      coveredLabel = r.coveredLabel; inventory = r.coveredInv;
      warnings.push(...r.warnings);
      breakdown.push("Mensual zona " + cfg.zone + ": " + U.money(r.monthly) + " × " + m + " mes(es) = " + U.money(regionalPrice));
    } else if (cfg.productId === "oportunidades") {
      const r = oppMonthly(cfg);
      regionalPrice = r.monthly * m;
      listPrice = r.listMonthly * m;
      coveredLabel = r.coveredLabel; inventory = Number(cfg.inventory) || null;
      warnings.push(...r.warnings);
      breakdown.push("Mensual zona " + cfg.zone + ": " + U.money(r.monthly) + " × " + m + " mes(es) = " + U.money(regionalPrice));
    } else if (cfg.productId === "destacados") {
      const r = destacadosTotal(cfg);
      regionalPrice = r.total; listPrice = r.listTotal;
      coveredLabel = r.coveredLabel; quantity = r.quantity;
      warnings.push(...r.warnings); errors.push(...r.errors);
      breakdown.push("Tabla Destacados " + cfg.period + " (" + r.quantity + " avisos): " + U.money(regionalPrice));
    } else if (cfg.productId === "prime") {
      const r = primeTotal(cfg);
      regionalPrice = r.total; listPrice = r.listTotal;
      coveredLabel = r.coveredLabel; quantity = r.quantity;
      warnings.push(...r.warnings); errors.push(...r.errors);
      breakdown.push("Prime " + r.calcMode + ": " + window.PC.pricingData.prime.unit + " × " + r.quantity + " × " + m + " mes(es) = " + U.money(regionalPrice));
    } else {
      // Producto personalizado (admin): se cobra por precio base × cantidad × meses.
      const q = productQty(cfg);
      regionalPrice = (Number(cfg.basePriceOverride) || 0) * q * m;
      listPrice = regionalPrice;
      coveredLabel = q + " unidad(es)"; quantity = q;
      if (!cfg.basePriceOverride) errors.push("El producto personalizado requiere un precio base (admin) o una fila base CSV para unit_formula.");
      breakdown.push("Producto personalizado: base × " + q + " × " + m + " mes(es) = " + U.money(regionalPrice));
    }

    // 1b) Precio base configurado en admin o derivado de CSV exacto.
    //     Si existe, reemplaza el cálculo de fallback y elimina errores de límite de tabla.
    if (cfg.basePriceOverride != null && cfg.basePriceOverride !== "" && Number(cfg.basePriceOverride) > 0) {
      const bp = Number(cfg.basePriceOverride);
      if (cfg.productId === "elite" || cfg.productId === "oportunidades") {
        regionalPrice = bp * m;
      } else {
        const q = productQty(cfg);
        regionalPrice = bp * q * m;
        quantity = q;
      }
      listPrice = regionalPrice;
      errors.length = 0;
      breakdown.push("Precio base configurado / CSV exacto: " + U.money(regionalPrice));
    } else if (cfg.productId !== "elite" && cfg.productId !== "oportunidades") {
      // 1c) Regla global unit_formula:
      //     si no hay detalle exacto, busca Producto + Oferta=1 + Vigencia=Mensual
      //     en los CSV oficiales y calcula unitario × cantidad × meses.
      const unit = unitFormulaMonthly(cfg, meta);
      if (unit != null && Number(unit) > 0) {
        const q = productQty(cfg);
        regionalPrice = Number(unit) * q * m;
        listPrice = regionalPrice;
        quantity = q;
        if (!coveredLabel || coveredLabel === "0 unidad(es)") coveredLabel = q + " unidad(es)";
        errors.length = 0;
        breakdown.push("Regla unit_formula: " + U.money(unit) + " × " + q + " × " + m + " mes(es) = " + U.money(regionalPrice));
      }
    }

    const originalPrice = regionalPrice; // precio tachado (estándar de zona)

    // 2) Descuento manual (0..tope). El tope se configura por producto (admin).
    const maxD = (cfg.maxDiscount != null && cfg.maxDiscount !== "") ? U.clamp(Number(cfg.maxDiscount), 0, 100) : 100;
    let manualPct = U.clamp(Number(cfg.manualDiscountPct) || 0, 0, 100);
    if (manualPct > maxD) { warnings.push("Descuento limitado al tope configurado (" + maxD + "%)."); manualPct = maxD; }
    let manualDiscount = Math.round(regionalPrice * (manualPct / 100));
    let afterManual = regionalPrice - manualDiscount;
    if (manualPct > 0) breakdown.push("Descuento adicional " + manualPct + "%: −" + U.money(manualDiscount));

    // 3) Promoción (solo efectos a nivel producto)
    let promotionDiscount = 0;
    let appliedPromo = null;
    let replacedPrice = false;

    if (appliedPromotion && appliedPromotion.effect) {
      const eff = appliedPromotion.effect;
      const notCombinable = appliedPromotion.stackable === false && manualPct > 0;

      if (notCombinable && appliedPromotion.exclusive) {
        // La promo no se combina con descuento manual -> se descarta el manual.
        warnings.push("La promoción \"" + appliedPromotion.name + "\" no se combina con descuento adicional: se ignoró el " + manualPct + "% manual.");
        manualDiscount = 0; afterManual = regionalPrice; manualPct = 0;
      }

      switch (eff.type) {
        case "discount_pct": {
          promotionDiscount = Math.round(afterManual * (eff.value / 100));
          appliedPromo = appliedPromotion;
          breakdown.push("Promoción " + appliedPromotion.name + " (−" + eff.value + "%): −" + U.money(promotionDiscount));
          break;
        }
        case "discount_fixed": {
          promotionDiscount = Math.min(afterManual, Math.round(eff.value));
          appliedPromo = appliedPromotion;
          breakdown.push("Promoción " + appliedPromotion.name + " (−" + U.money(eff.value) + "): −" + U.money(promotionDiscount));
          break;
        }
        case "fixed_price":
        case "replace_price": {
          replacedPrice = true;
          const fixed = Math.round(eff.value);
          promotionDiscount = Math.max(0, originalPrice - fixed);
          afterManual = originalPrice; manualDiscount = 0; manualPct = 0;
          appliedPromo = appliedPromotion;
          breakdown.push("Promoción " + appliedPromotion.name + ": precio especial " + U.money(fixed));
          break;
        }
        case "extra_months":
        case "bonus_months": {
          appliedPromo = appliedPromotion; // no cambia precio, agrega cobertura
          breakdown.push("Promoción " + appliedPromotion.name + ": +" + eff.value + " mes(es) de bonificación");
          break;
        }
        default:
          // Efectos de paquete (bundle/preferential/free_product) no aplican a nivel producto.
          break;
      }
    }

    let finalPrice = Math.max(0, afterManual - promotionDiscount);
    const visibleDiscountPct = originalPrice > 0
      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

    breakdown.push("Precio final: " + U.money(finalPrice) + " +IVA");

    return {
      productId: cfg.productId,
      productName: meta.name,
      theme: meta.theme,
      mode: cfg.mode,
      quantity: quantity,
      inventory: inventory,
      coveredLabel: coveredLabel,
      period: cfg.period,
      periodLabel: (D.PERIODS[cfg.period] || {}).label || cfg.period,
      months: m,
      zone: cfg.zone,
      basePrice: Math.round(listPrice),
      regionalPrice: Math.round(regionalPrice),
      manualDiscount: Math.round(manualDiscount),
      manualDiscountPct: manualPct,
      promotionDiscount: Math.round(promotionDiscount),
      originalPrice: Math.round(originalPrice),
      finalPrice: Math.round(finalPrice),
      finalPriceIVA: Math.round(finalPrice * (1 + CFG.iva)),
      visibleDiscountPct: visibleDiscountPct,
      replacedPrice: replacedPrice,
      appliedPromotion: appliedPromo
        ? { id: appliedPromo.id, name: appliedPromo.name, label: (appliedPromo.display || {}).label, description: (appliedPromo.display || {}).description, extraMonths: (appliedPromo.effect.type === "extra_months" || appliedPromo.effect.type === "bonus_months") ? appliedPromo.effect.value : 0 }
        : null,
      calculationBreakdown: breakdown,
      warnings: warnings,
      errors: errors
    };
  }

  /* ----------------------------------------------------------------
     computePackage(results, packagePromotion)
     Suma los precios finales y aplica una promo a NIVEL PAQUETE.
     ---------------------------------------------------------------- */
  function computePackage(results, packagePromotion) {
    const subtotal = results.reduce((s, r) => s + r.finalPrice, 0);
    let packageDiscount = 0, appliedPromo = null, preferentialPrice = null;
    const breakdown = ["Subtotal paquete: " + U.money(subtotal)];

    if (packagePromotion && packagePromotion.effect) {
      const eff = packagePromotion.effect;
      if (eff.type === "bundle_discount_pct") {
        packageDiscount = Math.round(subtotal * (eff.value / 100));
        appliedPromo = packagePromotion;
        breakdown.push("Promo paquete " + packagePromotion.name + " (−" + eff.value + "%): −" + U.money(packageDiscount));
      } else if (eff.type === "preferential_price") {
        preferentialPrice = Math.round(eff.value);
        packageDiscount = Math.max(0, subtotal - preferentialPrice);
        appliedPromo = packagePromotion;
        breakdown.push("Precio preferencial de paquete: " + U.money(preferentialPrice));
      } else if (eff.type === "bundle_discount_fixed") {
        packageDiscount = Math.min(subtotal, Math.round(eff.value));
        appliedPromo = packagePromotion;
        breakdown.push("Promo paquete (−" + U.money(eff.value) + "): −" + U.money(packageDiscount));
      }
    }

    const total = Math.max(0, subtotal - packageDiscount);
    return {
      subtotal: Math.round(subtotal),
      packageDiscount: Math.round(packageDiscount),
      preferentialPrice: preferentialPrice,
      total: Math.round(total),
      totalIVA: Math.round(total * (1 + CFG.iva)),
      appliedPromotion: appliedPromo ? { id: appliedPromo.id, name: appliedPromo.name, label: (appliedPromo.display || {}).label } : null,
      breakdown: breakdown
    };
  }

  return { computePrice, computePackage, months };
})();
