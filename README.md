# SENTINEL — Panel web del administrador

Panel para revisar, validar y clasificar los reportes y señalamientos de fraudes de multas de tránsito y fotocívicas. Hecho con Next.js 16, React 19, Tailwind 4 y componentes de shadcn/ui. Consume la API de [BackendEquipo1](https://github.com/TC2007B-451-Agosto-Diciembre-2026/BackendEquipo1).

Solo los usuarios con rol de administrador pueden usarlo.

## Desarrollo

```bash
npm install
NEXT_PUBLIC_API_URL=http://localhost:3000 npm run dev
```

El panel queda en http://localhost:3001. `NEXT_PUBLIC_API_URL` es la URL base de la API; si no se define, se usa `http://localhost:3000`.

Para levantar todo (base de datos, backend, panel y nginx) con Docker, sigan `deploy/local` en el repo del backend.

## Producción

`NEXT_PUBLIC_API_URL` se fija dentro del JavaScript al construir, así que se pasa como argumento de construcción:

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=http://172.16.64.2/api -t sentinel-admin-web .
```

La imagen usa la salida `standalone` de Next.js y escucha en el puerto 3000. El despliegue completo del laboratorio está en `deploy/DESPLIEGUE.md` del repo del backend.

## Estructura

```text
src/
├── app/
│   ├── page.tsx          # Panel: reportes, filtros, estadísticas, usuarios y papelera
│   └── login/page.tsx    # Inicio de sesión
├── components/
│   ├── panel/            # Componentes del panel
│   └── ui/               # Componentes de shadcn/ui
└── lib/
    ├── api.ts            # Cliente HTTP con refresh automático del token
    ├── session.ts        # Lectura del usuario desde el token
    └── types.ts          # Tipos de la API
```
