import type { Ecole } from '@/lib/brand';
import type { ChatFormation } from '@/lib/chat-index';

const STOP_WORDS = new Set([
  'les', 'des', 'une', 'aux', 'avec', 'pour', 'dans', 'sur', 'par', 'pas',
  'mais', 'plus', 'tout', 'tous', 'tres', 'mes', 'mon', 'ent', 'que', 'qui',
  'quoi', 'donc', 'comme', 'fait', 'faire', 'veux', 'voudrais', 'aimerais',
  'souhaite', 'cherche', 'recherche', 'envie', 'aime', 'bien', 'etre',
  'avoir', 'cela', 'celui', 'leur', 'nous', 'vous', 'ils', 'elle', 'elles',
  'son', 'ses', 'est', 'suis', 'serait', 'metier', 'travail', 'travailler',
  'domaine', 'secteur', 'formation', 'formations', 'etudes', 'etudier',
  'apprendre', 'devenir', 'sais', 'sait', 'peut', 'pourrais',
]);

/** Minuscules + suppression des accents. */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

export interface MatchResult {
  formation: ChatFormation;
  regionId: string;
  ecole: Ecole;
  score: number;
}

const KEYWORD_WEIGHT = 3;
const TEXT_WEIGHT = 1;

/**
 * Renvoie les formations de la région choisie correspondant à la description,
 * triées par pertinence décroissante. Les mots-clés admin pèsent plus lourd
 * que le nom / la description / la certification.
 */
export function matchFormations(
  text: string,
  regionId: string,
  index: ChatFormation[],
): MatchResult[] {
  const tokens = Array.from(new Set(tokenize(text)));
  if (tokens.length === 0) return [];

  const normText = normalizeText(text);
  const results: MatchResult[] = [];

  for (const formation of index) {
    const region = formation.regions.find((r) => r.regionId === regionId);
    if (!region) continue;

    const keywordText = normalizeText(formation.motsCles.join(' '));
    const otherText = normalizeText(
      [formation.nom, formation.description, formation.certification].join(' '),
    );

    let score = 0;
    for (const token of tokens) {
      if (keywordText.includes(token)) score += KEYWORD_WEIGHT;
      if (otherText.includes(token)) score += TEXT_WEIGHT;
    }

    // Mots-clés composés (ex. "salle de sport", "coach sportif") présents tels quels.
    for (const keyword of formation.motsCles) {
      const normalizedKeyword = normalizeText(keyword);
      if (normalizedKeyword.includes(' ') && normText.includes(normalizedKeyword)) {
        score += KEYWORD_WEIGHT;
      }
    }

    if (score > 0) {
      results.push({ formation, regionId, ecole: region.ecole, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

/**
 * École à contacter en repli pour une région : celle qui gère le plus de
 * formations dans cette région.
 * - renvoie `null` si aucune formation n'existe dans la région (afficher les deux écoles).
 * - renvoie `'both'` en cas d'égalité parfaite.
 */
export function getRegionFallbackSchool(
  regionId: string,
  index: ChatFormation[],
): Ecole | null {
  let stade = 0;
  let spor = 0;
  let total = 0;

  for (const formation of index) {
    const region = formation.regions.find((r) => r.regionId === regionId);
    if (!region) continue;
    total += 1;

    if (region.ecole === 'both') {
      stade += 1;
      spor += 1;
    } else if (region.ecole === 'sporformation') {
      spor += 1;
    } else {
      stade += 1;
    }
  }

  if (total === 0) return null;
  if (stade > spor) return 'stade-formation';
  if (spor > stade) return 'sporformation';
  return 'both';
}
