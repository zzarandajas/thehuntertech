'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const id = { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true };
    const timestamps = {
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    };
    const fk = (table) => ({
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: table, key: 'id' },
      onUpdate: 'CASCADE',
    });

    await queryInterface.createTable('procesos', {
      id,
      cliente_id: { ...fk('clientes'), onDelete: 'RESTRICT' },
      vertical_id: { ...fk('verticales'), onDelete: 'RESTRICT' },
      titulo: { type: Sequelize.STRING, allowNull: false },
      confidencialidad: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Uso exclusivo del Board del Cliente',
      },
      estado: {
        type: Sequelize.ENUM('abierto', 'cerrado', 'archivado'),
        allowNull: false,
        defaultValue: 'abierto',
      },
      anonimizar_nombres: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_by: { ...fk('usuarios'), onDelete: 'RESTRICT' },
      ...timestamps,
    });

    await queryInterface.createTable('proceso_dimensiones', {
      id,
      proceso_id: { ...fk('procesos'), onDelete: 'CASCADE' },
      dimension_id: { ...fk('dimension_catalogos'), onDelete: 'RESTRICT' },
      orden: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      ...timestamps,
    });
    await queryInterface.addConstraint('proceso_dimensiones', {
      fields: ['proceso_id', 'dimension_id'],
      type: 'unique',
      name: 'uq_proceso_dimension',
    });

    await queryInterface.createTable('proceso_consultores', {
      id,
      proceso_id: { ...fk('procesos'), onDelete: 'CASCADE' },
      usuario_id: { ...fk('usuarios'), onDelete: 'CASCADE' },
      rol_en_proceso: { type: Sequelize.ENUM('lead', 'soporte'), allowNull: false },
      ...timestamps,
    });
    await queryInterface.addConstraint('proceso_consultores', {
      fields: ['proceso_id', 'usuario_id'],
      type: 'unique',
      name: 'uq_proceso_consultor',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('proceso_consultores');
    await queryInterface.dropTable('proceso_dimensiones');
    await queryInterface.dropTable('procesos');
  },
};
