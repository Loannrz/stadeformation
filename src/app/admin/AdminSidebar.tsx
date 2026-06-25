'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { formations as initialFormations } from '@/lib/formations';
import styles from './AdminSidebar.module.scss';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [trashCount, setTrashCount] = useState(0);

  useEffect(() => {
    void fetch('/api/admin/trash')
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => setTrashCount(Array.isArray(items) ? items.length : 0))
      .catch(() => setTrashCount(0));
  }, [pathname]);

  const query = search.trim().toLowerCase();
  const filteredFormations = query
    ? initialFormations.filter(
        (f) =>
          f.nom.toLowerCase().includes(query) ||
          f.id.toLowerCase().includes(query) ||
          f.certification.toLowerCase().includes(query),
      )
    : initialFormations;

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

        <Link
          href="/admin/city-map"
          className={styles.mapBtn}
          onClick={() => setOpen(false)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M9 4v14M15 6v14" stroke="currentColor" strokeWidth="2" />
          </svg>
          Emplacements villes
        </Link>

        <Link
          href="/admin/trash"
          className={`${styles.trashBtn} ${pathname === '/admin/trash' ? styles.trashBtnActive : ''}`}
          onClick={() => setOpen(false)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Corbeille
          {trashCount > 0 && (
            <span className={styles.trashBadge}>{trashCount}</span>
          )}
        </Link>

        <div className={styles.listLabel}>
          Formations ({filteredFormations.length}
          {query ? ` / ${initialFormations.length}` : ''})
        </div>

        <div className={styles.searchWrap}>
          <input
            type="search"
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une formation…"
            aria-label="Rechercher une formation"
          />
        </div>

        <ul className={styles.list}>
          {filteredFormations.length === 0 && (
            <li className={styles.emptySearch}>Aucune formation trouvée</li>
          )}
          {filteredFormations.map((f) => {
            const active = pathname === `/admin/formations/${f.id}`;
            const certShort = f.certification.split('-')[0].trim();
            return (
              <li key={f.id}>
                <Link
                  href={`/admin/formations/${f.id}`}
                  className={`${styles.item} ${active ? styles.itemActive : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <span
                    className={`${styles.visDot} ${f.visible ? styles.visDotOn : styles.visDotOff}`}
                    title={f.visible ? 'Visible sur le site' : 'Invisible sur le site'}
                    aria-hidden="true"
                  />
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
