/* ============================================================
   admin-fs.js — Puente entre el panel de administración y los
   archivos reales del proyecto (config.js, promotions.js,
   data/precios/*.csv, data/precios/index.json).
   Usa la File System Access API (Chrome / Edge). Sin esta API,
   el panel sigue funcionando en memoria durante la sesión y
   ofrece descargar el archivo actualizado en su lugar.
   ============================================================ */
window.PC = window.PC || {};
window.PC.AdminFS = (function () {
  "use strict";

  let dirHandle = null;

  function isSupported() {
    return typeof window.showDirectoryPicker === "function";
  }

  function isConnected() {
    return !!dirHandle;
  }

  function folderName() {
    return dirHandle ? dirHandle.name : "";
  }

  async function connect() {
    if (!isSupported()) throw new Error("Este navegador no soporta guardar directo en archivos (usa Chrome o Edge).");
    const handle = await window.showDirectoryPicker();
    // Valida que sea la carpeta correcta intentando ver config.js.
    await handle.getFileHandle("config.js");
    dirHandle = handle;
    return true;
  }

  function disconnect() { dirHandle = null; }

  // Resuelve subcarpetas de un path tipo "data/precios/elite.csv",
  // creando directorios intermedios si hace falta.
  async function resolveFileHandle(relativePath, create) {
    const parts = String(relativePath).split("/").filter(Boolean);
    let dir = dirHandle;
    for (let i = 0; i < parts.length - 1; i++) {
      dir = await dir.getDirectoryHandle(parts[i], { create: !!create });
    }
    return dir.getFileHandle(parts[parts.length - 1], { create: !!create });
  }

  async function ensureWritePermission(handle) {
    const opts = { mode: "readwrite" };
    if ((await handle.queryPermission(opts)) === "granted") return;
    if ((await handle.requestPermission(opts)) !== "granted") {
      throw new Error("Permiso de escritura denegado.");
    }
  }

  async function readText(relativePath) {
    if (!dirHandle) throw new Error("No hay carpeta conectada.");
    const fh = await resolveFileHandle(relativePath, false);
    const file = await fh.getFile();
    return file.text();
  }

  async function writeText(relativePath, content) {
    if (!dirHandle) throw new Error("No hay carpeta conectada.");
    const fh = await resolveFileHandle(relativePath, true);
    await ensureWritePermission(fh);
    const writable = await fh.createWritable();
    await writable.write(content);
    await writable.close();
  }

  // Descarga un archivo de texto (fallback para navegadores sin la API,
  // o para revisar el contenido antes de tener carpeta conectada).
  function downloadText(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ----------------------------------------------------------------
     Bracket-matching: ubica "marker" en el texto fuente y devuelve
     {start, end} del arreglo/objeto que abre justo después del marker
     (incluye el delimitador de apertura y su cierre correspondiente),
     respetando cadenas de texto (comillas simples/dobles con escapes).
     ---------------------------------------------------------------- */
  function findBalancedRegion(source, marker) {
    const markerIdx = source.indexOf(marker);
    if (markerIdx < 0) return null;
    const openIdx = markerIdx + marker.length - 1; // último char del marker = [ o {
    const open = source[openIdx];
    const close = open === "[" ? "]" : "}";
    if (open !== "[" && open !== "{") return null;
    let depth = 0, i = openIdx, inStr = null;
    for (; i < source.length; i++) {
      const c = source[i];
      if (inStr) {
        if (c === "\\") { i++; continue; }
        if (c === inStr) inStr = null;
        continue;
      }
      if (c === '"' || c === "'") { inStr = c; continue; }
      if (c === open) depth++;
      else if (c === close) { depth--; if (depth === 0) break; }
    }
    if (depth !== 0) return null;
    return { start: openIdx, end: i }; // incluye ambos delimitadores
  }

  // Sustituye solo el tramo balanceado que sigue a "marker" por newBody
  // (newBody debe incluir sus propios delimitadores [...] o {...}).
  function replaceArrayLiteral(source, marker, newBody) {
    const region = findBalancedRegion(source, marker);
    if (!region) throw new Error('No se encontró "' + marker + '" en el archivo.');
    return source.slice(0, region.start) + newBody + source.slice(region.end + 1);
  }

  // ---- Serializadores (pretty-print sencillo, 2 espacios) ----------
  function jsStr(v) { return JSON.stringify(v == null ? "" : v); }

  function serializeAdvisors(list) {
    const rows = (list || []).map(a =>
      "  { id: " + jsStr(a.id) + ", name: " + jsStr(a.name) + ", email: " + jsStr(a.email) + ", phone: " + jsStr(a.phone) + " }"
    );
    return "[\n" + rows.join(",\n") + "\n]";
  }

  function serializeValue(v, indent) {
    const pad = "  ".repeat(indent);
    const padIn = "  ".repeat(indent + 1);
    if (Array.isArray(v)) {
      if (!v.length) return "[]";
      const items = v.map(x => padIn + serializeValue(x, indent + 1));
      return "[\n" + items.join(",\n") + "\n" + pad + "]";
    }
    if (v && typeof v === "object") {
      const keys = Object.keys(v);
      if (!keys.length) return "{}";
      const items = keys.map(k => padIn + k + ": " + serializeValue(v[k], indent + 1));
      return "{\n" + items.join(",\n") + "\n" + pad + "}";
    }
    if (typeof v === "string") return jsStr(v);
    if (v == null) return "null";
    return String(v);
  }

  function serializePromotions(list) {
    if (!list || !list.length) return "[\n\n]";
    const items = (list || []).map(p => "  " + serializeValue(p, 1));
    return "[\n" + items.join(",\n\n") + "\n\n]";
  }

  function serializeProductOverrides(obj) {
    return serializeValue(obj || {}, 0);
  }

  return {
    isSupported, isConnected, connect, disconnect, folderName,
    readText, writeText, downloadText,
    replaceArrayLiteral, serializeAdvisors, serializePromotions, serializeProductOverrides
  };
})();
