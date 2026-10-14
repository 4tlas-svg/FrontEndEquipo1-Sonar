'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { api, errorMessage } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { CASE_TYPES, type Report } from '@/lib/types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestored: () => void;
};

export function TrashDialog({ open, onOpenChange, onRestored }: Props) {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState('');
  const [restoringId, setRestoringId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    api
      .get<Report[]>('/reports/deleted')
      .then(({ data }) => {
        if (!active) return;
        setReports(data);
        setError('');
      })
      .catch((e) => active && setError(errorMessage(e)));
    return () => {
      active = false;
    };
  }, [open]);

  const restore = async (report: Report) => {
    setRestoringId(report.id);
    try {
      await api.patch(`/reports/${report.id}/restore`);
      setReports((prev) => prev?.filter((r) => r.id !== report.id) ?? null);
      toast.success('Reporte restaurado', { description: report.title });
      onRestored();
    } catch (e) {
      toast.error('No se pudo restaurar', { description: errorMessage(e) });
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Papelera de reportes</DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Reportes eliminados. Al restaurarlos vuelven a la lista con su estado anterior.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4 max-h-96 overflow-y-auto pr-1">
          {error && <p role="alert" className="text-xs text-red-400">{error}</p>}

          {!reports && !error && (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full bg-zinc-800 rounded-xl" />
              <Skeleton className="h-14 w-full bg-zinc-800 rounded-xl" />
            </div>
          )}

          {reports?.length === 0 && <p className="text-xs text-zinc-500 italic">La papelera está vacía.</p>}

          {reports?.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{report.title}</p>
                <p className="text-[11px] text-zinc-400">
                  {CASE_TYPES[report.caseType] ?? report.caseType}
                  {report.deletedAt && ` · eliminado el ${formatDate(report.deletedAt)}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => restore(report)}
                disabled={restoringId === report.id}
                className="h-8 px-3 text-xs font-bold rounded-lg bg-[#facc15] hover:bg-[#eab308] text-zinc-950 disabled:opacity-60 cursor-pointer shrink-0"
              >
                {restoringId === report.id ? 'Restaurando…' : 'Restaurar'}
              </button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
