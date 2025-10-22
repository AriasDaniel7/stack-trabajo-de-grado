export interface SmmlvResponse {
  count: number;
  pages: number;
  data: Smmlv[];
}

export interface Smmlv {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  year: number;
  value: number;
}

export interface SmmlvCreate {
  year: number;
  value: number;
}
