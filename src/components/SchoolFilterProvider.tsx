'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  applySchoolFilter,
  getStoredSchoolFilter,
  type SchoolFilter,
} from '@/lib/brand';

interface SchoolFilterContextValue {
  filter: SchoolFilter;
  setFilter: (filter: SchoolFilter) => void;
}

const SchoolFilterContext = createContext<SchoolFilterContextValue | null>(null);

export function SchoolFilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilterState] = useState<SchoolFilter>('both');

  useEffect(() => {
    const stored = getStoredSchoolFilter();
    setFilterState(stored);
    applySchoolFilter(stored);
  }, []);

  const setFilter = useCallback((next: SchoolFilter) => {
    setFilterState(next);
    applySchoolFilter(next);
  }, []);

  return (
    <SchoolFilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </SchoolFilterContext.Provider>
  );
}

export function useSchoolFilter(): SchoolFilterContextValue {
  const ctx = useContext(SchoolFilterContext);
  if (!ctx) {
    throw new Error('useSchoolFilter must be used within SchoolFilterProvider');
  }
  return ctx;
}

export function useSchoolFilterOptional(): SchoolFilterContextValue | null {
  return useContext(SchoolFilterContext);
}
