import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCoveragePercentage } from './coverage';

test('parseCoveragePercentage extrae porcentaje de rangos', () => {
  assert.equal(parseCoveragePercentage('40 %–100 %'), 100);
  assert.equal(parseCoveragePercentage('50% - 80%'), 80);
});

test('parseCoveragePercentage extrae porcentaje simple', () => {
  assert.equal(parseCoveragePercentage('70%'), 70);
  assert.equal(parseCoveragePercentage('50'), 50);
});

test('parseCoveragePercentage detecta cobertura total o parcial de texto', () => {
  assert.equal(parseCoveragePercentage(null, 'Beca Total'), 100);
  assert.equal(parseCoveragePercentage(null, 'Beca Parcial'), 50);
});

test('parseCoveragePercentage respeta porcentajeCobertura numérico', () => {
  assert.equal(parseCoveragePercentage(null, null, null, 85), 85);
});

