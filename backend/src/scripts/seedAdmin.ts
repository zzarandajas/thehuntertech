import 'dotenv/config';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import Usuario from '../models/Usuario';

// Crea (o actualiza) el usuario admin inicial a partir de ADMIN_EMAIL / ADMIN_PASSWORD
// (nunca hardcodeadas). Idempotente. No abre ni cierra la conexión: asume Sequelize ya
// autenticada, para poder reutilizarla desde el arranque del servidor (config/initDb.ts).
// `strict=false` (arranque): si faltan variables, avisa y no hace nada, sin abortar.
// `strict=true` (script): aborta el proceso si faltan.
export async function seedAdmin({ strict = false }: { strict?: boolean } = {}): Promise<void> {
  const nombre = process.env.ADMIN_NOMBRE || 'Administrador';
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    const msg = '[seed:admin] Define ADMIN_EMAIL y ADMIN_PASSWORD para crear el admin inicial.';
    if (strict) {
      console.error(msg);
      process.exit(1);
    }
    console.warn(`${msg} Omitido.`);
    return;
  }

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
}

// Punto de entrada como script (npm run seed:admin): gestiona la conexión.
async function main() {
  await sequelize.authenticate();
  await seedAdmin({ strict: true });
  await sequelize.close();
}

// Solo ejecuta main() si se invoca directamente como script, no al importarlo.
if (require.main === module) {
  main().catch((err) => {
    console.error('[seed:admin] Error:', err);
    process.exit(1);
  });
}
