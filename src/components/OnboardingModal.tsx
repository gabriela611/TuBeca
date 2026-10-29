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
  Percent,
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
  const [selectedCobertura, setSelectedCobertura] = useState('');

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
    const coberturaValue = finalCobertura ?? selectedCobertura;

    onApplyFilters({
      tipo: selectedNivel,
      categoria: selectedMotivo,
      departamento: selectedLugar,
      cobertura: coberturaValue,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(28, 25, 23, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        ref={modalRef}
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Top Bar with Progress and Skip 'X' */}
        <div
          style={{
            padding: '18px 24px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--brand-700)',
                backgroundColor: 'var(--brand-50)',
                padding: '3px 8px',
                borderRadius: '9999px',
                border: '1px solid var(--brand-100)',
              }}
            >
              Paso {step} de {totalSteps}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--ink-500)', fontWeight: 500 }}>
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
        <div
          ref={stepContentRef}
          style={{
            padding: '28px 28px 24px',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '360px',
          }}
        >
          {/* STEP 1: Nivel de Estudio */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>
                  ¿Qué nivel de estudio buscas?
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-500)', marginTop: '4px' }}>
                  Selecciona el tipo de formación para filtrar convocatorias exactas.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                      style={{
                        padding: '16px',
                        backgroundColor: isSelected ? 'var(--brand-50)' : 'var(--surface-card)',
                        border: `1.5px solid ${isSelected ? 'var(--brand-600)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.15s ease',
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
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--ink-900)', display: 'block' }}>
                          {item.label}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)', lineHeight: 1.3 }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>
                  ¿Qué te mueve o cuál es tu perfil?
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-500)', marginTop: '4px' }}>
                  Muchas becas se otorgan por condiciones específicas o talentos destacados.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                      style={{
                        padding: '14px',
                        backgroundColor: isSelected ? 'var(--brand-50)' : 'var(--surface-card)',
                        border: `1.5px solid ${isSelected ? 'var(--brand-600)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.15s ease',
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
                      <div>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--ink-900)', display: 'block' }}>
                          {item.label}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>
                          {item.sub}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Región / Dónde quieres estudiar */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>
                  ¿Dónde quieres estudiar?
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-500)', marginTop: '4px' }}>
                  Elige la región donde buscas sede o si prefieres becas de alcance nacional.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { id: '', label: 'Toda Colombia', sub: 'Becas nacionales y virtuales' },
                  { id: 'Cundinamarca', label: 'Bogotá D.C. / Cundinamarca', sub: 'Uniandes, UNAL, Javeriana, Rosario' },
                  { id: 'Antioquia', label: 'Antioquia / Medellín', sub: 'UdeA, EAFIT, UNAL Medellín' },
                  { id: 'Valle del Cauca', label: 'Valle del Cauca / Cali', sub: 'Univalle, Javeriana Cali' },
                  { id: 'Atlántico', label: 'Atlántico / Barranquilla', sub: 'Uninorte, U. del Atlántico' },
                  { id: 'Santander', label: 'Santander / Bucaramanga', sub: 'UIS, UNAB, UDES' },
                ].map((item) => {
                  const isSelected = selectedLugar === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedLugar(item.id);
                        setStep(4);
                      }}
                      style={{
                        padding: '14px',
                        backgroundColor: isSelected ? 'var(--brand-50)' : 'var(--surface-card)',
                        border: `1.5px solid ${isSelected ? 'var(--brand-600)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.15s ease',
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
                      <MapPin size={18} style={{ color: 'var(--brand-600)', flexShrink: 0 }} />
                      <div>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--ink-900)', display: 'block' }}>
                          {item.label}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>
                  ¿Qué cobertura necesitas?
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-500)', marginTop: '4px' }}>
                  ¿Buscas beca completa del 100% o cualquier porcentaje de apoyo económico?
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                        padding: '18px 20px',
                        backgroundColor: 'var(--surface-card)',
                        border: '1.5px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--brand-600)';
                        e.currentTarget.style.backgroundColor = 'var(--brand-50)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.backgroundColor = 'var(--surface-card)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '0.9375rem', color: 'var(--ink-900)' }}>
                            {item.label}
                          </strong>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              color: 'var(--brand-700)',
                              backgroundColor: 'var(--brand-100)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {item.pill}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--ink-500)', lineHeight: 1.4 }}>
                          {item.sub}
                        </span>
                      </div>

                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--brand-600)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ChevronRight size={18} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 28px',
            backgroundColor: 'var(--surface-subtle)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--ink-500)',
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
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Saltar preguntas y explorar todas las becas ➔
          </button>
        </div>
      </div>
    </div>
  );
}

