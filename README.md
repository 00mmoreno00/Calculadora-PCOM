# Calculadora comercial · Propiedades.com

App web estática (sin backend) para que el equipo comercial genere propuestas:
cotiza productos, aplica descuentos y promociones, y exporta la propuesta en PDF.
Compatible con **GitHub Pages**.

## Cómo publicar en GitHub Pages
1. Sube el contenido de esta carpeta a la raíz del repositorio (o a `/docs`).
2. En *Settings → Pages*, elige la rama y la carpeta.
3. Abre la URL publicada: `index.html` redirige a `Calculadora.dc.html`.

> Requiere conexión a internet para las fuentes (Google Fonts) y las librerías de
> PDF (html2canvas + jsPDF), que se cargan por CDN.

## Estructura de archivos

| Archivo | Rol |
|---|---|
| `index.html` | Entrada; redirige a la calculadora. |
| `Calculadora.dc.html` | App: controlador de UI, render de la propuesta, exportación PDF y modo admin. |
| `support.js` | Runtime que monta la app (no editar). |
| `config.js` | **Configuración general editable**: empresa, IVA, asesores, estados, zonas, mapeo estado→zona, formas de pago, datos bancarios, textos legales, beneficios y metadatos por producto. |
| `pricing-data.js` | **Tablas de precios reales** (Elite, Oportunidades, Destacados, Prime) y multiplicadores por periodo. |
| `promotions.js` | **Catálogo de promociones** editable cada mes. |
| `pricing-engine.js` | **Motor de precios** (separado de la UI): calcula precio base, regional, descuento y precio final. |
| `promotion-engine.js` | **Motor de promociones**: decide qué promoción aplica. |
| `validators.js` | Validaciones y control del botón de exportar. |
| `utils.js` | Utilidades de fecha (hora local, días hábiles, fin de mes) y formato de moneda. |
| `assets/` | Logotipo. |
| `_ds/` | Tokens y tipografía del sistema de diseño. |

## Actualizaciones frecuentes (sin tocar la lógica)
- **Precios:** `pricing-data.js`.
- **Promociones del mes:** `promotions.js` (o el modo admin en la app).
- **Asesores / bancos / textos / beneficios:** `config.js`.

## Administración dentro de la app
- **Persistencia en navegador desactivada.** La app NO usa localStorage/sessionStorage/
  IndexedDB. Todos los datos se leen siempre de los archivos fuente: asesores y
  productos desde `config.js`, precios desde `data/precios/*.csv` y `pricing-data.js`,
  y promociones desde `promotions.js`. Refrescar la página nunca recupera cambios
  previos guardados en el navegador.
- Para actualizar datos, edita los archivos fuente correspondientes (ver tabla arriba).

## Pendientes marcados `TODO_REEMPLAZAR`
Busca `TODO_REEMPLAZAR` en `config.js` y `pricing-data.js` para sustituir datos de
ejemplo por definitivos (ej. lista **FullPrice** de Elite, teléfonos reales, etc.).
