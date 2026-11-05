import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

const ALLOWED_MOTIVOS = ['enlace_roto', 'fecha_incorrecta', 'requisitos_cambiaron', 'otro'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { becaId, motivo, descripcion = '' } = body;

    if (!becaId || !motivo) {
      return NextResponse.json(
        { error: 'becaId y motivo son obligatorios.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MOTIVOS.includes(motivo)) {
      return NextResponse.json(
        { error: 'Motivo de reporte no válido.' },
        { status: 400 }
      );
    }

    if (typeof descripcion !== 'string' || descripcion.trim().length > 500) {
      return NextResponse.json(
        { error: 'La descripción no puede exceder los 500 caracteres.' },
        { status: 400 }
      );
    }

    // Verificar que la beca existe
    const beca = await prisma.beca.findUnique({
      where: { id: becaId },
      select: { id: true },
    });

    if (!beca) {
      return NextResponse.json(
        { error: 'La beca especificada no existe.' },
        { status: 404 }
      );
    }

    // IP y Rate Limit (máximo 5 reportes por hora por IP hash)
    const rawIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const salt = process.env.CRON_SECRET || 'tubeca-salt-2026';
    const ipHash = crypto.createHash('sha256').update(rawIp + salt).digest('hex');

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentReportsCount = await prisma.reporte.count({
      where: {
        ipHash,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentReportsCount >= 5) {
      return NextResponse.json(
        { error: 'Has alcanzado el límite de 5 reportes por hora. Por favor intenta más tarde.' },
        { status: 429 }
      );
    }

    // Guardar reporte
    const reporte = await prisma.reporte.create({
      data: {
        becaId,
        motivo,
        descripcion: descripcion.trim(),
        ipHash,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Reporte registrado exitosamente. ¡Gracias por contribuir a mantener la información de TuBeca al día!',
      reporteId: reporte.id,
    });
  } catch (error) {
    console.error('Error al registrar reporte:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar el reporte.' },
      { status: 500 }
    );
  }
}

