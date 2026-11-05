import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return new NextResponse('Identificador de usuario no proporcionado.', { status: 400 });
  }

  try {
    await prisma.usuario.update({
      where: { id: uid },
      data: { recibirRecordatorios: false },
    });

    return new NextResponse(
      `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Baja de recordatorios | TuBeca</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: #ffffff;
      border-radius: 12px;
      padding: 32px;
      max-width: 440px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    h1 { font-size: 1.25rem; font-weight: 800; margin-bottom: 8px; }
    p { font-size: 0.875rem; color: #475569; line-height: 1.5; margin-bottom: 24px; }
    a { display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Preferencias actualizadas</h1>
    <p>Te has dado de baja exitosamente. Ya no recibirás recordatorios por correo sobre fechas de cierre de becas.</p>
    <a href="/">Volver a TuBeca</a>
  </div>
</body>
</html>`,
      {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  } catch (error) {
    console.error('Error al dar de baja recordatorios:', error);
    return new NextResponse('Error al procesar la solicitud.', { status: 500 });
  }
}
