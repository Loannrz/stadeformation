'use client';

import type { SchoolContact } from '@/lib/site';
import { SPOR_CONTACT, STADE_CONTACT } from '@/lib/site';
import { useSchoolFilter } from './SchoolFilterProvider';
import styles from './ContactSection.module.scss';

type SchoolBrand = 'stade' | 'spor';

function getContactTagline(contact: SchoolContact): string {
  return contact.tagline;
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 10.8a11.4 11.4 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.3 21 3 13.7 3 5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3a9 9 0 00-7.8 13.5L3 21l4.6-1.2A9 9 0 1012 3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 9.8c.2-.5.5-.5.8-.5h.7c.2 0 .4 0 .6.4l.8 1.9c.1.2.1.4 0 .6l-.5.6c-.1.2-.1.3 0 .5.4.7 1.1 1.4 1.9 1.9.2.1.3.1.5 0l.6-.5c.2-.1.4-.1.6 0l1.9.8c.4.2.4.4.4.6v.7c0 .3 0 .6-.5.8-.8.4-1.7.2-2.8-.5-1.5-1-2.7-2.3-3.7-3.7-.7-1.1-.9-2-.5-2.8z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SchoolContactCard({
  contact,
  brand,
}: {
  contact: SchoolContact;
  brand: SchoolBrand;
}) {
  const brandClass = brand === 'stade' ? styles.cardStade : styles.cardSpor;

  return (
    <article className={`${styles.card} ${brandClass}`}>
      <div className={styles.cardTop}>
        <p className={styles.cardEyebrow}>Contact - {contact.name}</p>
        <p className={styles.cardTagline}>{getContactTagline(contact)}</p>
      </div>

      <ul className={styles.methods}>
        <li>
          <a href={contact.phoneHref} className={styles.method}>
            <span className={styles.methodIcon}>
              <PhoneIcon />
            </span>
            <span className={styles.methodBody}>
              <span className={styles.methodLabel}>Téléphone</span>
              <span className={styles.methodValue}>{contact.phone}</span>
            </span>
          </a>
        </li>
        <li>
          <a href={`mailto:${contact.email}`} className={styles.method}>
            <span className={styles.methodIcon}>
              <MailIcon />
            </span>
            <span className={styles.methodBody}>
              <span className={styles.methodLabel}>Email</span>
              <span className={styles.methodValue}>{contact.email}</span>
            </span>
          </a>
        </li>
        {contact.whatsappHref && contact.mobile && (
          <li>
            <a
              href={contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.method}
            >
              <span className={styles.methodIcon}>
                <WhatsAppIcon />
              </span>
              <span className={styles.methodBody}>
                <span className={styles.methodLabel}>WhatsApp</span>
                <span className={styles.methodValue}>{contact.mobile}</span>
              </span>
            </a>
          </li>
        )}
        <li className={styles.methodStatic}>
          <span className={styles.methodIcon}>
            <PinIcon />
          </span>
          <span className={styles.methodBody}>
            <span className={styles.methodLabel}>Adresse</span>
            <span className={styles.methodValue}>{contact.address}</span>
          </span>
        </li>
      </ul>
    </article>
  );
}

export default function ContactSection() {
  const { filter } = useSchoolFilter();
  const showStade = filter === 'stade-formation' || filter === 'both';
  const showSpor = filter === 'sporformation' || filter === 'both';
  const showBoth = filter === 'both';

  return (
    <section className={styles.section} id="contact">
      <div className={styles.inner}>
        <div className={styles.header}>
          <p className={styles.label}>Contact</p>
          <h2 className={styles.title}>Une question sur votre projet ?</h2>
          <p className={styles.intro}>
            {showBoth
              ? 'Chaque école dispose de son équipe dédiée. Contactez celle qui correspond à votre formation.'
              : 'Appelez-nous, écrivez-nous ou contactez-nous directement. Réponse en général sous 48 h ouvrées.'}
          </p>
        </div>

        <div className={`${styles.grid} ${showBoth ? styles.gridBoth : styles.gridSingle}`}>
          {showStade && <SchoolContactCard contact={STADE_CONTACT} brand="stade" />}
          {showSpor && <SchoolContactCard contact={SPOR_CONTACT} brand="spor" />}
        </div>
      </div>
    </section>
  );
}
