import styles from './Hero.module.scss';

export default function Hero() {
  return (
    <section className={styles.hero} id="hero">
      <p className={styles.eyebrow}>Formations sportives diplômantes</p>

      <h1 className={styles.title}>
        Devenez<br />
        <span className={styles.gradient}>éducateur sportif</span><br />
        diplômé
      </h1>

      <p className={styles.subtitle}>
        BPJEPS, DEJEPS, Titre Pro - des formations de niveau 4 et 5 reconnues par l'État, en alternance, partout en France.
      </p>

      <div className={styles.actions}>
        <a href="#carte" className={styles.btnPrimary}>
          Trouver ma formation →
        </a>
      </div>

      <div className={styles.scroll} aria-hidden="true">
        <span>Scroll</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
