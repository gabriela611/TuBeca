import { GoogleGenAI } from '@google/genai';
import { prisma } from './db/prisma';

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

const SYSTEM_PROMPT = `Eres TuBeca Bot 🎓, un asistente virtual experto en becas universitarias colombianas.

Tu objetivo es ayudar a estudiantes colombianos a encontrar becas que se ajusten a su perfil.

Reglas:
- Responde SIEMPRE en español colombiano, de forma amable y cercana.
- Basa tus respuestas ÚNICAMENTE en las becas disponibles en la base de datos que se te proporcionan.
- Si no encuentras becas relevantes, sugiérele al estudiante que revise más tarde o ajuste sus criterios.
- Incluye siempre el enlace original de la beca cuando la recomiendes.
- Menciona fechas de cierre si están disponibles.
- Si el estudiante no da suficiente información, haz preguntas para entender mejor su perfil:
  - ¿Qué nivel de estudio busca? (pregrado, posgrado, doctorado)
  - ¿En qué ciudad o departamento?
  - ¿Qué carrera o área de estudio?
  - ¿Tiene alguna condición especial? (comunidad étnica, víctima del conflicto, deportista, etc.)
- No inventes información sobre becas que no están en la base de datos.
- Sé conciso pero informativo.`;

/**
 * Envía un mensaje al chatbot y recibe una respuesta contextualizada
 * con las becas disponibles en la base de datos.
 */
export async function chat(
  message: string,
  conversationHistory: { role: 'user' | 'model'; content: string }[] = [],
): Promise<string> {
  // Traer becas activas y próximas de la BD para dar contexto
  const becas = await prisma.beca.findMany({
    where: {
      estado: { in: ['activa', 'proxima'] },
    },
    include: {
      universidad: true,
      categorias: {
        include: { categoria: true },
      },
    },
    take: 50,
    orderBy: { updatedAt: 'desc' },
  });

  const becasContext = becas.map((b) => ({
    titulo: b.titulo,
    descripcion: b.descripcion,
    universidad: b.universidad?.nombre || 'Varias',
    ciudad: b.ciudad,
    tipo: b.tipo,
    cobertura: `${b.cobertura || 'No especificada'}${b.porcentajeCobertura ? ` (${b.porcentajeCobertura}%)` : ''}`,
    fechaCierre: b.fechaCierre?.toISOString().split('T')[0] || 'No especificada',
    estado: b.estado,
    requisitos: b.requisitos,
    url: b.urlOriginal,
    categorias: b.categorias.map((c) => c.categoria.nombre),
  }));

  const contextMessage = `\n\nBecas disponibles en la base de datos (${becasContext.length} becas activas/próximas):\n${JSON.stringify(becasContext, null, 2)}`;

  // Construir historial de conversación para Gemini
  const contents = [
    ...conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'model',
      parts: [{ text: msg.content }],
    })),
    {
      role: 'user' as const,
      parts: [{ text: message }],
    },
  ];

  const ai = getAiClient();
  if (!ai) {
    return 'El asistente de IA aún no tiene configurada la variable GEMINI_API_KEY en el archivo .env. Por favor configúrala para activar el chatbot.';
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT + contextMessage,
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    return response.text || 'Lo siento, no pude procesar tu mensaje. ¿Podrías intentar de nuevo?';
  } catch (error) {
    console.error('[Chatbot] Error:', error);
    return 'Ups, tuve un problema al procesar tu mensaje. Por favor intenta de nuevo en unos momentos. 🙏';
  }
}
