# PROMPT INICIAL PARA CLAUDE CODE
## Proyecto: Herramienta interna de Executive Search — TheHunter.tech

Copia todo este documento como primer mensaje a Claude Code dentro del repo vacío (o pégalo en `docs/PROMPT_INICIAL.md` y dile "lee y ejecuta docs/PROMPT_INICIAL.md").

---

## 0. Rol y forma de trabajar

Eres el desarrollador full-stack de este proyecto. Vas a construir, de forma incremental y por sprints, una aplicación interna para una boutique de Executive Search (TheHunter.tech) que gestiona una **base de datos de candidatos** reutilizable, **mandatos** (procesos de búsqueda) por cliente, un **pipeline** tipo Kanban, y la generación de **informes ejecutivos** para el Board de cada cliente.

Reglas de trabajo:
1. Trabaja **sprint a sprint**, en el orden indicado en la sección 8. No empieces el siguiente sprint hasta que yo confirme que el anterior está bien.
2. Al terminar cada sprint: haz `git commit` con mensaje descriptivo, y dame un resumen de máximo 8 líneas de qué se construyó, qué decisiones tomaste que no estaban explícitas en este prompt, y cómo probarlo manualmente.
3. Si algo del modelo de datos o de un endpoint es ambiguo, toma la decisión más simple y razonable, documéntala en `docs/DECISIONES.md` (créalo si no existe), y sigue adelante — no me preguntes por cosas menores, sí pregúntame si afecta a seguridad, autenticación, o borrado de datos.
4. Todo el código, nombres de tablas/columnas, y mensajes de error de la API en **español**. Nombres de variables/funciones en inglés siguiendo convención TypeScript estándar (camelCase) está bien si es más natural para el código, pero los nombres de modelos/tablas de dominio deben quedarse en español tal como se listan abajo (`Candidato`, `Mandato`, etc.), porque así los va a leer y mantener el equipo.

---

## 1. Stack técnico (fijo, no cambiar)

- **Backend:** Node.js + TypeScript + Express + Sequelize (ORM) + MySQL 8.
- **Frontend:** React 18 + TypeScript + Vite + Ant Design 5.
- **Infraestructura:** Docker + docker-compose (mysql, backend, frontend como servicios separados).
- **Autenticación:** JWT + bcrypt para hash de contraseñas.
- **PDF:** `@react-pdf/renderer` (no Puppeteer — evitamos Chromium en el contenedor).
- **Testing:** Jest + Supertest para endpoints críticos del backend.
- **Lint/format:** ESLint + Prettier en ambos proyectos.

---

## 2. Estructura de repositorio esperada

```
/
├── docker-compose.yml
├── docker-compose.override.yml       (dev: hot reload, bind mounts)
├── .env.example
├── docs/
│   ├── PROMPT_INICIAL.md             (este archivo)
│   └── DECISIONES.md                 (decisiones tomadas durante el desarrollo)
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── .sequelizerc
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   ├── middlewares/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   └── tests/
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── api/
        ├── auth/
        ├── layouts/
        ├── pages/
        ├── components/
        └── App.tsx
```

Usa **migraciones de Sequelize** (`sequelize-cli`), no `sync({ force: true })`, para que el esquema sea versionable y reproducible en cualquier entorno.

---

## 3. Modelo de datos completo (referencia para todas las migraciones)

> Nomenclatura de negocio: lo que en el modelo se llama `ProcesoSeleccion` se muestra en la UI como **"Mandato"**, y el rol `consultor` se muestra como **"Socio"**. Es solo etiqueta de interfaz, el nombre técnico de tabla/modelo puede quedarse como `ProcesoSeleccion`/`Usuario.rol='consultor'` internamente para no reñir con convenciones de Sequelize — decide tú el detalle y documéntalo en DECISIONES.md.

### 3.1. Acceso

```
Usuario
- id PK, nombre, email (unique), password_hash, rol ENUM('admin','consultor'), activo BOOLEAN default true
- ultimo_login DATETIME nullable

Cliente
- id PK, nombre, logo_url nullable, sector nullable, notas TEXT nullable, activo BOOLEAN default true

ClienteContacto
- id PK, cliente_id FK, nombre, email, cargo nullable
```

