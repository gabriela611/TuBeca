import { prisma } from '../src/lib/db/prisma';
import { normalizeAll } from '../src/lib/normalizer';
import { IcetexScraper } from '../src/lib/scrapers/icetex';
import { ColfuturoScraper } from '../src/lib/scrapers/colfuturo';
import { UniversidadScraper, universidadConfigs } from '../src/lib/scrapers/universidad';
import type { Scraper, ScraperResult } from '../src/lib/scrapers/types';

/**
 * Script para ejecutar todos los scrapers manualmente.
 *
 * Uso: npm run scrape
 *
 * Opciones:
 *   --fuente <nombre>  Ejecutar solo un scraper específico
 *   --dry-run          Solo mostrar resultados, no guardar en BD
 */
async function main() {
  const args = process.argv.slice(2);
  const fuenteFilter = args.includes('--fuente')
    ? args[args.indexOf('--fuente') + 1]
    : null;
  const dryRun = args.includes('--dry-run');

  console.log('🤖 TuBeca Scraper Runner');
  console.log('========================');
  if (dryRun) console.log('⚠️  Modo dry-run: no se guardarán cambios en la BD\n');

  // Registrar todos los scrapers
  const scrapers: Scraper[] = [
    new IcetexScraper(),
    new ColfuturoScraper(),
    ...universidadConfigs.map((config) => new UniversidadScraper(config)),
  ];

  // Filtrar si se especificó una fuente
  const selectedScrapers = fuenteFilter
    ? scrapers.filter((s) => s.name.toLowerCase().includes(fuenteFilter.toLowerCase()))
    : scrapers;

  if (selectedScrapers.length === 0) {
    console.log(`❌ No se encontró ningún scraper que coincida con "${fuenteFilter}"`);
    process.exit(1);
  }

  console.log(`📋 Ejecutando ${selectedScrapers.length} scraper(s)...\n`);

  const results: ScraperResult[] = [];

  for (const scraper of selectedScrapers) {
    console.log(`▶️  [${scraper.name}] Iniciando...`);
    const start = Date.now();

    try {
      const rawData = await scraper.scrape();
      const duration = Date.now() - start;

      console.log(`   ✅ ${rawData.length} becas encontradas (${duration}ms)`);

      results.push({
        fuente: scraper.fuente,
        success: true,
        scholarships: rawData,
        duration,
      });

      if (!dryRun && rawData.length > 0) {
        // Normalizar datos
        const normalized = normalizeAll(rawData, scraper.fuente);
        console.log(`   📋 ${normalized.length} becas normalizadas (${rawData.length - normalized.length} duplicadas removidas)`);

        // Guardar en BD
        let created = 0;
        let updated = 0;

        for (const beca of normalized) {
          const existing = await prisma.beca.findFirst({
            where: { urlOriginal: beca.urlOriginal },
          });

          // Buscar o crear universidad si aplica
          let universidadId: string | undefined;
          if (beca.universidadNombre) {
            const uni = await prisma.universidad.findFirst({
              where: { nombre: { contains: beca.universidadNombre } },
            });
            universidadId = uni?.id;
          }

          const dbData = {
            titulo: beca.titulo,
            descripcion: beca.descripcion,
            universidadId,
            ciudad: beca.ciudad,
            departamento: beca.departamento,
            tipo: beca.tipo,
            modalidad: beca.modalidad,
            cobertura: beca.cobertura,
            porcentajeCobertura: beca.porcentajeCobertura,
            fechaInicio: beca.fechaInicio,
            fechaCierre: beca.fechaCierre,
            requisitos: beca.requisitos,
            urlOriginal: beca.urlOriginal,
            fuente: beca.fuente,
            estado: beca.estado,
          };

          if (existing) {
            await prisma.beca.update({
              where: { id: existing.id },
              data: dbData,
            });
            updated++;
          } else {
            await prisma.beca.create({ data: dbData });
            created++;
          }
        }

        console.log(`   💾 BD: ${created} nuevas, ${updated} actualizadas`);
      }
    } catch (error) {
      const duration = Date.now() - start;
      console.log(`   ❌ Error (${duration}ms):`, error instanceof Error ? error.message : error);

      results.push({
        fuente: scraper.fuente,
        success: false,
        scholarships: [],
        error: error instanceof Error ? error.message : String(error),
        duration,
      });
    }

    console.log('');
  }

  // Resumen final
  console.log('📊 Resumen');
  console.log('==========');
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  const totalScholarships = successful.reduce((sum, r) => sum + r.scholarships.length, 0);

  console.log(`✅ Exitosos: ${successful.length}/${results.length}`);
  console.log(`📚 Total becas encontradas: ${totalScholarships}`);
  if (failed.length > 0) {
    console.log(`❌ Fallidos: ${failed.map((r) => r.fuente).join(', ')}`);
  }
}

main()
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
