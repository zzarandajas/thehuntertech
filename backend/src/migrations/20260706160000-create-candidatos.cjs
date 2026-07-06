'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const id = { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true };
    const timestamps = {
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    };
    const fk = (table, allowNull, onDelete) => ({
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull,
      references: { model: table, key: 'id' },
      onUpdate: 'CASCADE',
      onDelete,
    });

    await queryInterface.createTable('candidatos', {
      id,
      nombre: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: true },
      telefono: { type: Sequelize.STRING, allowNull: true },
      linkedin_url: { type: Sequelize.STRING, allowNull: true },
      ciudad_residencia: { type: Sequelize.STRING, allowNull: true },
      idiomas: { type: Sequelize.STRING, allowNull: true },
      formacion: { type: Sequelize.TEXT, allowNull: true },
      origen_id: fk('origen_candidatos', true, 'SET NULL'),
      disponibilidad: {
        type: Sequelize.ENUM(
          'activo_busqueda',
          'abierto_a_ofertas',
          'no_disponible',
          'colocado',
          'desconocido',
        ),
        allowNull: false,
        defaultValue: 'desconocido',
      },
      cv_url: { type: Sequelize.STRING, allowNull: true },
      salario_actual_estimado: { type: Sequelize.STRING, allowNull: true },
      ultima_actividad_at: { type: Sequelize.DATE, allowNull: true },
      consentimiento_rgpd: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      fecha_consentimiento: { type: Sequelize.DATE, allowNull: true },
      notas_internas: { type: Sequelize.TEXT, allowNull: true },
      ...timestamps,
    });

    await queryInterface.createTable('candidato_experiencias', {
      id,
      candidato_id: fk('candidatos', false, 'CASCADE'),
      empresa: { type: Sequelize.STRING, allowNull: false },
      cargo: { type: Sequelize.STRING, allowNull: true },
      periodo: { type: Sequelize.STRING, allowNull: true },
      descripcion: { type: Sequelize.TEXT, allowNull: true },
      orden: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      ...timestamps,
    });

    await queryInterface.createTable('candidato_skills', {
      id,
      candidato_id: fk('candidatos', false, 'CASCADE'),
      skill_id: fk('skills', false, 'RESTRICT'),
      nivel: { type: Sequelize.STRING, allowNull: true },
      ...timestamps,
    });
    await queryInterface.addConstraint('candidato_skills', {
      fields: ['candidato_id', 'skill_id'],
      type: 'unique',
      name: 'uq_candidato_skill',
    });

    await queryInterface.createTable('candidato_interacciones', {
      id,
      candidato_id: fk('candidatos', false, 'CASCADE'),
      usuario_id: fk('usuarios', false, 'RESTRICT'),
      tipo: {
        type: Sequelize.ENUM('llamada', 'email', 'reunion', 'nota', 'linkedin'),
        allowNull: false,
      },
      fecha: { type: Sequelize.DATE, allowNull: false },
      resumen: { type: Sequelize.TEXT, allowNull: true },
      ...timestamps,
    });

    await queryInterface.createTable('candidato_documentos', {
      id,
      candidato_id: fk('candidatos', false, 'CASCADE'),
      tipo: { type: Sequelize.ENUM('cv', 'otro'), allowNull: false, defaultValue: 'otro' },
      nombre_archivo: { type: Sequelize.STRING, allowNull: false },
      path: { type: Sequelize.STRING, allowNull: false },
      subido_por: fk('usuarios', false, 'RESTRICT'),
      ...timestamps,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('candidato_documentos');
    await queryInterface.dropTable('candidato_interacciones');
    await queryInterface.dropTable('candidato_skills');
    await queryInterface.dropTable('candidato_experiencias');
    await queryInterface.dropTable('candidatos');
  },
};