### 3.2. Catálogos (todos administrables por rol admin, todos con `activo BOOLEAN default true`)

```
DimensionCatalogo
- id PK, codigo (unique), nombre, descripcion TEXT nullable, categoria nullable, orden INT

Vertical
- id PK, codigo (unique), nombre, descripcion TEXT nullable

Skill
- id PK, nombre (unique), categoria nullable

OrigenCandidato
- id PK, nombre (unique)
```

Seed inicial obligatorio para `DimensionCatalogo` (del modelo de referencia CMO/CRO):
`Performance Marketing (paid, SEM, affiliate)` · `Gestión P&L / Presupuesto de medios a escala` · `Travel Tech & conocimiento del sector` · `AI en marketing (integración real)` · `Liderazgo de equipos globales (30+ personas)` · `Presencia ejecutiva / Board & inversores`

Seed inicial obligatorio para `Vertical`:
`Consejos y Consejos Asesores` · `CIO/CTO/CISO` · `Director Digital` · `Director de Datos` · `CEO/Director General` · `CMO/CRO` · `CFO` · `Heads of Engineering/Sales/Data`

Seed inicial sugerido para `OrigenCandidato`:
`CIONET` · `Red de socios` · `Sourcing directo` · `Comunidad THT` · `Referido`

### 3.3. Mandatos (procesos de selección)

```
ProcesoSeleccion
- id PK, cliente_id FK, vertical_id FK, titulo, confidencialidad default 'Uso exclusivo del Board del Cliente'
- estado ENUM('abierto','cerrado','archivado'), anonimizar_nombres BOOLEAN default false
- created_by FK Usuario

ProcesoDimension
- id PK, proceso_id FK, dimension_id FK DimensionCatalogo, orden INT
- UNIQUE(proceso_id, dimension_id)

ProcesoConsultor
- id PK, proceso_id FK, usuario_id FK, rol_en_proceso ENUM('lead','soporte')
- UNIQUE(proceso_id, usuario_id)
```

### 3.4. Base de talento (candidatos — entidad global reutilizable)

```
Candidato
- id PK, nombre, email nullable, telefono nullable, linkedin_url nullable
- ciudad_residencia nullable, idiomas nullable, formacion TEXT nullable
- origen_id FK OrigenCandidato nullable
- disponibilidad ENUM('activo_busqueda','abierto_a_ofertas','no_disponible','colocado','desconocido') default 'desconocido'
- cv_url nullable, salario_actual_estimado nullable, ultima_actividad_at DATETIME nullable
- consentimiento_rgpd BOOLEAN default false, fecha_consentimiento DATETIME nullable
- notas_internas TEXT nullable

CandidatoExperiencia
- id PK, candidato_id FK, empresa, cargo nullable, periodo, descripcion TEXT, orden INT

CandidatoSkill
- id PK, candidato_id FK, skill_id FK Skill, nivel nullable
- UNIQUE(candidato_id, skill_id)

CandidatoInteraccion
- id PK, candidato_id FK, usuario_id FK, tipo ENUM('llamada','email','reunion','nota','linkedin'), fecha DATETIME, resumen TEXT

CandidatoDocumento
- id PK, candidato_id FK, tipo ENUM('cv','otro'), nombre_archivo, path, subido_por FK Usuario
```

> Nota RGPD: NO implementes ningún campo de género/etnia/diversidad en este sprint. Está deliberadamente fuera del alcance del MVP (ver plan completo, sección 1.8.d). Si en algún momento te piden añadirlo, para y pregunta primero.

### 3.5. Participación candidato↔mandato (lo específico de cada búsqueda)

```
ProcesoCandidato
- id PK, proceso_id FK, candidato_id FK, orden INT
- etapa ENUM('sourcing','longlist','shortlist','presentado','entrevista_cliente','oferta','contratado','descartado') default 'sourcing'
- posicion_actual_snapshot nullable, expectativa_salarial nullable, fecha_incorporacion DATETIME
- UNIQUE(proceso_id, candidato_id)

CandidatoMetrica
- id PK, proceso_candidato_id FK, valor, descripcion, orden INT

CandidatoDimensionScore
- id PK, proceso_candidato_id FK, dimension_id FK DimensionCatalogo, score INT (0-100, validar rango), comentario TEXT nullable
- UNIQUE(proceso_candidato_id, dimension_id)

CandidatoObservacion
- id PK, proceso_candidato_id FK, tipo ENUM('fortaleza','punto_explorar'), texto TEXT, orden INT
```

