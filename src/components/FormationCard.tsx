import Link from 'next/link';
import { Formation } from '@/lib/formations';
import styles from './FormationCard.module.scss';

interface Props {
  formation: Formation;
  compact?: boolean;
}

export default function FormationCard({ formation, compact }: Props) {
  void compact;
  return (
    <div className={styles.card}>
      <span className={styles.cert}>{formation.certification.split('—')[0].trim()}</span>
      <h3 className={styles.name}>{formation.nom}</h3>

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

      <div className={styles.actions}>
        <Link href={`/formation/${formation.id}`} className={styles.info}>
          Plus d'infos
        </Link>
        <a
          href={formation.url_inscription}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
          aria-label={`S'inscrire à ${formation.nom}`}
        >
          S'inscrire →
        </a>
      </div>
    </div>
  );
}
