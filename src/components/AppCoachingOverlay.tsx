'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Filter,
  Layers,
  CheckCircle2,
  MapPin,
  Heart,
  User,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
} from 'lucide-react';
import { triggerSaveConfetti } from '@/lib/confetti';

export interface AppCoachingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activeView?: 'split' | 'map';
  onNavigateView?: (view: 'split' | 'map') => void;
}

interface StepConfig {
  id: string;
  title: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
  hint?: string;
  desktopSelector: string;
  mobileSelector: string;
  preferredSide: 'bottom' | 'top' | 'right' | 'left';
}

const STEPS: StepConfig[] = [
  {
    id: 'search',
    title: 'Buscador inteligente',
    badge: 'Paso 1 de 7 · Búsqueda',
    icon: <Search size={16} />,
    description:
      'Escribe tu carrera (ej. Medicina, Sistemas), una universidad o tu ciudad para filtrar convocatorias al instante.',
    hint: 'Consejo: Puedes buscar por palabras clave como "Mérito", "Indígena" o "Deportiva".',
    desktopSelector: '.tubeca-header-search',
    mobileSelector: '.tubeca-header-search',
    preferredSide: 'bottom',
  },
  {
    id: 'filters',
    title: 'Filtros a tu medida',
    badge: 'Paso 2 de 7 · Filtros',
    icon: <Filter size={16} />,
    description:
      'Segmenta becas por nivel académico (pregrado o posgrado), cobertura (100% total o parcial), ciudad y tipo de universidad.',
    hint: 'Aplica uno o varios filtros para encontrar tu convocatoria ideal en segundos.',
    desktopSelector: '.tubeca-desktop-sidebar',
    mobileSelector: '.tubeca-header-mobile-filters',
    preferredSide: 'right',
  },
  {
    id: 'swipe',
    title: 'Modo Swipe de Becas',
    badge: 'Paso 3 de 7 · Exploración',
    icon: <Layers size={16} />,
    description:
      'Explora las becas una a una en tarjetas dinámicas. Desliza a la derecha o pulsa ❤️ para guardar; desliza a la izquierda para descartar.',
    hint: '¡Usa las flechas ← y → de tu teclado en el computador para explorar rápido!',
    desktopSelector: '.tubeca-center-stage',
    mobileSelector: '.tubeca-center-stage',
    preferredSide: 'right',
  },
  {
    id: 'requirements',
    title: 'Verificador "¿Aplico?"',
    badge: 'Paso 4 de 7 · Elegibilidad',
    icon: <CheckCircle2 size={16} />,
    description:
      'Compara tus resultados del Saber 11 y promedio con los requisitos mínimos de la beca, revisa el checklist de documentos y postúlate.',
    hint: 'Configura tus notas en el panel para ver si cumples al 100% los requisitos.',
    desktopSelector: '.tubeca-detail-container',
    mobileSelector: '.tubeca-detail-container',
    preferredSide: 'left',
  },
  {
    id: 'map',
    title: 'Mapa Universitario de Colombia',
    badge: 'Paso 5 de 7 · Territorio',
    icon: <MapPin size={16} />,
    description:
      'Cambia a la vista de mapa para explorar cuántas becas y universidades aliadas existen en tu departamento o región del país.',
    hint: 'Haz clic en cualquier departamento en el mapa para ver sus convocatorias.',
    desktopSelector: '.tubeca-header-view-toggle',
    mobileSelector: '.tubeca-nav-map',
    preferredSide: 'bottom',
  },
  {
    id: 'saved',
    title: 'Tus Guardadas y Comparador',
    badge: 'Paso 6 de 7 · Comparación',
    icon: <Heart size={16} />,
    description:
      'Tus becas favoritas quedan guardadas aquí para revisarlas cuando quieras. Además, puedes seleccionar hasta 3 becas y compararlas cara a cara.',
    hint: 'Al guardar una beca, no perderás sus fechas límite ni requisitos.',
    desktopSelector: '.tubeca-fav-btn',
    mobileSelector: '.tubeca-nav-saved',
    preferredSide: 'bottom',
  },
  {
    id: 'account',
    title: 'Tu Cuenta y Alertas de Cierre',
    badge: 'Paso 7 de 7 · Tu Cuenta',
    icon: <User size={16} />,
    description:
      'Inicia sesión con tu correo (sin contraseñas). Guarda tus convocatorias favoritas en la nube y recibe recordatorios antes de que cierren las fechas de postulación.',
    hint: '¡Tu sesión sincroniza tus becas guardadas en tu celular y en tu computador!',
    desktopSelector: '.tubeca-auth-btn',
    mobileSelector: '.tubeca-nav-account',
    preferredSide: 'bottom',
  },
];

