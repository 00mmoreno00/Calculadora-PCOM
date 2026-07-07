/* ============================================================
   promotions.js — CATÁLOGO DE PROMOCIONES (editable cada mes).
   NO tocar el motor de cálculo para cambiar promos: editar aquí,
   o usar el modo admin (?admin=true) que guarda en localStorage.
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
   selector multiestado. Se ejecuta después del patch anterior y
   guarda en localStorage.pc_product_config_v1 -> discountPolicy.
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

  function states() {
    return (window.PC && window.PC.config && window.PC.config.states) ? window.PC.config.states : [];
  }

  function defaultStatesForZone(zoneId) {
    const all = states();
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

  function selectedOptions(select) {
    return Array.from(select.options).filter(o => o.selected).map(o => o.value);
  }

  function renderEditor(root, productId, stateBlock) {
    if (!productId || !stateBlock) return;

    const overrides = readOverrides();
    const globalCap = getGlobalCap(root);
    const current = overrides[productId] || {};
    const policy = normalizePolicy(current.discountPolicy, globalCap);
    const active = hasActiveZones(policy);

    const globalLabel = findLabel(root, "Tope descuento %");
    if (globalLabel) {
      const block = findBlockFromLabel(globalLabel);
      const input = block && block.querySelector("input");
      if (input) {
        input.disabled = active;
        input.style.background = active ? "#F3F4F6" : "#fff";
        input.style.color = active ? "#8A8A93" : "#111";
        input.style.cursor = active ? "not-allowed" : "text";
      }
      let note = block.querySelector("[data-zone-cap-note-v2]") || block.querySelector("[data-zone-cap-note]");
      if (active && !note) {
        note = document.createElement("div");
        note.setAttribute("data-zone-cap-note-v2", "true");
        note.style.cssText = "margin-top:5px;font:600 10.5px/1.35 Nunito;color:#6B6B73;display:flex;gap:5px;align-items:center";
        note.textContent = "ⓘ Se habilita solo si no hay zonas configuradas.";
        block.appendChild(note);
      }
      if (!active && note) note.remove();
    }

    stateBlock.style.display = "none";
    Array.from(root.querySelectorAll("[data-zone-discount-editor],[data-zone-discount-editor-v2]")).forEach(el => el.remove());

    const editor = document.createElement("div");
    editor.setAttribute("data-zone-discount-editor-v2", "true");
    editor.style.cssText = "margin-bottom:12px;border:1px solid #E6E6EB;border-radius:10px;padding:14px;background:#fff";

    const header = document.createElement("div");
    header.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px";
    header.innerHTML = '<div><label style="font:600 10px Nunito;text-transform:uppercase;letter-spacing:.06em;color:#6B6B73;margin-bottom:4px;display:block">Tope de descuento por zona</label><div style="font:500 10.8px/1.35 Nunito;color:#6B6B73">Elige uno o varios estados para cada zona y define su tope.</div></div>';

    const enableBtn = document.createElement("button");
    enableBtn.type = "button";
    enableBtn.textContent = "⚙ Configurar topes por zona";
    enableBtn.style.cssText = "padding:7px 11px;border-radius:7px;border:1px solid #1b8f51;background:#EAF7F0;color:#146b3d;font:800 12px Nunito;cursor:pointer";
    enableBtn.onclick = function () {
      ZONES.forEach(z => {
        policy.byZone[z.id].active = true;
        if (policy.byZone[z.id].discountCapPct == null || policy.byZone[z.id].discountCapPct === "") {
          policy.byZone[z.id].discountCapPct = z.id === "FULLPRICE" ? 0 : globalCap;
        }
        if (!Array.isArray(policy.byZone[z.id].states)) policy.byZone[z.id].states = defaultStatesForZone(z.id);
      });
      savePolicy(productId, policy);
      patchAdminStateSelectors();
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
      patchAdminStateSelectors();
    };
    sameLabel.appendChild(same);
    sameLabel.appendChild(document.createTextNode("Usar el mismo tope para todas las zonas"));
    editor.appendChild(sameLabel);

    const table = document.createElement("div");
    table.style.cssText = "border:1px solid #E6E6EB;border-radius:9px;overflow:hidden;margin-bottom:10px";
    table.innerHTML = '<div style="display:grid;grid-template-columns:1.75fr 150px 80px;gap:10px;align-items:center;padding:9px 12px;background:#F7F7F9;font:800 10px Nunito;color:#6B6B73;text-transform:uppercase;letter-spacing:.06em"><div>Zona / Estados</div><div>Tope descuento %</div><div style="text-align:center">Activo</div></div>';

    ZONES.forEach(z => {
      const row = document.createElement("div");
      row.style.cssText = "display:grid;grid-template-columns:1.75fr 150px 80px;gap:10px;align-items:center;padding:10px 12px;border-top:1px solid #E6E6EB";

      const zoneWrap = document.createElement("div");
      const name = document.createElement("div");
      name.textContent = z.label;
      name.style.cssText = "font:800 12px Nunito;color:#2A2A2E;margin-bottom:5px";

      const select = document.createElement("select");
      select.multiple = true;
      select.size = 4;
      select.title = "Ctrl/Cmd + clic para seleccionar varios estados";
      select.style.cssText = "padding:6px 8px;border:1px solid #D0D0D8;border-radius:7px;font-size:12px;width:100%;font-family:Nunito;background:#fff;min-height:92px";
      states().forEach(st => {
        const opt = document.createElement("option");
        opt.value = st;
        opt.textContent = st;
        opt.selected = (policy.byZone[z.id].states || []).indexOf(st) >= 0;
        select.appendChild(opt);
      });
      select.onchange = function () {
        policy.byZone[z.id].states = selectedOptions(select);
        savePolicy(productId, policy);
      };

      const hint = document.createElement("div");
      const count = (policy.byZone[z.id].states || []).length;
      hint.textContent = count ? (count + " estado(s) seleccionado(s)") : "Sin estados seleccionados";
      hint.style.cssText = "font:600 10px Nunito;color:#8A8A93;margin-top:4px";

      zoneWrap.appendChild(name);
      zoneWrap.appendChild(select);
      zoneWrap.appendChild(hint);

      const cap = document.createElement("input");
      cap.type = "number";
      cap.min = "0";
      cap.max = "100";
      cap.value = policy.byZone[z.id].discountCapPct;
      cap.style.cssText = "padding:7px 9px;border:1px solid #D0D0D8;border-radius:7px;font-size:13px;width:100%;font-family:Nunito";
      cap.onchange = function () {
        const val = Math.min(100, Math.max(0, Number(cap.value || 0)));
        if (policy.sameCapForAllZones && z.id !== "FULLPRICE") {
          ZONES.forEach(zz => { if (zz.id !== "FULLPRICE") policy.byZone[zz.id].discountCapPct = val; });
        } else {
          policy.byZone[z.id].discountCapPct = val;
        }
        savePolicy(productId, policy);
        patchAdminStateSelectors();
      };

      const activeLabel = document.createElement("label");
      activeLabel.style.cssText = "display:flex;justify-content:center;align-items:center;gap:6px;font:600 11px Nunito;color:#6B6B73";
      const activeInput = document.createElement("input");
      activeInput.type = "checkbox";
      activeInput.checked = policy.byZone[z.id].active === true;
      activeInput.onchange = function () {
        policy.byZone[z.id].active = activeInput.checked;
        savePolicy(productId, policy);
        patchAdminStateSelectors();
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
    info.textContent = "ⓘ Los estados seleccionados quedan guardados en discountPolicy.byZone. Si existen zonas activas, estos topes reemplazan el tope general del producto.";
    editor.appendChild(info);

    stateBlock.parentElement.insertBefore(editor, stateBlock);
  }

  function patchAdminStateSelectors() {
    const labels = Array.from(document.querySelectorAll("label"));
    const stateLabel = labels.find(l => (l.textContent || "").trim().toLowerCase() === "aplica en estado (vacío = todos los estados)");
    if (!stateLabel) return;
    const stateBlock = findBlockFromLabel(stateLabel);
    const modal = stateBlock.closest("div[style*='overflow']") || document.body;
    const productId = getProductId(modal);
    if (!productId) return;
    renderEditor(modal, productId, stateBlock);
  }

  const start = function () { setInterval(patchAdminStateSelectors, 250); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
