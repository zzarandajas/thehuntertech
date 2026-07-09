'use strict';

// Introduce plantillas de pipeline + etapas propias por mandato y migra la
// columna ENUM `etapa` de proceso_candidatos a una FK `etapa_id` → proceso_etapas.
//
// Etapas por defecto (las 8 del enum original), con color y flag `es_final`
// (las terminales no envejecen en el aging del pipeline).
const ETAPAS_DEFAULT = [
  { nombre: 'Sourcing', color: '#64748b', es_final: false },
  { nombre: 'Longlist', color: '#0ea5e9', es_final: false },
  { nombre: 'Shortlist', color: '#6366f1', es_final: false },
  { nombre: 'Presentado', color: '#8b5cf6', es_final: false },
  { nombre: 'Entrevista cliente', color: '#f59e0b', es_final: false },
  { nombre: 'Oferta', color: '#10b981', es_final: false },
  { nombre: 'Contratado', color: '#16a34a', es_final: true },
  { nombre: 'Descartado', color: '#ef4444', es_final: true },
];

// Mapa enum antiguo → orden (1-based) de la etapa por defecto equivalente.
const ENUM_A_ORDEN = {
  sourcing: 1,
  longlist: 2,
  shortlist: 3,
  presentado: 4,
  entrevista_cliente: 5,
  oferta: 6,
  contratado: 7,
  descartado: 8,
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { INTEGER, STRING, TEXT, BOOLEAN, DATE } = Sequelize;

    // 1. Tablas nuevas ------------------------------------------------------
    await queryInterface.createTable('pipeline_plantillas', {
      id: { type: INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      nombre: { type: STRING, allowNull: false },
      descripcion: { type: TEXT, allowNull: true },
      es_default: { type: BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: DATE, allowNull: false },
      updated_at: { type: DATE, allowNull: false },
    });

    await queryInterface.createTable('pipeline_plantilla_etapas', {
      id: { type: INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      plantilla_id: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'pipeline_plantillas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      nombre: { type: STRING, allowNull: false },
      orden: { type: INTEGER, allowNull: false, defaultValue: 0 },
      color: { type: STRING, allowNull: false, defaultValue: '#64748b' },
      es_final: { type: BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: DATE, allowNull: false },
      updated_at: { type: DATE, allowNull: false },
    });

    await queryInterface.createTable('proceso_etapas', {
      id: { type: INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      proceso_id: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'procesos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      nombre: { type: STRING, allowNull: false },
      orden: { type: INTEGER, allowNull: false, defaultValue: 0 },
      color: { type: STRING, allowNull: false, defaultValue: '#64748b' },
      es_final: { type: BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: DATE, allowNull: false },
      updated_at: { type: DATE, allowNull: false },
    });

    // 2. Plantilla "Por defecto" + sus 8 etapas -----------------------------
    const now = new Date();
    await queryInterface.bulkInsert('pipeline_plantillas', [
      {
        nombre: 'Por defecto',
        descripcion: 'Pipeline estándar de executive search.',
        es_default: true,
        created_at: now,
        updated_at: now,
      },
    ]);
    const [plantillas] = await queryInterface.sequelize.query(
      'SELECT id FROM pipeline_plantillas WHERE es_default = true ORDER BY id ASC LIMIT 1',
    );
    const plantillaId = plantillas[0].id;

    await queryInterface.bulkInsert(
      'pipeline_plantilla_etapas',
      ETAPAS_DEFAULT.map((e, i) => ({
        plantilla_id: plantillaId,
        nombre: e.nombre,
        orden: i + 1,
        color: e.color,
        es_final: e.es_final,
        created_at: now,
        updated_at: now,
      })),
    );

    // 3. Copia de las etapas por defecto a cada mandato existente ------------
    await queryInterface.sequelize.query(`
      INSERT INTO proceso_etapas (proceso_id, nombre, orden, color, es_final, created_at, updated_at)
      SELECT p.id, e.nombre, e.orden, e.color, e.es_final, NOW(), NOW()
      FROM procesos p
      CROSS JOIN pipeline_plantilla_etapas e
      WHERE e.plantilla_id = ${plantillaId}
    `);

    // 4. Nueva columna etapa_id (nullable temporalmente) --------------------
    await queryInterface.addColumn('proceso_candidatos', 'etapa_id', {
      type: INTEGER.UNSIGNED,
      allowNull: true,
    });

    // 5. Backfill: mapear enum antiguo → etapa copiada (por orden) ----------
    const casos = Object.entries(ENUM_A_ORDEN)
      .map(([enumVal, orden]) => `WHEN '${enumVal}' THEN ${orden}`)
      .join(' ');
    await queryInterface.sequelize.query(`
      UPDATE proceso_candidatos pc
      JOIN proceso_etapas pe
        ON pe.proceso_id = pc.proceso_id
       AND pe.orden = (CASE pc.etapa ${casos} ELSE 1 END)
      SET pc.etapa_id = pe.id
    `);
    // Red de seguridad: cualquier fila sin mapear → primera etapa del mandato.
    await queryInterface.sequelize.query(`
      UPDATE proceso_candidatos pc
      JOIN proceso_etapas pe ON pe.proceso_id = pc.proceso_id AND pe.orden = 1
      SET pc.etapa_id = pe.id
      WHERE pc.etapa_id IS NULL
    `);

    // 6. etapa_id NOT NULL + FK --------------------------------------------
    await queryInterface.changeColumn('proceso_candidatos', 'etapa_id', {
      type: INTEGER.UNSIGNED,
      allowNull: false,
    });
    await queryInterface.addConstraint('proceso_candidatos', {
      fields: ['etapa_id'],
      type: 'foreign key',
      name: 'fk_proceso_candidatos_etapa',
      references: { table: 'proceso_etapas', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // 7. Eliminar la vieja columna ENUM ------------------------------------
    await queryInterface.removeColumn('proceso_candidatos', 'etapa');
  },

  async down(queryInterface, Sequelize) {
    // Recrea la columna ENUM y reconstruye su valor desde etapa_id (por orden).
    await queryInterface.addColumn('proceso_candidatos', 'etapa', {
      type: Sequelize.ENUM(...Object.keys(ENUM_A_ORDEN)),
      allowNull: false,
      defaultValue: 'sourcing',
    });
    const casos = Object.entries(ENUM_A_ORDEN)
      .map(([enumVal, orden]) => `WHEN ${orden} THEN '${enumVal}'`)
      .join(' ');
    await queryInterface.sequelize.query(`
      UPDATE proceso_candidatos pc
      JOIN proceso_etapas pe ON pe.id = pc.etapa_id
      SET pc.etapa = (CASE pe.orden ${casos} ELSE 'sourcing' END)
    `);

    await queryInterface.removeConstraint('proceso_candidatos', 'fk_proceso_candidatos_etapa');
    await queryInterface.removeColumn('proceso_candidatos', 'etapa_id');
    await queryInterface.dropTable('proceso_etapas');
    await queryInterface.dropTable('pipeline_plantilla_etapas');
    await queryInterface.dropTable('pipeline_plantillas');
  },
};
