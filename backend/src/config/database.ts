import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Instancia de Sequelize usada por la app en runtime.
// `underscored: true` mapea atributos camelCase del modelo a columnas snake_case en BD.
const sequelize = new Sequelize(
  process.env.DB_NAME || 'thehuntertech',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
    },
  },
);

export default sequelize;
