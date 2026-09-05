# Contexto del proyecto — El Estratega de la UTN

> Este documento se actualiza al final de cada sesión de trabajo (antes o
> junto al commit) para que la próxima sesión (Claude Code, Antigravity, o
> quien sea) sepa en qué quedó todo y qué falta. No es documentación de
> usuario: es la bitácora del proyecto.

## Qué es esto

Anotador web para "El Estratega", un juego de cartas. Permite cargar
jugadores con foto, armar partidas eligiendo participantes, anotar puntos
por ronda con botones rápidos, cerrar rondas, finalizar la partida en
cualquier momento y llevar un ranking histórico de victorias.

- Repo: https://github.com/francopittavino/Estratega
- Deploy: https://vercel.com/franco-p-s-projects/estratega
- Stack: Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 +
  Prisma (Postgres) + Vercel Blob (fotos de perfil).
- Sin login: la app es de acceso libre (decisión del usuario, ver
  "Decisiones de producto").

## Estado actual (última sesión: 2026-09-04)

Primera sesión (dos tandas). Se armó el proyecto completo desde cero (el
repo estaba vacío, sin commits), se implementó el MVP funcional y después,
en la misma sesión, se hizo un rediseño grande a partir de feedback
estético del usuario. Todavía no hay ningún commit pusheado (el usuario
pidió esperar).

**Tanda 1 — MVP funcional:**

- Scaffold Next.js 16 + TS + Tailwind, limpiado de boilerplate.
- Modelo de datos en `prisma/schema.prisma`: `Player`, `Game`,
  `GameParticipant`, `Round`, `RoundScore`.
- Server actions base en `src/lib/actions/players.ts` y
  `src/lib/actions/games.ts`: `createPlayer`, `createGame`,
  `setRoundScore`, `closeRound`, `finishGame`.
- Páginas: `/jugadores`, `/partidas`, `/partidas/nueva`, `/partidas/[id]`,
  `/tops`.
- Emblema oficial de la UTN (bajado de Wikimedia Commons, dominio público).

**Tanda 2 — rediseño estético (feedback del usuario, ver "Decisiones de
producto" más abajo):**

- Modo oscuro fijo (no depende de `prefers-color-scheme`, es la única
  paleta de la app).
- Home (`/`) dejó de redirigir a `/partidas`: ahora es una landing con el
  logo UTN grande, título "EL ESTRATEGA" animado (gradiente + sombra en
  capas tipo 3D + pop-in al cargar, todo en CSS puro, ver `.hero-title` en
  `globals.css`), un único botón "Iniciar partida" (va a
  `/partidas/nueva`) y un podio animado (`src/components/podium.tsx`) con
  el top 3 actual por victorias.
- Nav superior reemplazada por un menú lateral desplegable
  (`src/components/side-nav.tsx`): el header ahora es una barra fina con
  logo chico + botón hamburguesa.
- Fotos de jugador editables en cualquier momento: click/tap sobre el
  avatar en `/jugadores` abre el selector de archivo
  (`src/components/editable-player-avatar.tsx` +
  `updatePlayerPhoto` en `players.ts`).
- Eliminar partidas con contraseña compartida "estratega"
  (`deleteGame` en `games.ts` + `src/components/delete-game-button.tsx`,
  botón de tacho en `/partidas`). Si la partida borrada estaba finalizada,
  se descuenta la victoria a quien la había ganado (para no inflar
  `/tops`).
- "Volver una ronda atrás" durante una partida en curso (`goBackOneRound`
  en `games.ts` + botón en `game-board.tsx`, solo visible si hay una ronda
  anterior cerrada): descarta la ronda abierta actual, resta los puntos de
  la última ronda cerrada y la vuelve a abrir para poder recargarlos.
- El ranking de `/tops` ya contaba solo victorias reales (no
  participaciones) desde la tanda 1 — el usuario lo confirmó, no hizo
  falta cambiar esa lógica.
- Probado de nuevo end-to-end con SQLite temporal (no commiteado): alta de
  jugadores, selección con checkmarks, ronda con corrección, "volver una
  ronda" (verificado que revierte los totales y reabre la ronda con los
  valores previos cargados), finalización con ganador único (Franco 8 vs
  Maru 1), podio en home reflejando la victoria. No se probó en vivo
  "eliminar partida" (dispara un `window.prompt`, que bloquea la
  automatización del navegador) ni la subida real de fotos (no hay token
  de Blob en local) — la lógica de ambas se revisó a mano.
