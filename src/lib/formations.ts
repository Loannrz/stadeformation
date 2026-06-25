import type { Ecole, MapEcole, SchoolFilter } from '@/lib/brand';
import { formationMatchesFilter, mergeMapEcoles } from '@/lib/brand';
import data from '@/data/formations.json';
import { getRegionDisplayName, regionNameToId } from '@/lib/region-map';

export interface FormationCity {
  name: string;
  ecole?: Ecole;
}

export interface FormationRegion {
  regionName: string;
  ecole?: Ecole;
  cities: FormationCity[];
}

export interface BlockItem {
  id: string;
  label?: string;
  value: string;
  sub?: string;
}

export interface FormationBlock {
  id: string;
  type: 'list' | 'text' | 'steps';
  title: string;
  color: string;
  items: BlockItem[];
}

export interface Formation {
  id: string;
  nom: string;
  certification: string;
  ecole: Ecole;
  regions: FormationRegion[];
  dates_inscription: string | null;
  date_limite_inscription: string | null;
  date_debut: string | null;
  duree: string;
  rythme: string;
  prerequis: string[];
  url_inscription: string;
  description: string;
  inscription_active: boolean;
  date_cloture_inscription: string | null;
  highlights: string[];
  blocks: FormationBlock[];
  /** false = masquée du site public (visible uniquement en admin) */
  visible: boolean;
}

export interface ParsedRegion {
  regionName: string;
  cities: string[];
  ecole?: Ecole;
}

function parseLegacyRegionString(entry: string): FormationRegion {
  const match = entry.match(/^(.+?)\s*\(([^)]+)\)$/);
  if (match) {
    return {
      regionName: match[1].trim(),
      cities: match[2].split(',').map((c) => ({ name: c.trim() })),
    };
  }
  return { regionName: entry.trim(), cities: [] };
}

export function normalizeFormation(raw: Record<string, unknown>): Formation {
  const ecole = (raw.ecole as Ecole) || 'stade-formation';
  let regions: FormationRegion[];

  const rawRegions = raw.regions as unknown[];
  if (rawRegions?.length && typeof rawRegions[0] === 'string') {
    regions = (rawRegions as string[]).map(parseLegacyRegionString);
  } else {
    regions = (rawRegions as FormationRegion[]) ?? [];
  }

  return {
    ...(raw as Omit<Formation, 'ecole' | 'regions' | 'visible'>),
    ecole,
    regions,
    visible: typeof raw.visible === 'boolean' ? raw.visible : true,
  };
}

export const formations: Formation[] = (data as Record<string, unknown>[]).map(normalizeFormation);

export function isFormationPubliclyVisible(formation: Formation): boolean {
  return formation.visible;
}

export function getPublicFormations(): Formation[] {
  return formations.filter(isFormationPubliclyVisible);
}

export function resolveEcole(
  formation: Formation,
  regionName?: string,
  cityName?: string,
): Ecole {
  if (cityName && regionName) {
    const region = formation.regions.find((r) => r.regionName === regionName);
    const city = region?.cities.find((c) => c.name === cityName);
    if (city?.ecole) return city.ecole;
    if (region?.ecole) return region.ecole;
  }
  if (regionName) {
    const region = formation.regions.find((r) => r.regionName === regionName);
    if (region?.ecole) return region.ecole;
  }
  return formation.ecole;
}

export function resolveEntryEcole(formation: Formation, entry: FormationRegion): Ecole {
  return entry.ecole ?? formation.ecole;
}

export function resolveCityEcole(
  formation: Formation,
  entry: FormationRegion,
  city: FormationCity,
): Ecole {
  return city.ecole ?? entry.ecole ?? formation.ecole;
}

/** Couleur carte pour une région d'une formation (prend en compte les écoles par ville). */
export function getRegionMapEcoleForFormation(
  formationEcole: Ecole,
  entry: FormationRegion,
): MapEcole {
  const ecoles: Ecole[] = [];

  if (entry.cities.length > 0) {
    for (const city of entry.cities) {
      ecoles.push(city.ecole ?? entry.ecole ?? formationEcole);
    }
  } else {
    ecoles.push(entry.ecole ?? formationEcole);
  }

  return mergeMapEcoles(ecoles);
}

