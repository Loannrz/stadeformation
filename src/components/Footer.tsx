'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SPOR_CONTACT, STADE_CONTACT } from '@/lib/site';
import { useSchoolFilter } from './SchoolFilterProvider';
import styles from './Footer.module.scss';

export default function Footer() {
  const { filter } = useSchoolFilter();
  const year = new Date().getFullYear();

  const showStade = filter === 'stade-formation' || filter === 'both';
  const showSpor = filter === 'sporformation' || filter === 'both';
  const showBoth = filter === 'both';

  const copyrightName = showBoth
    ? 'Stade Formation & SporFormation'
    : showStade
      ? STADE_CONTACT.name
      : SPOR_CONTACT.name;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoGroup}>
              {showStade && (
                <Image
                  src="/logo-unnamed-1.png"
                  alt=""
                  width={210}
                  height={320}
                  className={styles.logoStade}
                  aria-hidden="true"
                />
              )}
              {showSpor && (
                <Image
                  src="/logo-sporformation-grand.png"
                  alt=""
                  width={48}
                  height={48}
                  className={styles.logoSporformation}
                  aria-hidden="true"
                />
              )}
            </span>
            <span className={styles.logoNames}>
              {showStade && <span>Stade Formation</span>}
              {showBoth && <span className={styles.logoSep} aria-hidden="true">&</span>}
              {showSpor && <span>SporFormation</span>}
            </span>
          </Link>

          {showBoth ? (
            <>
              <p className={styles.tagline}>{STADE_CONTACT.tagline}</p>
              <p className={styles.tagline}>{SPOR_CONTACT.tagline}</p>
              <p className={styles.address}>{STADE_CONTACT.address}</p>
              <p className={styles.address}>{SPOR_CONTACT.address}</p>
            </>
          ) : showStade ? (
            <>
              <p className={styles.tagline}>{STADE_CONTACT.tagline}</p>
              <p className={styles.address}>{STADE_CONTACT.address}</p>
            </>
          ) : (
            <>
              <p className={styles.tagline}>{SPOR_CONTACT.tagline}</p>
              <p className={styles.address}>{SPOR_CONTACT.address}</p>
            </>
          )}
        </div>

        <div className={styles.col}>
          {showStade && (
            <div className={styles.contactBlock}>
              <p className={styles.colSchoolTitle}>Contact - Stade Formation</p>
              <a href={`mailto:${STADE_CONTACT.email}`} className={styles.link}>
                {STADE_CONTACT.email}
              </a>
              <a href={STADE_CONTACT.phoneHref} className={styles.link}>
                {STADE_CONTACT.phone}
              </a>
              {STADE_CONTACT.whatsappHref && STADE_CONTACT.mobile && (
                <a
                  href={STADE_CONTACT.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  WhatsApp - {STADE_CONTACT.mobile}
                </a>
              )}
            </div>
          )}
          {showSpor && (
            <div className={styles.contactBlock}>
              <p className={styles.colSchoolTitle}>Contact - SporFormation</p>
              <a href={`mailto:${SPOR_CONTACT.email}`} className={styles.link}>
                {SPOR_CONTACT.email}
              </a>
              <a href={SPOR_CONTACT.phoneHref} className={styles.link}>
                {SPOR_CONTACT.phone}
              </a>
            </div>
          )}
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
          {showStade && (
            <>
              <a
                href={STADE_CONTACT.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                LinkedIn - Stade Formation
              </a>
              <a
                href={STADE_CONTACT.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Instagram - Stade Formation
              </a>
              <a
                href={STADE_CONTACT.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Facebook - Stade Formation
              </a>
            </>
          )}
          {showBoth && <span className={styles.colDivider} />}
          {showSpor && (
            <>
              <a
                href={SPOR_CONTACT.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                LinkedIn - SporFormation
              </a>
              <a
                href={SPOR_CONTACT.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Instagram - SporFormation
              </a>
              <a
                href={SPOR_CONTACT.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Facebook - SporFormation
              </a>
            </>
          )}
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {year} {copyrightName}. Tous droits réservés.</p>
        <Link href="/mentions-legales" className={styles.legal}>
          Mentions légales
        </Link>
      </div>
    </footer>
  );
}
