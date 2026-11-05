export type EstadoConvocatoria = 'activa' | 'proxima' | 'vencida';

/**
 * Convierte una fecha a string YYYY-MM-DD en la zona horaria America/Bogota.
 */
export function toBogotaDateString(date: Date | string | null | undefined): string {
  if (!date) return '';
  if (typeof date === 'string') {
    const trimmed = date.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
  }
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!d || isNaN(d.getTime())) return '';
  
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d); // "YYYY-MM-DD"
}

/**
 * Obtiene la fecha actual en America/Bogota como string YYYY-MM-DD.
 */
export function getHoyBogotaString(): string {
  return toBogotaDateString(new Date());
}

/**
 * Calcula el estado de una convocatoria ('activa' | 'proxima' | 'vencida')
 * basándose en fechas calculadas en zona horaria America/Bogota.
 * Si faltan fechas, utiliza el texto de estadoConvocatoria como respaldo.
 */
export function calcularEstado(
  fechaApertura?: Date | string | null,
  fechaCierre?: Date | string | null,
  hoy?: Date | string | null,
  fallbackTexto?: string | null,
): EstadoConvocatoria {
  const hoyStr = hoy ? toBogotaDateString(hoy) : getHoyBogotaString();
  const aperturaStr = fechaApertura ? toBogotaDateString(fechaApertura) : null;
  const cierreStr = fechaCierre ? toBogotaDateString(fechaCierre) : null;

  // 1. Si tenemos fecha de cierre y ya pasó respecto a hoy en Bogotá -> Vencida
  if (cierreStr && cierreStr < hoyStr) {
    return 'vencida';
  }

  // 2. Si tenemos fecha de apertura y es futura respecto a hoy -> Próxima
  if (aperturaStr && aperturaStr > hoyStr) {
    return 'proxima';
  }

  // 3. Si tenemos apertura y/o cierre y está dentro del rango -> Activa
  if (cierreStr && cierreStr >= hoyStr) {
    return 'activa';
  }

  if (aperturaStr && aperturaStr <= hoyStr) {
    return 'activa';
  }

  // 4. Fallback si no hay fechas definidas
  if (fallbackTexto) {
    const txt = fallbackTexto.toLowerCase();
    if (txt.includes('cerrad') || txt.includes('vencid') || txt.includes('finaliz')) {
      return 'vencida';
    }
    if (txt.includes('próxim') || txt.includes('proxim') || txt.includes('pronto')) {
      return 'proxima';
    }
    if (txt.includes('abiert') || txt.includes('vigente')) {
      return 'activa';
    }
  }

  return 'activa';
}

