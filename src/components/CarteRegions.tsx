'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import franceMap from '@svg-maps/france.regions';
import {
  Formation,
  formations,
  getCitiesForRegionId,
  getFormationCitiesInRegionId,
  getFormationsByRegionId,
  getRegionIdsWithFormations,
} from '@/lib/formations';
import FormationCard from './FormationCard';
import styles from './CarteRegions.module.scss';

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

export default function CarteRegions() {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const panelRef = useRef<HTMLElement>(null);

  const activeRegionIds = useMemo(() => getRegionIdsWithFormations(formations), []);

  const activeLocation = franceMap.locations.find((l) => l.id === activeRegion);
  const panelFormations = activeRegion ? getFormationsByRegionId(activeRegion) : [];
  const regionCities = activeRegion ? getCitiesForRegionId(activeRegion) : [];
  const filteredFormations = useMemo(
    () => filterFormations(panelFormations, searchQuery),
    [panelFormations, searchQuery],
  );
  const showSearch = panelFormations.length > 2;

  useEffect(() => {
    setSearchQuery('');
  }, [activeRegion]);

  useEffect(() => {
    if (!activeRegion || !panelRef.current) return;
    panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeRegion]);

  return (
    <section className={styles.section} id="carte">
      <div className={styles.mapStage}>
        <header className={styles.header}>
          <p className={styles.label}>Trouver ma formation</p>
          <h2 className={styles.title}>Où vous former ?</h2>
          <p className={styles.hint}>Cliquez sur une région pour voir les formations disponibles</p>
        </header>

        <div className={styles.mapArea}>
          <div className={styles.mapGlow} aria-hidden="true" />
          <div className={styles.mapCanvas}>
          <svg
            viewBox={franceMap.viewBox}
            className={styles.svg}
            role="img"
            aria-label="Carte des régions de France"
          >
            <defs>
              <linearGradient id="regionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E65C23" />
                <stop offset="50%" stopColor="#FF6B00" />
                <stop offset="100%" stopColor="#FFD700" />
              </linearGradient>
              <linearGradient id="regionGradientHover" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F58220" />
                <stop offset="50%" stopColor="#FF8C00" />
                <stop offset="100%" stopColor="#FFDB15" />
              </linearGradient>
            </defs>
            {franceMap.locations.map((location) => {
              const hasF = activeRegionIds.has(location.id);
              const isActive = activeRegion === location.id;
              return (
                <path
                  key={location.id}
                  id={location.id}
                  d={location.path}
                  className={[
                    styles.region,
                    hasF ? styles.hasFormations : styles.noFormations,
                  ].join(' ')}
                  onClick={() => {
                    if (!hasF) return;
                    setActiveRegion(isActive ? null : location.id);
                  }}
                  role={hasF ? 'button' : undefined}
                  tabIndex={hasF ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (!hasF) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveRegion(isActive ? null : location.id);
                    }
                  }}
                  aria-label={`${location.name}${hasF ? ' - formations disponibles' : ''}`}
                  aria-pressed={hasF ? isActive : undefined}
                />
              );
            })}
          </svg>
          </div>

          <div className={styles.mapLegend}>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendDotActive}`} />
              Régions avec formations
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendDotInactive}`} />
              Autres régions
            </span>
          </div>
        </div>

        <aside
          ref={panelRef}
          className={[styles.panel, activeLocation ? styles.panelOpen : ''].join(' ')}
        >
            {!activeLocation ? (
              <div className={styles.panelEmpty}>
                <span className={styles.panelEmptyIcon} aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                <p className={styles.panelEmptyTitle}>Choisis une région</p>
                <p className={styles.panelEmptyHint}>
                  Clique sur une zone orange de la carte pour découvrir les formations disponibles.
                </p>
              </div>
            ) : (
              <>
                <div className={styles.panelTop}>
                  <div className={styles.panelHead}>
                    <div className={styles.panelHeadMain}>
                      <p className={styles.panelLabel}>Formations disponibles</p>
                      <h3 className={styles.panelTitle}>{activeLocation.name}</h3>
                      {regionCities.length > 0 && (
                        <p className={styles.panelCities}>{regionCities.join(' · ')}</p>
                      )}
                    </div>
                    <div className={styles.panelHeadActions}>
                      {panelFormations.length > 0 && (
                        <span className={styles.panelCount}>
                          {panelFormations.length} formation{panelFormations.length > 1 ? 's' : ''}
                        </span>
                      )}
                      <button
                        type="button"
                        className={styles.panelClose}
                        onClick={() => setActiveRegion(null)}
                        aria-label="Fermer la sélection de région"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {panelFormations.length === 0 && (
                    <p className={styles.panelNoFormations}>Aucune formation disponible dans cette région.</p>
                  )}

                  {showSearch && (
                    <div className={styles.panelSearch}>
                      <label className={styles.searchLabel} htmlFor="formation-search">
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
                          id="formation-search"
                          type="search"
                          className={styles.searchInput}
                          placeholder="BPJEPS, DEJEPS, Titre Pro…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          aria-label="Rechercher une formation ou un diplôme"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {panelFormations.length > 0 && (
                  <div className={styles.cardsWrap}>
                    <div className={styles.cards}>
                      {filteredFormations.length > 0 ? (
                        filteredFormations.map((f) => (
                          <FormationCard
                            key={f.id}
                            formation={f}
                            compact
                            lieux={activeRegion ? getFormationCitiesInRegionId(f, activeRegion) : undefined}
                          />
                        ))
                      ) : (
                        <p className={styles.noResults}>
                          Aucune formation ne correspond à « {searchQuery} »
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
        </aside>
      </div>
    </section>
  );
}