- `npm run build`, `tsc --noEmit` y `eslint` pasan limpios.

### Falta para que funcione en producción

1. **Crear la base de datos Postgres en Vercel** (Storage → Postgres) y
   conectarla al proyecto `estratega`. Eso genera solas las env vars
   `DATABASE_URL` / `DATABASE_URL_UNPOOLED`.
2. **Crear un Blob store en Vercel** (Storage → Blob) y conectarlo al
   proyecto. Genera sola la env var `BLOB_READ_WRITE_TOKEN`.
3. Correr `npx prisma migrate deploy` (o `db push` para el primer setup)
   contra esa base antes del primer uso real, o dejar que el build de
   Vercel lo haga si se agrega un paso de migración al pipeline (todavía
   no está configurado — hoy el `build` script solo corre
   `prisma generate`, no migra).
4. Conectar el repo de GitHub al proyecto de Vercel si todavía no está
   conectado (deploy automático en cada push a `main`).
5. Hacer el push del commit (el usuario pidió esperar en la última
   respuesta de esta sesión — confirmar con él antes de pushear).
6. Probar en producción el flujo completo, en particular la subida/cambio
   de fotos y el borrado de partida con contraseña (no se pudieron probar
   en vivo en esta sesión, ver arriba).

### Pendiente / no pedido todavía (no implementado a propósito)

- Editar jugadores más allá de la foto (nombre, borrar jugador).
- Autenticación real (el usuario eligió acceso libre sin login; el borrado
  de partidas usa una contraseña compartida hardcodeada, no es auth real).
- Puntajes negativos o fuera de +0..+5 (el usuario eligió solo botones
  rápidos, sin carga manual).
- Deshacer más de una ronda atrás (solo se puede volver un paso).

## Decisiones de producto (respuestas del usuario, 2026-09-04)

- **Acceso**: libre, sin login. Cualquiera con el link puede anotar.
- **Puntajes por ronda**: solo botones rápidos +0 a +5, sin carga manual ni
  negativos.
- **Corrección dentro de una ronda**: si tocás otro botón para el mismo
  jugador antes de "Terminar ronda", se reemplaza el valor cargado
  (implementado con upsert sobre `RoundScore`).
- **Logo**: emblema oficial de la UTN, de dominio público, bajado de
  Wikimedia Commons (`UTN_logo.jpg`, fuente: utn.edu.ar). Lleva aviso de
  marca registrada — está bien para uso interno/no comercial, pero si en
  algún momento se usa con fines comerciales conviene pedir el logo
  oficial en vectorial a la universidad.
- **Empates al finalizar partida**: si dos o más jugadores quedan con el
  mismo puntaje máximo, se consideran ganadores todos (cada uno suma 1 a
  su contador de victorias en /tops). No hay desempate automático.
- **Ronda abierta al finalizar partida**: si hay puntajes cargados en la
  ronda abierta al tocar "Finalizar partida", se suman antes de cerrar. Si
  la ronda abierta no tiene ningún puntaje cargado, se descarta sin sumar
  nada.
- **Estética (feedback 2026-09-04)**: modo oscuro fijo, título animado
  tipo 3D en la home, menú lateral en vez de nav superior, un solo botón
  en la home ("Iniciar partida"), podio animado con el top 3 debajo. Ver
  detalle en "Estado actual".
- **Cambiar foto en cualquier momento**: no hay restricción de estado de
  partida ni de tiempo — se puede cambiar la foto de un jugador aunque
  esté participando de una partida en curso; solo actualiza `photoUrl`.
- **Eliminar partida**: contraseña compartida fija `"estratega"` (no es
  por-usuario, es la misma para cualquiera que la sepa). Si la partida
  estaba finalizada, se descuenta 1 victoria a cada ganador registrado
  para no dejar el ranking de `/tops` inflado con partidas borradas.
