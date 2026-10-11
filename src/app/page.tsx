'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, API_URL, errorMessage, getAccessToken, logout } from '@/lib/api';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Report = {
  id: number;
  title: string;
  description: string;
  statusId: number;
  categoryName?: string | null;
  statusName?: string | null;
  evidenceUrl?: string | null;
  imagePath?: string | null;
  createdAt?: string;
  reporterName?: string | null;  
  reporterEmail?: string | null; 
};

type User = {
  id: number;
  email: string;
  role: string;
};

const STATUS_OPTIONS = [
  { id: 1, name: 'En revisión', color: '#facc15' },
  { id: 2, name: 'Fraude', color: '#ff003c' },
  { id: 3, name: 'Confiable', color: '#22c55e' },
];

// Función para extraer claims del token JWT sin librerías externas
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function HomePage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<number | 'ALL'>('ALL');

  // INFORMACIÓN DEL USUARIO AUTENTICADO
  const [currentUserEmail, setCurrentUserEmail] = useState('admin@sentinel.com');
  const [currentUserRole, setCurrentUserRole] = useState<'ADMIN' | 'USER'>('USER');

  // ESTADOS PARA LA GESTIÓN DE USUARIOS
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUserRole, setUpdatingUserRole] = useState<number | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    // Decodificar token para extraer email y rol
    const claims = parseJwt(token);
    if (claims) {
      if (claims.email) setCurrentUserEmail(claims.email);
      // Asume que role_id 1 es ADMIN o que el claim trae el texto directo
      if (claims.role_id === 1 || claims.role === 'ADMIN') {
        setCurrentUserRole('ADMIN');
      }
    }

    fetchReports();
  }, [router]);

  const fetchReports = () => {
    api
      .get<Report[]>('/reports')
      .then(({ data }) => setReports(data))
      .catch((e) => {
        const msg = errorMessage(e);
        setError(msg);
        toast.error('Error al cargar reportes', { description: msg });
      });
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get<User[]>('/users');
      setUsers(data);
    } catch (e) {
      toast.error('No se pudo cargar la lista de usuarios', { description: errorMessage(e) });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenUsersModal = () => {
    setIsUsersModalOpen(true);
    fetchUsers();
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingUserRole(userId);
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success('Rol actualizado', {
        description: `El usuario #${userId} ahora es ${newRole}.`,
      });
    } catch (e) {
      toast.error('Error al cambiar el rol', { description: errorMessage(e) });
    } finally {
      setUpdatingUserRole(null);
    }
  };

  const handleStatusChange = async (reportId: number, newStatusId: number) => {
    setUpdatingId(reportId);
    try {
      await api.patch(`/reports/${reportId}/status`, { statusId: newStatusId });

      setReports((prev) =>
        prev
          ? prev.map((r) =>
              r.id === reportId
                ? {
                    ...r,
                    statusId: newStatusId,
                    statusName: STATUS_OPTIONS.find((s) => s.id === newStatusId)?.name || r.statusName,
                  }
                : r
            )
          : null
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
      setReports((prev) => (prev ? prev.filter((r) => r.id !== reportId) : null));
      toast.success('Reporte eliminado correctamente');
    } catch (e) {
      toast.error('Error al eliminar el reporte', { description: errorMessage(e) });
    }
  };

  const totalReports = reports?.length || 0;
  const resolvedCount = reports?.filter((r) => r.statusId !== 1).length || 0;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;
  const inReviewCount = reports?.filter((r) => r.statusId === 1).length || 0;
  const fraudCount = reports?.filter((r) => r.statusId === 2).length || 0;

  const filteredReports = reports?.filter((report) => {
    if (statusFilter === 'ALL') return true;
    return report.statusId === statusFilter;
  });

  return (
    <div className="w-full bg-[#132238] text-zinc-100 min-h-screen">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-700/60 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white italic">
              Reportes Recientes
            </h1>
            <p className="text-xs text-zinc-300 mt-1">Sentinel — Panel General Administrativo</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="flex items-center gap-3 bg-[#1b2d48] border border-zinc-700 hover:bg-[#233857] p-1.5 pr-4 rounded-full transition-colors cursor-pointer">
                <Avatar className="h-9 w-9 bg-[#facc15] text-zinc-950 font-extrabold border border-amber-300">
                  <AvatarFallback>{currentUserRole === 'ADMIN' ? 'AD' : 'US'}</AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-white leading-none">
                    {currentUserRole === 'ADMIN' ? 'Administrador' : 'Usuario'}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{currentUserEmail}</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-100 w-56 p-1 rounded-xl shadow-2xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-bold text-zinc-400 px-3 py-2">
                  Mi Cuenta ({currentUserRole})
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-zinc-800" />

              {currentUserRole === 'ADMIN' && (
                <>
                  <DropdownMenuItem
                    onClick={handleOpenUsersModal}
                    className="text-xs font-medium focus:bg-zinc-800 focus:text-white cursor-pointer rounded-lg px-3 py-2"
                  >
                     Gestión de Usuarios / Roles
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                </>
              )}

              <DropdownMenuItem
                onClick={logout}
                className="text-xs font-bold text-red-400 focus:bg-red-950/50 focus:text-red-300 cursor-pointer rounded-lg px-3 py-2"
              >
                 Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {reports && reports.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <Card className="bg-[#1b2d48] border-[#2a3f5f] text-zinc-100 shadow-md">
              <CardHeader className="pb-1.5 pt-4">
                <CardDescription className="text-zinc-300 text-xs font-medium">Total de Reportes</CardDescription>
                <CardTitle className="text-3xl font-extrabold text-white">{totalReports}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-[#1b2d48] border-[#2a3f5f] text-zinc-100 shadow-md">
              <CardHeader className="pb-1.5 pt-4">
                <CardDescription className="text-zinc-300 text-xs font-medium">Tasa de Resolución</CardDescription>
                <CardTitle className="text-3xl font-extrabold text-sky-400">{resolutionRate}%</CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-[#1b2d48] border-[#2a3f5f] text-zinc-100 shadow-md">
              <CardHeader className="pb-1.5 pt-4">
                <CardDescription className="text-zinc-300 text-xs font-medium">En Revisión</CardDescription>
                <CardTitle className="text-3xl font-extrabold text-yellow-400">{inReviewCount}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-[#1b2d48] border-[#2a3f5f] text-zinc-100 shadow-md">
              <CardHeader className="pb-1.5 pt-4">
                <CardDescription className="text-zinc-300 text-xs font-medium">Casos de Fraude</CardDescription>
                <CardTitle className="text-3xl font-extrabold text-[#ff003c]">{fraudCount}</CardTitle>
              </CardHeader>
            </Card>
          </section>
        )}

        {reports && reports.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-700/60">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-[#facc15] text-zinc-950 shadow-md'
                  : 'bg-[#e2e4e8] text-zinc-900 hover:bg-white'
              }`}
            >
              Todas
            </button>
            {STATUS_OPTIONS.map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-[#facc15] text-zinc-950 shadow-md'
                    : 'bg-[#e2e4e8] text-zinc-900 hover:bg-white'
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>
        )}

        {!reports && !error && (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full bg-[#1b2d48] rounded-2xl" />
            <Skeleton className="h-28 w-full bg-[#1b2d48] rounded-2xl" />
            <Skeleton className="h-28 w-full bg-[#1b2d48] rounded-2xl" />
          </div>
        )}

        <div className="flex flex-col gap-4 w-full">
      {filteredReports?.map((report) => (
            <Card key={report.id} className="bg-[#e2e4e8] border-none text-zinc-900 rounded-2xl p-2 shadow-lg w-full">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 pt-3 px-4">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg font-extrabold text-zinc-900 italic leading-snug">
                    {report.title}
                  </CardTitle>

                  {(report.reporterName || report.reporterEmail) && (
                    <p className="text-xs text-zinc-600 font-medium flex items-center gap-1.5 pt-0.5">
                      <span>Reportado por:</span>
                      <span className="font-bold text-zinc-900">{report.reporterName || 'Usuario'}</span>
                      {report.reporterEmail && (
                        <span className="text-[11px] font-mono text-zinc-500">
                          (&lt;{report.reporterEmail}&gt;)
                        </span>
                      )}
                    </p>
                  )}

                  {report.evidenceUrl && (
                    <p className="text-xs font-mono truncate pt-0.5">
                      <a
                        href={report.evidenceUrl.startsWith('http') ? report.evidenceUrl : `https://${report.evidenceUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-700 hover:text-sky-900 underline font-semibold transition-colors"
                      >
                        {report.evidenceUrl}
                      </a>
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1.5">
                    <Badge className="bg-white text-zinc-900 border border-zinc-300 font-semibold text-[11px] px-3 py-1 rounded-full shadow-xs">
                      {report.categoryName || 'Sin categoría'}
                    </Badge>

                    {report.statusId === 2 && (
                      <Badge className="bg-[#ff003c] text-white font-extrabold text-[11px] px-3 py-1 rounded-full border-none shadow-xs">
                        Fraude
                      </Badge>
                    )}
                    {report.statusId === 1 && (
                      <Badge className="bg-[#facc15] text-zinc-950 font-extrabold text-[11px] px-3 py-1 rounded-full border-none shadow-xs">
                        En revisión...
                      </Badge>
                    )}
                    {report.statusId === 3 && (
                      <Badge className="bg-[#22c55e] text-zinc-950 font-extrabold text-[11px] px-3 py-1 rounded-full border-none shadow-xs">
                         Confiable
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Select
                    value={String(report.statusId)}
                    disabled={updatingId === report.id}
                    onValueChange={(val) => handleStatusChange(report.id, Number(val))}
                  >
                    <SelectTrigger className="w-[130px] h-8 text-xs bg-white border-zinc-300 text-zinc-900 font-semibold rounded-lg shadow-xs">
                      <SelectValue>
                        {STATUS_OPTIONS.find((s) => s.id === report.statusId)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                      {STATUS_OPTIONS.map((st) => (
                        <SelectItem key={st.id} value={String(st.id)} className="text-xs font-medium">
                          {st.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <AlertDialog>
                    <AlertDialogTrigger className="h-8 text-xs px-3.5 font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors cursor-pointer border-none flex items-center justify-center">
                      Eliminar
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                          Esta acción moverá el reporte a la papelera (Soft Delete).
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-100">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(report.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>

              <CardContent className="pt-2 px-4 pb-3 space-y-2">
                <p className="text-xs text-zinc-800 leading-relaxed font-medium">{report.description}</p>

                {report.imagePath && (
                  <div className="pt-1">
                    <span className="block text-[11px] font-semibold text-zinc-600 mb-1">Captura adjunta:</span>
                    <img
                      src={`${API_URL}/uploads/${report.imagePath}`}
                      alt={report.title}
                      className="max-h-52 rounded-xl border border-zinc-300 object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={isUsersModalOpen} onOpenChange={setIsUsersModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Gestión de Usuarios y Roles
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Modifica el nivel de acceso y asigna permisos de administrador a los usuarios registrados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4 max-h-96 overflow-y-auto pr-1">
            {loadingUsers && (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full bg-zinc-800 rounded-xl" />
                <Skeleton className="h-12 w-full bg-zinc-800 rounded-xl" />
              </div>
            )}

            {!loadingUsers && users.length === 0 && (
              <p className="text-xs text-zinc-500 italic">No se encontraron usuarios o la API no retornó resultados.</p>
            )}

            {!loadingUsers &&
              users.map((u) => {
                const currentRole = (u.role || 'USER').toUpperCase();

                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{u.email}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">ID: #{u.id}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={currentRole}
                        disabled={updatingUserRole === u.id}
                        onValueChange={(selectedRole: string | null) => {
                          if (selectedRole) {
                            handleRoleChange(u.id, selectedRole);
                          }
                        }}
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs bg-zinc-900 border-zinc-700 text-zinc-100 font-semibold rounded-lg">
                          <SelectValue>{currentRole}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                          <SelectItem value="ADMIN" className="text-xs font-bold text-yellow-400">
                            ADMIN
                          </SelectItem>
                          <SelectItem value="USER" className="text-xs font-medium text-zinc-300">
                            USER
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}