'use client';

import { useId, useMemo, useState } from 'react';
import franceMap from '@svg-maps/france.regions';
import { isNewRegionForFormation } from '@/lib/formations';
import {
  buildRegionSlides,
  getActiveRegionIds,
  getRegionPath,
  layoutCityPins,
  parseFormationRegions,
} from '@/lib/region-map';
import styles from './RegionMapCarousel.module.scss';

interface Props {
  regions: string[];
  formationId?: string;
}

function IconArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function RegionMapCarousel({ regions, formationId }: Props) {
  const uid = useId().replace(/:/g, '');
  const gradientId = `regionMapGradient-${uid}`;
  const pinGlowId = `pinGlow-${uid}`;

  const slides = useMemo(
    () =>
      buildRegionSlides(regions, {
        formationId,
        isNewRegion: formationId
          ? (regionName) => isNewRegionForFormation(regionName, formationId)
          : undefined,
      }),
    [regions, formationId],
  );
  const activeIds = useMemo(() => getActiveRegionIds(regions), [regions]);
  const allCities = useMemo(
    () => parseFormationRegions(regions).flatMap((r) => r.cities),
    [regions],
  );
  const [index, setIndex] = useState(0);

  const slide = slides[index];
  const hasMultiple = slides.length > 1;
  const displayRegion =
    slide.type === 'overview' ? 'Vue nationale' : slide.regionName;
  const displayCities = slide.type === 'overview' ? allCities : slide.cities;
  const cityPins = useMemo(
    () => (slide.type === 'region' ? layoutCityPins(slide.cities, slide.regionId) : []),
    [slide],
  );

  const goNext = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <div className={styles.carousel}>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <span className={styles.headerTitle}>Sites de formation</span>
          <span className={styles.headerRegion}>{displayRegion}</span>
          {slide.type === 'region' && slide.isNew && (
            <span className={styles.newBadge}>Nouvelle région</span>
          )}
          {hasMultiple && (
            <span className={styles.counter}>
              {index + 1} / {slides.length}
            </span>
          )}
        </div>
        {displayCities.length > 0 && (
          <p className={styles.citiesList}>{displayCities.join(' · ')}</p>
        )}
      </div>

      <div className={styles.mapWrap}>
        <svg
          viewBox={slide.viewBox}
          preserveAspectRatio="xMidYMid meet"
          className={styles.svg}
          role="img"
          aria-label={slide.regionName}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E65C23" />
              <stop offset="50%" stopColor="#FF6B00" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
            <filter id={pinGlowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {slide.type === 'overview' ? (
            franceMap.locations.map((loc) => (
              <path
                key={loc.id}
                d={loc.path}
                className={activeIds.has(loc.id) ? styles.regionActive : styles.regionInactive}
                style={
                  activeIds.has(loc.id)
                    ? { fill: `url(#${gradientId})` }
                    : undefined
                }
              />
            ))
          ) : (
            <>
              {slide.regionId && (
                <path
                  d={getRegionPath(slide.regionId)}
                  className={styles.regionZoom}
                  style={{ fill: `url(#${gradientId})` }}
                />
              )}
              {cityPins.map(({ city, pin }) => (
                <g key={city} className={styles.pin} transform={`translate(${pin.x}, ${pin.y})`}>
                  <circle r="3" className={styles.pinDot} filter={`url(#${pinGlowId})`} />
                  <circle r="1.2" className={styles.pinCore} />
                  <text
                    x={pin.labelX}
                    y={pin.labelY}
                    textAnchor={pin.textAnchor}
                    className={styles.pinLabel}
                  >
                    {city}
                  </text>
                </g>
              ))}
            </>
          )}
        </svg>

        {hasMultiple && (
          <button
            type="button"
            className={styles.arrowBtn}
            onClick={goNext}
            aria-label="Afficher la région suivante"
          >
            <IconArrow />
          </button>
        )}
      </div>
    </div>
  );
}
