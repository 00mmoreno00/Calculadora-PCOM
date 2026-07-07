/* ============================================================
   promotion-engine.js — MOTOR DE PROMOCIONES (separado del pricing).
   Decide QUÉ promoción aplica; NO calcula el precio final (eso lo hace
   pricing-engine con el efecto que este motor selecciona).
   ------------------------------------------------------------
   Fuente de promociones:
     1) localStorage (si el modo admin guardó una configuración)
     2) window.PC.defaultPromotions (archivo promotions.js)
   ============================================================ */
window.PC = window.PC || {};
window.PC.PromotionEngine = (function () {
  "use strict";

  const U = window.PC.utils;
  const LS_KEY = "pc_promotions_v1";

  const PRODUCT_EFFECTS = ["discount_pct", "discount_fixed", "fixed_price", "replace_price", "extra_months", "bonus_months"];
  const PACKAGE_EFFECTS = ["bundle_discount_pct", "bundle_discount_fixed", "preferential_price", "free_product"];

  // --------- Fuente de datos (admin/localStorage o default) ---------
  function getPromotions() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { /* localStorage no disponible: usar default */ }
    return (window.PC.defaultPromotions || []).slice();
  }

  function savePromotions(list) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(list)); return true; }
    catch (e) { return false; }
  }

  function resetPromotions() {
    try { localStorage.removeItem(LS_KEY); } catch (e) { }
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

  return {
    LS_KEY,
    getPromotions, savePromotions, resetPromotions,
    evaluateForProduct, evaluateForPackage, matches,
    PRODUCT_EFFECTS, PACKAGE_EFFECTS
  };
})();