interface ElementRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function AppCoachingOverlay({
  isOpen,
  onClose,
  activeView,
  onNavigateView,
}: AppCoachingOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [cardPlacement, setCardPlacement] = useState<{
    cardX: number;
    cardY: number;
    arrowStart: { x: number; y: number };
    arrowEnd: { x: number; y: number };
    arrowControl: { x: number; y: number };
  }>({
    cardX: 16,
    cardY: 80,
    arrowStart: { x: 100, y: 100 },
    arrowEnd: { x: 100, y: 100 },
    arrowControl: { x: 100, y: 100 },
  });

  const step = STEPS[currentStepIndex] || STEPS[0];
  const isLastStep = currentStepIndex === STEPS.length - 1;

  // Measure target element position with strict responsive boundaries
  const updateTargetMeasurements = useCallback(() => {
    if (!isOpen) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 1024;

    const selector = isMobile ? step.mobileSelector : step.desktopSelector;
    let target = document.querySelector(selector) as HTMLElement | null;

    // Fallbacks if specific selector not found
    if (!target && isMobile) {
      target = (document.querySelector(step.desktopSelector) ||
        document.querySelector('.tubeca-mobile-bottom-nav')) as HTMLElement | null;
    }
    if (!target && step.id === 'saved') {
      target = (document.querySelector('.tubeca-fav-btn') ||
        document.querySelector('.tubeca-nav-saved') ||
        document.querySelector('.tubeca-mobile-bottom-nav')) as HTMLElement | null;
    }
    if (!target && step.id === 'account') {
      target = (document.querySelector('.tubeca-nav-account') ||
        document.querySelector('.tubeca-auth-btn') ||
        document.querySelector('.tubeca-mobile-bottom-nav')) as HTMLElement | null;
    }
    if (!target && step.id === 'map') {
      target = (document.querySelector('.tubeca-header-view-toggle') ||
        document.querySelector('.tubeca-nav-map')) as HTMLElement | null;
    }

    if (!target) {
      // Safe center fallback
      const cx = vw / 2;
      const cy = vh / 2;
      setTargetRect({
        x: cx - 120,
        y: cy - 40,
        width: 240,
        height: 80,
        top: cy - 40,
        bottom: cy + 40,
        left: cx - 120,
        right: cx + 120,
      });
      return;
    }

    const rect = target.getBoundingClientRect();
    const margin = 8;
    const clampedRect: ElementRect = {
      x: Math.max(margin, rect.left - 6),
      y: Math.max(margin, rect.top - 6),
      width: Math.min(vw - margin * 2, rect.width + 12),
      height: Math.min(vh - margin * 2, rect.height + 12),
      top: Math.max(margin, rect.top - 6),
      left: Math.max(margin, rect.left - 6),
      right: Math.min(vw - margin, rect.right + 6),
      bottom: Math.min(vh - margin, rect.bottom + 6),
    };

    setTargetRect(clampedRect);

    // Measure card DOM element dynamically
    const cardEl = cardRef.current;
    const cardWidth = cardEl ? cardEl.offsetWidth : Math.min(360, vw - 32);
    const cardHeight = cardEl ? cardEl.offsetHeight : 270;

    // Margins from viewport edges
    const topMargin = isMobile ? 74 : 20;
    const bottomMargin = isMobile ? 82 : 24;
    const sideMargin = 16;

    const targetCenter = {
      x: clampedRect.left + clampedRect.width / 2,
      y: clampedRect.top + clampedRect.height / 2,
    };

    let rawCx = sideMargin;
    let rawCy = topMargin;

    if (isMobile) {
      // Mobile positioning logic
      if (step.id === 'swipe' || clampedRect.height > vh * 0.45) {
        // Large target (like swipe cards or whole detail section):
        // Dock card comfortably near bottom above the bottom navigation bar
        rawCy = vh - cardHeight - bottomMargin;
        rawCx = Math.max(sideMargin, (vw - cardWidth) / 2);
      } else if (targetCenter.y > vh / 2) {
        // Target is lower on screen -> place card above target
        rawCy = clampedRect.top - cardHeight - 16;
        rawCx = Math.max(sideMargin, Math.min(vw - cardWidth - sideMargin, targetCenter.x - cardWidth / 2));
      } else {
        // Target is higher on screen -> place card below target
        rawCy = clampedRect.bottom + 16;
        rawCx = Math.max(sideMargin, Math.min(vw - cardWidth - sideMargin, targetCenter.x - cardWidth / 2));
      }
    } else {
      // Desktop positioning logic
      if (step.preferredSide === 'right') {
        rawCx = clampedRect.right + 20;
        rawCy = clampedRect.top + 20;
        if (rawCx + cardWidth > vw - sideMargin) {
          rawCx = Math.max(sideMargin, clampedRect.left - cardWidth - 20);
        }
      } else if (step.preferredSide === 'left') {
        rawCx = clampedRect.left - cardWidth - 20;
        rawCy = clampedRect.top + 20;
        if (rawCx < sideMargin) {
          rawCx = clampedRect.right + 20;
        }
      } else if (step.preferredSide === 'bottom') {
        rawCx = Math.max(sideMargin, Math.min(vw - cardWidth - sideMargin, targetCenter.x - cardWidth / 2));
        rawCy = clampedRect.bottom + 18;
      } else {
        rawCx = Math.max(sideMargin, Math.min(vw - cardWidth - sideMargin, targetCenter.x - cardWidth / 2));
        rawCy = clampedRect.top - cardHeight - 18;
      }
    }

    // STRICT MATHEMATICAL CLAMPING: Buttons can NEVER be pushed off-screen
    const maxSafeY = Math.max(topMargin, vh - cardHeight - bottomMargin);
    const safeCardY = Math.max(topMargin, Math.min(maxSafeY, rawCy));

    const maxSafeX = Math.max(sideMargin, vw - cardWidth - sideMargin);
    const safeCardX = Math.max(sideMargin, Math.min(maxSafeX, rawCx));

    // Dynamic arrow calculation connecting safeCard to the target element
    let startPoint = { x: safeCardX + cardWidth / 2, y: safeCardY };
    let endPoint = { x: targetCenter.x, y: clampedRect.bottom + 4 };

    if (safeCardY >= clampedRect.bottom - 12) {
      // Card is below target -> Arrow points UP towards target bottom
      startPoint = { x: safeCardX + cardWidth / 2, y: safeCardY };
      endPoint = {
        x: Math.max(clampedRect.left + 10, Math.min(clampedRect.right - 10, safeCardX + cardWidth / 2)),
        y: clampedRect.bottom + 4,
      };
    } else if (safeCardY + cardHeight <= clampedRect.top + 12) {
      // Card is above target -> Arrow points DOWN towards target top
      startPoint = { x: safeCardX + cardWidth / 2, y: safeCardY + cardHeight };
      endPoint = {
        x: Math.max(clampedRect.left + 10, Math.min(clampedRect.right - 10, safeCardX + cardWidth / 2)),
        y: clampedRect.top - 4,
      };
    } else if (safeCardX >= clampedRect.right - 12) {
      // Card is to the right of target -> Arrow points LEFT towards target right edge
      startPoint = { x: safeCardX, y: safeCardY + cardHeight / 2 };
      endPoint = {
        x: clampedRect.right + 4,
        y: Math.max(clampedRect.top + 10, Math.min(clampedRect.bottom - 10, safeCardY + cardHeight / 2)),
      };
    } else {
      // Card is to the left of target -> Arrow points RIGHT towards target left edge
      startPoint = { x: safeCardX + cardWidth, y: safeCardY + cardHeight / 2 };
      endPoint = {
        x: clampedRect.left - 4,
        y: Math.max(clampedRect.top + 10, Math.min(clampedRect.bottom - 10, safeCardY + cardHeight / 2)),
      };
    }

    // Curved Bezier control point for clean trajectory
    const midX = (startPoint.x + endPoint.x) / 2;
    const midY = (startPoint.y + endPoint.y) / 2;
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const ctrlPoint = {
      x: midX - dy * 0.12,
      y: midY + dx * 0.12,
    };

    setCardPlacement({
      cardX: safeCardX,
      cardY: safeCardY,
      arrowStart: startPoint,
      arrowEnd: endPoint,
      arrowControl: ctrlPoint,
    });
  }, [isOpen, step]);

  // Recalculate on open, step change, resize, scroll
  useEffect(() => {
    if (!isOpen) return;

    updateTargetMeasurements();
    const handleResize = () => updateTargetMeasurements();
    const handleScroll = () => updateTargetMeasurements();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    const timer = setTimeout(updateTargetMeasurements, 60);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      clearTimeout(timer);
    };
  }, [isOpen, currentStepIndex, activeView, onNavigateView, updateTargetMeasurements, step.id]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('tubeca_intro_seen', 'true');
      localStorage.setItem('tubeca_tour_completed', 'true');
    } catch {
      // ignore
    }
    triggerSaveConfetti();
    onClose();
  };

  const handleSkip = () => {
    try {
      localStorage.setItem('tubeca_intro_seen', 'true');
    } catch {
      // ignore
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tutorial guiado interactivo de TuBeca"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'auto',
        overflow: 'hidden',
      }}
    >
      {/* SVG Canvas for Backdrop Mask, Dashed Border, Dotted Lines & Arrow */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          {/* Spotlight Mask: Cut out the target element so it stays fully illuminated underneath */}
          <mask id="tubeca-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.x}
                y={targetRect.y}
                width={targetRect.width}
                height={targetRect.height}
                rx="14"
                fill="black"
              />
            )}
          </mask>

          {/* Royal Blue Arrowhead Marker */}
          <marker
            id="tubeca-tour-arrowhead"
            viewBox="0 0 12 12"
            refX="10"
            refY="6"
            markerWidth="10"
            markerHeight="10"
            orient="auto-start-reverse"
          >
            <polygon points="0 1, 12 6, 0 11, 3 6" fill="#2563eb" stroke="#2563eb" strokeWidth="1" />
          </marker>

          {/* Subtle glow filter for the spotlight boundary */}
          <filter id="tubeca-halo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Semi-transparent scrim with target spotlight cut out */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.45)"
          mask="url(#tubeca-spotlight-mask)"
          style={{ transition: 'all 0.25s ease-out' }}
        />

        {/* Target Highlight: Glowing Dotted Royal Blue Border around highlighted button/area */}
        {targetRect && (
          <g>
            {/* Outer soft halo */}
            <rect
              x={targetRect.x - 2}
              y={targetRect.y - 2}
              width={targetRect.width + 4}
              height={targetRect.height + 4}
              rx="14"
              fill="none"
              stroke="rgba(37, 99, 235, 0.28)"
              strokeWidth="4"
            />
            {/* Dotted border with pulsing effect */}
            <rect
              x={targetRect.x}
              y={targetRect.y}
              width={targetRect.width}
              height={targetRect.height}
              rx="14"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.8"
              strokeDasharray="8 6"
              filter="url(#tubeca-halo-glow)"
            />
          </g>
        )}

        {/* Dotted Line with Curved Arrow pointing from Card to Target */}
        {targetRect && (
          <g>
            {/* White contrast under-stroke for sharp visibility on any background */}
            <path
              d={`M ${cardPlacement.arrowStart.x} ${cardPlacement.arrowStart.y} Q ${cardPlacement.arrowControl.x} ${cardPlacement.arrowControl.y} ${cardPlacement.arrowEnd.x} ${cardPlacement.arrowEnd.y}`}
              fill="none"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinecap="round"
              strokeOpacity="0.9"
            />
            {/* Royal blue dotted line with arrowhead */}
            <path
              d={`M ${cardPlacement.arrowStart.x} ${cardPlacement.arrowStart.y} Q ${cardPlacement.arrowControl.x} ${cardPlacement.arrowControl.y} ${cardPlacement.arrowEnd.x} ${cardPlacement.arrowEnd.y}`}
              fill="none"
              stroke="#2563eb"
              strokeWidth="3.2"
              strokeDasharray="8 6"
              strokeLinecap="round"
              markerEnd="url(#tubeca-tour-arrowhead)"
              style={{
                transition: 'd 0.25s ease-out',
                animation: 'tubecaDash 1.4s linear infinite',
              }}
            />
          </g>
        )}
      </svg>

      {/* Floating Tooltip Callout Card — Light Theme (Tema Claro) */}
      <div
        ref={cardRef}
        style={{
          position: 'absolute',
          left: `${cardPlacement.cardX}px`,
          top: `${cardPlacement.cardY}px`,
          width: 'min(380px, calc(100vw - 32px))',
          maxHeight: 'calc(100dvh - 84px)',
          overflowY: 'auto',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          color: 'var(--ink-900, #0f172a)',
          borderRadius: '16px',
          border: '1.5px solid var(--border-subtle, #e2e8f0)',
          boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.05)',
          padding: '16px 18px',
          zIndex: 10000,
          pointerEvents: 'auto',
          transition: 'left 0.22s cubic-bezier(0.16, 1, 0.3, 1), top 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          animation: 'tubecaFadeInScale 0.22s ease-out',
        }}
      >
        {/* Header: Step Pill Badge & Close Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexShrink: 0 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: 'var(--brand-50, #eff6ff)',
              border: '1px solid var(--brand-200, #bfdbfe)',
              color: 'var(--brand-700, #1d4ed8)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            {step.icon}
            <span>{step.badge}</span>
          </div>

          <button
            onClick={handleSkip}
            aria-label="Cerrar tutorial"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface-subtle, #f8fafc)',
              color: 'var(--ink-400, #94a3b8)',
              border: '1px solid var(--border-subtle, #e2e8f0)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
              e.currentTarget.style.color = 'var(--ink-900, #0f172a)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-subtle, #f8fafc)';
              e.currentTarget.style.color = 'var(--ink-400, #94a3b8)';
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.0625rem',
            fontWeight: 800,
            color: 'var(--ink-900, #0f172a)',
            lineHeight: 1.25,
            marginBottom: '6px',
            flexShrink: 0,
          }}
        >
          {step.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--ink-600, #475569)',
            lineHeight: 1.5,
            marginBottom: '10px',
          }}
        >
          {step.description}
        </p>

        {/* Hint Pill if available */}
        {step.hint && (
          <div
            style={{
              padding: '6px 10px',
              backgroundColor: 'var(--accent-50, #fefce8)',
              borderLeft: '3px solid var(--accent-500, #eab308)',
              borderRadius: '0 6px 6px 0',
              fontSize: '0.75rem',
              color: 'var(--accent-900, #713f12)',
              lineHeight: 1.4,
              marginBottom: '12px',
              flexShrink: 0,
            }}
          >
            {step.hint}
          </div>
        )}

        {/* Step dots indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '14px', flexShrink: 0 }}>
          {STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentStepIndex(idx)}
              aria-label={`Ir al paso ${idx + 1}`}
              style={{
                width: idx === currentStepIndex ? '20px' : '6px',
                height: '6px',
                borderRadius: '9999px',
                backgroundColor: idx === currentStepIndex ? 'var(--brand-600, #2563eb)' : 'var(--border-hover, #cbd5e1)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </div>

        {/* Footer Actions: Prev, Skip, Next (flexShrink: 0 guarantees they are ALWAYS visible) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginTop: 'auto',
            paddingTop: '6px',
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleSkip}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ink-500, #64748b)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '6px 2px',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink-900, #0f172a)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-500, #64748b)')}
          >
            Saltar tour
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  backgroundColor: '#ffffff',
                  color: 'var(--ink-700, #334155)',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-subtle, #f8fafc)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <ChevronLeft size={14} />
                <span>Anterior</span>
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 14px',
                borderRadius: '7px',
                backgroundColor: 'var(--brand-600, #2563eb)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--brand-700, #1d4ed8)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--brand-600, #2563eb)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {isLastStep ? (
                <>
                  <Sparkles size={14} />
                  <span>¡Empezar a explorar!</span>
                </>
              ) : (
                <>
                  <span>Siguiente</span>
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Embedded CSS animations */}
      <style jsx>{`
        @keyframes tubecaFadeInScale {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes tubecaDash {
          to {
            stroke-dashoffset: -28;
          }
        }
      `}</style>
    </div>
  );
}
