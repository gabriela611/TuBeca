import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularEstado, toBogotaDateString } from './estado';

test('toBogotaDateString convierte fechas correctamente', () => {
  const d = new Date('2026-11-04T12:00:00Z');
  const str = toBogotaDateString(d);
  assert.equal(str, '2026-11-04');
});

test('calcularEstado devuelve vencida cuando fechaCierre es anterior a hoy', () => {
  const hoy = '2026-11-04';
  const cierre = '2026-11-02';
  const apertura = '2026-08-01';
  assert.equal(calcularEstado(apertura, cierre, hoy), 'vencida');
});

test('calcularEstado devuelve activa cuando hoy está entre apertura y cierre', () => {
  const hoy = '2026-11-04';
  const apertura = '2026-10-01';
  const cierre = '2026-12-15';
  assert.equal(calcularEstado(apertura, cierre, hoy), 'activa');
});

test('calcularEstado devuelve activa en el día exacto de cierre', () => {
  const hoy = '2026-11-04';
  const apertura = '2026-10-01';
  const cierre = '2026-11-04';
  assert.equal(calcularEstado(apertura, cierre, hoy), 'activa');
});

test('calcularEstado devuelve proxima cuando apertura es futura', () => {
  const hoy = '2026-11-04';
  const apertura = '2026-11-10';
  const cierre = '2026-11-30';
  assert.equal(calcularEstado(apertura, cierre, hoy), 'proxima');
});

test('calcularEstado usa fallbackTexto cuando no hay fechas', () => {
  assert.equal(calcularEstado(null, null, '2026-11-04', 'Convocatoria cerrada'), 'vencida');
  assert.equal(calcularEstado(null, null, '2026-11-04', 'Próxima a abrir en 2027'), 'proxima');
  assert.equal(calcularEstado(null, null, '2026-11-04', 'Abierta actualmente'), 'activa');
});

