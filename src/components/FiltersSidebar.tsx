'use client';

import React from 'react';
import { Filter, RotateCcw, Check } from 'lucide-react';

export interface FilterState {
  tipo: string;
  cobertura: string;
  estado: string;
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
  departamentos: string[];
  categorias: string[];
}

export function FiltersSidebar({
  filters,
  onFilterChange,
  onResetFilters,
  totalFiltered,
  totalCount,
  departamentos,
  categorias,
}: FiltersSidebarProps) {
  const hasActiveFilters =
    filters.tipo !== '' ||
    filters.cobertura !== '' ||
    filters.departamento !== '' ||
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

  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
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
              padding: '2px 6px',
            }}
          >
            <RotateCcw size={11} />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* Results pill */}
      <div
        style={{
          fontSize: '0.8125rem',
          color: 'var(--ink-500)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Convocatorias:</span>
        <strong style={{ color: 'var(--ink-900)' }}>{totalFiltered} de {totalCount}</strong>
      </div>

      {/* 1. Nivel de Estudio */}
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
          Nivel de Estudio
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {tipoOptions.map((opt) => {
            const isSelected = filters.tipo === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onFilterChange('tipo', opt.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? 'var(--brand-700)' : 'var(--ink-700)',
                  backgroundColor: isSelected ? 'var(--brand-50)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {coberturaOptions.map((opt) => {
            const isSelected = filters.cobertura === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onFilterChange('cobertura', opt.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? 'var(--brand-700)' : 'var(--ink-700)',
                  backgroundColor: isSelected ? 'var(--brand-50)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={14} style={{ color: 'var(--brand-600)' }} />}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Región */}
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
          Región
        </label>
        <select
          value={filters.departamento}
          onChange={(e) => onFilterChange('departamento', e.target.value)}
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
          <option value="">Toda Colombia</option>
          {departamentos.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
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
          Enfoque
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
