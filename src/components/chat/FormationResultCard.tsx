import Link from 'next/link';
import { BRAND_PALETTES, ECOLE_LABELS, type Ecole } from '@/lib/brand';
import type { ChatResultItem } from './chat-types';
import styles from './ChatWidget.module.scss';

interface Props {
  item: ChatResultItem;
  onNavigate?: () => void;
}

function gradientFor(ecole: Ecole): string {
  const p = BRAND_PALETTES[ecole];
  return `linear-gradient(135deg, ${p.gradientStart}, ${p.gradientMid}, ${p.gradientEnd})`;
}

export default function FormationResultCard({ item, onNavigate }: Props) {
  const palette = BRAND_PALETTES[item.ecole];
  return (
    <Link
      href={`/formation/${item.id}`}
      className={styles.resultCard}
      onClick={onNavigate}
      style={{ borderLeftColor: palette.primary }}
    >
      <span
        className={styles.resultBadge}
        style={{ background: gradientFor(item.ecole) }}
      >
        {ECOLE_LABELS[item.ecole]}
      </span>
      <span className={styles.resultName}>{item.nom}</span>
      <span className={styles.resultCert}>{item.certification}</span>
      <span className={styles.resultCta} style={{ color: palette.primary }}>
        Voir la formation →
      </span>
    </Link>
  );
}
