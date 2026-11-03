'use client';

import React from 'react';
import { Search, MapPin, Columns, GraduationCap, X, Heart, Compass, Filter } from 'lucide-react';
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
  onOpenMobileFilters?: () => void;
  activeFiltersCount?: number;
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
  onOpenMobileFilters,
  activeFiltersCount = 0,
  totalBecas,
}: HeaderProps) {
  return (
    <header
      className="tubeca-header"
      style={{
        height: '68px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-sm)',
        gap: '12px',
      }}
    >
      {/* Mobile-Only Filter Button (Left on Mobile as requested) */}
      <div className="tubeca-header-mobile-filters">
        <button
          onClick={onOpenMobileFilters}
          aria-label="Abrir filtros"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: activeFiltersCount > 0 ? 'var(--brand-50)' : 'var(--surface-subtle)',
            color: activeFiltersCount > 0 ? 'var(--brand-700)' : 'var(--ink-700)',
            border: `1px solid ${activeFiltersCount > 0 ? 'var(--brand-200, #bfdbfe)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Filter size={15} style={{ color: activeFiltersCount > 0 ? 'var(--brand-600)' : 'inherit' }} />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-600)',
                color: '#ffffff',
                fontSize: '0.6875rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Brand (Desktop Only or compact) */}
      <div className="tubeca-header-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
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
            {totalBecas} convocatorias
          </p>
        </div>
      </div>

      {/* Search Input (Centered on desktop, flexes on mobile) */}
      <div
        className="tubeca-header-search"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
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
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por carrera, universidad..."
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
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            title="Limpiar búsqueda"
            aria-label="Limpiar búsqueda"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Onboarding / Quick Quiz Button (Desktop only) */}
        <div className="tubeca-header-quiz-btn">
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
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-100)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-50)')}
          >
            <Compass size={15} />
            <span>Test</span>
          </button>
        </div>

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
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Heart size={15} fill={showingFavorites ? 'currentColor' : 'none'} strokeWidth={showingFavorites ? 0 : 2} />
          <span className="tubeca-fav-label">{showingFavorites ? 'Explorar' : 'Guardadas'}</span>
          {favoritesCount > 0 && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                backgroundColor: showingFavorites ? 'var(--favorite-color)' : 'var(--brand-600)',
                color: '#ffffff',
                padding: '1px 6px',
                borderRadius: '9999px',
              }}
            >
              {favoritesCount}
            </span>
          )}
        </button>

        {/* Optional View Switcher (Desktop only) */}
        <div
          className="tubeca-header-view-toggle"
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
            aria-label="Ver baraja y detalle"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              color: activeView === 'split' ? 'var(--ink-900)' : 'var(--ink-500)',
              backgroundColor: activeView === 'split' ? '#ffffff' : 'transparent',
              boxShadow: activeView === 'split' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Columns size={14} />
            <span>Swipe</span>
          </button>
          <button
            onClick={() => onViewChange('map')}
            aria-label="Ver mapa interactivo de Colombia"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              color: activeView === 'map' ? 'var(--ink-900)' : 'var(--ink-500)',
              backgroundColor: activeView === 'map' ? '#ffffff' : 'transparent',
              boxShadow: activeView === 'map' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <MapPin size={14} />
            <span>Mapa</span>
          </button>
        </div>
      </div>
    </header>
  );
}
