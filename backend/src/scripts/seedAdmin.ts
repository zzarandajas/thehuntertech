import 'dotenv/config';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import Usuario from '../models/Usuario';

// Crea (o actualiza) el usuario admin inicial. La contraseña se lee de una variable de
// entorno (ADMIN_PASSWORD) — nunca hardcodeada. Idempotente: se puede ejecutar varias veces.
async function main() {
  const nombre = process.env.ADMIN_NOMBRE || 'Administrador';
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('[seed:admin] Define ADMIN_EMAIL y ADMIN_PASSWORD en backend/.env');
    process.exit(1);
  }

  await sequelize.authenticate();
  const passwordHash = await bcrypt.hash(password, 10);

  const [usuario, creado] = await Usuario.findOrCreate({
    where: { email },
    defaults: { nombre, email, passwordHash, rol: 'admin' },
  });

  if (!creado) {
    usuario.nombre = nombre;
    usuario.passwordHash = passwordHash;
    usuario.rol = 'admin';
    usuario.activo = true;
    await usuario.save();
    console.log(`[seed:admin] Admin actualizado: ${email}`);
  } else {
    console.log(`[seed:admin] Admin creado: ${email}`);
  }

  await sequelize.close();
}

main().catch((err) => {
  console.error('[seed:admin] Error:', err);
  process.exit(1);
});
