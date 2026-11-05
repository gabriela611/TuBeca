import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortBecas } from './sort';

test('sortBecas con cierra_pronto ubica la abierta más próxima de primera y vencidas al final', () => {
  const becas = [
    { id: '1', fechaCierre: '2026-12-31' }, // 57 días
    { id: '2', fechaCierre: '2026-10-01' }, // vencida
    { id: '3', fechaCierre: '2026-11-10' }, // 6 días
    { id: '4', fechaCierre: null },         // sin fecha
  ];

  const sorted = sortBecas(becas, 'cierra_pronto');
  assert.equal(sorted[0].id, '3'); // cierra pronto (6 días)
  assert.equal(sorted[1].id, '1'); // cierra después
  assert.equal(sorted[2].id, '4'); // sin fecha
  assert.equal(sorted[3].id, '2'); // vencida al final
});

test('sortBecas con mayor_cobertura ordena por porcentaje descendente y vencidas al final', () => {
  const becas = [
    { id: '1', porcentaje: '50%', fechaCierre: '2026-12-31' },
    { id: '2', porcentaje: '100%', fechaCierre: '2026-10-01' }, // vencida
    { id: '3', porcentaje: '100%', fechaCierre: '2026-12-31' },
    { id: '4', porcentaje: '80%', fechaCierre: '2026-12-31' },
  ];

  const sorted = sortBecas(becas, 'mayor_cobertura');
  assert.equal(sorted[0].id, '3'); // 100% activa
  assert.equal(sorted[1].id, '4'); // 80% activa
  assert.equal(sorted[2].id, '1'); // 50% activa
  assert.equal(sorted[3].id, '2'); // vencida al final a pesar de 100%
});

