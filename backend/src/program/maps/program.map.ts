import { Content } from '../interfaces/program-response';

export const programMap = (program: Content) => {
  return {
    id: program.id,
    idUnityProgram: program.idUnidadPrograma,
    unity: program.unidad,
    workday: program.jornada,
    modality: program.modalidad,
    methodology: program.metodologia,
    educationalLevel: program.nivelEducativo,
    status: program.estado,
    name: program.nombre,
    code: program.codigo,
    faculty: program.facultad,
  };
};
