'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '@/components/Header';
import { FiltersSidebar, type FilterState } from '@/components/FiltersSidebar';
import { TinderCardDeck } from '@/components/TinderCardDeck';
import { ScholarshipList, type BecaItem, parseCoveragePercentage } from '@/components/ScholarshipList';
import { ScholarshipDetail } from '@/components/ScholarshipDetail';
import { ColombiaMap } from '@/components/ColombiaMap';
import { OnboardingModal } from '@/components/OnboardingModal';
import { triggerSaveConfetti } from '@/lib/confetti';
import { normalizeText } from '@/lib/normalize';
import { sortBecas } from '@/lib/sort';
import { type PerfilUsuario } from '@/lib/eligibility';
import { Heart } from 'lucide-react';

interface DeckAction {
  id: string;
  action: 'saved' | 'discarded';
  index: number;
}

export default function Home() {
  const [allBecas, setAllBecas] = useState<BecaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'split' | 'map'>('split');

  // Deck navigation
  const [cardIndex, setCardIndex] = useState(0);
  const [history, setHistory] = useState<DeckAction[]>([]);

  // Mobile filters drawer
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showingFavorites, setShowingFavorites] = useState(false);
  const [selectedSavedBecaId, setSelectedSavedBecaId] = useState<string | null>(null);

  // Onboarding state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [orden, setOrden] = useState<string>('cierra_pronto');

  // Elegibilidad user profile
  const [perfil, setPerfil] = useState<PerfilUsuario>({});

  const [universidadesList, setUniversidadesList] = useState<Array<{ id: string; nombre: string }>>([]);

  const [filters, setFilters] = useState<FilterState>({
    tipo: '',
    cobertura: '',
    estado: '',
    ciudad: '',
    departamento: '',
    universidadTipo: '',
    categoria: '',
    modalidad: '',
    universidad: '',
  });

  // Load favorites and check onboarding status from localStorage
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedFavs = localStorage.getItem('tubeca_favoritos');
        if (savedFavs) {
          setFavorites(new Set(JSON.parse(savedFavs)));
        }

        const onboardingDone = localStorage.getItem('tubeca_onboarding_done');
        if (!onboardingDone) {
          setIsOnboardingOpen(true);
        }

        const savedPerfil = localStorage.getItem('tubeca_perfil');
        if (savedPerfil) {
          setPerfil(JSON.parse(savedPerfil));
        }
      } catch (e) {
        console.warn('Could not read localStorage:', e);
      }
    });
  }, []);

  const handlePerfilChange = useCallback((nuevoPerfil: PerfilUsuario) => {
    setPerfil(nuevoPerfil);
    try {
      localStorage.setItem('tubeca_perfil', JSON.stringify(nuevoPerfil));
    } catch (e) {
      console.warn('Could not save tubeca_perfil to localStorage:', e);
    }
  }, []);

  // Fetch initial scholarships from API
  useEffect(() => {
    let ignore = false;
    async function fetchInitialBecas() {
      try {
        const res = await fetch('/api/becas?limit=100');
        if (!res.ok) {
          throw new Error(`Error ${res.status}: No se pudieron cargar las becas`);
        }
        const json = await res.json();
        if (!ignore) {
          if (json.data && Array.isArray(json.data)) {
            setAllBecas(json.data);
          } else {
            throw new Error('Respuesta inválida del servidor');
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Error al conectar con el servidor';
          console.error('Error fetching scholarships:', err);
          setLoadError(msg);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchInitialBecas();
    return () => {
      ignore = true;
    };
  }, []);

  // Fetch universidades for filters
  useEffect(() => {
    let ignore = false;
    fetch('/api/universidades')
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.data && Array.isArray(json.data)) {
          setUniversidadesList(json.data);
        }
      })
      .catch((err) => console.error('Error fetching universidades:', err));
    return () => {
      ignore = true;
    };
  }, []);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    fetch('/api/becas?limit=100')
      .then(async (res) => {
        if (!res.ok) throw new Error(`Error ${res.status}: No se pudieron cargar las becas`);
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setAllBecas(json.data);
        } else {
          throw new Error('Respuesta inválida del servidor');
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al conectar con el servidor';
        console.error('Error retrying scholarships:', err);
        setLoadError(msg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Filter scholarships locally based on search and sidebar filters
  const filteredBecas = useMemo(() => {
    const result = allBecas.filter((beca) => {
      // 1. Text search
      if (searchQuery.trim()) {
        const queryNorm = normalizeText(searchQuery);
        const matchTitle = normalizeText(beca.nombreBeca || beca.titulo).includes(queryNorm);
        const matchDesc = normalizeText(beca.descripcion).includes(queryNorm);
        const matchUni = normalizeText(beca.universidad || beca.universidadRel?.nombre).includes(queryNorm);
        const matchCity = normalizeText(beca.universidadRel?.ciudad || beca.municipioAplicacion).includes(queryNorm);
        const matchReq = normalizeText(beca.requisitos).includes(queryNorm);
        const matchPob = normalizeText(beca.poblacionObjetivo).includes(queryNorm);
        if (!matchTitle && !matchDesc && !matchUni && !matchCity && !matchReq && !matchPob) {
          return false;
        }
      }

      // 2. Nivel de estudio
      if (filters.tipo) {
        const nivel = normalizeText(beca.nivelAcademico || beca.tipo);
        if (!nivel.includes(normalizeText(filters.tipo))) {
          return false;
        }
      }

      // 3. Cobertura
      if (filters.cobertura) {
        const percentage = parseCoveragePercentage(
          beca.porcentaje,
          beca.tipoFinanciacion,
          beca.cobertura,
          beca.porcentajeCobertura,
        );
        const isTotal =
          percentage >= 100 ||
          beca.cobertura === 'total' ||
          Boolean(beca.tipoFinanciacion?.toLowerCase().includes('total'));
        if (filters.cobertura === 'total' && !isTotal) return false;
        if (filters.cobertura === 'parcial' && isTotal) return false;
      }

      // 4. Estado
      if (filters.estado) {
        const estado = normalizeText(beca.estadoConvocatoria || beca.estado);
        if (!estado.includes(normalizeText(filters.estado))) {
          return false;
        }
      }

      // 5. Ciudad de la universidad (no de cada beca)
      const selectedCity = filters.ciudad || filters.departamento;
      if (selectedCity) {
        const uniCity = normalizeText(beca.universidadRel?.ciudad);
        const uniDept = normalizeText(beca.universidadRel?.departamento);
        const target = normalizeText(selectedCity);
        const matches =
          uniCity.includes(target) ||
          uniDept.includes(target) ||
          (target.includes('cundinamarca') && uniCity.includes('bogota')) ||
          (target.includes('bogota') && (uniDept.includes('cundinamarca') || uniCity.includes('bogota'))) ||
          (target.includes('antioquia') && uniCity.includes('medellin')) ||
          (target.includes('medellin') && (uniDept.includes('antioquia') || uniCity.includes('medellin')));
        if (!matches) {
          return false;
        }
      }

      // 6. Tipo de universidad (pública / privada)
      if (filters.universidadTipo) {
        const uTipo = beca.universidadRel?.tipo || 'privada';
        if (uTipo !== filters.universidadTipo) {
          return false;
        }
      }

      // 7. Categoría
      if (filters.categoria) {
        const hasCategory = beca.categorias?.some(
          (c) => c.categoria.nombre.toLowerCase() === filters.categoria.toLowerCase(),
        );
        if (!hasCategory) return false;
      }

      // 8. Modalidad
      if (filters.modalidad) {
        const mod = normalizeText(beca.modalidad);
        if (!mod.includes(normalizeText(filters.modalidad))) {
          return false;
        }
      }

      // 9. Universidad
      if (filters.universidad) {
        const targetUni = normalizeText(filters.universidad);
        const becaUni = normalizeText(beca.universidad || beca.universidadRel?.nombre);
        if (!becaUni.includes(targetUni)) {
          return false;
        }
      }

      return true;
    });

    return sortBecas(result, orden);
  }, [allBecas, searchQuery, filters, orden]);

  // List of saved scholarships (for the saved list view)
  const savedBecas = useMemo(() => {
    return allBecas.filter((b) => favorites.has(b.id));
  }, [allBecas, favorites]);

  // Safe clamped index without requiring an effect
  const safeCardIndex = useMemo(() => {
    if (filteredBecas.length === 0) return 0;
    return Math.min(cardIndex, filteredBecas.length - 1);
  }, [filteredBecas.length, cardIndex]);

  // Active card in Tinder explore mode
  const selectedBeca = useMemo(() => {
    if (filteredBecas.length === 0) return null;
    return filteredBecas[safeCardIndex] || null;
  }, [filteredBecas, safeCardIndex]);

  // Active saved scholarship derived without cascading effects
  const effectiveSavedBeca = useMemo(() => {
    if (savedBecas.length === 0) return null;
    return savedBecas.find((b) => b.id === selectedSavedBecaId) || savedBecas[0] || null;
  }, [savedBecas, selectedSavedBecaId]);

  // Active detail scholarship: either selected from saved list or active from Tinder deck
  const activeDetailBeca = useMemo(() => {
    if (showingFavorites) {
      return effectiveSavedBeca;
    }
    return selectedBeca;
  }, [showingFavorites, effectiveSavedBeca, selectedBeca]);

  // Save scholarship to favorites and advance in Tinder deck
  const handleSaveBeca = useCallback(
    (beca: BecaItem, e?: React.MouseEvent) => {
      setFavorites((prev) => {
        const updated = new Set(prev);
        updated.add(beca.id);
        try {
          localStorage.setItem('tubeca_favoritos', JSON.stringify(Array.from(updated)));
        } catch (err) {
          console.warn('Could not save favorites to localStorage:', err);
        }
        return updated;
      });

      if (e) {
        triggerSaveConfetti(e);
      }

      setHistory((prev) => [...prev, { id: beca.id, action: 'saved', index: cardIndex }]);
      setCardIndex((prev) => prev + 1);
    },
    [cardIndex],
  );

  // Discard scholarship and advance in Tinder deck
  const handleDiscardBeca = useCallback(
    (beca: BecaItem) => {
      setHistory((prev) => [...prev, { id: beca.id, action: 'discarded', index: cardIndex }]);
      setCardIndex((prev) => prev + 1);
    },
    [cardIndex],
  );

  // Undo last swipe action
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;

    const lastAction = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));

    if (lastAction.action === 'saved') {
      setFavorites((prev) => {
        const updated = new Set(prev);
        updated.delete(lastAction.id);
        try {
          localStorage.setItem('tubeca_favoritos', JSON.stringify(Array.from(updated)));
        } catch {
          // ignore
        }
        return updated;
      });
    }

    setCardIndex(lastAction.index);
  }, [history]);

  // Toggle favorite from details panel or saved list
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
        triggerSaveConfetti(e);
      }
      try {
        localStorage.setItem('tubeca_favoritos', JSON.stringify(Array.from(updated)));
      } catch (err) {
        console.warn('Could not save to localStorage:', err);
      }
      return updated;
    });
  };

  // Handle filter changes
  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCardIndex(0);
    setHistory([]);
  };

  const handleResetFilters = () => {
    setFilters({
      tipo: '',
      cobertura: '',
      estado: '',
      ciudad: '',
      departamento: '',
      universidadTipo: '',
      categoria: '',
      modalidad: '',
      universidad: '',
    });
    setOrden('cierra_pronto');
    setSearchQuery('');
    setShowingFavorites(false);
    setCardIndex(0);
    setHistory([]);
  };

  const handleOrdenChange = (newOrden: string) => {
    setOrden(newOrden);
    setCardIndex(0);
    setHistory([]);
  };

  // Handle onboarding completion
  const handleApplyOnboardingFilters = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      ...(newFilters.departamento ? { ciudad: newFilters.departamento } : {}),
      ...(newFilters.ciudad ? { departamento: newFilters.ciudad } : {}),
    }));
    setCardIndex(0);
    setHistory([]);
    try {
      localStorage.setItem('tubeca_onboarding_done', 'true');
    } catch {
      // ignore
    }
  };

  // Active filters count for mobile indicator
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.tipo) count++;
    if (filters.cobertura) count++;
    if (filters.ciudad || filters.departamento) count++;
    if (filters.categoria) count++;
    if (filters.modalidad) count++;
    if (filters.universidad) count++;
    return count;
  }, [filters]);

  // Ciudades únicas de las universidades
  const ciudades = useMemo(() => {
    const set = new Set<string>();
    allBecas.forEach((b) => {
      const city = b.universidadRel?.ciudad;
      if (city) set.add(city);
    });
    return Array.from(set).sort();
  }, [allBecas]);

  // Unique categories for filter dropdown
  const categorias = useMemo(() => {
    const set = new Set<string>();
    allBecas.forEach((b) => {
      b.categorias?.forEach((c) => set.add(c.categoria.nombre));
    });
    return Array.from(set).sort();
  }, [allBecas]);

  return (
    <div style={{ height: '100vh', maxHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeView={activeView}
        onViewChange={setActiveView}
        favoritesCount={favorites.size}
        showingFavorites={showingFavorites}
        onToggleShowingFavorites={() => {
          setShowingFavorites((prev) => !prev);
          setCardIndex(0);
          setHistory([]);
        }}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
        activeFiltersCount={activeFiltersCount}
        totalBecas={allBecas.length}
      />

      {/* Main Workspace (3 columns on desktop, vertical flow on mobile) */}
      <div className="tubeca-workspace" style={{ display: 'flex', flex: 1, minHeight: 0, height: 'calc(100vh - 68px)', overflow: 'hidden' }}>
        {/* Left Filters Sidebar (Desktop) */}
        <div className="tubeca-desktop-sidebar">
          <FiltersSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalFiltered={filteredBecas.length}
            totalCount={allBecas.length}
            ciudades={ciudades}
            categorias={categorias}
            universidades={universidadesList}
            orden={orden}
            onOrdenChange={handleOrdenChange}
            perfil={perfil}
            onPerfilChange={handlePerfilChange}
          />
        </div>

        {/* Dynamic Center & Right Area */}
        {activeView === 'split' ? (
          <main
            className="tubeca-workspace"
            style={{
              display: 'flex',
              flex: 1,
              minHeight: 0,
              height: '100%',
              overflow: 'hidden',
              background: 'var(--surface-base-gradient)',
            }}
          >
            {/* Middle Column: Saved List (when showingFavorites) OR Tinder Card Deck (explore mode) */}
            {showingFavorites ? (
              <section className="tubeca-list-stage">
                {/* Header for Saved List */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '2px 4px 14px 4px',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--favorite-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--favorite-color)',
                      }}
                    >
                      <Heart size={16} fill="currentColor" />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--ink-900)', lineHeight: 1.2 }}>
                        Becas Guardadas
                      </h2>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>
                        {savedBecas.length} {savedBecas.length === 1 ? 'convocatoria' : 'convocatorias'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowingFavorites(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'var(--brand-700)',
                      backgroundColor: 'var(--brand-50)',
                      border: '1px solid var(--brand-100)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      transition: 'background-color var(--duration-fast) var(--ease-smooth-out)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-100)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-50)')}
                  >
                    <span>← Volver a explorar</span>
                  </button>
                </div>

                {/* Render the clean card list */}
                <ScholarshipList
                  becas={savedBecas}
                  selectedBecaId={activeDetailBeca?.id || null}
                  onSelectBeca={(b) => setSelectedSavedBecaId(b.id)}
                  isLoading={isLoading}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  showingFavoritesOnly={true}
                  onClearFavoritesFilter={() => setShowingFavorites(false)}
                  perfil={perfil}
                />
              </section>
            ) : (
              <section className="tubeca-center-stage">
                <TinderCardDeck
                  becas={filteredBecas}
                  currentIndex={cardIndex}
                  onIndexChange={setCardIndex}
                  onSaveBeca={handleSaveBeca}
                  onDiscardBeca={handleDiscardBeca}
                  onUndo={handleUndo}
                  canUndo={history.length > 0}
                  isFavorite={selectedBeca ? favorites.has(selectedBeca.id) : false}
                  onRestartDeck={() => {
                    setCardIndex(0);
                    setHistory([]);
                  }}
                  showingFavoritesOnly={false}
                  onClearFavoritesFilter={() => setShowingFavorites(false)}
                  isLoading={isLoading}
                  loadError={loadError}
                  onRetry={handleRetry}
                  onResetFilters={handleResetFilters}
                  perfil={perfil}
                />
              </section>
            )}

            {/* Right Column (Desktop) / Scrollable Below (Mobile): Details */}
            <ScholarshipDetail
              beca={activeDetailBeca}
              isFavorite={activeDetailBeca ? favorites.has(activeDetailBeca.id) : false}
              onToggleFavorite={handleToggleFavorite}
              perfil={perfil}
            />
          </main>
        ) : (
          <main style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%', overflow: 'hidden', background: 'var(--surface-base-gradient)' }}>
            <ColombiaMap
              selectedDepartamento={filters.ciudad || filters.departamento}
              onSelectDepartamento={(city) => {
                handleFilterChange('ciudad', city);
                handleFilterChange('departamento', city);
              }}
              becas={filteredBecas}
              onSelectBeca={(b) => {
                const idx = filteredBecas.findIndex((item) => item.id === b.id);
                if (idx !== -1) setCardIndex(idx);
                setActiveView('split');
              }}
            />
          </main>
        )}
      </div>

      {/* Mobile Filters Slide-Over Drawer */}
      {isMobileFilterOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-start',
          }}
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '320px',
              height: '100%',
              backgroundColor: '#ffffff',
              boxShadow: 'var(--shadow-modal)',
              animation: 'slideInLeft 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <FiltersSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              totalFiltered={filteredBecas.length}
              totalCount={allBecas.length}
              ciudades={ciudades}
              categorias={categorias}
              universidades={universidadesList}
              onCloseMobile={() => setIsMobileFilterOpen(false)}
              orden={orden}
              onOrdenChange={handleOrdenChange}
              perfil={perfil}
              onPerfilChange={handlePerfilChange}
            />
          </div>
        </div>
      )}

      {/* Onboarding Pop-up Quiz */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          try {
            localStorage.setItem('tubeca_onboarding_done', 'true');
          } catch {
            // ignore
          }
        }}
        onApplyFilters={handleApplyOnboardingFilters}
      />
    </div>
  );
}
