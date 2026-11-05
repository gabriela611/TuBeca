import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { ScholarshipDetail } from '@/components/ScholarshipDetail';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface BecaPageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export async function generateMetadata({ params }: BecaPageProps): Promise<Metadata> {
  const { id } = await params;
  const beca = await prisma.beca.findUnique({
    where: { id },
    include: {
      universidadRel: true,
      categorias: {
        include: {
          categoria: true,
        },
      },
    },
  });

  if (!beca) {
    return {
      title: 'Beca no encontrada | TuBeca',
      description: 'Convocatoria no encontrada en TuBeca.',
    };
  }

  const uniName = beca.universidadRel?.nombre || beca.universidad || 'Universidad';
  const title = `${beca.nombreBeca} - ${uniName} | TuBeca`;
  const description = beca.descripcion
    ? beca.descripcion.slice(0, 160)
    : `Convocatoria de beca ${beca.nombreBeca} en ${uniName}. Conoce cobertura, requisitos y fechas en TuBeca.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://tubeca.co/becas/${beca.id}`,
      siteName: 'TuBeca Colombia',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function BecaDetailPage({ params }: BecaPageProps) {
  const { id } = await params;
  const beca = await prisma.beca.findUnique({
    where: { id },
    include: {
      universidadRel: true,
      categorias: {
        include: {
          categoria: true,
        },
      },
    },
  });

  if (!beca) {
    notFound();
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--surface-base, #f8fafc)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: '#ffffff',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--brand-700)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          <span>Volver al explorador de becas</span>
        </Link>

        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            fontSize: '1.125rem',
            fontWeight: 900,
            color: 'var(--ink-900)',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'var(--brand-600)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} />
          </div>
          <span>TuBeca</span>
        </Link>
      </header>

      {/* Main Container */}
      <main
        style={{
          maxWidth: '820px',
          width: '100%',
          margin: '28px auto 48px auto',
          padding: '0 16px',
          flex: 1,
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1.5px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
          }}
        >
          <ScholarshipDetail beca={beca} />
        </div>
      </main>
    </div>
  );
}
