import { prisma } from '@/lib/db/prisma';
import { normalizeAll } from '@/lib/normalizer';
import { IcetexScraper } from './icetex';
import { ColfuturoScraper } from './colfuturo';
import { UniversidadScraper, universidadConfigs } from './universidad';
import type { Scraper, ScraperResult } from './types';

export interface ScraperExecutionSummary {
  totalScrapers: number;
  exitosos: number;
  fallidos: number;
  totalBecasEncontradas: number;
  nuevasGuardadas: number;
  actualizadasGuardadas: number;
  results: ScraperResult[];
}

export async function executeScrapers(options: {
  fuente?: string | null;
  dryRun?: boolean;
}): Promise<ScraperExecutionSummary> {
  const { fuente, dryRun = false } = options;

  const scrapers: Scraper[] = [
    new IcetexScraper(),
    new ColfuturoScraper(),
    ...universidadConfigs.map((config) => new UniversidadScraper(config)),
  ];

  const selectedScrapers = fuente
    ? scrapers.filter(
        (s) =>
          s.name.toLowerCase().includes(fuente.toLowerCase()) ||
          s.fuente.toLowerCase().includes(fuente.toLowerCase())
      )
    : scrapers;

  const results: ScraperResult[] = [];
  let totalNuevas = 0;
  let totalActualizadas = 0;

  for (const scraper of selectedScrapers) {
    const start = Date.now();

    try {
      const rawData = await scraper.scrape();
      const duration = Date.now() - start;

      results.push({
        fuente: scraper.fuente,
        success: true,
        scholarships: rawData,
        duration,
      });

      if (!dryRun && rawData.length > 0) {
        const normalized = normalizeAll(rawData, scraper.fuente);

        for (const beca of normalized) {
          const existing = await prisma.beca.findFirst({
            where: { enlaceOficial: beca.urlOriginal },
          });

          let universidadId: string | null = null;
          if (beca.universidadNombre) {
            const uni = await prisma.universidad.findFirst({
              where: { nombre: { contains: beca.universidadNombre, mode: 'insensitive' } },
            });
            universidadId = uni?.id || null;
          }

          const dbData = {
            idBeca: beca.urlOriginal,
            nombreBeca: beca.titulo,
            descripcion: beca.descripcion,
            universidad: beca.universidadNombre || 'Universidad',
            universidadId,
            municipioAplicacion: beca.ciudad,
            nivelAcademico: beca.tipo,
            modalidad: beca.modalidad,
            cobertura: beca.cobertura,
            porcentaje: beca.porcentajeCobertura ? `${beca.porcentajeCobertura}%` : null,
            fechaApertura: beca.fechaInicio,
            fechaCierre: beca.fechaCierre,
            requisitos: beca.requisitos,
            enlaceOficial: beca.urlOriginal,
            estadoConvocatoria: beca.estado,
          };

          if (existing) {
            await prisma.beca.update({
              where: { id: existing.id },
              data: dbData,
            });
            totalActualizadas++;
          } else {
            await prisma.beca.create({
              data: {
                id: `SCRAP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                ...dbData,
              },
            });
            totalNuevas++;
          }
        }
      }
    } catch (error) {
      const duration = Date.now() - start;
      results.push({
        fuente: scraper.fuente,
        success: false,
        scholarships: [],
        error: error instanceof Error ? error.message : String(error),
        duration,
      });
    }
  }

  const exitosos = results.filter((r) => r.success).length;
  const fallidos = results.filter((r) => !r.success).length;
  const totalBecasEncontradas = results.reduce((acc, r) => acc + (r.scholarships?.length || 0), 0);

  return {
    totalScrapers: selectedScrapers.length,
    exitosos,
    fallidos,
    totalBecasEncontradas,
    nuevasGuardadas: totalNuevas,
    actualizadasGuardadas: totalActualizadas,
    results,
  };
}

