import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/becas
 *
 * Lista becas con el nuevo esquema de Medellín y área metropolitana.
 * Filtros opcionales:
 * - tipo / nivel: pregrado | posgrado | maestría | doctorado | técnico
 * - estado: abierta | cerrada
 * - municipio / ciudad: nombre de municipio
 * - universidad: nombre de la universidad
 * - cobertura: total | parcial
 * - q: búsqueda textual
 * - page: número de página (default: 1)
 * - limit: resultados por página (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const tipo = searchParams.get('tipo');
    const estado = searchParams.get('estado');
    const ciudad = searchParams.get('ciudad') || searchParams.get('municipio');
    const universidad = searchParams.get('universidad');
    const cobertura = searchParams.get('cobertura');
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (tipo) {
      where.nivelAcademico = { contains: tipo };
    }

    if (estado) {
      where.estadoConvocatoria = { contains: estado };
    }

    // El filtro "ciudad" filtra por la ciudad de la sede de la universidad
    if (ciudad || universidad) {
      where.universidadRel = {
        ...(ciudad ? { ciudad: { contains: ciudad } } : {}),
        ...(universidad ? { nombre: { contains: universidad } } : {}),
      };
    }

    if (cobertura) {
      if (cobertura.toLowerCase() === 'total') {
        where.OR = [
          { porcentaje: { contains: '100' } },
          { tipoFinanciacion: { contains: 'Total' } },
          { cobertura: { contains: '100' } },
        ];
      } else if (cobertura.toLowerCase() === 'parcial') {
        where.tipoFinanciacion = { contains: 'Parcial' };
      }
    }

    if (query) {
      where.OR = [
        { nombreBeca: { contains: query } },
        { descripcion: { contains: query } },
        { universidad: { contains: query } },
        { requisitos: { contains: query } },
        { poblacionObjetivo: { contains: query } },
      ];
    }

    const [becas, total] = await Promise.all([
      prisma.beca.findMany({
        where,
        include: {
          universidadRel: {
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
          { idBeca: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.beca.count({ where }),
    ]);

    // Format data with both clean typed properties and aliases for seamless compatibility
    const formattedBecas = becas.map((b) => ({
      ...b,
      // Backward compatibility aliases
      titulo: b.nombreBeca,
      tipo: b.nivelAcademico || 'Pregrado',
      ciudad: b.municipioAplicacion,
      departamento: 'Antioquia',
      urlOriginal: b.enlaceOficial || '',
      fuente: 'Universidad',
      estado: b.estadoConvocatoria?.toLowerCase().includes('abierta')
        ? 'activa'
        : b.estadoConvocatoria?.toLowerCase().includes('cerrada')
        ? 'vencida'
        : 'proxima',
    }));

    return NextResponse.json({
      data: formattedBecas,
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
