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
   Override visual del admin de productos: topes por zona.
   UI final: zonas dinámicas, selector de estado + chips,
   botón eliminar y botón Agregar zona.
   ============================================================ */
(function () {
  "use strict";

  const LS_KEY = "pc_product_config_v1";
  const LEGACY_ZONES = [
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

  function uid() {
    return "zona_" + Math.random().toString(36).slice(2, 8);
  }

  function fromLegacyByZone(policy) {
    const raw = policy && typeof policy === "object" ? (policy.byZone || policy.zones || {}) : {};
    const rows = [];
    LEGACY_ZONES.forEach(z => {
      const src = raw[z.id];
      if (!src || src.active !== true) return;
      rows.push({
        id: z.id,
        label: z.label,
        discountCapPct: src.discountCapPct != null ? Number(src.discountCapPct) : (src.capPct != null ? Number(src.capPct) : 0),
        states: Array.isArray(src.states) ? src.states : defaultStatesForZone(z.id)
      });
    });
    return rows;
  }

  function normalizePolicy(policy, fallbackCap) {
    const p = policy && typeof policy === "object" ? policy : {};
    let zoneRules = [];

    if (Array.isArray(p.zoneRules)) {
      zoneRules = p.zoneRules.map((r, idx) => ({
        id: r.id || uid(),
        label: r.label || ("Zona " + (idx + 1)),
        discountCapPct: r.discountCapPct != null ? Number(r.discountCapPct) : Number(fallbackCap || 0),
        states: Array.isArray(r.states) ? r.states : []
      }));
    } else {
      zoneRules = fromLegacyByZone(p);
    }

    return {
      mode: "byStateZones",
      sameCapForAllZones: p.sameCapForAllZones === true,
      zoneRules: zoneRules
    };
  }

  function hasConfiguredZones(policy) {
    return !!(policy && Array.isArray(policy.zoneRules) && policy.zoneRules.length > 0);
  }

  function toLegacyMirror(policy) {
    const byZone = {};
    (policy.zoneRules || []).forEach(rule => {
      byZone[rule.id] = {
        active: true,
        discountCapPct: Number(rule.discountCapPct || 0),
        states: Array.isArray(rule.states) ? rule.states : [],
        label: rule.label || "Zona"
      };
    });
    return byZone;
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
    const normalized = Object.assign({}, policy, { byZone: toLegacyMirror(policy) });
    const overrides = readOverrides();
    overrides[productId] = Object.assign({}, overrides[productId] || {}, { discountPolicy: normalized });
    writeOverrides(overrides);
  }

  function applyGlobalCapState(root, disabled) {
    const globalLabel = findLabel(root, "Tope descuento %");
    if (!globalLabel) return;

    const block = findBlockFromLabel(globalLabel);
    const input = block && block.querySelector("input");

    if (input) {
      input.disabled = disabled;
      input.style.background = disabled ? "#F3F4F6" : "#fff";
      input.style.color = disabled ? "#8A8A93" : "#111";
      input.style.cursor = disabled ? "not-allowed" : "text";
    }

    let note = block.querySelector("[data-zone-cap-note-final]") || block.querySelector("[data-zone-cap-note]") || block.querySelector("[data-zone-cap-note-v2]");
    if (disabled && !note) {
      note = document.createElement("div");
      note.setAttribute("data-zone-cap-note-final", "true");
      note.style.cssText = "margin-top:5px;font:600 10.5px/1.35 Nunito;color:#6B6B73";
      note.textContent = "ⓘ Se habilita solo si no hay zonas configuradas.";
      block.appendChild(note);
    }
    if (!disabled && note) note.remove();
  }

  function usedStates(policy, exceptRuleId) {
    const used = [];
    (policy.zoneRules || []).forEach(rule => {
      if (rule.id === exceptRuleId) return;
      (rule.states || []).forEach(st => used.push(st));
    });
    return used;
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

  function renderEditor(root, productId, anchorBlock, stamp) {
    const overrides = readOverrides();
    const globalCap = getGlobalCap(root);
    const policy = normalizePolicy((overrides[productId] || {}).discountPolicy, globalCap);
    const hasZones = hasConfiguredZones(policy);

    applyGlobalCapState(root, hasZones);
    anchorBlock.style.display = "none";

    Array.from(root.querySelectorAll("[data-zone-discount-editor],[data-zone-discount-editor-v2],[data-zone-discount-editor-final]")).forEach(el => el.remove());

    const editor = document.createElement("div");
    editor.setAttribute("data-zone-discount-editor-final", "true");
    editor.setAttribute("data-product-id", productId);
    editor.setAttribute("data-stamp", stamp);
    editor.style.cssText = "margin-bottom:12px;border:1px solid #E6E6EB;border-radius:10px;padding:14px;background:#fff";

    const header = document.createElement("div");
    header.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px";
    header.innerHTML = '<div><label style="font:600 10px Nunito;text-transform:uppercase;letter-spacing:.06em;color:#6B6B73;margin-bottom:4px;display:block">Tope de descuento por zona</label><div style="font:500 10.8px/1.35 Nunito;color:#6B6B73">Crea las zonas que necesites, asigna estados y define su tope de descuento.</div></div>';

    const addZoneBtn = document.createElement("button");
    addZoneBtn.type = "button";
    addZoneBtn.textContent = "+ Agregar zona";
    addZoneBtn.style.cssText = "padding:7px 11px;border-radius:7px;border:1px solid #1b8f51;background:#EAF7F0;color:#146b3d;font:800 12px Nunito;cursor:pointer;white-space:nowrap";
    addZoneBtn.onclick = function () {
      policy.zoneRules.push({ id: uid(), label: "Nueva zona", discountCapPct: Number(globalCap || 0), states: [] });
      savePolicy(productId, policy);
      patchAdminFinal(true);
    };
    header.appendChild(addZoneBtn);
    editor.appendChild(header);

    const sameLabel = document.createElement("label");
    sameLabel.style.cssText = "display:flex;align-items:center;gap:8px;font:700 12px Nunito;color:#2A2A2E;margin-bottom:10px";
    const same = document.createElement("input");
    same.type = "checkbox";
    same.checked = policy.sameCapForAllZones === true;
    same.onchange = function () {
      policy.sameCapForAllZones = same.checked;
      if (same.checked) {
        const cap = policy.zoneRules.length ? Number(policy.zoneRules[0].discountCapPct || 0) : Number(globalCap || 0);
        policy.zoneRules.forEach(rule => { rule.discountCapPct = cap; });
      }
      savePolicy(productId, policy);
      patchAdminFinal(true);
    };
    sameLabel.appendChild(same);
    sameLabel.appendChild(document.createTextNode("Usar el mismo tope para todas las zonas"));
    editor.appendChild(sameLabel);

    if (!policy.zoneRules.length) {
      const empty = document.createElement("div");
      empty.style.cssText = "border:1px dashed #C3E7D2;border-radius:9px;background:#F6FBF8;padding:14px;color:#146b3d;font:700 12px Nunito;margin-bottom:10px";
      empty.textContent = "No hay zonas configuradas. Usa “Agregar zona” para crear la primera.";
      editor.appendChild(empty);
    } else {
      const table = document.createElement("div");
      table.style.cssText = "border:1px solid #E6E6EB;border-radius:9px;overflow:hidden;margin-bottom:10px";
      table.innerHTML = '<div style="display:grid;grid-template-columns:1.9fr 145px 86px;gap:10px;align-items:center;padding:9px 12px;background:#F7F7F9;font:800 10px Nunito;color:#6B6B73;text-transform:uppercase;letter-spacing:.06em"><div>Zona / Estados</div><div>Tope descuento %</div><div style="text-align:center">Acción</div></div>';

      policy.zoneRules.forEach(rule => {
        const row = document.createElement("div");
        row.style.cssText = "display:grid;grid-template-columns:1.9fr 145px 86px;gap:10px;align-items:start;padding:10px 12px;border-top:1px solid #E6E6EB";

        const zoneWrap = document.createElement("div");

        const nameInput = document.createElement("input");
        nameInput.value = rule.label || "";
        nameInput.placeholder = "Nombre de zona";
        nameInput.style.cssText = "width:100%;padding:7px 9px;border:1px solid #D0D0D8;border-radius:7px;font:800 12px Nunito;color:#2A2A2E;margin-bottom:7px";
        nameInput.onchange = function () {
          rule.label = nameInput.value.trim() || "Nueva zona";
          savePolicy(productId, policy);
          patchAdminFinal(true);
        };

        const addRow = document.createElement("div");
        addRow.style.cssText = "display:flex;gap:6px;margin-bottom:7px";
        const select = document.createElement("select");
        select.style.cssText = "flex:1;padding:7px 9px;border:1px solid #D0D0D8;border-radius:7px;font-size:12px;font-family:Nunito;background:#fff";
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Agregar estado...";
        select.appendChild(placeholder);

        const alreadyUsed = usedStates(policy, rule.id);
        const availableStates = getStates().filter(st => (rule.states || []).indexOf(st) < 0 && alreadyUsed.indexOf(st) < 0);
        availableStates.forEach(st => {
          const opt = document.createElement("option");
          opt.value = st;
          opt.textContent = st;
          select.appendChild(opt);
        });
        if (!availableStates.length) {
          const opt = document.createElement("option");
          opt.value = "";
          opt.textContent = "Todos los estados ya fueron agregados";
          select.appendChild(opt);
        }
        select.onchange = function () {
          if (!select.value) return;
          rule.states = Array.isArray(rule.states) ? rule.states : [];
          if (rule.states.indexOf(select.value) < 0) rule.states.push(select.value);
          savePolicy(productId, policy);
          patchAdminFinal(true);
        };
        addRow.appendChild(select);

        const chipsBox = document.createElement("div");
        chipsBox.style.cssText = "min-height:38px;border:1px solid #D0D0D8;border-radius:8px;background:#FAFAFB;padding:7px;display:flex;flex-wrap:wrap;gap:6px";
        const selected = Array.isArray(rule.states) ? rule.states : [];
        selected.forEach(st => addChip(chipsBox, st, function () {
          rule.states = selected.filter(x => x !== st);
          savePolicy(productId, policy);
          patchAdminFinal(true);
        }));

        zoneWrap.appendChild(nameInput);
        zoneWrap.appendChild(addRow);
        zoneWrap.appendChild(chipsBox);

        const cap = document.createElement("input");
        cap.type = "number";
        cap.min = "0";
        cap.max = "100";
        cap.value = rule.discountCapPct;
        cap.style.cssText = "padding:7px 9px;border:1px solid #D0D0D8;border-radius:7px;font-size:13px;width:100%;font-family:Nunito";
        cap.onchange = function () {
          const val = Math.min(100, Math.max(0, Number(cap.value || 0)));
          if (policy.sameCapForAllZones) {
            policy.zoneRules.forEach(r => { r.discountCapPct = val; });
          } else {
            rule.discountCapPct = val;
          }
          savePolicy(productId, policy);
          patchAdminFinal(true);
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.textContent = "Eliminar";
        deleteBtn.style.cssText = "width:100%;padding:8px 9px;border-radius:7px;border:1px solid #EBB;background:#FBEAEA;color:#B02A30;font:800 11px Nunito;cursor:pointer";
        deleteBtn.onclick = function () {
          policy.zoneRules = policy.zoneRules.filter(r => r.id !== rule.id);
          savePolicy(productId, policy);
          patchAdminFinal(true);
        };

        row.appendChild(zoneWrap);
        row.appendChild(cap);
        row.appendChild(deleteBtn);
        table.appendChild(row);
      });

      editor.appendChild(table);
    }

    const info = document.createElement("div");
    info.style.cssText = "padding:8px 10px;border-radius:8px;background:#EEF4FF;border:1px solid #C4D6F6;color:#1B4F9E;font:600 11px/1.4 Nunito";
    info.textContent = "ⓘ Si hay zonas configuradas, estos topes reemplazan el tope general del producto. Los estados ya asignados no aparecen en otros selectores.";
    editor.appendChild(info);

    anchorBlock.parentElement.insertBefore(editor, anchorBlock);
  }

  function currentStamp(productId, globalCap) {
    const overrides = readOverrides();
    const policy = normalizePolicy((overrides[productId] || {}).discountPolicy, globalCap);
    return productId + "::" + globalCap + "::" + JSON.stringify(policy);
  }

  function patchAdminFinal(force) {
    const anchor = getAnchorBlock();
    if (!anchor) return;

    const modal = anchor.closest("div[style*='overflow']") || document.body;
    const productId = getProductId(modal);
    if (!productId) return;

    const globalCap = getGlobalCap(modal);
    const stamp = currentStamp(productId, globalCap);
    const existing = modal.querySelector("[data-zone-discount-editor-final]");

    if (!force && existing && existing.getAttribute("data-product-id") === productId && existing.getAttribute("data-stamp") === stamp) {
      const overrides = readOverrides();
      const policy = normalizePolicy((overrides[productId] || {}).discountPolicy, globalCap);
      applyGlobalCapState(modal, hasConfiguredZones(policy));
      return;
    }

    renderEditor(modal, productId, anchor, stamp);
  }

  function neutralizeOldPatch() {
    const oldLabel = findLabel(document, "Aplica en estado (vacío = todos los estados)");
    if (!oldLabel) return;
    const block = findBlockFromLabel(oldLabel);
    if (!block) return;
    block.setAttribute("data-zone-discount-anchor", "true");
    oldLabel.textContent = "Configuración de estados por zona";
    block.style.display = "none";
  }

  const start = function () {
    setInterval(neutralizeOldPatch, 100);
    setInterval(function () { patchAdminFinal(false); }, 500);
    setTimeout(function () { patchAdminFinal(true); }, 120);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