### 3.6. Informes y compartición

```
Informe
- id PK, proceso_id FK, version INT (autoincremental por proceso_id, no global)
- generado_por FK Usuario, fecha_generacion DATETIME
- snapshot_json JSON, pdf_path nullable

InformeShareLink
- id PK, informe_id FK, token (unique, string largo, alta entropía), expires_at DATETIME
- creado_por FK Usuario, revocado BOOLEAN default false
```

---

## 4. Convenciones de backend

- Columnas de BD en `snake_case`, atributos de modelo Sequelize en `camelCase` (usar `field:` en la definición del modelo para mapear).
- Todas las tablas con `createdAt`/`updatedAt` (timestamps de Sequelize por defecto).
- Validaciones de rango (ej. `score` 0-100) a nivel de modelo Sequelize (`validate: { min: 0, max: 100 }`) — no confiar solo en el frontend.
- Un archivo de asociaciones central (`src/models/index.ts`) que registre todas las relaciones (`hasMany`, `belongsTo`, `belongsToMany` donde aplique).
- Middleware `auth.ts`: verifica JWT en header `Authorization: Bearer <token>` en todas las rutas excepto `/api/auth/login` y `/public/*`.
- Middleware `requireRole(['admin'])` para rutas de gestión de catálogos y usuarios.
- Manejo de errores centralizado (`errorHandler.ts`) — nunca devolver stack traces en producción, sí en desarrollo.
- Variables sensibles (JWT_SECRET, DB_PASSWORD) solo por variables de entorno, nunca hardcodeadas. Genera `.env.example` con las claves necesarias pero sin valores reales.

---

## 5. Convenciones de frontend

- Cliente HTTP centralizado en `src/api/client.ts` (axios con interceptor que añade el JWT y redirige a login si recibe 401).
- `AuthContext` + `PrivateRoute` para proteger rutas salvo `/login` y `/public/informes/:token`.
- Formularios de scoring (`ProcesoCandidatoDrawer`) deben **iterar dinámicamente** las dimensiones asignadas al proceso (nunca hardcodear las 6 dimensiones del modelo de ejemplo en el JSX).
- Componentes reutilizables: `DimensionScoreBar`, `MetricasDestacadasBox`, `FortalezasTable` (columnas verde/ámbar).
- Ocultar en el menú lateral las secciones de Usuarios/Catálogos si `usuario.rol !== 'admin'`.

---

## 6. Endpoints (referencia completa — impleméntalos en el sprint que corresponda, ver sección 8)

```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/usuarios                        (admin)
POST   /api/usuarios                        (admin)
PATCH  /api/usuarios/:id                    (admin)

GET    /api/dimensiones                     (admin gestiona; resto lee)
POST   /api/dimensiones                     (admin)
PATCH  /api/dimensiones/:id                 (admin)

GET    /api/verticales
POST   /api/verticales                      (admin)

GET    /api/clientes
POST   /api/clientes
PATCH  /api/clientes/:id
GET    /api/clientes/:id/contactos
POST   /api/clientes/:id/contactos

GET    /api/procesos
POST   /api/procesos
GET    /api/procesos/:id
PATCH  /api/procesos/:id
POST   /api/procesos/:id/dimensiones
POST   /api/procesos/:id/consultores

GET    /api/candidatos                      ?search=&skill_id=&disponibilidad=&origen_id=
POST   /api/candidatos                      (con deduplicación por email/linkedin_url antes de crear)
GET    /api/candidatos/:id
PATCH  /api/candidatos/:id
PUT    /api/candidatos/:id/experiencia
PUT    /api/candidatos/:id/skills
POST   /api/candidatos/:id/interacciones
POST   /api/candidatos/:id/documentos

GET    /api/procesos/:id/pipeline
POST   /api/procesos/:id/candidatos
PATCH  /api/proceso-candidatos/:id
PUT    /api/proceso-candidatos/:id/metricas
PUT    /api/proceso-candidatos/:id/scores
PUT    /api/proceso-candidatos/:id/observaciones
DELETE /api/proceso-candidatos/:id

POST   /api/procesos/:id/informes/generar
GET    /api/procesos/:id/informes
GET    /api/informes/:id
GET    /api/informes/:id/pdf
POST   /api/informes/:id/share-links
PATCH  /api/share-links/:id/revocar

GET    /public/informes/:token
GET    /public/informes/:token/pdf

GET    /api/dashboard/stats
```

