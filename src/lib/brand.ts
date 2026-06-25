export type Ecole = 'stade-formation' | 'sporformation' | 'both';

export type SchoolFilter = Ecole;

export const SCHOOL_FILTER_STORAGE_KEY = 'sf-school-filter';

export type MapEcole = 'stade-formation' | 'sporformation' | 'both';

export interface BrandPalette {
  primary: string;
  secondary: string;
  accent: string;
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
  hoverStart: string;
  hoverMid: string;
  hoverEnd: string;
}

export const BRAND_PALETTES: Record<MapEcole, BrandPalette> = {
  'stade-formation': {
    primary: '#FF6B00',
    secondary: '#E85D00',
    accent: '#FFD700',
    gradientStart: '#E65C23',
    gradientMid: '#FF6B00',
    gradientEnd: '#FFD700',
    hoverStart: '#F58220',
    hoverMid: '#FF8C00',
    hoverEnd: '#FFDB15',
  },
  sporformation: {
    primary: '#DC2626',
    secondary: '#B91C1C',
    accent: '#FB7185',
    gradientStart: '#B91C1C',
    gradientMid: '#DC2626',
    gradientEnd: '#FB7185',
    hoverStart: '#C92A2A',
    hoverMid: '#EF4444',
    hoverEnd: '#FCA5A5',
  },
  both: {
    primary: '#FF6B00',
    secondary: '#DC2626',
    accent: '#FB7185',
    gradientStart: '#FF6B00',
    gradientMid: '#E85D00',
    gradientEnd: '#DC2626',
    hoverStart: '#F58220',
    hoverMid: '#EF4444',
    hoverEnd: '#FB7185',
  },
};

export const ECOLE_LABELS: Record<Ecole, string> = {
  'stade-formation': 'Stade Formation',
  sporformation: 'SporFormation',
  both: 'Les deux écoles',
};

export function applySchoolFilter(filter: SchoolFilter) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-brand', filter);
  localStorage.setItem(SCHOOL_FILTER_STORAGE_KEY, filter);
}

export function getStoredSchoolFilter(): SchoolFilter {
  if (typeof window === 'undefined') return 'both';
  try {
    const stored = localStorage.getItem(SCHOOL_FILTER_STORAGE_KEY);
    if (stored === 'stade-formation' || stored === 'sporformation' || stored === 'both') {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return 'both';
}

export function formationMatchesFilter(ecole: Ecole, filter: SchoolFilter): boolean {
  if (filter === 'both') return true;
  if (ecole === 'both') return true;
  return ecole === filter;
}

export function mergeMapEcoles(ecoles: Ecole[]): MapEcole {
  const set = new Set(ecoles.filter((e) => e !== 'both'));
  if (set.has('stade-formation') && set.has('sporformation')) return 'both';
  if (set.has('sporformation')) return 'sporformation';
  if (set.has('stade-formation')) return 'stade-formation';
  if (ecoles.includes('both')) return 'both';
  return 'stade-formation';
}
