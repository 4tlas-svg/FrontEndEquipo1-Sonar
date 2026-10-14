import { useSyncExternalStore } from 'react';
import { getAccessToken } from '@/lib/api';

export type SessionUser = {
  id: number;
  email: string;
  isAdmin: boolean;
};

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

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function useAccessToken(): string | null | undefined {
  return useSyncExternalStore(subscribe, getAccessToken, () => undefined);
}

export function sessionUser(token: string): SessionUser | null {
  const claims = parseJwt(token);
  if (!claims) return null;
  return {
    id: Number(claims.sub),
    email: claims.email ?? '',
    isAdmin: Number(claims.role_id) === 1,
  };
}
