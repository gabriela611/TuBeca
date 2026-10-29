'use client';

import React, { useState } from 'react';
import { MapPin, Building, Award, Check } from 'lucide-react';
import type { BecaItem } from './ScholarshipList';

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
  x: number;
  y: number;
  r: number;
}

// Key Colombian educational hubs with coordinate representations on an SVG canvas
const REGIONS: RegionData[] = [
  { id: 'Cundinamarca', name: 'Bogotá D.C. / Cundinamarca', capital: 'Bogotá', x: 260, y: 260, r: 28 },
  { id: 'Antioquia', name: 'Antioquia', capital: 'Medellín', x: 200, y: 190, r: 24 },
  { id: 'Valle del Cauca', name: 'Valle del Cauca', capital: 'Cali', x: 170, y: 310, r: 22 },
  { id: 'Atlántico', name: 'Atlántico', capital: 'Barranquilla', x: 230, y: 75, r: 20 },
  { id: 'Santander', name: 'Santander', capital: 'Bucaramanga', x: 280, y: 180, r: 18 },
  { id: 'Bolívar', name: 'Bolívar', capital: 'Cartagena', x: 210, y: 105, r: 18 },
  { id: 'Caldas', name: 'Eje Cafetero (Caldas/Risaralda/Quindío)', capital: 'Manizales', x: 195, y: 250, r: 16 },
  { id: 'Nariño', name: 'Nariño', capital: 'Pasto', x: 140, y: 380, r: 16 },
  { id: 'Boyacá', name: 'Boyacá', capital: 'Tunja', x: 285, y: 240, r: 16 },
  { id: 'Tolima', name: 'Tolima', capital: 'Ibagué', x: 215, y: 285, r: 16 },
  { id: 'Norte de Santander', name: 'Norte de Santander', capital: 'Cúcuta', x: 310, y: 140, r: 16 },
  { id: 'Córdoba', name: 'Córdoba', capital: 'Montería', x: 190, y: 130, r: 15 },
  { id: 'Magdalena', name: 'Magdalena', capital: 'Santa Marta', x: 255, y: 70, r: 15 },
];

export function ColombiaMap({
  selectedDepartamento,
  onSelectDepartamento,
  becas,
  onSelectBeca,
}: ColombiaMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);

  // Group scholarships by region
  const getBecasForRegion = (deptName: string) => {
    return becas.filter((b) => {
      const matchDept = b.departamento?.toLowerCase().includes(deptName.toLowerCase()) ||
                        b.ciudad?.toLowerCase().includes(deptName.toLowerCase()) ||
                        b.departamento === 'Todos' ||
                        b.ciudad === 'Nacional';
      return matchDept;
    });
  };

  const activeRegionBecas = selectedDepartamento
    ? becas.filter(
        (b) =>
          b.departamento?.toLowerCase().includes(selectedDepartamento.toLowerCase()) ||
          b.ciudad?.toLowerCase().includes(selectedDepartamento.toLowerCase()) ||
          b.departamento === 'Todos',
      )
    : becas;

  return (
    <div
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
        style={{
          flex: 1,
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--border-subtle)',
          position: 'relative',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>
            Mapa Universitario de Colombia
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--ink-500)', marginTop: '4px' }}>
            Haz clic en cualquier departamento o centro universitario para ver las becas de esa región.
          </p>
        </div>

        {/* Colombia Silhouette and Educational Hubs */}
        <div
          style={{
            position: 'relative',
            width: '440px',
            height: '480px',
            backgroundColor: 'var(--surface-subtle)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg viewBox="0 0 460 500" style={{ width: '100%', height: '100%' }}>
            {/* Background Map Contours of Colombia (Stylized Geometric Projection) */}
            <path
              d="M 180,40 L 250,30 L 280,60 L 260,95 L 320,130 L 300,200 L 360,240 L 340,320 L 300,340 L 290,440 L 250,470 L 210,430 L 170,390 L 130,370 L 150,310 L 180,270 L 160,200 L 175,130 Z"
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Department Hub Nodes */}
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
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer ripple pulse when selected */}
                  {isSelected && (
                    <circle
                      cx={region.x}
                      cy={region.y}
                      r={region.r + 8}
                      fill="rgba(2, 132, 199, 0.18)"
                      stroke="var(--brand-600)"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Main Node */}
                  <circle
                    cx={region.x}
                    cy={region.y}
                    r={region.r}
                    fill={isSelected ? 'var(--brand-600)' : isHovered ? 'var(--brand-700)' : '#ffffff'}
                    stroke={isSelected ? 'var(--brand-700)' : 'var(--brand-600)'}
                    strokeWidth={isSelected ? '3' : '2'}
                    style={{ transition: 'all 0.2s ease' }}
                  />

                  {/* Count Inside Node */}
                  <text
                    x={region.x}
                    y={region.y + 4}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : 'var(--brand-700)'}
                    fontSize={region.r > 20 ? '12' : '10'}
                    fontWeight="700"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {count}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover / Active Floating Label */}
          {hoveredRegion && (
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                boxShadow: 'var(--shadow-md)',
                pointerEvents: 'none',
              }}
            >
              <strong style={{ fontSize: '0.8125rem', color: 'var(--ink-900)', display: 'block' }}>
                {hoveredRegion.name}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>
                {getBecasForRegion(hoveredRegion.id).length} convocatorias disponibles
              </span>
            </div>
          )}
        </div>

        {/* Clear selection pill */}
        {selectedDepartamento && (
          <button
            onClick={() => onSelectDepartamento('')}
            style={{
              marginTop: '16px',
              padding: '6px 14px',
              backgroundColor: 'var(--brand-50)',
              color: 'var(--brand-700)',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              border: '1px solid var(--brand-100)',
            }}
          >
            Filtro activo: {selectedDepartamento} (Hacer clic para ver toda Colombia)
          </button>
        )}
      </div>

      {/* Regional Scholarship List */}
      <div
        style={{
          flex: 1.1,
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink-900)' }}>
            {selectedDepartamento ? `Becas en ${selectedDepartamento} y Nacionales` : 'Todas las Becas en Colombia'}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--ink-500)' }}>
            Mostrando {activeRegionBecas.length} oportunidades
          </p>
        </div>

        {activeRegionBecas.map((beca) => (
          <div
            key={beca.id}
            onClick={() => onSelectBeca(beca)}
            style={{
              padding: '16px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--brand-600)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--ink-500)', fontWeight: 500 }}>
                {beca.universidad?.nombre || 'Nacional'}
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--ink-500)', fontWeight: 600 }}>
                {beca.porcentajeCobertura || (beca.cobertura === 'total' ? 100 : 50)}% Cobertura
              </span>
            </div>

            <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ink-900)' }}>
              {beca.titulo}
            </h4>

            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-700)', lineHeight: 1.4 }}>
              {beca.descripcion.slice(0, 120)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

