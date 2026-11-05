'use client';

import React from 'react';
import { Filter, RotateCcw, Check, X, GraduationCap } from 'lucide-react';
import { type PerfilUsuario } from '@/lib/eligibility';

export interface FilterState {
  tipo: string;
  cobertura: string;
  estado: string;
  ciudad: string;
  departamento: string;
  universidadTipo: string;
  categoria: string;
  modalidad?: string;
  universidad?: string;
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
  universidades?: Array<{ id: string; nombre: string }>;
  onCloseMobile?: () => void;
  orden?: string;
  onOrdenChange?: (orden: string) => void;
  perfil?: PerfilUsuario;
  onPerfilChange?: (perfil: PerfilUsuario) => void;
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
  universidades = [],
  onCloseMobile,
  orden = 'cierra_pronto',
  onOrdenChange,
  perfil = {},
  onPerfilChange,
}: FiltersSidebarProps) {
  const activeCity = filters.ciudad || filters.departamento || '';
  const hasActiveFilters =
    filters.tipo !== '' ||
    filters.cobertura !== '' ||
    activeCity !== '' ||
    filters.categoria !== '' ||
    Boolean(filters.modalidad) ||
    Boolean(filters.universidad);

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

  const modalidadOptions = [
    { id: '', label: 'Todas las modalidades' },
    { id: 'presencial', label: 'Presencial' },
    { id: 'virtual', label: 'Virtual' },
    { id: 'mixta', label: 'Mixta' },
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

      {/* Selector de Orden */}
      <section>
        <label
          htmlFor="tubeca-sort-select"
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
          Ordenar por
        </label>
        <select
          id="tubeca-sort-select"
          value={orden}
          onChange={(e) => onOrdenChange?.(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-base)',
            color: 'var(--ink-900)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="cierra_pronto">Cierra pronto</option>
          <option value="mayor_cobertura">Mayor cobertura</option>
          <option value="recientes">Recientes</option>
        </select>
      </section>

      {/* ¿A cuáles aplico? (Verificador de elegibilidad) */}
      <section
        style={{
          padding: '12px 14px',
          backgroundColor: 'var(--brand-50, #eff6ff)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--brand-200, #bfdbfe)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GraduationCap size={16} style={{ color: 'var(--brand-700)' }} />
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--brand-900)' }}>
              ¿A cuáles aplico?
            </h3>
          </div>
          {(perfil.saber11 !== undefined || perfil.promedio !== undefined || perfil.estrato !== undefined || perfil.edad !== undefined) && (
            <button
              onClick={() => onPerfilChange?.({})}
              title="Borrar datos de perfil"
              style={{
                fontSize: '0.6875rem',
                color: 'var(--ink-500)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Borrar
            </button>
          )}
        </div>

        <p style={{ fontSize: '0.6875rem', color: 'var(--ink-600)', lineHeight: 1.35 }}>
          Ingresa tus datos para ver automáticamente si cumples los requisitos de cada beca.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '2px' }}>
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-700)', display: 'block', marginBottom: '2px' }}>
              Saber 11
            </label>
            <input
              type="number"
              min={0}
              max={500}
              placeholder="0-500"
              value={perfil.saber11 ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? null : Math.min(500, Math.max(0, parseInt(e.target.value, 10)));
                onPerfilChange?.({ ...perfil, saber11: val });
              }}
              style={{
                width: '100%',
                padding: '5px 8px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
                color: 'var(--ink-900)',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-700)', display: 'block', marginBottom: '2px' }}>
              Promedio
            </label>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              placeholder="0.0-5.0"
              value={perfil.promedio ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? null : Math.min(5, Math.max(0, parseFloat(e.target.value)));
                onPerfilChange?.({ ...perfil, promedio: val });
              }}
              style={{
                width: '100%',
                padding: '5px 8px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
                color: 'var(--ink-900)',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-700)', display: 'block', marginBottom: '2px' }}>
              Estrato
            </label>
            <select
              value={perfil.estrato ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                onPerfilChange?.({ ...perfil, estrato: val });
              }}
              style={{
                width: '100%',
                padding: '5px 6px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
                color: 'var(--ink-900)',
              }}
            >
              <option value="">Todos</option>
              <option value="1">Estrato 1</option>
              <option value="2">Estrato 2</option>
              <option value="3">Estrato 3</option>
              <option value="4">Estrato 4</option>
              <option value="5">Estrato 5</option>
              <option value="6">Estrato 6</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ink-700)', display: 'block', marginBottom: '2px' }}>
              Edad
            </label>
            <input
              type="number"
              min={10}
              max={99}
              placeholder="Años"
              value={perfil.edad ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? null : Math.max(0, parseInt(e.target.value, 10));
                onPerfilChange?.({ ...perfil, edad: val });
              }}
              style={{
                width: '100%',
                padding: '5px 8px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
                color: 'var(--ink-900)',
              }}
            />
          </div>
        </div>
      </section>

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

      {/* 5. Modalidad */}
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
          Modalidad
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {modalidadOptions.map((opt) => {
            const isSelected = (filters.modalidad || '') === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onFilterChange('modalidad', opt.id)}
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

      {/* 6. Universidad */}
      {universidades && universidades.length > 0 && (
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
            Universidad
          </label>
          <select
            value={filters.universidad || ''}
            onChange={(e) => onFilterChange('universidad', e.target.value)}
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
            <option value="">Todas las universidades</option>
            {universidades.map((u) => (
              <option key={u.id} value={u.nombre}>
                {u.nombre}
              </option>
            ))}
          </select>
        </section>
      )}
    </aside>
  );
}
