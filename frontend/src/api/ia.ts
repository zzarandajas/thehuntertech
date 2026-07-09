import client from './client';

export interface CvExperiencia {
  empresa: string;
  cargo: string;
  periodo: string;
  descripcion: string;
}

export interface CvParseado {
  nombre: string;
  email: string;
  telefono: string;
  linkedinUrl: string;
  ciudadResidencia: string;
  idiomas: string;
  formacion: string;
  experiencias: CvExperiencia[];
  skills: string[];
}

export interface MatchCandidato {
  candidatoId: number;
  nombre: string;
  score: number;
  justificacion: string;
}

// Sube un CV en PDF y devuelve los datos extraídos para prellenar el alta.
export async function parsearCv(file: File): Promise<CvParseado> {
  const fd = new FormData();
  fd.append('cv', file);
  const { data } = await client.post<CvParseado>('/talento/parse-cv', fd);
  return data;
}

// Ranking IA del pool de talento para un mandato.
export async function candidatosSugeridos(procesoId: number): Promise<MatchCandidato[]> {
  const { data } = await client.get<MatchCandidato[]>(`/procesos/${procesoId}/matches`);
  return data;
}
