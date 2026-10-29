import * as cheerio from 'cheerio';
import type { RawScholarship, Scraper } from './types';
import { safeFetch } from './utils';

/**
 * Scraper para Colfuturo (colfuturo.org)
 *
 * NOTA: Los selectores CSS deben ajustarse inspeccionando la estructura
 * HTML real del sitio. Los actuales son placeholders.
 */
export class ColfuturoScraper implements Scraper {
  name = 'Colfuturo';
  fuente = 'colfuturo';

  private baseUrl = 'https://www.colfuturo.org';

  async scrape(): Promise<RawScholarship[]> {
    const scholarships: RawScholarship[] = [];

    try {
      const response = await safeFetch(`${this.baseUrl}/programas`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // TODO: Ajustar selectores según la estructura HTML real
      $('.programa-item, .beca-card, article').each((_, element) => {
        const titulo = $(element).find('h2, h3, .title').text().trim();
        const descripcion = $(element).find('p, .description, .excerpt').text().trim();
        const url = $(element).find('a').attr('href') || '';
        const fechaCierre = $(element).find('.fecha, .date, .deadline').text().trim();

        if (titulo) {
          scholarships.push({
            titulo,
            descripcion,
            url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
            universidad: 'Colfuturo',
            tipo: 'posgrado',
            fechaCierre: fechaCierre || undefined,
          });
        }
      });
    } catch (error) {
      console.error(`[Colfuturo Scraper] Error:`, error);
      throw error;
    }

    return scholarships;
  }
}
