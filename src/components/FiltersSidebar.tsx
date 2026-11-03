'use client';

import React from 'react';
import { Filter, RotateCcw, Check, X } from 'lucide-react';

export interface FilterState {
  tipo: string;
  cobertura: string;
  estado: string;
  ciudad: string;
  departamento: string;
  universidadTipo: string;
  categoria: string;
}

interface FiltersSidebarProps {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  totalFiltered: number;
  totalCount: number;
  ciudades: string[];
  departamentos?: string[];
  categorias: string[];
  onCloseMobile?: () => void;
}

export function FiltersSidebar({
  filters,
  onFilterChange,
  onResetFilters,
  totalFiltered,
  totalCount,
  ciudades,
  departamentos,
  categorias,
  onCloseMobile,
}: FiltersSidebarProps) {
  const activeCity = filters.ciudad || filters.departamento || '';
  const hasActiveFilters =
    filters.tipo !== '' ||
    filters.cobertura !== '' ||
    activeCity !== '' ||
    filters.categoria !== '';

  const tipoOptions = [
    { id: '', label: 'Todos los niveles' },
    { id: 'pregrado', label: 'Pregrado' },
    { id: 'posgrado', label: 'Posgrado / Maestría' },
    { id: 'doctorado', label: 'Doctorado' },
    { id: 'tecnico', label: 'Técnico' },
  ];

  const coberturaOptions = [
    { id: '', label: 'Cualquier cobertura' },
    { id: 'total', label: '100% Total' },
    { id: 'parcial', label: 'Parcial' },
  ];

  const availableCities = ciudades && ciudades.length > 0 ? ciudades : departamentos || [];

  return (
    <aside
      className="tubeca-filters-sidebar"
      style={{
        width: '100%',
        maxWidth: '280px',
        height: '100%',
        minHeight: 0,
        overflowY: 'auto',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-subtle)',
        padding: '24px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
      }}
    >
      {/* Header & Reset */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} style={{ color: 'var(--brand-600)' }} />
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ink-900)' }}>
            Filtros
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--brand-700)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 6px',
              }}
            >
              <RotateCcw size={11} />
              <span>Limpiar</span>
            </button>
          )}

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              aria-label="Cerrar filtros"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-subtle)',
                border: 'none',
                color: 'var(--ink-700)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Counter Tag */}
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: 'var(--surface-subtle)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8125rem',
          color: 'var(--ink-700)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Convocatorias:</span>
        <strong style={{ color: 'var(--brand-700)' }}>
          {totalFiltered} de {totalCount}
        </strong>
      </div>

      {/* 1. Nivel de estudio */}
      <section>
        <label
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--ink-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '8px',
          }}
        >
          Nivel Académico
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {tipoOptions.map((opt) => {
            const isSelected = filters.tipo === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onFilterChange('tipo', opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? 'var(--brand-700)' : 'var(--ink-700)',
                  backgroundColor: isSelected ? 'var(--brand-50)' : 'transparent',
                  textAlign: 'left',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-subtle)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={14} style={{ color: 'var(--brand-600)' }} />}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Cobertura */}
      <section>
        <label
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--ink-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '8px',
          }}
        >
          Cobertura
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {coberturaOptions.map((opt) => {
            const isSelected = filters.cobertura === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onFilterChange('cobertura', opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? 'var(--brand-700)' : 'var(--ink-700)',
                  backgroundColor: isSelected ? 'var(--brand-50)' : 'transparent',
                  textAlign: 'left',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-subtle)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={14} style={{ color: 'var(--brand-600)' }} />}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Ciudad de la universidad */}
      <section>
        <label
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--ink-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '8px',
          }}
        >
          Ciudad de la universidad
        </label>
        <select
          value={activeCity}
          onChange={(e) => {
            onFilterChange('ciudad', e.target.value);
            onFilterChange('departamento', e.target.value);
          }}
          style={{
            width: '100%',
            padding: '8px 10px',
            fontSize: '0.8125rem',
            backgroundColor: 'var(--surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--ink-900)',
            outline: 'none',
          }}
        >
          <option value="">Todas las ciudades</option>
          {availableCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </section>

      {/* 4. Categoría / Enfoque */}
      <section>
        <label
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--ink-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '8px',
          }}
        >
          Enfoque o Categoría
        </label>
        <select
          value={filters.categoria}
          onChange={(e) => onFilterChange('categoria', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 10px',
            fontSize: '0.8125rem',
            backgroundColor: 'var(--surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--ink-900)',
            outline: 'none',
          }}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </section>
    </aside>
  );
}
