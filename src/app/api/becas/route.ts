import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/becas
 *
 * Lista becas con filtros opcionales:
 * - tipo: pregrado | posgrado | doctorado | tecnico
 * - estado: activa | vencida | proxima
 * - ciudad: nombre de la ciudad
 * - departamento: nombre del departamento
 * - universidad: nombre de la universidad
 * - fuente: icetex | colfuturo | universidad | mineducacion | manual
 * - cobertura: total | parcial
 * - q: búsqueda por texto en título y descripción
 * - page: número de página (default: 1)
 * - limit: resultados por página (default: 12)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const tipo = searchParams.get('tipo');
    const estado = searchParams.get('estado');
    const ciudad = searchParams.get('ciudad');
    const departamento = searchParams.get('departamento');
    const universidad = searchParams.get('universidad');
    const fuente = searchParams.get('fuente');
    const cobertura = searchParams.get('cobertura');
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '12', 10), 50);
    const skip = (page - 1) * limit;

    // Construir filtros dinámicamente
    const where: Record<string, unknown> = {};

    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    if (ciudad) where.ciudad = { contains: ciudad };
    if (departamento) where.departamento = { contains: departamento };
    if (fuente) where.fuente = fuente;
    if (cobertura) where.cobertura = cobertura;

    if (universidad) {
      where.universidad = {
        nombre: { contains: universidad },
      };
    }

    if (query) {
      where.OR = [
        { titulo: { contains: query } },
        { descripcion: { contains: query } },
      ];
    }

    const [becas, total] = await Promise.all([
      prisma.beca.findMany({
        where,
        include: {
          universidad: {
            select: {
              id: true,
              nombre: true,
              ciudad: true,
              tipo: true,
              logoUrl: true,
            },
          },
          categorias: {
            include: {
              categoria: {
                select: { id: true, nombre: true },
              },
            },
          },
        },
        orderBy: [
          { estado: 'asc' }, // activa primero
          { fechaCierre: 'asc' }, // más próximas a cerrar primero
        ],
        skip,
        take: limit,
      }),
      prisma.beca.count({ where }),
    ]);

    return NextResponse.json({
      data: becas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    if ((error as { digest?: string })?.digest?.startsWith('NEXT_PRERENDER_')) {
      throw error;
    }
    console.error('[API /becas] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener las becas' },
      { status: 500 },
    );
  }
}