---

## 7. Docker Compose (punto de partida — ajústalo si algo no funciona en la práctica)

```yaml
services:
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_DATABASE: thehunter_app
      MYSQL_USER: app
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    environment:
      NODE_ENV: development
      DB_HOST: mysql
      DB_NAME: thehunter_app
      DB_USER: app
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - mysql
    ports:
      - "4000:4000"
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "8080:80"
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  mysql_data:
```

---

## 8. Orden de ejecución (sprints) — DETENTE al final de cada uno y espera confirmación

**Sprint 0 — Bootstrap**
- Scaffolding completo de `backend/` y `frontend/` según sección 2.
- `docker-compose up` debe levantar los 3 servicios sin errores.
- Backend expone `GET /api/health` → `{ ok: true }`.
- Frontend muestra una pantalla en blanco con AntD cargado correctamente (verificar theme/tokens básicos).
- Conexión Sequelize a MySQL verificada (log de conexión exitosa al arrancar).

**Sprint 1 — Autenticación y usuarios**
- Modelo `Usuario` + migración + seeder de un admin inicial (`npm run seed:admin`, con password leído de variable de entorno, nunca hardcodeado en el seeder).
- Endpoints `/api/auth/login`, `/api/auth/me`.
- Middleware `auth.ts` y `requireRole.ts`.
- Frontend: `LoginPage`, `AuthContext`, `PrivateRoute`, `MainLayout` con sider vacío.

**Sprint 2 — Clientes**
- Modelos `Cliente`, `ClienteContacto` + migraciones + CRUD + pantallas `ClientesListPage`/`ClienteDetailPage`.

**Sprint 3 — Catálogos**
- Modelos `DimensionCatalogo`, `Vertical`, `Skill`, `OrigenCandidato` + migraciones + seeders (sección 3.2) + CRUD admin + pantallas correspondientes.

**Sprint 4 — Mandatos**
- Modelos `ProcesoSeleccion`, `ProcesoDimension`, `ProcesoConsultor` + migraciones + CRUD + asignación de dimensiones/socios en UI.

**Sprint 5 — Base de talento**
- Modelos `Candidato`, `CandidatoExperiencia`, `CandidatoSkill`, `CandidatoInteraccion`, `CandidatoDocumento` + migraciones.
- Lógica de deduplicación por email/linkedin_url al crear.
- Endpoint de búsqueda avanzada + `TalentoListPage` + `CandidatoProfilePage`.

**Sprint 6 — Pipeline**
- Modelo `ProcesoCandidato` + migración + endpoint `/pipeline` + `PipelineBoard` (Kanban drag & drop AntD).

**Sprint 7 — Evaluación**
- Modelos `CandidatoMetrica`, `CandidatoDimensionScore`, `CandidatoObservacion` + migraciones.
- `ProcesoCandidatoDrawer` con formulario dinámico basado en las dimensiones del proceso.

**Sprint 8 — Informe y compartición**
- Modelo `Informe` (con snapshot_json) + `InformeShareLink` + migraciones.
- `InformePreviewPage` fiel al modelo de referencia (adjunto como PDF de ejemplo si está disponible en el repo).
- Export a PDF con `@react-pdf/renderer`.
- Vista pública `/public/informes/:token` sin layout de autenticación.

**Sprint 9 — Pulido**
- Filtros avanzados de talento, tests con Jest/Supertest de auth + generación de informe + validación de share-links expirados, revisión general de RGPD (campos de consentimiento, sin campos de diversidad implementados).

**Sprint 10 — Dashboard**
- Endpoint `/api/dashboard/stats` + pantalla de inicio con indicadores (mandatos activos/cerrados, candidatos en base, desglose por vertical, tiempo medio de cierre).

---

## 9. Empieza ahora

Empieza por el **Sprint 0**. Al terminarlo, dame el resumen indicado en la sección 0 y espera mi confirmación antes de continuar con el Sprint 1.
