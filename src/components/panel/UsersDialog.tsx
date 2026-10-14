'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { api, errorMessage } from '@/lib/api';
import type { User } from '@/lib/types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: number;
};

type PendingChange = { user: User; role: 'ADMIN' | 'USER' };

export function UsersDialog({ open, onOpenChange, currentUserId }: Props) {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    api
      .get<User[]>('/users')
      .then(({ data }) => {
        if (!active) return;
        setUsers(data);
        setError('');
      })
      .catch((e) => active && setError(errorMessage(e)));
    return () => {
      active = false;
    };
  }, [open]);

  const confirmChange = async () => {
    if (!pending) return;
    setSaving(true);
    try {
      await api.patch(`/users/${pending.user.id}/role`, { role: pending.role });
      setUsers((prev) => prev?.map((u) => (u.id === pending.user.id ? { ...u, role: pending.role } : u)) ?? null);
      toast.success('Rol actualizado', {
        description: `${pending.user.name || pending.user.email} ahora es ${pending.role === 'ADMIN' ? 'administrador' : 'usuario'}.`,
      });
    } catch (e) {
      toast.error('Error al cambiar el rol', { description: errorMessage(e) });
    } finally {
      setSaving(false);
      setPending(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Gestión de usuarios y roles</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Cambia el nivel de acceso de los usuarios registrados. No puedes cambiar tu propio rol.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4 max-h-96 overflow-y-auto pr-1">
            {error && <p role="alert" className="text-xs text-red-400">{error}</p>}

            {!users && !error && (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full bg-zinc-800 rounded-xl" />
                <Skeleton className="h-12 w-full bg-zinc-800 rounded-xl" />
              </div>
            )}

            {users?.length === 0 && <p className="text-xs text-zinc-500 italic">No hay usuarios registrados.</p>}

            {users?.map((u) => {
              const role = (u.role || 'USER').toUpperCase();
              const isMe = u.id === currentUserId;
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {u.name || 'Sin nombre'}
                      {isMe && <span className="ml-1.5 text-[10px] font-semibold text-yellow-400">(tú)</span>}
                    </p>
                    <p className="text-[11px] text-zinc-400 font-mono truncate">{u.email}</p>
                  </div>

                  <Select
                    value={role}
                    disabled={isMe || saving}
                    onValueChange={(value) => {
                      if ((value === 'ADMIN' || value === 'USER') && value !== role) {
                        setPending({ user: u, role: value });
                      }
                    }}
                  >
                    <SelectTrigger
                      aria-label={`Rol de ${u.email}`}
                      className="w-[150px] h-8 text-xs bg-zinc-900 border-zinc-700 text-zinc-100 font-semibold rounded-lg shrink-0"
                    >
                      <SelectValue>{role === 'ADMIN' ? 'Administrador' : 'Usuario'}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      <SelectItem value="ADMIN" className="text-xs font-bold text-yellow-400">
                        Administrador
                      </SelectItem>
                      <SelectItem value="USER" className="text-xs font-medium text-zinc-300">
                        Usuario
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={pending !== null} onOpenChange={(isOpen) => !isOpen && setPending(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.role === 'ADMIN' ? '¿Dar permisos de administrador?' : '¿Quitar permisos de administrador?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              {pending?.role === 'ADMIN'
                ? `${pending?.user.email} podrá validar, clasificar y borrar reportes, y cambiar roles.`
                : `${pending?.user.email} ya no podrá entrar al panel de administración.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-100">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmChange} className="bg-[#facc15] hover:bg-[#eab308] text-zinc-950 font-bold">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
