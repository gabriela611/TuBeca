import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuarioId, email, localFavoritos = [], perfil } = body;

    if (!usuarioId || !email) {
      return NextResponse.json({ error: 'usuarioId y email son requeridos' }, { status: 400 });
    }

    // 1. Upsert usuario
    const perfilData = {
      ...(perfil?.puntajeSaber11 !== undefined && { puntajeSaber11: perfil.puntajeSaber11 ? Number(perfil.puntajeSaber11) : null }),
      ...(perfil?.promedio !== undefined && { promedio: perfil.promedio ? Number(perfil.promedio) : null }),
      ...(perfil?.estrato !== undefined && { estrato: perfil.estrato ? Number(perfil.estrato) : null }),
      ...(perfil?.edad !== undefined && { edad: perfil.edad ? Number(perfil.edad) : null }),
    };

    const usuario = await prisma.usuario.upsert({
      where: { id: usuarioId },
      update: {
        email,
        ...perfilData,
      },
      create: {
        id: usuarioId,
        email,
        ...perfilData,
      },
    });

    // 2. Migrar favoritos locales a la base de datos
    if (Array.isArray(localFavoritos) && localFavoritos.length > 0) {
      for (const becaId of localFavoritos) {
        try {
          // Asegurar que la beca existe antes de crear la relación
          const becaExiste = await prisma.beca.findUnique({
            where: { id: becaId },
            select: { id: true },
          });

          if (becaExiste) {
            await prisma.favorito.upsert({
              where: {
                usuarioId_becaId: {
                  usuarioId,
                  becaId,
                },
              },
              update: {},
              create: {
                usuarioId,
                becaId,
              },
            });
          }
        } catch (e) {
          console.warn(`No se pudo sincronizar favorito para beca ${becaId}:`, e);
        }
      }
    }

    // 3. Obtener todos los favoritos del usuario en la base de datos
    const dbFavoritos = await prisma.favorito.findMany({
      where: { usuarioId },
      select: { becaId: true },
    });

    return NextResponse.json({
      success: true,
      usuario,
      favoritos: dbFavoritos.map((f) => f.becaId),
      perfil: {
        puntajeSaber11: usuario.puntajeSaber11 ?? undefined,
        promedio: usuario.promedio ?? undefined,
        estrato: usuario.estrato ?? undefined,
        edad: usuario.edad ?? undefined,
      },
    });
  } catch (error) {
    console.error('Error en /api/usuario/sync:', error);
    return NextResponse.json({ error: 'Error interno sincronizando usuario' }, { status: 500 });
  }
}

