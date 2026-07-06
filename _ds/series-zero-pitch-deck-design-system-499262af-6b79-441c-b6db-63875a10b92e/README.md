# NEXT MOVE — Sistema de diseño del pitch

> Talento que se mueve, startups que crecen.

NEXT MOVE es un marketplace B2B de movilidad de talento tech para startups LATAM. Este proyecto contiene el **sistema de diseño del pitch deck** (no el producto): tokens, identidad, librería de componentes de slide, y el deck completo de 16 slides + apéndice listo para inversionistas Seed.

El sistema existe para una sola cosa: que cada slide del pitch sea **legible sin presentador**, **honesta con los datos del brief**, y **visualmente igual al logo** (morado #5B2BE8 + verde #1E9D5B + negro sobre blanco). Ni una variación de paleta, ni una tipografía decorativa, ni un dato inventado.

---

## Qué contiene

| Carpeta / archivo                | Qué es                                                                 |
|----------------------------------|------------------------------------------------------------------------|
| `README.md`                      | Este archivo.                                                          |
| `SKILL.md`                       | Manifiesto del skill — léelo si vas a iterar el deck.                  |
| `colors_and_type.css`            | Tokens fundacionales (color, tipografía, espaciado, motion).           |
| `assets/nextmove-mark.svg`       | Isotipo oficial. N morada con flecha verde ascendente.                 |
| `preview/`                       | Tarjetas del Design System (paneles del tab "Sistema de diseño").      |
| `slides/`                        | UI kit del deck — 16 slides + chrome compartido.                       |
| `slides/index.html`              | Deck completo (entrada principal).                                     |

---

## Identidad — reglas estrictas

### Paleta (fija — viene del logo)

| Token            | Hex       | Uso permitido                                          |
|------------------|-----------|--------------------------------------------------------|
| `--purple`       | `#5B2BE8` | Títulos clave, líneas de énfasis, CTAs, isotipo.       |
| `--purple-deep`  | `#3D17B8` | Texto morado sobre fondos claros (legibilidad).        |
| `--purple-soft`  | `#EFEAFC` | Fondos secundarios, badges, tarjetas KPI.              |
| `--green`        | `#1E9D5B` | Datos positivos, flechas ▲, métricas de crecimiento.   |
| `--green-deep`   | `#16763F` | Texto verde sobre claro.                               |
| `--green-soft`   | `#E4F5EC` | Fondo de KPI positivo, tinte.                          |
| `--black`        | `#111111` | Texto principal.                                       |
| `--white`        | `#FFFFFF` | Fondo dominante.                                       |
| `--gray-100`     | `#F4F4F6` | Tarjetas secundarias.                                  |

**No proponer otros colores.** Ni gradientes. Ni acentos terciarios.

### Tipografía

- **Títulos y cuerpo:** **Manrope** (geométrica, abierta, Bold/ExtraBold para titulares, Medium/Regular para cuerpo).
- **Datos y eyebrow:** **JetBrains Mono** (tabular, para cifras y etiquetas tipo `MÉTRICA · 02`).
- Cuerpo mínimo en slide: **28px** (~22pt). Títulos: **52–72px** (40–56pt).
- Numeración de página: **14px JetBrains Mono**, gris, abajo a la derecha.

### Logo

- Isotipo + wordmark "Next Move" en esquina superior izquierda de **todas las slides salvo portada (01) y cierre (16)**.
- Tagline ("talento que se mueve, startups que crecen") solo en portada y cierre.
- El isotipo se queda fijo a 36px de alto en el header de slide.

### Layout — reglas obligatorias

- **Una idea por slide.**
- Máximo **5 bullets** por slide. Cada bullet **máx 10 palabras**.
- "Show, don't tell": gráfico > tabla > texto.
- **Sin guiones largos para aclaraciones.** Paréntesis o reformular.
- Sin clipart, sin emojis, sin stock genérica.
- **Cifras grandes:** el dato siempre más tipográficamente fuerte que la etiqueta.
- Márgenes 60px en 1920×1080. Grilla 12 columnas, gutter 24px.

### Iconografía

- Lineales monocromos (estilo Lucide / Phosphor), trazo 1.5–2px.
- Solo en **morado oscuro** o **negro**.
- Cero iconos de colores planos tipo emoji.

---

## Narrativa — arco obligatorio (Atrium / Justin Kan)

Todo el deck cuenta esta historia, en este orden:

1. **El mundo es de cierta manera.** (Slides 02–04: hook + problema + por qué tech.)
2. **Algo cambia.** (Slides 05–06: solución + producto.)
3. **El mundo es ahora diferente.** (Slides 07–14: cliente, mercado, competencia, GTM, tracción, modelo, finanzas, roadmap.)
4. **Cierre.** (Slides 15–16: equipo + ask.)

Reglas de copy:

- Frases cortas (máximo 12 palabras).
- Voz activa, presente.
- **Habla del cliente, no de Next Move.** ("Contratas talento ya validado en menos de 21 días" — no "Ofrecemos talento pre-validado").
- Cada slide se entiende sola.
- "25 words or less" en la slide de solución (Unusual Ventures).

---

## Las 16 slides

Estructura obligatoria del deck (orden fijo, no agregar slides):

| #   | Slide                                       | Idea ancla                                            |
|-----|---------------------------------------------|-------------------------------------------------------|
| 01  | Portada                                     | Logo + tagline + autores.                             |
| 02  | Opening gambit                              | "8 meses al año contratando · 1 de cada 3 falla."     |
| 03  | Problema                                    | Lento, costoso, ineficiente. USD 80K al año por startup. |
| 04  | Por qué tech, por qué ahora                 | Tech no es opcional. Demanda 22% YoY, oferta 7%.      |
| 05  | Solución                                    | Mercado de transferencias de talento ya validado.     |
| 06  | Producto                                    | Mockups del prototipo. Pilotos cerrados.              |
| 07  | Cliente objetivo                            | ICP tipificado por etapa, tamaño, presupuesto.        |
| 08  | Mercado                                     | TAM 3.682 · SAM 2.209 · SOM 883 · ARR USD 16M.        |
| 09  | Competencia                                 | Matriz 2x2 + Harvey Ball comparativo.                 |
| 10  | Go-to-Market                                | 3 canales + timeline 12 meses + COCA / LTV.           |
| 11  | Tracción y validación                       | 47 entrevistas, 23 LOI, 5 pilotos, 2 quotes literales.|
| 12  | Modelo y pricing                            | Comisión 12–15% + Enterprise USD 900/mes.             |
| 13  | Finanzas, CAPEX y fundraising               | $1.850M cap necesario, $1.050M esta ronda, FCL año 5. |
| 14  | Hoja de ruta priorizada                     | Matriz Impact vs Effort con gating criteria.          |
| 15  | Equipo                                      | 5 cofundadores · por qué este equipo gana.            |
| 16  | The Ask                                     | $1.050M COP por 25,9%. Métricas a 18 meses. CTA.      |

**Apéndice** (slides A1–A5, solo si el inversionista pregunta).

---

## Datos que no se pueden modificar

Las cifras que siguen vienen del brief v4 y se replican entre slides. Si cambia alguna, hay que cambiarla en **todas las slides** simultáneamente.

- **Rotación tech LATAM:** 24–44% anual (2–3x el promedio LATAM general).
- **Tiempo de contratación actual:** 45–90 días.
- **Comisión actual del mercado:** 15–25% del salario anual.
- **Comisión de NEXT MOVE:** 12–15% del salario anual.
- **Tiempo de cierre NEXT MOVE:** 21 días.
- **Validación:** 47 entrevistas (32 CO, 9 CL, 6 AR). 87% reconoce el problema. 64% pagaría. 23 cartas de intención firmadas. 5 startups en piloto.
- **Mercado:** TAM 3.682 startups (CO+CL+AR). SAM 2.209. SOM 883. Beachhead 26–44 startups CO. ARR potencial USD 16M.
- **Pricing Enterprise:** USD 900/mes (COP 3,6M). Comisión por cierre USD 2K–4K.
- **Proyección:** Año 1 $486M COP · Año 3 $2.739M · Año 5 $5.815M (margen 39%). Break-even mes 31. FCL año 5 acumulado $1.500M+.
- **Capital total a break-even:** $1.850M COP.
- **Esta ronda:** $1.050M COP por **25,9%** de equity (pre-money $3.000M).
- **Aporte cofundadores y FFF:** $300M (ya comprometido).
- **Ingresos operativos mes 6–31:** $500M acumulados.
- **Retornos:** TIR proyecto 22,4% · TIR inversionista 34% · margen año 5 39%.
- **Metas con esta ronda (18 meses):** 100 contratos cerrados · 12 Enterprise activos · CO + entrada validada a CL.

---

## Verificación final — checklist del brief

Antes de exportar:

- [ ] El deck cuenta una historia de principio a fin (resumible en 3 frases).
- [ ] Cada slide se entiende sin presentador.
- [ ] Cero guiones largos para aclaraciones.
- [ ] Cifras consistentes entre slides ($1.850M total / $1.050M esta ronda).
- [ ] Competencia tiene matriz 2x2 + Harvey Ball.
- [ ] Cliente tipificado con números (empleados, etapa, presupuesto).
- [ ] Validación tiene composición de muestra y testimonios.
- [ ] Roadmap usa Impact vs Effort con gating criteria.
- [ ] CAPEX separado del OPEX, reconciliando $1.850M vs $1.050M.
- [ ] Ningún placeholder, lorem ipsum, ni stock genérica.
- [ ] Logo en todas las slides salvo portada (01) y cierre (16).
- [ ] Número de página discreto en todas las slides.

---

## Referencias metodológicas

El sistema fue informado por la antología de pitch decks de [joelparkerhenderson/pitch-deck](https://github.com/joelparkerhenderson/pitch-deck) — específicamente Atrium (arco narrativo), 500 Startups (estructura), Sky Fernandes (densidad de slide), Unusual Ventures (25 words rule), Guy Kawasaki (las 10 slides esenciales).

Ninguno de esos autores está afiliado con NEXT MOVE. Son los libros en la repisa.
