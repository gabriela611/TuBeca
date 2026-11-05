'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  MapPin,
  GraduationCap,
  Clock,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import type { BecaItem } from './ScholarshipList';
import { diasRestantes } from '@/lib/countdown';
import { parseCoveragePercentage } from '@/lib/coverage';

interface ColombiaMapProps {
  selectedDepartamento: string;
  onSelectDepartamento: (dept: string) => void;
  becas: BecaItem[];
  onSelectBeca: (beca: BecaItem) => void;
}

interface RegionHub {
  id: string;
  name: string;
  shortName: string;
  dept: string;
  searchKey: string;
  x: number;
  y: number;
  r: number;
  keyUnis: string;
}

// Key Colombian educational hubs positioned accurately in a 520 x 600 coordinate viewBox
const REGIONS: RegionHub[] = [
  {
    id: 'bogota',
    name: 'Bogotá D.C. / Cundinamarca',
    shortName: 'Bogotá',
    dept: 'Cundinamarca',
    searchKey: 'bogotá',
    x: 260,
    y: 275,
    r: 22,
    keyUnis: 'Uniandes, Nacional, Javeriana, Rosario, Sabana',
  },
  {
    id: 'antioquia',
    name: 'Medellín / Antioquia',
    shortName: 'Medellín',
    dept: 'Antioquia',
    searchKey: 'antioquia',
    x: 205,
    y: 205,
    r: 20,
    keyUnis: 'EAFIT, UdeA, UPB, EIA, Nacional Medellín',
  },
  {
    id: 'valle',
    name: 'Cali / Valle del Cauca',
    shortName: 'Cali',
    dept: 'Valle del Cauca',
    searchKey: 'valle',
    x: 175,
    y: 320,
    r: 19,
    keyUnis: 'Univalle, Icesi, Javeriana Cali',
  },
  {
    id: 'atlantico',
    name: 'Barranquilla / Atlántico',
    shortName: 'Barranquilla',
    dept: 'Atlántico',
    searchKey: 'atlántico',
    x: 225,
    y: 92,
    r: 18,
    keyUnis: 'Uninorte, U. del Atlántico',
  },
  {
    id: 'santander',
    name: 'Bucaramanga / Santander',
    shortName: 'Bucaramanga',
    dept: 'Santander',
    searchKey: 'santander',
    x: 280,
    y: 190,
    r: 17,
    keyUnis: 'UIS, UNAB, UPB Bucaramanga',
  },
  {
    id: 'bolivar',
    name: 'Cartagena / Bolívar',
    shortName: 'Cartagena',
    dept: 'Bolívar',
    searchKey: 'bolívar',
    x: 205,
    y: 115,
    r: 17,
    keyUnis: 'U. de Cartagena, UTB',
  },
  {
    id: 'eje-cafetero',
    name: 'Eje Cafetero (Caldas / Risaralda / Quindío)',
    shortName: 'Eje Cafetero',
    dept: 'Caldas',
    searchKey: 'caldas',
    x: 200,
    y: 255,
    r: 17,
    keyUnis: 'U. de Caldas, UTP, U. del Quindío',
  },
  {
    id: 'boyaca',
    name: 'Tunja / Boyacá',
    shortName: 'Tunja',
    dept: 'Boyacá',
    searchKey: 'boyacá',
    x: 290,
    y: 250,
    r: 15,
    keyUnis: 'UPTC, Santo Tomás Tunja',
  },
  {
    id: 'narino',
    name: 'Pasto / Nariño',
    shortName: 'Pasto',
    dept: 'Nariño',
    searchKey: 'nariño',
    x: 140,
    y: 410,
    r: 15,
    keyUnis: 'Udenar, Mariana',
  },
  {
    id: 'tolima',
    name: 'Ibagué / Tolima',
    shortName: 'Ibagué',
    dept: 'Tolima',
    searchKey: 'tolima',
    x: 215,
    y: 290,
    r: 15,
    keyUnis: 'U. del Tolima, U. de Ibagué',
  },
  {
    id: 'norte-santander',
    name: 'Cúcuta / Norte de Santander',
    shortName: 'Cúcuta',
    dept: 'Norte de Santander',
    searchKey: 'norte de santander',
    x: 310,
    y: 150,
    r: 15,
    keyUnis: 'UFPS, Libre Cúcuta',
  },
  {
    id: 'cordoba',
    name: 'Montería / Córdoba',
    shortName: 'Montería',
    dept: 'Córdoba',
    searchKey: 'córdoba',
    x: 190,
    y: 140,
    r: 14,
    keyUnis: 'U. de Córdoba, Sinú',
  },
  {
    id: 'magdalena',
    name: 'Santa Marta / Magdalena',
    shortName: 'Santa Marta',
    dept: 'Magdalena',
    searchKey: 'magdalena',
    x: 245,
    y: 80,
    r: 14,
    keyUnis: 'U. del Magdalena',
  },
  {
    id: 'cauca',
    name: 'Popayán / Cauca',
    shortName: 'Popayán',
    dept: 'Cauca',
    searchKey: 'cauca',
    x: 165,
    y: 355,
    r: 14,
    keyUnis: 'U. del Cauca',
  },
  {
    id: 'huila',
    name: 'Neiva / Huila',
    shortName: 'Neiva',
    dept: 'Huila',
    searchKey: 'huila',
    x: 220,
    y: 345,
    r: 14,
    keyUnis: 'USCO',
  },
  {
    id: 'san-andres',
    name: 'San Andrés y Providencia',
    shortName: 'San Andrés',
    dept: 'San Andrés',
    searchKey: 'san andrés',
    x: 75,
    y: 70,
    r: 14,
    keyUnis: 'Sede Caribe UNAL',
  },
];

