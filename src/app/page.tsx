'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PanelHeader } from '@/components/panel/PanelHeader';
import { StatsCards } from '@/components/panel/StatsCards';
import { EMPTY_FILTERS, ReportFilters, type Filters } from '@/components/panel/ReportFilters';
import { ReportCard } from '@/components/panel/ReportCard';
import { UsersDialog } from '@/components/panel/UsersDialog';
import { TrashDialog } from '@/components/panel/TrashDialog';
import { api, errorMessage, logout } from '@/lib/api';
import { sessionUser, useAccessToken, type SessionUser } from '@/lib/session';
import { STATUS_OPTIONS, type Report } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const token = useAccessToken();
  const user = useMemo(() => (token ? sessionUser(token) : null), [token]);

  useEffect(() => {
    if (token === null) router.replace('/login');
    else if (token && !user) logout();
  }, [token, user, router]);

  if (!user) return <LoadingPage />;
  if (!user.isAdmin) return <AdminOnly email={user.email} />;
  return <AdminPanel user={user} />;
}

function LoadingPage() {
  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <Skeleton className="h-16 w-full bg-[#1b2d48] rounded-2xl" />
      <Skeleton className="h-28 w-full bg-[#1b2d48] rounded-2xl" />
      <Skeleton className="h-28 w-full bg-[#1b2d48] rounded-2xl" />
    </main>
  );
}

function AdminOnly({ email }: { email: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#e2e4e8] border-none text-zinc-900 rounded-2xl p-2 shadow-2xl text-center">
        <CardHeader className="pt-6">
          <CardTitle className="text-2xl font-extrabold italic">Acceso solo para administradores</CardTitle>
          <CardDescription className="text-xs text-zinc-600">
            La cuenta {email} no tiene permisos para el panel. Los usuarios pueden consultar y crear reportes desde la
            app de Sentinel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={logout}
            className="w-full h-11 rounded-xl bg-[#facc15] hover:bg-[#eab308] text-zinc-950 font-extrabold text-sm cursor-pointer"
          >
            Cerrar sesión
          </button>
        </CardContent>
      </Card>
    </main>
  );
}

function matches(report: Report, filters: Filters): boolean {
  if (filters.status !== 'ALL' && report.statusId !== filters.status) return false;
  if (filters.caseType !== 'ALL' && report.caseType !== filters.caseType) return false;
  if (filters.category !== 'ALL' && report.categoryName !== filters.category) return false;
  const query = filters.search.trim().toLowerCase();
  if (!query) return true;
  return [report.title, report.description, report.evidenceUrl, report.reporterName, report.reporterEmail].some(
    (field) => field?.toLowerCase().includes(query),
  );
}

function AdminPanel({ user }: { user: SessionUser }) {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [usersOpen, setUsersOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);

  const loadReports = useCallback(() => {
    api
      .get<Report[]>('/reports')
      .then(({ data }) => {
        setReports(data);
        setError('');
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const categories = useMemo(
    () =>
      Array.from(new Set((reports ?? []).map((r) => r.categoryName).filter((c): c is string => Boolean(c)))).sort(),
    [reports],
  );
  const visible = useMemo(() => (reports ?? []).filter((r) => matches(r, filters)), [reports, filters]);

  const handleStatusChange = async (reportId: number, statusId: number) => {
    setUpdatingId(reportId);
    try {
      await api.patch(`/reports/${reportId}/status`, { statusId });
      setReports(
        (prev) =>
          prev?.map((r) =>
            r.id === reportId
              ? { ...r, statusId, statusName: STATUS_OPTIONS.find((s) => s.id === statusId)?.name ?? r.statusName }
              : r,
          ) ?? null,
      );
      toast.success('Estado del reporte actualizado');
    } catch (e) {
      toast.error('Error al cambiar el estado', { description: errorMessage(e) });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (reportId: number) => {
    try {
      await api.delete(`/reports/${reportId}`);
      setReports((prev) => prev?.filter((r) => r.id !== reportId) ?? null);
      toast.success('Reporte enviado a la papelera');
    } catch (e) {
      toast.error('Error al eliminar el reporte', { description: errorMessage(e) });
    }
  };

  return (
    <div className="w-full min-h-screen">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <PanelHeader
          email={user.email}
          onOpenUsers={() => setUsersOpen(true)}
          onOpenTrash={() => setTrashOpen(true)}
          onLogout={logout}
        />

        {error && (
          <Card role="alert" className="bg-red-950/60 border-red-800 text-red-100 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">No se pudieron cargar los reportes</CardTitle>
              <CardDescription className="text-xs text-red-200">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <button
                type="button"
                onClick={loadReports}
                className="h-9 px-4 rounded-lg bg-red-100 hover:bg-white text-red-950 text-xs font-bold cursor-pointer"
              >
                Reintentar
              </button>
            </CardContent>
          </Card>
        )}

        {!reports && !error && (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full bg-[#1b2d48] rounded-2xl" />
            <Skeleton className="h-28 w-full bg-[#1b2d48] rounded-2xl" />
            <Skeleton className="h-28 w-full bg-[#1b2d48] rounded-2xl" />
          </div>
        )}

        {reports && (
          <>
            <StatsCards reports={reports} />
            <ReportFilters filters={filters} categories={categories} onChange={setFilters} />

            {reports.length === 0 && (
              <p className="text-center text-sm text-zinc-300 py-12">Todavía no hay reportes registrados.</p>
            )}

            {reports.length > 0 && visible.length === 0 && (
              <div className="text-center py-12 space-y-3">
                <p className="text-sm text-zinc-300">Ningún reporte coincide con los filtros.</p>
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="h-9 px-4 rounded-full bg-[#facc15] hover:bg-[#eab308] text-zinc-950 text-xs font-bold cursor-pointer"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {visible.length > 0 && (
              <p className="text-xs text-zinc-400">
                Mostrando {visible.length} de {reports.length} reportes
              </p>
            )}

            <div className="flex flex-col gap-4 w-full">
              {visible.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  updating={updatingId === report.id}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <UsersDialog open={usersOpen} onOpenChange={setUsersOpen} currentUserId={user.id} />
      <TrashDialog open={trashOpen} onOpenChange={setTrashOpen} onRestored={loadReports} />
    </div>
  );
}
