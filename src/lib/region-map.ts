import type { Ecole } from '@/lib/brand';
import { BRAND_PALETTES, mergeMapEcoles, type MapEcole } from '@/lib/brand';
import type { CityPositionsMap } from '@/lib/city-positions';
import { getStaticCityPositions, resolveCityStorageKey } from '@/lib/city-positions';
import type { FormationRegion } from '@/lib/formations';
import { getRegionMapEcoleForFormation } from '@/lib/formations';
import franceDepartments from '@svg-maps/france.departments';
import franceMap from '@svg-maps/france.regions';
import { svgPathBbox } from 'svg-path-bbox';

/** Départements d'Île-de-France (grande couronne) */
export const IDF_DEPARTMENT_IDS = ['75', '77', '78', '91', '92', '93', '94', '95'] as const;

export interface RegionSlide {
  type: 'overview' | 'region';
  regionId?: string;
  regionName: string;
  cities: string[];
  viewBox: string;
  isNew?: boolean;
  ecole?: MapEcole;
}

export interface CityPin {
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  textAnchor: 'start' | 'middle' | 'end';
}

/** Positions par défaut (fichier city-positions.json, viewBox 15 -1 598 586) */
function getBuiltinCityPositions(): Record<string, { x: number; y: number }> {
  const map = getStaticCityPositions();
  return Object.fromEntries(
    Object.entries(map).map(([key, pos]) => [key, { x: pos.x, y: pos.y }]),
  );
}

function resolvePositionsMap(
  custom?: CityPositionsMap,
): Record<string, { x: number; y: number }> {
  if (!custom) return getBuiltinCityPositions();
  return Object.fromEntries(
    Object.entries(custom).map(([key, pos]) => [key, { x: pos.x, y: pos.y }]),
  );
}

/** Placement préféré des libellés (évite les chevauchements en IDF) */
const CITY_LABEL_PRESETS: Record<
  string,
  Pick<CityPin, 'labelX' | 'labelY' | 'textAnchor'>
> = {
  cergy: { labelX: -8, labelY: -7, textAnchor: 'end' },
  courbevoie: { labelX: -8, labelY: 0, textAnchor: 'end' },
  nanterre: { labelX: -8, labelY: 7, textAnchor: 'end' },
  'paris 7': { labelX: 8, labelY: 0, textAnchor: 'start' },
  'paris 7ème': { labelX: 8, labelY: 0, textAnchor: 'start' },
  drancy: { labelX: 8, labelY: -6, textAnchor: 'start' },
  arpajon: { labelX: 0, labelY: 9, textAnchor: 'middle' },
  égly: { labelX: -8, labelY: 9, textAnchor: 'end' },
  'mortagne-au-perche': { labelX: 7, labelY: 2, textAnchor: 'start' },
  ajaccio: { labelX: -7, labelY: 2, textAnchor: 'end' },
};

const DEFAULT_LABEL: Pick<CityPin, 'labelX' | 'labelY' | 'textAnchor'> = {
  labelX: 6,
  labelY: 2,
  textAnchor: 'start',
};

const LABEL_OFFSET_CANDIDATES: Pick<CityPin, 'labelX' | 'labelY' | 'textAnchor'>[] = [
  { labelX: 7, labelY: -4, textAnchor: 'start' },
  { labelX: -7, labelY: -4, textAnchor: 'end' },
  { labelX: 7, labelY: 8, textAnchor: 'start' },
  { labelX: -7, labelY: 8, textAnchor: 'end' },
  { labelX: 0, labelY: -9, textAnchor: 'middle' },
  { labelX: 0, labelY: 11, textAnchor: 'middle' },
  { labelX: 10, labelY: 2, textAnchor: 'start' },
  { labelX: -10, labelY: 2, textAnchor: 'end' },
];

