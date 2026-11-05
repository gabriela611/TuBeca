'use client';

import React from 'react';
import { X, Scale, ExternalLink, Trash2, Building2 } from 'lucide-react';
import { type BecaItem, parseCoveragePercentage } from './ScholarshipList';
import { diasRestantes } from '@/lib/countdown';

interface ScholarshipComparatorProps {
  isOpen: boolean;
  onClose: () => void;
  becas: BecaItem[];
  onRemoveBeca: (id: string) => void;
  onClear: () => void;
}

export function ScholarshipComparator({
  isOpen,
  onClose,
  becas,
  onRemoveBeca,
  onClear,
}: ScholarshipComparatorProps) {
  if (!isOpen) return null;

  const formatCop = (val?: number | null) => {
    if (!val || val <= 0) return 'No especificado en dinero';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg, 12px)',
          boxShadow: 'var(--shadow-modal, 0 20px 25px -5px rgba(0, 0, 0, 0.2))',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--surface-base, #ffffff)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--brand-50, #eff6ff)',
                color: 'var(--brand-600, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Scale size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--ink-900)', margin: 0 }}>
                Comparador de Becas
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>
                Comparando {becas.length} {becas.length === 1 ? 'beca' : 'becas'} (máximo 3)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {becas.length > 0 && (
              <button
                onClick={onClear}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--ink-600)',
                  backgroundColor: 'var(--surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  padding: '6px 12px',
                  cursor: 'pointer',
                }}
              >
                Limpiar todo
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Cerrar comparador"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-subtle)',
                border: 'none',
                color: 'var(--ink-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Comparison Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
          {becas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-500)' }}>
              <Scale size={42} style={{ margin: '0 auto 12px', color: 'var(--ink-300)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink-800)', marginBottom: '6px' }}>
                No has seleccionado becas para comparar
              </h3>
              <p style={{ fontSize: '0.8125rem', maxWidth: '360px', margin: '0 auto' }}>
                Usa el botón &quot;Comparar&quot; en las tarjetas o la lista para contrastar hasta 3 convocatorias lado a lado.
              </p>
            </div>
          ) : (
            <div
              className="tubeca-comparator-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${becas.length}, minmax(240px, 1fr))`,
                gap: '16px',
                overflowX: 'auto',
              }}
            >
              {becas.map((b) => {
                const percentage = parseCoveragePercentage(b.porcentaje, b.tipoFinanciacion, b.cobertura, b.porcentajeCobertura);
                const countdown = diasRestantes(b.fechaCierre);
                const uniName = b.universidad || b.universidadRel?.nombre || 'Universidad';

                return (
                  <div
                    key={b.id}
                    style={{
                      border: '1.5px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md, 8px)',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    {/* Header of Column */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-500)' }}>
                        <Building2 size={13} style={{ color: 'var(--brand-600)' }} />
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {uniName}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveBeca(b.id)}
                        title="Quitar de la comparación"
                        aria-label="Quitar de la comparación"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--ink-400)',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-400)')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--ink-900)', lineHeight: 1.3, margin: 0, minHeight: '38px' }}>
                      {b.nombreBeca || b.titulo}
                    </h3>

                    {/* Criteria Comparison Table Rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem' }}>
                      {/* Nivel */}
                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', display: 'block' }}>
                          Nivel
                        </span>
                        <strong style={{ color: 'var(--ink-800)' }}>
                          {b.nivelAcademico || b.tipo || 'No especificado'}
                        </strong>
                      </div>

                      {/* Cobertura */}
                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', display: 'block' }}>
                          Cobertura
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              color: 'var(--brand-700)',
                              backgroundColor: 'var(--brand-50)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {percentage}%
                          </span>
                          <span style={{ color: 'var(--ink-700)' }}>{b.tipoFinanciacion || 'Beca'}</span>
                        </div>
                      </div>

                      {/* Valor estimado */}
                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', display: 'block' }}>
                          Valor
                        </span>
                        <span style={{ color: 'var(--ink-700)' }}>{formatCop(b.valorBecaCop)}</span>
                      </div>

                      {/* Fecha de cierre */}
                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', display: 'block' }}>
                          Cierre
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                          <span style={{ color: 'var(--ink-800)', fontWeight: 600 }}>
                            {b.fechaCierre
                              ? new Date(b.fechaCierre).toLocaleDateString('es-CO', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'Sin fecha'}
                          </span>
                          {countdown.dias !== null && (
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '4px',
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
                              }}
                            >
                              {countdown.texto}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Promedio Mínimo */}
                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', display: 'block' }}>
                          Promedio Mínimo
                        </span>
                        <strong style={{ color: 'var(--ink-800)' }}>
                          {b.promedioMinimo ? `${b.promedioMinimo} / 5.0` : 'No exige'}
                        </strong>
                      </div>

                      {/* Saber 11 */}
                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', display: 'block' }}>
                          Puntaje Saber 11
                        </span>
                        <strong style={{ color: 'var(--ink-800)' }}>
                          {b.puntajeSaber11Minimo ? `${b.puntajeSaber11Minimo} pts` : 'No exige'}
                        </strong>
                      </div>

                      {/* Estrato */}
                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', display: 'block' }}>
                          Estrato Socioeconómico
                        </span>
                        <span style={{ color: 'var(--ink-700)' }}>
                          {b.estratoSocioeconomico || 'Cualquier estrato'}
                        </span>
                      </div>

                      {/* Documentos */}
                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', display: 'block' }}>
                          Documentos
                        </span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--ink-600)', lineHeight: 1.4, margin: '2px 0 0' }}>
                          {b.documentosRequeridos || 'Consultar en convocatoria oficial'}
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    {b.enlaceOficial && (
                      <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                        <a
                          href={b.enlaceOficial}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            backgroundColor: 'var(--brand-600)',
                            color: '#ffffff',
                            borderRadius: 'var(--radius-sm, 6px)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          <span>Ver Convocatoria</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
