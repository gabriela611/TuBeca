'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { FiltersSidebar, type FilterState } from '@/components/FiltersSidebar';
import { ScholarshipList, type BecaItem } from '@/components/ScholarshipList';
import { ScholarshipDetail } from '@/components/ScholarshipDetail';
import { ColombiaMap } from '@/components/ColombiaMap';
import { OnboardingModal } from '@/components/OnboardingModal';
import { triggerSaveConfetti } from '@/lib/confetti';

export default function Home() {
  const [allBecas, setAllBecas] = useState<BecaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'split' | 'map'>('split');
  const [selectedBeca, setSelectedBeca] = useState<BecaItem | null>(null);

  // Favorites state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showingFavorites, setShowingFavorites] = useState(false);

  // Onboarding state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    tipo: '',
    cobertura: '',
    estado: '',
    departamento: '',
    universidadTipo: '',
    categoria: '',
  });

  // Load favorites and check onboarding status from localStorage
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('tubeca_favoritos');
      if (savedFavs) {
        setFavorites(new Set(JSON.parse(savedFavs)));
      }

      const onboardingDone = localStorage.getItem('tubeca_onboarding_done');
      if (!onboardingDone) {
        setIsOnboardingOpen(true);
      }
    } catch (e) {
      console.warn('Could not read localStorage:', e);
    }
  }, []);

  // Fetch initial scholarships from API
  useEffect(() => {
    async function loadBecas() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/becas?limit=50');
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setAllBecas(json.data);
          if (json.data.length > 0) {
            setSelectedBeca(json.data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching scholarships:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadBecas();
  }, []);

  // Toggle favorite with microinteraction and discrete confetti
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

  // Filter scholarships locally based on search, favorites and sidebar filters
  const filteredBecas = useMemo(() => {
    return allBecas.filter((beca) => {
      // 0. Favorites filter
      if (showingFavorites && !favorites.has(beca.id)) {
        return false;
      }

      // 1. Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = beca.titulo.toLowerCase().includes(query);
        const matchDesc = beca.descripcion.toLowerCase().includes(query);
        const matchUni = beca.universidad?.nombre?.toLowerCase().includes(query);
        const matchCity = beca.ciudad?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchUni && !matchCity) {
          return false;
        }
      }

      // 2. Nivel de estudio
      if (filters.tipo && beca.tipo.toLowerCase() !== filters.tipo.toLowerCase()) {
        return false;
      }

      // 3. Cobertura
      if (filters.cobertura) {
        const isTotal = beca.cobertura === 'total' || (beca.porcentajeCobertura ?? 0) >= 100;
        if (filters.cobertura === 'total' && !isTotal) return false;
        if (filters.cobertura === 'parcial' && isTotal) return false;
      }

      // 4. Estado
      if (filters.estado && beca.estado !== filters.estado) {
        return false;
      }

      // 5. Departamento / Región
      if (filters.departamento) {
        const matchDept =
          beca.departamento?.toLowerCase().includes(filters.departamento.toLowerCase()) ||
          beca.ciudad?.toLowerCase().includes(filters.departamento.toLowerCase()) ||
          beca.departamento === 'Todos';
        if (!matchDept) return false;
      }

      // 6. Tipo de universidad (pública / privada)
      if (filters.universidadTipo) {
        if (beca.universidad?.tipo !== filters.universidadTipo) {
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

      return true;
    });
  }, [allBecas, searchQuery, filters, showingFavorites, favorites]);

  // Keep selected beca in sync with filtered list
  useEffect(() => {
    if (filteredBecas.length > 0) {
      if (!selectedBeca || !filteredBecas.some((b) => b.id === selectedBeca.id)) {
        setSelectedBeca(filteredBecas[0]);
      }
    } else {
      setSelectedBeca(null);
    }
  }, [filteredBecas]);

  // Handle filter changes
  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      tipo: '',
      cobertura: '',
      estado: '',
      departamento: '',
      universidadTipo: '',
      categoria: '',
    });
    setSearchQuery('');
    setShowingFavorites(false);
  };

  // Handle onboarding completion
  const handleApplyOnboardingFilters = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
    try {
      localStorage.setItem('tubeca_onboarding_done', 'true');
    } catch (e) {
      // ignore
    }
  };

  // Unique departments for filter dropdown
  const departamentos = useMemo(() => {
    const set = new Set<string>();
    allBecas.forEach((b) => {
      if (b.departamento && b.departamento !== 'Todos') set.add(b.departamento);
      if (b.ciudad && b.ciudad !== 'Nacional') set.add(b.ciudad);
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
        onToggleShowingFavorites={() => setShowingFavorites((prev) => !prev)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        totalBecas={allBecas.length}
      />

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, height: 'calc(100vh - 68px)', overflow: 'hidden' }}>
        {/* Left Filters Sidebar */}
        <FiltersSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          totalFiltered={filteredBecas.length}
          totalCount={allBecas.length}
          departamentos={departamentos}
          categorias={categorias}
        />

        {/* Dynamic Right Area */}
        {activeView === 'split' ? (
          <main style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%', overflow: 'hidden', background: 'var(--surface-base-gradient)' }}>
            {/* Middle Column: Scholarships List (Streamlined cards with elevation) */}
            <ScholarshipList
              becas={filteredBecas}
              selectedBecaId={selectedBeca?.id || null}
              onSelectBeca={(b) => setSelectedBeca(b)}
              isLoading={isLoading}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              showingFavoritesOnly={showingFavorites}
              onClearFavoritesFilter={() => setShowingFavorites(false)}
            />

            {/* Right Column: Full Details */}
            <ScholarshipDetail
              beca={selectedBeca}
              isFavorite={selectedBeca ? favorites.has(selectedBeca.id) : false}
              onToggleFavorite={handleToggleFavorite}
            />
          </main>
        ) : (
          <main style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%', overflow: 'hidden', background: 'var(--surface-base-gradient)' }}>
            <ColombiaMap
              selectedDepartamento={filters.departamento}
              onSelectDepartamento={(dept) => handleFilterChange('departamento', dept)}
              becas={filteredBecas}
              onSelectBeca={(b) => {
                setSelectedBeca(b);
                setActiveView('split');
              }}
            />
          </main>
        )}
      </div>

      {/* Onboarding Pop-up Quiz */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          try {
            localStorage.setItem('tubeca_onboarding_done', 'true');
          } catch (e) {
            // ignore
          }
        }}
        onApplyFilters={handleApplyOnboardingFilters}
      />
    </div>
  );
}
