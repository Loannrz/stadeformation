import data from '@/data/formations.json';

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

export function getUniqueCertifications(): string[] {
  const certs = new Set(formations.map((f) => f.certification));
  return Array.from(certs);
}

/** Extrait les villes / lieux depuis les chaînes région du type "Île-de-France (Nanterre, Cergy)" */
export function getFormationLieux(regions: string[]): string[] {
  return regions.flatMap((region) => {
    const match = region.match(/\(([^)]+)\)/);
    if (match) {
      return match[1].split(',').map((l) => l.trim());
    }
    return [region.split('(')[0].trim()];
  });
}
