import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuarioId');

    if (!usuarioId) {
      return NextResponse.json({ error: 'usuarioId es requerido' }, { status: 400 });
    }

    const favoritos = await prisma.favorito.findMany({
      where: { usuarioId },
      select: { becaId: true },
    });

    return NextResponse.json({
      favoritos: favoritos.map((f) => f.becaId),
    });
  } catch (error) {
    console.error('Error en GET /api/usuario/favoritos:', error);
    return NextResponse.json({ error: 'Error al consultar favoritos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuarioId, becaId, action = 'toggle' } = body;

    if (!usuarioId || !becaId) {
      return NextResponse.json({ error: 'usuarioId y becaId son requeridos' }, { status: 400 });
    }

    const existing = await prisma.favorito.findUnique({
      where: {
        usuarioId_becaId: {
          usuarioId,
          becaId,
        },
      },
    });

    let isFavorite = false;

    if (action === 'remove' || (action === 'toggle' && existing)) {
      if (existing) {
        await prisma.favorito.delete({
          where: { id: existing.id },
        });
      }
      isFavorite = false;
    } else {
      if (!existing) {
        await prisma.favorito.create({
          data: {
            usuarioId,
            becaId,
          },
        });
      }
      isFavorite = true;
    }

    const allUserFavoritos = await prisma.favorito.findMany({
      where: { usuarioId },
      select: { becaId: true },
    });

    return NextResponse.json({
      isFavorite,
      favoritos: allUserFavoritos.map((f) => f.becaId),
    });
  } catch (error) {
    console.error('Error en POST /api/usuario/favoritos:', error);
    return NextResponse.json({ error: 'Error al actualizar favorito' }, { status: 500 });
  }
}
