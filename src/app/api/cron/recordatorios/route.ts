import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { diasRestantes } from '@/lib/countdown';
import { Resend } from 'resend';

export async function GET(request: NextRequest) {
  return handleRecordatorios(request);
}

export async function POST(request: NextRequest) {
  return handleRecordatorios(request);
}

async function handleRecordatorios(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get('dryRun') === '1' || searchParams.get('dryRun') === 'true';

  // 1. Validar autorización de Cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = Boolean(request.headers.get('x-vercel-cron'));

  if (cronSecret && !isVercelCron) {
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere encabezado Authorization: Bearer $CRON_SECRET' },
        { status: 401 }
      );
    }
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tubeca.co';
    const resendApiKey = process.env.RESEND_API_KEY;
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    // 2. Consultar favoritos de usuarios que reciben recordatorios y cuyas becas tienen fecha de cierre
    const favoritos = await prisma.favorito.findMany({
      where: {
        usuario: {
          recibirRecordatorios: true,
        },
        beca: {
          fechaCierre: {
            not: null,
          },
        },
      },
      include: {
        usuario: true,
        beca: {
          include: {
            universidadRel: true,
          },
        },
        recordatoriosEnviados: true,
      },
    });

    const notificacionesPendientes: Array<{
      favoritoId: string;
      email: string;
      becaNombre: string;
      uniNombre: string;
      dias: number;
      tipo: '7d' | '1d';
      enlaceBeca: string;
      enlaceBaja: string;
    }> = [];

    for (const fav of favoritos) {
      if (!fav.beca.fechaCierre) continue;

      const countdown = diasRestantes(fav.beca.fechaCierre);
      if (countdown.esVencida) continue;

      let tipo: '7d' | '1d' | null = null;
      if (countdown.dias === 7) {
        tipo = '7d';
      } else if (countdown.dias === 1) {
        tipo = '1d';
      }

      if (!tipo) continue;

      // Verificar si ya se envió este recordatorio
      const yaEnviado = fav.recordatoriosEnviados.some((r) => r.tipo === tipo);
      if (yaEnviado) continue;

      const uniNombre = fav.beca.universidadRel?.nombre || fav.beca.universidad || 'Universidad';
      const enlaceBeca = `${baseUrl}/becas/${fav.beca.id}`;
      const enlaceBaja = `${baseUrl}/api/usuario/recordatorios/baja?uid=${fav.usuario.id}`;

      notificacionesPendientes.push({
        favoritoId: fav.id,
        email: fav.usuario.email,
        becaNombre: fav.beca.nombreBeca,
        uniNombre,
        dias: countdown.dias ?? (tipo === '1d' ? 1 : 7),
        tipo,
        enlaceBeca,
        enlaceBaja,
      });
    }

    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        pendientesCount: notificacionesPendientes.length,
        pendientes: notificacionesPendientes,
      });
    }

    // 3. Enviar correos y registrar en BD
    const resultados = [];
    for (const item of notificacionesPendientes) {
      try {
        const asunto =
          item.tipo === '1d'
            ? `⚠️ ¡Último día! La beca "${item.becaNombre}" cierra mañana`
            : `⏳ Recordatorio: La beca "${item.becaNombre}" cierra en 7 días`;

        const html = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0f172a;">
            <div style="background-color: #2563eb; padding: 16px 20px; border-radius: 8px; color: #ffffff; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 1.25rem;">TuBeca Colombia</h1>
            </div>
            
            <p style="font-size: 1rem; line-height: 1.5;">Hola,</p>
            <p style="font-size: 1rem; line-height: 1.5;">
              Te recordamos que la convocatoria de beca <strong>${item.becaNombre}</strong> ofrecida por <strong>${item.uniNombre}</strong> está próxima a cerrar:
            </p>
            
            <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
              <div style="font-size: 1.5rem; font-weight: 800; color: ${item.tipo === '1d' ? '#dc2626' : '#2563eb'};">
                ${item.tipo === '1d' ? '¡Cierra mañana!' : 'Quedan 7 días para el cierre'}
              </div>
            </div>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${item.enlaceBeca}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 700; display: inline-block;">
                Ver requisitos y postularme
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="font-size: 0.75rem; color: #64748b; line-height: 1.4; text-align: center;">
              Recibes este correo porque guardaste esta beca en tus favoritas en TuBeca.<br />
              Si no deseas recibir más recordatorios, puedes <a href="${item.enlaceBaja}" style="color: #64748b; text-decoration: underline;">darte de baja aquí</a>.
            </p>
          </div>
        `;

        if (resend) {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'TuBeca <onboarding@resend.dev>',
            to: item.email,
            subject: asunto,
            html,
          });
        }

        // Registrar en BD para no repetir
        await prisma.recordatorioEnviado.create({
          data: {
            favoritoId: item.favoritoId,
            tipo: item.tipo,
          },
        });

        resultados.push({ favoritoId: item.favoritoId, status: 'enviado' });
      } catch (err) {
        console.error(`Error enviando recordatorio a ${item.email}:`, err);
        resultados.push({ favoritoId: item.favoritoId, status: 'error', error: String(err) });
      }
    }

    return NextResponse.json({
      success: true,
      enviadosCount: resultados.filter((r) => r.status === 'enviado').length,
      resultados,
    });
  } catch (error) {
    console.error('Error en cron de recordatorios:', error);
    return NextResponse.json({ error: 'Error interno en el cron de recordatorios' }, { status: 500 });
  }
}
