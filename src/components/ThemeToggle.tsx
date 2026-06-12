'use client';

import { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.scss';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'sf-theme';

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    applyTheme(next);
  };

  return (
    <div className={styles.widget}>
      <button
        type="button"
        className={styles.trigger}
        aria-label="Choisir le thème du site"
        aria-expanded="false"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className={styles.panel} role="region" aria-label="Sélection du thème">
        <p className={styles.panelTitle}>Apparence</p>
        <div className={styles.toggleRow}>
          <span className={theme === 'light' ? styles.labelActive : styles.label}>
            Clair
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={theme === 'dark'}
            aria-label="Basculer entre thème clair et sombre"
            className={`${styles.switch} ${theme === 'dark' ? styles.switchDark : ''}`}
            onClick={toggleTheme}
          >
            <span className={styles.switchKnob} />
          </button>
          <span className={theme === 'dark' ? styles.labelActive : styles.label}>
            Sombre
          </span>
        </div>
      </div>
    </div>
  );
}
