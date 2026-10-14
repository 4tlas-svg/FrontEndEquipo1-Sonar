'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

const SECTIONS = [
  { href: '/', label: 'Reportes' },
  { href: '/estadisticas', label: 'Estadísticas' },
];

export function PanelHeader({ email, onOpenUsers, onOpenTrash, onLogout }: Props) {
  const pathname = usePathname();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-700/60 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white italic leading-none">Sentinel</h1>
          <p className="text-[11px] text-zinc-400 mt-1">Panel General Administrativo</p>
        </div>
        <nav aria-label="Secciones del panel" className="flex gap-1 bg-[#1b2d48] border border-[#2a3f5f] rounded-full p-1">
          {SECTIONS.map((section) => {
            const active = pathname === section.href;
            return (
              <Link
                key={section.href}
                href={section.href}
                aria-current={active ? 'page' : undefined}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  active ? 'bg-[#facc15] text-zinc-950' : 'text-zinc-200 hover:bg-[#233857]'
                }`}
              >
                {section.label}
              </Link>
            );
          })}
        </nav>
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
