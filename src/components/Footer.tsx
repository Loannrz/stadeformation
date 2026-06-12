import Image from 'next/image';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import styles from './Footer.module.scss';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <Image src="/logo-white.png" alt="" width={28} height={28} aria-hidden="true" />
            <span>{SITE.name}</span>
          </Link>
          <p className={styles.tagline}>{SITE.tagline}</p>
          <p className={styles.address}>{SITE.address}</p>
        </div>

        <div className={styles.col}>
          <p className={styles.colTitle}>Contact</p>
          <a href={`mailto:${SITE.email}`} className={styles.link}>{SITE.email}</a>
          <a href={SITE.phoneHref} className={styles.link}>{SITE.phone}</a>
          <a href={SITE.whatsappHref} target="_blank" rel="noopener noreferrer" className={styles.link}>
            WhatsApp — {SITE.mobile}
          </a>
        </div>

        <div className={styles.col}>
          <p className={styles.colTitle}>Navigation</p>
          <Link href="/#carte" className={styles.link}>Trouver ma formation</Link>
          <Link href="/#about" className={styles.link}>Qui sommes-nous</Link>
          <Link href="/#faq" className={styles.link}>Questions fréquentes</Link>
          <Link href="/certification-qualiopi" className={styles.link}>Certification Qualiopi</Link>
          <Link href="/mentions-legales" className={styles.link}>Mentions légales</Link>
        </div>

        <div className={styles.col}>
          <p className={styles.colTitle}>Suivre</p>
          <a href={SITE.social.linkedin} target="_blank" rel="noopener noreferrer" className={styles.link}>
            LinkedIn
          </a>
          <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" className={styles.link}>
            Instagram
          </a>
          <a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer" className={styles.link}>
            Facebook
          </a>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {year} {SITE.name}. Tous droits réservés.</p>
        <Link href="/mentions-legales" className={styles.legal}>
          Mentions légales
        </Link>
      </div>
    </footer>
  );
}
