# Fase 4 — IA: parsing de CV y matching mandato ↔ pool

> Estado: **Backend y frontend implementados** (typecheck limpio en ambos; guardas
> del servicio validadas en runtime). Falta la prueba de punta a punta con
> `ANTHROPIC_API_KEY` + MySQL + un PDF real.

## Por qué

Dos fricciones caras en executive search: (1) dar de alta candidatos a mano desde
un CV, y (2) recordar quién del pool encaja en cada mandato nuevo. Esta fase usa
Claude para automatizar ambas: extraer los datos de un CV en PDF y puntuar el pool
contra un mandato.

## Qué aporta al negocio

- **Alta de candidato en segundos**: se sube el PDF y el formulario llega prellenado
  (el consultor revisa antes de guardar — la IA no crea nada por su cuenta).
- **Aprovechar el pool**: ante un mandato nuevo, un ranking con justificación evita
  que buenos candidatos ya conocidos se queden olvidados.
- **Diferenciador**: capacidades que las herramientas internas clásicas no tienen.

## Cómo funciona (técnico)

- SDK oficial **`@anthropic-ai/sdk`** (TypeScript).
- Modelo por defecto **`claude-opus-4-8`**; configurable con la variable de entorno
  **`ANTHROPIC_MODEL`** (p.ej. `claude-sonnet-5` para reducir coste en alto volumen).
- Requiere **`ANTHROPIC_API_KEY`** en `backend/.env`. Si falta, los endpoints
  responden **503** con un mensaje claro (no rompen el arranque).
- **Parsing de CV**: el PDF se envía **directamente a Claude** como bloque
  `document` en base64 (soporte nativo de PDF — sin librería de extracción). La
  respuesta se restringe con **structured outputs** (`output_config.format` +
  JSON schema), así que siempre es JSON válido.
- **Matching**: se construye un resumen compacto del mandato (dimensiones de
  evaluación, cliente, vertical) y de hasta **40** candidatos del pool (skills,
  trayectoria), y se pide a Claude un ranking 0-100 con justificación, usando
  **adaptive thinking** + `effort: high` y structured output.

## Endpoints (API privada `/api`)

| Método | Ruta | Cuerpo / Params | Descripción |
|--------|------|-----------------|-------------|
| `POST` | `/talento/parse-cv` | `multipart/form-data`, campo `cv` (PDF ≤ 10 MB) | Devuelve datos estructurados para prellenar el alta de candidato |
| `GET` | `/procesos/:id/matches` | — | Candidatos del pool ordenados por idoneidad para el mandato, con `score` y `justificacion` |

### Respuesta de `parse-cv`
```json
{
  "nombre": "…", "email": "…", "telefono": "…", "linkedinUrl": "…",
  "ciudadResidencia": "…", "idiomas": "…", "formacion": "…",
  "experiencias": [{ "empresa": "…", "cargo": "…", "periodo": "…", "descripcion": "…" }],
  "skills": ["…"]
}
```

### Respuesta de `matches`
```json
[{ "candidatoId": 12, "nombre": "…", "score": 87, "justificacion": "…" }]
```

## Reglas / salvaguardas

- Sólo se admite **PDF** (otros formatos → 400).
- Límite de **10 MB** por CV.
- Sin `ANTHROPIC_API_KEY` → **503** degradado (la UI deberá mostrar aviso, no crashear).
- El matching **cachea nada** por ahora y limita el pool a 40 candidatos (control de
  coste/tokens); ampliable a filtro previo + capa semántica más adelante.
- La IA **no persiste** candidatos ni los añade al pipeline: siempre hay revisión humana.

## Frontend (implementado)

- `frontend/src/api/ia.ts` — cliente de los dos endpoints.
- **Alta de candidato** (`TalentoListPage`): botón **"Rellenar desde CV (PDF)"** en el
  modal de nuevo candidato → sube el PDF, prellena nombre/email/LinkedIn; el usuario
  revisa y completa el resto en la ficha antes de guardar.
- **Ficha de mandato** (`MandatoDetailPage`): tarjeta **"Candidatos sugeridos (IA)"**
  con botón "Sugerir con IA"; tabla con score (tag por color + número), justificación,
  enlace a la ficha y **"Añadir al pipeline"** (reutiliza `agregarCandidatoAPipeline`).
- Estados de carga (`loading` en botones) y avisos cuando la IA no está disponible
  (503 → warning, no crashea) o el archivo no es PDF (400).

## Cómo probar

1. Poner `ANTHROPIC_API_KEY` en `backend/.env` (opcional: `ANTHROPIC_MODEL=claude-sonnet-5`).
2. `POST /api/talento/parse-cv` con un PDF real → JSON coherente (revisar skills/experiencia).
3. `GET /api/procesos/:id/matches` de un mandato con dimensiones/candidatos → ranking coherente.
4. Sin API key → ambos endpoints responden 503 con mensaje (verificado en el guardado del servicio).

## Ficheros

- `backend/src/services/aiService.ts`
- `backend/src/controllers/aiController.ts` (montado en `app.ts`)
- `backend/package.json` (`@anthropic-ai/sdk`, `multer`, `@types/multer`)
