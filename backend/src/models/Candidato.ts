import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export type Disponibilidad =
  | 'activo_busqueda'
  | 'abierto_a_ofertas'
  | 'no_disponible'
  | 'colocado'
  | 'desconocido';

// NOTA RGPD: deliberadamente SIN campos de género/etnia/diversidad (fuera de alcance).
export class Candidato extends Model<
  InferAttributes<Candidato>,
  InferCreationAttributes<Candidato>
> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare email: CreationOptional<string | null>;
  declare telefono: CreationOptional<string | null>;
  declare linkedinUrl: CreationOptional<string | null>;
  declare ciudadResidencia: CreationOptional<string | null>;
  declare idiomas: CreationOptional<string | null>;
  declare formacion: CreationOptional<string | null>;
  declare origenId: CreationOptional<number | null>;
  declare disponibilidad: CreationOptional<Disponibilidad>;
  declare cvUrl: CreationOptional<string | null>;
  declare salarioActualEstimado: CreationOptional<string | null>;
  declare ultimaActividadAt: CreationOptional<Date | null>;
  declare consentimientoRgpd: CreationOptional<boolean>;
  declare fechaConsentimiento: CreationOptional<Date | null>;
  declare notasInternas: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Candidato.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true },
    telefono: { type: DataTypes.STRING, allowNull: true },
    linkedinUrl: { type: DataTypes.STRING, allowNull: true, field: 'linkedin_url' },
    ciudadResidencia: { type: DataTypes.STRING, allowNull: true, field: 'ciudad_residencia' },
    idiomas: { type: DataTypes.STRING, allowNull: true },
    formacion: { type: DataTypes.TEXT, allowNull: true },
    origenId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'origen_id' },
    disponibilidad: {
      type: DataTypes.ENUM(
        'activo_busqueda',
        'abierto_a_ofertas',
        'no_disponible',
        'colocado',
        'desconocido',
      ),
      allowNull: false,
      defaultValue: 'desconocido',
    },
    cvUrl: { type: DataTypes.STRING, allowNull: true, field: 'cv_url' },
    salarioActualEstimado: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'salario_actual_estimado',
    },
    ultimaActividadAt: { type: DataTypes.DATE, allowNull: true, field: 'ultima_actividad_at' },
    consentimientoRgpd: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'consentimiento_rgpd',
    },
    fechaConsentimiento: { type: DataTypes.DATE, allowNull: true, field: 'fecha_consentimiento' },
    notasInternas: { type: DataTypes.TEXT, allowNull: true, field: 'notas_internas' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'candidatos', modelName: 'Candidato' },
);

export default Candidato;
