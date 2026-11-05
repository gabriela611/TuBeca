'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import {
  ExternalLink,
  Building2,
  MapPin,
  Calendar,
  Check,
  Heart,
  Info,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { type BecaItem, parseCoveragePercentage } from './ScholarshipList';
import { diasRestantes } from '@/lib/countdown';
import { evaluarElegibilidad, type PerfilUsuario } from '@/lib/eligibility';

interface ScholarshipDetailProps {
  beca: BecaItem | null;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  perfil?: PerfilUsuario;
}

export function ScholarshipDetail({
  beca,
  isFavorite,
  onToggleFavorite,
  perfil,
}: ScholarshipDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [checkedMap, setCheckedMap] = useState<Record<string, number[]>>({});

  const becaId = beca?.id || beca?.idBeca || '';

  const getCheckedIndices = useCallback((): number[] => {
    if (!becaId) return [];
    if (checkedMap[becaId]) return checkedMap[becaId];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`tubeca_docs_${becaId}`);
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return [];
  }, [becaId, checkedMap]);

  const currentCheckedList = getCheckedIndices();
  const currentCheckedSet = new Set(currentCheckedList);

  const handleToggleDoc = (idx: number) => {
    if (!becaId) return;
    const set = new Set<number>(currentCheckedList);
    if (set.has(idx)) {
      set.delete(idx);
    } else {
      set.add(idx);
    }
    const nextArr: number[] = Array.from(set);
    setCheckedMap((prev) => ({ ...prev, [becaId]: nextArr }));
    try {
      localStorage.setItem(`tubeca_docs_${becaId}`, JSON.stringify(nextArr));
    } catch (err) {
      console.warn('Could not save checked docs:', err);
    }
  };

  useEffect(() => {
    if (beca && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0.6, y: 6 },
        { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' },
      );
    }
  }, [beca]);

  if (!beca) {
    return (
      <div
        className="tubeca-detail-container"
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
          Haz clic en cualquier convocatoria para ver requisitos, cobertura detallada y postularte en el sitio oficial.
        </p>
      </div>
    );
  }

  const uniName = beca.universidad || beca.universidadRel?.nombre || 'Universidad';
  const uniCity = beca.universidadRel?.ciudad || 'Medellín';
  const scholarshipTitle = beca.nombreBeca || beca.titulo || 'Beca';
  const officialUrl = beca.enlaceOficial || beca.urlOriginal;

  const percentage = parseCoveragePercentage(
    beca.porcentaje,
    beca.tipoFinanciacion,
    beca.cobertura,
    beca.porcentajeCobertura
  );

  const formatIsoDate = (d?: string | Date | null) => {
    if (!d) return 'No especificada';
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
        'Presentar la documentación solicitada antes de la fecha de cierre.',
      ];

  const documentsList = beca.documentosRequeridos
    ? beca.documentosRequeridos.split(/[;.]\s+/).filter(Boolean)
    : null;

  return (
    <div
      ref={containerRef}
      className="tubeca-detail-container"
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
      {/* Top Meta Line: University + ID + Save Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-500)', flexWrap: 'wrap' }}>
          <Building2 size={16} style={{ color: 'var(--brand-600)', flexShrink: 0 }} />
          <span>{uniName}</span>
          {beca.idBeca && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--brand-700)',
                backgroundColor: 'var(--brand-50)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {beca.idBeca}
            </span>
          )}
          <span style={{ color: 'var(--ink-300)' }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500 }}>
            <MapPin size={13} />
            {uniCity}
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
            {percentage}% Cobertura
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

      {/* Main Title & Badges */}
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
          {scholarshipTitle}
        </h1>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {beca.nivelAcademico && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '3px 8px',
                backgroundColor: 'var(--brand-50)',
                color: 'var(--brand-700)',
                borderRadius: '4px',
              }}
            >
              {beca.nivelAcademico}
            </span>
          )}

          {beca.tipoFinanciacion && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                padding: '3px 8px',
                backgroundColor: 'var(--surface-subtle)',
                color: 'var(--ink-700)',
                borderRadius: '4px',
              }}
            >
              Financiación: {beca.tipoFinanciacion}
            </span>
          )}

          {beca.estadoConvocatoria && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                padding: '3px 8px',
                backgroundColor: beca.estadoConvocatoria.toLowerCase().includes('abierta')
                  ? 'var(--brand-50)'
                  : 'var(--surface-subtle)',
                color: beca.estadoConvocatoria.toLowerCase().includes('abierta')
                  ? 'var(--brand-700)'
                  : 'var(--ink-600)',
                borderRadius: '4px',
              }}
            >
              {beca.estadoConvocatoria}
            </span>
          )}

          {beca.categorias?.map((c) => (
            <span
              key={c.categoria.id}
              style={{
                fontSize: '0.6875rem',
                fontWeight: 500,
                padding: '3px 8px',
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

      {/* Description */}
      {beca.descripcion && (
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
      )}

      {/* Structured Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          padding: '16px',
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Cobertura */}
        <div>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Cobertura & Porcentaje
          </span>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-900)', marginTop: '2px' }}>
            {beca.porcentaje ? `${beca.porcentaje}` : `${percentage}%`}
          </div>
          {beca.cobertura && (
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: '2px', lineHeight: 1.4 }}>
              {beca.cobertura}
            </p>
          )}
        </div>

        {/* Valor COP si aplica */}
        {beca.valorBecaCop && (
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Valor en COP
            </span>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-700)', marginTop: '2px' }}>
              ${beca.valorBecaCop.toLocaleString('es-CO')} COP
            </div>
          </div>
        )}

        {/* Estrato Socioeconómico si aplica */}
        {beca.estratoSocioeconomico && (
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Estrato Requerido
            </span>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-900)', marginTop: '2px' }}>
              Estrato {beca.estratoSocioeconomico}
            </div>
          </div>
        )}

        {/* Promedio Mínimo */}
        {beca.promedioMinimo && (
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Promedio Mínimo
            </span>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-900)', marginTop: '2px' }}>
              {beca.promedioMinimo} / 5.0
            </div>
          </div>
        )}

        {/* Edades */}
        {(beca.edadMinima || beca.edadMaxima) && (
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Rango de Edad
            </span>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-900)', marginTop: '2px' }}>
              {beca.edadMinima ? `${beca.edadMinima}` : '15'} a {beca.edadMaxima ? `${beca.edadMaxima}` : 'Sin límite'} años
            </div>
          </div>
        )}

        {/* Zona / Municipio de Aplicación */}
        {beca.municipioAplicacion && (
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Municipio o Zona de Aplicación
            </span>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-900)', marginTop: '2px', lineHeight: 1.4 }}>
              {beca.municipioAplicacion}
            </div>
          </div>
        )}
      </div>

      {/* Verificador de Elegibilidad */}
      {(() => {
        const eleg = evaluarElegibilidad(beca, perfil);
        const esCumple = eleg.estado === 'cumples';
        const esNoCumple = eleg.estado === 'no_cumples';

        return (
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: esCumple ? '#f0fdf4' : esNoCumple ? '#fef2f2' : 'var(--surface-subtle)',
              border: `1.5px solid ${esCumple ? '#bbf7d0' : esNoCumple ? '#fecaca' : 'var(--border-subtle)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {esCumple && <CheckCircle2 size={18} style={{ color: '#16a34a' }} />}
                {esNoCumple && <XCircle size={18} style={{ color: '#dc2626' }} />}
                {!esCumple && !esNoCumple && <HelpCircle size={18} style={{ color: 'var(--ink-500)' }} />}
                <strong style={{ fontSize: '0.875rem', color: esCumple ? '#15803d' : esNoCumple ? '#b91c1c' : 'var(--ink-800)' }}>
                  {esCumple
                    ? 'Cumples con los requisitos de esta convocatoria'
                    : esNoCumple
                      ? `No cumples: ${eleg.motivo}`
                      : 'Completa tu perfil en "¿A cuáles aplico?"'}
                </strong>
              </div>
            </div>

            {eleg.detalles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' }}>
                {eleg.detalles.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--ink-700)' }}>
                    <span style={{ color: d.cumple === true ? '#16a34a' : d.cumple === false ? '#dc2626' : 'var(--ink-400)', fontWeight: 700 }}>
                      {d.cumple === true ? '✓' : d.cumple === false ? '✕' : '•'}
                    </span>
                    <span>{d.mensaje}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Población objetivo si aplica */}
      {beca.poblacionObjetivo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h2
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--ink-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Users size={14} style={{ color: 'var(--brand-600)' }} />
            Población Objetivo
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-700)', lineHeight: 1.5 }}>
            {beca.poblacionObjetivo}
          </p>
        </div>
      )}

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
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} style={{ color: 'var(--ink-400)' }} />
          <span style={{ color: 'var(--ink-500)' }}>Apertura:</span>
          <strong style={{ color: 'var(--ink-900)' }}>{formatIsoDate(beca.fechaApertura)}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} style={{ color: 'var(--brand-600)' }} />
            <span style={{ color: 'var(--ink-500)' }}>Cierre:</span>
            <strong style={{ color: 'var(--brand-700)' }}>{formatIsoDate(beca.fechaCierre)}</strong>
          </div>
          {beca.fechaCierre && (() => {
            const countdown = diasRestantes(beca.fechaCierre);
            return (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: countdown.esVencida
                    ? 'var(--surface-subtle)'
                    : countdown.esUrgente
                      ? '#fef2f2'
                      : 'var(--brand-50)',
                  color: countdown.esVencida
                    ? 'var(--ink-500)'
                    : countdown.esUrgente
                      ? '#dc2626'
                      : 'var(--brand-700)',
                  border: `1px solid ${
                    countdown.esVencida
                      ? 'var(--border-subtle)'
                      : countdown.esUrgente
                        ? '#fecaca'
                        : 'var(--brand-200)'
                  }`,
                }}
              >
                <Clock size={11} strokeWidth={2.4} />
                <span>{countdown.texto}</span>
              </span>
            );
          })()}
        </div>
      </div>

      {/* Requirements List */}
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

      {/* Checklist de Documentos Requeridos */}
      {documentsList && documentsList.length > 0 && (
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--surface-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <h2
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--ink-700)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0,
              }}
            >
              <FileText size={15} style={{ color: 'var(--brand-600)' }} />
              Documentos Requeridos
            </h2>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: currentCheckedSet.size === documentsList.length ? '#f0fdf4' : 'var(--brand-50)',
                color: currentCheckedSet.size === documentsList.length ? '#15803d' : 'var(--brand-700)',
                border: `1px solid ${currentCheckedSet.size === documentsList.length ? '#bbf7d0' : 'var(--brand-200)'}`,
              }}
            >
              {currentCheckedSet.size} de {documentsList.length} listos
            </span>
          </div>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0, padding: 0 }}>
            {documentsList.map((doc, idx) => {
              const isChecked = currentCheckedSet.has(idx);
              return (
                <li key={idx}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      fontSize: '0.8125rem',
                      lineHeight: 1.45,
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isChecked ? 'rgba(22, 163, 74, 0.05)' : 'transparent',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleDoc(idx)}
                      style={{
                        marginTop: '2px',
                        accentColor: 'var(--brand-600)',
                        cursor: 'pointer',
                        width: '15px',
                        height: '15px',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        color: isChecked ? 'var(--ink-400)' : 'var(--ink-800)',
                        textDecoration: isChecked ? 'line-through' : 'none',
                        transition: 'color 0.15s ease',
                      }}
                    >
                      {doc}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Observaciones */}
      {beca.observaciones && (
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--surface-subtle)',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '3px solid var(--accent-500)',
            fontSize: '0.8125rem',
            color: 'var(--ink-700)',
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: 'var(--ink-900)', display: 'block', marginBottom: '2px' }}>
            Observaciones de la convocatoria:
          </strong>
          {beca.observaciones}
        </div>
      )}

      {/* Primary Action Button (Postularse en sitio oficial) */}
      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        {officialUrl ? (
          <a
            href={officialUrl}
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
        ) : (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--surface-subtle)',
              color: 'var(--ink-500)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              textAlign: 'center',
            }}
          >
            Información de postulación directa en la oficina de admisiones de {uniName}
          </div>
        )}
      </div>
    </div>
  );
}
