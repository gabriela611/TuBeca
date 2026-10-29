import type { RawScholarship, NormalizedScholarship } from './scrapers/types';

/**
 * Normaliza los datos crudos de un scraper a un formato estándar
 * listo para guardar en la base de datos.
 */
export function normalize(
  raw: RawScholarship,
  fuente: string,
): NormalizedScholarship {
  const fechaCierre = parseDate(raw.fechaCierre);
  const fechaInicio = parseDate(raw.fechaInicio);

  return {
    titulo: cleanText(raw.titulo),
    descripcion: cleanHTML(raw.descripcion),
    universidadNombre: raw.universidad?.trim(),
    ciudad: raw.ciudad?.trim(),
    departamento: raw.departamento?.trim(),
    tipo: detectTipo(raw.tipo || `${raw.titulo} ${raw.descripcion}`),
    modalidad: detectModalidad(raw.modalidad || raw.descripcion),
    cobertura: detectCobertura(raw.cobertura, raw.porcentajeCobertura),
    porcentajeCobertura: raw.porcentajeCobertura,
    fechaInicio: fechaInicio ?? undefined,
    fechaCierre: fechaCierre ?? undefined,
    requisitos: raw.requisitos ? cleanText(raw.requisitos) : undefined,
    urlOriginal: raw.url,
    fuente,
    estado: getEstado(fechaInicio, fechaCierre),
  };
}

/**
 * Normaliza un array completo de becas crudas.
 * Filtra duplicados basándose en la URL original.
 */
export function normalizeAll(
  raws: RawScholarship[],
  fuente: string,
): NormalizedScholarship[] {
  const seen = new Set<string>();
  const results: NormalizedScholarship[] = [];

  for (const raw of raws) {
    // Deduplicar por URL
    const key = raw.url.toLowerCase().replace(/\/$/, '');
    if (seen.has(key)) continue;
    seen.add(key);

    try {
      results.push(normalize(raw, fuente));
    } catch (error) {
      console.warn(`[Normalizer] Error procesando "${raw.titulo}":`, error);
    }
  }

  return results;
}

// --- Utilidades internas ---

/** Limpia texto removiendo espacios extra, saltos de línea, etc. */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
}

/** Remueve tags HTML y limpia el texto resultante */
function cleanHTML(html: string): string {
  return cleanText(
    html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>'),
  );
}

/**
 * Detecta el tipo de beca basándose en palabras clave.
 * Busca en el texto proporcionado (título + descripción).
 */
function detectTipo(text: string): NormalizedScholarship['tipo'] {
  const lower = text.toLowerCase();

  if (lower.includes('doctorado') || lower.includes('phd') || lower.includes('doctoral')) {
    return 'doctorado';
  }
  if (
    lower.includes('maestría') ||
    lower.includes('maestria') ||
    lower.includes('posgrado') ||
    lower.includes('postgrado') ||
    lower.includes('especialización') ||
    lower.includes('master') ||
    lower.includes('mba')
  ) {
    return 'posgrado';
  }
  if (
    lower.includes('técnico') ||
    lower.includes('tecnico') ||
    lower.includes('tecnológico') ||
    lower.includes('tecnologico') ||
    lower.includes('sena')
  ) {
    return 'tecnico';
  }

  return 'pregrado';
}

/** Detecta la modalidad basándose en palabras clave */
function detectModalidad(text?: string): NormalizedScholarship['modalidad'] {
  if (!text) return undefined;
  const lower = text.toLowerCase();

  if (lower.includes('híbrida') || lower.includes('hibrida') || lower.includes('blended')) {
    return 'hibrida';
  }
  if (lower.includes('virtual') || lower.includes('en línea') || lower.includes('online') || lower.includes('distancia')) {
    return 'virtual';
  }
  if (lower.includes('presencial')) {
    return 'presencial';
  }

  return undefined;
}

/** Detecta el tipo de cobertura */
function detectCobertura(
  cobertura?: string,
  porcentaje?: number,
): NormalizedScholarship['cobertura'] {
  if (cobertura) {
    const lower = cobertura.toLowerCase();
    if (lower.includes('total') || lower.includes('completa') || lower.includes('100')) {
      return 'total';
    }
    if (lower.includes('parcial')) {
      return 'parcial';
    }
  }

  if (porcentaje !== undefined) {
    return porcentaje >= 100 ? 'total' : 'parcial';
  }

  return undefined;
}

/**
 * Parsea una fecha en formato colombiano o ISO.
 * Soporta: "15 de marzo de 2027", "15/03/2027", "2027-03-15", etc.
 */
function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;

  const cleaned = dateStr.trim();

  // ISO format: 2027-03-15
  if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) {
    const d = new Date(cleaned);
    return isNaN(d.getTime()) ? null : d;
  }

  // DD/MM/YYYY o DD-MM-YYYY
  const slashMatch = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slashMatch) {
    const d = new Date(
      parseInt(slashMatch[3]),
      parseInt(slashMatch[2]) - 1,
      parseInt(slashMatch[1]),
    );
    return isNaN(d.getTime()) ? null : d;
  }

  // "15 de marzo de 2027" (formato colombiano)
  const meses: Record<string, number> = {
    enero: 0, febrero: 1, marzo: 2, abril: 3,
    mayo: 4, junio: 5, julio: 6, agosto: 7,
    septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
  };

  const spanishMatch = cleaned
    .toLowerCase()
    .match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/);

  if (spanishMatch) {
    const month = meses[spanishMatch[2]];
    if (month !== undefined) {
      const d = new Date(
        parseInt(spanishMatch[3]),
        month,
        parseInt(spanishMatch[1]),
      );
      return isNaN(d.getTime()) ? null : d;
    }
  }

  return null;
}

/**
 * Determina el estado de una beca basándose en sus fechas.
 */
function getEstado(
  fechaInicio?: Date | null,
  fechaCierre?: Date | null,
): NormalizedScholarship['estado'] {
  const now = new Date();

  if (fechaCierre && fechaCierre < now) {
    return 'vencida';
  }

  if (fechaInicio && fechaInicio > now) {
    return 'proxima';
  }

  return 'activa';
}
