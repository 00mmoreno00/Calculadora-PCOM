// Prueba del cotizador compartido con los CSV y motores reales (node tests/cotizador.test.js).
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const raiz = path.join(__dirname, '..');
const win = { PC: {}, fetch: undefined };
win.window = win;
const ctx = vm.createContext(win);
['utils.js', 'config.js', 'pricing-data.js', 'promotions.js', 'pricing-engine.js', 'promotion-engine.js', 'cotizador.js']
  .forEach(f => vm.runInContext(fs.readFileSync(path.join(raiz, f), 'utf8'), ctx, { filename: f }));
const C = win.PC.Cotizador;
const rows = [].concat(...fs.readdirSync(path.join(raiz, 'data/precios')).filter(f => f.endsWith('.csv'))
  .map(f => { const r = C.parseCSV(fs.readFileSync(path.join(raiz, 'data/precios', f), 'utf8')); assert.strictEqual(r.errors.length, 0, f + ': ' + JSON.stringify(r.errors)); return r.rows; }));
const fecha = win.PC.utils.fromISO('2026-11-01');
const cotiza = (p, estado) => C.calcularProducto(Object.assign({ period: 'mensual', quantity: 1, monthlyPromoOn: false, promoOn: false, manualDiscountPct: 0, customPackages: [] }, p),
  { rows, zone: C.zonaDeEstado(estado), stateName: estado, mode: 'individual', date: fecha }).result;

let r = cotiza({ productId: 'oportunidades', oppOption: '10' }, 'Ciudad de México');
assert.strictEqual(r.finalPrice, 599);
r = cotiza({ productId: 'oportunidades', oppOption: '10' }, 'Jalisco');
assert.strictEqual(r.finalPrice, 300); // 599 con 50%
assert.strictEqual(r.zoneDiscountPct, 50);
r = cotiza({ productId: 'elite', eliteOption: 'hasta300' }, 'Puebla');
assert.strictEqual(r.finalPrice, 2975);
r = cotiza({ productId: 'prime', pkgOption: '1' }, 'Ciudad de México');
assert.strictEqual(r.finalPrice, 700);
// Anual con Promo del mes (50% adicional)
const mensual = cotiza({ productId: 'oportunidades', oppOption: '10', period: 'anual' }, 'Ciudad de México').finalPrice;
const conPromo = cotiza({ productId: 'oportunidades', oppOption: '10', period: 'anual', monthlyPromoOn: true }, 'Ciudad de México').finalPrice;
assert.strictEqual(conPromo, Math.round(mensual * 0.5));
// Promoción manual 10%
const p10 = cotiza({ productId: 'prime', pkgOption: '1', promoOn: true, manualDiscountPct: 10 }, 'Ciudad de México').finalPrice;
assert.strictEqual(p10, 630);
// Personalizado Oportunidades: 2 × paquete 10 (lista nacional)
r = cotiza({ productId: 'oportunidades', oppOption: 'personalizado', customPackages: [{ value: '10', qty: 2 }] }, 'Ciudad de México');
assert.strictEqual(r.finalPrice, 1198);
console.log('cotizador: OK', { mensual, conPromo });
