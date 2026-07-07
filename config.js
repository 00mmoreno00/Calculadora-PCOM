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

// Mejora de UX para búsqueda de asesor:
// mantiene el asesor default cuando el buscador está vacío, pero al escribir
// selecciona automáticamente la primera coincidencia visible en el dropdown.
(function () {
  if (window.PC.__advisorSearchEnhancer) return;
  window.PC.__advisorSearchEnhancer = true;

  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  function isAdvisorSearchInput(el) {
    return el && el.tagName === "INPUT" && String(el.getAttribute("placeholder") || "").toLowerCase().indexOf("buscar asesor") >= 0;
  }

  function applyAdvisorSearchSelection(input) {
    const q = norm(input.value);
    if (!q) return;
    const wrapper = input.parentElement;
    const select = wrapper ? wrapper.querySelector("select") : null;
    if (!select) return;
    const options = Array.from(select.options || []);
    const match = options.find(opt => norm(opt.textContent).indexOf(q) >= 0);
    if (!match || select.value === match.value) return;
    select.value = match.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  document.addEventListener("input", function (event) {
    const input = event.target;
    if (!isAdvisorSearchInput(input)) return;
    window.setTimeout(function () { applyAdvisorSearchSelection(input); }, 80);
  }, true);
})();
