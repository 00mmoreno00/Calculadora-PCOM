/* ============================================================
   utils.js — Utilidades puras (fechas, formato, moneda)
   Sin dependencias. No mezclar lógica de negocio aquí.
   ============================================================ */
window.PC = window.PC || {};
window.PC.utils = (function () {
  "use strict";

  function pad(n) { return String(n).padStart(2, "0"); }

  /* Fecha de HOY en horario LOCAL del usuario (NUNCA UTC).
     Se normaliza a medianoche local para evitar desfases. */
  function todayLocal() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  /* Serializa a YYYY-MM-DD usando componentes LOCALES (no toISOString, que usa UTC). */
  function toISO(d) {
    if (!d) return "";
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  /* Parsea YYYY-MM-DD como fecha LOCAL (evita el parseo UTC de new Date("YYYY-MM-DD")). */
  function fromISO(s) {
    if (!s) return null;
    const parts = String(s).split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  /* Suma meses manejando correctamente fin de mes.
     Ej: 31/ene + 1 mes -> 28/feb (o 29 en bisiesto). */
  function addMonths(date, months) {
    const targetDay = date.getDate();
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    d.setMonth(d.getMonth() + months);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(targetDay, lastDay));
    return d;
  }

  function addDays(date, n) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + n);
    return d;
  }

  /* Suma N días HÁBILES (excluye sábado y domingo). No considera feriados. */
  function addBusinessDays(date, n) {
    let d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    let added = 0;
    while (added < n) {
      d.setDate(d.getDate() + 1);
      const wd = d.getDay();
      if (wd !== 0 && wd !== 6) added++;
    }
    return d;
  }

  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  function formatLong(d) {
    if (!d) return "—";
    return d.getDate() + " de " + MESES[d.getMonth()] + " de " + d.getFullYear();
  }

  function formatShort(d) {
    if (!d) return "—";
    return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear();
  }

  /* Moneda MXN sin decimales. Los precios del negocio son enteros +IVA. */
  function money(n) {
    if (n == null || isNaN(n)) return "—";
    return "$" + Math.round(n).toLocaleString("es-MX");
  }

  function pct(n) {
    if (n == null || isNaN(n)) return "0%";
    return Math.round(n) + "%";
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  return {
    pad, todayLocal, toISO, fromISO, addMonths, addDays, addBusinessDays,
    formatLong, formatShort, money, pct, clamp, MESES
  };
})();
