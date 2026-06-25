'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CityPosition, CityPositionsMap } from '@/lib/city-positions';
import { cityNameToStorageKey } from '@/lib/city-positions';

export function useCityPositions() {
  const [positions, setPositions] = useState<CityPositionsMap>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/city-positions');
    if (res.ok) {
      setPositions((await res.json()) as CityPositionsMap);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const savePosition = useCallback(
    async (cityName: string, position: CityPosition) => {
      const res = await fetch('/api/admin/city-positions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: cityName, position }),
      });
      if (!res.ok) throw new Error('Échec de la sauvegarde');
      const updated = (await res.json()) as CityPositionsMap;
      setPositions(updated);
      return updated;
    },
    [],
  );

  return { positions, loading, refresh, savePosition, storageKey: cityNameToStorageKey };
}
