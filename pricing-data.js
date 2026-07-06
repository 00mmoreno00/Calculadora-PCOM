/* ============================================================
   pricing-data.js — Tablas de precios REALES (fuente: tablas del cliente).
   Todos los precios son SIN IVA (+IVA se suma al mostrar).
   ------------------------------------------------------------
   MODELO:
   - ELITE y OPORTUNIDADES: precio MENSUAL base por zona. El periodo
     multiplica el mensual (mensual x1, trimestral x3, semestral x6,
     anual x12). Verificado contra las tablas Semestral/Anual del cliente
     (son múltiplos exactos del mensual).
   - DESTACADOS: tabla de TOTAL de contrato por cantidad de avisos y
     periodo (no lineal -> lookup obligatorio). No depende de zona.
   - PRIME: precio fijo por anuncio por mes ($699). Total = 699 x qty x meses.
     Tabla y fórmula dan el mismo resultado. No depende de zona.
   ============================================================ */
window.PC = window.PC || {};
window.PC.pricingData = (function () {
  "use strict";

  // Meses por periodo (base del multiplicador de Elite/Oportunidades).
  const PERIODS = {
    mensual:    { label: "Mensual",    months: 1 },
    trimestral: { label: "Trimestral", months: 3 },
    semestral:  { label: "Semestral",  months: 6 },
    anual:      { label: "Anual",      months: 12 }
  };

  return {
    PERIODS,

    // ----------------------------------------------------------------
    // ELITE — precio MENSUAL por zona y bracket de inventario.
    //   p300  = hasta 300 propiedades
    //   p500  = 301 a 500 propiedades
    //   extra = por cada bloque de 500 adicionales (inventario > 500)
    // FullPrice: sin dato en las tablas del cliente -> TODO_REEMPLAZAR.
    // ----------------------------------------------------------------
    elite: {
      zones: {
        FULLPRICE:   { p300: null, p500: null, extra: null, _todo: true }, // TODO_REEMPLAZAR
        CDMX_EDOMEX: { p300: 8500, p500: 11050, extra: 3315 },
        JALISCO_NL:  { p300: 4750, p500: 6413,  extra: 1924 },
        QUERETARO:   { p300: 3500, p500: 4725,  extra: 1418 },
        RESTO:       { p300: 3000, p500: 4050,  extra: 1215 }
      }
    },

    // ----------------------------------------------------------------
    // OPORTUNIDADES ILIMITADAS — precio MENSUAL por zona y paquete.
    // Paquetes: 10, 40, 80, 140, 300, 500. extra = por cada 500 extra.
    // FullPrice: derivado de los % de descuento por zona (lista nacional).
    //   Revisar/confirmar antes de usar en producción.
    // ----------------------------------------------------------------
    oportunidades: {
      packages: [10, 40, 80, 140, 300, 500],
      zones: {
        // Lista nacional derivada (0% descuento). TODO_REEMPLAZAR si hay lista oficial.
        FULLPRICE:   { "10": 600, "40": 2000, "80": 3000, "140": 5000, "300": 8000, "500": 9200, extra: 1380, _todo: true },
        CDMX_EDOMEX: { "10": 479, "40": 1599, "80": 2399, "140": 3996, "300": 6399, "500": 7359, extra: 1104 },
        JALISCO_NL:  { "10": 299, "40": 1000, "80": 1500, "140": 2498, "300": 3999, "500": 4599, extra: 690 },
        QUERETARO:   { "10": 210, "40": 700,  "80": 1050, "140": 1748, "300": 2800, "500": 3220, extra: 483 },
        RESTO:       { "10": 180, "40": 600,  "80": 900,  "140": 1499, "300": 2400, "500": 2760, extra: 414 }
      }
    },

    // ----------------------------------------------------------------
    // DESTACADOS — TOTAL de contrato por cantidad (1..10) y periodo.
    // Valores = columna "Pago x N meses" de la tabla del cliente.
    // Índice = cantidad - 1. maxQty configurable (extender tabla al crecer).
    // ----------------------------------------------------------------
    destacados: {
      minQty: 1,
      maxQty: 10, // TODO_REEMPLAZAR: extender la tabla para permitir más avisos
      unitMonthlyRef: 599, // precio por anuncio/mes de referencia (1 mes)
      table: {
        mensual:    [599, 1198, 1797, 2396, 2995, 3594, 4193, 4792, 5391, 5990],
        trimestral: [999, 1998, 2898, 3696, 4500, 5094, 5859, 6648, 7398, 8160],
        semestral:  [2070, 3312, 4016, 5161, 5762, 6665, 7487, 8390, 9191, 10143],
        anual:      [3600, 5310, 6885, 8400, 9000, 10350, 11655, 12840, 14040, 15000]
      }
    },

    // ----------------------------------------------------------------
    // PRIME — precio fijo por anuncio por mes. Sin descuento por periodo.
    // Total = unit x qty x meses. Tabla (default) == fórmula.
    // ----------------------------------------------------------------
    prime: {
      minQty: 1,
      maxQty: 10, // TODO_REEMPLAZAR: extender si se requiere más avisos
      unit: 699,  // precio por anuncio por mes (fijo, +IVA)
      defaultCalcMode: "tabla" // "tabla" | "formula" (ambos disponibles)
    }
  };
})();
