import { SITE } from '@/lib/site';
import styles from './ContactSection.module.scss';

export default function ContactSection() {
  return (
    <section className={styles.section} id="contact">
      <div className={styles.inner}>
        <div className={styles.header}>
          <p className={styles.label}>Contact</p>
          <h2 className={styles.title}>Une question sur votre projet ?</h2>
          <p className={styles.intro}>
            Appelez-nous, écrivez-nous ou contactez-nous sur WhatsApp.
            L&apos;équipe répond en général sous 48 h ouvrées.
          </p>
        </div>

        <div className={styles.cards}>
          <a href={SITE.phoneHref} className={styles.card}>
            <span className={styles.cardLabel}>Téléphone</span>
            <span className={styles.cardValue}>{SITE.phone}</span>
          </a>
          <a href={`mailto:${SITE.email}`} className={styles.card}>
            <span className={styles.cardLabel}>Email</span>
            <span className={styles.cardValue}>{SITE.email}</span>
          </a>
          <a
            href={SITE.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
          >
            <span className={styles.cardLabel}>WhatsApp</span>
            <span className={styles.cardValue}>{SITE.mobile}</span>
          </a>
        </div>

        <p className={styles.address}>{SITE.address}</p>
      </div>
    </section>
  );
}
