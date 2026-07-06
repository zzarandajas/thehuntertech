# Decisiones de desarrollo — TheHunter.tech

Registro de decisiones tomadas durante el desarrollo cuando el prompt inicial era
ambiguo o el usuario dio indicaciones adicionales.

## Sprint 0 — Bootstrap

1. **Dev sin Docker.** El ciclo de desarrollo NO usa Docker (indicación del usuario).
   Backend en local con `nodemon` (`npm run dev`), frontend con `vite` (`npm run dev`).
   Docker (`docker-compose.yml`) queda solo para levantar el stack completo como
   despliegue (mysql + backend + frontend).

2. **MySQL de desarrollo = instalación local** en `localhost:3306`. El backend lee la
   conexión de `backend/.env` (copiado de `backend/.env.example`). En el stack Docker
   las mismas variables apuntan a `DB_HOST=mysql`.

3. **Commits manuales.** El asistente nunca ejecuta `git commit`; los commits los hace
   el usuario a mano. Esto anula la instrucción del prompt de commitear al cerrar sprint.

4. **Doble configuración de Sequelize.** `src/config/database.ts` provee la instancia
   en runtime para la app; `src/config/config.cjs` (referenciado por `.sequelizerc`)
   sirve a `sequelize-cli` para migraciones/seeders. Ambos leen las mismas variables de
   entorno (incluida `DB_PORT`).

5. **Migraciones versionadas, sin `sync({ force })`.** El esquema se gestiona con
   `sequelize-cli`. En Sprint 0 todavía no hay modelos de dominio ni migraciones.

6. **Nomenclatura dominio ↔ UI** (a aplicar en sprints siguientes): el modelo/tabla
   `ProcesoSeleccion` se mostrará en la interfaz como **"Mandato"**, y el rol
   `Usuario.rol='consultor'` se mostrará como **"Socio"**. Los nombres técnicos se
   mantienen para no reñir con convenciones de Sequelize.

7. **Arranque resiliente del backend.** `server.ts` reintenta la conexión a MySQL varias
   veces (la BD puede tardar en estar lista, sobre todo en el stack Docker) y, si no lo
   consigue, arranca igualmente el servidor HTTP para no bloquear `/api/health`.

8. **Imágenes Docker con Node 20.** Aunque el equipo local tenga Node 24, los
   contenedores usan `node:20` por reproducibilidad. El frontend en el stack se sirve
   como estáticos con `nginx:alpine`.

9. **Copia canónica del prompt** en `docs/PROMPT_INICIAL.md`; el original se conserva en
   `Documentacion funcional/PROMPT_INICIAL_CLAUDE_CODE.md`.

10. **Arquitectura backend por capas (indicación del usuario):**
    - **Controlador**: define sus propias rutas (exporta un `Router` de Express con sus
      endpoints) y delega la lógica en un servicio. No hay carpeta `routes/` separada.
    - **Servicio**: contiene la lógica de negocio y accede a los modelos (Sprint 1+).
    - **Modelo**: Sequelize (capa de datos).
    - **Capa server (`app.ts`)**: hace la **unión** de los endpoints de todos los
      controladores, montándolos bajo `/api`.
    - Flujo: `controller → service → model`. En Sprint 0 se aplica el patrón con
      `healthController → healthService` (sin modelo aún).

## Sprint 1 — Autenticación y usuarios

11. **`bcryptjs` en vez de `bcrypt`.** Mismo algoritmo bcrypt pero implementación pura JS,
    sin compilación nativa (node-gyp) — evita fallos de instalación en el dev Windows
    (Node 24) y en las imágenes Docker. API idéntica (`hash`/`compare`).

12. **JWT.** `authService` firma `{ sub, rol }` con `JWT_SECRET` y `JWT_EXPIRES` (def. 8h).
    Middleware `auth.ts` verifica el `Bearer` en todo excepto `/api/auth/login`,
    `/api/health` y `/public/*`. `requireRole(['admin'])` protege la gestión de usuarios.

13. **`dotenv` se carga lo primero** (`import 'dotenv/config'` al inicio de `app.ts` y
    `server.ts`). Necesario porque los middlewares/servicios leen `process.env.JWT_SECRET`
    a nivel de módulo; si dotenv cargaba después, el firmante y el verificador usaban
    secretos distintos y todos los tokens salían "inválidos".

14. **Nombre de BD `thehuntertech`** (según el `.env` del equipo), alineado en
    `docker-compose.yml`, `config.cjs` y `database.ts`.

15. **Seed admin idempotente** vía `npm run seed:admin` (`src/scripts/seedAdmin.ts`):
    lee `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_NOMBRE` del entorno, hashea con bcrypt y hace
    `findOrCreate` (crea o actualiza). Nunca hardcodea la contraseña.

