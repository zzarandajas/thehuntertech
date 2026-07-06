import sequelize from '../config/database';
import Usuario from './Usuario';
import Cliente from './Cliente';
import ClienteContacto from './ClienteContacto';
import DimensionCatalogo from './DimensionCatalogo';
import Vertical from './Vertical';
import Skill from './Skill';
import OrigenCandidato from './OrigenCandidato';
import ProcesoSeleccion from './ProcesoSeleccion';
import ProcesoDimension from './ProcesoDimension';
import ProcesoConsultor from './ProcesoConsultor';
import Candidato from './Candidato';
import CandidatoExperiencia from './CandidatoExperiencia';
import CandidatoSkill from './CandidatoSkill';
import CandidatoInteraccion from './CandidatoInteraccion';
import CandidatoDocumento from './CandidatoDocumento';
import ProcesoCandidato from './ProcesoCandidato';
import CandidatoMetrica from './CandidatoMetrica';
import CandidatoDimensionScore from './CandidatoDimensionScore';
import CandidatoObservacion from './CandidatoObservacion';
import Informe from './Informe';
import InformeShareLink from './InformeShareLink';

// ---------------------------------------------------------------------------
// Asociaciones (un único lugar para todas las relaciones entre modelos).
// ---------------------------------------------------------------------------

// Cliente ↔ Contactos
Cliente.hasMany(ClienteContacto, { foreignKey: 'clienteId', as: 'contactos', onDelete: 'CASCADE' });
ClienteContacto.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

// Mandato (ProcesoSeleccion) ↔ Cliente / Vertical / creador
ProcesoSeleccion.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });
ProcesoSeleccion.belongsTo(Vertical, { foreignKey: 'verticalId', as: 'vertical' });
ProcesoSeleccion.belongsTo(Usuario, { foreignKey: 'createdBy', as: 'creador' });
ProcesoSeleccion.hasMany(ProcesoDimension, {
  foreignKey: 'procesoId',
  as: 'dimensiones',
  onDelete: 'CASCADE',
});
ProcesoDimension.belongsTo(ProcesoSeleccion, { foreignKey: 'procesoId', as: 'proceso' });
ProcesoDimension.belongsTo(DimensionCatalogo, { foreignKey: 'dimensionId', as: 'dimension' });
ProcesoSeleccion.hasMany(ProcesoConsultor, {
  foreignKey: 'procesoId',
  as: 'consultores',
  onDelete: 'CASCADE',
});
ProcesoConsultor.belongsTo(ProcesoSeleccion, { foreignKey: 'procesoId', as: 'proceso' });
ProcesoConsultor.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Candidato ↔ origen / experiencias / skills / interacciones / documentos
Candidato.belongsTo(OrigenCandidato, { foreignKey: 'origenId', as: 'origen' });
Candidato.hasMany(CandidatoExperiencia, {
  foreignKey: 'candidatoId',
  as: 'experiencias',
  onDelete: 'CASCADE',
});
CandidatoExperiencia.belongsTo(Candidato, { foreignKey: 'candidatoId', as: 'candidato' });
Candidato.hasMany(CandidatoSkill, {
  foreignKey: 'candidatoId',
  as: 'skills',
  onDelete: 'CASCADE',
});
CandidatoSkill.belongsTo(Candidato, { foreignKey: 'candidatoId', as: 'candidato' });
CandidatoSkill.belongsTo(Skill, { foreignKey: 'skillId', as: 'skill' });
Candidato.hasMany(CandidatoInteraccion, {
  foreignKey: 'candidatoId',
  as: 'interacciones',
  onDelete: 'CASCADE',
});
CandidatoInteraccion.belongsTo(Candidato, { foreignKey: 'candidatoId', as: 'candidato' });
CandidatoInteraccion.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
Candidato.hasMany(CandidatoDocumento, {
  foreignKey: 'candidatoId',
  as: 'documentos',
  onDelete: 'CASCADE',
});
CandidatoDocumento.belongsTo(Candidato, { foreignKey: 'candidatoId', as: 'candidato' });
CandidatoDocumento.belongsTo(Usuario, { foreignKey: 'subidoPor', as: 'subidoPorUsuario' });

