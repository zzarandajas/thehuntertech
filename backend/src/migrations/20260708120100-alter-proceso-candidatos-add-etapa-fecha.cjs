'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('proceso_candidatos', 'etapa_actualizada_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    // Inicializa el valor para las filas existentes con su fecha de última actualización.
    await queryInterface.sequelize.query(
      'UPDATE proceso_candidatos SET etapa_actualizada_at = updated_at WHERE etapa_actualizada_at IS NULL',
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('proceso_candidatos', 'etapa_actualizada_at');
  },
};
