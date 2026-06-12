'use client';

import { useState, FormEvent } from 'react';
import styles from './ContactSection.module.scss';

export default function ContactSection() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section className={styles.section} id="contact">
      <div className={styles.inner}>
        <p className={styles.label}>Contact</p>
        <h2 className={styles.title}>Une question ?</h2>

        {sent ? (
          <div className={styles.success}>
            <strong>Message envoyé ✓</strong>
            <p>On vous répond sous 48h.</p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="nom">Nom</label>
                <input id="nom" name="nom" type="text" placeholder="Votre nom" required />
              </div>
              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="votre@email.com" required />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" placeholder="Votre message..." required />
            </div>
            <button type="submit" className={styles.submit}>
              Envoyer →
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
