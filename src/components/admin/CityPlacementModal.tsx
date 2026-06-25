'use client';

import { useState } from 'react';
import { CityPlacementEditor } from '@/components/admin/CityMapEditor';
import type { CityPosition } from '@/lib/city-positions';
import { useCityPositions } from '@/hooks/useCityPositions';
import styles from './CityPlacementModal.module.scss';

interface Props {
  regionName: string;
  cityName: string;
  onComplete: () => void;
  onSkip?: () => void;
}

export default function CityPlacementModal({ regionName, cityName, onComplete, onSkip }: Props) {
  const { positions, savePosition } = useCityPositions();
  const [draft, setDraft] = useState<CityPosition | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleValidate() {
    if (!draft) return;
    setSaving(true);
    try {
      await savePosition(cityName, draft);
      onComplete();
    } catch {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <CityPlacementEditor
          regionName={regionName}
          cityName={cityName}
          positions={positions}
          onPositionChange={setDraft}
        />
        <div className={styles.actions}>
          <p className={styles.help}>
            Glissez le point sur la carte, puis validez pour enregistrer l&apos;emplacement.
          </p>
          <div className={styles.actionBtns}>
            {onSkip && (
              <button type="button" className={styles.skipBtn} onClick={onSkip}>
                Plus tard
              </button>
            )}
            <button
              type="button"
              className={styles.validateBtn}
              onClick={handleValidate}
              disabled={!draft || saving}
            >
              {saving ? 'Enregistrement…' : 'Valider la position'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
