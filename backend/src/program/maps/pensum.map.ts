import { Content } from '../interfaces/pensum-response';

export const pensumMap = (pensum: Content) => {
  return {
    id: pensum.id,
    description: pensum.descripcion,
    startYear: pensum.anoInicio,
    startPeriod: pensum.periodoInicio,
    status: pensum.estadoPensum,
    idStatus: pensum.idEstadoPensum,
  };
};
