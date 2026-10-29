import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/universidades
 *
 * Retorna la lista de universidades registradas con el conteo de becas activas.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const ciudad = searchParams.get('ciudad');
    const tipo = searchParams.get('tipo'); // "publica" | "privada"

    const where: Record<string, unknown> = {};
    if (ciudad) where.ciudad = { contains: ciudad };
    if (tipo) where.tipo = tipo;

    const universidades = await prisma.universidad.findMany({
      where,
      include: {
        _count: {
          select: {
            becas: {
              where: {
                estado: { in: ['activa', 'proxima'] },
              },
            },
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json({
      data: universidades.map((u) => ({
        id: u.id,
        nombre: u.nombre,
        ciudad: u.ciudad,
        departamento: u.departamento,
        sitioWeb: u.sitioWeb,
        logoUrl: u.logoUrl,
        tipo: u.tipo,
        becasActivasCount: u._count.becas,
      })),
    });
  } catch (error: unknown) {
    if ((error as { digest?: string })?.digest?.startsWith('NEXT_PRERENDER_')) {
      throw error;
    }
    console.error('[API /universidades] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener universidades' },
      { status: 500 },
    );
  }
}

