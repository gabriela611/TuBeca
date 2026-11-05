export interface PerfilUsuario {
  saber11?: number | null; // 0 a 500
  promedio?: number | null; // 0 a 5.0
  estrato?: number | null; // 1 a 6
  edad?: number | null; // >= 0
}

export interface CriteriosBeca {
  promedioMinimo?: number | null;
  puntajeSaber11Minimo?: number | null;
  estratoSocioeconomico?: string | null;
  edadMinima?: number | null;
  edadMaxima?: number | null;
}

export type EstadoElegibilidad = 'cumples' | 'no_cumples' | 'faltan_datos';

export interface DetalleCriterio {
  criterio: 'promedio' | 'saber11' | 'estrato' | 'edad';
  cumple: boolean | null; // null si el usuario no aportó el dato
  mensaje: string;
}

export interface EvaluacionElegibilidad {
  estado: EstadoElegibilidad;
  motivo?: string;
  detalles: DetalleCriterio[];
}

/**
 * Parsea un texto de estrato socioeconómico ("1, 2 y 3", "1 a 4", "estratos 1 o 2")
 * y retorna la lista de números de estrato válidos (1 a 6).
 */
export function parseEstratos(texto: string | null | undefined): number[] {
  if (!texto) return [];
  const normal = texto.toLowerCase();

  // Detectar rangos como "1 a 4", "1 al 3", "1-4"
  const rangeMatch = normal.match(/([1-6])\s*(?:a|al|-)\s*([1-6])/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    const result: number[] = [];
    for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
      result.push(i);
    }
    return result;
  }

  // Extraer dígitos individuales del 1 al 6
  const matches = normal.match(/[1-6]/g);
  if (!matches) return [];

  const set = new Set<number>();
  for (const m of matches) {
    set.add(parseInt(m, 10));
  }
  return Array.from(set).sort((a, b) => a - b);
}

/**
 * Evalúa si un perfil de usuario cumple los requisitos de una beca.
 * Reglas:
 * - Un criterio vacío en la beca nunca excluye.
 * - Si la beca exige un criterio y el perfil no lo tiene ingresado, faltan datos.
 * - Si incumple un criterio, el estado es 'no_cumples' y especifica el motivo.
 * - Si cumple todos los criterios evaluados (y hay al menos un criterio exigido evaluado o perfil completo), 'cumples'.
 */
