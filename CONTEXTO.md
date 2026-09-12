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

- Repo: https://github.com/francopittavino/Estratega (rama `main`, con
  auto-deploy a Vercel en cada push desde la tanda 6).
- App en vivo: https://estratega-taupe.vercel.app
- Dashboard de Vercel: https://vercel.com/franco-p-s-projects/estratega
- Stack: Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 +
  Prisma (Postgres) + Vercel Blob (fotos de perfil).
- Sin login: la app es de acceso libre (decisión del usuario, ver
  "Decisiones de producto").

## ⚠️ Credenciales reales en el historial del chat

En la tanda 3, el usuario pegó directo en el chat las credenciales reales
de producción (Postgres de Prisma Data Platform y datos del Blob store).
Quedaron en el historial de esa conversación. Se guardaron en `.env` local
(gitignorado, nunca commiteado) y se usaron para migrar y probar contra la
base real. Si en algún momento hay dudas sobre exposición de ese chat,
rotar la contraseña de la base (dashboard de Prisma/Vercel) y regenerar el
token de Blob.

## Estado actual (última sesión: 2026-09-11)

**Segunda sesión (2026-09-11)**: dos funciones nuevas grandes — "solo el
que inició la partida puede anotar" (sin login, con cookie de dispositivo)
y el **anotador de truco** completo, con su propia sección, su marcador de
cigarrillos y tres rankings por equipo. Ver "Tanda 10" y "Tanda 11" más
abajo.

