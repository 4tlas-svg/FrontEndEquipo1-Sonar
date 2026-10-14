'use client';

import { createContext, useCallback, useContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { api, errorMessage } from '@/lib/api';
import type { SessionUser } from '@/lib/session';
import type { Report } from '@/lib/types';

type PanelState = {
  user: SessionUser;
  reports: Report[] | null;
  error: string;
  reload: () => void;
  setReports: Dispatch<SetStateAction<Report[] | null>>;
};

const PanelContext = createContext<PanelState | null>(null);

export function PanelProvider({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState('');

  const reload = useCallback(() => {
    api
      .get<Report[]>('/reports')
      .then(({ data }) => {
        setReports(data);
        setError('');
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <PanelContext.Provider value={{ user, reports, error, reload, setReports }}>{children}</PanelContext.Provider>
  );
}

export function usePanel(): PanelState {
  const state = useContext(PanelContext);
  if (!state) throw new Error('usePanel debe usarse dentro de PanelProvider');
  return state;
}
