'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart,
  X,
  RotateCcw,
  Building2,
  MapPin,
  Sparkles,
  Layers,
  AlertCircle,
  SearchX,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { type BecaItem, parseCoveragePercentage } from './ScholarshipList';
import { triggerSaveConfetti } from '@/lib/confetti';
import { diasRestantes } from '@/lib/countdown';
import { evaluarElegibilidad, type PerfilUsuario } from '@/lib/eligibility';

interface TinderCardDeckProps {
  becas: BecaItem[];
  currentIndex: number;
  onIndexChange: (newIndex: number) => void;
  onSaveBeca: (beca: BecaItem, e?: React.MouseEvent) => void;
  onDiscardBeca: (beca: BecaItem) => void;
  onUndo?: () => void;
  canUndo?: boolean;
  isFavorite: boolean;
  onRestartDeck?: () => void;
  showingFavoritesOnly?: boolean;
  onClearFavoritesFilter?: () => void;
  isLoading?: boolean;
  loadError?: string | null;
  onRetry?: () => void;
  onResetFilters?: () => void;
  perfil?: PerfilUsuario;
}

/**
 * Anillo animado SVG con porcentaje y centrado óptico
 */
function CoverageRingMini({ percentage }: { percentage: number }) {
  const size = 42;
  const stroke = 3;
  const center = size / 2;
  const radius = center - stroke;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isTotal = percentage >= 100;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            stroke="var(--border-subtle)"
            fill="transparent"
            strokeWidth={stroke}
            r={radius}
            cx={center}
            cy={center}
          />
          <circle
            stroke={isTotal ? 'var(--brand-600)' : 'var(--brand-700)'}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transform: 'rotate(-90deg)',
              transformOrigin: `${center}px ${center}px`,
              transition: 'stroke-dashoffset var(--duration-smooth) var(--ease-smooth-out)',
            }}
            strokeLinecap="round"
            r={radius}
            cx={center}
            cy={center}
          />
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--brand-700)"
            fontSize={percentage >= 100 ? '10' : '11.5'}
            fontWeight="800"
            fontFamily="inherit"
          >
            {percentage}%
          </text>
        </svg>
      </div>
      <div>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink-900)', display: 'block', lineHeight: 1.2 }}>
          {isTotal ? 'Cobertura Total' : 'Cobertura'}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)', lineHeight: 1 }}>
          de matrícula
        </span>
      </div>
    </div>
  );
}

