'use client';

import { useMemo } from 'react';
import franceMap from '@svg-maps/france.regions';
import styles from './MiniCarte.module.scss';

const REGION_PREFIXES: Record<string, string[]> = {
  naq: ['nouvelle-aquitaine'],
  idf: ['île-de-france', 'ile-de-france'],
  cor: ['corse'],
  nor: ['normandie'],
  pac: ['paca', 'provence'],
  occ: ['occitanie'],
  ara: ['auvergne-rhône-alpes', 'auvergne-rhone-alpes'],
  bfc: ['bourgogne-franche-comté', 'bourgogne-franche-comte'],
  bre: ['bretagne'],
  cvl: ['centre-val de loire', 'centre-val-de-loire'],
  ges: ['grand est'],
  hdf: ['hauts-de-france'],
  pdl: ['pays de la loire'],
};

interface Props {
  regions: string[];
}

export default function MiniCarte({ regions }: Props) {
  const activeIds = useMemo(() => {
    const lowerRegions = regions.map((r) => r.toLowerCase());
    return new Set(
      Object.entries(REGION_PREFIXES)
        .filter(([, prefixes]) =>
          lowerRegions.some((r) => prefixes.some((p) => r.startsWith(p)))
        )
        .map(([id]) => id)
    );
  }, [regions]);

  return (
    <div className={styles.wrap}>
      <svg
        viewBox={franceMap.viewBox}
        className={styles.svg}
        role="img"
        aria-label="Localisation de la formation"
      >
        {franceMap.locations.map((loc) => (
          <path
            key={loc.id}
            d={loc.path}
            className={activeIds.has(loc.id) ? styles.active : styles.inactive}
          />
        ))}
      </svg>
    </div>
  );
}
