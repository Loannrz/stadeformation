import type { Ecole } from '@/lib/brand';
import {
  getPublicFormations,
  resolveFormationEcoleInRegionId,
} from '@/lib/formations';
import { getRegionDisplayName, regionNameToId } from '@/lib/region-map';

export interface ChatFormationRegion {
  regionId: string;
  ecole: Ecole;
}

/** Représentation légère et sérialisable d'une formation pour l'assistant client. */
export interface ChatFormation {
  id: string;
  nom: string;
  certification: string;
  description: string;
  motsCles: string[];
  regions: ChatFormationRegion[];
}

/**
 * Construit l'index utilisé par la bulle de chat à partir des formations publiques.
 * Calculé côté serveur puis transmis au composant client (aucune donnée sensible).
 */
export function getChatFormationIndex(): ChatFormation[] {
  return getPublicFormations().map((formation) => {
    const seen = new Set<string>();
    const regions: ChatFormationRegion[] = [];

    for (const entry of formation.regions) {
      const regionId = regionNameToId(entry.regionName);
      if (!regionId || seen.has(regionId)) continue;
      seen.add(regionId);
      regions.push({
        regionId,
        ecole: resolveFormationEcoleInRegionId(formation, regionId),
      });
    }

    return {
      id: formation.id,
      nom: formation.nom,
      certification: formation.certification,
      description: formation.description,
      motsCles: formation.motsCles ?? [],
      regions,
    };
  });
}

export interface ChatRegion {
  id: string;
  name: string;
}

/** Régions métropolitaines (+ Corse) proposées en boutons dans l'assistant. */
const METRO_REGION_IDS = [
  'ara', 'bfc', 'bre', 'cvl', 'cor', 'ges', 'hdf',
  'idf', 'nor', 'naq', 'occ', 'pdl', 'pac',
];

export function getChatRegions(): ChatRegion[] {
  return METRO_REGION_IDS.map((id) => ({ id, name: getRegionDisplayName(id) })).sort(
    (a, b) => a.name.localeCompare(b.name, 'fr'),
  );
}