const REGION_PREFIX_TO_ID: [string, string][] = [
  ['nouvelle-aquitaine', 'naq'],
  ['île-de-france', 'idf'],
  ['ile-de-france', 'idf'],
  ['corse', 'cor'],
  ['normandie', 'nor'],
  ['paca', 'pac'],
  ['provence-alpes', 'pac'],
  ['provence', 'pac'],
  ['occitanie', 'occ'],
  ['bretagne', 'bre'],
  ['pays de la loire', 'pdl'],
  ['hauts-de-france', 'hdf'],
  ['grand est', 'ges'],
  ['auvergne-rhône-alpes', 'ara'],
  ['auvergne-rhone-alpes', 'ara'],
  ['bourgogne-franche-comté', 'bfc'],
  ['bourgogne-franche-comte', 'bfc'],
  ['bourgogne', 'bfc'],
  ['centre-val de loire', 'cvl'],
  ['centre', 'cvl'],
];

function normalizeCityKey(city: string): string {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveCityKey(
  city: string,
  positions: Record<string, { x: number; y: number }>,
): string | null {
  const raw = normalizeCityKey(city);
  if (positions[raw]) return raw;

  const aliases: [string, string][] = [
    ['paris', 'paris 7ème'],
    ['egly', 'égly'],
    ['pont-du-casse/agen', 'agen'],
    ['arpajon/égly', 'arpajon'],
    ['arpajon/egly', 'arpajon'],
    ['mortagne', 'mortagne-au-perche'],
  ];

  for (const [needle, key] of aliases) {
    if (raw.includes(needle) && positions[key]) return key;
  }

  for (const key of Object.keys(positions)) {
    if (raw.includes(key) || key.includes(raw)) return key;
  }

  return null;
}

export function getCityPosition(
  city: string,
  customPositions?: CityPositionsMap,
): { x: number; y: number } | null {
  const positions = resolvePositionsMap(customPositions);
  const key = resolveCityKey(city, positions);
  return key ? positions[key] : null;
}

function estimateLabelBox(
  pin: CityPin,
  label: string,
): { x: number; y: number; width: number; height: number } {
  const charWidth = 3.6;
  const height = 7;
  const width = Math.max(label.length * charWidth, 14);
  const anchorX = pin.x + pin.labelX;
  const anchorY = pin.y + pin.labelY;

  if (pin.textAnchor === 'middle') {
    return { x: anchorX - width / 2, y: anchorY - height + 2, width, height };
  }
  if (pin.textAnchor === 'end') {
    return { x: anchorX - width, y: anchorY - height + 2, width, height };
  }
  return { x: anchorX, y: anchorY - height + 2, width, height };
}

function boxesOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  const pad = 2;
  return !(
    a.x + a.width + pad < b.x ||
    b.x + b.width + pad < a.x ||
    a.y + a.height + pad < b.y ||
    b.y + b.height + pad < a.y
  );
}

function buildCityPin(
  city: string,
  label: Pick<CityPin, 'labelX' | 'labelY' | 'textAnchor'>,
  positions: Record<string, { x: number; y: number }>,
): CityPin | null {
  const key = resolveCityKey(city, positions);
  if (!key) return null;
  const pos = positions[key];
  return { x: pos.x, y: pos.y, ...label };
}

export interface PlacedCityPin {
  city: string;
  pin: CityPin;
}

function getRegionCenter(regionId: string): { x: number; y: number } {
  if (isIdfRegion(regionId)) {
    const bbox = getIdfCombinedBBox();
    return {
      x: (bbox.minX + bbox.maxX) / 2,
      y: (bbox.minY + bbox.maxY) / 2,
    };
  }

  const loc = franceMap.locations.find((l) => l.id === regionId);
  if (!loc) return { x: 300, y: 300 };
  const bbox = getPathBBox(loc.path);
  return {
    x: (bbox.minX + bbox.maxX) / 2,
    y: (bbox.minY + bbox.maxY) / 2,
  };
}

function buildFallbackPin(city: string, regionId: string, index: number): CityPin {
  const center = getRegionCenter(regionId);
  const angle = (index * 72 * Math.PI) / 180;
  const radius = 18 + index * 6;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
    ...DEFAULT_LABEL,
  };
}

