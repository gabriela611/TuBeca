'use client';

import React from 'react';
import { Building2, Heart, AlertCircle, Clock, CheckCircle2, XCircle, HelpCircle, Scale } from 'lucide-react';
import { parseCoveragePercentage } from '@/lib/coverage';
import { diasRestantes } from '@/lib/countdown';
import { evaluarElegibilidad, type PerfilUsuario } from '@/lib/eligibility';

export { parseCoveragePercentage };

export interface BecaItem {
  id: string;
  idBeca?: string;
  universidad: string;
  universidadRel?: {
    id: string;
    nombre: string;
    ciudad: string;
    departamento?: string | null;
    tipo: string;
  } | null;
  municipioAplicacion?: string | null;
  nombreBeca: string;
  nivelAcademico?: string | null;
  areaConocimiento?: string | null;
  modalidad?: string | null;
  descripcion?: string | null;
  tipoFinanciacion?: string | null;
  porcentaje?: string | null;
  valorBecaCop?: number | null;
  cobertura?: string | null;
  edadMinima?: number | null;
  edadMaxima?: number | null;
  promedioMinimo?: number | null;
  puntajeSaber11Minimo?: number | null;
  estratoSocioeconomico?: string | null;
  poblacionObjetivo?: string | null;
  requisitos?: string | null;
  documentosRequeridos?: string | null;
  fechaApertura?: string | Date | null;
  fechaCierre?: string | Date | null;
  estadoConvocatoria?: string | null;
  enlaceOficial?: string | null;
  observaciones?: string | null;
  estadoCalidadDato?: string | null;

  // Compatibility fields
  titulo?: string;
  tipo?: string;
  ciudad?: string | null;
  departamento?: string | null;
  urlOriginal?: string;
  estado?: string;
  porcentajeCobertura?: number | null;
  categorias?: Array<{
    categoria: {
      id: string;
      nombre: string;
    };
  }>;
}

interface ScholarshipListProps {
  becas: BecaItem[];
  selectedBecaId: string | null;
  onSelectBeca: (beca: BecaItem) => void;
  isLoading?: boolean;
  favorites: Set<string>;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  showingFavoritesOnly?: boolean;
  onClearFavoritesFilter?: () => void;
  perfil?: PerfilUsuario;
  onToggleCompare?: (beca: BecaItem) => void;
  compareIds?: Set<string>;
}


/**
 * Anillo animado de porcentaje de cobertura con centrado óptico y texto adyacente
 */
function CoverageRing({ percentage, isTotal }: { percentage: number; isTotal: boolean }) {
  const size = 38;
  const stroke = 2.5;
  const center = size / 2;
  const radius = center - stroke;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          flexShrink: 0,
        }}
      >
        <svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track de fondo */}
          <circle
            stroke="var(--border-subtle)"
            fill="transparent"
            strokeWidth={stroke}
            r={radius}
            cx={center}
            cy={center}
          />
          {/* Arco de progreso */}
          <circle
            stroke={isTotal ? 'var(--coverage-total-text)' : 'var(--brand-600)'}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transform: 'rotate(-90deg)',
              transformOrigin: `${center}px ${center}px`,
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            strokeLinecap="round"
            r={radius}
            cx={center}
            cy={center}
          />
          {/* Texto de porcentaje nativo en SVG perfectamente centrado */}
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="central"
            fill={isTotal ? 'var(--coverage-total-text)' : 'var(--brand-700)'}
            fontSize={percentage >= 100 ? '9.5' : '10.5'}
            fontWeight="700"
            fontFamily="inherit"
          >
            {percentage}%
          </text>
        </svg>
      </div>

      <span
        style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--ink-700)',
        }}
      >
        Cobertura
      </span>
    </div>
  );
}

