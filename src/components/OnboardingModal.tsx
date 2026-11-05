'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  X,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Sparkles,
  MapPin,
  Compass,
  Award,
  HeartHandshake,
  Trophy,
  Users,
  Cpu,
} from 'lucide-react';
import type { FilterState } from './FiltersSidebar';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: Partial<FilterState>) => void;
}

export function OnboardingModal({ isOpen, onClose, onApplyFilters }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [selectedNivel, setSelectedNivel] = useState('');
  const [selectedMotivo, setSelectedMotivo] = useState('');
  const [selectedLugar, setSelectedLugar] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Entrance and step change animation
  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.94, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
      );
    }
  }, [isOpen]);

  useEffect(() => {
    if (stepContentRef.current) {
      gsap.fromTo(
        stepContentRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' },
      );
    }
  }, [step]);

  if (!isOpen) return null;

  const handleFinish = (finalCobertura?: string) => {
    const coberturaValue = finalCobertura ?? '';

    onApplyFilters({
      tipo: selectedNivel,
      categoria: selectedMotivo,
      ciudad: selectedLugar,
      departamento: selectedLugar,
      cobertura: coberturaValue,
    });
    onClose();
  };

  return (
    <div className="tubeca-onboarding-overlay">
      <div ref={modalRef} className="tubeca-onboarding-modal">
        {/* Top Bar with Progress and Skip 'X' */}
        <div className="tubeca-onboarding-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--brand-700)',
                backgroundColor: 'var(--brand-50)',
                padding: '3px 8px',
                borderRadius: '9999px',
                border: '1px solid var(--brand-100)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Paso {step} de {totalSteps}
            </span>
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--ink-500)',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Encuentra tus becas ideales
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface-subtle)',
              color: 'var(--ink-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease',
              flexShrink: 0,
            }}
            title="Saltar preguntas y ver todas las becas"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar Indicator */}
        <div style={{ width: '100%', height: '3px', backgroundColor: 'var(--surface-subtle)' }}>
          <div
            style={{
              height: '100%',
              width: `${(step / totalSteps) * 100}%`,
              backgroundColor: 'var(--brand-600)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Step Body */}
        <div ref={stepContentRef} className="tubeca-onboarding-body">
          {/* STEP 1: Nivel de Estudio */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                  ¿Qué nivel de estudio buscas?
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ink-500)', marginTop: '4px', lineHeight: 1.4 }}>
                  Selecciona el tipo de formación para filtrar convocatorias exactas.
                </p>
              </div>

              <div className="tubeca-onboarding-grid">
                {[
                  { id: 'pregrado', label: 'Pregrado', sub: 'Carrera universitaria profesional', icon: GraduationCap },
                  { id: 'posgrado', label: 'Posgrado / Maestría', sub: 'Especialización o Master', icon: Compass },
                  { id: 'doctorado', label: 'Doctorado', sub: 'Programas PhD o investigación', icon: Award },
                  { id: 'tecnico', label: 'Técnico / Tecnológico', sub: 'Programas de corta duración', icon: Users },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedNivel === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedNivel(item.id);
                        setStep(2);
                      }}
                      className="tubeca-onboarding-btn"
                      style={{
                        backgroundColor: isSelected ? 'var(--brand-50)' : 'var(--surface-card)',
                        border: `1.5px solid ${isSelected ? 'var(--brand-600)' : 'var(--border-subtle)'}`,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--border-hover)';
                          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          e.currentTarget.style.backgroundColor = 'var(--surface-card)';
                        }
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? '#ffffff' : 'var(--surface-subtle)',
                          color: 'var(--brand-600)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="tubeca-onboarding-text-wrap">
                        <strong style={{ fontSize: '0.9rem', color: 'var(--ink-900)', display: 'block', lineHeight: 1.3 }}>
                          {item.label}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)', lineHeight: 1.3, display: 'block', marginTop: '2px' }}>
                          {item.sub}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Enfoque / Qué te mueve */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                  ¿Qué te mueve o cuál es tu perfil?
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ink-500)', marginTop: '4px', lineHeight: 1.4 }}>
                  Muchas becas se otorgan por condiciones específicas o talentos destacados.
                </p>
              </div>

              <div className="tubeca-onboarding-grid">
                {[
                  { id: 'Mérito Académico', label: 'Mérito Académico', sub: 'Puntajes ICFES o notas altas', icon: Award },
                  { id: 'Necesidad Económica', label: 'Necesidad Económica', sub: 'Estratos 1, 2, 3 o SISBEN', icon: HeartHandshake },
                  { id: 'Mujer en STEM', label: 'Mujer en STEM', sub: 'Ingeniería, ciencias y tecnología', icon: Cpu },
                  { id: 'Deportiva', label: 'Deporte Destacado', sub: 'Atletas de alto rendimiento', icon: Trophy },
                  { id: 'Comunidades Étnicas', label: 'Comunidades Étnicas', sub: 'Afro, indígenas o ROM', icon: Users },
                  { id: '', label: 'Cualquier enfoque', sub: 'Ver todas las opciones', icon: Sparkles },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedMotivo === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedMotivo(item.id);
                        setStep(3);
                      }}
                      className="tubeca-onboarding-btn"
                      style={{
                        backgroundColor: isSelected ? 'var(--brand-50)' : 'var(--surface-card)',
                        border: `1.5px solid ${isSelected ? 'var(--brand-600)' : 'var(--border-subtle)'}`,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--border-hover)';
                          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          e.currentTarget.style.backgroundColor = 'var(--surface-card)';
                        }
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: isSelected ? '#ffffff' : 'var(--surface-subtle)',
                          color: 'var(--brand-600)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="tubeca-onboarding-text-wrap">
                        <strong style={{ fontSize: '0.875rem', color: 'var(--ink-900)', display: 'block', lineHeight: 1.3 }}>
                          {item.label}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)', lineHeight: 1.3, display: 'block', marginTop: '2px' }}>
                          {item.sub}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Ciudad / Dónde quieres estudiar */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                  ¿Dónde quieres estudiar?
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ink-500)', marginTop: '4px', lineHeight: 1.4 }}>
                  Elige la ciudad donde buscas sede o si prefieres becas de alcance nacional.
                </p>
              </div>

              <div className="tubeca-onboarding-grid">
                {[
                  { id: '', label: 'Toda Colombia', sub: 'Todas las ciudades universitarias' },
                  { id: 'Medellín', label: 'Medellín', sub: 'EAFIT, UPB, U. de Medellín, CES' },
                  { id: 'Bogotá', label: 'Bogotá D.C.', sub: 'Uniandes, Javeriana, Rosario, Externado' },
                  { id: 'Cali', label: 'Cali', sub: 'Universidad Icesi, Univalle, Javeriana Cali' },
                  { id: 'Barranquilla', label: 'Barranquilla', sub: 'Uninorte, U. del Atlántico' },
                  { id: 'Bucaramanga', label: 'Bucaramanga', sub: 'UIS, UNAB, UDES' },
                ].map((item) => {
                  const isSelected = selectedLugar === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedLugar(item.id);
                        setStep(4);
                      }}
                      className="tubeca-onboarding-btn"
                      style={{
                        backgroundColor: isSelected ? 'var(--brand-50)' : 'var(--surface-card)',
                        border: `1.5px solid ${isSelected ? 'var(--brand-600)' : 'var(--border-subtle)'}`,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--border-hover)';
                          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          e.currentTarget.style.backgroundColor = 'var(--surface-card)';
                        }
                      }}
                    >
                      <MapPin size={18} style={{ color: 'var(--brand-600)', flexShrink: 0, marginTop: '2px' }} />
                      <div className="tubeca-onboarding-text-wrap">
                        <strong style={{ fontSize: '0.875rem', color: 'var(--ink-900)', display: 'block', lineHeight: 1.3 }}>
                          {item.label}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)', lineHeight: 1.3, display: 'block', marginTop: '2px' }}>
                          {item.sub}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Cobertura Requerida */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                  ¿Qué cobertura necesitas?
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ink-500)', marginTop: '4px', lineHeight: 1.4 }}>
                  ¿Buscas beca completa del 100% o cualquier porcentaje de apoyo económico?
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  {
                    id: 'total',
                    label: '100% Cobertura Total (Matrícula Completa)',
                    sub: 'Exención del 100% del costo de matrícula, créditos condonables o subsidios totales.',
                    pill: 'Más solicitadas',
                  },
                  {
                    id: 'parcial',
                    label: 'Cobertura Parcial (Desde 25% al 90%)',
                    sub: 'Descuentos significativos en la matrícula y apoyos de sostenimiento.',
                    pill: 'Mayor disponibilidad',
                  },
                  {
                    id: '',
                    label: 'Cualquier cobertura disponible',
                    sub: 'Quiero ver todas las alternativas sin restricción financiera.',
                    pill: 'Catálogo completo',
                  },
                ].map((item) => {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleFinish(item.id)}
                      style={{
                        padding: '14px 16px',
                        backgroundColor: 'var(--surface-card)',
                        border: '1.5px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.15s ease',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--brand-600)';
                        e.currentTarget.style.backgroundColor = 'var(--brand-50)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.backgroundColor = 'var(--surface-card)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <div className="tubeca-onboarding-text-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                          <strong style={{ fontSize: '0.875rem', color: 'var(--ink-900)', lineHeight: 1.3 }}>
                            {item.label}
                          </strong>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              color: 'var(--brand-700)',
                              backgroundColor: 'var(--brand-100)',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.pill}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)', lineHeight: 1.35, display: 'block' }}>
                          {item.sub}
                        </span>
                      </div>

                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--brand-600)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ChevronRight size={16} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="tubeca-onboarding-footer">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--ink-700)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                flexShrink: 0,
              }}
            >
              <ChevronLeft size={16} />
              <span>Anterior</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--brand-700)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'right',
            }}
          >
            <span style={{ display: 'inline' }}>Saltar test ➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}

