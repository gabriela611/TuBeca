import * as cheerio from 'cheerio';
import type { RawScholarship, Scraper } from './types';
import { safeFetch } from './utils';

/**
 * Scraper genérico para universidades colombianas.
 *
 * Se puede instanciar con la URL de becas de cualquier universidad
 * y un nombre identificador. Los selectores se configuran por universidad.
 *
 * Ejemplo de uso:
 *   new UniversidadScraper({
 *     name: 'Uniandes',
 *     fuente: 'universidad',
 *     baseUrl: 'https://uniandes.edu.co',
 *     becasPath: '/becas',
 *     selectors: { container: '.beca-card', ... }
 *   })
 */

interface UniversidadScraperConfig {
  name: string;
  fuente?: string;
  baseUrl: string;
  becasPath: string;
  selectors: {
    /** Selector del contenedor de cada beca */
    container: string;
    /** Selector del título dentro del contenedor */
    titulo: string;
    /** Selector de la descripción */
    descripcion: string;
    /** Selector del enlace */
    enlace: string;
    /** Selector de la fecha de cierre (opcional) */
    fechaCierre?: string;
    /** Selector de requisitos (opcional) */
    requisitos?: string;
  };
}

export class UniversidadScraper implements Scraper {
  name: string;
  fuente: string;
  private config: UniversidadScraperConfig;

  constructor(config: UniversidadScraperConfig) {
    this.config = config;
    this.name = config.name;
    this.fuente = config.fuente || 'universidad';
  }

  async scrape(): Promise<RawScholarship[]> {
    const scholarships: RawScholarship[] = [];
    const { baseUrl, becasPath, selectors } = this.config;

    try {
      const response = await safeFetch(`${baseUrl}${becasPath}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      $(selectors.container).each((_, element) => {
        const titulo = $(element).find(selectors.titulo).text().trim();
        const descripcion = $(element).find(selectors.descripcion).text().trim();
        const rawUrl = $(element).find(selectors.enlace).attr('href') || '';
        const url = rawUrl.startsWith('http') ? rawUrl : `${baseUrl}${rawUrl}`;

        const fechaCierre = selectors.fechaCierre
          ? $(element).find(selectors.fechaCierre).text().trim()
          : undefined;

        const requisitos = selectors.requisitos
          ? $(element).find(selectors.requisitos).text().trim()
          : undefined;

        if (titulo) {
          scholarships.push({
            titulo,
            descripcion,
            url,
            universidad: this.name,
            fechaCierre: fechaCierre || undefined,
            requisitos: requisitos || undefined,
          });
        }
      });
    } catch (error) {
      console.error(`[${this.name} Scraper] Error:`, error);
      throw error;
    }

    return scholarships;
  }
}

/**
 * Configuraciones predefinidas de universidades colombianas.
 *
 * IMPORTANTE: Los selectores deben verificarse inspeccionando
 * la estructura HTML real de cada sitio web.
 */
export const universidadConfigs: UniversidadScraperConfig[] = [
  {
    name: 'Universidad de los Andes',
    baseUrl: 'https://uniandes.edu.co',
    becasPath: '/becas',
    selectors: {
      container: '.beca-item, article.scholarship',
      titulo: 'h2, h3, .title',
      descripcion: 'p, .description',
      enlace: 'a',
      fechaCierre: '.fecha-cierre, .deadline',
    },
  },
  {
    name: 'Universidad Nacional de Colombia',
    baseUrl: 'https://unal.edu.co',
    becasPath: '/becas-y-apoyos',
    selectors: {
      container: '.beca-card, .apoyo-item',
      titulo: 'h3, .titulo',
      descripcion: '.resumen, p',
      enlace: 'a',
    },
  },
  {
    name: 'Universidad de Antioquia',
    baseUrl: 'https://udea.edu.co',
    becasPath: '/becas',
    selectors: {
      container: '.field-item, article',
      titulo: 'h2, h3',
      descripcion: '.field-body, p',
      enlace: 'a',
    },
  },
  {
    name: 'Universidad del Norte',
    baseUrl: 'https://uninorte.edu.co',
    becasPath: '/becas-financiamiento',
    selectors: {
      container: '.beca-item, .card',
      titulo: 'h3, .card-title',
      descripcion: '.card-text, p',
      enlace: 'a',
    },
  },
  {
    name: 'Pontificia Universidad Javeriana',
    baseUrl: 'https://javeriana.edu.co',
    becasPath: '/becas',
    selectors: {
      container: '.beca-card, .item-beca',
      titulo: 'h3, .title',
      descripcion: '.excerpt, p',
      enlace: 'a',
    },
  },
  {
    name: 'Universidad EAFIT',
    baseUrl: 'https://www.eafit.edu.co',
    becasPath: '/becas-y-financiacion',
    selectors: {
      container: '.card, article',
      titulo: 'h3, .card-title',
      descripcion: '.card-body p, .description',
      enlace: 'a',
    },
  },
];
