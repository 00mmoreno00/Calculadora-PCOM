/* ============================================================
   pricing-data.js — Tablas de precios REALES (fuente: tablas del cliente).
   Todos los precios son SIN IVA (+IVA se suma al mostrar).
   ------------------------------------------------------------
   MODELO:
   - ELITE y OPORTUNIDADES: precio MENSUAL base por zona. El periodo
     multiplica el mensual (mensual x1, trimestral x3, semestral x6,
     anual x12). Verificado contra las tablas Semestral/Anual del cliente
     (son múltiplos exactos del mensual).
   - DESTACADOS y PRIME: paquetes de 1, 5, 10, 20 y 50 avisos con precio
     mensual por zona (el periodo multiplica el mensual) o "Personalizado"
     (avisos × precio de lista).
   - UNIT_FORMULA GLOBAL: para productos unitarios vigentes o nuevos,
     si no existe detalle exacto en CSV, se puede usar una fila base
     Producto,1,Mensual y calcular unitario × cantidad × meses.
   ============================================================ */
window.PC = window.PC || {};
window.PC.pricingData = (function () {
  "use strict";

  // Meses por periodo (base del multiplicador de Elite/Oportunidades).
  // bonusMonths: meses de servicio de regalo que NO se cobran (solo amplían
  // la vigencia). Promo 7 meses = paga 7 y llévate 10 (solo Oportunidades).
  const PERIODS = {
    mensual:    { label: "Mensual",       months: 1 },
    trimestral: { label: "Trimestral",    months: 3 },
    semestral:  { label: "Semestral",     months: 6 },
    promo7:     { label: "Promo 7 meses", months: 7, bonusMonths: 3 },
    anual:      { label: "Anual",         months: 12 }
  };

  const data = {
    PERIODS,

    // % de descuento por zona sobre el precio de lista (usado por el respaldo
    // de Destacados/Prime cuando no hay fila en el CSV).
    zoneDiscountPct: { FULLPRICE: 0, CDMX_EDOMEX: 0, JALISCO_NL: 50, RESTO: 65 },

    // ----------------------------------------------------------------
    // Descuento por zona (sobre el precio de lista nacional, FULLPRICE):
    //   CDMX / Estado de México 0% · Jalisco / Nuevo León 50% · Resto del país 65%.
    // Los CSV de data/precios/ traen PrecioBase (lista) + Descuento por zona y
    // son la fuente principal; las tablas de abajo son el respaldo.
    // ----------------------------------------------------------------

    // ELITE — precio MENSUAL por zona y bracket de inventario.
    //   p300  = hasta 300 propiedades
    //   p500  = 301 a 500 propiedades
    //   extra = por cada bloque de 500 adicionales (inventario > 500)
    elite: {
      zones: {
        FULLPRICE:   { p300: 8500, p500: 11050, extra: 3315 },
        CDMX_EDOMEX: { p300: 8500, p500: 11050, extra: 3315 },
        JALISCO_NL:  { p300: 4250, p500: 5525,  extra: 1657.5 },
        RESTO:       { p300: 2975, p500: 3867.5, extra: 1160.25 }
      }
    },

    // OPORTUNIDADES ILIMITADAS — precio MENSUAL por zona y paquete.
    // Paquetes: 10, 40, 80, 140, 300, 500. extra = por cada 500 extra.
    oportunidades: {
      packages: [10, 40, 80, 140, 300, 500],
      zones: {
        FULLPRICE:   { "10": 599, "40": 1999,   "80": 2999,   "140": 4999,   "300": 7999,   "500": 9199,   extra: 1380 },
        CDMX_EDOMEX: { "10": 599, "40": 1999,   "80": 2999,   "140": 4999,   "300": 7999,   "500": 9199,   extra: 1380 },
        JALISCO_NL:  { "10": 299.5, "40": 999.5, "80": 1499.5, "140": 2499.5, "300": 3999.5, "500": 4599.5, extra: 690 },
        RESTO:       { "10": 209.65, "40": 699.65, "80": 1049.65, "140": 1749.65, "300": 2799.65, "500": 3219.65, extra: 483 }
      }
    },

    // DESTACADOS — paquetes de 1, 5, 10, 20 y 50 avisos (precio MENSUAL de
    // lista = precio por aviso del rango × avisos del paquete). El periodo
    // multiplica el mensual. Rangos de venta: 1 a 4, 5 a 9, 10 a 19, 20 a 49
    // y 50 o más. "Personalizado" = avisos × `unit` (precio de lista, sin
    // descuento por rango ni por zona).
    destacados: {
      unit: 600,
      packages: [1, 5, 10, 20, 50],
      ranges: { "1": "1 a 4", "5": "5 a 9", "10": "10 a 19", "20": "20 a 49", "50": "50" },
      packagePrices: { "1": 600, "5": 2500, "10": 3500, "20": 6000, "50": 10000 },
      minQty: 1,
      maxQty: 9999
    },

    // PRIME — misma estructura que Destacados.
    prime: {
      unit: 700,
      packages: [1, 5, 10, 20, 50],
      ranges: { "1": "1 a 4", "5": "5 a 9", "10": "10 a 19", "20": "20 a 49", "50": "50" },
      packagePrices: { "1": 700, "5": 3000, "10": 4500, "20": 8000, "50": 17500 },
      minQty: 1,
      maxQty: 9999
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
  // IMPORTANTE (operación): estas descargas SOLO funcionan cuando la
  // calculadora se abre servida por http/https (ej. Vercel). Abriéndola como
  // archivo local (file://) el navegador bloquea el fetch y falla en silencio;
  // en ese caso la app usa los precios internos de este archivo (fallback),
  // no el catálogo CSV. Para que el CSV mande, hay que servir el sitio.
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
