'use client';

import React, { useState } from 'react';
import type { BecaItem } from './ScholarshipList';
import { MapPin, Building2, Sparkles, X, ChevronRight } from 'lucide-react';
import { parseCoveragePercentage } from '@/lib/coverage';

interface ColombiaMapProps {
  selectedDepartamento: string;
  onSelectDepartamento: (dept: string) => void;
  becas: BecaItem[];
  onSelectBeca: (beca: BecaItem) => void;
}

interface RegionData {
  id: string;
  name: string;
  capital: string;
  x: number; // 0..474
  y: number; // 0..474
  r: number;
}

// Educational and administrative hubs calibrated to the 474x474 Colombia map image
const REGIONS: RegionData[] = [
  { id: 'Cundinamarca', name: 'Bogotá D.C. / Cundinamarca', capital: 'Bogotá', x: 228, y: 262, r: 24 },
  { id: 'Antioquia', name: 'Antioquia', capital: 'Medellín', x: 188, y: 206, r: 22 },
  { id: 'Valle del Cauca', name: 'Valle del Cauca', capital: 'Cali', x: 162, y: 300, r: 20 },
  { id: 'Atlántico', name: 'Atlántico', capital: 'Barranquilla', x: 204, y: 84, r: 18 },
  { id: 'Bolívar', name: 'Bolívar', capital: 'Cartagena', x: 188, y: 114, r: 17 },
  { id: 'Magdalena', name: 'Magdalena', capital: 'Santa Marta', x: 228, y: 82, r: 16 },
  { id: 'Santander', name: 'Santander', capital: 'Bucaramanga', x: 238, y: 194, r: 17 },
  { id: 'Norte de Santander', name: 'Norte de Santander', capital: 'Cúcuta', x: 264, y: 164, r: 16 },
  { id: 'Caldas', name: 'Eje Cafetero (Caldas / Risaralda / Quindío)', capital: 'Manizales', x: 184, y: 252, r: 17 },
  { id: 'Tolima', name: 'Tolima', capital: 'Ibagué', x: 198, y: 278, r: 16 },
  { id: 'Boyacá', name: 'Boyacá', capital: 'Tunja', x: 248, y: 236, r: 16 },
  { id: 'Córdoba', name: 'Córdoba', capital: 'Montería', x: 172, y: 148, r: 15 },
  { id: 'Nariño', name: 'Nariño', capital: 'Pasto', x: 138, y: 374, r: 16 },
  { id: 'Cauca', name: 'Cauca', capital: 'Popayán', x: 154, y: 338, r: 15 },
  { id: 'Huila', name: 'Huila', capital: 'Neiva', x: 194, y: 326, r: 15 },
  { id: 'Meta', name: 'Meta', capital: 'Villavicencio', x: 258, y: 288, r: 16 },
  { id: 'Cesar', name: 'Cesar', capital: 'Valledupar', x: 242, y: 116, r: 15 },
  { id: 'La Guajira', name: 'La Guajira', capital: 'Riohacha', x: 262, y: 52, r: 15 },
];

