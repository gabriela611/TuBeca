import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEstratos, evaluarElegibilidad } from './eligibility';

test('parseEstratos extrae estratos de listas y rangos', () => {
  assert.deepEqual(parseEstratos('1, 2 y 3'), [1, 2, 3]);
  assert.deepEqual(parseEstratos('1 o 2'), [1, 2]);
  assert.deepEqual(parseEstratos('1 a 4'), [1, 2, 3, 4]);
  assert.deepEqual(parseEstratos('1 al 3'), [1, 2, 3]);
  assert.deepEqual(parseEstratos('estratos 1, 2, 3 o 4'), [1, 2, 3, 4]);
  assert.deepEqual(parseEstratos(null), []);
  assert.deepEqual(parseEstratos('Cualquier estrato'), []);
});

test('evaluarElegibilidad: rechaza por promedio mínimo (caso de aceptación TDR)', () => {
  const beca = { promedioMinimo: 3.25 };
  const perfil = { promedio: 3.0 };

  const evaluacion = evaluarElegibilidad(beca, perfil);
  assert.equal(evaluacion.estado, 'no_cumples');
  assert.match(evaluacion.motivo!, /promedio mínimo 3\.25/);
});

test('evaluarElegibilidad: aprueba cuando cumple promedio y saber 11', () => {
  const beca = {
    promedioMinimo: 3.25,
    puntajeSaber11Minimo: 320,
    estratoSocioeconomico: '1, 2 y 3',
  };
  const perfil = {
    promedio: 3.8,
    saber11: 340,
    estrato: 2,
  };

  const evaluacion = evaluarElegibilidad(beca, perfil);
  assert.equal(evaluacion.estado, 'cumples');
});

test('evaluarElegibilidad: reporta no_cumples si no alcanza Saber 11', () => {
  const beca = { puntajeSaber11Minimo: 320 };
  const perfil = { saber11: 300 };

  const evaluacion = evaluarElegibilidad(beca, perfil);
  assert.equal(evaluacion.estado, 'no_cumples');
  assert.match(evaluacion.motivo!, /Saber 11/);
});

test('evaluarElegibilidad: reporta faltan_datos si el usuario no ha completado el dato exigido', () => {
  const beca = { promedioMinimo: 3.5, puntajeSaber11Minimo: 300 };
  const perfil = { promedio: 3.8 }; // falta saber11

  const evaluacion = evaluarElegibilidad(beca, perfil);
  assert.equal(evaluacion.estado, 'faltan_datos');
});

test('evaluarElegibilidad: un criterio vacío en la beca nunca excluye', () => {
  const beca = {
    promedioMinimo: null,
    puntajeSaber11Minimo: null,
    estratoSocioeconomico: null,
    edadMinima: null,
    edadMaxima: null,
  };
  const perfil = { promedio: 2.5, saber11: 200 };

  const evaluacion = evaluarElegibilidad(beca, perfil);
  assert.equal(evaluacion.estado, 'faltan_datos'); // sin requisitos específicos
});

test('evaluarElegibilidad: valida estrato socioeconómico', () => {
  const beca = { estratoSocioeconomico: '1 o 2' };
  const perfilNo = { estrato: 4 };
  const perfilSi = { estrato: 1 };

  assert.equal(evaluarElegibilidad(beca, perfilNo).estado, 'no_cumples');
  assert.equal(evaluarElegibilidad(beca, perfilSi).estado, 'cumples');
});

