'use client';

import React from 'react';
import { Building2, MapPin, Heart, AlertCircle } from 'lucide-react';

export interface BecaItem {
  id: string;
  titulo: string;
  descripcion: string;
  universidad?: {
    id: string;
    nombre: string;
    ciudad: string;
    tipo: string;
  } | null;
  ciudad?: string | null;
  departamento?: string | null;
  tipo: string;
  modalidad?: string | null;
  cobertura?: string | null;
  porcentajeCobertura?: number | null;
  fechaInicio?: string | null;
  fechaCierre?: string | null;
  requisitos?: string | null;
  urlOriginal: string;
  fuente: string;
  estado: string;
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
}

/**
 * Anillo animado de porcentaje de cobertura con centrado óptico
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
          overflowY: 'auto',
          padding: '60px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
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
            marginBottom: '16px',
            color: 'var(--ink-400)',
          }}
        >
          {showingFavoritesOnly ? <Heart size={24} /> : <AlertCircle size={24} />}
        </div>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--ink-900)',
            marginBottom: '6px',
          }}
        >
          {showingFavoritesOnly ? 'Aún no tienes becas guardadas' : 'No encontramos becas con estos filtros'}
        </h3>
        <p style={{ fontSize: '0.875rem', maxWidth: '320px', color: 'var(--ink-500)', lineHeight: 1.5 }}>
          {showingFavoritesOnly
            ? 'Guarda becas con el icono de corazón para tenerlas a la mano y comparar sus beneficios.'
            : 'Prueba a reiniciar los filtros o ajustar el nivel educativo.'}
        </p>

        {showingFavoritesOnly && onClearFavoritesFilter && (
          <button
            onClick={onClearFavoritesFilter}
            style={{
              marginTop: '16px',
              padding: '8px 18px',
              backgroundColor: 'var(--brand-600)',
              color: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-700)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-600)')}
          >
            Explorar todas las convocatorias
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
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {becas.map((beca) => {
        const isSelected = selectedBecaId === beca.id;
        const isFav = favorites.has(beca.id);
        const percentage = beca.porcentajeCobertura || (beca.cobertura === 'total' ? 100 : 50);
        const isTotal = beca.cobertura === 'total' || percentage >= 100;
        const uniName = beca.universidad?.nombre || (beca.fuente === 'icetex' ? 'ICETEX' : 'Nacional');
        const location = beca.ciudad || beca.departamento || 'Nacional';

        return (
          <div
            key={beca.id}
            role="button"
            tabIndex={0}
            aria-selected={isSelected}
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
            {/* Top Line: Universidad + Favorite Button */}
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
                <Building2 size={14} style={{ color: 'var(--brand-600)' }} />
                <span>{uniName}</span>
                <span style={{ color: 'var(--ink-300)' }}>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500 }}>
                  <MapPin size={12} />
                  {location}
                </span>
              </div>

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
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                title={isFav ? 'Quitar de favoritas' : 'Guardar en favoritas'}
                aria-label={isFav ? `Quitar ${beca.titulo} de favoritas` : `Guardar ${beca.titulo} en favoritas`}
              >
                <Heart size={16} fill={isFav ? 'currentColor' : 'none'} strokeWidth={isFav ? 0 : 2} />
              </button>
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
              {beca.titulo}
            </h3>

            {/* Bottom Row: Animated Coverage Ring Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
              <CoverageRing percentage={percentage} isTotal={isTotal} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
