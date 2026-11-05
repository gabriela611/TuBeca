'use client';

import React, { useState } from 'react';
import { X, Mail, CheckCircle2, AlertCircle, LogOut, User, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; email: string } | null;
  onSignOut: () => void;
}

export function AuthModal({ isOpen, onClose, user, onSignOut }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    if (!supabase) {
      setErrorMsg(
        'Supabase Auth no está configurado aún en las variables de entorno (NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY). La app continuará guardando tus datos en este navegador.'
      );
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      if (error) {
        throw error;
      }

      setSent(true);
    } catch (err: unknown) {
      console.error('Error enviando enlace mágico:', err);
      const message = err instanceof Error ? err.message : 'No se pudo enviar el enlace. Intenta de nuevo.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 120,
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
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg, 12px)',
          boxShadow: 'var(--shadow-modal, 0 20px 25px -5px rgba(0, 0, 0, 0.2))',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--brand-50, #eff6ff)',
                color: 'var(--brand-600, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={18} />
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ink-900)', margin: 0 }}>
              {user ? 'Mi Cuenta' : 'Iniciar Sesión'}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ink-400)',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 22px' }}>
          {user ? (
            /* Logged-in State */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--brand-50, #eff6ff)',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--brand-100, #dbeafe)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-600, #2563eb)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--brand-700, #1d4ed8)', fontWeight: 600 }}>
                    Sesión iniciada
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--ink-900)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user.email}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--ink-600)', lineHeight: 1.5, margin: 0 }}>
                Tus becas favoritas y tu perfil de elegibilidad están sincronizados con la nube y disponibles desde
                cualquier dispositivo.
              </p>

              <button
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: '#ffffff',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  borderRadius: 'var(--radius-md, 8px)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '8px',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <LogOut size={16} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          ) : sent ? (
            /* Email Sent confirmation */
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <CheckCircle2 size={30} />
              </div>

              <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--ink-900)', marginBottom: '8px' }}>
                ¡Revisa tu correo!
              </h3>

              <p style={{ fontSize: '0.875rem', color: 'var(--ink-600)', lineHeight: 1.5, marginBottom: '20px' }}>
                Hemos enviado un enlace mágico a <strong>{email}</strong>. Haz clic en el enlace para ingresar sin
                contraseña.
              </p>

              <button
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--brand-700)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textDecoration: 'underline',
                }}
              >
                Enviar a otro correo
              </button>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleSendMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-600)', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  Guarda tus becas favoritas en tu cuenta y accede a ellas desde cualquier dispositivo mediante un enlace
                  mágico sin contraseña.
                </p>

                <label
                  htmlFor="auth-email-input"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: 'var(--ink-800)',
                    marginBottom: '6px',
                  }}
                >
                  Correo electrónico
                </label>

                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--ink-400)',
                      pointerEvents: 'none',
                    }}
                  >
                    <Mail size={16} />
                  </div>
                  <input
                    id="auth-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="estudiante@ejemplo.edu.co"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      border: '1.5px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md, 8px)',
                      fontSize: '0.875rem',
                      color: 'var(--ink-900)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {errorMsg && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '10px 12px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 'var(--radius-md, 8px)',
                    fontSize: '0.8125rem',
                    color: '#b91c1c',
                    lineHeight: 1.4,
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  backgroundColor: 'var(--brand-600, #2563eb)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md, 8px)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--brand-700, #1d4ed8)')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--brand-600, #2563eb)')}
              >
                <Sparkles size={16} />
                <span>{loading ? 'Enviando enlace...' : 'Enviar enlace mágico'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
