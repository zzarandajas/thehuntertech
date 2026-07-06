import {
  sequelize,
  Usuario,
  Cliente,
  Vertical,
  ProcesoSeleccion,
} from '../src/models';
import {
  generarInforme,
  crearShareLink,
  revocarShareLink,
  obtenerInformePorToken,
} from '../src/services/informesService';

let procesoId = 0;
let clienteId = 0;
let informeId = 0;
let adminId = 0;

beforeAll(async () => {
  await sequelize.authenticate();
  const admin = await Usuario.findOne();
  const vertical = await Vertical.findOne();
  if (!admin || !vertical) {
    throw new Error('Faltan datos base (usuario admin / vertical). Ejecuta los seeders.');
  }
  adminId = admin.id;
  const cliente = await Cliente.create({ nombre: 'Cliente Test Informes' });
  clienteId = cliente.id;
  const proceso = await ProcesoSeleccion.create({
    clienteId: cliente.id,
    verticalId: vertical.id,
    titulo: 'Mandato Test Informes',
    createdBy: adminId,
  });
  procesoId = proceso.id;
});

afterAll(async () => {
  // El borrado del proceso arrastra en cascada informes y share-links.
  if (procesoId) await ProcesoSeleccion.destroy({ where: { id: procesoId } });
  if (clienteId) await Cliente.destroy({ where: { id: clienteId } });
  await sequelize.close();
});

describe('Informes y enlaces de compartición', () => {
  it('genera un informe con versión incremental y snapshot', async () => {
    const inf = await generarInforme(procesoId, adminId);
    informeId = inf.id;
    expect(inf.version).toBeGreaterThanOrEqual(1);
    expect(inf.snapshotJson).toBeTruthy();
  });

  it('un share-link válido resuelve el informe', async () => {
    const link = await crearShareLink(informeId, adminId, 7);
    const informe = await obtenerInformePorToken(link.token);
    expect(informe.id).toBe(informeId);
  });

  it('un share-link expirado devuelve error 410', async () => {
    const link = await crearShareLink(informeId, adminId, 7);
    link.expiresAt = new Date(Date.now() - 1000);
    await link.save();
    await expect(obtenerInformePorToken(link.token)).rejects.toMatchObject({ status: 410 });
  });

  it('un share-link revocado devuelve error 410', async () => {
    const link = await crearShareLink(informeId, adminId, 7);
    await revocarShareLink(link.id);
    await expect(obtenerInformePorToken(link.token)).rejects.toMatchObject({ status: 410 });
  });
});
