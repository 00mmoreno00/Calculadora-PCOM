/* ============================================================
   config.js — Configuración general editable por el equipo comercial.
   TODO_REEMPLAZAR: sustituir los valores marcados por datos reales.
   Nada de lógica de cálculo aquí: solo datos.
   ============================================================ */
window.PC = window.PC || {};
window.PC.config = (function () {
  "use strict";

  return {
    company: {
      name: "Propiedades.com",
      // TODO_REEMPLAZAR: colocar la ruta/URL del logo oficial en /assets.
      logoSrc: "assets/propiedades-logo.png",
      site: "propiedades.com",
      // Correo comercial genérico visible en la propuesta.
      email: "ventas@propiedades.com" // TODO_REEMPLAZAR
    },

    // IVA vigente en México. Los precios de las tablas son SIN IVA (+IVA).
    iva: 0.16,

    // --------------------------------------------------------
    // ZONAS DE PRICING (id fijo -> etiqueta visible)
    // --------------------------------------------------------
    zones: [
      { id: "FULLPRICE",   label: "FullPrice (lista nacional)" },
      { id: "CDMX_EDOMEX", label: "CDMX / Estado de México" },
      { id: "JALISCO_NL",  label: "Jalisco / Nuevo León" },
      { id: "QUERETARO",   label: "Querétaro" },
      { id: "RESTO",       label: "Resto del país" }
    ],

    // --------------------------------------------------------
    // ESTADOS DE MÉXICO -> ZONA sugerida
    // Regla: CDMX/EdoMex, Jalisco/NL, Querétaro tienen zona propia;
    // cualquier otro estado cae en "Resto del país".
    // FullPrice NUNCA se auto-asigna: es una decisión manual.
    // --------------------------------------------------------
    stateToZone: {
      "Ciudad de México": "CDMX_EDOMEX",
      "Estado de México": "CDMX_EDOMEX",
      "Jalisco": "JALISCO_NL",
      "Nuevo León": "JALISCO_NL",
      "Querétaro": "QUERETARO"
      // el resto -> RESTO (resuelto por función suggestZone)
    },

    states: [
      "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
      "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
      "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
      "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
      "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
      "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz",
      "Yucatán", "Zacatecas"
    ],

    // Devuelve la zona sugerida para un estado.
    suggestZone: function (state) {
      return this.stateToZone[state] || "RESTO";
    },

    // --------------------------------------------------------
    // CATÁLOGO DE ASESORES
    // TODO_REEMPLAZAR: cargar el catálogo real (teléfono en formato E.164 sin +).
    // Si un asesor no tiene teléfono, se usa el Contact Center.
    // --------------------------------------------------------
    advisors: [
      { id: "a0", name: "Mayra Moreno",   email: "mayra.moreno@propiedades.com",   phone: "525580218070" },
      { id: "a1", name: "Ana Martínez",   email: "ana.martinez@propiedades.com",   phone: "525512345678" },  // TODO_REEMPLAZAR
      { id: "a2", name: "Carlos Rivera",  email: "carlos.rivera@propiedades.com",  phone: "525587654321" },  // TODO_REEMPLAZAR
      { id: "a3", name: "Diana López",    email: "diana.lopez@propiedades.com",    phone: "" },              // sin teléfono -> Contact Center
      { id: "a4", name: "Jorge Fuentes",  email: "jorge.fuentes@propiedades.com",  phone: "525599998888" }   // TODO_REEMPLAZAR
    ],

    // Contact Center: fallback de WhatsApp cuando el asesor no tiene teléfono.
    contactCenter: {
      name: "Contact Center Propiedades.com",
      phone: "525500000000" // TODO_REEMPLAZAR
    },

    // --------------------------------------------------------
    // FORMAS DE PAGO + DATOS BANCARIOS (configurables, no en la vista)
    // --------------------------------------------------------
    payments: {
      msiPaypal: {
        enabled: true,
        label: "Meses sin intereses (MSI) vía PayPal",
        detail: "Disponible con cualquier tarjeta de crédito. El cobro total se aplica en tu tarjeta."
      },
      transfer: {
        enabled: true,
        label: "Transferencia bancaria / depósito"
      }
    },

    // Datos bancarios (reales).
    bank: {
      beneficiary: "CORPORATIVO MCNEMEXICO S DE RL DE CV",
      rfc: "CMC210701L19",
      bank: "BBVA BANCOMER",
      clabe: "012180001183819685",
      account: "0118381968",
      reference: "Nombre del cliente"
    },

    // Texto introductorio comercial (arriba de la propuesta).
    introMessage:
      "Tus propiedades merecen estar donde los compradores ya están buscando.",

    // Nota legal al pie de la propuesta.
    legalNote:
      "Precios expresados en pesos mexicanos (MXN) más IVA. Esta propuesta es de " +
      "carácter informativo y no constituye un contrato. Precios y promociones " +
      "sujetos a cambios sin previo aviso una vez vencida la vigencia indicada.", // TODO_REEMPLAZAR

    // Días hábiles de vigencia por default de la propuesta comercial.
    proposalValidityBusinessDays: 7,

    // --------------------------------------------------------
    // BENEFICIOS COMERCIALES POR PRODUCTO (editable)
    // Usa **texto** para resaltar en negrita en la tarjeta/PDF.
    // --------------------------------------------------------
    benefits: {
      elite: [
        'Etiqueta **"Exclusivo"** en todas tus publicaciones',
        'Posicionamiento **prioritario** sobre publicaciones simples',
        'Más de **2 millones de personas** podrían ver tus propiedades este mes'
      ],
      oportunidades: [
        'Recibe **oportunidades de compradores** activos',
        'Contacto **directo** con prospectos interesados',
        'Escala tu volumen según tu operación',
        'Sin costo por propiedad, **pagas por oportunidad**'
      ],
      destacados: [
        'Aparecen **por encima** de las publicaciones Elite',
        'Se muestran en los **primeros resultados**',
        'Etiqueta **"Destacado"** de alta visibilidad',
        '**Asignación automática de anuncio a destacar:** el sistema identifica los mejores anuncios de acuerdo a tu inventario y al comportamiento del mercado'
      ],
      prime: [
        'Aparecen **por encima** de los destacados',
        'Se mantienen **fijos** en los resultados de búsqueda',
        'Etiqueta **"Prime"** de alta visibilidad'
      ]
    },

    // Metadatos visuales por producto (tarjeta de la propuesta/PDF).
    // theme: color (green/gold/blue) · icon: star/bolt/arrowup/diamond
    // badge: etiqueta superior derecha · tagline: bajada del header
    // valueLabel: rótulo sobre la cifra grande.
    productMeta: {
      elite:         { name: "Elite",                    theme: "green", icon: "star",    badge: "Recomendado", valueLabel: "Inventario cubierto", tagline: "Publicaciones con etiqueta Exclusivo · Primeros resultados de búsqueda" },
      oportunidades: { name: "Oportunidades Ilimitadas", theme: "green", icon: "bolt",    badge: "Complemento", valueLabel: "Paquete",            tagline: "Recibe oportunidades de compradores activos, sin costo por propiedad" },
      destacados:    { name: "Destacados",               theme: "gold",  icon: "arrowup", badge: "Complemento", valueLabel: "Avisos destacados",  tagline: "Posiciona tus mejores propiedades al tope de los resultados" },
      prime:         { name: "Prime",                    theme: "blue",  icon: "diamond", badge: "Complemento", valueLabel: "Avisos Prime",       tagline: "Posiciona tus mejores propiedades al tope de los resultados" }
    }
  };
})();

