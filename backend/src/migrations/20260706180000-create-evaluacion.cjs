'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const id = { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true };
    const timestamps = {
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    };
    const pcFk = {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'proceso_candidatos', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    };

    await queryInterface.createTable('candidato_metricas', {
      id,
      proceso_candidato_id: pcFk,
      valor: { type: Sequelize.STRING, allowNull: false },
      descripcion: { type: Sequelize.STRING, allowNull: false },
      orden: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      ...timestamps,
    });

    await queryInterface.createTable('candidato_dimension_scores', {
      id,
      proceso_candidato_id: pcFk,
      dimension_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'dimension_catalogos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      score: { type: Sequelize.INTEGER, allowNull: false },
      comentario: { type: Sequelize.TEXT, allowNull: true },
      ...timestamps,
    });
    await queryInterface.addConstraint('candidato_dimension_scores', {
      fields: ['proceso_candidato_id', 'dimension_id'],
      type: 'unique',
      name: 'uq_pc_dimension_score',
    });

    await queryInterface.createTable('candidato_observaciones', {
      id,
      proceso_candidato_id: pcFk,
      tipo: { type: Sequelize.ENUM('fortaleza', 'punto_explorar'), allowNull: false },
      texto: { type: Sequelize.TEXT, allowNull: false },
      orden: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      ...timestamps,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('candidato_observaciones');
    await queryInterface.dropTable('candidato_dimension_scores');
    await queryInterface.dropTable('candidato_metricas');
  },
};