/** Résout les positions + libellés sans chevauchement pour un ensemble de villes */
export function layoutCityPins(
  cities: string[],
  regionId?: string,
  customPositions?: CityPositionsMap,
): PlacedCityPin[] {
  const positions = resolvePositionsMap(customPositions);
  const placed: { pin: CityPin; label: string; box: ReturnType<typeof estimateLabelBox> }[] = [];
  const result: PlacedCityPin[] = [];
  let fallbackIndex = 0;

  for (const city of cities) {
    const key = resolveCityKey(city, positions);
    const preset = (key && CITY_LABEL_PRESETS[key]) || DEFAULT_LABEL;
    const candidates = [
      preset,
      ...LABEL_OFFSET_CANDIDATES.filter(
        (c) =>
          c.labelX !== preset.labelX ||
          c.labelY !== preset.labelY ||
          c.textAnchor !== preset.textAnchor,
      ),
    ];

    let chosen: CityPin | null = null;
    let chosenBox: ReturnType<typeof estimateLabelBox> | null = null;

    for (const candidate of candidates) {
      const pin = buildCityPin(city, candidate, positions);
      if (!pin) break;
      const box = estimateLabelBox(pin, city);
      const overlaps = placed.some((p) => boxesOverlap(box, p.box));
      if (!overlaps) {
        chosen = pin;
        chosenBox = box;
        break;
      }
    }

    if (!chosen && regionId) {
      const storedKey = resolveCityStorageKey(city, customPositions ?? getStaticCityPositions());
      if (storedKey && positions[storedKey]) {
        const pin: CityPin = { x: positions[storedKey].x, y: positions[storedKey].y, ...DEFAULT_LABEL };
        chosen = pin;
        chosenBox = estimateLabelBox(pin, city);
      }
    }

    if (!chosen && regionId) {
      const pin = buildFallbackPin(city, regionId, fallbackIndex);
      fallbackIndex += 1;
      chosen = pin;
      chosenBox = estimateLabelBox(pin, city);
    }

    if (chosen && chosenBox) {
      placed.push({ pin: chosen, label: city, box: chosenBox });
      result.push({ city, pin: chosen });
    }
  }

  return result;
}

export function regionNameToId(regionName: string): string | null {
  const lower = regionName.toLowerCase();
  for (const [prefix, id] of REGION_PREFIX_TO_ID) {
    if (lower.startsWith(prefix)) return id;
  }
  return null;
}

export function parseFormationRegions(regions: FormationRegion[]): {
  regionName: string;
  cities: string[];
  ecole?: Ecole;
}[] {
  return regions.map((entry) => ({
    regionName: entry.regionName,
    cities: entry.cities.map((c) => c.name),
    ecole: entry.ecole,
  }));
}

export function getBrandGradientStops(ecole: MapEcole) {
  const p = BRAND_PALETTES[ecole];
  return {
    start: p.gradientStart,
    mid: p.gradientMid,
    end: p.gradientEnd,
    hoverStart: p.hoverStart,
    hoverMid: p.hoverMid,
    hoverEnd: p.hoverEnd,
  };
}

export function resolveRegionMapEcole(
  regionEcole: Ecole | undefined,
  formationEcole: Ecole,
): MapEcole {
  const e = regionEcole ?? formationEcole;
  if (e === 'both') return 'both';
  return e;
}

interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function getPathBBox(path: string): BBox {
  const [minX, minY, maxX, maxY] = svgPathBbox(path);
  return { minX, minY, maxX, maxY };
}

function extendBBox(bbox: BBox, x: number, y: number, margin = 0): BBox {
  return {
    minX: Math.min(bbox.minX, x - margin),
    maxX: Math.max(bbox.maxX, x + margin),
    minY: Math.min(bbox.minY, y - margin),
    maxY: Math.max(bbox.maxY, y + margin),
  };
}

/** Ajuste le cadre au ratio 4/3 et centre le contenu */
function fitViewBox(bbox: BBox, aspectRatio = 4 / 3, padding = 28): string {
  let minX = bbox.minX - padding;
  let minY = bbox.minY - padding;
  let maxX = bbox.maxX + padding;
  let maxY = bbox.maxY + padding;

  let width = maxX - minX;
  let height = maxY - minY;
  const currentAspect = width / height;

  if (currentAspect > aspectRatio) {
    const newHeight = width / aspectRatio;
    const expand = (newHeight - height) / 2;
    minY -= expand;
    maxY += expand;
    height = newHeight;
  } else {
    const newWidth = height * aspectRatio;
    const expand = (newWidth - width) / 2;
    minX -= expand;
    maxX += expand;
    width = newWidth;
  }

  return `${minX} ${minY} ${width} ${height}`;
}

