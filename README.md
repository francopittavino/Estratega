# El Estratega de la UTN

Anotador web para el juego de cartas "El Estratega": jugadores con foto,
partidas con puntaje por ronda y ranking histórico de victorias.

Ver [`CONTEXTO.md`](./CONTEXTO.md) para el estado del proyecto, decisiones
tomadas y lo que falta hacer.

## Desarrollo local

Necesitás una base Postgres (podés usar la misma que en producción o una
local) y, opcionalmente, un token de Vercel Blob para las fotos.

```bash
cp .env.example .env
# completá DATABASE_URL / DATABASE_URL_UNPOOLED / BLOB_READ_WRITE_TOKEN
npm install
npm run db:push   # o npm run db:migrate para crear una migración
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Deploy

El proyecto está pensado para desplegarse en Vercel
(https://vercel.com/franco-p-s-projects/estratega). Hace falta:

1. Conectar el repo de GitHub al proyecto de Vercel.
2. Crear un storage **Postgres** y uno **Blob** desde el dashboard de
   Vercel y conectarlos al proyecto (las env vars se generan solas).
3. Correr las migraciones contra esa base (`npx prisma migrate deploy`).
