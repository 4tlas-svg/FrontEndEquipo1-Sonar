'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Props = {
  email: string;
  onOpenUsers: () => void;
  onOpenTrash: () => void;
  onLogout: () => void;
};

export function PanelHeader({ email, onOpenUsers, onOpenTrash, onLogout }: Props) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-700/60 pb-5">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white italic">Reportes Recientes</h1>
        <p className="text-xs text-zinc-300 mt-1">Sentinel — Panel General Administrativo</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <div className="flex items-center gap-3 bg-[#1b2d48] border border-zinc-700 hover:bg-[#233857] p-1.5 pr-4 rounded-full transition-colors cursor-pointer">
            <Avatar className="h-9 w-9 bg-[#facc15] text-zinc-950 font-extrabold border border-amber-300">
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-white leading-none">Administrador</p>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{email}</p>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-100 w-56 p-1 rounded-xl shadow-2xl">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-bold text-zinc-400 px-3 py-2">Mi cuenta (ADMIN)</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem
            onClick={onOpenUsers}
            className="text-xs font-medium focus:bg-zinc-800 focus:text-white cursor-pointer rounded-lg px-3 py-2"
          >
            Gestión de usuarios y roles
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onOpenTrash}
            className="text-xs font-medium focus:bg-zinc-800 focus:text-white cursor-pointer rounded-lg px-3 py-2"
          >
            Papelera de reportes
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem
            onClick={onLogout}
            className="text-xs font-bold text-red-400 focus:bg-red-950/50 focus:text-red-300 cursor-pointer rounded-lg px-3 py-2"
          >
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
