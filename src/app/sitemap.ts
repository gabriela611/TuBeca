import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || 'https://tubeca.co';

  let becas: Array<{ id: string; fechaActualizacion: Date | null }> = [];
  try {
    becas = await prisma.beca.findMany({
      select: {
        id: true,
        fechaActualizacion: true,
      },
    });
  } catch (e) {
    console.error('Error generando sitemap:', e);
  }

  const becaUrls: MetadataRoute.Sitemap = becas.map((b) => ({
    url: `${baseUrl}/becas/${b.id}`,
    lastModified: b.fechaActualizacion || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    ...becaUrls,
  ];
}
