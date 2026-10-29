import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/categorias
 *
 * Retorna la lista de categorías con conteo de becas asociadas.
 */
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      include: {
        _count: {
          select: {
            becas: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json({
      data: categorias.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        descripcion: c.descripcion,
        becasCount: c._count.becas,
      })),
    });
  } catch (error) {
    console.error('[API /categorias] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 },
    );
  }
}

