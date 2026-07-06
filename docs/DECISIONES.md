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
