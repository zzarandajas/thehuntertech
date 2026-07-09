# Fase 1 — Gestión de actividad (tareas, recordatorios y envejecimiento de pipeline)

> Estado: **Backend implementado**. Frontend (página de tareas, badges y aviso de
> días-en-etapa) **pendiente** — en pausa hasta que el refactor de etapas dinámicas
> del pipeline (`ProcesoEtapa` / plantillas) quede estable.

## Por qué

El consultor de executive search vive de hacer seguimiento: llamar a un candidato,
enviar un email, agendar una entrevista, retomar a alguien "en el aire". Hasta ahora
la app registraba interacciones **pasadas** (`CandidatoInteraccion`) pero no había
forma de anotar lo que **queda por hacer** ni de detectar candidatos atascados. Esta
fase añade tareas/recordatorios y una alerta de envejecimiento del pipeline.

## Qué aporta al negocio

- **Nada se cae del radar**: cada tarea tiene responsable y fecha de vencimiento.
- **Foco diario**: el consultor ve sus pendientes, lo vencido y lo de hoy.
- **Detección de cuellos de botella**: un candidato que lleva demasiados días en la
  misma etapa aparece en la lista de "envejecimiento", para reactivarlo o descartarlo.

## Modelo de datos

### `Tarea` (tabla `tareas`)
Tarea o recordatorio del consultor.

| Campo | Tipo | Notas |
|-------|------|-------|
| `titulo` | string | Obligatorio |
| `descripcion` | text | Opcional |
| `tipo` | enum | `llamada`, `email`, `entrevista`, `seguimiento` (def.), `otro` |
| `dueAt` | date | Fecha de vencimiento (opcional) |
| `completadaAt` | date | Se rellena al marcar completada; `null` = pendiente |
| `asignadoA` | FK Usuario | Responsable (por defecto, quien la crea) |
| `creadoPor` | FK Usuario | Autor |
| `procesoId` / `candidatoId` / `clienteId` / `procesoCandidatoId` | FK opcionales | Contexto: la tarea "cuelga" de lo que aplique |

Una tarea puede no tener contexto (recordatorio suelto) o colgar de un mandato,
un candidato, un cliente o una participación concreta del pipeline.

### `ProcesoCandidato.etapaActualizadaAt` (columna nueva)
Marca de tiempo del último cambio de etapa de una participación. Se usa para
calcular el **tiempo-en-etapa** (envejecimiento). Se reinicia cada vez que el
candidato cambia de etapa en el board.

## Endpoints (API privada `/api`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/tareas` | Lista tareas. Filtros: `asignadoA`, `pendientes=true`, `overdue=true`, `candidatoId`, `procesoId`, `clienteId` |
| `POST` | `/tareas` | Crea una tarea (autor = usuario autenticado) |
| `PATCH` | `/tareas/:id` | Edita o completa (`{ completada: true }`) |
| `DELETE` | `/tareas/:id` | Elimina |
| `GET` | `/pipeline/aging?dias=N` | Participaciones sin cambio de etapa desde hace más de `N` días (por defecto 14). Excluye etapas terminales (`esFinal`) |

## Reglas de negocio

- **Vencida (overdue)**: tarea sin completar cuya `dueAt` es anterior a ahora.
- **Envejecimiento**: sólo cuentan las etapas "vivas"; las etapas finales (contratado,
  descartado…) no envejecen porque no son un cuello de botella. El corte por defecto
  es 14 días y es parametrizable.
- Al **añadir** un candidato al pipeline o **cambiar** su etapa, `etapaActualizadaAt`
  se pone a la fecha actual.

## Frontend (pendiente)

- `frontend/src/api/tareas.ts` — cliente de la API.
- Página **"Mis tareas"** (`/tareas`): pendientes, vencidas y de hoy; crear/completar.
- **Badge** de tareas vencidas en la barra de navegación (`MainLayout`).
- Botón **"Nueva tarea"** desde ficha de candidato, mandato y tarjeta del pipeline.
- Indicador de **días-en-etapa** en las tarjetas del board (ámbar/rojo según umbral).

## Cómo probar (una vez completado el frontend)

1. Crear una tarea con `dueAt` en el pasado → aparece en "vencidas".
2. Marcarla completada → sale de la lista de pendientes.
3. Mover una tarjeta de etapa en el board → su contador de días-en-etapa se reinicia
   y deja de listarse en `/pipeline/aging`.

## Ficheros

- `backend/src/models/Tarea.ts`
- `backend/src/models/ProcesoCandidato.ts` (columna `etapaActualizadaAt`)
- `backend/src/migrations/20260708120000-create-tareas.cjs`
- `backend/src/migrations/20260708120100-alter-proceso-candidatos-add-etapa-fecha.cjs`
- `backend/src/services/taskService.ts`
- `backend/src/services/pipelineService.ts` (`pipelineEnvejecido`)
- `backend/src/controllers/tareasController.ts`
- `backend/src/controllers/pipelineController.ts` (`/pipeline/aging`)