export function TinderCardDeck({
  becas,
  currentIndex,
  onSaveBeca,
  onDiscardBeca,
  onUndo,
  canUndo = false,
  isFavorite,
  onRestartDeck,
  showingFavoritesOnly,
  onClearFavoritesFilter,
  isLoading,
  loadError,
  onRetry,
  onResetFilters,
  perfil,
}: TinderCardDeckProps) {
  // Drag state
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [flyOutDirection, setFlyOutDirection] = useState<'left' | 'right' | null>(null);

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const activeBeca = becas[currentIndex] || null;
  const nextBeca = becas[currentIndex + 1] || null;

  // Handlers for swipe actions
  const triggerDiscard = useCallback(() => {
    if (!activeBeca || flyOutDirection) return;
    setFlyOutDirection('left');
    setTimeout(() => {
      onDiscardBeca(activeBeca);
      setFlyOutDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 220);
  }, [activeBeca, flyOutDirection, onDiscardBeca]);

  const triggerSave = useCallback(
    (e?: React.MouseEvent) => {
      if (!activeBeca || flyOutDirection) return;
      triggerSaveConfetti(e);
      setFlyOutDirection('right');
      setTimeout(() => {
        onSaveBeca(activeBeca, e);
        setFlyOutDirection(null);
        setDragOffset({ x: 0, y: 0 });
      }, 220);
    },
    [activeBeca, flyOutDirection, onSaveBeca],
  );

  // Keyboard navigation: Left = Discard, Right = Save, Backspace/Up/Z = Undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        triggerDiscard();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        triggerSave();
      } else if ((e.key === 'ArrowUp' || e.key === 'Backspace' || e.key === 'z') && canUndo && onUndo) {
        e.preventDefault();
        onUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerDiscard, triggerSave, canUndo, onUndo]);

  // Pointer / Drag gesture handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (flyOutDirection) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = (e.clientY - dragStartRef.current.y) * 0.3; // gentle vertical resistance
    setDragOffset({ x: dx, y: dy });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const threshold = 100;
    if (dragOffset.x > threshold) {
      triggerSave();
    } else if (dragOffset.x < -threshold) {
      triggerDiscard();
    } else {
      // Smooth spring back using transitions.dev curve
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  // Error state
  if (loadError) {
    return (
      <div
        className="t-card-enter"
        style={{
          width: '100%',
          maxWidth: '440px',
          minHeight: '380px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px dashed #fca5a5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dc2626',
            marginBottom: '16px',
          }}
        >
          <AlertCircle size={28} />
        </div>

        <h3 style={{ fontSize: '1.1875rem', fontWeight: 800, color: 'var(--ink-900)', marginBottom: '8px' }}>
          Error al cargar las becas
        </h3>

        <p style={{ fontSize: '0.875rem', color: 'var(--ink-500)', lineHeight: 1.5, maxWidth: '280px', marginBottom: '20px' }}>
          {loadError}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '11px 20px',
              backgroundColor: 'var(--brand-600)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'background-color var(--duration-fast) var(--ease-smooth-out)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-700)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-600)')}
          >
            <RotateCcw size={15} />
            <span>Reintentar</span>
          </button>
        )}
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '460px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid var(--border-subtle)',
            borderTopColor: 'var(--brand-600)',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '16px',
          }}
        />
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-600)' }}>
          Cargando convocatorias...
        </p>
      </div>
    );
  }

  // If no scholarships available or finished
  if (!activeBeca) {
    const isFilterEmpty = becas.length === 0;

    return (
      <div
        className="t-card-enter"
        style={{
          width: '100%',
          maxWidth: '440px',
          minHeight: '420px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px dashed var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: isFilterEmpty ? 'var(--surface-subtle)' : 'var(--brand-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isFilterEmpty ? 'var(--ink-500)' : 'var(--brand-600)',
            marginBottom: '16px',
          }}
        >
          {isFilterEmpty ? <SearchX size={28} /> : <Sparkles size={28} />}
        </div>

        <h3 style={{ fontSize: '1.1875rem', fontWeight: 800, color: 'var(--ink-900)', marginBottom: '8px' }}>
          {showingFavoritesOnly
            ? 'No tienes becas guardadas'
            : isFilterEmpty
              ? 'Sin resultados para tus filtros'
              : '¡Has revisado todas las becas!'}
        </h3>

        <p style={{ fontSize: '0.875rem', color: 'var(--ink-500)', lineHeight: 1.5, maxWidth: '290px', marginBottom: '20px' }}>
          {showingFavoritesOnly
            ? 'Guarda becas deslizando hacia la derecha para verlas aquí reunidas.'
            : isFilterEmpty
              ? 'No encontramos convocatorias que coincidan con tus criterios. Prueba cambiando los filtros o restableciéndolos.'
              : 'Has explorado todas las convocatorias disponibles en esta selección. Puedes volver a empezar la baraja o ajustar los filtros.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '240px' }}>
          {isFilterEmpty && onResetFilters && !showingFavoritesOnly && (
            <button
              onClick={onResetFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 18px',
                backgroundColor: 'var(--brand-600)',
                color: '#ffffff',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'background-color var(--duration-fast) var(--ease-smooth-out)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-700)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-600)')}
            >
              <RotateCcw size={15} />
              <span>Restablecer filtros</span>
            </button>
          )}

          {!isFilterEmpty && onRestartDeck && (
            <button
              onClick={onRestartDeck}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 18px',
                backgroundColor: 'var(--brand-600)',
                color: '#ffffff',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'background-color var(--duration-fast) var(--ease-smooth-out)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-700)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-600)')}
            >
              <RotateCcw size={15} />
              <span>Volver a empezar</span>
            </button>
          )}

          {showingFavoritesOnly && onClearFavoritesFilter && (
            <button
              onClick={onClearFavoritesFilter}
              style={{
                padding: '10px 18px',
                backgroundColor: 'var(--surface-subtle)',
                color: 'var(--ink-700)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              Ver todas las convocatorias
            </button>
          )}
        </div>
      </div>
    );
  }

  // Active card calculations
  const percentage = parseCoveragePercentage(
    activeBeca.porcentaje,
    activeBeca.tipoFinanciacion,
    activeBeca.cobertura,
    activeBeca.porcentajeCobertura,
  );

  const uniName = activeBeca.universidad || activeBeca.universidadRel?.nombre || 'Universidad';
  const city = activeBeca.universidadRel?.ciudad || activeBeca.municipioAplicacion || 'Colombia';
  const title = activeBeca.nombreBeca || activeBeca.titulo || 'Beca';

  // Rotation and Stamp Opacities
  const rotationDeg = dragOffset.x * 0.08;
  const likeOpacity = Math.max(0, Math.min(1, dragOffset.x / 75));
  const nopeOpacity = Math.max(0, Math.min(1, -dragOffset.x / 75));

  // Determine active transform & transition
  let transformStyle = 'translate3d(0, 0, 0)';
  let transitionStyle = `transform var(--duration-normal) var(--ease-bounce), box-shadow var(--duration-fast) var(--ease-smooth-out)`;
  let opacityStyle = 1;

  if (isDragging) {
    transformStyle = `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rotationDeg}deg)`;
    transitionStyle = 'none';
  } else if (flyOutDirection === 'right') {
    transformStyle = 'translate3d(140%, -20px, 0) rotate(20deg)';
    transitionStyle = `transform var(--duration-normal) var(--ease-smooth-out), opacity var(--duration-fast) var(--ease-smooth-out)`;
    opacityStyle = 0;
  } else if (flyOutDirection === 'left') {
    transformStyle = 'translate3d(-140%, -20px, 0) rotate(-20deg)';
    transitionStyle = `transform var(--duration-normal) var(--ease-smooth-out), opacity var(--duration-fast) var(--ease-smooth-out)`;
    opacityStyle = 0;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '440px',
        margin: '0 auto',
        userSelect: 'none',
      }}
    >
      {/* Top Deck Counter */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0 8px 10px 8px',
          fontSize: '0.8125rem',
          color: 'var(--ink-500)',
          fontWeight: 600,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} style={{ color: 'var(--brand-600)' }} />
          <span>Beca {currentIndex + 1} de {becas.length}</span>
        </span>

        {activeBeca.idBeca && (
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--brand-700)',
              backgroundColor: 'var(--brand-50)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid var(--brand-100)',
            }}
          >
            {activeBeca.idBeca}
          </span>
        )}
      </div>

      {/* Card Deck Stage */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '470px',
        }}
      >
        {/* Next Card underneath for depth */}
        {nextBeca && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
              padding: '24px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transform: 'scale(0.95) translate3d(0, 10px, 0)',
              opacity: 0.82,
              pointerEvents: 'none',
              zIndex: 1,
              transition: 'transform var(--duration-smooth) var(--ease-smooth-out), opacity var(--duration-smooth) var(--ease-smooth-out)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-400)', fontSize: '0.8125rem' }}>
              <Building2 size={15} />
              <span>{nextBeca.universidad || 'Universidad'}</span>
            </div>
            <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--ink-700)', lineHeight: 1.35 }}>
              {nextBeca.nombreBeca || nextBeca.titulo}
            </h4>
            <div style={{ height: '40px' }} />
          </div>
        )}

        {/* Current Interactive Swipe Card (Keyed on activeBeca.id to always bloom smoothly from center on change) */}
        <div
          key={activeBeca.id}
          className={!isDragging && !flyOutDirection ? 't-card-enter' : ''}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--border-subtle)',
            boxShadow: isDragging ? 'var(--shadow-modal)' : 'var(--shadow-card-hover)',
            padding: '26px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
            transform: transformStyle,
            transition: transitionStyle,
            opacity: opacityStyle,
            zIndex: 10,
            overflow: 'hidden',
            willChange: 'transform, opacity',
          }}
        >
          {/* Stamp Badges */}
          {/* LIKE / GUARDAR (Green/Gold) */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              padding: '6px 14px',
              border: '3px solid #16a34a',
              borderRadius: '8px',
              color: '#16a34a',
              fontWeight: 900,
              fontSize: '1rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              transform: 'rotate(-14deg)',
              opacity: likeOpacity,
              pointerEvents: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
              zIndex: 30,
            }}
          >
            GUARDAR ❤️
          </div>

          {/* NOPE / DESCARTAR (Red) */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              padding: '6px 14px',
              border: '3px solid #dc2626',
              borderRadius: '8px',
              color: '#dc2626',
              fontWeight: 900,
              fontSize: '1rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              transform: 'rotate(14deg)',
              opacity: nopeOpacity,
              pointerEvents: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
              zIndex: 30,
            }}
          >
            DESCARTAR ✕
          </div>

          {/* Top Row: University & City */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--brand-700)',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Building2 size={15} style={{ color: 'var(--brand-600)' }} />
                </div>
                <span>{uniName}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--ink-500)',
                  backgroundColor: 'var(--surface-subtle)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <MapPin size={12} />
                <span>{city}</span>
              </div>
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--ink-900)',
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
                marginBottom: '14px',
              }}
            >
              {title}
            </h2>

            {/* Badges / Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {activeBeca.nivelAcademico && (
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
                  {activeBeca.nivelAcademico}
                </span>
              )}

              {activeBeca.tipoFinanciacion && (
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
                  {activeBeca.tipoFinanciacion}
                </span>
              )}

              {activeBeca.promedioMinimo && (
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    backgroundColor: 'var(--accent-50)',
                    color: 'var(--accent-600)',
                    border: '1px solid var(--accent-100)',
                    borderRadius: '4px',
                  }}
                >
                  Promedio $\ge$ {activeBeca.promedioMinimo}
                </span>
              )}

              {activeBeca.estratoSocioeconomico && (
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
                  Estrato {activeBeca.estratoSocioeconomico}
                </span>
              )}
            </div>

            {/* Eligibility badge */}
            {(() => {
              const elegibilidad = evaluarElegibilidad(activeBeca, perfil);
              return (
                <div style={{ marginBottom: '12px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
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
                            : 'var(--ink-600)',
                      border: `1px solid ${
                        elegibilidad.estado === 'cumples'
                          ? '#bbf7d0'
                          : elegibilidad.estado === 'no_cumples'
                            ? '#fecaca'
                            : 'var(--border-subtle)'
                      }`,
                    }}
                  >
                    {elegibilidad.estado === 'cumples' && <CheckCircle2 size={13} strokeWidth={2.4} />}
                    {elegibilidad.estado === 'no_cumples' && <XCircle size={13} strokeWidth={2.4} />}
                    {elegibilidad.estado === 'faltan_datos' && <HelpCircle size={13} strokeWidth={2.4} />}
                    <span>
                      {elegibilidad.estado === 'cumples'
                        ? 'Cumples requisitos'
                        : elegibilidad.estado === 'no_cumples'
                          ? `No cumples: ${elegibilidad.motivo}`
                          : 'Faltan datos de perfil'}
                    </span>
                  </span>
                </div>
              );
            })()}

            {/* Excerpt Description */}
            {activeBeca.descripcion && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--ink-700)',
                  lineHeight: 1.55,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {activeBeca.descripcion}
              </p>
            )}
          </div>

          {/* Bottom Card Footer: Coverage Ring & Quick Date */}
          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <CoverageRingMini percentage={percentage} />

            {activeBeca.fechaCierre && (() => {
              const countdown = diasRestantes(activeBeca.fechaCierre);
              return (
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
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
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-600)' }}>
                    Cierre:{' '}
                    {new Date(activeBeca.fechaCierre).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Tinder Action Buttons Control Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          paddingTop: '18px',
          width: '100%',
        }}
      >
        {/* Left: Discard (X) Button */}
        <button
          onClick={triggerDiscard}
          title="Descartar (Flecha izquierda)"
          aria-label="Descartar convocatoria"
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: '2px solid #ef4444',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.16)',
            cursor: 'pointer',
            transition: 'transform var(--duration-fast) var(--ease-smooth-out), background-color var(--duration-fast) var(--ease-smooth-out)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.backgroundColor = '#fef2f2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          <X size={26} strokeWidth={2.8} />
        </button>

        {/* Center: Undo Button */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Deshacer (Tecla Z o Retroceso)"
          aria-label="Deshacer última acción"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: '1.5px solid var(--border-subtle)',
            color: canUndo ? 'var(--ink-700)' : 'var(--ink-300)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            cursor: canUndo ? 'pointer' : 'not-allowed',
            transition: 'transform var(--duration-fast) var(--ease-smooth-out)',
          }}
          onMouseEnter={(e) => {
            if (canUndo) e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <RotateCcw size={18} strokeWidth={2.2} />
        </button>

        {/* Right: Save / Heart Button */}
        <button
          onClick={(e) => triggerSave(e)}
          title="Guardar en favoritas (Flecha derecha)"
          aria-label="Guardar en favoritas"
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: isFavorite ? 'var(--favorite-bg)' : '#ffffff',
            border: `2px solid ${isFavorite ? '#eab308' : '#16a34a'}`,
            color: isFavorite ? '#ca8a04' : '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.18)',
            cursor: 'pointer',
            transition: 'transform var(--duration-fast) var(--ease-smooth-out), background-color var(--duration-fast) var(--ease-smooth-out)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.backgroundColor = isFavorite ? 'var(--favorite-bg)' : '#f0fdf4';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = isFavorite ? 'var(--favorite-bg)' : '#ffffff';
          }}
        >
          <Heart size={26} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5} />
        </button>
      </div>

      {/* Keyboard Shortcut Hints (Desktop) */}
      <div
        className="tubeca-keyboard-hint"
        style={{
          marginTop: '12px',
          fontSize: '0.75rem',
          color: 'var(--ink-400)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span>Desliza o usa teclado:</span>
        <kbd
          style={{
            padding: '2px 6px',
            backgroundColor: 'var(--surface-subtle)',
            borderRadius: '4px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'var(--ink-700)',
          }}
        >
          ← Descartar
        </kbd>
        <kbd
          style={{
            padding: '2px 6px',
            backgroundColor: 'var(--surface-subtle)',
            borderRadius: '4px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'var(--ink-700)',
          }}
        >
          Guardar →
        </kbd>
      </div>
    </div>
  );
}
