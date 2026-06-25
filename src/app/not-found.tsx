import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './not-found.module.scss';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.inner}>
          <span className={styles.code} aria-hidden="true">404</span>
          <h1 className={styles.title}>Page introuvable</h1>
          <p className={styles.text}>
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
          <Link href="/" className={styles.btn}>
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    </>
  );
}