/** École(s) à afficher dans la navbar d'une fiche formation (selon régions/villes). */
export function getFormationNavbarEcole(formation: Formation): MapEcole {
  const ecoles: Ecole[] = [formation.ecole];

  for (const region of formation.regions) {
    ecoles.push(resolveEntryEcole(formation, region));
    for (const city of region.cities) {
      ecoles.push(resolveCityEcole(formation, region, city));
    }
  }

  return mergeMapEcoles(ecoles);
}

export function regionEntryMatchesFilter(
  formation: Formation,
  entry: FormationRegion,
  filter: SchoolFilter,
): boolean {
  if (filter === 'both') return true;
  return formationMatchesFilter(resolveEntryEcole(formation, entry), filter);
}

export function cityMatchesFilter(
  formation: Formation,
  entry: FormationRegion,
  city: FormationCity,
  filter: SchoolFilter,
): boolean {
  if (filter === 'both') return true;
  return formationMatchesFilter(resolveCityEcole(formation, entry, city), filter);
}

export function filterBySchoolFilter(
  formationsList: Formation[],
  filter: SchoolFilter,
): Formation[] {
  if (filter === 'both') return formationsList;
  return formationsList.filter((f) =>
    f.regions.some((entry) => regionEntryMatchesFilter(f, entry, filter)),
  );
}

export function getFormationBySlug(slug: string): Formation | undefined {
  return formations.find((f) => f.id === slug);
}

export function getFormationsByRegion(regionName: string): Formation[] {
  const normalized = regionName.toLowerCase();
  return getPublicFormations().filter((f) =>
    f.regions.some((r) => r.regionName.toLowerCase().startsWith(normalized)),
  );
}

export function getRegionIdsWithFormations(
  formationsList: Formation[] = formations,
  filter: SchoolFilter = 'both',
): Set<string> {
  const ids = new Set<string>();
  for (const f of formationsList) {
    for (const entry of f.regions) {
      if (!regionEntryMatchesFilter(f, entry, filter)) continue;
      const id = regionNameToId(entry.regionName);
      if (id) ids.add(id);
    }
  }
  return ids;
}

export function getFormationsByRegionId(
  regionId: string,
  formationsList: Formation[] = formations,
  filter: SchoolFilter = 'both',
): Formation[] {
  return formationsList.filter((f) =>
    f.regions.some(
      (entry) =>
        regionNameToId(entry.regionName) === regionId &&
        regionEntryMatchesFilter(f, entry, filter),
    ),
  );
}

export function getCitiesForRegionId(
  regionId: string,
  formationsList: Formation[] = formations,
  filter: SchoolFilter = 'both',
): string[] {
  const cities = new Set<string>();
  for (const f of formationsList) {
    for (const entry of f.regions) {
      if (regionNameToId(entry.regionName) !== regionId) continue;
      if (!regionEntryMatchesFilter(f, entry, filter)) continue;

      if (entry.cities.length === 0) continue;

      for (const city of entry.cities) {
        if (cityMatchesFilter(f, entry, city, filter)) {
          cities.add(city.name);
        }
      }
    }
  }
  return Array.from(cities);
}

export function getFormationCitiesInRegionId(
  formation: Formation,
  regionId: string,
  filter: SchoolFilter = 'both',
): string[] {
  const cities: string[] = [];
  for (const entry of formation.regions) {
    if (regionNameToId(entry.regionName) !== regionId) continue;
    if (!regionEntryMatchesFilter(formation, entry, filter)) continue;

    if (entry.cities.length === 0) continue;

    for (const city of entry.cities) {
      if (cityMatchesFilter(formation, entry, city, filter)) {
        cities.push(city.name);
      }
    }
  }
  return cities;
}

