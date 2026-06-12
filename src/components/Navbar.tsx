import Image from 'next/image';
import Link from 'next/link';
import { Formation, getFormationLieux } from '@/lib/formations';
import ThemeToggle from './ThemeToggle';
import styles from './Navbar.module.scss';

interface Props {
  formation?: Formation;
}

export default function Navbar({ formation }: Props) {
  const lieux = formation ? getFormationLieux(formation.regions) : [];
  const certShort = formation?.certification.split('—')[0].trim();

  return (
    <nav className={styles.nav}>
      <Link href={formation ? '/#carte' : '/'} className={styles.logo}>
        <Image src="/logo-white.png" alt="Stade Formation" width={32} height={32} />
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
