'use client';

import React from 'react';
import { Search, MapPin, Columns, GraduationCap, X, Heart, Compass } from 'lucide-react';
import { SiluetaColombia } from '@mteherandev/colombia-icons-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeView: 'split' | 'map';
  onViewChange: (view: 'split' | 'map') => void;
  favoritesCount: number;
  showingFavorites: boolean;
  onToggleShowingFavorites: () => void;
  onOpenOnboarding: () => void;
  totalBecas: number;
}

export function Header({
  searchQuery,
  onSearchChange,
  activeView,
  onViewChange,
  favoritesCount,
  showingFavorites,
  onToggleShowingFavorites,
  onOpenOnboarding,
  totalBecas,
}: HeaderProps) {
  return (
    <header
      style={{
        height: '68px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--brand-50)',
            color: 'var(--brand-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--brand-100)',
          }}
        >
          <GraduationCap size={22} strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: 'var(--ink-900)',
              }}
            >
              TuBeca
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                backgroundColor: 'var(--brand-50)',
                color: 'var(--brand-700)',
                padding: '2px 7px',
                borderRadius: '4px',
                border: '1px solid var(--brand-100)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <SiluetaColombia size={14} color="var(--brand-700)" />
              <span>COLOMBIA</span>
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--ink-500)', lineHeight: 1 }}>
            {totalBecas} convocatorias disponibles
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '380px',
          margin: '0 16px',
        }}
      >
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--ink-400)',
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por carrera, universidad o palabra clave..."
          aria-label="Buscar becas por palabra clave"
          style={{
            width: '100%',
            padding: '9px 36px 9px 36px',
            fontSize: '0.875rem',
            backgroundColor: 'var(--surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--ink-900)',
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--brand-600)';
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(29, 78, 216, 0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.backgroundColor = 'var(--surface-subtle)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ink-400)',
              padding: '2px',
              display: 'flex',
            }}
            title="Limpiar búsqueda"
            aria-label="Limpiar búsqueda"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Actions & View Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Onboarding / Quick Quiz Button */}
        <button
          onClick={onOpenOnboarding}
          aria-label="Abrir test de preguntas"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-md)',
            color: 'var(--brand-700)',
            backgroundColor: 'var(--brand-50)',
            border: '1px solid var(--brand-100)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-100)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-50)')}
        >
          <Compass size={15} />
          <span>Test de 4 preguntas</span>
        </button>

        {/* Favorites Toggle Button */}
        <button
          onClick={onToggleShowingFavorites}
          aria-label={showingFavorites ? 'Ver todas las becas' : `Ver becas favoritas (${favoritesCount})`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-md)',
            color: showingFavorites ? 'var(--favorite-color)' : 'var(--ink-700)',
            backgroundColor: showingFavorites ? 'var(--favorite-bg)' : 'var(--surface-subtle)',
            border: `1px solid ${showingFavorites ? '#fde047' : 'var(--border-subtle)'}`,
            transition: 'all 0.15s ease',
          }}
        >
          <Heart size={15} fill={showingFavorites ? 'currentColor' : 'none'} strokeWidth={showingFavorites ? 0 : 2} />
          <span>Favoritas</span>
          {favoritesCount > 0 && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                backgroundColor: showingFavorites ? 'var(--favorite-color)' : 'var(--ink-400)',
                color: '#ffffff',
                padding: '1px 6px',
                borderRadius: '9999px',
              }}
            >
              {favoritesCount}
            </span>
          )}
        </button>

        {/* View Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--surface-subtle)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={() => onViewChange('split')}
            aria-label="Ver panel dividido de lista y detalle"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: '6px',
              color: activeView === 'split' ? 'var(--ink-900)' : 'var(--ink-500)',
              backgroundColor: activeView === 'split' ? '#ffffff' : 'transparent',
              boxShadow: activeView === 'split' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Columns size={15} />
            <span>Lista</span>
          </button>
          <button
            onClick={() => onViewChange('map')}
            aria-label="Ver mapa interactivo de Colombia"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: '6px',
              color: activeView === 'map' ? 'var(--ink-900)' : 'var(--ink-500)',
              backgroundColor: activeView === 'map' ? '#ffffff' : 'transparent',
              boxShadow: activeView === 'map' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <MapPin size={15} />
            <span>Mapa</span>
          </button>
        </div>
      </div>
    </header>
  );
}
