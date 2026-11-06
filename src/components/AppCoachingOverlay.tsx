'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Layers,
  CheckCircle2,
  MapPin,
  Scale,
  User,
  Heart,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';
import { triggerSaveConfetti } from '@/lib/confetti';

export interface AppCoachingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activeView?: 'split' | 'map';
  onNavigateView?: (view: 'split' | 'map') => void;
}

interface TourStep {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  tip: string;
  icon: React.ReactNode;
  renderPreview: () => React.ReactNode;
}

export function AppCoachingOverlay({
  isOpen: controlledIsOpen,
  onClose,
  activeView,
  onNavigateView,
}: AppCoachingOverlayProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const isOpen = controlledIsOpen || internalIsOpen;

  const handleClose = () => {
    try {
      localStorage.setItem('tubeca_intro_seen', 'true');
    } catch {
      // ignore
    }
    setInternalIsOpen(false);
    onClose();
  };

  const handleOpen = () => {
    setCurrentStep(0);
    setInternalIsOpen(true);
  };

  const steps: TourStep[] = [
    {
      id: 'search-filters',
      badge: 'Paso 1 de 6 · Búsqueda',
      title: 'Buscador y Filtros Inteligentes',
      subtitle: 'Encuentra becas a tu medida en segundos',
      description:
        'Escribe tu carrera (ej. Medicina, Sistemas), tu universidad de interés o tu ciudad. Usa los filtros para afinar por nivel académico, 100% de cobertura o estrato socioeconómico.',
      tip: 'Puedes filtrar por becas de Pregrado o Posgrado y convocatorias del Icetex o privadas.',
      icon: <Search size={20} style={{ color: 'var(--brand-600, #2563eb)' }} />,
      renderPreview: () => (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          >
            <Search size={16} style={{ color: '#64748b' }} />
            <span style={{ fontSize: '0.8125rem', color: '#0f172a', fontWeight: 600 }}>
              Ingeniería de Sistemas · Bogotá
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
              }}
            >
              🎓 Pregrado
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: '#fefce8',
                color: '#a16207',
                border: '1px solid #fef08a',
              }}
            >
              ⭐ Cobertura 100%
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
              }}
            >
              📍 Nacional
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'swipe',
      badge: 'Paso 2 de 6 · Modo Swipe',
      title: 'Explora con Modo Tarjetas',
      subtitle: 'Desliza hacia la derecha para guardar o pulsa ❤️',
      description:
        'Explora las convocatorias una a una en tarjetas interactivas con su contorno y detalles clave. Desliza a la derecha o pulsa ❤️ para guardar en tus favoritas; desliza a la izquierda o pulsa ✕ para descartar.',
      tip: 'En computador puedes usar las teclas de flecha ← y → de tu teclado para revisar más rápido.',
      icon: <Layers size={20} style={{ color: '#e11d48' }} />,
      renderPreview: () => (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #3b82f6',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 8px 20px -4px rgba(59, 130, 246, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb' }}>
              Universidad de los Andes
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: '#dcfce7',
                color: '#15803d',
              }}
            >
              100% Matrícula
            </span>
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
            Beca Quiero Estudiar
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '6px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              ✕ Descartar (←)
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              <Heart size={14} fill="#15803d" /> Guardar (→)
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'requirements',
      badge: 'Paso 3 de 6 · Verificador',
      title: 'Verificador "¿Aplico a esta Beca?"',
      subtitle: 'Comprueba notas Saber 11 y requisitos al instante',
      description:
        'Cada convocatoria muestra sus requisitos de ingreso: puntaje Saber 11 necesario, promedio académico mínimo (ej. Promedio ≥ 4.0), estrato socioeconómico y checklist de documentos exigidos.',
      tip: 'Puedes simular tu puntaje para ver si cumples al 100% antes de iniciar la solicitud.',
      icon: <CheckCircle2 size={20} style={{ color: '#16a34a' }} />,
      renderPreview: () => (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: '#334155', fontWeight: 600 }}>
              Puntaje Saber 11 mínimo
            </span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#2563eb' }}>
              340 / 500
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: '#334155', fontWeight: 600 }}>
              Promedio académico
            </span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#d97706' }}>
              Promedio ≥ 4.0
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: '#16a34a',
              fontWeight: 700,
              padding: '4px 6px',
            }}
          >
            <CheckCircle2 size={15} /> Cumples con todos los criterios de elegibilidad
          </div>
        </div>
      ),
    },
    {
      id: 'map',
      badge: 'Paso 4 de 6 · Mapa',
      title: 'Mapa Universitario de Colombia',
      subtitle: 'Convocatorias organizadas por departamento',
      description:
        'Alterna a la vista de Mapa para ubicar becas regionales en Bogotá, Antioquia, Valle, Caribe y el resto del territorio nacional. Toca cualquier nodo departamental para ver las oportunidades de esa zona.',
      tip: 'Puedes abrir el mapa haciendo clic en el botón "Mapa" en la parte superior.',
      icon: <MapPin size={20} style={{ color: '#0284c7' }} />,
      renderPreview: () => (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8fafc',
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/mapa-colombia.png"
              alt="Miniatura mapa Colombia"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>
              Explora por departamento
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
              Bogotá (45 becas) · Antioquia (28 becas) · Valle del Cauca (19 becas)...
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'comparator',
      badge: 'Paso 5 de 6 · Comparador',
      title: 'Tus Guardadas y Comparador Cara a Cara',
      subtitle: 'Elige las mejores opciones sin dudar',
      description:
        'Tus becas favoritas quedan reunidas en la sección "Guardadas". Puedes marcar hasta 3 becas simultáneas y abrir el Comparador para analizar coberturas, requisitos y fechas lado a lado.',
      tip: 'El botón de balanza ⚖️ en la barra inferior flotante se activa al marcar tus becas.',
      icon: <Scale size={20} style={{ color: '#7c3aed' }} />,
      renderPreview: () => (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Scale size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>
                2 becas seleccionadas
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                Compara porcentaje de matrícula y subsidios
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#7c3aed',
              backgroundColor: '#ede9fe',
              padding: '4px 10px',
              borderRadius: '6px',
            }}
          >
            Comparar
          </span>
        </div>
      ),
    },
    {
      id: 'account',
      badge: 'Paso 6 de 6 · Tu Cuenta',
      title: 'Tu Cuenta y Alertas de Convocatoria',
      subtitle: 'Acceso seguro sin contraseñas difíciles',
      description:
        'Ingresa con tu correo personal mediante un enlace directo de acceso ("Magic Link"). Guarda tus becas en la nube de forma permanente para consultarlas desde tu celular o computador, y recibe alertas antes de que venzan las postulaciones.',
      tip: 'No necesitas recordar contraseñas: te enviamos un enlace de 1 solo clic a tu bandeja de entrada.',
      icon: <User size={20} style={{ color: '#059669' }} />,
      renderPreview: () => (
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1.5px solid #bbf7d0',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <User size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#166534' }}>
              Sincronización en la Nube
            </div>
            <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '2px' }}>
              Tus becas guardadas siempre contigo en cualquier dispositivo.
            </div>
          </div>
        </div>
      ),
    },
  ];

  const activeStepData = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      triggerSaveConfetti();
      handleClose();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <>
      {/* Discreet floating trigger button: doesn't alter header or page interface */}
      <button
        onClick={handleOpen}
        aria-label="Abrir guía de uso de TuBeca"
        title="¿Cómo usar TuBeca? Recorrido interactivo"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '9px 14px',
          backgroundColor: '#ffffff',
          color: 'var(--brand-700, #1d4ed8)',
          border: '1.5px solid var(--brand-300, #93c5fd)',
          borderRadius: '9999px',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.18)',
          fontWeight: 700,
          fontSize: '0.8125rem',
          cursor: 'pointer',
          transition: 'all 0.18s ease',
        }}
      >
        <HelpCircle size={16} style={{ color: 'var(--brand-600, #2563eb)' }} />
        <span>¿Cómo funciona?</span>
      </button>

      {/* Standalone Tour Modal (Clean Light Theme, 100% Responsive, No Interface Changes) */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Recorrido guiado de TuBeca"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.25)',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--brand-50, #eff6ff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GraduationCap size={18} style={{ color: 'var(--brand-600, #2563eb)' }} />
                </div>
                <div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--brand-600, #2563eb)',
                    }}
                  >
                    Guía de la Plataforma
                  </span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
                    TuBeca Colombia
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                aria-label="Cerrar recorrido"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div
              style={{
                padding: '20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Badge & Step indicator */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #dbeafe',
                  }}
                >
                  {activeStepData.badge}
                </span>

                {/* Dots indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {steps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      aria-label={`Ir al paso ${idx + 1}`}
                      style={{
                        width: idx === currentStep ? '18px' : '7px',
                        height: '7px',
                        borderRadius: '9999px',
                        backgroundColor: idx === currentStep ? 'var(--brand-600, #2563eb)' : '#cbd5e1',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'all 0.2s ease',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Title and Subtitle */}
              <div>
                <h3
                  style={{
                    fontSize: '1.1875rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {activeStepData.icon}
                  <span>{activeStepData.title}</span>
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '3px', fontWeight: 600 }}>
                  {activeStepData.subtitle}
                </p>
              </div>

              {/* Visual Demo / Card Mockup */}
              <div style={{ minHeight: '110px' }}>{activeStepData.renderPreview()}</div>

              {/* Explanatory Description */}
              <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.55 }}>
                {activeStepData.description}
              </p>

              {/* Tip callout */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  backgroundColor: '#fefce8',
                  border: '1px solid #fef08a',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '0.78125rem',
                  color: '#854d0e',
                  lineHeight: 1.45,
                }}
              >
                <Sparkles size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#ca8a04' }} />
                <span>
                  <strong>Tip:</strong> {activeStepData.tip}
                </span>
              </div>
            </div>

            {/* Footer with Responsive Action Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderTop: '1px solid #f1f5f9',
                backgroundColor: '#ffffff',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '8px 10px',
                }}
              >
                Saltar
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                {!isFirst && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Paso anterior"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                      minHeight: '40px',
                    }}
                  >
                    <ChevronLeft size={16} />
                    <span>Anterior</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  aria-label={isLast ? 'Finalizar tutorial' : 'Siguiente paso'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--brand-600, #2563eb)',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                    cursor: 'pointer',
                    minHeight: '40px',
                  }}
                >
                  <span>{isLast ? '¡Empezar a buscar!' : 'Siguiente'}</span>
                  {isLast ? <Sparkles size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
