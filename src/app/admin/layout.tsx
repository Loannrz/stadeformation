import type { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import styles from './layout.module.scss';

export const metadata = { title: 'Admin — Stade Formation' };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
