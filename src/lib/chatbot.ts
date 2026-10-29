import { GoogleGenAI } from '@google/genai';
import { prisma } from './db/prisma';

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export interface SuggestedBeca {
  id: string;
  titulo: string;
  universidad?: string;
  cobertura?: string;
  ciudad?: string;
  motivo?: string;
}

export interface ChatResponse {
  text: string;
  suggestedBecas: SuggestedBeca[];
}

const SYSTEM_PROMPT = `Eres TuBeca Bot 🎓, un asesor vocacional y experto en becas universitarias en Colombia.

Tu misión es orientar al estudiante de forma clara, empática y realista.

Reglas de respuesta:
1. Responde en español cercano y profesional (tono colombiano cordial).
2. Si el usuario te cuenta su situación (puntaje ICFES/Saber 11, estrato, ciudad, carrera o dificultades económicas), felicítalo por sus logros y dale recomendaciones puntuales basadas en las becas disponibles.
3. Explica claramente POR QUÉ le conviene cada beca sugerida (ej. "Tu puntaje de 360 supera el mínimo de 340", "Cubre el 100% de la matrícula").
4. Si faltan datos clave (ej. ciudad o estrato), hazle 1 o 2 preguntas rápidas para afinar la búsqueda.
5. Al final de tu respuesta, si recomendaste becas específicas de las que tienes en la lista, incluye obligatoriamente un bloque de código JSON con los IDs y títulos exactos de las becas recomendadas:
\`\`\`json
[
  {"id": "id-de-la-beca", "titulo": "Título de la beca", "motivo": "Razón clave por la que le aplica"}
]
\`\`\`
Si no recomendaste ninguna beca en concreto, no agregues el bloque JSON.`;

/**
 * Envía un mensaje al chatbot y recibe una respuesta contextualizada
 * con las becas disponibles en la base de datos.
 */
export async function chat(
  message: string,
  conversationHistory: { role: 'user' | 'model'; content: string }[] = [],
): Promise<ChatResponse> {
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
    id: b.id,
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
    return {
      text: 'El asistente de IA aún no tiene configurada la variable GEMINI_API_KEY en el archivo .env. Por favor ingresa tu API key en el archivo .env para habilitar el asistente inteligente.',
      suggestedBecas: [],
    };
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

    const rawText = response.text || '';
    
    // Extraer bloque JSON si Gemini lo incluyó
    let cleanedText = rawText;
    const suggestedBecas: SuggestedBeca[] = [];
    const jsonMatch = rawText.match(/```(?:json)?\s*(\[\s*\{[\s\S]*?\}\s*\])\s*```/);

    if (jsonMatch) {
      cleanedText = rawText.replace(jsonMatch[0], '').trim();
      try {
        const parsed = JSON.parse(jsonMatch[1]) as Array<{ id: string; titulo?: string; motivo?: string }>;
        for (const item of parsed) {
          const matched = becas.find((b) => b.id === item.id || b.titulo.toLowerCase().includes(item.titulo?.toLowerCase() || ''));
          if (matched) {
            suggestedBecas.push({
              id: matched.id,
              titulo: matched.titulo,
              universidad: matched.universidad?.nombre,
              cobertura: matched.cobertura || `${matched.porcentajeCobertura || 100}%`,
              ciudad: matched.ciudad || undefined,
              motivo: item.motivo,
            });
          }
        }
      } catch (err) {
        console.warn('[Chatbot] Could not parse suggested becas JSON:', err);
      }
    }

    // Fallback: si no hubo JSON pero se mencionan títulos exactos de becas
    if (suggestedBecas.length === 0) {
      for (const b of becas) {
        if (rawText.toLowerCase().includes(b.titulo.toLowerCase())) {
          suggestedBecas.push({
            id: b.id,
            titulo: b.titulo,
            universidad: b.universidad?.nombre,
            cobertura: b.cobertura || `${b.porcentajeCobertura || 100}%`,
            ciudad: b.ciudad || undefined,
          });
          if (suggestedBecas.length >= 3) break;
        }
      }
    }

    return {
      text: cleanedText || 'Aquí tienes las becas que mejor se adaptan a lo que buscas:',
      suggestedBecas,
    };
  } catch (error) {
    console.error('[Chatbot] Error:', error);
    return {
      text: 'Ups, tuve un problema al procesar tu mensaje. Por favor intenta de nuevo en unos momentos.',
      suggestedBecas: [],
    };
  }
}
