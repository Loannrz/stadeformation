'use client';

import styles from './ConfirmDialog.module.scss';

interface Props {
  message: string;
  title?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ message, title = 'Confirmation', onConfirm, onCancel }: Props) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className={styles.modal}>
        <h2 id="confirm-dialog-title" className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.btnNo} onClick={onCancel}>
            Non
          </button>
          <button type="button" className={styles.btnYes} onClick={onConfirm}>
            Oui
          </button>
        </div>
      </div>
    </div>
  );
}
