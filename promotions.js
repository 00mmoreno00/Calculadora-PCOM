/* ============================================================
   promotions.js — CATÁLOGO DE PROMOCIONES (editable cada mes).
   NO tocar el motor de cálculo para cambiar promos: editar aquí
   directamente (sin persistencia en navegador).
   ------------------------------------------------------------
   Tipos de efecto soportados (effect.type):
     Nivel producto:
       discount_pct     -> value = % de descuento
       discount_fixed   -> value = monto fijo a descontar (MXN, sin IVA)
       fixed_price      -> value = precio final especial (reemplaza)
       replace_price    -> alias de fixed_price
       extra_months     -> value = meses de cortesía (no cambia precio)
       bonus_months     -> alias de extra_months
     Nivel paquete:
       bundle_discount_pct   -> value = % sobre total del paquete
       bundle_discount_fixed -> value = monto fijo sobre total del paquete
       preferential_price    -> value = precio preferencial del paquete
       free_product          -> value = productId bonificado
   ------------------------------------------------------------
   Campos por promoción:
     id, name, active, startsAt, endsAt (YYYY-MM-DD),
     priority (mayor gana), stackable (acumulable), exclusive,
     appliesTo { modes, requiredProducts, zones, periods,
                 minInventory, maxInventory, minQty, maxQty },
     effect { type, value, appliesOn },
     display { label, description },
     excludes [ids...]
   ============================================================ */
window.PC = window.PC || {};
window.PC.defaultPromotions = [

  {
    id: "promo_bienvenida",
    name: "Bienvenida Propiedades.com",
    active: true,
    startsAt: "2026-07-01",
    endsAt: "2026-12-31",
    priority: 10,
    stackable: false,
    exclusive: false,
    appliesTo: {
      modes: ["individual", "paquete", "vs"],
      requiredProducts: null,          // aplica a cualquier producto
      zones: ["FULLPRICE", "CDMX_EDOMEX", "JALISCO_NL", "QUERETARO", "RESTO"],
      periods: ["mensual", "trimestral", "semestral", "anual"],
      minInventory: null, maxInventory: null, minQty: null, maxQty: null
    },
    effect: { type: "discount_pct", value: 5, appliesOn: "product_after_manual" },
    display: { label: "Bienvenida", description: "5% de descuento de bienvenida" },
    excludes: []
  },

  {
    id: "promo_mes_paquete_oportunidades_destacado",
    name: "Promoción del mes · Oportunidades + Destacados",
    active: true,
    startsAt: "2026-07-01",
    endsAt: "2026-07-31",
    priority: 100,
    stackable: false,
    exclusive: true,
    appliesTo: {
      modes: ["paquete"],
      requiredProducts: ["oportunidades", "destacados"],
      zones: ["CDMX_EDOMEX", "JALISCO_NL", "QUERETARO", "RESTO"],
      periods: ["mensual", "trimestral", "semestral", "anual"],
      minInventory: null, maxInventory: null, minQty: null, maxQty: null
    },
    effect: { type: "bundle_discount_pct", value: 15, appliesOn: "package_total" },
    display: { label: "Promoción del mes", description: "15% adicional en paquete Oportunidades + Destacados" },
    excludes: []
  },

  {
    id: "promo_destacados_anual_2meses",
    name: "Destacados Anual · 2 meses de cortesía",
    active: true,
    startsAt: "2026-07-01",
    endsAt: "2026-08-31",
    priority: 40,
    stackable: true,
    exclusive: false,
    appliesTo: {
      modes: ["individual", "paquete", "vs"],
      requiredProducts: ["destacados"],
      zones: ["FULLPRICE", "CDMX_EDOMEX", "JALISCO_NL", "QUERETARO", "RESTO"],
      periods: ["anual"],
      minInventory: null, maxInventory: null, minQty: null, maxQty: null
    },
    effect: { type: "extra_months", value: 2, appliesOn: "product" },
    display: { label: "+2 meses", description: "2 meses de cortesía al contratar Destacados anual" },
    excludes: []
  },

  {
    id: "promo_prime_precio_especial",
    name: "Prime · Precio especial de lanzamiento",
    active: false, // ejemplo desactivado
    startsAt: "2026-07-01",
    endsAt: "2026-07-31",
    priority: 90,
    stackable: false,
    exclusive: true,
    appliesTo: {
      modes: ["individual"],
      requiredProducts: ["prime"],
      zones: ["FULLPRICE", "CDMX_EDOMEX", "JALISCO_NL", "QUERETARO", "RESTO"],
      periods: ["anual"],
      minInventory: null, maxInventory: null, minQty: 1, maxQty: 1
    },
    effect: { type: "fixed_price", value: 6990, appliesOn: "product" },
    display: { label: "Precio especial", description: "Prime 1 aviso anual a precio especial de lanzamiento" },
    excludes: []
  }

];
