import { executeScrapers } from '../src/lib/scrapers/run';
import { prisma } from '../src/lib/db/prisma';

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

  const summary = await executeScrapers({
    fuente: fuenteFilter,
    dryRun,
  });

  for (const r of summary.results) {
    if (r.success) {
      console.log(`▶️  [${r.fuente}] ✅ ${r.scholarships.length} becas encontradas (${r.duration}ms)`);
    } else {
      console.log(`▶️  [${r.fuente}] ❌ Error (${r.duration}ms): ${r.error}`);
    }
  }

  console.log('\n📊 Resumen');
  console.log('==========');
  console.log(`✅ Exitosos: ${summary.exitosos}/${summary.totalScrapers}`);
  console.log(`📚 Total becas encontradas: ${summary.totalBecasEncontradas}`);
  if (!dryRun) {
    console.log(`💾 BD: ${summary.nuevasGuardadas} nuevas, ${summary.actualizadasGuardadas} actualizadas`);
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
