import data from '@/data/formations.json';
import { parseFormationRegions, regionNameToId } from '@/lib/region-map';

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
  regions: string[];
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
}

export const formations: Formation[] = data as Formation[];

export function getFormationBySlug(slug: string): Formation | undefined {
  return formations.find((f) => f.id === slug);
}

export function getFormationsByRegion(regionName: string): Formation[] {
  const normalized = regionName.toLowerCase();
  return formations.filter((f) =>
    f.regions.some((r) => r.toLowerCase().startsWith(normalized))
  );
}

export function getRegionIdsWithFormations(formationsList: Formation[] = formations): Set<string> {
  const ids = new Set<string>();
  for (const f of formationsList) {
    for (const entry of f.regions) {
      const { regionName } = parseFormationRegions([entry])[0];
      const id = regionNameToId(regionName);
      if (id) ids.add(id);
    }
  }
  return ids;
}

export function getFormationsByRegionId(
  regionId: string,
  formationsList: Formation[] = formations,
): Formation[] {
  return formationsList.filter((f) =>
    f.regions.some((entry) => {
      const { regionName } = parseFormationRegions([entry])[0];
      return regionNameToId(regionName) === regionId;
    }),
  );
}

export function getCitiesForRegionId(
  regionId: string,
  formationsList: Formation[] = formations,
): string[] {
  const cities = new Set<string>();
  for (const f of formationsList) {
    for (const entry of f.regions) {
      const parsed = parseFormationRegions([entry])[0];
      if (regionNameToId(parsed.regionName) === regionId) {
        parsed.cities.forEach((c) => cities.add(c));
      }
    }
  }
  return Array.from(cities);
}

export function getFormationCitiesInRegionId(formation: Formation, regionId: string): string[] {
  const cities: string[] = [];
  for (const entry of formation.regions) {
    const parsed = parseFormationRegions([entry])[0];
    if (regionNameToId(parsed.regionName) === regionId) {
      cities.push(...parsed.cities);
    }
  }
  return cities;
}

export function isNewRegionForFormation(
  regionName: string,
  formationId: string,
  formationsList: Formation[] = formations,
): boolean {
  const regionId = regionNameToId(regionName);
  if (!regionId) return false;
  return !formationsList.some(
    (f) =>
      f.id !== formationId &&
      f.regions.some(
        (entry) => regionNameToId(parseFormationRegions([entry])[0].regionName) === regionId,
      ),
  );
}

export function getUniqueCertifications(): string[] {
  const certs = new Set(formations.map((f) => f.certification));
  return Array.from(certs);
}

export function getFormationLieux(regions: string[]): string[] {
  return regions.flatMap((region) => {
    const match = region.match(/\(([^)]+)\)/);
    if (match) {
      return match[1].split(',').map((l) => l.trim());
    }
    return [region.split('(')[0].trim()];
  });
}

export function isInscriptionOpen(formation: Formation): boolean {
  if (!formation.inscription_active) return false;
  if (!formation.date_cloture_inscription) return true;
  const parts = formation.date_cloture_inscription.split('/');
  if (parts.length !== 3) return true;
  const cloture = new Date(
    parseInt(parts[2]),
    parseInt(parts[1]) - 1,
    parseInt(parts[0])
  );
  return new Date() <= cloture;
}
