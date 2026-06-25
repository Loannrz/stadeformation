'use client';

import { useId, useMemo, useState, type CSSProperties } from 'react';
import franceMap from '@svg-maps/france.regions';
import { BRAND_PALETTES, type Ecole, type MapEcole } from '@/lib/brand';
import { useCityPositions } from '@/hooks/useCityPositions';
import { isNewRegionForFormation, type FormationRegion } from '@/lib/formations';
import {
  buildRegionSlides,
  getActiveRegionIds,
  getFormationRegionEcoleMap,
  getRegionZoomPaths,
  layoutCityPins,
  parseFormationRegions,
} from '@/lib/region-map';
import styles from './RegionMapCarousel.module.scss';

interface Props {
  regions: FormationRegion[];
  formationId?: string;
  formationEcole?: Ecole;
}

function IconArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getSlidePalette(ecole: MapEcole | undefined, fallback: Ecole) {
  return BRAND_PALETTES[ecole ?? fallback];
}

const OVERVIEW_BRANDS: MapEcole[] = ['stade-formation', 'sporformation', 'both'];

function overviewBrandSuffix(ecole: MapEcole): string {
  if (ecole === 'stade-formation') return 'stade';
  if (ecole === 'sporformation') return 'spor';
  return 'both';
}

function OverviewGradients({ uid }: { uid: string }) {
  return (
    <>
      {OVERVIEW_BRANDS.map((brand) => {
        const p = BRAND_PALETTES[brand];
        const suffix = overviewBrandSuffix(brand);
        return (
          <linearGradient
            key={brand}
            id={`regionMapGradient-${uid}-${suffix}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={p.gradientStart} />
            <stop offset="50%" stopColor={p.gradientMid} />
            <stop offset="100%" stopColor={p.gradientEnd} />
          </linearGradient>
        );
      })}
    </>
  );
}

function overviewGradientUrl(uid: string, ecole: MapEcole): string {
  return `url(#regionMapGradient-${uid}-${overviewBrandSuffix(ecole)})`;
}

export default function RegionMapCarousel({
  regions,
  formationId,
  formationEcole = 'stade-formation',
}: Props) {
  const uid = useId().replace(/:/g, '');
  const pinGlowId = `pinGlow-${uid}`;
  const { positions: cityPositions } = useCityPositions();

  const slides = useMemo(
    () =>
      buildRegionSlides(regions, {
        formationId,
        formationEcole,
        cityPositions,
        isNewRegion: formationId
          ? (regionName) => isNewRegionForFormation(regionName, formationId)
          : undefined,
      }),
    [regions, formationId, formationEcole, cityPositions],
  );
  const activeIds = useMemo(() => getActiveRegionIds(regions), [regions]);
  const regionEcoleMap = useMemo(
    () => getFormationRegionEcoleMap(regions, formationEcole),
    [regions, formationEcole],
  );
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
    () =>
      slide.type === 'region'
        ? layoutCityPins(slide.cities, slide.regionId, cityPositions)
        : [],
    [slide, cityPositions],
  );
  const regionZoomPaths = useMemo(
    () => (slide.type === 'region' && slide.regionId ? getRegionZoomPaths(slide.regionId) : []),
    [slide],
  );

  const slideEcole: MapEcole =
    slide.type === 'overview' ? formationEcole : (slide.ecole ?? formationEcole);
  const palette = getSlidePalette(slideEcole, formationEcole);
  const gradientId = `regionMapGradient-${uid}-${index}`;
  const mapAccentStyle =
    slide.type === 'region'
      ? ({ '--map-accent': palette.primary } as CSSProperties)
      : undefined;

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
          style={mapAccentStyle}
          role="img"
          aria-label={slide.regionName}
        >
          <defs>
            <OverviewGradients uid={uid} />
            {slide.type === 'region' && (
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={palette.gradientStart} />
                <stop offset="50%" stopColor={palette.gradientMid} />
                <stop offset="100%" stopColor={palette.gradientEnd} />
              </linearGradient>
            )}
            <filter id={pinGlowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {slide.type === 'overview' ? (
            franceMap.locations.map((loc) => {
              const mapEcole = regionEcoleMap.get(loc.id) ?? formationEcole;
              const regionPalette = BRAND_PALETTES[mapEcole];
              return (
                <path
                  key={loc.id}
                  d={loc.path}
                  className={activeIds.has(loc.id) ? styles.regionActive : styles.regionInactive}
                  style={
                    activeIds.has(loc.id)
                      ? {
                          fill: overviewGradientUrl(uid, mapEcole),
                          stroke: regionPalette.primary,
                        }
                      : undefined
                  }
                />
              );
            })
          ) : (
            <>
              {regionZoomPaths.map((part) => (
                <path
                  key={part.id}
                  d={part.path}
                  className={
                    part.isDepartment ? styles.regionZoomDept : styles.regionZoom
                  }
                  style={{ fill: `url(#${gradientId})` }}
                />
              ))}
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
