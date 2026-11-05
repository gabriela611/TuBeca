import { diasRestantes } from './countdown';
import { parseCoveragePercentage } from './coverage';

export interface SortableBeca {
  id?: string;
  idBeca?: string | null;
  fechaCierre?: Date | string | null;
  porcentaje?: string | null;
  tipoFinanciacion?: string | null;
  cobertura?: string | null;
  porcentajeCobertura?: number | null;
  fechaActualizacion?: Date | string | null;
}

/**
 * Ordena un listado de becas según el criterio seleccionado.
 * Las becas vencidas siempre van al final.
 * Criterios:
 * - 'cierra_pronto': fecha de cierre más próxima primero (abiertas con fecha -> abiertas sin fecha -> vencidas)
 * - 'mayor_cobertura': mayor porcentaje de cobertura primero
 * - 'recientes': actualización más reciente primero
 */
export function sortBecas<T extends SortableBeca>(
  becas: T[],
  orden: string = 'cierra_pronto',
): T[] {
  return [...becas].sort((a, b) => {
    const cdA = diasRestantes(a.fechaCierre);
    const cdB = diasRestantes(b.fechaCierre);

    // 1. Las becas vencidas van al final en todos los ordenamientos
    if (cdA.esVencida !== cdB.esVencida) {
      return cdA.esVencida ? 1 : -1;
    }

    if (orden === 'cierra_pronto') {
      // Becas con fecha de cierre definida antes que las sin fecha
      if (cdA.dias !== null && cdB.dias !== null) {
        return cdA.dias - cdB.dias;
      }
      if (cdA.dias !== null && cdB.dias === null) return -1;
      if (cdA.dias === null && cdB.dias !== null) return 1;
      return 0;
    }

    if (orden === 'mayor_cobertura') {
      const covA = parseCoveragePercentage(a.porcentaje, a.tipoFinanciacion, a.cobertura, a.porcentajeCobertura);
      const covB = parseCoveragePercentage(b.porcentaje, b.tipoFinanciacion, b.cobertura, b.porcentajeCobertura);
      if (covB !== covA) {
        return covB - covA;
      }
      // Secundario: fecha de cierre más próxima
      if (cdA.dias !== null && cdB.dias !== null) {
        return cdA.dias - cdB.dias;
      }
      return 0;
    }

    if (orden === 'recientes') {
      const dateA = a.fechaActualizacion ? new Date(a.fechaActualizacion).getTime() : 0;
      const dateB = b.fechaActualizacion ? new Date(b.fechaActualizacion).getTime() : 0;
      if (dateB !== dateA) {
        return dateB - dateA;
      }
      return (a.idBeca || a.id || '').localeCompare(b.idBeca || b.id || '');
    }

    return 0;
  });
}

