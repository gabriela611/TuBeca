import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/becas/[id]
 *
 * Obtiene el detalle completo de una beca por su ID o ID de Beca (e.g. MED-001).
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const beca = await prisma.beca.findFirst({
      where: {
        OR: [{ id }, { idBeca: id }],
      },
      include: {
        universidadRel: true,
        categorias: {
          include: {
            categoria: true,
          },
        },
      },
    });

    if (!beca) {
      return NextResponse.json(
        { error: 'Beca no encontrada' },
        { status: 404 },
      );
    }

    const formattedBeca = {
      ...beca,
      titulo: beca.nombreBeca,
      tipo: beca.nivelAcademico || 'Pregrado',
      ciudad: beca.municipioAplicacion,
      departamento: 'Antioquia',
      urlOriginal: beca.enlaceOficial || '',
      fuente: 'Universidad',
      estado: beca.estadoConvocatoria?.toLowerCase().includes('abierta')
        ? 'activa'
        : beca.estadoConvocatoria?.toLowerCase().includes('cerrada')
        ? 'vencida'
        : 'proxima',
    };

    return NextResponse.json({ data: formattedBeca });
  } catch (error: unknown) {
    if ((error as { digest?: string })?.digest?.startsWith('NEXT_PRERENDER_')) {
      throw error;
    }
    console.error('[API /becas/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener la beca' },
      { status: 500 },
    );
  }
}
