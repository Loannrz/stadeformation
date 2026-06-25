import Link from 'next/link';
import { ECOLE_LABELS, type Ecole } from '@/lib/brand';
import { Formation } from '@/lib/formations';
import styles from './FormationCard.module.scss';

interface Props {
  formation: Formation;
  compact?: boolean;
  lieux?: string[];
  ecole?: Ecole;
}

function ecoleClass(ecole: Ecole): string {
  if (ecole === 'sporformation') return styles.cardSpor;
  if (ecole === 'both') return styles.cardBoth;
  return styles.cardStade;
}

export default function FormationCard({ formation, compact, lieux, ecole }: Props) {
  const certShort = formation.certification.split('-')[0].trim();
  const brandEcole = ecole ?? formation.ecole;

  return (
    <div className={[styles.card, compact ? styles.cardCompact : '', ecoleClass(brandEcole)].join(' ')}>
      <div className={styles.cardBody}>
        <span className={styles.cert}>
          {certShort} - {ECOLE_LABELS[brandEcole]}
        </span>
        <h3 className={styles.name}>{formation.nom}</h3>

        {lieux && lieux.length > 0 && (
          <span className={styles.lieux}>{lieux.join(' · ')}</span>
        )}

        {formation.date_debut && (
          <span className={styles.dates}>
            🗓 Début {formation.date_debut}
          </span>
        )}

        {!formation.date_debut && formation.dates_inscription && (
          <span className={styles.dates}>
            📅 {formation.dates_inscription}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        <Link href={`/formation/${formation.id}`} className={styles.info}>
          Plus d&apos;infos
        </Link>
        <a
          href={formation.url_inscription}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
          aria-label={`S'inscrire à ${formation.nom}`}
        >
          S&apos;inscrire →
        </a>
      </div>
    </div>
  );
}
