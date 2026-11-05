/**
 * Extrae un porcentaje numérico (0-100) a partir de los campos de cobertura de la beca.
 */
export function parseCoveragePercentage(
  porcentaje?: string | null,
  tipoFinanciacion?: string | null,
  cobertura?: string | null,
  porcentajeCobertura?: number | null,
): number {
  if (typeof porcentajeCobertura === 'number' && porcentajeCobertura > 0) {
    return Math.min(Math.round(porcentajeCobertura), 100);
  }
  if (porcentaje) {
    // Si es un rango como "40 %–100 %", extraer el límite superior
    const rangeMatch = porcentaje.match(/[–-]\s*(\d+)/);
    if (rangeMatch) {
      const val = parseInt(rangeMatch[1], 10);
      if (!isNaN(val) && val > 0 && val <= 100) return val;
    }
    const pctMatch = porcentaje.match(/(\d+)\s*%/);
    if (pctMatch) {
      const val = parseInt(pctMatch[1], 10);
      if (!isNaN(val) && val > 0 && val <= 100) return val;
    }
    const anyDigit = porcentaje.match(/\d+/);
    if (anyDigit) {
      const val = parseInt(anyDigit[0], 10);
      if (!isNaN(val) && val > 0 && val <= 100) return val;
    }
  }

  const text = `${tipoFinanciacion || ''} ${cobertura || ''}`.toLowerCase();
  if (text.includes('total') || text.includes('100')) return 100;
  if (text.includes('parcial') || text.includes('sostenimiento') || text.includes('50')) return 50;
  return 100;
}

