import * as cheerio from 'cheerio';
import type { RawScholarship, Scraper } from './types';
import { safeFetch } from './utils';

/**
 * Scraper para ICETEX (portal.icetex.gov.co)
 *
 * NOTA: Los selectores CSS deben ajustarse inspeccionando la estructura
 * HTML real del sitio. Los actuales son placeholders basados en la
 * estructura típica del portal de ICETEX.
 *
 * Si el sitio usa renderizado dinámico (JavaScript), será necesario
 * reemplazar fetch+cheerio por Playwright.
 */
export class IcetexScraper implements Scraper {
  name = 'ICETEX';
  fuente = 'icetex';

  private baseUrl = 'https://portal.icetex.gov.co';

  async scrape(): Promise<RawScholarship[]> {
    const scholarships: RawScholarship[] = [];

    try {
      const response = await safeFetch(`${this.baseUrl}/becas-y-creditos`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // TODO: Ajustar selectores según la estructura HTML real
      // Ejemplo basado en la estructura típica:
      $('article.convocatoria, .beca-item, .scholarship-card').each((_, element) => {
        const titulo = $(element).find('h2, h3, .titulo').text().trim();
        const descripcion = $(element).find('p, .descripcion, .resumen').text().trim();
        const url = $(element).find('a').attr('href') || '';
        const fechaCierre = $(element).find('.fecha-cierre, .deadline').text().trim();

        if (titulo) {
          scholarships.push({
            titulo,
            descripcion,
            url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
            universidad: 'ICETEX',
            fechaCierre: fechaCierre || undefined,
          });
        }
      });
    } catch (error) {
      console.error(`[ICETEX Scraper] Error:`, error);
      throw error;
    }

    return scholarships;
  }
}