- **Volver una ronda atrás**: solo permite retroceder un paso (de la
  ronda abierta a la última cerrada), no un historial completo. Si hay
  puntajes cargados en la ronda abierta al volver atrás, se pierden (se
  avisa con un `confirm` antes de ejecutar).

## Decisiones técnicas y por qué

- **Prisma fijado en 6.19.3** (exacto, no `^`) para `prisma` y
  `@prisma/client`. Al instalar, npm resolvió por defecto `prisma@8.0.0-rc`
  (release candidate) contra `@prisma/client@7.10.0` (estable) — versiones
  mayores desalineadas, que Prisma desaconseja. Se bajó a la última pareja
  estable sin CVEs conocidos en sus dependencias (mysql2/deepmerge-ts
  vulnerables en 7.x/8.x-rc, que son deps del CLI, no del cliente en
  runtime). `prisma` (el CLI) vive en `devDependencies`, no se necesita en
  runtime.
- **`export const dynamic = "force-dynamic"`** en todas las páginas que
  leen de la base (`/jugadores`, `/partidas`, `/partidas/[id]`,
  `/partidas/nueva`, `/tops`). Sin esto, Next intenta pre-renderizarlas de
  forma estática en el build, lo que rompería el build sin una base de
  datos disponible en ese momento y además serviría datos desactualizados.
- **Next.js 16**: usa Turbopack por defecto, `params`/`searchParams` son
  siempre `Promise` (async). El scaffold generó `AGENTS.md`/`CLAUDE.md`
  apuntando a `node_modules/next/dist/docs/` — son management automático de
  Next (`next dev` los regenera), no tocar a mano.
- **Vercel Blob** para fotos de perfil en vez de guardar binarios en la
  base: más simple y es el storage que ya usa el ecosystem de Vercel.
  `next.config.ts` tiene `images.remotePatterns` apuntando a
  `*.public.blob.vercel-storage.com`.
- **Sin autenticación**: toda mutación (`setRoundScore`, `closeRound`,
  `finishGame`, etc.) es un server action sin chequeo de usuario. Si en el
  futuro se agrega una clave compartida, hay que agregar el chequeo ahí,
  no en el cliente.

## Estructura relevante

```
prisma/schema.prisma          modelos: Player, Game, GameParticipant, Round, RoundScore
src/lib/prisma.ts             singleton de PrismaClient
src/lib/actions/players.ts    createPlayer, updatePlayerPhoto (subida a Blob)
src/lib/actions/games.ts      createGame, setRoundScore, closeRound, finishGame,
                               goBackOneRound, deleteGame (contraseña "estratega")
src/components/site-header.tsx      header fino: logo chico + botón hamburguesa
src/components/side-nav.tsx         menú lateral desplegable (Inicio/Partidas/Jugadores/Tops)
src/components/podium.tsx           podio animado del top 3 (home)
src/components/game-board.tsx       UI del anotador en vivo (client component)
src/components/new-game-form.tsx    selector de participantes (client component)
src/components/player-avatar.tsx    avatar con foto o iniciales (solo lectura)
src/components/editable-player-avatar.tsx  avatar + cambio de foto (click abre file picker)
src/components/delete-game-button.tsx      botón de tacho con prompt de contraseña
src/app/page.tsx               home: título animado + "Iniciar partida" + podio
src/app/jugadores/page.tsx
src/app/partidas/page.tsx
src/app/partidas/nueva/page.tsx
src/app/partidas/[id]/page.tsx
src/app/tops/page.tsx
public/utn-logo.jpg           emblema UTN (dominio público, Wikimedia Commons)
```

## Convención para esta bitácora

Cada sesión que termine con cambios commiteados debe actualizar, antes del
commit final de la sesión:

1. La fecha y el resumen de "Estado actual".
2. Qué se resolvió de la lista de pendientes (tachar o borrar el ítem).
3. Qué queda pendiente y por qué (bloqueado por algo del usuario, decisión
   pendiente, etc.).
4. Cualquier decisión de producto o técnica nueva, con el motivo.
