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
      logoSrc: "assets/propiedades-logo.png",
      site: "propiedades.com",
      email: "ventas@propiedades.com"
    },
    iva: 0.16,
    zones: [
      { id: "FULLPRICE",   label: "FullPrice (lista nacional)" },
      { id: "CDMX_EDOMEX", label: "CDMX / Estado de México" },
      { id: "JALISCO_NL",  label: "Jalisco / Nuevo León" },
      { id: "QUERETARO",   label: "Querétaro" },
      { id: "RESTO",       label: "Resto del país" }
    ],
    stateToZone: {
      "Ciudad de México": "CDMX_EDOMEX",
      "Estado de México": "CDMX_EDOMEX",
      "Jalisco": "JALISCO_NL",
      "Nuevo León": "JALISCO_NL",
      "Querétaro": "QUERETARO"
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
    suggestZone: function (state) { return this.stateToZone[state] || "RESTO"; },
    advisors: [
      { id: "a0", name: "Mayra Moreno",   email: "mayra.moreno@propiedades.com",   phone: "525580218070" },
      { id: "a1", name: "Ana Martínez",   email: "ana.martinez@propiedades.com",   phone: "525512345678" },
      { id: "a2", name: "Carlos Rivera",  email: "carlos.rivera@propiedades.com",  phone: "525587654321" },
      { id: "a3", name: "Diana López",    email: "diana.lopez@propiedades.com",    phone: "" },
      { id: "a4", name: "Jorge Fuentes",  email: "jorge.fuentes@propiedades.com",  phone: "525599998888" }
    ],
    contactCenter: { name: "Contact Center Propiedades.com", phone: "525500000000" },
    payments: {
      msiPaypal: { enabled: true, label: "Meses sin intereses (MSI) vía PayPal", detail: "Disponible con cualquier tarjeta de crédito. El cobro total se aplica en tu tarjeta." },
      transfer: { enabled: true, label: "Transferencia bancaria / depósito" }
    },
    bank: {
      beneficiary: "CORPORATIVO MCNEMEXICO S DE RL DE CV",
      rfc: "CMC210701L19",
      bank: "BBVA BANCOMER",
      clabe: "012180001183819685",
      account: "0118381968",
      reference: "Nombre del cliente"
    },
    introMessage: "Tus propiedades merecen estar donde los compradores ya están buscando.",
    legalNote: "Precios expresados en pesos mexicanos (MXN) más IVA. Esta propuesta es de carácter informativo y no constituye un contrato. Precios y promociones sujetos a cambios sin previo aviso una vez vencida la vigencia indicada.",
    proposalValidityBusinessDays: 7,
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
    productMeta: {
      elite:         { name: "Elite",                    theme: "green", icon: "star",    badge: "Recomendado", valueLabel: "Cobertura", tagline: "Publicaciones con etiqueta Exclusivo · Primeros resultados de búsqueda" },
      oportunidades: { name: "Oportunidades Ilimitadas", theme: "green", icon: "bolt",    badge: "Complemento", valueLabel: "Cobertura", tagline: "Recibe oportunidades de compradores activos, sin costo por propiedad" },
      destacados:    { name: "Destacados",               theme: "gold",  icon: "arrowup", badge: "Complemento", valueLabel: "Cobertura", tagline: "Posiciona tus mejores propiedades al tope de los resultados" },
      prime:         { name: "Prime",                    theme: "blue",  icon: "diamond", badge: "Complemento", valueLabel: "Cobertura", tagline: "Posiciona tus mejores propiedades al tope de los resultados" }
    }
  };
})();

(function () {
  if (window.PC.__advisorSearchEnhancer) return;
  window.PC.__advisorSearchEnhancer = true;
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); }
  function isAdvisorSearchInput(el) { return el && el.tagName === "INPUT" && String(el.getAttribute("placeholder") || "").toLowerCase().indexOf("buscar asesor") >= 0; }
  function applyAdvisorSearchSelection(input) {
    const q = norm(input.value); if (!q) return;
    const select = input.parentElement ? input.parentElement.querySelector("select") : null; if (!select) return;
    const match = Array.from(select.options || []).find(opt => norm(opt.textContent).indexOf(q) >= 0);
    if (!match || select.value === match.value) return;
    select.value = match.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }
  document.addEventListener("input", function (event) { if (isAdvisorSearchInput(event.target)) window.setTimeout(function () { applyAdvisorSearchSelection(event.target); }, 80); }, true);
})();

(function () {
  if (window.PC.__labelTextEnhancer) return;
  window.PC.__labelTextEnhancer = true;
  function n(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim(); }
  function relabel() {
    Array.from(document.getElementsByTagName("label")).forEach(function (el) {
      const t = n(el.textContent);
      if (t.indexOf("descuento adicional") === 0) el.textContent = "Descuento adicional %";
      else if (t === "cobertura de inventario" || t === "paquete de oportunidades" || t.indexOf("cantidad de avisos") === 0) el.textContent = "Cobertura";
    });
  }
  document.addEventListener("input", function () { setTimeout(relabel, 0); }, true);
  document.addEventListener("change", function () { setTimeout(relabel, 0); }, true);
  document.addEventListener("click", function () { setTimeout(relabel, 0); }, true);
  setInterval(relabel, 500);
  setTimeout(relabel, 0);
})();