export function getRegionMapEcole(
  regionId: string,
  formationsList: Formation[] = formations,
  filter: SchoolFilter = 'both',
): MapEcole {
  const ecoles: Ecole[] = [];

  for (const f of formationsList) {
    for (const entry of f.regions) {
      if (regionNameToId(entry.regionName) !== regionId) continue;
      if (!regionEntryMatchesFilter(f, entry, filter)) continue;

      if (entry.cities.length > 0) {
        for (const city of entry.cities) {
          if (cityMatchesFilter(f, entry, city, filter)) {
            ecoles.push(resolveCityEcole(f, entry, city));
          }
        }
      } else {
        ecoles.push(resolveEntryEcole(f, entry));
      }
    }
  }

  return mergeMapEcoles(ecoles);
}

export function isNewRegionForFormation(
  regionName: string,
  formationId: string,
  formationsList: Formation[] = getPublicFormations(),
): boolean {
  const regionId = regionNameToId(regionName);
  if (!regionId) return false;
  return !formationsList.some(
    (f) =>
      f.id !== formationId &&
      f.visible &&
      f.regions.some((entry) => regionNameToId(entry.regionName) === regionId),
  );
}

export function getUniqueCertifications(): string[] {
  const certs = new Set(formations.map((f) => f.certification));
  return Array.from(certs);
}

export function getFormationLieux(regions: FormationRegion[]): string[] {
  return regions.flatMap((region) => {
    if (region.cities.length > 0) {
      return region.cities.map((c) => c.name);
    }
    return [region.regionName];
  });
}

/** Noms de villes déjà utilisés pour une région (toutes formations confondues). */
export function getKnownCityNamesForRegion(regionName: string): string[] {
  const cities = new Set<string>();
  for (const formation of formations) {
    for (const region of formation.regions) {
      if (region.regionName === regionName) {
        for (const city of region.cities) {
          if (city.name.trim()) cities.add(city.name.trim());
        }
      }
    }
  }
  return Array.from(cities).sort((a, b) => a.localeCompare(b, 'fr'));
}

export function isInscriptionOpen(formation: Formation): boolean {
  if (!formation.inscription_active) return false;
  if (!formation.date_cloture_inscription) return true;
  const parts = formation.date_cloture_inscription.split('/');
  if (parts.length !== 3) return true;
  const cloture = new Date(
    parseInt(parts[2]),
    parseInt(parts[1]) - 1,
    parseInt(parts[0]),
  );
  return new Date() <= cloture;
}

export function regionsToLegacyStrings(regions: FormationRegion[]): string[] {
  return regions.map((r) => {
    if (r.cities.length === 0) return r.regionName;
    const cities = r.cities.map((c) => c.name).join(', ');
    return `${r.regionName} (${cities})`;
  });
}

export function getSchoolOperatingRegions(
  school: 'stade-formation' | 'sporformation',
  formationsList: Formation[] = formations,
): string[] {
  const regions = new Set<string>();

  for (const formation of formationsList) {
    for (const entry of formation.regions) {
      const ecole = entry.ecole ?? formation.ecole;
      if (ecole === school || ecole === 'both') {
        regions.add(entry.regionName);
      }
    }
  }

  return Array.from(regions).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
}

export function formatRegionDisplayName(regionName: string): string {
  const regionId = regionNameToId(regionName);
  return regionId ? getRegionDisplayName(regionId) : regionName;
}

export function formatFrenchRegionList(regions: string[]): string {
  if (regions.length === 0) return '';
  if (regions.length === 1) return regions[0];
  if (regions.length === 2) return `${regions[0]} et ${regions[1]}`;
  return `${regions.slice(0, -1).join(', ')} et ${regions[regions.length - 1]}`;
}

export function buildSchoolTagline(
  base: string,
  school: 'stade-formation' | 'sporformation',
  formationsList: Formation[] = formations,
): string {
  const regions = getSchoolOperatingRegions(school, formationsList).map(formatRegionDisplayName);
  if (regions.length === 0) return base;
  return `${base} en ${formatFrenchRegionList(regions)}`;
}