export function isIdfRegion(regionId: string): boolean {
  return regionId === 'idf';
}

export function getIdfDepartmentPaths(): { id: string; name: string; path: string }[] {
  return IDF_DEPARTMENT_IDS.map((id) => {
    const loc = franceDepartments.locations.find((l) => l.id === id);
    if (!loc) return null;
    return { id, name: loc.name, path: loc.path };
  }).filter((entry): entry is { id: string; name: string; path: string } => entry !== null);
}

function getIdfCombinedBBox(): BBox {
  let bbox: BBox = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };

  for (const { path } of getIdfDepartmentPaths()) {
    const part = getPathBBox(path);
    bbox = {
      minX: Math.min(bbox.minX, part.minX),
      minY: Math.min(bbox.minY, part.minY),
      maxX: Math.max(bbox.maxX, part.maxX),
      maxY: Math.max(bbox.maxY, part.maxY),
    };
  }

  return bbox;
}

export function getRegionZoomPaths(
  regionId: string,
): { id: string; path: string; isDepartment?: boolean }[] {
  if (isIdfRegion(regionId)) {
    return getIdfDepartmentPaths().map(({ id, path }) => ({
      id,
      path,
      isDepartment: true,
    }));
  }

  const path = getRegionPath(regionId);
  if (!path) return [];
  return [{ id: regionId, path }];
}

export function getRegionViewBox(
  regionId: string,
  cities: string[] = [],
  customPositions?: CityPositionsMap,
): string {
  let bbox: BBox | null = null;

  if (isIdfRegion(regionId)) {
    bbox = getIdfCombinedBBox();
  } else {
    const loc = franceMap.locations.find((l) => l.id === regionId);
    if (!loc) return franceMap.viewBox;
    bbox = getPathBBox(loc.path);
  }

  for (const city of cities) {
    const pos = getCityPosition(city, customPositions);
    if (pos) bbox = extendBBox(bbox, pos.x, pos.y, 36);
  }

  return fitViewBox(bbox);
}

export function buildRegionSlides(
  regions: FormationRegion[],
  options?: {
    formationId?: string;
    formationEcole?: Ecole;
    isNewRegion?: (regionName: string) => boolean;
    cityPositions?: CityPositionsMap;
  },
): RegionSlide[] {
  const slides: RegionSlide[] = [
    {
      type: 'overview',
      regionName: 'France',
      cities: [],
      viewBox: franceMap.viewBox,
    },
  ];

  for (const entry of regions) {
    const regionId = regionNameToId(entry.regionName);
    if (!regionId) continue;
    const cities = entry.cities.map((c) => c.name);
    const mapEcole = getRegionMapEcoleForFormation(
      options?.formationEcole ?? 'stade-formation',
      entry,
    );
    slides.push({
      type: 'region',
      regionId,
      regionName: entry.regionName,
      cities,
      viewBox: getRegionViewBox(regionId, cities, options?.cityPositions),
      isNew: options?.isNewRegion?.(entry.regionName) ?? false,
      ecole: mapEcole,
    });
  }

  return slides;
}

export function getRegionDisplayName(regionId: string): string {
  return franceMap.locations.find((l) => l.id === regionId)?.name ?? regionId;
}

export function getActiveRegionIds(regions: FormationRegion[]): Set<string> {
  const parsed = parseFormationRegions(regions);
  const ids = new Set<string>();
  for (const { regionName } of parsed) {
    const id = regionNameToId(regionName);
    if (id) ids.add(id);
  }
  return ids;
}

/** École affichée par région pour une formation (vue nationale) */
export function getFormationRegionEcoleMap(
  regions: FormationRegion[],
  formationEcole: Ecole = 'stade-formation',
): Map<string, MapEcole> {
  const map = new Map<string, MapEcole>();

  for (const entry of regions) {
    const regionId = regionNameToId(entry.regionName);
    if (!regionId) continue;
    map.set(regionId, getRegionMapEcoleForFormation(formationEcole, entry));
  }

  return map;
}

export function getRegionPath(regionId: string): string | undefined {
  return franceMap.locations.find((l) => l.id === regionId)?.path;
}
