'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, errorMessage } from '@/lib/api';

// Componentes de shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    setSending(true);

    try {
      await login(String(form.get('email')), String(form.get('password')));
      router.replace('/');
    } catch (e) {
      setError(errorMessage(e));
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#132238] text-zinc-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#e2e4e8] border-none text-zinc-900 shadow-2xl rounded-2xl p-2">
        <CardHeader className="space-y-1 text-center pb-4 pt-6">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-zinc-900 italic">
            Sentinel
          </CardTitle>
          <CardDescription className="text-xs font-medium text-zinc-600">
            Ingresa tus credenciales para acceder al panel general
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs font-semibold text-red-700 bg-red-100 border border-red-300 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 block">
                Correo electrónico
              </label>
              <Input
                type="email"
                name="email"
                placeholder="usuario@dominio.com"
                required
                className="bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-[#132238] h-10 rounded-xl font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 block">
                Contraseña
              </label>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                className="bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-[#132238] h-10 rounded-xl font-medium"
              />
            </div>

            <Button
              type="submit"
              disabled={sending}
              className="w-full bg-[#facc15] hover:bg-[#eab308] text-zinc-950 font-extrabold h-11 transition-colors mt-2 rounded-xl text-sm shadow-md cursor-pointer"
            >
              {sending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}