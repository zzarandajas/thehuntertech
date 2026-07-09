// Etapas de pipeline por defecto. Fuente única usada por la plantilla "Por
// defecto" (seeds) y como fallback al crear un mandato sin plantilla.
// El orden del array define el `orden` de cada etapa.
export interface EtapaPipelineDef {
  nombre: string;
  color: string;
  esFinal: boolean;
}

export const ETAPAS_PIPELINE_DEFAULT: EtapaPipelineDef[] = [
  { nombre: 'Sourcing', color: '#64748b', esFinal: false },
  { nombre: 'Longlist', color: '#0ea5e9', esFinal: false },
  { nombre: 'Shortlist', color: '#6366f1', esFinal: false },
  { nombre: 'Presentado', color: '#8b5cf6', esFinal: false },
  { nombre: 'Entrevista cliente', color: '#f59e0b', esFinal: false },
  { nombre: 'Oferta', color: '#10b981', esFinal: false },
  { nombre: 'Contratado', color: '#16a34a', esFinal: true },
  { nombre: 'Descartado', color: '#ef4444', esFinal: true },
];

// Mapa de la clave enum antigua → orden (1-based) de la etapa por defecto
// equivalente. Lo usan los seeds para asignar la etapa correcta.
export const ENUM_ETAPA_A_ORDEN: Record<string, number> = {
  sourcing: 1,
  longlist: 2,
  shortlist: 3,
  presentado: 4,
  entrevista_cliente: 5,
  oferta: 6,
  contratado: 7,
  descartado: 8,
};