export function ScholarshipList({
  becas,
  selectedBecaId,
  onSelectBeca,
  isLoading,
  favorites,
  onToggleFavorite,
  showingFavoritesOnly,
  onClearFavoritesFilter,
  perfil,
  onToggleCompare,
  compareIds,
}: ScholarshipListProps) {
  if (isLoading) {
    return (
      <div
        style={{
          flex: 1,
          minHeight: 0,
          height: '100%',
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              height: '84px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              opacity: 0.6,
            }}
          />
        ))}
      </div>
    );
  }

  if (becas.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          minHeight: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          textAlign: 'center',
          color: 'var(--ink-500)',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ink-400)',
            marginBottom: '12px',
          }}
        >
          <AlertCircle size={22} />
        </div>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--ink-900)',
            marginBottom: '4px',
          }}
        >
          {showingFavoritesOnly ? 'No tienes becas guardadas' : 'No se encontraron becas'}
        </h3>
        <p
          style={{
            fontSize: '0.8125rem',
            maxWidth: '280px',
            lineHeight: 1.5,
            color: 'var(--ink-500)',
            marginBottom: '14px',
          }}
        >
          {showingFavoritesOnly
            ? 'Guarda becas con el icono de corazón para tenerlas siempre a mano.'
            : 'Prueba ajustando los filtros o el término de búsqueda.'}
        </p>
        {showingFavoritesOnly && onClearFavoritesFilter && (
          <button
            onClick={onClearFavoritesFilter}
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--brand-700)',
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Ver todas las becas
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        height: '100%',
        overflowY: 'auto',
        padding: '12px 2px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {becas.map((beca) => {
        const isSelected = selectedBecaId === beca.id || selectedBecaId === beca.idBeca;
        const isFav = favorites.has(beca.id);
        const percentage = parseCoveragePercentage(
          beca.porcentaje,
          beca.tipoFinanciacion,
          beca.cobertura,
          beca.porcentajeCobertura
        );
        const isTotal =
          percentage >= 100 ||
          beca.cobertura === 'total' ||
          Boolean(beca.tipoFinanciacion?.toLowerCase().includes('total'));
        
        const uniName =
          beca.universidad ||
          beca.universidadRel?.nombre ||
          'Universidad';

        const scholarshipTitle = beca.nombreBeca || beca.titulo || 'Beca';
        const countdown = diasRestantes(beca.fechaCierre);

        return (
          <div
            key={beca.id}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onClick={() => onSelectBeca(beca)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectBeca(beca);
              }
            }}
            style={{
              padding: '16px 18px',
              backgroundColor: '#ffffff',
              border: `1.5px solid ${isSelected ? 'var(--brand-600)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              boxShadow: isSelected ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              position: 'relative',
              outline: 'none',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.15s ease',
              transform: isSelected ? 'translateY(-2px)' : 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
              if (!isSelected) {
                e.currentTarget.style.borderColor = 'var(--border-hover)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = isSelected ? 'translateY(-2px)' : 'none';
              e.currentTarget.style.boxShadow = isSelected ? 'var(--shadow-card-hover)' : 'var(--shadow-card)';
              if (!isSelected) {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--brand-600)';
            }}
            onBlur={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }
            }}
          >
            {/* Top Line: Universidad + Favorite Button (Minimalist: only uni, title, coverage) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--ink-500)',
                }}
              >
                <Building2 size={14} style={{ color: 'var(--brand-600)', flexShrink: 0 }} />
                <span>{uniName}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {onToggleCompare && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCompare(beca);
                    }}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm, 6px)',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      border: `1px solid ${compareIds?.has(beca.id) ? 'var(--brand-600)' : 'var(--border-subtle)'}`,
                      backgroundColor: compareIds?.has(beca.id) ? 'var(--brand-50)' : '#ffffff',
                      color: compareIds?.has(beca.id) ? 'var(--brand-700)' : 'var(--ink-600)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title={compareIds?.has(beca.id) ? 'Quitar de comparación' : 'Comparar (máx 3)'}
                  >
                    <Scale size={12} />
                    <span>{compareIds?.has(beca.id) ? 'Comparando' : 'Comparar'}</span>
                  </button>
                )}

                {/* Save / Favorite Heart Button */}
                <button
                  onClick={(e) => onToggleFavorite(beca.id, e)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isFav ? 'var(--favorite-color)' : 'var(--ink-400)',
                    backgroundColor: isFav ? 'var(--favorite-bg)' : 'transparent',
                    transition: 'transform 0.15s ease, background-color 0.15s ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  title={isFav ? 'Quitar de favoritas' : 'Guardar en favoritas'}
                  aria-label={isFav ? `Quitar ${scholarshipTitle} de favoritas` : `Guardar ${scholarshipTitle} en favoritas`}
                >
                  <Heart size={16} fill={isFav ? 'currentColor' : 'none'} strokeWidth={isFav ? 0 : 2} />
                </button>
              </div>
            </div>

            {/* Title Only */}
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--ink-900)',
                lineHeight: 1.35,
                letterSpacing: '-0.015em',
              }}
            >
              {scholarshipTitle}
            </h3>

            {/* Eligibility badge */}
            {(() => {
              const elegibilidad = evaluarElegibilidad(beca, perfil);
              return (
                <div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor:
                        elegibilidad.estado === 'cumples'
                          ? '#f0fdf4'
                          : elegibilidad.estado === 'no_cumples'
                            ? '#fef2f2'
                            : 'var(--surface-subtle)',
                      color:
                        elegibilidad.estado === 'cumples'
                          ? '#15803d'
                          : elegibilidad.estado === 'no_cumples'
                            ? '#b91c1c'
                            : 'var(--ink-500)',
                      border: `1px solid ${
                        elegibilidad.estado === 'cumples'
                          ? '#bbf7d0'
                          : elegibilidad.estado === 'no_cumples'
                            ? '#fecaca'
                            : 'var(--border-subtle)'
                      }`,
                    }}
                  >
                    {elegibilidad.estado === 'cumples' && <CheckCircle2 size={11} strokeWidth={2.4} />}
                    {elegibilidad.estado === 'no_cumples' && <XCircle size={11} strokeWidth={2.4} />}
                    {elegibilidad.estado === 'faltan_datos' && <HelpCircle size={11} strokeWidth={2.4} />}
                    <span>
                      {elegibilidad.estado === 'cumples'
                        ? 'Cumples'
                        : elegibilidad.estado === 'no_cumples'
                          ? `No cumples: ${elegibilidad.motivo}`
                          : 'Faltan datos'}
                    </span>
                  </span>
                </div>
              );
            })()}

            {/* Bottom Row: Animated Coverage Ring Badge + plain "Cobertura" text + Countdown */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px', gap: '8px' }}>
              <CoverageRing percentage={percentage} isTotal={isTotal} />
              {beca.fechaCierre && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '3px 8px',
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
                    flexShrink: 0,
                  }}
                >
                  <Clock size={11} strokeWidth={2.4} />
                  <span>{countdown.texto}</span>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
