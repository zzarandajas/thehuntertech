'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('proceso_candidatos', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      proceso_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'procesos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      candidato_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'candidatos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      orden: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      etapa: {
        type: Sequelize.ENUM(
          'sourcing',
          'longlist',
          'shortlist',
          'presentado',
          'entrevista_cliente',
          'oferta',
          'contratado',
          'descartado',
        ),
        allowNull: false,
        defaultValue: 'sourcing',
      },
      posicion_actual_snapshot: { type: Sequelize.STRING, allowNull: true },
      expectativa_salarial: { type: Sequelize.STRING, allowNull: true },
      fecha_incorporacion: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addConstraint('proceso_candidatos', {
      fields: ['proceso_id', 'candidato_id'],
      type: 'unique',
      name: 'uq_proceso_candidato',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('proceso_candidatos');
  },
};
