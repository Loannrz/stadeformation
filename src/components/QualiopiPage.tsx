import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './QualiopiPage.module.scss';

export default function QualiopiPage() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.inner}>
          <nav className={styles.breadcrumb} aria-label="Fil d'Ariane">
            <Link href="/">Accueil</Link>
            <span>/</span>
            <span>Certification Qualiopi</span>
          </nav>

          <header className={styles.header}>
            <p className={styles.label}>Certification qualité</p>
            <h1 className={styles.title}>Certification Qualiopi</h1>
            <p className={styles.intro}>
              Conformément à l&apos;article 1<sup>er</sup> de l&apos;arrêté du 31 mai 2023,
              vous pouvez consulter ci-dessous le certificat Qualiopi de Stade Formation.
            </p>
          </header>

          <div className={styles.card}>
            <div className={styles.cardHead}>
              <Image
                src="/images/qualiopi-logo.png"
                alt="Logo Qualiopi"
                width={150}
                height={80}
                className={styles.logo}
              />
              <div className={styles.categories}>
                <p className={styles.categoriesLabel}>Certification délivrée au titre des catégories :</p>
                <ul>
                  <li>Action de formation</li>
                  <li>Action de formation par apprentissage</li>
                </ul>
              </div>
            </div>

            <figure className={styles.certFigure}>
              <Image
                src="/images/certificat-qualiopi.png"
                alt="Certificat Qualiopi de Stade Formation"
                width={762}
                height={960}
                className={styles.certImage}
                priority
              />
            </figure>

            <div className={styles.actions}>
              <a
                href="/images/certificat-qualiopi.png"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnPrimary}
              >
                Consulter le certificat
              </a>
              <Link href="/#about" className={styles.btnSecondary}>
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
