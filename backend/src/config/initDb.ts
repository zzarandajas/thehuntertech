import sequelize from './database';
// Importar el índice de modelos registra TODOS los modelos y sus asociaciones en la
// instancia de Sequelize antes de sincronizar el esquema. Sin esto, sync() no vería
// algunas tablas ni sus claves foráneas.
import './../models';
import { seedCatalogos } from '../scripts/seedCatalogos';
import { seedAdmin } from '../scripts/seedAdmin';

// Sincroniza el esquema con los modelos al arrancar y siembra datos base.
// Controlado por la variable DB_SYNC:
//   alter (def.) -> sequelize.sync({ alter: true })  crea/ajusta tablas a los modelos
//   force        -> sequelize.sync({ force: true })   DROP + CREATE (¡borra datos!)
//   none|off|false -> no sincroniza (usa migraciones sequelize-cli manualmente)
//
// Aviso: alter:true es cómodo pero en MySQL con muchas FKs puede duplicar índices o
// fallar en cambios complejos. Para producción estable, migra a DB_SYNC=none + db:migrate.
export async function initDb(): Promise<void> {
  const modo = (process.env.DB_SYNC || 'alter').toLowerCase();

  if (modo === 'none' || modo === 'off' || modo === 'false') {
    console.log('[db] DB_SYNC=none: se omite sync (usa migraciones).');
  } else if (modo === 'force') {
    console.warn('[db] DB_SYNC=force: DROP + CREATE de todas las tablas (se pierden datos).');
    await sequelize.sync({ force: true });
    console.log('[db] Esquema recreado (force).');
  } else {
    await sequelize.sync({ alter: true });
    console.log('[db] Esquema sincronizado con los modelos (alter).');
  }

  // Siembra idempotente de datos base tras crear/ajustar el esquema.
  try {
    await seedCatalogos();
    await seedAdmin();
  } catch (err) {
    console.error('[db] Error sembrando datos base:', err);
  }
}
