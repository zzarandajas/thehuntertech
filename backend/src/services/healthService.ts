// Capa de servicio: contiene la lógica de negocio y (a partir del Sprint 1) accede a los
// modelos. El controlador la invoca; nunca al revés.

export interface EstadoSalud {
  ok: boolean;
}

export function obtenerEstadoSalud(): EstadoSalud {
  return { ok: true };
}
