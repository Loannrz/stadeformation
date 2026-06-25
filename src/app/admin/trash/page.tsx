'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import type { DeletedFormationEntry } from '@/lib/formation-trash';
import styles from './page.module.scss';

type ConfirmState = {
  message: string;
  onConfirm: () => void;
} | null;

function formatDeletedAt(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminTrashPage() {
  const router = useRouter();
  const [items, setItems] = useState<DeletedFormationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const loadTrash = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/trash');
      if (res.ok) {
        setItems(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTrash();
  }, [loadTrash]);

  function requestConfirm(message: string, action: () => Promise<void>) {
    setConfirm({
      message,
      onConfirm: () => {
        setConfirm(null);
        void action();
      },
    });
  }

  async function handleRestore(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/trash/${id}`, { method: 'POST' });
      if (res.ok) {
        router.refresh();
        await loadTrash();
        router.push(`/admin/formations/${id}`);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? 'Erreur lors de la restauration');
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handlePurge(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/trash/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
        await loadTrash();
      } else {
        alert('Erreur lors de la suppression définitive');
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Corbeille</h1>
        <p className={styles.subtitle}>
          Formations supprimées de l&apos;admin. Vous pouvez les restaurer ou les effacer définitivement.
        </p>
      </header>

      {loading ? (
        <p className={styles.loading}>Chargement…</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>Aucune formation supprimée.</p>
      ) : (
        <ul className={styles.list}>
          {items.map(({ formation, deletedAt }) => (
            <li key={formation.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{formation.nom}</span>
                <span className={styles.itemMeta}>
                  {formation.certification} · Supprimée le {formatDeletedAt(deletedAt)}
                </span>
              </div>
              <div className={styles.itemActions}>
                <button
                  type="button"
                  className={styles.btnRestore}
                  disabled={busyId === formation.id}
                  onClick={() =>
                    requestConfirm(
                      `Restaurer « ${formation.nom} » ?`,
                      () => handleRestore(formation.id),
                    )
                  }
                >
                  Restaurer
                </button>
                <button
                  type="button"
                  className={styles.btnPurge}
                  disabled={busyId === formation.id}
                  onClick={() =>
                    requestConfirm(
                      `Supprimer définitivement « ${formation.nom} » ? Cette action est irréversible.`,
                      () => handlePurge(formation.id),
                    )
                  }
                >
                  Supprimer définitivement
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
