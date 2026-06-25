import cityPositionsData from '@/data/city-positions.json';
import { formations } from '@/lib/formations';
import { regionNameToId } from '@/lib/region-map';

export interface CityPosition {
  x: number;
  y: number;
  labelX?: number;
  labelY?: number;
  textAnchor?: 'start' | 'middle' | 'end';
}

export type CityPositionsMap = Record<string, CityPosition>;

export function normalizeCityKey(city: string): string {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function resolveCityStorageKey(city: string, map: CityPositionsMap): string | null {
  const raw = normalizeCityKey(city);
  if (map[raw]) return raw;

  const aliases: [string, string][] = [
    ['paris', 'paris 7ème'],
    ['egly', 'égly'],
    ['pont-du-casse/agen', 'agen'],
    ['arpajon/égly', 'arpajon'],
    ['arpajon/egly', 'arpajon'],
    ['mortagne', 'mortagne-au-perche'],
  ];

  for (const [needle, key] of aliases) {
    if (raw.includes(needle) && map[key]) return key;
  }

  for (const key of Object.keys(map)) {
    if (raw.includes(key) || key.includes(raw)) return key;
  }

  return null;
}

export function hasCityPosition(city: string, map: CityPositionsMap): boolean {
  return resolveCityStorageKey(city, map) !== null;
}

export function getCityPositionFromMap(
  city: string,
  map: CityPositionsMap,
): { x: number; y: number } | null {
  const key = resolveCityStorageKey(city, map);
  if (!key || !map[key]) return null;
  return { x: map[key].x, y: map[key].y };
}

export function getStaticCityPositions(): CityPositionsMap {
  return { ...(cityPositionsData as CityPositionsMap) };
}

export function getAllCityNamesInRegion(regionName: string): string[] {
  const names = new Set<string>();
  for (const formation of formations) {
    for (const region of formation.regions) {
      if (region.regionName === regionName) {
        for (const city of region.cities) {
          if (city.name.trim()) names.add(city.name.trim());
        }
      }
    }
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b, 'fr'));
}

export function getAllRegionsWithCities(): { regionName: string; regionId: string; cities: string[] }[] {
  const byRegion = new Map<string, Set<string>>();

  for (const formation of formations) {
    for (const region of formation.regions) {
      const regionId = regionNameToId(region.regionName);
      if (!regionId) continue;
      const set = byRegion.get(region.regionName) ?? new Set<string>();
      for (const city of region.cities) {
        if (city.name.trim()) set.add(city.name.trim());
      }
      byRegion.set(region.regionName, set);
    }
  }

  return Array.from(byRegion.entries())
    .map(([regionName, cities]) => ({
      regionName,
      regionId: regionNameToId(regionName)!,
      cities: Array.from(cities).sort((a, b) => a.localeCompare(b, 'fr')),
    }))
    .sort((a, b) => a.regionName.localeCompare(b.regionName, 'fr'));
}

export function cityNameToStorageKey(city: string): string {
  return normalizeCityKey(city);
}
