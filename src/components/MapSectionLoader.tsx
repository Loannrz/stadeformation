import styles from './MapSectionLoader.module.scss';

export default function MapSectionLoader() {
  return (
    <section className={styles.section} id="carte" aria-busy="true" aria-label="Chargement de la carte">
      <div className={styles.inner}>
        <div className={styles.spinner} aria-hidden="true" />
        <p className={styles.text}>Chargement de la carte…</p>
      </div>
    </section>
  );
}
