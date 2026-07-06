import { fn, col } from 'sequelize';
import { ProcesoSeleccion, Candidato, Vertical } from '../models';

// Indicadores del panel de inicio.
export async function obtenerStats() {
  const [activos, cerrados, archivados, totalCandidatos] = await Promise.all([
    ProcesoSeleccion.count({ where: { estado: 'abierto' } }),
    ProcesoSeleccion.count({ where: { estado: 'cerrado' } }),
    ProcesoSeleccion.count({ where: { estado: 'archivado' } }),
    Candidato.count(),
  ]);

  // Desglose de mandatos por vertical.
  const porVerticalRaw = await ProcesoSeleccion.findAll({
    attributes: ['verticalId', [fn('COUNT', col('ProcesoSeleccion.id')), 'total']],
    include: [{ model: Vertical, as: 'vertical', attributes: ['id', 'nombre'] }],
    group: ['ProcesoSeleccion.vertical_id', 'vertical.id'],
    raw: false,
  });
  const porVertical = porVerticalRaw.map((r) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vertical: (r as any).vertical?.nombre ?? '—',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    total: Number((r as any).get('total')),
  }));

  // Tiempo medio de cierre (aprox.: updatedAt - createdAt de los mandatos cerrados).
  const cerradosRows = await ProcesoSeleccion.findAll({
    where: { estado: 'cerrado' },
    attributes: ['createdAt', 'updatedAt'],
  });
  let tiempoMedioCierreDias = 0;
  if (cerradosRows.length) {
    const suma = cerradosRows.reduce(
      (acc, r) => acc + (new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime()),
      0,
    );
    tiempoMedioCierreDias = Math.round(suma / cerradosRows.length / (1000 * 60 * 60 * 24));
  }

  return {
    mandatos: { activos, cerrados, archivados },
    totalCandidatos,
    porVertical,
    tiempoMedioCierreDias,
  };
}
