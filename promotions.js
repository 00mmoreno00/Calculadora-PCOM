/* ============================================================
   promotions.js — CATÁLOGO DE PROMOCIONES (editable cada mes).
   NO tocar el motor de cálculo para cambiar promos: editar aquí,
   o usar el modo admin (?admin=true) que guarda en localStorage.
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
      requiredProducts: null,
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
    active: false,
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

/* ============================================================
   Override visual del admin de productos: topes por zona con
   selector de estado + chips. Evita el temblor marcando el bloque
   original como anchor y dejando de depender del texto del label.
   ============================================================ */
(function () {
  "use strict";

  const LS_KEY = "pc_product_config_v1";
  const ZONES = [
    { id: "FULLPRICE", label: "FullPrice" },
    { id: "CDMX_EDOMEX", label: "CDMX / EdoMex" },
    { id: "JALISCO_NL", label: "Jalisco / Nuevo León" },
    { id: "QUERETARO", label: "Querétaro" },
    { id: "RESTO", label: "Resto del país" }
  ];

  function getStates() {
    return (window.PC && window.PC.config && window.PC.config.states) ? window.PC.config.states : [];
  }

  function defaultStatesForZone(zoneId) {
    const all = getStates();
    if (zoneId === "FULLPRICE") return [];
    if (zoneId === "CDMX_EDOMEX") return ["Ciudad de México", "Estado de México"];
    if (zoneId === "JALISCO_NL") return ["Jalisco", "Nuevo León"];
    if (zoneId === "QUERETARO") return ["Querétaro"];
    if (zoneId === "RESTO") return all.filter(st => ["Ciudad de México", "Estado de México", "Jalisco", "Nuevo León", "Querétaro"].indexOf(st) < 0);
    return [];
  }

  function readOverrides() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
    catch (e) { return {}; }
  }

  function writeOverrides(overrides) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(overrides)); } catch (e) { }
  }

  function defaultPolicy(fallbackCap) {
    const byZone = {};
    ZONES.forEach(z => {
      byZone[z.id] = {
        discountCapPct: z.id === "FULLPRICE" ? 0 : Number(fallbackCap || 0),
        active: false,
        states: defaultStatesForZone(z.id)
      };
    });
    return { mode: "byZone", sameCapForAllZones: false, byZone };
  }

  function normalizePolicy(policy, fallbackCap) {
    const base = defaultPolicy(fallbackCap);
    const raw = policy && typeof policy === "object" ? (policy.byZone || policy.zones || {}) : {};
    ZONES.forEach(z => {
      const src = raw[z.id] || {};
      base.byZone[z.id] = {
        discountCapPct: src.discountCapPct != null ? Number(src.discountCapPct) : (src.capPct != null ? Number(src.capPct) : base.byZone[z.id].discountCapPct),
        active: src.active === true,
        states: Array.isArray(src.states) ? src.states : base.byZone[z.id].states
      };
    });
    base.sameCapForAllZones = policy && policy.sameCapForAllZones === true;
    return base;
  }

  function hasActiveZones(policy) {
    return !!(policy && policy.byZone && Object.keys(policy.byZone).some(k => policy.byZone[k] && policy.byZone[k].active));
  }

  function findLabel(root, labelText) {
    return Array.from(root.querySelectorAll("label")).find(l => (l.textContent || "").trim().toLowerCase() === labelText.toLowerCase());
  }

  function findBlockFromLabel(label) {
    let node = label;
    for (let i = 0; i < 5 && node; i += 1) {
      if (node.parentElement && node.parentElement.querySelector("input,select,textarea")) return node.parentElement;
      node = node.parentElement;
    }
    return label ? label.parentElement : null;
  }

  function getAnchorBlock() {
    const existing = document.querySelector("[data-zone-discount-anchor='true']");
    if (existing) return existing;

    const oldLabel = findLabel(document, "Aplica en estado (vacío = todos los estados)");
    if (!oldLabel) return null;
    const block = findBlockFromLabel(oldLabel);
    if (!block) return null;

    block.setAttribute("data-zone-discount-anchor", "true");
    oldLabel.textContent = "Configuración de estados por zona";
    block.style.display = "none";
    return block;
  }

  function getProductId(root) {
    const nameLabel = findLabel(root, "Nombre del producto");
    const nameBlock = nameLabel && findBlockFromLabel(nameLabel);
    const nameInput = nameBlock && nameBlock.querySelector("input");
    const name = nameInput ? nameInput.value : "";
    const meta = window.PC && window.PC.config && window.PC.config.productMeta ? window.PC.config.productMeta : {};
    const direct = Object.keys(meta).find(id => meta[id].name === name);
    if (direct) return direct;
    const overrides = readOverrides();
    return Object.keys(overrides).find(id => overrides[id] && overrides[id].name === name) || null;
  }

  function getGlobalCap(root) {
    const label = findLabel(root, "Tope descuento %");
    const block = label && findBlockFromLabel(label);
    const input = block && block.querySelector("input");
    return input ? Number(input.value || 0) : 0;
  }

  function savePolicy(productId, policy) {
    const overrides = readOverrides();
    overrides[productId] = Object.assign({}, overrides[productId] || {}, { discountPolicy: policy });
    writeOverrides(overrides);
  }

  function applyGlobalCapState(root, active) {
    const globalLabel = findLabel(root, "Tope descuento %");
    if (!globalLabel) return;
    const block = findBlockFromLabel(globalLabel);
    const input = block && block.querySelector("input");
    if (input) {
      input.disabled = active;
      input.style.background = active ? "#F3F4F6" : "#fff";
      input.style.color = active ? "#8A8A93" : "#111";
      input.style.cursor = active ? "not-allowed" : "text";
    }
    let note = block.querySelector("[data-zone-cap-note-final]") || block.querySelector("[data-zone-cap-note]") || block.querySelector("[data-zone-cap-note-v2]");
    if (active && !note) {
      note = document.createElement("div");
      note.setAttribute("data-zone-cap-note-final", "true");
      note.style.cssText = "margin-top:5px;font:600 10.5px/1.35 Nunito;color:#6B6B73";
      note.textContent = "ⓘ Se habilita solo si no hay zonas configuradas.";
      block.appendChild(note);
    }
    if (!active && note) note.remove();
  }

  function addChip(container, stateName, onRemove) {
    const chip = document.createElement("span");
    chip.style.cssText = "display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:999px;background:#EAF7F0;border:1px solid #C3E7D2;color:#146b3d;font:700 11px Nunito";
    chip.appendChild(document.createTextNode(stateName));
    const x = document.createElement("button");
    x.type = "button";
    x.textContent = "×";
    x.style.cssText = "border:none;background:transparent;color:#146b3d;font:900 13px Nunito;line-height:1;cursor:pointer;padding:0";
    x.onclick = onRemove;
    chip.appendChild(x);
    container.appendChild(chip);
  }

  function renderEditor(root, productId, anchorBlock) {
    const overrides = readOverrides();
    const globalCap = getGlobalCap(root);
    const policy = normalizePolicy((overrides[productId] || {}).discountPolicy, globalCap);
    const active = hasActiveZones(policy);

    applyGlobalCapState(root, active);
    anchorBlock.style.display = "none";
    Array.from(root.querySelectorAll("[data-zone-discount-editor],[data-zone-discount-editor-v2],[data-zone-discount-editor-final]")).forEach(el => el.remove());

    const editor = document.createElement("div");
    editor.setAttribute("data-zone-discount-editor-final", "true");
    editor.style.cssText = "margin-bottom:12px;border:1px solid #E6E6EB;border-radius:10px;padding:14px;background:#fff";

    const header = document.createElement("div");
    header.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px";
    header.innerHTML = '<div><label style="font:600 10px Nunito;text-transform:uppercase;letter-spacing:.06em;color:#6B6B73;margin-bottom:4px;display:block">Tope de descuento por zona</label><div style="font:500 10.8px/1.35 Nunito;color:#6B6B73">Elige un estado del listado; se agregará como etiqueta en la cajita.</div></div>';

    const enableBtn = document.createElement("button");
    enableBtn.type = "button";
    enableBtn.textContent = "⚙ Configurar topes por zona";
    enableBtn.style.cssText = "padding:7px 11px;border-radius:7px;border:1px solid #1b8f51;background:#EAF7F0;color:#146b3d;font:800 12px Nunito;cursor:pointer";
    enableBtn.onclick = function () {
      ZONES.forEach(z => {
        policy.byZone[z.id].active = true;
        if (!Array.isArray(policy.byZone[z.id].states)) policy.byZone[z.id].states = defaultStatesForZone(z.id);
        if (policy.byZone[z.id].discountCapPct == null || policy.byZone[z.id].discountCapPct === "") {
          policy.byZone[z.id].discountCapPct = z.id === "FULLPRICE" ? 0 : globalCap;
        }
      });
      savePolicy(productId, policy);
      patchAdminFinal();
    };
    header.appendChild(enableBtn);
    editor.appendChild(header);

    const sameLabel = document.createElement("label");
    sameLabel.style.cssText = "display:flex;align-items:center;gap:8px;font:700 12px Nunito;color:#2A2A2E;margin-bottom:10px";
    const same = document.createElement("input");
    same.type = "checkbox";
    same.checked = policy.sameCapForAllZones === true;
    same.onchange = function () {
      policy.sameCapForAllZones = same.checked;
      if (same.checked) {
        const activeZone = Object.keys(policy.byZone).find(k => policy.byZone[k].active && policy.byZone[k].discountCapPct != null);
        const cap = Number(activeZone ? policy.byZone[activeZone].discountCapPct : globalCap || 0);
        ZONES.forEach(z => {
          policy.byZone[z.id].active = true;
          policy.byZone[z.id].discountCapPct = z.id === "FULLPRICE" ? 0 : cap;
        });
      }
      savePolicy(productId, policy);
      patchAdminFinal();
    };
    sameLabel.appendChild(same);
    sameLabel.appendChild(document.createTextNode("Usar el mismo tope para todas las zonas"));
    editor.appendChild(sameLabel);

    const table = document.createElement("div");
    table.style.cssText = "border:1px solid #E6E6EB;border-radius:9px;overflow:hidden;margin-bottom:10px";
    table.innerHTML = '<div style="display:grid;grid-template-columns:1.9fr 145px 80px;gap:10px;align-items:center;padding:9px 12px;background:#F7F7F9;font:800 10px Nunito;color:#6B6B73;text-transform:uppercase;letter-spacing:.06em"><div>Zona / Estados</div><div>Tope descuento %</div><div style="text-align:center">Activo</div></div>';

    ZONES.forEach(z => {
      const row = document.createElement("div");
      row.style.cssText = "display:grid;grid-template-columns:1.9fr 145px 80px;gap:10px;align-items:start;padding:10px 12px;border-top:1px solid #E6E6EB";

      const zdata = policy.byZone[z.id];
      const zoneWrap = document.createElement("div");
      const name = document.createElement("div");
      name.textContent = z.label;
      name.style.cssText = "font:800 12px Nunito;color:#2A2A2E;margin-bottom:6px";

      const addRow = document.createElement("div");
      addRow.style.cssText = "display:flex;gap:6px;margin-bottom:7px";
      const select = document.createElement("select");
      select.style.cssText = "flex:1;padding:7px 9px;border:1px solid #D0D0D8;border-radius:7px;font-size:12px;font-family:Nunito;background:#fff";
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Agregar estado...";
      select.appendChild(placeholder);
      getStates().filter(st => (zdata.states || []).indexOf(st) < 0).forEach(st => {
        const opt = document.createElement("option");
        opt.value = st;
        opt.textContent = st;
        select.appendChild(opt);
      });
      select.onchange = function () {
        if (!select.value) return;
        zdata.states = Array.isArray(zdata.states) ? zdata.states : [];
        if (zdata.states.indexOf(select.value) < 0) zdata.states.push(select.value);
        savePolicy(productId, policy);
        patchAdminFinal();
      };
      addRow.appendChild(select);

      const chipsBox = document.createElement("div");
      chipsBox.style.cssText = "min-height:38px;border:1px solid #D0D0D8;border-radius:8px;background:#FAFAFB;padding:7px;display:flex;flex-wrap:wrap;gap:6px";
      const selected = Array.isArray(zdata.states) ? zdata.states : [];
      if (!selected.length) {
        const empty = document.createElement("span");
        empty.textContent = "Sin estados seleccionados";
        empty.style.cssText = "font:600 11px Nunito;color:#A5A5AD";
        chipsBox.appendChild(empty);
      } else {
        selected.forEach(st => addChip(chipsBox, st, function () {
          zdata.states = selected.filter(x => x !== st);
          savePolicy(productId, policy);
          patchAdminFinal();
        }));
      }

      zoneWrap.appendChild(name);
      zoneWrap.appendChild(addRow);
      zoneWrap.appendChild(chipsBox);

      const cap = document.createElement("input");
      cap.type = "number";
      cap.min = "0";
      cap.max = "100";
      cap.value = zdata.discountCapPct;
      cap.style.cssText = "padding:7px 9px;border:1px solid #D0D0D8;border-radius:7px;font-size:13px;width:100%;font-family:Nunito";
      cap.onchange = function () {
        const val = Math.min(100, Math.max(0, Number(cap.value || 0)));
        if (policy.sameCapForAllZones && z.id !== "FULLPRICE") {
          ZONES.forEach(zz => { if (zz.id !== "FULLPRICE") policy.byZone[zz.id].discountCapPct = val; });
        } else {
          zdata.discountCapPct = val;
        }
        savePolicy(productId, policy);
        patchAdminFinal();
      };

      const activeLabel = document.createElement("label");
      activeLabel.style.cssText = "display:flex;justify-content:center;align-items:center;gap:6px;font:600 11px Nunito;color:#6B6B73;padding-top:7px";
      const activeInput = document.createElement("input");
      activeInput.type = "checkbox";
      activeInput.checked = zdata.active === true;
      activeInput.onchange = function () {
        zdata.active = activeInput.checked;
        savePolicy(productId, policy);
        patchAdminFinal();
      };
      activeLabel.appendChild(activeInput);
      activeLabel.appendChild(document.createTextNode("Activo"));

      row.appendChild(zoneWrap);
      row.appendChild(cap);
      row.appendChild(activeLabel);
      table.appendChild(row);
    });

    editor.appendChild(table);

    const info = document.createElement("div");
    info.style.cssText = "padding:8px 10px;border-radius:8px;background:#EEF4FF;border:1px solid #C4D6F6;color:#1B4F9E;font:600 11px/1.4 Nunito";
    info.textContent = "ⓘ Los estados elegidos se guardan en discountPolicy.byZone. Si hay zonas activas, estos topes reemplazan el tope general del producto.";
    editor.appendChild(info);

    anchorBlock.parentElement.insertBefore(editor, anchorBlock);
  }

  function patchAdminFinal() {
    const anchor = getAnchorBlock();
    if (!anchor) return;
    const modal = anchor.closest("div[style*='overflow']") || document.body;
    const productId = getProductId(modal);
    if (!productId) return;
    renderEditor(modal, productId, anchor);
  }

  const start = function () { setInterval(patchAdminFinal, 700); setTimeout(patchAdminFinal, 120); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
