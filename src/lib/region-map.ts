import franceMap from '@svg-maps/france.regions';
import { svgPathBbox } from 'svg-path-bbox';

export interface RegionSlide {
  type: 'overview' | 'region';
  regionId?: string;
  regionName: string;
  cities: string[];
  viewBox: string;
  isNew?: boolean;
}

export interface CityPin {
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  textAnchor: 'start' | 'middle' | 'end';
}

/** Positions géographiques (coords SVG carte France, viewBox 15 -1 598 586) */
const CITY_POSITIONS: Record<string, { x: number; y: number }> = {
  bordeaux: { x: 198, y: 395 },
  'pont-du-casse': { x: 215, y: 418 },
  agen: { x: 218, y: 422 },
  // Île-de-France - coordonnées réajustées
  cergy: { x: 288, y: 128 },
  courbevoie: { x: 296, y: 156 },
  drancy: { x: 348, y: 140 },
  nanterre: { x: 290, y: 166 },
  'paris 7': { x: 318, y: 160 },
  'paris 7ème': { x: 318, y: 160 },
  arpajon: { x: 322, y: 182 },
  égly: { x: 326, y: 184 },
  ajaccio: { x: 577, y: 553 },
  // Orne, sud-est de la Normandie (Perche)
  'mortagne-au-perche': { x: 252, y: 172 },
  toulon: { x: 448, y: 468 },
  dax: { x: 168, y: 408 },
};

/** Placement préféré des libellés (évite les chevauchements en IDF) */
const CITY_LABEL_PRESETS: Record<
  string,
  Pick<CityPin, 'labelX' | 'labelY' | 'textAnchor'>
> = {
  cergy: { labelX: -7, labelY: -6, textAnchor: 'end' },
  courbevoie: { labelX: -7, labelY: 0, textAnchor: 'end' },
  nanterre: { labelX: -7, labelY: 8, textAnchor: 'end' },
  'paris 7': { labelX: 7, labelY: -4, textAnchor: 'start' },
  'paris 7ème': { labelX: 7, labelY: -4, textAnchor: 'start' },
  drancy: { labelX: 7, labelY: -6, textAnchor: 'start' },
  arpajon: { labelX: 0, labelY: 10, textAnchor: 'middle' },
  égly: { labelX: 0, labelY: 10, textAnchor: 'middle' },
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

function resolveCityKey(city: string): string | null {
  const raw = normalizeCityKey(city);
  if (CITY_POSITIONS[raw]) return raw;

  const aliases: [string, string][] = [
    ['paris', 'paris 7ème'],
    ['egly', 'égly'],
    ['pont-du-casse/agen', 'agen'],
    ['arpajon/égly', 'arpajon'],
    ['arpajon/egly', 'arpajon'],
    ['mortagne', 'mortagne-au-perche'],
  ];

  for (const [needle, key] of aliases) {
    if (raw.includes(needle) && CITY_POSITIONS[key]) return key;
  }

  for (const key of Object.keys(CITY_POSITIONS)) {
    if (raw.includes(key) || key.includes(raw)) return key;
  }

  return null;
}

export function getCityPosition(city: string): { x: number; y: number } | null {
  const key = resolveCityKey(city);
  return key ? CITY_POSITIONS[key] : null;
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

function buildCityPin(city: string, label: Pick<CityPin, 'labelX' | 'labelY' | 'textAnchor'>): CityPin | null {
  const key = resolveCityKey(city);
  if (!key) return null;
  const pos = CITY_POSITIONS[key];
  return { x: pos.x, y: pos.y, ...label };
}

export interface PlacedCityPin {
  city: string;
  pin: CityPin;
}

function getRegionCenter(regionId: string): { x: number; y: number } {
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
export function layoutCityPins(cities: string[], regionId?: string): PlacedCityPin[] {
  const placed: { pin: CityPin; label: string; box: ReturnType<typeof estimateLabelBox> }[] = [];
  const result: PlacedCityPin[] = [];
  let fallbackIndex = 0;

  for (const city of cities) {
    const key = resolveCityKey(city);
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
      const pin = buildCityPin(city, candidate);
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

export function parseFormationRegions(regions: string[]): { regionName: string; cities: string[] }[] {
  return regions.map((entry) => {
    const match = entry.match(/^(.+?)\s*\(([^)]+)\)$/);
    if (match) {
      return {
        regionName: match[1].trim(),
        cities: match[2].split(',').map((c) => c.trim()),
      };
    }
    return { regionName: entry.trim(), cities: [] };
  });
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

export function getRegionViewBox(regionId: string, cities: string[] = []): string {
  const loc = franceMap.locations.find((l) => l.id === regionId);
  if (!loc) return franceMap.viewBox;

  let bbox = getPathBBox(loc.path);

  for (const city of cities) {
    const pos = getCityPosition(city);
    if (pos) bbox = extendBBox(bbox, pos.x, pos.y, 36);
  }

  return fitViewBox(bbox);
}

export function buildRegionSlides(
  regions: string[],
  options?: { formationId?: string; isNewRegion?: (regionName: string) => boolean },
): RegionSlide[] {
  const parsed = parseFormationRegions(regions);
  const slides: RegionSlide[] = [
    {
      type: 'overview',
      regionName: 'France',
      cities: [],
      viewBox: franceMap.viewBox,
    },
  ];

  for (const { regionName, cities } of parsed) {
    const regionId = regionNameToId(regionName);
    if (!regionId) continue;
    slides.push({
      type: 'region',
      regionId,
      regionName,
      cities,
      viewBox: getRegionViewBox(regionId, cities),
      isNew: options?.isNewRegion?.(regionName) ?? false,
    });
  }

  return slides;
}

export function getRegionDisplayName(regionId: string): string {
  return franceMap.locations.find((l) => l.id === regionId)?.name ?? regionId;
}

export function getActiveRegionIds(regions: string[]): Set<string> {
  const parsed = parseFormationRegions(regions);
  const ids = new Set<string>();
  for (const { regionName } of parsed) {
    const id = regionNameToId(regionName);
    if (id) ids.add(id);
  }
  return ids;
}

export function getRegionPath(regionId: string): string | undefined {
  return franceMap.locations.find((l) => l.id === regionId)?.path;
}
