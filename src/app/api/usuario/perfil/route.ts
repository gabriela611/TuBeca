import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuarioId');

    if (!usuarioId) {
      return NextResponse.json({ error: 'usuarioId es requerido' }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        email: true,
        puntajeSaber11: true,
        promedio: true,
        estrato: true,
        edad: true,
        recibirRecordatorios: true,
      },
    });

    if (!usuario) {
      return NextResponse.json({ perfil: null });
    }

    return NextResponse.json({
      perfil: {
        puntajeSaber11: usuario.puntajeSaber11 ?? undefined,
        promedio: usuario.promedio ?? undefined,
        estrato: usuario.estrato ?? undefined,
        edad: usuario.edad ?? undefined,
      },
      recibirRecordatorios: usuario.recibirRecordatorios,
    });
  } catch (error) {
    console.error('Error en GET /api/usuario/perfil:', error);
    return NextResponse.json({ error: 'Error al consultar perfil' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuarioId, puntajeSaber11, promedio, estrato, edad, recibirRecordatorios } = body;

    if (!usuarioId) {
      return NextResponse.json({ error: 'usuarioId es requerido' }, { status: 400 });
    }

    const updated = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        ...(puntajeSaber11 !== undefined && { puntajeSaber11: puntajeSaber11 ? Number(puntajeSaber11) : null }),
        ...(promedio !== undefined && { promedio: promedio ? Number(promedio) : null }),
        ...(estrato !== undefined && { estrato: estrato ? Number(estrato) : null }),
        ...(edad !== undefined && { edad: edad ? Number(edad) : null }),
        ...(recibirRecordatorios !== undefined && { recibirRecordatorios: Boolean(recibirRecordatorios) }),
      },
    });

    return NextResponse.json({
      success: true,
      perfil: {
        puntajeSaber11: updated.puntajeSaber11 ?? undefined,
        promedio: updated.promedio ?? undefined,
        estrato: updated.estrato ?? undefined,
        edad: updated.edad ?? undefined,
      },
      recibirRecordatorios: updated.recibirRecordatorios,
    });
  } catch (error) {
    console.error('Error en PUT /api/usuario/perfil:', error);
    return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 });
  }
}

