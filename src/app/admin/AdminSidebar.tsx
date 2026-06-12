'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { formations as initialFormations } from '@/lib/formations';
import styles from './AdminSidebar.module.scss';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  }

  return (
    <>
      <button
        className={styles.mobileToggle}
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu admin"
      >
        <span /><span /><span />
      </button>

      <nav className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        <div className={styles.top}>
          <a href="/" className={styles.logo} target="_blank" rel="noopener noreferrer">
            <span className={styles.logoText}>Stade Formation</span>
            <span className={styles.logoBadge}>Admin</span>
          </a>
        </div>

        <Link
          href="/admin/formations/new"
          className={styles.newBtn}
          onClick={() => setOpen(false)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Nouvelle formation
        </Link>

        <div className={styles.listLabel}>Formations ({initialFormations.length})</div>

        <ul className={styles.list}>
          {initialFormations.map((f) => {
            const active = pathname === `/admin/formations/${f.id}`;
            const certShort = f.certification.split('-')[0].trim();
            return (
              <li key={f.id}>
                <Link
                  href={`/admin/formations/${f.id}`}
                  className={`${styles.item} ${active ? styles.itemActive : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <span className={styles.itemCert}>{certShort}</span>
                  <span className={styles.itemName}>{f.nom}</span>
                  {!f.inscription_active && (
                    <span className={styles.itemBadgeClosed}>Fermé</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={styles.bottom}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Déconnexion
          </button>
        </div>
      </nav>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}
    </>
  );
}
