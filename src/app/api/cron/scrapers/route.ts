import { NextRequest, NextResponse } from 'next/server';
import { executeScrapers } from '@/lib/scrapers/run';

export async function GET(request: NextRequest) {
  return handleScrapersCron(request);
}

export async function POST(request: NextRequest) {
  return handleScrapersCron(request);
}

async function handleScrapersCron(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get('dryRun') === '1' || searchParams.get('dryRun') === 'true';
  const fuente = searchParams.get('fuente');

  // Validar autorización de Cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = Boolean(request.headers.get('x-vercel-cron'));

  if (cronSecret && !isVercelCron) {
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere encabezado Authorization: Bearer $CRON_SECRET' },
        { status: 401 }
      );
    }
  }

  try {
    const summary = await executeScrapers({
      fuente,
      dryRun,
    });

    return NextResponse.json({
      success: true,
      dryRun,
      fuente: fuente || 'todas',
      summary,
    });
  } catch (error) {
    console.error('Error en cron de scrapers:', error);
    return NextResponse.json({ error: 'Error ejecutando scrapers' }, { status: 500 });
  }
}

