import { NextRequest, NextResponse } from 'next/server';
import { chat } from '@/lib/chatbot';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

/**
 * POST /api/chat
 *
 * Envía un mensaje al chatbot de TuBeca.
 *
 * Body:
 * - message: string (requerido) — El mensaje del estudiante
 * - history: ChatMessage[] (opcional) — Historial de la conversación
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body as {
      message: string;
      history?: ChatMessage[];
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'El campo "message" es requerido y debe ser un string' },
        { status: 400 },
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'El mensaje no puede exceder 2000 caracteres' },
        { status: 400 },
      );
    }

    const response = await chat(message, history);

    return NextResponse.json({
      data: {
        role: 'model',
        content: response.text,
        suggestedBecas: response.suggestedBecas,
      },
    });
  } catch (error) {
    console.error('[API /chat] Error:', error);
    return NextResponse.json(
      { error: 'Error al procesar el mensaje' },
      { status: 500 },
    );
  }
}