16. **Frontend auth con `ui-ux-pro-max`.** Design system "Trust & Authority": navy
    `#0F172A` + azul CTA `#0369A1`, fondo `#F8FAFC`, tipografía Plus Jakarta Sans
    (`src/theme.ts`). Cliente axios centralizado (`api/client.ts`) con interceptores
    (añade JWT, redirige a `/login` en 401), `AuthContext` + `PrivateRoute`,
    `LoginPage` y `MainLayout` (sider vacío + dropdown de usuario con logout).
    Rol `consultor` se muestra como "Socio" en la UI.

## Sprints 3–10 (ejecutados de corrido, sin parar entre sprints)

21. **Sprint 3 — Catálogos.** `DimensionCatalogo`, `Vertical`, `Skill`, `OrigenCandidato`
    (migración combinada) + seed idempotente (`npm run seed:catalogos`: 6 dimensiones, 8
    verticales, 5 orígenes). CRUD genérico (lectura auth, escritura admin) vía factory
    `crudCatalogo`. UI: `CatalogosPage` (tabs) + `UsuariosPage`, ambas admin (ocultas en el
    menú si `rol !== admin`). Endpoint extra `GET /usuarios/seleccionables` (auth) para
    selectores.

22. **Sprint 4 — Mandatos.** `ProcesoSeleccion` (tabla `procesos`, UI "Mandato"),
    `ProcesoDimension`, `ProcesoConsultor` (uniques). Asignación de dimensiones/socios por
    reemplazo transaccional. UI: lista + detalle con asignación.

23. **Sprint 5 — Talento.** `Candidato` (+ experiencia/skills/interacciones/documentos).
    Dedup por email/linkedin_url (409 con `candidatoId` existente). Búsqueda con filtros
    (`search`, `skill_id`, `disponibilidad`, `origen_id`). Documentos: metadatos
    (nombre + path/URL), sin subida binaria todavía (multer queda pendiente). RGPD: campos
    `consentimiento_rgpd`/`fecha_consentimiento`; **sin** campos de diversidad.

24. **Sprint 6 — Pipeline.** `ProcesoCandidato` (etapas). `PipelineBoard` por columnas;
    el cambio de etapa se hace con un selector por tarjeta (no se añadió librería de
    drag&drop para no meter una dependencia frágil; se puede añadir después).

25. **Sprint 7 — Evaluación.** `CandidatoMetrica`, `CandidatoDimensionScore` (score 0-100
    validado en modelo y servicio), `CandidatoObservacion`. `ProcesoCandidatoDrawer` que
    **itera dinámicamente** las dimensiones del mandato. Componentes reutilizables
    `DimensionScoreBar`, `MetricasDestacadasBox`, `FortalezasTable`. `errorHandler` mapea
    errores de Sequelize a 400/409.

26. **Sprint 8 — Informes.** `Informe` (version incremental por proceso, `snapshot_json`
    inmutable) + `InformeShareLink` (token alta entropía, expiración, revocación). **PDF
    server-side con `@react-pdf/renderer`** (sin Chromium); se importa de forma perezosa
    (es ESM) para no romper Jest ni cargarlo salvo al generar PDF. Vista pública
    `/public/informes/:token` (+ `/pdf`) sin autenticación. UI: `InformeView` reutilizada
    en la vista privada y la pública.

27. **Sprint 9 — Pulido.** Tests Jest/Supertest: auth (login OK/401, rutas protegidas),
    generación de informe y validación de share-links (válido / expirado 410 / revocado
    410). `jest --forceExit`. Filtros de talento ya cubiertos en Sprint 5. RGPD revisado.

28. **Sprint 10 — Dashboard.** `GET /api/dashboard/stats` (mandatos activos/cerrados,
    candidatos en base, desglose por vertical, tiempo medio de cierre aprox.
    `updatedAt-createdAt` de cerrados). `HomePage` con tarjetas de indicadores + barras por
    vertical.

## Sprint 2 — Clientes

17. **Modelos `Cliente` y `ClienteContacto`** con asociación `Cliente hasMany ClienteContacto`
    (`as: 'contactos'`, `onDelete: CASCADE`). Asociaciones centralizadas en
    `src/models/index.ts`, que `app.ts` importa (`import './models'`) para registrarlas al
    arrancar (si no, los `include` fallan).

18. **`GET /api/clientes/:id` añadido** (no estaba en la lista del prompt) porque
    `ClienteDetailPage` necesita el detalle con sus contactos anidados. Devuelve el cliente
    con `contactos`.

19. **CRUD de clientes sin restricción de rol** (cualquier usuario autenticado), según la
    lista de endpoints del prompt (solo catálogos/usuarios son admin).

20. **Frontend clientes:** `ClientesListPage` (tabla + modal alta) y `ClienteDetailPage`
    (detalle editable + tabla de contactos + alta de contacto), con feedback vía
    `App.useApp().message` (por eso `App.tsx` envuelve todo en `<App>` de AntD). Menú
    lateral con navegación (Inicio, Clientes) y `selectedKeys` por ruta.