export function ColombiaMap({
  selectedDepartamento,
  onSelectDepartamento,
  becas,
  onSelectBeca,
}: ColombiaMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);

  // Group scholarships by region / city
  const getBecasForRegion = (deptName: string) => {
    return becas.filter((b) => {
      const dept = (b.departamento || b.universidadRel?.departamento || '').toLowerCase();
      const city = (b.ciudad || b.universidadRel?.ciudad || b.municipioAplicacion || '').toLowerCase();
      const target = deptName.toLowerCase();

      return (
        dept.includes(target) ||
        city.includes(target) ||
        (target === 'cundinamarca' && city.includes('bogot')) ||
        (target === 'antioquia' && city.includes('medell')) ||
        (target === 'valle del cauca' && city.includes('cali')) ||
        (target === 'atlántico' && city.includes('barranquilla')) ||
        (target === 'santander' && city.includes('bucaramanga')) ||
        (target === 'bolívar' && city.includes('cartagena')) ||
        (target === 'caldas' && (city.includes('manizales') || city.includes('pereira') || city.includes('armenia'))) ||
        dept === 'todos' ||
        city === 'nacional'
      );
    });
  };

  const activeRegionBecas = selectedDepartamento
    ? becas.filter((b) => {
        const dept = (b.departamento || b.universidadRel?.departamento || '').toLowerCase();
        const city = (b.ciudad || b.universidadRel?.ciudad || b.municipioAplicacion || '').toLowerCase();
        const target = selectedDepartamento.toLowerCase();

        return (
          dept.includes(target) ||
          city.includes(target) ||
          (target.includes('cundinamarca') && city.includes('bogot')) ||
          (target.includes('bogot') && (dept.includes('cundinamarca') || city.includes('bogot'))) ||
          (target.includes('antioquia') && city.includes('medell')) ||
          (target.includes('medell') && (dept.includes('antioquia') || city.includes('medell'))) ||
          (target.includes('valle') && city.includes('cali')) ||
          dept === 'todos'
        );
      })
    : becas;

  return (
    <div
      className="tubeca-map-wrapper"
      style={{
        flex: 1,
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'var(--surface-base)',
      }}
    >
      {/* Map Interactive Canvas */}
      <div
        className="tubeca-map-canvas-container"
        style={{
          flex: 1.15,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--border-subtle)',
          position: 'relative',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>
            Mapa Universitario de Colombia
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--ink-500)', marginTop: '4px' }}>
            Haz clic en cualquier departamento para filtrar sus convocatorias académicas.
          </p>
        </div>

        {/* Map Container with User-provided Colombian Political Map */}
        <div
          style={{
            position: 'relative',
            width: 'min(460px, 92vw)',
            height: 'min(460px, 92vw)',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg viewBox="0 0 474 474" style={{ width: '100%', height: '100%' }}>
            {/* Render the user-supplied minimalist Colombia map image */}
            <image
              href="/images/mapa-colombia.png"
              x="0"
              y="0"
              width="474"
              height="474"
              preserveAspectRatio="xMidYMid meet"
              style={{ opacity: 0.94 }}
            />

            {/* Department Hub Nodes with interactive badges */}
            {REGIONS.map((region) => {
              const isSelected = selectedDepartamento.toLowerCase() === region.id.toLowerCase();
              const isHovered = hoveredRegion?.id === region.id;
              const count = getBecasForRegion(region.id).length;

              return (
                <g
                  key={region.id}
                  onClick={() => {
                    if (isSelected) {
                      onSelectDepartamento('');
                    } else {
                      onSelectDepartamento(region.id);
                    }
                  }}
                  onMouseEnter={() => setHoveredRegion(region)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                >
                  {/* Outer selection ring / radar pulse */}
                  {isSelected && (
                    <circle
                      cx={region.x}
                      cy={region.y}
                      r={region.r + 9}
                      fill="rgba(37, 99, 235, 0.18)"
                      stroke="var(--brand-600)"
                      strokeWidth="2"
                    />
                  )}

                  {/* Main Department Pin Badge */}
                  <circle
                    cx={region.x}
                    cy={region.y}
                    r={region.r}
                    fill={isSelected ? 'var(--brand-600)' : isHovered ? 'var(--brand-50)' : '#ffffff'}
                    stroke={isSelected ? 'var(--brand-700)' : isHovered ? 'var(--brand-600)' : 'var(--brand-600)'}
                    strokeWidth={isSelected ? '3' : '2'}
                    style={{
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      filter: 'drop-shadow(0 2px 4px rgba(15, 23, 42, 0.18))',
                    }}
                  />

                  {/* Count Inside Badge */}
                  <text
                    x={region.x}
                    y={region.y + 4}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : 'var(--brand-700)'}
                    fontSize={region.r > 18 ? '11.5' : '10'}
                    fontWeight="800"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {count}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Hover Card */}
          {hoveredRegion && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                boxShadow: 'var(--shadow-card-hover)',
                pointerEvents: 'none',
                animation: 'fadeIn 0.15s ease-out',
                zIndex: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} style={{ color: 'var(--brand-600)' }} />
                <strong style={{ fontSize: '0.8125rem', color: 'var(--ink-900)' }}>
                  {hoveredRegion.name}
                </strong>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)', display: 'block', marginTop: '2px' }}>
                {getBecasForRegion(hoveredRegion.id).length} convocatorias disponibles
              </span>
            </div>
          )}
        </div>

        {/* Active Filter Clear Pill */}
        {selectedDepartamento && (
          <button
            onClick={() => onSelectDepartamento('')}
            style={{
              marginTop: '14px',
              padding: '6px 14px',
              backgroundColor: 'var(--brand-50)',
              color: 'var(--brand-700)',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              border: '1px solid var(--brand-200)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-100)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-50)')}
          >
            <span>Filtro: {selectedDepartamento}</span>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Regional Scholarship List */}
      <div
        className="tubeca-map-sidebar"
        style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--ink-900)' }}>
            {selectedDepartamento ? `Becas en ${selectedDepartamento}` : 'Todas las Becas en Colombia'}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--ink-500)', marginTop: '2px' }}>
            Mostrando {activeRegionBecas.length} convocatorias
          </p>
        </div>

        {activeRegionBecas.map((beca) => {
          const percentage = parseCoveragePercentage(
            beca.porcentaje,
            beca.tipoFinanciacion,
            beca.cobertura,
            beca.porcentajeCobertura
          );

          return (
            <div
              key={beca.id}
              onClick={() => onSelectBeca(beca)}
              style={{
                padding: '16px',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-subtle)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-600)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8125rem',
                    color: 'var(--brand-700)',
                    fontWeight: 700,
                  }}
                >
                  <Building2 size={14} />
                  <span>{typeof beca.universidad === 'string' ? beca.universidad : 'Universidad'}</span>
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: percentage >= 100 ? 'var(--brand-50)' : 'var(--surface-subtle)',
                    color: percentage >= 100 ? 'var(--brand-700)' : 'var(--ink-700)',
                  }}
                >
                  {percentage}% Cobertura
                </span>
              </div>

              <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--ink-900)', lineHeight: 1.3 }}>
                {beca.nombreBeca || beca.titulo}
              </h4>

              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--ink-600)',
                  lineHeight: 1.45,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {beca.descripcion || 'Sin descripción detallada disponible.'}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-600)' }}>
                <span>Ver requisitos</span>
                <ChevronRight size={13} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
