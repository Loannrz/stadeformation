'use client';

import { useEffect, useMemo, useState } from 'react';
import franceMap from '@svg-maps/france.regions';
import { Formation, formations, getFormationsByRegion } from '@/lib/formations';
import FormationCard from './FormationCard';
import styles from './MapCentricHome.module.scss';

const REGION_SEARCH_KEYS: Record<string, string> = {
  naq: 'Nouvelle-Aquitaine',
  idf: 'Île-de-France',
  cor: 'Corse',
  nor: 'Normandie',
  pac: 'PACA',
};

const REGION_PREFIXES: Record<string, string[]> = {
  naq: ['nouvelle-aquitaine'],
  idf: ['île-de-france', 'ile-de-france'],
  cor: ['corse'],
  nor: ['normandie'],
  pac: ['paca', 'provence'],
};

function regionHasFormations(regionId: string): boolean {
  const prefixes = REGION_PREFIXES[regionId];
  if (!prefixes) return false;
  return formations.some((f) =>
    f.regions.some((r) => {
      const lower = r.regionName.toLowerCase();
      return prefixes.some((p) => lower.startsWith(p));
    })
  );
}

function filterFormations(items: Formation[], query: string): Formation[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  return items.filter((f) => {
    const diploma = f.certification.split('-')[0].trim().toLowerCase();
    return (
      f.nom.toLowerCase().includes(q) ||
      f.certification.toLowerCase().includes(q) ||
      diploma.includes(q)
    );
  });
}

export default function MapCentricHome() {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const activeLocation = franceMap.locations.find((l) => l.id === activeRegion);
  const searchKey = activeRegion ? REGION_SEARCH_KEYS[activeRegion] : null;
  const panelFormations = searchKey ? getFormationsByRegion(searchKey) : [];
  const filteredFormations = useMemo(
    () => filterFormations(panelFormations, searchQuery),
    [panelFormations, searchQuery]
  );
  const showSearch = panelFormations.length > 2;

  useEffect(() => {
    setSearchQuery('');
  }, [activeRegion]);

  return (
    <section className={styles.canvas} id="carte">
      <div className={styles.bgGrid} aria-hidden="true" />
      <div className={styles.bgGlow} aria-hidden="true" />

      <header className={styles.hero}>
        <p className={styles.eyebrow}>Formations sportives diplômantes</p>
        <h1 className={styles.title}>
          Devenez
          <span className={styles.gradient}> éducateur sportif</span>
          <br />
          diplômé
        </h1>
      </header>

      <div className={styles.stage}>
        <div className={styles.mapZone}>
          <div className={styles.mapFrame}>
            <div className={styles.mapAura} aria-hidden="true" />
            <svg
              viewBox={franceMap.viewBox}
              className={styles.svg}
              role="img"
              aria-label="Carte interactive des régions de France"
            >
              <defs>
                <linearGradient id="mapRegionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E65C23" />
                  <stop offset="50%" stopColor="#FF6B00" />
                  <stop offset="100%" stopColor="#FFD700" />
                </linearGradient>
                <linearGradient id="mapRegionGradientHover" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F58220" />
                  <stop offset="50%" stopColor="#FF8C00" />
                  <stop offset="100%" stopColor="#FFDB15" />
                </linearGradient>
                <linearGradient id="mapRegionGradientActive" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B00" />
                  <stop offset="100%" stopColor="#FFDB15" />
                </linearGradient>
                <filter id="mapGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {franceMap.locations.map((location) => {
                const hasF = regionHasFormations(location.id);
                const isActive = activeRegion === location.id;
                return (
                  <path
                    key={location.id}
                    id={location.id}
                    d={location.path}
                    className={[
                      styles.region,
                      hasF ? styles.hasFormations : styles.noFormations,
                      isActive ? styles.active : '',
                    ].join(' ')}
                    onClick={() => setActiveRegion(isActive ? null : location.id)}
                    role="button"
                    aria-label={`${location.name}${hasF ? ' - formations disponibles' : ''}`}
                    aria-pressed={isActive}
                  />
                );
              })}
            </svg>
          </div>

          <div className={styles.mapFooter}>
            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotActive}`} />
                Formations disponibles
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotInactive}`} />
                Autres régions
              </span>
            </div>
            <p className={styles.mapHint}>Sélectionnez une région sur la carte</p>
          </div>
        </div>

        <aside
          className={[styles.panel, activeLocation ? styles.panelActive : ''].join(' ')}
          aria-live="polite"
        >
          {!activeLocation ? (
            <div className={styles.panelIdle}>
              <span className={styles.panelIdleIcon} aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
              <p className={styles.panelIdleTitle}>Explorez la France</p>
              <p className={styles.panelIdleHint}>
                Cliquez sur une zone orange pour afficher les formations de la région.
              </p>
            </div>
          ) : (
            <>
              <div className={styles.panelHead}>
                <div>
                  <p className={styles.panelLabel}>Région</p>
                  <h2 className={styles.panelTitle}>{activeLocation.name}</h2>
                </div>
                <button
                  type="button"
                  className={styles.panelClose}
                  onClick={() => setActiveRegion(null)}
                  aria-label="Fermer la sélection"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {panelFormations.length > 0 && (
                <span className={styles.panelCount}>
                  {panelFormations.length} formation{panelFormations.length > 1 ? 's' : ''}
                </span>
              )}

              {panelFormations.length === 0 && (
                <p className={styles.panelEmpty}>Aucune formation dans cette région pour le moment.</p>
              )}

              {showSearch && (
                <div className={styles.panelSearch}>
                  <label className={styles.searchLabel} htmlFor="map-formation-search">
                    Rechercher
                  </label>
                  <div className={styles.searchField}>
                    <svg
                      className={styles.searchIcon}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                      <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                      id="map-formation-search"
                      type="search"
                      className={styles.searchInput}
                      placeholder="BPJEPS, DEJEPS…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Rechercher une formation"
                    />
                  </div>
                </div>
              )}

              {panelFormations.length > 0 && (
                <div className={styles.cards}>
                  {filteredFormations.length > 0 ? (
                    filteredFormations.map((f) => <FormationCard key={f.id} formation={f} />)
                  ) : (
                    <p className={styles.noResults}>
                      Aucun résultat pour « {searchQuery} »
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