/* ============================================================
   Patch visual del administrador de productos.
   Objetivo: reemplazar "Aplica en estado" por configuración de
   topes de descuento por zona sin tocar todavía el runtime generado.
   Guarda en localStorage.pc_product_config_v1 -> discountPolicy.
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

  function readOverrides() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
    catch (e) { return {}; }
  }

  function writeOverrides(overrides) {
    localStorage.setItem(LS_KEY, JSON.stringify(overrides));
  }

  function defaultPolicy(fallbackCap) {
    const byZone = {};
    ZONES.forEach(z => {
      byZone[z.id] = {
        discountCapPct: z.id === "FULLPRICE" ? 0 : Number(fallbackCap || 0),
        active: false
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
        active: src.active === true
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
    for (let i = 0; i < 4 && node; i += 1) {
      if (node.parentElement && node.parentElement.querySelector("input,select,textarea")) return node.parentElement;
      node = node.parentElement;
    }
    return label.parentElement;
  }

  function getProductId(root) {
    const nameLabel = findLabel(root, "Nombre del producto");
    const nameInput = nameLabel && findBlockFromLabel(nameLabel).querySelector("input");
    const name = nameInput ? nameInput.value : "";
    const meta = window.PC && window.PC.config && window.PC.config.productMeta ? window.PC.config.productMeta : {};
    const direct = Object.keys(meta).find(id => meta[id].name === name);
    if (direct) return direct;
    const overrides = readOverrides();
    return Object.keys(overrides).find(id => overrides[id] && overrides[id].name === name) || null;
  }

  function getGlobalCap(root) {
    const label = findLabel(root, "Tope descuento %");
    const input = label && findBlockFromLabel(label).querySelector("input");
    return input ? Number(input.value || 0) : 0;
  }

  function savePolicy(productId, policy) {
    const overrides = readOverrides();
    overrides[productId] = Object.assign({}, overrides[productId] || {}, { discountPolicy: policy });
    writeOverrides(overrides);
  }

  function renderEditor(root, productId, stateBlock) {
    if (!productId || !stateBlock) return;

    const overrides = readOverrides();
    const globalCap = getGlobalCap(root);
    const current = overrides[productId] || {};
    const policy = normalizePolicy(current.discountPolicy, globalCap);
    const active = hasActiveZones(policy);

    // Deshabilita el tope global si hay zonas configuradas.
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
      let note = block.querySelector("[data-zone-cap-note]");
      if (active && !note) {
        note = document.createElement("div");
        note.setAttribute("data-zone-cap-note", "true");
        note.style.cssText = "margin-top:5px;font:600 10.5px/1.35 Nunito;color:#6B6B73;display:flex;gap:5px;align-items:center";
        note.textContent = "ⓘ Se habilita solo si no hay zonas configuradas.";
        block.appendChild(note);
      }
      if (!active && note) note.remove();
    }

    stateBlock.style.display = "none";

    let editor = root.querySelector("[data-zone-discount-editor]");
    if (editor) editor.remove();

    editor = document.createElement("div");
    editor.setAttribute("data-zone-discount-editor", "true");
    editor.style.cssText = "margin-bottom:12px;border:1px solid #E6E6EB;border-radius:10px;padding:14px;background:#fff";

    const header = document.createElement("div");
    header.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px";
    header.innerHTML = '<div><label style="font:600 10px Nunito;text-transform:uppercase;letter-spacing:.06em;color:#6B6B73;margin-bottom:4px;display:block">Tope de descuento por zona</label><div style="font:500 10.8px/1.35 Nunito;color:#6B6B73">Si configuras zonas, estos topes reemplazan el tope general del producto.</div></div>';

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
      });
      savePolicy(productId, policy);
      patchAdmin();
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
        const cap = Number(Object.values(policy.byZone).find(z => z.active && z.discountCapPct != null)?.discountCapPct || globalCap || 0);
        ZONES.forEach(z => {
          policy.byZone[z.id].active = true;
          policy.byZone[z.id].discountCapPct = z.id === "FULLPRICE" ? 0 : cap;
        });
      }
      savePolicy(productId, policy);
      patchAdmin();
    };
    sameLabel.appendChild(same);
    sameLabel.appendChild(document.createTextNode("Usar el mismo tope para todas las zonas"));
    editor.appendChild(sameLabel);

    const table = document.createElement("div");
    table.style.cssText = "border:1px solid #E6E6EB;border-radius:9px;overflow:hidden;margin-bottom:10px";
    table.innerHTML = '<div style="display:grid;grid-template-columns:1.5fr 180px 80px;gap:10px;align-items:center;padding:9px 12px;background:#F7F7F9;font:800 10px Nunito;color:#6B6B73;text-transform:uppercase;letter-spacing:.06em"><div>Zona</div><div>Tope descuento %</div><div style="text-align:center">Activo</div></div>';

    ZONES.forEach(z => {
      const row = document.createElement("div");
      row.style.cssText = "display:grid;grid-template-columns:1.5fr 180px 80px;gap:10px;align-items:center;padding:10px 12px;border-top:1px solid #E6E6EB";

      const name = document.createElement("div");
      name.textContent = z.label;
      name.style.cssText = "font:700 12px Nunito;color:#2A2A2E";

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
        patchAdmin();
      };

      const activeLabel = document.createElement("label");
      activeLabel.style.cssText = "display:flex;justify-content:center;align-items:center;gap:6px;font:600 11px Nunito;color:#6B6B73";
      const activeInput = document.createElement("input");
      activeInput.type = "checkbox";
      activeInput.checked = policy.byZone[z.id].active === true;
      activeInput.onchange = function () {
        policy.byZone[z.id].active = activeInput.checked;
        savePolicy(productId, policy);
        patchAdmin();
      };
      activeLabel.appendChild(activeInput);
      activeLabel.appendChild(document.createTextNode("Activo"));

      row.appendChild(name);
      row.appendChild(cap);
      row.appendChild(activeLabel);
      table.appendChild(row);
    });

    editor.appendChild(table);

    const info = document.createElement("div");
    info.style.cssText = "padding:8px 10px;border-radius:8px;background:#EEF4FF;border:1px solid #C4D6F6;color:#1B4F9E;font:600 11px/1.4 Nunito";
    info.textContent = "ⓘ Si existen zonas configuradas, este tope por zona reemplaza el tope general del producto.";
    editor.appendChild(info);

    stateBlock.parentElement.insertBefore(editor, stateBlock);
  }

  function patchAdmin() {
    const labels = Array.from(document.querySelectorAll("label"));
    const stateLabel = labels.find(l => (l.textContent || "").trim().toLowerCase() === "aplica en estado (vacío = todos los estados)");
    if (!stateLabel) return;
    const stateBlock = findBlockFromLabel(stateLabel);
    const modal = stateBlock.closest("div[style*='overflow']") || document.body;
    const productId = getProductId(modal);
    if (!productId) return;
    renderEditor(modal, productId, stateBlock);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setInterval(patchAdmin, 600);
    });
  } else {
    setInterval(patchAdmin, 600);
  }
})();
