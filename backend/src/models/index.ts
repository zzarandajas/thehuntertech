import sequelize from '../config/database';
import Usuario from './Usuario';

// Registro central de modelos y asociaciones (hasMany / belongsTo / belongsToMany).
// Las relaciones entre modelos se definirán aquí en un único lugar a partir del Sprint 2.

const models = {
  Usuario,
};

export { sequelize, Usuario };
export default models;
