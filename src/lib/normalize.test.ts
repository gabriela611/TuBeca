import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeText, fuzzyIncludes } from './normalize';

test('normalizeText remueve tildes y convierte a minúsculas', () => {
  assert.equal(normalizeText('Ingeniería'), 'ingenieria');
  assert.equal(normalizeText('INGENIERÍA'), 'ingenieria');
  assert.equal(normalizeText('ingenieria'), 'ingenieria');
  assert.equal(normalizeText('Bogotá'), 'bogota');
  assert.equal(normalizeText('Medellín'), 'medellin');
  assert.equal(normalizeText(''), '');
  assert.equal(normalizeText(null), '');
  assert.equal(normalizeText(undefined), '');
});

test('fuzzyIncludes compara sin distinguir mayúsculas ni tildes', () => {
  assert.equal(fuzzyIncludes('Beca de Ingeniería de Sistemas', 'ingenieria'), true);
  assert.equal(fuzzyIncludes('Beca de Ingeniería de Sistemas', 'INGENIERÍA'), true);
  assert.equal(fuzzyIncludes('Beca de Ingeniería de Sistemas', 'Ingeniería'), true);
  assert.equal(fuzzyIncludes('Universidad de Bogotá', 'bogota'), true);
  assert.equal(fuzzyIncludes('Universidad de Bogotá', 'BOGOTÁ'), true);
  assert.equal(fuzzyIncludes('Universidad de Bogotá', 'Medellín'), false);
});

