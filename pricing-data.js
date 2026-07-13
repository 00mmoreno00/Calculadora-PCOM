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
   - UNIT_FORMULA GLOBAL: para productos unitarios vigentes o nuevos,
     si no existe detalle exacto en CSV, se puede usar una fila base
     Producto,1,Mensual y calcular unitario × cantidad × meses.
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

  const data = {
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
    // Índice = cantidad - 1. El CSV oficial puede reemplazar este fallback.
    // ----------------------------------------------------------------
    destacados: {
      minQty: 1,
      maxQty: 10,
      unitMonthlyRef: 599,
      table: {
        mensual:    [599, 1198, 1797, 2396, 2995, 3594, 4193, 4792, 5391, 5990],
        trimestral: [999, 1998, 2898, 3696, 4500, 5094, 5859, 6648, 7398, 8160],
        semestral:  [2070, 3312, 4016, 5161, 5762, 6665, 7487, 8390, 9191, 10143],
        anual:      [3600, 5310, 6885, 8400, 9000, 10350, 11655, 12840, 14040, 15000]
      }
    },

    // ----------------------------------------------------------------
    // PRIME — precio fijo por anuncio por mes.
    // La fila base oficial puede venir en data/precios/prime.csv:
    //   Prime,1,,Mensual,699,0,699
    // Si no existe detalle para otra cantidad/vigencia, aplica unit_formula.
    // ----------------------------------------------------------------
    prime: {
      minQty: 1,
      maxQty: 9999,
      unit: 699,
      defaultCalcMode: "formula"
    },

    // Mapa global de precios unitarios mensuales detectados desde CSV.
    // Llave: producto normalizado + zona normalizada. Zona vacía = general.
    unitFormulaPrices: {},

    normalizeKey,
    normalizeZone,
    getUnitFormulaMonthlyPrice
  };

  function normalizeKey(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function normalizeZone(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[&/,]|(^|\s)y(\s|$)/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function splitLine(line, delimiter) {
    const out = [];
    let cur = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"') {
          if (line[i + 1] === '"') { cur += '"'; i++; }
          else quoted = false;
        } else cur += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === delimiter) { out.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    out.push(cur.trim());
    return out;
  }

  function delimiter(line) {
    const commas = (line.match(/,/g) || []).length;
    const semis = (line.match(/;/g) || []).length;
    const tabs = (line.match(/\t/g) || []).length;
    if (tabs > 0 && tabs >= commas && tabs >= semis) return "\t";
    return semis > commas ? ";" : ",";
  }

  function num(v) {
    const n = Number(String(v == null ? "" : v).replace(/[$,%\s]/g, ""));
    return isFinite(n) ? n : null;
  }

  function setUnitFormulaPrice(productName, zone, price) {
    const p = normalizeKey(productName);
    const z = normalizeZone(zone);
    if (!p || !(price > 0)) return;
    data.unitFormulaPrices[p + "|" + z] = price;
    // Prime SÍ se sincroniza aquí a propósito: prime.unit es el precio unitario
    // que usa el modo "fórmula" (unit × cantidad × meses) cuando no hay fila
    // exacta en el CSV para la cantidad pedida. Mantenerlo igual a la fila
    // Oferta=1/Mensual de data/precios/prime.csv evita que ese fallback quede
    // desactualizado si el CSV cambia.
    if (p === "prime" && !z) data.prime.unit = price;
  }

  function getUnitFormulaMonthlyPrice(productId, productName, zoneId, zoneLabel) {
    const productKeys = [normalizeKey(productId), normalizeKey(productName)].filter(Boolean);
    const zoneKeys = [normalizeZone(zoneId), normalizeZone(zoneLabel), ""].filter((x, i, a) => a.indexOf(x) === i);
    for (let i = 0; i < productKeys.length; i++) {
      for (let j = 0; j < zoneKeys.length; j++) {
        const val = data.unitFormulaPrices[productKeys[i] + "|" + zoneKeys[j]];
        if (val > 0) return val;
      }
    }
    return null;
  }

  function ingestCsv(text) {
    const lines = String(text || "").replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n").filter(x => x.trim());
    if (lines.length < 2) return;
    const d = delimiter(lines[0]);
    const h = splitLine(lines[0], d).map(x => normalizeKey(x));
    const idx = name => h.indexOf(normalizeKey(name));
    const pI = idx("Producto"), oI = idx("Oferta"), zI = idx("Zona"), vI = idx("Vigencia"), fI = idx("PrecioFinal");
    if (pI < 0 || oI < 0 || vI < 0 || fI < 0) return;
    for (let i = 1; i < lines.length; i++) {
      const c = splitLine(lines[i], d);
      const oferta = String(c[oI] || "").trim();
      const vigencia = normalizeKey(c[vI]);
      const price = num(c[fI]);
      if (oferta === "1" && vigencia === "mensual" && price > 0) setUnitFormulaPrice(c[pI], zI >= 0 ? c[zI] : "", price);
    }
  }

  // Descarga index.json + todos los CSV oficiales UNA sola vez (la promesa se
  // cachea y se comparte con quien más la necesite, ej. Calculadora.dc.html,
  // para no duplicar la misma descarga de red).
  let catalogFilesPromise = null;
  function fetchCatalogFiles() {
    if (catalogFilesPromise) return catalogFilesPromise;
    catalogFilesPromise = fetch("data/precios/index.json")
      .then(r => r.ok ? r.json() : null)
      .then(idx => {
        if (!idx || !Array.isArray(idx.files)) return [];
        return Promise.all(idx.files.map(f =>
          fetch(f.file).then(r => r.ok ? r.text() : "").then(text => ({ file: f.file, text: text })).catch(() => ({ file: f.file, text: "" }))
        ));
      })
      .catch(() => []);
    return catalogFilesPromise;
  }

  // Carga ligera de filas base unit_formula desde los CSV oficiales.
  // No reemplaza el catálogo oficial de la calculadora; sólo habilita fórmula
  // cuando no existe una fila exacta para cantidad/vigencia. fetchCatalogFiles()
  // ya degrada a [] si algo falla, así que aquí no queda nada más que hacer.
  try {
    if (typeof fetch === "function") {
      fetchCatalogFiles().then(files => { (files || []).forEach(f => ingestCsv(f.text)); });
    }
  } catch (e) { }

  data.fetchCatalogFiles = fetchCatalogFiles;
  return data;
})();
