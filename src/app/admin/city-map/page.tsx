'use client';

import { useCallback, useMemo } from 'react';
import CityMapEditor from '@/components/admin/CityMapEditor';
import { getAllRegionsWithCities } from '@/lib/city-positions';
import { useCityPositions } from '@/hooks/useCityPositions';
import styles from './page.module.scss';

export default function AdminCityMapPage() {
  const { positions, loading, savePosition } = useCityPositions();
  const regions = useMemo(() => getAllRegionsWithCities(), []);

  const handlePositionChange = useCallback(
    async (city: string, position: { x: number; y: number }) => {
      try {
        await savePosition(city, position);
      } catch {
        alert('Erreur lors de la sauvegarde de la position');
      }
    },
    [savePosition],
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Emplacements des villes sur la carte</h1>
        <p className={styles.subtitle}>
          Choisissez une région, puis déplacez les villes sur la carte. Les changements sont visibles sur toutes les pages du site.
        </p>
      </header>

      {loading ? (
        <p className={styles.loading}>Chargement de la carte…</p>
      ) : (
        <CityMapEditor
          regions={regions}
          positions={positions}
          onPositionChange={handlePositionChange}
        />
      )}
    </div>
  );
}
