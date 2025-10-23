export interface PensumResponse {
  count: number;
  pages: number;
  data: Pensum[];
}

export interface Pensum {
  id: number;
  description: string;
  startYear: string;
  startPeriod: string;
  status: string;
  idStatus: number;
  credits: null | string;
}
