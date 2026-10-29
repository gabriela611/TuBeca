'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  ExternalLink,
  Building2,
  MapPin,
  Calendar,
  Check,
  Heart,
  Info,
} from 'lucide-react';
import type { BecaItem } from './ScholarshipList';

interface ScholarshipDetailProps {
  beca: BecaItem | null;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export function ScholarshipDetail({
  beca,
  isFavorite,
  onToggleFavorite,
}: ScholarshipDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (beca && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0.6, y: 6 },
        { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' },
      );
    }
  }, [beca?.id]);

  if (!beca) {
    return (
      <div
        style={{
          flex: 1.2,
          height: '100%',
          minHeight: 0,
          backgroundColor: '#ffffff',
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          textAlign: 'center',
          color: 'var(--ink-500)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ink-400)',
            marginBottom: '14px',
          }}
        >
          <Info size={24} />
        </div>
        <h3
          style={{
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: 'var(--ink-900)',
            marginBottom: '6px',
          }}
        >
          Selecciona una beca
        </h3>
        <p style={{ fontSize: '0.875rem', maxWidth: '320px', lineHeight: 1.5, color: 'var(--ink-500)' }}>
          Haz clic en cualquier convocatoria para ver requisitos, fechas y postularte en el sitio oficial.
        </p>
      </div>
    );
  }

  const isTotal = beca.cobertura === 'total' || (beca.porcentajeCobertura ?? 0) >= 100;
  const uniName = beca.universidad?.nombre || (beca.fuente === 'icetex' ? 'ICETEX' : 'Nacional');
  const location = beca.ciudad || beca.departamento || 'Nacional';

  const formatIsoDate = (d?: string | null) => {
    if (!d) return 'Convocatoria permanente';
    return new Date(d).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const requirementsList = beca.requisitos
    ? beca.requisitos.split(/(?<=[.!?])\s+/).filter(Boolean)
    : [
      'Estar admitido o en proceso de admisión en el programa académico.',
      'Cumplir con los requisitos socioeconómicos y académicos vigentes.',
      'Presentar la documentación solicitada antes de la fecha límite.',
    ];

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1.2,
        height: '100%',
        minHeight: 0,
        overflowY: 'auto',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid var(--border-subtle)',
        padding: '32px 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Top Meta Line: University + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-500)' }}>
          <Building2 size={16} style={{ color: 'var(--brand-600)' }} />
          <span>{uniName}</span>
          <span style={{ color: 'var(--ink-300)' }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500 }}>
            <MapPin size={13} />
            {location}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--ink-700)',
            }}
          >
            {beca.porcentajeCobertura || (isTotal ? 100 : 50)}% Cobertura
          </span>

          <button
            onClick={(e) => onToggleFavorite(beca.id, e)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isFavorite ? 'var(--favorite-bg)' : 'var(--surface-subtle)',
              color: isFavorite ? 'var(--favorite-color)' : 'var(--ink-700)',
              border: `1px solid ${isFavorite ? '#fde047' : 'var(--border-subtle)'}`,
              fontSize: '0.75rem',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            <Heart size={13} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={isFavorite ? 0 : 2} />
            <span>{isFavorite ? 'Guardada' : 'Guardar'}</span>
          </button>
        </div>
      </div>

      {/* Main Title & Tags */}
      <div>
        <h1
          style={{
            fontSize: '1.375rem',
            fontWeight: 800,
            color: 'var(--ink-900)',
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            marginBottom: '10px',
          }}
        >
          {beca.titulo}
        </h1>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '2px 7px',
              backgroundColor: 'var(--brand-50)',
              color: 'var(--brand-700)',
              borderRadius: '4px',
            }}
          >
            {beca.tipo}
          </span>
          {beca.modalidad && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                padding: '2px 7px',
                backgroundColor: 'var(--surface-subtle)',
                color: 'var(--ink-700)',
                borderRadius: '4px',
              }}
            >
              {beca.modalidad}
            </span>
          )}
          {beca.categorias?.map((c) => (
            <span
              key={c.categoria.id}
              style={{
                fontSize: '0.6875rem',
                fontWeight: 500,
                padding: '2px 7px',
                backgroundColor: 'var(--surface-subtle)',
                color: 'var(--ink-500)',
                borderRadius: '4px',
              }}
            >
              {c.categoria.nombre}
            </span>
          ))}
        </div>
      </div>

      {/* Clean Description (Unboxed) */}
      <div>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--ink-700)',
            lineHeight: 1.65,
          }}
        >
          {beca.descripcion}
        </p>
      </div>

      {/* Dates Minimalist Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          padding: '12px 0',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: '0.8125rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} style={{ color: 'var(--ink-400)' }} />
          <span style={{ color: 'var(--ink-500)' }}>Apertura:</span>
          <strong style={{ color: 'var(--ink-900)' }}>{formatIsoDate(beca.fechaInicio)}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} style={{ color: 'var(--brand-600)' }} />
          <span style={{ color: 'var(--ink-500)' }}>Cierre:</span>
          <strong style={{ color: 'var(--brand-700)' }}>{formatIsoDate(beca.fechaCierre)}</strong>
        </div>
      </div>

      {/* Requirements List (Unboxed typography, no cards inside cards) */}
      <div>
        <h2
          style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: 'var(--ink-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '12px',
          }}
        >
          Requisitos
        </h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {requirementsList.map((req, idx) => (
            <li
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '0.875rem',
                color: 'var(--ink-700)',
                lineHeight: 1.5,
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-50)',
                  color: 'var(--brand-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <Check size={11} strokeWidth={3} />
              </div>
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Primary Action Button (Single, clear next action) */}
      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        <a
          href={beca.urlOriginal}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '13px 20px',
            backgroundColor: 'var(--brand-600)',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 700,
            boxShadow: 'var(--shadow-sm)',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-700)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-600)')}
        >
          <span>Postularme en el sitio oficial</span>
          <ExternalLink size={15} />
        </a>
      </div>
    </div>
  );
}
