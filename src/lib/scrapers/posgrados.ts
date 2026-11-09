import type { RawScholarship, Scraper } from './types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Scraper y proveedor de becas de posgrado (maestrías, doctorados y especializaciones)
 * para Colombia e instituciones internacionales aliadas (MinCiencias, Fulbright,
 * Fundación Carolina, DAAD, Sapiencia, UniAndes, UdeA, Javeriana, EAFIT, etc.).
 */
export class PosgradosScraper implements Scraper {
  name = 'Posgrados Colombia';
  fuente = 'posgrados';

  async scrape(): Promise<RawScholarship[]> {
    const scholarships: RawScholarship[] = [];

    // Cargar desde el repositorio verificado de posgrados
    try {
      const dataPath = path.join(process.cwd(), 'prisma', 'data', 'becas_posgrado.json');
      if (fs.existsSync(dataPath)) {
        const content = fs.readFileSync(dataPath, 'utf8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.becas)) {
          for (const item of parsed.becas) {
            scholarships.push({
              titulo: item.nombre_beca,
              descripcion: item.descripcion || '',
              url: item.enlace_oficial || 'https://tubeca.co/posgrados',
              universidad: item.universidad,
              ciudad: item.municipio_aplicacion || 'Nacional',
              tipo: item.nivel_academico || 'Posgrado',
              modalidad: item.modalidad || 'Presencial',
              cobertura: item.cobertura || item.tipo_financiacion || 'Total',
              porcentajeCobertura: item.porcentaje?.includes('100') ? 100 : 70,
              fechaInicio: item.fecha_apertura || undefined,
              fechaCierre: item.fecha_cierre || undefined,
              requisitos: item.requisitos || undefined,
            });
          }
        }
      }
    } catch (error) {
      console.warn('[Posgrados Scraper] Error cargando becas_posgrado.json:', error);
    }

    return scholarships;
  }
}
