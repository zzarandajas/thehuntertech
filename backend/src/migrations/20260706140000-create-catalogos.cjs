'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const timestamps = {
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    };
    const id = {
      type: Sequelize.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    };
    const activo = { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true };

    await queryInterface.createTable('dimension_catalogos', {
      id,
      codigo: { type: Sequelize.STRING, allowNull: false, unique: true },
      nombre: { type: Sequelize.STRING, allowNull: false },
      descripcion: { type: Sequelize.TEXT, allowNull: true },
      categoria: { type: Sequelize.STRING, allowNull: true },
      orden: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      activo,
      ...timestamps,
    });

    await queryInterface.createTable('verticales', {
      id,
      codigo: { type: Sequelize.STRING, allowNull: false, unique: true },
      nombre: { type: Sequelize.STRING, allowNull: false },
      descripcion: { type: Sequelize.TEXT, allowNull: true },
      activo,
      ...timestamps,
    });

    await queryInterface.createTable('skills', {
      id,
      nombre: { type: Sequelize.STRING, allowNull: false, unique: true },
      categoria: { type: Sequelize.STRING, allowNull: true },
      activo,
      ...timestamps,
    });

    await queryInterface.createTable('origen_candidatos', {
      id,
      nombre: { type: Sequelize.STRING, allowNull: false, unique: true },
      activo,
      ...timestamps,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('origen_candidatos');
    await queryInterface.dropTable('skills');
    await queryInterface.dropTable('verticales');
    await queryInterface.dropTable('dimension_catalogos');
  },
};
