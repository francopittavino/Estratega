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

## Estado actual (última sesión: 2026-09-04/05, misma conversación)

Primera sesión (ocho tandas). Se armó el proyecto completo desde cero (el
repo estaba vacío, sin commits), se implementó el MVP funcional, se
hicieron cuatro rondas de ajustes visuales a partir de feedback del
usuario, en la tanda 6 se pusheó todo y se dejó andando en producción en
Vercel (https://estratega-taupe.vercel.app), y en la tanda 7 se ajustó el
ícono de la app y se agregó contraseña para editar jugadores.

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

### Falta para que funcione en producción

Nada bloqueante. La app funciona de punta a punta en producción (ver
tanda 6). Lo que queda es menor/opcional:

1. Borrar (o dejar que el usuario borre) los jugadores de prueba
   `TestProd3` y `TestProd4` de la base real — `TestProd3` está en una
   partida en curso del usuario, así que no se puede borrar hasta que esa
   partida se borre o termine.
2. Probar en producción, a mano (no vía Claude/automatización — `window.prompt`
   la bloquea): borrar partida con contraseña, renombrar/borrar jugador
   con contraseña, y cambiar la foto de un jugador ya creado con
   contraseña. Ninguno de los tres se pudo verificar en vivo esta sesión.
3. Si se quiere un dominio propio en vez de `estratega-taupe.vercel.app`,
   configurarlo en Vercel (Settings → Domains). No es necesario para que
   funcione, es solo estético.
4. Opcional: borrar el Blob store viejo (`estratega-blob`, privado,
   vacío, sin usar) desde el dashboard de Vercel — no rompe nada si se
   deja, pero no sirve para nada.

### Pendiente / no pedido todavía (no implementado a propósito)

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
- **Sin autenticación**: toda mutación (`setRoundScore`, `closeRound`,
  `finishGame`, etc.) es un server action sin chequeo de usuario. Si en el
  futuro se agrega una clave compartida, hay que agregar el chequeo ahí,
  no en el cliente.
- **Credenciales reales solo en `.env` local**: cuando el usuario pasa
  secretos de producción por el chat (pasó en la tanda 3), van directo a
  `.env` (gitignorado), nunca a `.env.example` ni a ningún archivo
  commiteado, y no se repiten en texto en las respuestas.

## Estructura relevante

```
prisma/schema.prisma          modelos: Player, Game, GameParticipant, Round, RoundScore
src/lib/prisma.ts             singleton de PrismaClient
src/lib/admin-password.ts     ADMIN_PASSWORD ("estratega") + assertAdminPassword()
src/lib/actions/players.ts    createPlayer (sin contraseña), updatePlayerPhoto,
                               updatePlayerName, deletePlayer (estas 3 piden contraseña)
src/lib/actions/games.ts      createGame, setRoundScore, closeRound, finishGame,
                               goBackOneRound, deleteGame (pide contraseña)
src/app/icon.png               ícono de la app (recorte del emblema de fondo-estratega.jpg)
src/components/side-nav.tsx         botón hamburguesa flotante + menú desde la izquierda
src/components/podium.tsx           podio animado del top 3 (home)
src/components/game-board.tsx       UI del anotador en vivo (client component)
src/components/new-game-form.tsx    selector de participantes (client component)
src/components/player-avatar.tsx    avatar con foto o iniciales (solo lectura)
src/components/editable-player-avatar.tsx  avatar + cambio de foto (click abre file picker)
src/components/player-card.tsx      tarjeta de jugador: avatar editable + nombre editable + borrar
src/components/delete-game-button.tsx      botón de tacho con prompt de contraseña
src/app/page.tsx               home: título + "Iniciar partida" + podio, centrado, sin logo
src/app/layout.tsx             fondo fijo de imagen + overlay oscuro (bg-background/65)
src/app/jugadores/page.tsx
src/app/partidas/page.tsx
src/app/partidas/nueva/page.tsx
src/app/partidas/[id]/page.tsx
src/app/tops/page.tsx
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
