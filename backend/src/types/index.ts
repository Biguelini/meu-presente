export interface IUser {
  _id: string;
  nome: string;
  email: string;
  senha: string;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IList {
  _id: string;
  userId: string;
  nome: string;
  descricao?: string;
  slug: string;
  publicHashId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGift {
  _id: string;
  listaId: string;
  userId: string;
  nome: string;
  link?: string;
  preco?: number;
  status: 'disponivel' | 'comprado';
  ordemPrioridadeLista: number;
  ordemPrioridadeGlobal: number;
  ordemInsercao: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SortOption = 'prioridade' | 'nome' | 'preco-asc' | 'preco-desc' | 'insercao-asc' | 'insercao-desc';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
