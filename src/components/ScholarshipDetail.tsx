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
  Share2,
  Copy,
  Flag,
  X,
} from 'lucide-react';
import { type BecaItem, parseCoveragePercentage } from './ScholarshipList';
import { diasRestantes } from '@/lib/countdown';
import { evaluarElegibilidad, type PerfilUsuario } from '@/lib/eligibility';

interface ScholarshipDetailProps {
  beca: BecaItem | null;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
  perfil?: PerfilUsuario;
}

export function ScholarshipDetail({
  beca,
  isFavorite = false,
  onToggleFavorite,
  perfil,
}: ScholarshipDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [checkedMap, setCheckedMap] = useState<Record<string, number[]>>({});
  const [copied, setCopied] = useState(false);

  // Error Report state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportMotivo, setReportMotivo] = useState('enlace_roto');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beca) return;
    setReportLoading(true);
    setReportError(null);
    try {
      const res = await fetch('/api/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          becaId: beca.id,
          motivo: reportMotivo,
          descripcion: reportDesc,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo enviar el reporte.');
      }
      setReportSuccess(true);
      setReportDesc('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error enviando reporte';
      setReportError(msg);
    } finally {
      setReportLoading(false);
    }
  };

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
            onClick={(e) => onToggleFavorite?.(beca.id, e)}
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
              backgroundColor: esCumple ? 'var(--status-success-bg)' : esNoCumple ? 'var(--status-error-bg)' : 'var(--status-warning-bg)',
              border: `1.5px solid ${esCumple ? 'var(--status-success-border)' : esNoCumple ? 'var(--status-error-border)' : 'var(--status-warning-border)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {esCumple && <CheckCircle2 size={18} style={{ color: 'var(--status-success-icon)' }} />}
                {esNoCumple && <XCircle size={18} style={{ color: 'var(--status-error-icon)' }} />}
                {!esCumple && !esNoCumple && <HelpCircle size={18} style={{ color: 'var(--status-warning-icon)' }} />}
                <strong style={{ fontSize: '0.875rem', color: esCumple ? 'var(--status-success-text)' : esNoCumple ? 'var(--status-error-text)' : 'var(--status-warning-text)' }}>
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
                    <span style={{ color: d.cumple === true ? 'var(--status-success-icon)' : d.cumple === false ? 'var(--status-error-icon)' : 'var(--status-warning-icon)', fontWeight: 700 }}>
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
                      ? 'var(--status-urgent-bg)'
                      : 'var(--brand-50)',
                  color: countdown.esVencida
                    ? 'var(--ink-500)'
                    : countdown.esUrgente
                      ? 'var(--status-urgent-text)'
                      : 'var(--brand-700)',
                  border: `1px solid ${
                    countdown.esVencida
                      ? 'var(--border-subtle)'
                      : countdown.esUrgente
                        ? 'var(--status-urgent-border)'
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
                backgroundColor: currentCheckedSet.size === documentsList.length ? 'var(--status-success-bg)' : 'var(--brand-50)',
                color: currentCheckedSet.size === documentsList.length ? 'var(--status-success-text)' : 'var(--brand-700)',
                border: `1px solid ${currentCheckedSet.size === documentsList.length ? 'var(--status-success-border)' : 'var(--brand-200)'}`,
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

      {/* Action and Share Section */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* WhatsApp & Copy Link buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `¡Mira esta beca en TuBeca! ${scholarshipTitle} en ${uniName}: ${
                typeof window !== 'undefined' ? `${window.location.origin}/becas/${beca.id}` : `https://tubeca.co/becas/${beca.id}`
              }`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 12px',
              backgroundColor: '#25D366',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)',
              transition: 'filter 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.95)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
          >
            <Share2 size={14} />
            <span>Compartir WhatsApp</span>
          </a>

          <button
            onClick={() => {
              const url = typeof window !== 'undefined'
                ? `${window.location.origin}/becas/${beca.id}`
                : `https://tubeca.co/becas/${beca.id}`;
              navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 12px',
              backgroundColor: copied ? '#f0fdf4' : 'var(--surface-subtle)',
              color: copied ? '#15803d' : 'var(--ink-700)',
              border: `1px solid ${copied ? '#bbf7d0' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? '¡Enlace copiado!' : 'Copiar enlace'}</span>
          </button>
        </div>

        {/* Primary Action Button (Postularse en sitio oficial) */}
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
              backgroundColor: 'var(--brand-700)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 700,
              boxShadow: 'var(--shadow-cta)',
              textDecoration: 'none',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--brand-800)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(29, 78, 216, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--brand-700)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'var(--shadow-cta)';
            }}
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

        {/* Verification Date & Report Error Trigger */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--ink-500)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
            <span>
              Verificado el{' '}
              {beca.fechaActualizacion
                ? new Date(beca.fechaActualizacion).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Recientemente'}
            </span>
            {beca.estadoCalidadDato && (
              <span
                style={{
                  backgroundColor: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {beca.estadoCalidadDato.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <button
            onClick={() => setIsReportOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: 'var(--ink-400)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 4px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-400)')}
          >
            <Flag size={12} />
            <span>Reportar un error</span>
          </button>
        </div>
      </div>

      {/* Modal: Reportar error */}
      {isReportOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 130,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setIsReportOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg, 12px)',
              boxShadow: 'var(--shadow-modal)',
              padding: '24px',
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {reportSuccess ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle2 size={44} style={{ color: '#16a34a', margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--ink-900)', marginBottom: '8px' }}>
                  ¡Reporte enviado!
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-600)', marginBottom: '20px' }}>
                  Gracias por ayudarnos a mantener la información actualizada.
                </p>
                <button
                  onClick={() => {
                    setIsReportOpen(false);
                    setReportSuccess(false);
                  }}
                  style={{
                    backgroundColor: 'var(--brand-600)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 18px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flag size={18} style={{ color: '#dc2626' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ink-900)', margin: 0 }}>
                      Reportar un error en la convocatoria
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--ink-400)', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                    Motivo del reporte
                  </label>
                  <select
                    value={reportMotivo}
                    onChange={(e) => setReportMotivo(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-subtle)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="enlace_roto">Enlace oficial roto o no disponible</option>
                    <option value="fecha_incorrecta">Fecha de cierre o apertura incorrecta</option>
                    <option value="requisitos_cambiaron">Los requisitos o cobertura cambiaron</option>
                    <option value="otro">Otro error en la información</option>
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                      Descripción (máximo 500 caracteres)
                    </label>
                    <span style={{ fontSize: '0.75rem', color: reportDesc.length > 480 ? '#dc2626' : 'var(--ink-400)' }}>
                      {reportDesc.length} / 500
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="Cuéntanos qué dato es incorrecto o qué cambió..."
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-subtle)',
                      fontSize: '0.875rem',
                      resize: 'none',
                    }}
                  />
                </div>

                {reportError && (
                  <div style={{ fontSize: '0.8125rem', color: '#b91c1c', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: '6px' }}>
                    {reportError}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={reportLoading}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--brand-600)',
                      color: '#ffffff',
                      border: 'none',
                      cursor: reportLoading ? 'not-allowed' : 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                    }}
                  >
                    {reportLoading ? 'Enviando...' : 'Enviar reporte'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
