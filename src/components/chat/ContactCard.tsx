import { BRAND_PALETTES, type Ecole } from '@/lib/brand';
import { SPOR_CONTACT, STADE_CONTACT, type SchoolContact } from '@/lib/site';
import styles from './ChatWidget.module.scss';

interface Props {
  /** École dominante de la région (null = aucune formation : on affiche les deux). */
  school: Ecole | null;
}

function contactBlock(contact: SchoolContact, ecole: Exclude<Ecole, 'both'>) {
  const palette = BRAND_PALETTES[ecole];
  return (
    <div
      key={contact.name}
      className={styles.contactBlock}
      style={{ borderLeftColor: palette.primary }}
    >
      <strong className={styles.contactName} style={{ color: palette.primary }}>
        {contact.name}
      </strong>
      <a className={styles.contactRow} href={contact.phoneHref}>
        📞 {contact.phone}
      </a>
      {contact.mobile && (
        <a className={styles.contactRow} href={`tel:${contact.mobile.replace(/\s+/g, '')}`}>
          📱 {contact.mobile}
        </a>
      )}
      <a className={styles.contactRow} href={`mailto:${contact.email}`}>
        ✉️ {contact.email}
      </a>
      <span className={styles.contactRow}>📍 {contact.address}</span>
      <a
        className={styles.contactRow}
        href={contact.website}
        target="_blank"
        rel="noopener noreferrer"
      >
        🌐 {contact.website.replace(/^https?:\/\//, '')}
      </a>
    </div>
  );
}

export default function ContactCard({ school }: Props) {
  const showStade = school === 'stade-formation' || school === 'both' || school === null;
  const showSpor = school === 'sporformation' || school === 'both' || school === null;

  return (
    <div className={styles.contactCard}>
      {showStade && contactBlock(STADE_CONTACT, 'stade-formation')}
      {showSpor && contactBlock(SPOR_CONTACT, 'sporformation')}
    </div>
  );
}
