'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import franceMap from '@svg-maps/france.regions';
import type { CityPosition, CityPositionsMap } from '@/lib/city-positions';
import { cityNameToStorageKey, hasCityPosition } from '@/lib/city-positions';
import {
  getRegionDisplayName,
  getRegionViewBox,
  getRegionZoomPaths,
  layoutCityPins,
  regionNameToId,
} from '@/lib/region-map';
import styles from './CityMapEditor.module.scss';

function clientToSvg(svg: SVGSVGElement, clientX: number, clientY: number) {
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const matrix = svg.getScreenCTM();
  if (!matrix) return { x: 0, y: 0 };
  const transformed = point.matrixTransform(matrix.inverse());
  return { x: transformed.x, y: transformed.y };
}

interface RegionCityEditorProps {
  regionId: string;
  regionName: string;
  cities: string[];
  positions: CityPositionsMap;
  focusCity?: string;
  onPositionChange: (city: string, position: CityPosition) => void;
  onBack?: () => void;
  embedded?: boolean;
}

function RegionCityEditor({
  regionId,
  regionName,
  cities,
  positions,
  focusCity,
  onPositionChange,
  onBack,
  embedded = false,
}: RegionCityEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragCity, setDragCity] = useState<string | null>(null);
  const [pendingPos, setPendingPos] = useState<{ city: string; position: CityPosition } | null>(null);
  const [localPositions, setLocalPositions] = useState<CityPositionsMap>(positions);

  useEffect(() => {
    setLocalPositions(positions);
  }, [positions]);

  const mergedPositions = useMemo(() => ({ ...positions, ...localPositions }), [positions, localPositions]);

  const viewBox = useMemo(
    () => getRegionViewBox(regionId, cities, mergedPositions),
    [regionId, cities, mergedPositions],
  );

  const paths = useMemo(() => getRegionZoomPaths(regionId), [regionId]);

  const pins = useMemo(
    () => layoutCityPins(cities, regionId, mergedPositions),
    [cities, regionId, mergedPositions],
  );

  const handlePointerDown = useCallback((city: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    setDragCity(city);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragCity || !svgRef.current) return;
      const { x, y } = clientToSvg(svgRef.current, e.clientX, e.clientY);
      const key = cityNameToStorageKey(dragCity);
      const position = { x, y };
      setLocalPositions((prev) => ({
        ...prev,
        [key]: position,
      }));
      setPendingPos({ city: dragCity, position });
    },
    [dragCity],
  );

  const handlePointerUp = useCallback(() => {
    if (pendingPos) {
      onPositionChange(pendingPos.city, pendingPos.position);
    }
    setDragCity(null);
    setPendingPos(null);
  }, [onPositionChange, pendingPos]);

  const unpinned = cities.filter((c) => !hasCityPosition(c, mergedPositions));

  return (
    <div className={styles.regionPanel}>
      {!embedded && (
        <div className={styles.regionHead}>
          <button type="button" className={styles.backBtn} onClick={onBack}>
            ← Retour à la carte
          </button>
          <div>
            <h2 className={styles.regionTitle}>{regionName}</h2>
            <p className={styles.regionHint}>
              Glissez les points pour repositionner les villes. Les modifications s&apos;appliquent sur tout le site.
            </p>
          </div>
        </div>
      )}
      {embedded && (
        <div className={styles.regionHead}>
          <div>
            <h2 className={styles.regionTitle}>Placer « {focusCity ?? cities[0]} » sur la carte</h2>
            <p className={styles.regionHint}>
              Glissez le point orange pour indiquer l&apos;emplacement de la ville en {regionName}.
            </p>
          </div>
        </div>
      )}

      {unpinned.length > 0 && (
        <p className={styles.unpinned}>
          Villes sans position enregistrée : {unpinned.join(', ')} - placez-les sur la carte.
        </p>
      )}

      <div className={styles.mapWrap}>
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className={styles.map}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {paths.map(({ id, path }) => (
            <path key={id} d={path} className={styles.regionPath} />
          ))}
          {pins.map(({ city, pin }) => {
            const isFocus = focusCity === city;
            const isDragging = dragCity === city;
            return (
              <g
                key={city}
                className={`${styles.pin} ${isFocus ? styles.pinFocus : ''} ${isDragging ? styles.pinDragging : ''}`}
                transform={`translate(${pin.x}, ${pin.y})`}
                onPointerDown={handlePointerDown(city)}
                style={{ cursor: 'grab', touchAction: 'none' }}
              >
                <circle r="5" className={styles.pinDot} />
                <circle r="2" className={styles.pinCore} />
                <text x={pin.labelX} y={pin.labelY} textAnchor={pin.textAnchor} className={styles.pinLabel}>
                  {city}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <ul className={styles.cityList}>
        {cities.map((city) => (
          <li key={city} className={styles.cityListItem}>
            <span>{city}</span>
            <span className={hasCityPosition(city, mergedPositions) ? styles.badgeOk : styles.badgeMissing}>
              {hasCityPosition(city, mergedPositions) ? 'Positionnée' : 'À placer'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface Props {
  regions: { regionName: string; regionId: string; cities: string[] }[];
  positions: CityPositionsMap;
  onPositionChange: (city: string, position: CityPosition) => void;
  initialRegionId?: string;
  focusCity?: string;
}

export default function CityMapEditor({
  regions,
  positions,
  onPositionChange,
  initialRegionId,
  focusCity,
}: Props) {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(initialRegionId ?? null);

  const selectedRegion = regions.find((r) => r.regionId === selectedRegionId);

  if (selectedRegion) {
    return (
      <RegionCityEditor
        regionId={selectedRegion.regionId}
        regionName={selectedRegion.regionName}
        cities={selectedRegion.cities}
        positions={positions}
        focusCity={focusCity}
        onPositionChange={onPositionChange}
        onBack={() => setSelectedRegionId(null)}
      />
    );
  }

  const activeRegionIds = new Set(regions.map((r) => r.regionId));

  return (
    <div className={styles.overview}>
      <p className={styles.overviewHint}>Cliquez sur une région pour modifier les emplacements des villes.</p>
      <div className={styles.mapWrap}>
        <svg viewBox={franceMap.viewBox} className={styles.map}>
          {franceMap.locations.map((loc) => {
            const hasCities = activeRegionIds.has(loc.id);
            return (
              <path
                key={loc.id}
                d={loc.path}
                className={`${styles.overviewPath} ${hasCities ? styles.overviewPathActive : ''}`}
                onClick={() => {
                  if (hasCities) setSelectedRegionId(loc.id);
                }}
                role={hasCities ? 'button' : undefined}
                aria-label={hasCities ? `Modifier les villes en ${getRegionDisplayName(loc.id)}` : undefined}
              />
            );
          })}
        </svg>
      </div>
      <ul className={styles.regionPickList}>
        {regions.map((r) => (
          <li key={r.regionId}>
            <button type="button" className={styles.regionPickBtn} onClick={() => setSelectedRegionId(r.regionId)}>
              {r.regionName}
              <span>{r.cities.length} ville{r.cities.length > 1 ? 's' : ''}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CityPlacementEditor({
  regionName,
  cityName,
  positions,
  onPositionChange,
}: {
  regionName: string;
  cityName: string;
  positions: CityPositionsMap;
  onPositionChange: (position: CityPosition) => void;
}) {
  const regionId = regionNameToId(regionName);
  if (!regionId) return null;

  return (
    <RegionCityEditor
      regionId={regionId}
      regionName={regionName}
      cities={[cityName]}
      positions={positions}
      focusCity={cityName}
      onPositionChange={(_city, pos) => onPositionChange(pos)}
      embedded
    />
  );
}
