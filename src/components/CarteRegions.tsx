'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import franceMap from '@svg-maps/france.regions';
import { BRAND_PALETTES, type MapEcole } from '@/lib/brand';
import type { Formation } from '@/lib/formations';
import {
  getCitiesForRegionId,
  getFormationCitiesInRegionId,
  getFormationsByRegionId,
  getRegionIdsWithFormations,
  getRegionMapEcole,
  resolveFormationEcoleInRegionId,
} from '@/lib/formations';
import { useSchoolFilter } from './SchoolFilterProvider';
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

function RegionGradients() {
  const brands: MapEcole[] = ['stade-formation', 'sporformation', 'both'];
  return (
    <defs>
      {brands.map((brand) => {
        const p = BRAND_PALETTES[brand];
        const id = brand === 'stade-formation' ? 'stade' : brand === 'sporformation' ? 'spor' : 'both';
        return (
          <g key={brand}>
            <linearGradient id={`regionGradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={p.gradientStart} />
              <stop offset="50%" stopColor={p.gradientMid} />
              <stop offset="100%" stopColor={p.gradientEnd} />
            </linearGradient>
            <linearGradient id={`regionGradientHover-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={p.hoverStart} />
              <stop offset="50%" stopColor={p.hoverMid} />
              <stop offset="100%" stopColor={p.hoverEnd} />
            </linearGradient>
          </g>
        );
      })}
    </defs>
  );
}

function gradientUrl(ecole: MapEcole, hover = false): string {
  const prefix = hover ? 'regionGradientHover' : 'regionGradient';
  const id = ecole === 'stade-formation' ? 'stade' : ecole === 'sporformation' ? 'spor' : 'both';
  return `url(#${prefix}-${id})`;
}

export default function CarteRegions({ formations: publicFormations }: { formations: Formation[] }) {
  const { filter } = useSchoolFilter();
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const panelRef = useRef<HTMLElement>(null);

  const activeRegionIds = useMemo(
    () => getRegionIdsWithFormations(publicFormations, filter),
    [publicFormations, filter],
  );

  const regionEcoleMap = useMemo(() => {
    const map = new Map<string, MapEcole>();
    for (const loc of franceMap.locations) {
      map.set(loc.id, getRegionMapEcole(loc.id, publicFormations, filter));
    }
    return map;
  }, [publicFormations, filter]);

  const activeLocation = franceMap.locations.find((l) => l.id === activeRegion);
  const panelFormations = activeRegion ? getFormationsByRegionId(activeRegion, publicFormations, filter) : [];
  const regionCities = activeRegion ? getCitiesForRegionId(activeRegion, publicFormations, filter) : [];
  const filteredFormations = useMemo(
    () => filterFormations(panelFormations, searchQuery),
    [panelFormations, searchQuery],
  );
  const showSearch = panelFormations.length > 2;

  useEffect(() => {
    setSearchQuery('');
  }, [activeRegion]);

  useEffect(() => {
    if (activeRegion && !activeRegionIds.has(activeRegion)) {
      setActiveRegion(null);
    }
  }, [activeRegion, activeRegionIds]);

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
            <RegionGradients />
            {franceMap.locations.map((location) => {
              const hasF = activeRegionIds.has(location.id);
              const mapEcole = regionEcoleMap.get(location.id) ?? 'stade-formation';
              return (
                <path
                  key={location.id}
                  id={location.id}
                  d={location.path}
                  className={[
                    styles.region,
                    hasF ? styles.hasFormations : styles.noFormations,
                  ].join(' ')}
                  style={
                    hasF
                      ? { fill: gradientUrl(mapEcole) }
                      : undefined
                  }
                  onMouseEnter={(e) => {
                    if (hasF) {
                      (e.target as SVGPathElement).style.fill = gradientUrl(mapEcole, true);
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hasF) {
                      (e.target as SVGPathElement).style.fill = gradientUrl(mapEcole);
                    }
                  }}
                  onClick={() => {
                    if (!hasF) return;
                    setActiveRegion(activeRegion === location.id ? null : location.id);
                  }}
                  role={hasF ? 'button' : undefined}
                  tabIndex={hasF ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (!hasF) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveRegion(activeRegion === location.id ? null : location.id);
                    }
                  }}
                  aria-label={`${location.name}${hasF ? ' - formations disponibles' : ''}`}
                  aria-pressed={hasF ? activeRegion === location.id : undefined}
                />
              );
            })}
          </svg>
          </div>

          <div className={styles.mapLegend}>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendDotStade}`} />
              Stade Formation
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendDotSpor}`} />
              SporFormation
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendDotBoth}`} />
              Les deux écoles
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
                  Clique sur une zone colorée de la carte pour découvrir les formations disponibles.
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
                            ecole={
                              activeRegion
                                ? resolveFormationEcoleInRegionId(f, activeRegion, filter)
                                : f.ecole
                            }
                            lieux={
                              activeRegion
                                ? getFormationCitiesInRegionId(f, activeRegion, filter)
                                : undefined
                            }
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
