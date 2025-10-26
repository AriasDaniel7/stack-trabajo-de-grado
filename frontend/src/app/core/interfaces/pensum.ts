export interface PensumResponse {
  count: number;
  pages: number;
  data: Pensum[];
}

export interface Pensum {
  id: string | number;
  idPensumExternal?: number;
  description: string;
  startYear: number;
  status: string;
  credits: number | null;
}