export function evaluarElegibilidad(
  beca: CriteriosBeca,
  perfil: PerfilUsuario | null | undefined,
): EvaluacionElegibilidad {
  const detalles: DetalleCriterio[] = [];
  const motivosFallo: string[] = [];
  let tieneFaltantes = false;
  let algunCriterioExigido = false;

  const perfilVacio =
    !perfil ||
    ((perfil.saber11 === null || perfil.saber11 === undefined) &&
      (perfil.promedio === null || perfil.promedio === undefined) &&
      (perfil.estrato === null || perfil.estrato === undefined) &&
      (perfil.edad === null || perfil.edad === undefined));

  // 1. Promedio mínimo
  if (beca.promedioMinimo !== null && beca.promedioMinimo !== undefined && beca.promedioMinimo > 0) {
    algunCriterioExigido = true;
    if (perfil?.promedio === null || perfil?.promedio === undefined || isNaN(perfil.promedio)) {
      tieneFaltantes = true;
      detalles.push({
        criterio: 'promedio',
        cumple: null,
        mensaje: `Exige promedio mínimo de ${beca.promedioMinimo}`,
      });
    } else if (perfil.promedio >= beca.promedioMinimo) {
      detalles.push({
        criterio: 'promedio',
        cumple: true,
        mensaje: `Promedio ${perfil.promedio} cumple el mínimo de ${beca.promedioMinimo}`,
      });
    } else {
      motivosFallo.push(`promedio mínimo ${beca.promedioMinimo}`);
      detalles.push({
        criterio: 'promedio',
        cumple: false,
        mensaje: `Promedio ${perfil.promedio} no alcanza el mínimo de ${beca.promedioMinimo}`,
      });
    }
  }

  // 2. Puntaje Saber 11 mínimo
  if (
    beca.puntajeSaber11Minimo !== null &&
    beca.puntajeSaber11Minimo !== undefined &&
    beca.puntajeSaber11Minimo > 0
  ) {
    algunCriterioExigido = true;
    if (perfil?.saber11 === null || perfil?.saber11 === undefined || isNaN(perfil.saber11)) {
      tieneFaltantes = true;
      detalles.push({
        criterio: 'saber11',
        cumple: null,
        mensaje: `Exige Saber 11 mínimo de ${beca.puntajeSaber11Minimo} puntos`,
      });
    } else if (perfil.saber11 >= beca.puntajeSaber11Minimo) {
      detalles.push({
        criterio: 'saber11',
        cumple: true,
        mensaje: `Saber 11 de ${perfil.saber11} puntos cumple el mínimo de ${beca.puntajeSaber11Minimo}`,
      });
    } else {
      motivosFallo.push(`Saber 11 mínimo de ${beca.puntajeSaber11Minimo} puntos`);
      detalles.push({
        criterio: 'saber11',
        cumple: false,
        mensaje: `Saber 11 de ${perfil.saber11} puntos no alcanza el mínimo de ${beca.puntajeSaber11Minimo}`,
      });
    }
  }

  // 3. Estrato socioeconómico
  const estratosValidos = parseEstratos(beca.estratoSocioeconomico);
  if (estratosValidos.length > 0) {
    algunCriterioExigido = true;
    if (perfil?.estrato === null || perfil?.estrato === undefined || isNaN(perfil.estrato)) {
      tieneFaltantes = true;
      detalles.push({
        criterio: 'estrato',
        cumple: null,
        mensaje: `Exige estrato ${estratosValidos.join(', ')}`,
      });
    } else if (estratosValidos.includes(perfil.estrato)) {
      detalles.push({
        criterio: 'estrato',
        cumple: true,
        mensaje: `Estrato ${perfil.estrato} admitido (${estratosValidos.join(', ')})`,
      });
    } else {
      motivosFallo.push(`estrato admitido ${estratosValidos.join(', ')}`);
      detalles.push({
        criterio: 'estrato',
        cumple: false,
        mensaje: `Estrato ${perfil.estrato} no está entre los admitidos (${estratosValidos.join(', ')})`,
      });
    }
  }

  // 4. Edad (edadMinima y edadMaxima)
  if (
    (beca.edadMinima !== null && beca.edadMinima !== undefined) ||
    (beca.edadMaxima !== null && beca.edadMaxima !== undefined)
  ) {
    algunCriterioExigido = true;
    if (perfil?.edad === null || perfil?.edad === undefined || isNaN(perfil.edad)) {
      tieneFaltantes = true;
      detalles.push({
        criterio: 'edad',
        cumple: null,
        mensaje: `Exige rango de edad (${beca.edadMinima ?? 0} a ${beca.edadMaxima ?? 'sin límite'})`,
      });
    } else {
      let edadCumple = true;
      if (beca.edadMinima && perfil.edad < beca.edadMinima) {
        edadCumple = false;
        motivosFallo.push(`edad mínima ${beca.edadMinima} años`);
      }
      if (beca.edadMaxima && perfil.edad > beca.edadMaxima) {
        edadCumple = false;
        motivosFallo.push(`edad máxima ${beca.edadMaxima} años`);
      }

      detalles.push({
        criterio: 'edad',
        cumple: edadCumple,
        mensaje: edadCumple
          ? `Edad ${perfil.edad} dentro del rango`
          : `Edad ${perfil.edad} fuera del rango permitido`,
      });
    }
  }

  // Determinación de resultado
  if (motivosFallo.length > 0) {
    return {
      estado: 'no_cumples',
      motivo: motivosFallo.join('; '),
      detalles,
    };
  }

  if (perfilVacio || tieneFaltantes || !algunCriterioExigido) {
    return {
      estado: 'faltan_datos',
      motivo: !algunCriterioExigido ? 'Sin requisitos específicos registrados' : 'Faltan datos de tu perfil',
      detalles,
    };
  }

  return {
    estado: 'cumples',
    detalles,
  };
}

