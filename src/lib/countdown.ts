import { toBogotaDateString, getHoyBogotaString } from './estado';

export interface CountdownResult {
  dias: number | null;
  texto: string;
  esVencida: boolean;
  esUrgente: boolean;
}

/**
 * Calcula los días restantes para el cierre de una convocatoria según el calendario de Bogotá.
 * @param fechaCierre Fecha de cierre (Date, string ISO o YYYY-MM-DD)
 * @param hoyBogota Fecha de referencia opcional en formato YYYY-MM-DD (para pruebas)
 */
export function diasRestantes(
  fechaCierre: Date | string | null | undefined,
  hoyBogota: string = getHoyBogotaString(),
): CountdownResult {
  const cierreStr = toBogotaDateString(fechaCierre);
  if (!cierreStr) {
    return {
      dias: null,
      texto: 'Sin fecha de cierre',
      esVencida: false,
      esUrgente: false,
    };
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const tCierre = new Date(`${cierreStr}T00:00:00Z`).getTime();
  const tHoy = new Date(`${hoyBogota}T00:00:00Z`).getTime();
  const dias = Math.round((tCierre - tHoy) / msPerDay);

  if (dias < 0) {
    return {
      dias,
      texto: 'Cerrada',
      esVencida: true,
      esUrgente: false,
    };
  }

  if (dias === 0) {
    return {
      dias: 0,
      texto: 'Cierra hoy',
      esVencida: false,
      esUrgente: true,
    };
  }

  if (dias === 1) {
    return {
      dias: 1,
      texto: 'Queda 1 día',
      esVencida: false,
      esUrgente: true,
    };
  }

  return {
    dias,
    texto: `Quedan ${dias} días`,
    esVencida: false,
    esUrgente: dias <= 7,
  };
}

