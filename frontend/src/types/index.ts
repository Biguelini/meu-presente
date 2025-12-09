export interface User {
  _id: string;
  nome: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  _id: string;
  userId: string;
  nome: string;
  descricao?: string;
  slug: string;
  publicHashId: string;
  totalPresentes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Gift {
  _id: string;
  listaId: string;
  userId: string;
  nome: string;
  link?: string;
  preco?: number;
  status: 'disponivel' | 'comprado';
  ordemPrioridadeLista: number;
  ordemPrioridadeGlobal: number;
  ordemInsercao: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicGift {
  _id: string;
  nome: string;
  link?: string;
  preco?: number;
}

export interface PublicGlobalGift {
  _id: string;
  nome: string;
  link?: string;
  preco?: number;
  listaNome: string;
  listaPublicHashId: string;
}

export interface PublicListInfo {
  publicHashId: string;
  nome: string;
}

export type SortOption = 'prioridade' | 'nome' | 'preco-asc' | 'preco-desc' | 'insercao-asc' | 'insercao-desc';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}
