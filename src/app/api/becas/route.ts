import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { calcularEstado } from '@/lib/estado';
import { sortBecas } from '@/lib/sort';

/**
 * GET /api/becas
 *
 * Lista becas con el nuevo esquema de Medellín y área metropolitana.
 * Filtros opcionales:
 * - tipo / nivel: pregrado | posgrado | maestría | doctorado | técnico
 * - estado: activa | proxima | vencida | abierta | cerrada
 * - municipio / ciudad: nombre de municipio
 * - universidad: nombre de la universidad
 * - cobertura: total | parcial
 * - q: búsqueda textual
 * - page: número de página (default: 1)
 * - limit: resultados por página (default: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const tipo = searchParams.get('tipo');
    const estado = searchParams.get('estado');
    const ciudad = searchParams.get('ciudad') || searchParams.get('municipio');
    const universidad = searchParams.get('universidad');
    const cobertura = searchParams.get('cobertura');
    const modalidad = searchParams.get('modalidad');
    const query = searchParams.get('q');
    const orden = searchParams.get('orden') || 'cierra_pronto';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (tipo) {
      where.nivelAcademico = { contains: tipo, mode: 'insensitive' };
    }

    if (modalidad) {
      where.modalidad = { contains: modalidad, mode: 'insensitive' };
    }

    if (estado) {
      const estadoNorm = estado.toLowerCase();
      if (estadoNorm === 'activa' || estadoNorm === 'abierta') {
        where.OR = [
          { fechaCierre: { gte: new Date() } },
          { estadoConvocatoria: { contains: 'abiert', mode: 'insensitive' } },
        ];
      } else if (estadoNorm === 'vencida' || estadoNorm === 'cerrada') {
        where.OR = [
          { fechaCierre: { lt: new Date() } },
          { estadoConvocatoria: { contains: 'cerrad', mode: 'insensitive' } },
        ];
      } else {
        where.estadoConvocatoria = { contains: estado, mode: 'insensitive' };
      }
    }

    // El filtro "ciudad" filtra por la ciudad de la sede de la universidad
    if (ciudad || universidad) {
      where.universidadRel = {
        ...(ciudad ? { ciudad: { contains: ciudad, mode: 'insensitive' } } : {}),
        ...(universidad ? { nombre: { contains: universidad, mode: 'insensitive' } } : {}),
      };
    }

    if (cobertura) {
      if (cobertura.toLowerCase() === 'total') {
        where.OR = [
          { porcentaje: { contains: '100', mode: 'insensitive' } },
          { tipoFinanciacion: { contains: 'Total', mode: 'insensitive' } },
          { cobertura: { contains: '100', mode: 'insensitive' } },
        ];
      } else if (cobertura.toLowerCase() === 'parcial') {
        where.tipoFinanciacion = { contains: 'Parcial', mode: 'insensitive' };
      }
    }

    if (query) {
      where.OR = [
        { nombreBeca: { contains: query, mode: 'insensitive' } },
        { descripcion: { contains: query, mode: 'insensitive' } },
        { universidad: { contains: query, mode: 'insensitive' } },
        { requisitos: { contains: query, mode: 'insensitive' } },
        { poblacionObjetivo: { contains: query, mode: 'insensitive' } },
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
              departamento: true,
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
      ciudad: b.universidadRel?.ciudad || b.municipioAplicacion,
      departamento: b.universidadRel?.departamento || (b.universidadRel?.ciudad === 'Bogotá' ? 'Cundinamarca' : 'Antioquia'),
      urlOriginal: b.enlaceOficial || '',
      fuente: 'Universidad',
      estado: calcularEstado(b.fechaApertura, b.fechaCierre, null, b.estadoConvocatoria),
    }));

    const sortedBecas = sortBecas(formattedBecas, orden);

    return NextResponse.json({
      data: sortedBecas,
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