export function ColombiaMap({
  selectedDepartamento,
  onSelectDepartamento,
  becas,
  onSelectBeca,
}: ColombiaMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<RegionHub | null>(null);

  // Group scholarships by region / city key
  const getBecasForRegion = (searchKey: string) => {
    const target = searchKey.toLowerCase();
    return becas.filter((b) => {
      const dept = (b.departamento || b.universidadRel?.departamento || '').toLowerCase();
      const city = (b.ciudad || b.universidadRel?.ciudad || b.municipioAplicacion || '').toLowerCase();

      return (
        dept.includes(target) ||
        city.includes(target) ||
        (target === 'bogotá' && (city.includes('bogot') || dept.includes('cundinamarca'))) ||
        (target === 'antioquia' && (city.includes('medell') || dept.includes('antioquia'))) ||
        (target === 'valle' && (city.includes('cali') || dept.includes('valle'))) ||
        (target === 'atlántico' && (city.includes('barranquilla') || dept.includes('atlant'))) ||
        (target === 'santander' && (city.includes('bucaramanga') || dept.includes('santander'))) ||
        (target === 'bolívar' && (city.includes('cartagena') || dept.includes('boliv'))) ||
        (target === 'caldas' &&
          (city.includes('manizales') ||
            city.includes('pereira') ||
            city.includes('armenia') ||
            dept.includes('caldas') ||
            dept.includes('risaralda') ||
            dept.includes('quind'))) ||
        (target === 'san andrés' && (city.includes('san andr') || dept.includes('san andr'))) ||
        dept === 'todos' ||
        city === 'nacional'
      );
    });
  };

  // Find active region hub matching selectedDepartamento
  const activeHub = useMemo(() => {
    if (!selectedDepartamento) return null;
    const lower = selectedDepartamento.toLowerCase();
    return (
      REGIONS.find(
        (r) =>
          r.dept.toLowerCase().includes(lower) ||
          r.name.toLowerCase().includes(lower) ||
          lower.includes(r.dept.toLowerCase()) ||
          lower.includes(r.searchKey)
      ) || null
    );
  }, [selectedDepartamento]);

  // Scholarships in the active selection
  const activeRegionBecas = useMemo(() => {
    if (!selectedDepartamento) return becas;
    const target = (activeHub?.searchKey || selectedDepartamento).toLowerCase();
    return getBecasForRegion(target);
  }, [selectedDepartamento, activeHub, becas]);

  return (
    <div className="tubeca-map-wrapper">
      {/* Canvas column with SVG Map & Quick Filter Chips */}
      <div className="tubeca-map-canvas-container">
        {/* Header information */}
        <div style={{ marginBottom: '14px', width: '100%', maxWidth: '520px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--brand-50)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-700)',
                }}
              >
                <MapPin size={18} />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: '1.1875rem',
                    fontWeight: 800,
                    color: 'var(--ink-900)',
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                    margin: 0,
                  }}
                >
                  Mapa Universitario de Colombia
                </h1>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ink-500)', margin: '2px 0 0' }}>
                  {selectedDepartamento
                    ? `Filtrando por ${activeHub?.name || selectedDepartamento} (${activeRegionBecas.length} convocatorias)`
                    : 'Toca un departamento o ciudad para explorar becas locales.'}
                </p>
              </div>
            </div>

            {selectedDepartamento && (
              <button
                type="button"
                onClick={() => onSelectDepartamento('')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--brand-50)',
                  color: 'var(--brand-700)',
                  border: '1px solid var(--brand-200)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <RotateCcw size={12} />
                <span>Ver todo el país</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Horizontal Scrollable Filter Chips for Mobile & Desktop Accessibility */}
        <div
          className="tubeca-map-chips-bar"
          style={{
            width: '100%',
            maxWidth: '520px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '10px',
            marginBottom: '10px',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <button
            type="button"
            onClick={() => onSelectDepartamento('')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              minHeight: '36px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              backgroundColor: !selectedDepartamento ? 'var(--brand-700)' : '#ffffff',
              color: !selectedDepartamento ? '#ffffff' : 'var(--ink-700)',
              border: `1px solid ${!selectedDepartamento ? 'var(--brand-700)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: !selectedDepartamento ? '0 2px 6px rgba(29, 78, 216, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Toda Colombia</span>
            <span
              style={{
                fontSize: '0.6875rem',
                padding: '1px 6px',
                borderRadius: '9999px',
                backgroundColor: !selectedDepartamento ? 'rgba(255, 255, 255, 0.2)' : 'var(--surface-subtle)',
                color: !selectedDepartamento ? '#ffffff' : 'var(--ink-600)',
              }}
            >
              {becas.length}
            </span>
          </button>

          {REGIONS.map((r) => {
            const count = getBecasForRegion(r.searchKey).length;
            const isSelected = activeHub?.id === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectDepartamento(isSelected ? '' : r.dept)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  minHeight: '36px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: isSelected ? 'var(--brand-700)' : '#ffffff',
                  color: isSelected ? '#ffffff' : 'var(--ink-700)',
                  border: `1px solid ${isSelected ? 'var(--brand-700)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: isSelected ? '0 2px 6px rgba(29, 78, 216, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{r.shortName}</span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--surface-subtle)',
                    color: isSelected ? '#ffffff' : 'var(--ink-600)',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Minimalist SVG Map Canvas Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '520px',
            aspectRatio: '520 / 600',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
          }}
        >
          <svg
            viewBox="0 0 520 600"
            style={{ width: '100%', height: '100%', display: 'block' }}
            aria-label="Mapa interactivo de Colombia con universidades y becas"
          >
            <defs>
              {/* Soft Oceanic Gradient */}
              <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8faff" />
                <stop offset="100%" stopColor="#eef4fc" />
              </linearGradient>

              {/* Land Subtle Gradient */}
              <linearGradient id="landGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f3f6fb" />
                <stop offset="100%" stopColor="#e7edf7" />
              </linearGradient>

              {/* Active Hub Radial Glow */}
              <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(37, 99, 235, 0.35)" />
                <stop offset="100%" stopColor="rgba(37, 99, 235, 0)" />
              </radialGradient>
            </defs>

            {/* Background Canvas Tint */}
            <rect width="520" height="600" fill="url(#oceanGrad)" />

            {/* Subtle Geographical Latitude & Longitude Grid Lines */}
            <g stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="3 4">
              <line x1="40" y1="150" x2="480" y2="150" />
              <line x1="40" y1="300" x2="480" y2="300" />
              <line x1="40" y1="450" x2="480" y2="450" />
              <line x1="150" y1="30" x2="150" y2="570" />
              <line x1="300" y1="30" x2="300" y2="570" />
              <line x1="450" y1="30" x2="450" y2="570" />
            </g>

            {/* Ocean Watermark Labels */}
            <text x="75" y="240" fill="#cbd5e1" fontSize="11" fontWeight="700" letterSpacing="0.1em">
              OCÉANO PACÍFICO
            </text>
            <text x="145" y="45" fill="#cbd5e1" fontSize="11" fontWeight="700" letterSpacing="0.1em">
              MAR CARIBE
            </text>

            {/* Inset Box for San Andrés, Providencia y Santa Catalina */}
            <g>
              <rect
                x="20"
                y="20"
                width="110"
                height="80"
                rx="8"
                fill="#ffffff"
                stroke="var(--border-subtle)"
                strokeWidth="1.2"
              />
              <text x="28" y="34" fill="var(--ink-500)" fontSize="8" fontWeight="700" letterSpacing="0.04em">
                ARCHIPIÉLAGO
              </text>
              <text x="28" y="45" fill="var(--ink-900)" fontSize="9" fontWeight="700">
                San Andrés y Prov.
              </text>

              {/* San Andrés Island Contour */}
              <ellipse cx="60" cy="70" rx="6" ry="12" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1" />
              {/* Providencia Island Contour */}
              <circle cx="95" cy="58" r="5" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1" />
            </g>

            {/* MAINLAND COLOMBIA: Elegant Minimalist Vector Silhouette */}
            <path
              d="
                M 270,30
                C 275,32 280,45 272,60
                C 268,68 258,74 252,80
                C 245,84 235,84 228,88
                C 220,93 212,105 204,115
                C 196,125 186,134 180,144
                C 174,152 165,158 158,162
                C 148,166 140,165 135,175
                C 128,188 126,205 124,225
                C 122,245 125,265 130,285
                C 134,302 138,320 128,345
                C 120,365 110,385 102,400
                C 95,412 100,422 112,426
                C 124,430 135,435 145,442
                C 160,450 178,458 198,460
                C 220,462 245,470 265,485
                C 285,500 295,520 305,548
                C 310,562 312,575 318,575
                C 324,575 330,555 336,535
                C 342,515 352,485 365,465
                C 378,445 392,425 408,395
                C 422,370 435,345 445,315
                C 455,285 466,255 464,240
                C 460,225 440,220 418,212
                C 395,204 375,195 355,182
                C 340,172 328,158 320,145
                C 310,130 300,112 292,95
                C 285,82 278,65 275,45
                Z
              "
              fill="url(#landGrad)"
              stroke="#94a3b8"
              strokeWidth="1.8"
              strokeLinejoin="round"
              filter="drop-shadow(0px 3px 6px rgba(15, 23, 42, 0.06))"
            />

            {/* Subtle Andean Mountain Ridges (Stylized Topographic Ridges) */}
            <path
              d="
                M 145,435 Q 170,360 190,290 T 205,210
                M 175,440 Q 200,350 220,270 T 240,170
                M 210,430 Q 240,330 265,260 T 290,170
              "
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />

            {/* Educational Hub Nodes */}
            {REGIONS.map((region) => {
              const isSelected = activeHub?.id === region.id;
              const isHovered = hoveredRegion?.id === region.id;
              const count = getBecasForRegion(region.searchKey).length;

              return (
                <g
                  key={region.id}
                  onClick={() => {
                    if (isSelected) {
                      onSelectDepartamento('');
                    } else {
                      onSelectDepartamento(region.dept);
                    }
                  }}
                  onMouseEnter={() => setHoveredRegion(region)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${region.name}: ${count} becas disponibles`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectDepartamento(isSelected ? '' : region.dept);
                    }
                  }}
                >
                  {/* Generous Invisible Touch Target (Radius 28px = 56px touch zone for mobile accessibility) */}
                  <circle cx={region.x} cy={region.y} r={28} fill="transparent" pointerEvents="all" />

                  {/* Pulsing Selection Wave when active */}
                  {isSelected && (
                    <>
                      <circle cx={region.x} cy={region.y} r={region.r + 14} fill="url(#hubGlow)" />
                      <circle
                        cx={region.x}
                        cy={region.y}
                        r={region.r + 6}
                        fill="none"
                        stroke="var(--brand-600)"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        style={{
                          transformOrigin: `${region.x}px ${region.y}px`,
                        }}
                      />
                    </>
                  )}

                  {/* Main Circular Node Badge */}
                  <circle
                    cx={region.x}
                    cy={region.y}
                    r={region.r}
                    fill={isSelected ? 'var(--brand-700)' : isHovered ? 'var(--brand-600)' : '#ffffff'}
                    stroke={isSelected ? '#ffffff' : 'var(--brand-600)'}
                    strokeWidth={isSelected ? '2.5' : '2'}
                    filter="drop-shadow(0 2px 4px rgba(15, 23, 42, 0.12))"
                    style={{ transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />

                  {/* Scholarship Count Number */}
                  <text
                    x={region.x}
                    y={region.y + 4}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : 'var(--brand-700)'}
                    fontSize={region.r >= 18 ? '11.5' : '10'}
                    fontWeight="800"
                    fontFamily="inherit"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {count}
                  </text>

                  {/* City Label Below Node */}
                  <g transform={`translate(${region.x}, ${region.y + region.r + 10})`}>
                    <rect
                      x={-((region.shortName.length * 6.5) / 2) - 4}
                      y="-8"
                      width={region.shortName.length * 6.5 + 8}
                      height="14"
                      rx="3"
                      fill="rgba(255, 255, 255, 0.92)"
                      stroke={isSelected ? 'var(--brand-600)' : '#cbd5e1'}
                      strokeWidth={isSelected ? '1.2' : '0.6'}
                    />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fill={isSelected ? 'var(--brand-800)' : 'var(--ink-700)'}
                      fontSize="9"
                      fontWeight={isSelected ? '800' : '700'}
                      fontFamily="inherit"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {region.shortName}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Floating Hover Card (Desktop Only) */}
          {hoveredRegion && (
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                boxShadow: 'var(--shadow-card-hover)',
                pointerEvents: 'none',
                maxWidth: '220px',
                zIndex: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <MapPin size={13} style={{ color: 'var(--brand-600)' }} />
                <strong style={{ fontSize: '0.8125rem', color: 'var(--ink-900)' }}>
                  {hoveredRegion.shortName}
                </strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)', lineHeight: 1.3 }}>
                {hoveredRegion.keyUnis}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--brand-700)',
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{getBecasForRegion(hoveredRegion.searchKey).length} becas abiertas</span>
                <ChevronRight size={12} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Regional Scholarships Detail List Panel (Side on Desktop, Below on Mobile) */}
      <div className="tubeca-map-sidebar">
        {/* Panel Header */}
        <div
          style={{
            padding: '18px 20px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: selectedDepartamento ? 'var(--brand-600)' : 'var(--accent-500)',
                }}
              />
              <h2
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 800,
                  color: 'var(--ink-900)',
                  margin: 0,
                }}
              >
                {selectedDepartamento ? activeHub?.name || selectedDepartamento : 'Todas las Becas de Colombia'}
              </h2>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-500)', margin: '2px 0 0' }}>
              {activeRegionBecas.length}{' '}
              {activeRegionBecas.length === 1 ? 'convocatoria disponible' : 'convocatorias disponibles'}
            </p>
          </div>

          {selectedDepartamento && (
            <button
              type="button"
              onClick={() => onSelectDepartamento('')}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--brand-700)',
                backgroundColor: 'var(--brand-50)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--brand-100)',
                cursor: 'pointer',
              }}
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Scholarships List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {activeRegionBecas.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--ink-500)',
                fontSize: '0.875rem',
              }}
            >
              <p>No se encontraron convocatorias específicas para esta región en este momento.</p>
              <button
                type="button"
                onClick={() => onSelectDepartamento('')}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  backgroundColor: 'var(--brand-700)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Ver todas las becas de Colombia
              </button>
            </div>
          ) : (
            activeRegionBecas.map((beca) => {
              const uniName = beca.universidad || beca.universidadRel?.nombre || 'Universidad';
              const title = beca.nombreBeca || beca.titulo || 'Beca Universitaria';
              const percentage = parseCoveragePercentage(
                beca.porcentaje,
                beca.tipoFinanciacion,
                beca.cobertura,
                beca.porcentajeCobertura
              );
              const countdown = diasRestantes(beca.fechaCierre);

              return (
                <div
                  key={beca.id}
                  onClick={() => onSelectBeca(beca)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    boxShadow: 'var(--shadow-card)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--brand-600)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: 'var(--ink-500)',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <Building2 size={13} style={{ color: 'var(--brand-600)' }} />
                      <span>{uniName}</span>
                    </span>
                    <span>{beca.ciudad || beca.universidadRel?.ciudad || 'Nacional'}</span>
                  </div>

                  <h3
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: 'var(--ink-900)',
                      margin: 0,
                      lineHeight: 1.35,
                    }}
                  >
                    {title}
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '6px',
                      borderTop: '1px solid var(--surface-subtle)',
                      fontSize: '0.75rem',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: 'var(--brand-700)',
                        backgroundColor: 'var(--coverage-partial-bg)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      Cobertura {percentage}%
                    </span>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: countdown.esUrgente ? 'var(--status-urgent-text)' : 'var(--ink-500)',
                        fontWeight: countdown.esUrgente ? 700 : 500,
                      }}
                    >
                      <Clock size={12} />
                      <span>{countdown.texto}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
