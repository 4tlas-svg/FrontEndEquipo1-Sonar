'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PanelHeader } from '@/components/panel/PanelHeader';
import { PanelProvider, usePanel } from '@/components/panel/PanelProvider';
import { UsersDialog } from '@/components/panel/UsersDialog';
import { TrashDialog } from '@/components/panel/TrashDialog';
import { logout } from '@/lib/api';
import { sessionUser, useAccessToken } from '@/lib/session';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAccessToken();
  const user = useMemo(() => (token ? sessionUser(token) : null), [token]);

  useEffect(() => {
    if (token === null) router.replace('/login');
    else if (token && !user) logout();
  }, [token, user, router]);

  if (!user) return <LoadingPage />;
  if (!user.isAdmin) return <AdminOnly email={user.email} />;
  return (
    <PanelProvider user={user}>
      <PanelShell>{children}</PanelShell>
    </PanelProvider>
  );
}

function PanelShell({ children }: { children: React.ReactNode }) {
  const { user, reload } = usePanel();
  const [usersOpen, setUsersOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);

  return (
    <div className="w-full min-h-screen">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <PanelHeader
          email={user.email}
          onOpenUsers={() => setUsersOpen(true)}
          onOpenTrash={() => setTrashOpen(true)}
          onLogout={logout}
        />
        {children}
      </main>
      <UsersDialog open={usersOpen} onOpenChange={setUsersOpen} currentUserId={user.id} />
      <TrashDialog open={trashOpen} onOpenChange={setTrashOpen} onRestored={reload} />
    </div>
  );
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