// Pipeline: participación de un candidato en un mandato
ProcesoSeleccion.hasMany(ProcesoCandidato, {
  foreignKey: 'procesoId',
  as: 'participantes',
  onDelete: 'CASCADE',
});
ProcesoCandidato.belongsTo(ProcesoSeleccion, { foreignKey: 'procesoId', as: 'proceso' });
Candidato.hasMany(ProcesoCandidato, {
  foreignKey: 'candidatoId',
  as: 'participaciones',
  onDelete: 'CASCADE',
});
ProcesoCandidato.belongsTo(Candidato, { foreignKey: 'candidatoId', as: 'candidato' });

// Evaluación de una participación (métricas / scores por dimensión / observaciones)
ProcesoCandidato.hasMany(CandidatoMetrica, {
  foreignKey: 'procesoCandidatoId',
  as: 'metricas',
  onDelete: 'CASCADE',
});
CandidatoMetrica.belongsTo(ProcesoCandidato, { foreignKey: 'procesoCandidatoId', as: 'procesoCandidato' });
ProcesoCandidato.hasMany(CandidatoDimensionScore, {
  foreignKey: 'procesoCandidatoId',
  as: 'scores',
  onDelete: 'CASCADE',
});
CandidatoDimensionScore.belongsTo(ProcesoCandidato, {
  foreignKey: 'procesoCandidatoId',
  as: 'procesoCandidato',
});
CandidatoDimensionScore.belongsTo(DimensionCatalogo, { foreignKey: 'dimensionId', as: 'dimension' });
ProcesoCandidato.hasMany(CandidatoObservacion, {
  foreignKey: 'procesoCandidatoId',
  as: 'observaciones',
  onDelete: 'CASCADE',
});
CandidatoObservacion.belongsTo(ProcesoCandidato, {
  foreignKey: 'procesoCandidatoId',
  as: 'procesoCandidato',
});

// Informes y enlaces de compartición
ProcesoSeleccion.hasMany(Informe, { foreignKey: 'procesoId', as: 'informes', onDelete: 'CASCADE' });
Informe.belongsTo(ProcesoSeleccion, { foreignKey: 'procesoId', as: 'proceso' });
Informe.belongsTo(Usuario, { foreignKey: 'generadoPor', as: 'generador' });
Informe.hasMany(InformeShareLink, {
  foreignKey: 'informeId',
  as: 'shareLinks',
  onDelete: 'CASCADE',
});
InformeShareLink.belongsTo(Informe, { foreignKey: 'informeId', as: 'informe' });

const models = {
  Usuario,
  Cliente,
  ClienteContacto,
  DimensionCatalogo,
  Vertical,
  Skill,
  OrigenCandidato,
  ProcesoSeleccion,
  ProcesoDimension,
  ProcesoConsultor,
  Candidato,
  CandidatoExperiencia,
  CandidatoSkill,
  CandidatoInteraccion,
  CandidatoDocumento,
  ProcesoCandidato,
  CandidatoMetrica,
  CandidatoDimensionScore,
  CandidatoObservacion,
  Informe,
  InformeShareLink,
};

export {
  sequelize,
  Usuario,
  Cliente,
  ClienteContacto,
  DimensionCatalogo,
  Vertical,
  Skill,
  OrigenCandidato,
  ProcesoSeleccion,
  ProcesoDimension,
  ProcesoConsultor,
  Candidato,
  CandidatoExperiencia,
  CandidatoSkill,
  CandidatoInteraccion,
  CandidatoDocumento,
  ProcesoCandidato,
  CandidatoMetrica,
  CandidatoDimensionScore,
  CandidatoObservacion,
  Informe,
  InformeShareLink,
};
export default models;