**Primera sesión (2026-09-04/05, nueve tandas)**: se armó el proyecto
completo desde cero (el repo estaba vacío, sin commits), se implementó el
MVP funcional, se hicieron cuatro rondas de ajustes visuales a partir de
feedback del usuario, en la tanda 6 se pusheó todo y se dejó andando en
producción en Vercel (https://estratega-taupe.vercel.app), y en la tanda 7
se ajustó el ícono de la app y se agregó contraseña para editar jugadores.

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

**Tanda 3 — segunda ronda de feedback estético + CRUD de jugadores:**

- Se eliminó la barra superior por completo (ya no hay `<header>`/nav de
  ningún tipo). El menú ahora es un botón hamburguesa flotante fijo arriba
  a la izquierda (`src/components/side-nav.tsx`), y el panel se desliza
  desde la **izquierda** (antes salía de la derecha). Se borró
  `src/components/site-header.tsx` (ya no se usa).
- Paleta de acento cambiada de azul a **rojo**, manteniendo el modo
  oscuro: se renombraron los tokens CSS `--utn-blue`/`--utn-blue-dark` a
  `--primary`/`--primary-dark` (`#e5484d` / `#b3232a`) en `globals.css`, y
  todas las clases Tailwind `bg-utn-blue`, `text-utn-blue`, etc. a
  `bg-primary`, `text-primary`, etc. en toda la app (reemplazo global). El
  degradé del título de la home también pasó a tonos rojo/dorado. El
  emblema de la UTN en sí sigue siendo el oficial (azul), no se tocó.
- La home ya no tiene barra encima: el emblema UTN + título quedan como
  el elemento visual más arriba de la página, actuando como "header".
- **Editar y eliminar jugadores** (antes solo se podía cambiar la foto):
  `src/components/player-card.tsx` (nuevo, reemplaza el `<li>` que estaba
  inline en `/jugadores`) permite tocar el nombre para editarlo inline
  (Enter guarda, Escape cancela) y tiene un botón de tacho para borrar.
  Nuevas actions en `players.ts`: `updatePlayerName`, `deletePlayer`
  (esta última atrapa el error de FK de Prisma —código `P2003`— si el
  jugador ya participó en alguna partida, y tira un mensaje claro en vez
  de un 500).
- El selector de participantes en `/partidas/nueva` ahora tiene mejor
  contraste de selección (borde más grueso, fondo más opaco, tilde ✓) —
  en modo oscuro el estado "seleccionado" anterior casi no se notaba.
- **Probado en vivo contra la base de Postgres real de producción**
  (Prisma Data Platform, la que pasó el usuario): se corrió
  `npx prisma migrate deploy` contra ella (aplicó la migración inicial
  sin problemas) y se probó crear jugador, editar nombre, y eliminar
  jugador — los tres funcionaron correctamente end-to-end. La base quedó
  limpia (sin datos de prueba) al terminar. No se pudo probar la subida
  de fotos porque falta `BLOB_READ_WRITE_TOKEN` (el usuario solo pasó
  `BLOB_STORE_ID` y `BLOB_WEBHOOK_PUBLIC_KEY`, que son otra cosa).

**Aclaración sobre un reporte de bug que no era tal**: después de la tanda
3, el usuario reportó que la barra seguía azul, el menú aparecía a la
derecha en `/partidas/nueva`, y que arriba a la izquierda veía un texto
"El Estratega UTN" que no le gustaba. Se retestó todo en limpio (hard
reload) y no se pudo reproducir nada de eso con el código de la tanda 3 —
esos síntomas coinciden exactamente con la UI de **antes** de esa tanda
(barra superior azul con el hamburguesa a la derecha). El usuario confirmó
que refrescando en Chrome se veía bien: era caché/sesión vieja del
navegador, no un bug real. Aun así, de esa misma queja salían dos pedidos
válidos que sí se corrigieron: la tipografía del título (tenía un degradé
animado en loop con perspectiva 3D que quedaba "raro") y la falta de
relieve en las tarjetas (todo se veía muy liso). Si en el futuro aparece
un reporte visual que no coincide con lo que hay en el código, vale la
pena pedir que confirme con un hard-refresh antes de asumir que es un bug.

**Tanda 4 — fondo de pantalla con imagen temática:**

- El usuario pasó una imagen (el emblema de la UTN estilizado en rojo/negro
  con estética de tarot/cartas) y pidió usarla como fondo de toda la app.
  Se guardó en `public/fondo-estratega.jpg` (convertida de PNG a JPEG
  calidad 85 con `sharp`, de 2.4 MB a ~300 KB — el PNG original no se
  commiteó). Se aplica en `src/app/layout.tsx` como una capa `fixed`
  (`bg-cover bg-center`) detrás de todo el contenido, con otra capa
  encima semitransparente (`bg-background/65`) para que el texto que cae
  directo sobre el fondo siga siendo legible; el contenido dentro de las
  tarjetas (`bg-card`, opaco) no se ve afectado.
- Se sacó el logo chico de la UTN de la home (ya no hace falta, el fondo
  ahora lleva el emblema de forma mucho más dramática).
- La home se reordenó para centrarse verticalmente
  (`justify-center` + `min-h-[calc(100svh-5.5rem)]`) y se achicó el podio
  (avatares y barras más chicas, menos gap) para que el título, el botón
  "Iniciar partida" y el podio entren en pantalla sin scroll incluso en
  viewports bajos (probado en una ventana de 577px de alto).
- Probado visualmente con datos de prueba en SQLite temporal (no
  commiteado): se ve bien en home, jugadores, partidas/nueva y el
  anotador en vivo; el menú lateral sigue funcionando igual.

**Tanda 5 — tipografía del título + paleta neutra sin azul:**

- El usuario no le gustó la tipografía de "EL ESTRATEGA" (pidió algo "más
  agresivo") y notó que las tarjetas de jugadores/partidas tenían un fondo
  azul oscuro que no combinaba con el tema rojo/negro. Ambas cosas venían
  de la misma raíz: los tokens `--background`/`--card`/`--border` seguían
  siendo los azules originales de la tanda 1 — solo se había cambiado
  `--primary` a rojo, nunca los neutros.
- Se cambiaron los neutros en `globals.css` a tonos negro/rojo oscuro:
  `--background: #0b0808`, `--card: #1e1315`, `--border: #402226`,
  `--muted: #a99194` (antes eran azulados: `#0a0e1a`, `#161f37`,
  `#2c3859`, `#8891ab`). Esto corrige tanto las tarjetas como el overlay
  del fondo de imagen (que antes tenía un ligerísimo tinte azul al
  mezclarse con la imagen roja).
- Para el título se sumó la fuente **Anton** (`next/font/google`, peso
  400, ya es muy negra/condensada de por sí) solo para `.hero-title` en
  `globals.css`, con `letter-spacing` más ajustado, un `skewX(-4deg)` y
  una sombra en capas (rojo oscuro + negro) para dar sensación de peso y
  agresividad. El resto de la tipografía de la app sigue en Geist Sans,
  el pedido era específicamente sobre el título de la home.
- Probado visualmente de nuevo con SQLite temporal: se ve bien en home,
  jugadores, nueva partida y el menú lateral (que también usaba `bg-card`
  y se corrigió solo).

**Tanda 6 — push + deploy real a Vercel:**

- Se hizo `git push` de los 6 commits acumulados a
  `github.com/francopittavino/Estratega` (rama `main`), a pedido del
  usuario. El proyecto de Vercel ya estaba conectado a ese repo (no se
  sabía hasta este momento), así que el push disparó solo un deploy a
  producción.
- Para manejar el deploy hizo falta acceso de Vercel CLI: el usuario
  corrió `npx vercel login` (dispositivo/OAuth) y a partir de ahí Claude
  operó la CLI ya autenticada localmente (`vercel link`, `vercel env`,
  `vercel inspect`, `vercel blob`, y llamadas directas a la API REST de
  Vercel con el token guardado en
  `AppData/Roaming/xdg.data/com.vercel.cli/auth.json` para lo que la CLI
  no cubre).
- El primer deploy automático quedó "Ready" pero la app entera devolvía
  404 en todas las rutas. Dos problemas de configuración del proyecto en
  Vercel (no del código), encontrados y corregidos vía API:
  1. El **Framework Preset** del proyecto estaba en `"Other"` en vez de
     `"nextjs"` (se ve con `vercel project inspect estratega`). Con eso,
     Vercel no corría los hooks de Next.js (`modifyConfig`/
     `onBuildComplete`) al buildear, y el resultado no quedaba enrutado
     aunque el build "pasara". Se corrigió con un `PATCH` a
     `api.vercel.com/v9/projects/estratega` (`framework: "nextjs"`).
  2. Encima estaba activa la **Vercel Deployment Protection** (SSO) del
     proyecto (`ssoProtection.deploymentType: "all_except_custom_domains"`),
     que exige login de Vercel para ver CUALQUIER deployment que no sea
     un dominio propio — bloqueaba el acceso público a la app entera, algo
     que no tiene sentido para este proyecto (acceso libre, sin login,
     sin dominio propio todavía). Se desactivó con el mismo `PATCH`
     (`ssoProtection: null`).
  3. Con eso corregido y un deploy nuevo (`vercel --prod`), la app cargó
     bien, pero crear un jugador fallaba en producción con
     `Error: Vercel Blob: Cannot use public access on a private store`
     (visto con `vercel logs`). El Blob store del proyecto
     (`estratega-blob`) se había creado en modo **privado**, y el código
     siempre sube fotos con `access: "public"`. El modo de acceso de un
     store de Blob se fija al crearlo y no se puede cambiar después. Como
     el store viejo estaba vacío (0 archivos), se creó uno nuevo público
     (`estratega-blob-public`, vía `vercel blob create-store --access
     public`) y se conectó al proyecto — eso generó solo la env var
     `BLOB_READ_WRITE_TOKEN` que faltaba desde el principio. El store
     viejo (privado, vacío) quedó sin usar en la cuenta de Vercel; no se
     borró (no era necesario y el comando para borrarlo quedó bloqueado
     por el clasificador de permisos del entorno).
  4. De paso se endureció el chequeo de "¿hay una foto adjunta?" en
     `createPlayer`/`updatePlayerPhoto` (commit `7419135`): además de
     `photo.size > 0` ahora también exige `photo.name` no vacío.
  5. Con el store público conectado y ese fix, crear jugador CON foto
     seguía fallando con el mismo error de "private store", incluso en
     un deploy 100% nuevo (`vercel --prod --force`). Se confirmó con
     `vercel env pull` que el valor real de `BLOB_READ_WRITE_TOKEN` sí
     era del store nuevo (formato clásico
     `vercel_blob_rw_1DpioCPzL60nrmvw_...`, con el ID del store público
     adentro) — o sea la env var estaba bien. La hipótesis que terminó
     funcionando: `@vercel/blob` en la versión instalada (`^2.8.0`)
     prioriza algún descubrimiento automático (posiblemente vía
     `VERCEL_OIDC_TOKEN`) del store "conectado" del proyecto por sobre
     leer `BLOB_READ_WRITE_TOKEN` del `process.env` cuando no se pasa un
     `token` explícito a `put()`, y ese descubrimiento seguía resolviendo
     al store viejo (privado). Se arregló pasando
     `token: process.env.BLOB_READ_WRITE_TOKEN` explícito en las dos
     llamadas a `put()` (commit `5489bd7`). Después de ese deploy, subir
     foto funcionó.
- **Estado final probado, en vivo**: https://estratega-taupe.vercel.app
  anda de punta a punta — se probó crear jugador con y sin foto, y
  borrar jugador (bloqueado correctamente por la protección de FK cuando
  el jugador ya está en una partida). El usuario ya estaba usando la app
  en paralelo mientras se depuraba esto: hay un jugador real "Franco"
  (con foto propia) y una partida en curso "TestProd3, Franco" creada por
  él. **Quedaron dos jugadores de prueba sin borrar** (`TestProd3` y
  `TestProd4`, de esta sesión) porque `TestProd3` ya forma parte de esa
  partida en curso del usuario — no se forzó el borrado para no tocar su
  partida real. Avisarle para que los borre él cuando termine esa
  partida, o pedir permiso antes de tocarlos.

**Tanda 7 — ícono de la app y contraseña para editar jugadores:**

- Se reemplazó el ícono de la app (antes el triángulo default de Next.js)
  por un recorte cuadrado centrado del emblema de `fondo-estratega.jpg`,
  como `src/app/icon.png` (convención de Next.js, no hace falta tocar
  `layout.tsx`: genera solo el `<link rel="icon">`). `favicon.ico` se dejó
  como estaba de respaldo. Este cambio se probó (visualmente, con el
  Read tool) y se commiteó a pedido explícito del usuario ("committea eso
  ya").
- **Contraseña para editar jugadores**: usando la misma contraseña
  compartida que ya existía para borrar partidas (`"estratega"`, ahora
  centralizada en `src/lib/admin-password.ts` como
  `ADMIN_PASSWORD`/`assertAdminPassword()`, usada tanto por `games.ts`
  como por `players.ts`):
  - `updatePlayerName` y `deletePlayer` ahora piden contraseña (via
    `window.prompt`, mismo patrón que `deleteGame`).
  - `updatePlayerPhoto` (cambiar la foto de un jugador **ya creado**)
    también pide contraseña.
  - `createPlayer` (alta de un jugador nuevo, con o sin foto) **no** pide
    nada — a propósito, así lo pidió el usuario: la idea es que él sea el
    único que sabe la contraseña y se la dé a quien necesite editar algo
    puntual, pero cualquiera pueda seguir cargando jugadores nuevos sin
    fricción.
  - No se pudo probar el flujo completo en vivo (ni local ni en prod):
    `window.prompt` bloquea la pestaña de Chrome bajo automatización (a
    diferencia de `confirm`, que sí se resuelve solo) — se intentó una
    vez en local, la pestaña quedó colgada y hubo que cerrarla. La lógica
    es el mismo patrón ya validado en producción para `deleteGame`, así
    que se commiteó igual, pero si algo no anda al respecto, empezar por
    ahí.

**Tanda 8 — dos bugs reales reportados por el usuario jugando de verdad:**

- **"Se cae cuando pongo foto"**: Next.js limita a **1MB** el body de una
  Server Action por defecto. Una foto sacada con el celular casi siempre
  pesa más (el usuario lo notó recién al usar fotos reales, no los
  archivos chicos con los que se había probado antes). Se subió el límite
  a `10mb` en `next.config.ts`
  (`experimental.serverActions.bodySizeLimit`). Probado con una foto real
  de 7.3MB en local, subió bien.
- **"Le sumó punto al primero y al segundo"**: `closeRound` y `finishGame`
  hacían "leer estado → decidir → escribir" sin ninguna protección contra
  dos llamadas concurrentes. Si dos personas tienen la partida abierta
  cada una en su celular y tocan "Terminar ronda" o "Finalizar partida"
  casi al mismo tiempo, las dos transacciones podían leer el mismo estado
  "todavía no cerrado" y las dos procesaban el cierre por separado —
  podía terminar sumando puntos de una ronda dos veces, o marcando
  ganador (y sumando victoria) a partir de dos cálculos distintos hechos
  con fotos del estado en momentos ligeramente distintos. Se arregló
  haciendo que ambas funciones reclamen la fila primero con un
  `updateMany` condicional (`where: { ..., status/closedAt: valor viejo
  }`) — la segunda llamada ve `count: 0` y no toca nada más. Verificado
  simulando dos `finishGame` concurrentes contra la misma partida sin
  empate real: antes esto podía acreditar a los dos, después solo se
  procesa uno. **No se pudo confirmar con los datos reales** del bug
  original porque para cuando se investigó ya no había partidas
  terminadas en la base (el usuario ya había hecho limpieza) — la
  explicación es la más consistente con "primero y segundo" en vez de
  "empate", pero no es 100% segura sin ver el caso real.

**Tanda 9 — ajuste de los botones de puntaje rápido:**

- El usuario pidió sacar el botón +1 (nunca lo usan) y agregar +6 y +7.
  Se creó `src/lib/quick-points.ts` con `QUICK_POINTS = [0,2,3,4,5,6,7]`
  como fuente única, importada tanto por `game-board.tsx` (los botones)
  como por `setRoundScore` en `games.ts` (que antes validaba con un
  rango `0..5` a mano; ahora valida contra la lista exacta, así que un
  +1 tampoco se puede forzar salteando el botón). Probado en local: los
  botones muestran el set correcto y sumar +6/+7 da el total esperado.

**Tanda 10 — solo el que inicia la partida puede anotar (sin login):**

- El usuario pidió que los espectadores puedan mirar el marcador en vivo
  pero no tocarlo, **sin agregar login**. Solución en `src/lib/owner.ts`:
  al crear una partida, el navegador recibe una cookie `estratega_device`
  con un id aleatorio (`httpOnly`, así JS no la puede leer ni falsificar,
  `maxAge` 5 años), y en la base se guarda solo el **hash SHA-256** de ese
  id en `Game.ownerKey` / `TrucoGame.ownerKey`. Toda acción que cambie
  puntos (`setRoundScore`, `closeRound`, `finishGame`, `goBackOneRound`,
  `addTrucoPoint`, `finishTrucoGame`) empieza con `assertCanScore(gameId)`,
  que compara el hash de la cookie contra el `ownerKey` de la fila.
- El chequeo está **en el server action**, no solo escondiendo botones: un
  espectador que intente llamar la acción igual recibe el error. La UI
  además no le muestra ningún botón que toque puntos.
- **Cómo se recupera el control** (decisión del usuario): botón "Tomar el
  control" (`src/components/claim-control.tsx`) que pide la misma
  contraseña compartida `"estratega"` y reasigna el `ownerKey` al
  dispositivo actual. Sirve si el dueño borró datos del navegador, cambió
  de celular, o le quiere pasar el anotador a otro.
- **Partidas viejas**: las que ya existían tienen `ownerKey = null` y
  quedan abiertas para cualquiera, como venían funcionando (`isOwner()`
  devuelve `true` si no hay dueño). No se rompió ninguna partida existente.
- Probado en vivo (local contra la base real): con la cookie correcta se
  ve todo; simulando otro dispositivo (cambiando el `ownerKey` en la base)
  desaparecen los botones y aparece el cartel "Estás mirando"; con
  contraseña incorrecta tira "Contraseña incorrecta" y con la correcta
  vuelven los botones. Verificado tanto en El Estratega como en truco.

**Tanda 11 — anotador de truco (sección nueva completa):**

- Sección aparte en `/truco`, con su propio listado, su alta de partida y
  **tres rankings** (solitarios 1v1, dúos 2v2, tríos 3v3). No se mezcla
  nada con El Estratega: el ranking de truco no toca `Player.wins`.
- Modelo nuevo: `TrucoGame` (teamSize 1/2/3, pointsA, pointsB, winnerTeam,
  ownerKey, status) + `TrucoMember` (jugador + equipo A/B). Migración
  `20260911000000_truco_y_dueno_de_partida`, **puramente aditiva**
  (dos tablas nuevas, un enum nuevo y una columna nullable en `Game`);
  ya aplicada a la base de producción con `prisma migrate deploy`.
- **Marcador criollo con cigarrillos** (`src/components/cigarette-tally.tsx`):
  cada 5 puntos es un cuadradito — cuatro cigarrillos formando el cuadrado
  y el quinto cruzado en diagonal — dibujado en SVG puro (papel, filtro
  naranja, ceniza y brasa encendida con resplandor). Cada lado tiene dos
  bloques, **malas** (0-15) y **buenas** (16-30), de 3 cuadraditos cada uno.
- Layout: dos columnas con línea divisoria al medio, las fotos de los
  jugadores arriba de cada lado, el puntaje grande, y los cigarrillos
  abajo. Los cuadraditos van **de a 2 por fila, no de a 3**: en un celular
  cada mitad del anotador mide menos de 200px y con tres al lado los
  cigarrillos no se distinguían.
- Los botones `−` / `+` están en una barra **sticky al pie**: el anotador
  lleno es más alto que una pantalla de celular y no se puede depender de
  que scrollees para sumar un punto. Por eso el contenedor del tablero
  **no** lleva `overflow-hidden` (recortaría el sticky).
- Se juega a 30 y **no se puede pasar**: el tope está en el `where` del
  `updateMany` (`pointsA: { lt: 30 }` para sumar, `{ gt: 0 }` para restar),
  así que el incremento es atómico y con tope del lado del server.
- Por eso mismo los botones `+`/`−` **no se deshabilitan** mientras hay una
  llamada en curso: se pueden encadenar toques rápidos sin perder ninguno
  (con `useOptimistic` en el cliente para que se vean al instante). Esto
  fue un bug real encontrado probando: con el botón deshabilitado durante
  el request, 4 de cada 5 toques se perdían.
- Al llegar a 30 aparece un cartel propio "¡X llegó a 30! ¿Finalizar la
  partida?" con "Finalizar partida" / "Seguir jugando". Si elegís seguir,
  el botón "Finalizar partida" queda disponible abajo y **no vuelve a
  preguntar** (`reachedTarget` solo es `true` en el toque que cruza a 30).
- **Alta de partida** (`/truco/nueva`): elegís modalidad (1v1 / 2v2 / 3v3)
  y tocás jugadores; entran al equipo marcado y cuando se llena, el foco
  salta solo al otro. Tocar de nuevo a un jugador lo saca.
- **Rankings** (`/truco/tops`): se calculan al vuelo desde las partidas
  finalizadas, agrupando por modalidad + los ids de los jugadores del
  equipo ordenados (así "Franco y Maru" es siempre la misma dupla, sin
  importar de qué lado del anotador estuvieron). No hay contadores
  guardados: borrar una partida la saca del ranking sola.
- Probado en vivo de punta a punta contra la base real: alta 2v2 y 3v3,
  sumar/restar, tope en 30, cartel de fin, "seguir jugando", finalizar,
  ranking reflejando la victoria, modo espectador, "tomar el control" y
  borrado con contraseña. **Todos los datos de prueba se borraron al
  terminar** — la base quedó exactamente como estaba (11 jugadores,
  3 partidas de El Estratega finalizadas, 0 de truco).

**Tanda 11b — arreglos que salieron de probar lo anterior:**

- **`NEXT_REDIRECT` en pantalla**: los formularios de alta envuelven la
  llamada al server action en try/catch para mostrar errores, y eso
  atrapaba también el "error" especial que tira `redirect()`. Se agregó
  `src/lib/is-redirect-error.ts` y ahora se re-lanza. Afectaba también al
  alta de partidas de El Estratega (se veía un parpadeo de "NEXT_REDIRECT"
  antes de navegar).
- **Borrar partida ya no usa `window.prompt`**: el campo de contraseña
  ahora va dentro de la página (`delete-game-button.tsx`, un solo
  componente para El Estratega y truco vía prop `kind`). Además de verse
  mejor, esto destraba el pendiente histórico de no poder probar el
  borrado con contraseña: `window.prompt` (y también `confirm`) congelan
  la pestaña bajo automatización. **Verificado en vivo esta sesión.**
- **`autoComplete="new-password"`** en los campos de contraseña: Chrome
  autocompletaba una clave guardada de otro sitio y la concatenaba con lo
  tipeado (se vio de verdad probando: quedaba `vokoaleestratega`). Ojo:
  `autoComplete="off"` **no** alcanza, Chrome lo ignora en campos de
  password.
- El cartel de "¿finalizar?" del truco es propio y no `confirm()` nativo,
  por lo mismo: se ve mejor en el celular y no bloquea la pestaña.

### Falta para que funcione en producción

Nada bloqueante. Lo que queda es menor/opcional:

1. ~~Borrar los jugadores de prueba `TestProd3`/`TestProd4`~~ — hecho por
   el usuario, la base ya no los tiene.
2. Probar en producción, a mano, lo que sigue usando `window.prompt` y no
   se puede automatizar: renombrar/borrar jugador con contraseña y cambiar
   la foto de un jugador ya creado con contraseña (`player-card.tsx` y
   `editable-player-avatar.tsx`). Si molesta, se pueden pasar al mismo
   patrón de campo inline que ya usan borrar partida y "tomar el control".
   (Borrar partida con contraseña **ya quedó verificado**, ver tanda 11b.)
3. Si se quiere un dominio propio en vez de `estratega-taupe.vercel.app`,
   configurarlo en Vercel (Settings → Domains). No es necesario para que
   funcione, es solo estético.
4. Opcional: borrar el Blob store viejo (`estratega-blob`, privado,
   vacío, sin usar) desde el dashboard de Vercel — no rompe nada si se
   deja, pero no sirve para nada.

### Pendiente / no pedido todavía (no implementado a propósito)

- Autenticación real (el usuario eligió acceso libre sin login; el dueño de
  la partida es una cookie de dispositivo y el resto usa una contraseña
  compartida hardcodeada, no es auth real).
- Puntajes negativos o fuera de `QUICK_POINTS` en El Estratega (el usuario
  eligió solo botones rápidos, sin carga manual).
- Deshacer más de una ronda atrás (solo se puede volver un paso).
- En el truco no hay historial de manos ni "volver atrás" más allá del `−`.
- Los rankings de truco no muestran partidas jugadas ni porcentaje: el
  usuario pidió explícitamente **solo ganadas**.

## Decisiones de producto (respuestas del usuario, 2026-09-04)

- **Acceso**: libre, sin login. Cualquiera con el link puede anotar.
- **Puntajes por ronda**: solo botones rápidos, sin carga manual ni
  negativos. Originalmente +0 a +5; en la tanda 9 el usuario pidió sacar
  el +1 (nunca se usa) y agregar +6 y +7, así que ahora son
  `[0, 2, 3, 4, 5, 6, 7]` — ver `src/lib/quick-points.ts` (fuente única,
  usada tanto por el botón como por la validación del server action).
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
- **Estética (feedback 2026-09-04, segunda ronda)**: sin barra superior
  (menú flotante en vez de nav en una barra), menú lateral desde la
  izquierda (no la derecha), color de interfaz rojo en vez de azul
  (manteniendo dark mode; el logo UTN sigue azul, es el emblema oficial),
  poder editar y borrar jugadores (no solo la foto).
- **Borrar jugador**: sin contraseña (a diferencia de borrar partida). Si
  el jugador ya jugó alguna partida, el borrado se bloquea con un mensaje
  claro en vez de romper el historial de esa partida (por la FK
  `Restrict` en el schema) — no se pidió explícitamente pero es la
  consecuencia lógica de no permitir huérfanos en `GameParticipant`.
- **Fondo de imagen (tanda 4)**: la imagen que pasó el usuario (emblema
  UTN estilo tarot, rojo/negro) es el fondo de **toda** la app, no solo
  la home — fijo, con un overlay oscuro encima para legibilidad. El logo
  chico de la UTN se sacó de la home porque el fondo ya cumple ese rol.
  La home se re-centró y se compactó el podio para que se vea todo
  (título + botón + podio) sin scroll.
- **Contraseña para editar jugadores (tanda 7)**: el usuario quiere ser el
  único que controla ediciones — crear un jugador (con o sin foto) es
  libre para cualquiera, pero renombrar/borrar un jugador o cambiarle la
  foto después de creado pide la misma contraseña que borrar partida
  (`"estratega"`). La idea explícita del usuario: si alguien necesita
  editar algo, él le pasa la contraseña en el momento.

### Decisiones de producto de la sesión 2026-09-11

- **Solo anota el que inicia la partida**: los espectadores ven el marcador
  en vivo pero no lo pueden tocar, **sin login**. Se resuelve con una
  cookie de dispositivo (ver tanda 10), no con cuentas.
- **Recuperar el control**: con la contraseña compartida `"estratega"`,
  no con un código por partida. El usuario eligió la opción más simple, la
  misma clave que ya usa para todo lo demás.
- **El truco va en una sección aparte**, no mezclado con las partidas de
  El Estratega, y su ranking es independiente (no suma a `/tops`).
- **Truco a 30**, con malas y buenas separadas en el marcador, como el
  anotador criollo. **No se puede pasar de 30.**
- **Al llegar a 30 pregunta, no finaliza sola.** Si contestás que no, la
  partida sigue y queda el botón "Finalizar partida" para cuando quieras.
- **Los `+` y `−` suman de a uno**, sin atajos de +2/+3. Es lo más fiel al
  anotador de verdad y el `−` sirve para corregir.
- **Tres modalidades y tres rankings**: solitario (1v1), dúo (2v2) y trío
  (3v3). El usuario pidió el 1v1 expresamente después de la primera ronda
  de preguntas.
- **Los rankings de truco muestran solo partidas ganadas**, igual que
  `/tops` — nada de partidas jugadas ni porcentajes.
- **Los equipos no llevan nombre**: se identifican por las fotos y los
  nombres de los jugadores, así el alta tiene menos pasos.
- **Los cigarrillos van encendidos, con brasa.**

## Decisiones técnicas y por qué

- **`put()` de `@vercel/blob` siempre con `token: process.env.BLOB_READ_WRITE_TOKEN`
  explícito**, nunca implícito. Sin el `token` explícito, en este proyecto
  el SDK terminaba resolviendo el store de Blob viejo (privado) en vez del
  que realmente está en esa env var — ver tanda 6 para el detalle. Si en
  el futuro se agrega otra llamada a `put()`/`del()`/etc., pasarle el
  token siempre por las dudas.
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
- **Sin autenticación de usuarios, pero sí dueño de partida**: no hay
  login. Lo que sí hay es la cookie de dispositivo de `src/lib/owner.ts`:
  toda mutación que toque puntos empieza con `assertCanScore(gameId)`, del
  lado del **server action**. Esconder botones en el cliente no alcanza —
  si mañana se agrega otra acción que cambie puntos, hay que agregarle la
  guarda ahí también.
- **La cookie de dueño se guarda hasheada** (`SHA-256`) en la base, nunca
  en crudo, y la cookie es `httpOnly` para que no se pueda leer ni
  falsificar desde JS.
- **Los topes de puntaje del truco viven en el `where` del `updateMany`**,
  no en un read-modify-write: `pointsA: { lt: 30 }` para sumar y
  `{ gt: 0 }` para restar. Así el incremento es atómico y toques rápidos
  seguidos no se pisan entre sí. Mismo criterio que los `updateMany`
  condicionales de `closeRound`/`finishGame` (ver tanda 8).
- **El ranking de truco se calcula al vuelo**, no con contadores guardados
  como `Player.wins`. Son pocas partidas, y así borrar una la saca del
  ranking sin tener que acordarse de descontar nada (que es justo lo que
  sí hay que hacer en `deleteGame` de El Estratega).
- **Nada de `window.prompt` ni `confirm()` en código nuevo**: congelan la
  pestaña entera y hacen imposible probar el flujo con el navegador
  automatizado (pasó en la tanda 7 y de nuevo esta sesión). Los diálogos
  nuevos son componentes de la propia página. Queda `confirm()` viejo en
  `game-board.tsx` y `window.prompt` en `player-card.tsx` /
  `editable-player-avatar.tsx`.
- **`autoComplete="new-password"` en todo campo de contraseña**: Chrome
  ignora `autoComplete="off"` en inputs de tipo password y autocompleta
  claves guardadas de otros sitios, concatenándolas con lo que tipeás.
- **`redirect()` dentro de un try/catch hay que re-lanzarlo**: se propaga
  como un error con `digest` que arranca con `NEXT_REDIRECT`. Ver
  `src/lib/is-redirect-error.ts`.
- **Credenciales reales solo en `.env` local**: cuando el usuario pasa
  secretos de producción por el chat (pasó en la tanda 3), van directo a
  `.env` (gitignorado), nunca a `.env.example` ni a ningún archivo
  commiteado, y no se repiten en texto en las respuestas.

## Estructura relevante

```
prisma/schema.prisma          Player, Game, GameParticipant, Round, RoundScore,
                               TrucoGame, TrucoMember
src/lib/prisma.ts             singleton de PrismaClient
src/lib/admin-password.ts     ADMIN_PASSWORD ("estratega") + assertAdminPassword()
src/lib/owner.ts              cookie de dispositivo + isOwner/assertOwner (dueño de partida)
src/lib/quick-points.ts       QUICK_POINTS de El Estratega [0,2,3,4,5,6,7]
src/lib/truco.ts              reglas del truco: TRUCO_TARGET=30, malas/buenas, modalidades
src/lib/is-redirect-error.ts  para no tragarse el redirect() en un try/catch
src/lib/actions/players.ts    createPlayer (sin contraseña), updatePlayerPhoto,
                               updatePlayerName, deletePlayer (estas 3 piden contraseña)
src/lib/actions/games.ts      createGame, setRoundScore, closeRound, finishGame,
                               goBackOneRound (estas 4 exigen ser el dueño),
                               deleteGame y claimGame (piden contraseña)
src/lib/actions/truco.ts      createTrucoGame, addTrucoPoint, finishTrucoGame (exigen
                               dueño), claimTrucoGame y deleteTrucoGame (contraseña)
src/app/icon.png               ícono de la app (recorte del emblema de fondo-estratega.jpg)
src/components/side-nav.tsx         hamburguesa flotante + menú en 3 secciones
src/components/podium.tsx           podio animado del top 3 (home)
src/components/game-board.tsx       UI del anotador de El Estratega (client component)
src/components/truco-board.tsx      UI del anotador de truco + cartel de fin de partida
src/components/cigarette-tally.tsx  los cuadraditos de cigarrillos en SVG
src/components/new-game-form.tsx    selector de participantes de El Estratega
src/components/new-truco-game-form.tsx  modalidad + armado de los dos equipos
src/components/claim-control.tsx    cartel "Estás mirando" + "Tomar el control"
src/components/player-avatar.tsx    avatar con foto o iniciales (solo lectura)
src/components/editable-player-avatar.tsx  avatar + cambio de foto (click abre file picker)
src/components/player-card.tsx      tarjeta de jugador: avatar editable + nombre editable + borrar
src/components/delete-game-button.tsx   tacho + campo de contraseña inline (kind: estratega|truco)
src/app/page.tsx               home: título + "Iniciar partida" + link a truco + podio
src/app/layout.tsx             fondo fijo de imagen + overlay oscuro (bg-background/65)
src/app/jugadores/page.tsx
src/app/partidas/page.tsx      · /nueva · /[id]
src/app/tops/page.tsx
src/app/truco/page.tsx         · /nueva · /[id] · /tops (los 3 rankings)
public/utn-logo.jpg            emblema UTN suelto (dominio público) — ya no se usa en ninguna
                                página, quedó del diseño viejo; no hace daño pero se puede borrar
public/fondo-estratega.jpg      fondo de pantalla de toda la app (imagen que pasó el usuario)
```

No existe `src/components/site-header.tsx` — se borró en la tanda 3 junto
con la barra superior. Si algo lo referencia, es código viejo a limpiar.

## Convención para esta bitácora

Cada sesión que termine con cambios commiteados debe actualizar, antes del
commit final de la sesión:

1. La fecha y el resumen de "Estado actual".
2. Qué se resolvió de la lista de pendientes (tachar o borrar el ítem).
3. Qué queda pendiente y por qué (bloqueado por algo del usuario, decisión
   pendiente, etc.).
4. Cualquier decisión de producto o técnica nueva, con el motivo.
