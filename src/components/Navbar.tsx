'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Formation, getFormationLieux, getFormationNavbarEcole } from '@/lib/formations';
import { useSchoolFilter } from './SchoolFilterProvider';
import ThemeToggle from './ThemeToggle';
import styles from './Navbar.module.scss';

interface Props {
  formation?: Formation;
}

export default function Navbar({ formation }: Props) {
  const { filter } = useSchoolFilter();
  const lieux = formation ? getFormationLieux(formation.regions) : [];
  const certShort = formation?.certification.split('-')[0].trim();

  const logoSource = formation ? getFormationNavbarEcole(formation) : filter;
  const showStade = logoSource === 'stade-formation' || logoSource === 'both';
  const showSpor = logoSource === 'sporformation' || logoSource === 'both';

  return (
    <nav className={styles.nav}>
      <Link href={formation ? '/#carte' : '/'} className={styles.logo}>
        <span className={styles.logoGroup}>
          {showStade && (
            <Image
              src="/logo-unnamed-1.png"
              alt="Stade Formation"
              width={210}
              height={320}
              className={styles.logoStade}
              priority
            />
          )}
          {showSpor && (
            <Image
              src="/logo-sporformation-grand.png"
              alt="SporFormation"
              width={48}
              height={48}
              className={styles.logoSporformation}
            />
          )}
        </span>
      </Link>

      {formation && (
        <div className={styles.formationContext}>
          <span className={styles.formationCert}>{certShort}</span>
          <span className={styles.formationName}>{formation.nom}</span>
          <span className={styles.formationLieux}>{lieux.join(' · ')}</span>
        </div>
      )}

      <div className={styles.actions}>
        <ThemeToggle />
        {formation ? (
          <a
            href={formation.url_inscription}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cta}
          >
            S&apos;inscrire
          </a>
        ) : (
          <a href="#carte" className={styles.cta}>
            Trouver ma formation
          </a>
        )}
      </div>
    </nav>
  );
}
