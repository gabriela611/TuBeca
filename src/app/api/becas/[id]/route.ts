import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/becas/[id]
 *
 * Obtiene el detalle completo de una beca por su ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const beca = await prisma.beca.findUnique({
      where: { id },
      include: {
        universidad: true,
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

    return NextResponse.json({ data: beca });
  } catch (error) {
    console.error('[API /becas/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener la beca' },
      { status: 500 },
    );
  }
}
