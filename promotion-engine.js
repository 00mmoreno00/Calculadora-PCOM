/* ============================================================
   promotion-engine.js — MOTOR DE PROMOCIONES (separado del pricing).
   Decide QUÉ promoción aplica; NO calcula el precio final (eso lo hace
   pricing-engine con el efecto que este motor selecciona).
   ------------------------------------------------------------
   Fuente de promociones (única):
     window.PC.defaultPromotions (archivo promotions.js). Las ediciones desde
     el panel de administración se aplican aquí en memoria de inmediato; se
     graban en promotions.js en disco vía AdminFS (ver Calculadora.dc.html).
   ============================================================ */
window.PC = window.PC || {};
window.PC.PromotionEngine = (function () {
  "use strict";

  const U = window.PC.utils;

  const PRODUCT_EFFECTS = ["discount_pct", "discount_fixed", "fixed_price", "replace_price", "extra_months", "bonus_months"];
  const PACKAGE_EFFECTS = ["bundle_discount_pct", "bundle_discount_fixed", "preferential_price", "free_product"];

  // --------- Fuente de datos: window.PC.defaultPromotions (promotions.js) ---------
  // savePromotions actualiza la copia EN MEMORIA de inmediato (vista previa
  // en vivo); grabar el archivo promotions.js en disco es un paso aparte
  // que dispara el panel de administración (ver Calculadora.dc.html).
  let original = null;

  function getPromotions() {
    return (window.PC.defaultPromotions || []).slice();
  }

  function savePromotions(list) {
    if (original === null) original = (window.PC.defaultPromotions || []).slice();
    window.PC.defaultPromotions = (list || []).slice();
    return true;
  }

  function resetPromotions() {
    if (original !== null) window.PC.defaultPromotions = original.slice();
  }

  function isWithinDates(promo, date) {
    const start = U.fromISO(promo.startsAt);
    const end = U.fromISO(promo.endsAt);
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  }

  // ¿La promoción aplica al contexto? Devuelve {ok, reason}
  function matches(promo, ctx) {
    const a = promo.appliesTo || {};

    if (!promo.active) return { ok: false, reason: "inactiva" };
    if (!isWithinDates(promo, ctx.date)) return { ok: false, reason: "fuera de vigencia" };
    if (a.modes && a.modes.length && a.modes.indexOf(ctx.mode) === -1)
      return { ok: false, reason: "modo no aplica" };
    if (a.zones && a.zones.length && ctx.zone && a.zones.indexOf(ctx.zone) === -1)
      return { ok: false, reason: "zona no aplica" };
    if (a.periods && a.periods.length && ctx.period && a.periods.indexOf(ctx.period) === -1)
      return { ok: false, reason: "periodo no aplica" };

    const inv = Number(ctx.inventory) || 0;
    if (a.minInventory != null && inv < a.minInventory) return { ok: false, reason: "inventario menor al mínimo" };
    if (a.maxInventory != null && inv > a.maxInventory) return { ok: false, reason: "inventario mayor al máximo" };

    const qty = Number(ctx.quantity) || 0;
    if (a.minQty != null && qty < a.minQty) return { ok: false, reason: "cantidad menor al mínimo" };
    if (a.maxQty != null && qty > a.maxQty) return { ok: false, reason: "cantidad mayor al máximo" };

    // Productos requeridos
    const scope = PACKAGE_EFFECTS.indexOf(promo.effect.type) >= 0 ? "package" : "product";
    if (a.requiredProducts && a.requiredProducts.length) {
      if (scope === "package") {
        const present = ctx.products || [];
        const allPresent = a.requiredProducts.every(p => present.indexOf(p) >= 0);
        if (!allPresent) return { ok: false, reason: "faltan productos requeridos" };
      } else {
        if (a.requiredProducts.indexOf(ctx.productId) === -1)
          return { ok: false, reason: "producto no incluido" };
      }
    }
    return { ok: true, reason: "aplica", scope: scope };
  }

  /* ----------------------------------------------------------------
     evaluateForProduct(ctx) -> resultado de promo a nivel producto.
     ctx: { mode, productId, zone, period, inventory, quantity, date }
     ---------------------------------------------------------------- */
  function evaluateForProduct(ctx) {
    const all = getPromotions();
    const candidates = [];
    const discarded = [];

    all.forEach(p => {
      if (PRODUCT_EFFECTS.indexOf(p.effect.type) < 0) return; // solo efectos de producto
      const m = matches(p, ctx);
      if (m.ok) candidates.push(p);
      else discarded.push({ id: p.id, name: p.name, reason: m.reason });
    });

    // Orden por prioridad desc; una promo exclusiva de mayor prioridad gana.
    candidates.sort((x, y) => (y.priority || 0) - (x.priority || 0));
    const applied = candidates.length ? candidates[0] : null;

    // Descartar el resto por prioridad (regla: 1 promo de precio por producto).
    candidates.slice(1).forEach(p =>
      discarded.push({ id: p.id, name: p.name, reason: "menor prioridad" }));

    return {
      candidates: candidates.map(c => ({ id: c.id, name: c.name })),
      applied: applied,
      discarded: discarded,
      stackable: applied ? applied.stackable === true : false,
      replacedPrice: applied ? (applied.effect.type === "fixed_price" || applied.effect.type === "replace_price") : false
    };
  }

  /* ----------------------------------------------------------------
     evaluateForPackage(ctx) -> promo a nivel paquete.
     ctx: { mode, products:[...], zone, period, date }
     ---------------------------------------------------------------- */
  function evaluateForPackage(ctx) {
    const all = getPromotions();
    const candidates = [];
    const discarded = [];

    all.forEach(p => {
      if (PACKAGE_EFFECTS.indexOf(p.effect.type) < 0) return; // solo efectos de paquete
      const m = matches(p, ctx);
      if (m.ok) candidates.push(p);
      else discarded.push({ id: p.id, name: p.name, reason: m.reason });
    });

    candidates.sort((x, y) => (y.priority || 0) - (x.priority || 0));
    const applied = candidates.length ? candidates[0] : null;
    candidates.slice(1).forEach(p =>
      discarded.push({ id: p.id, name: p.name, reason: "menor prioridad" }));

    return {
      candidates: candidates.map(c => ({ id: c.id, name: c.name })),
      applied: applied,
      discarded: discarded
    };
  }

  /* ----------------------------------------------------------------
     evaluateAutoPromo(ctx) -> promoción comercial automática vigente,
     según reglas fijas de negocio (inventario del cliente + producto +
     periodo + cobertura/cantidad). Independiente del catálogo editable
     de promotions.js y del botón manual "Promo" (courtesía/bonificación
     manual): esta función NO se edita desde el panel de administración.
     ctx: { productId, period, quantity, inventory, mode }
     La promo de Destacados/Prime no es combinable con la de Oportunidades
     Ilimitadas: solo se muestra en configuración individual, nunca en un
     paquete (donde podría ir junto con OI).
     Devuelve null si ninguna promo aplica, o { text } si aplica.
     ---------------------------------------------------------------- */
  function evaluateAutoPromo(ctx) {
    // Interruptor: activa/desactiva las promociones automáticas de OI,
    // Destacados y Prime sin borrar las reglas configuradas.
    const showOiAndHighlightedPromotions = true;
    const inv = Number(ctx.inventory) || 0;
    const period = ctx.period;
    const productId = ctx.productId;
    const qty = Number(ctx.quantity) || 0;

    if (showOiAndHighlightedPromotions && productId === "oportunidades") {
      if (inv >= 10 && inv <= 29) {
        // label: nombre corto que el panel muestra en el switch (Promo 1/2/3).
        if (period === "semestral") return { text: "Paga 6 meses y llévate 1 mes de servicio adicional.", label: "Promo 1" };
        if (period === "anual") return { text: "Paga 12 meses y llévate 3 meses de servicio adicional.", label: "Promo 1" };
      } else if (inv >= 30) {
        if (period === "semestral") return { text: "Paga 6 meses y llévate 1 mes de servicio adicional.", label: "Promo 2" };
        if (period === "anual") return { text: "Paga 12 meses y llévate 3 meses de servicio adicional.", label: "Promo 2" };
      }
      return null;
    }

    if (showOiAndHighlightedPromotions && (productId === "destacados" || productId === "prime") && ctx.mode === "individual") {
      if (period === "semestral" || period === "anual") {
        // pct: además del texto, el % que pricing-engine descuenta del precio
        // final cuando esta promo está habilitada (ver Calculadora.dc.html).
        if (qty >= 1 && qty <= 5) return { text: "5% de descuento ¡Para gritar Viva México!", pct: 5, label: "Promo 3" };
        if (qty >= 6 && qty <= 15) return { text: "10% de descuento ¡Para gritar Viva México!", pct: 10, label: "Promo 3" };
        if (qty >= 16) return { text: "20% de descuento ¡Para gritar Viva México!", pct: 20, label: "Promo 3" };
      }
      return null;
    }

    return null;
  }

  /* ----------------------------------------------------------------
     evaluateBonusPromo(amount) -> bono de Destacados por monto de compra
     (Precio final con IVA de un producto). Regla fija de negocio,
     independiente de evaluateAutoPromo; el comercial la activa/desactiva
     con el botón "Promoción 4" (ver Calculadora.dc.html).
     Devuelve null si el monto no alcanza ningún escalón, o { text, qty }.
     ---------------------------------------------------------------- */
  const BONUS_TIERS = [
    { min: 100000, qty: 200 },
    { min: 50000, qty: 50 },
    { min: 30000, qty: 30 },
    { min: 20000, qty: 20 },
    { min: 15000, qty: 10 },
    { min: 11000, qty: 5 }
  ];

  function evaluateBonusPromo(amount) {
    const amt = Number(amount) || 0;
    const tier = BONUS_TIERS.find(t => amt >= t.min);
    if (!tier) return null;
    return { text: "+ " + tier.qty + " Destacados de bono · vigencia 3 meses", qty: tier.qty };
  }

  return {
    getPromotions, savePromotions, resetPromotions,
    evaluateForProduct, evaluateForPackage, matches, evaluateAutoPromo, evaluateBonusPromo,
    PRODUCT_EFFECTS, PACKAGE_EFFECTS
  };
})();
