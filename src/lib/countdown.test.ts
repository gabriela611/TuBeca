import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diasRestantes } from './countdown';

test('diasRestantes calcula correctamente días restantes en el futuro', () => {
  const hoy = '2026-11-04';
  const cierre = '2026-11-20';
  const res = diasRestantes(cierre, hoy);
  assert.equal(res.dias, 16);
  assert.equal(res.texto, 'Quedan 16 días');
  assert.equal(res.esVencida, false);
  assert.equal(res.esUrgente, false);
});

test('diasRestantes marca esUrgente cuando quedan 7 días o menos', () => {
  const hoy = '2026-11-04';
  const cierre = '2026-11-10';
  const res = diasRestantes(cierre, hoy);
  assert.equal(res.dias, 6);
  assert.equal(res.texto, 'Quedan 6 días');
  assert.equal(res.esVencida, false);
  assert.equal(res.esUrgente, true);
});

test('diasRestantes formatea 1 día singularmente y como urgente', () => {
  const hoy = '2026-11-04';
  const cierre = '2026-11-05';
  const res = diasRestantes(cierre, hoy);
  assert.equal(res.dias, 1);
  assert.equal(res.texto, 'Queda 1 día');
  assert.equal(res.esVencida, false);
  assert.equal(res.esUrgente, true);
});

test('diasRestantes detecta cierre hoy', () => {
  const hoy = '2026-11-04';
  const cierre = '2026-11-04';
  const res = diasRestantes(cierre, hoy);
  assert.equal(res.dias, 0);
  assert.equal(res.texto, 'Cierra hoy');
  assert.equal(res.esVencida, false);
  assert.equal(res.esUrgente, true);
});

test('diasRestantes detecta fecha pasada como Cerrada', () => {
  const hoy = '2026-11-04';
  const cierre = '2026-10-31';
  const res = diasRestantes(cierre, hoy);
  assert.ok(res.dias! < 0);
  assert.equal(res.texto, 'Cerrada');
  assert.equal(res.esVencida, true);
  assert.equal(res.esUrgente, false);
});

test('diasRestantes maneja fechas nulas o indefinidas', () => {
  const res = diasRestantes(null);
  assert.equal(res.dias, null);
  assert.equal(res.texto, 'Sin fecha de cierre');
  assert.equal(res.esVencida, false);
  assert.equal(res.esUrgente, false);
});

