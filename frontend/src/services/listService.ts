import api from './api';
import { List, Gift, ApiResponse, SortOption } from '../types';

interface CreateListData {
  nome: string;
  descricao?: string;
}

interface UpdateListData {
  nome?: string;
  descricao?: string;
}

export const listService = {
  async getAll(): Promise<List[]> {
    const response = await api.get<ApiResponse<{ lists: List[] }>>('/lists');
    if (response.data.success && response.data.data) {
      return response.data.data.lists;
    }
    throw new Error(response.data.message || 'Erro ao buscar listas');
  },

  async getById(id: string, sort: SortOption = 'prioridade'): Promise<{ list: List; gifts: Gift[] }> {
    const response = await api.get<ApiResponse<{ list: List; gifts: Gift[] }>>(`/lists/${id}?sort=${sort}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Erro ao buscar lista');
  },

  async create(data: CreateListData): Promise<List> {
    const response = await api.post<ApiResponse<{ list: List }>>('/lists', data);
    if (response.data.success && response.data.data) {
      return response.data.data.list;
    }
    throw new Error(response.data.message || 'Erro ao criar lista');
  },

  async update(id: string, data: UpdateListData): Promise<List> {
    const response = await api.put<ApiResponse<{ list: List }>>(`/lists/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data.list;
    }
    throw new Error(response.data.message || 'Erro ao atualizar lista');
  },

  async delete(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<null>>(`/lists/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erro ao excluir lista');
    }
  },

  async getGlobal(sort: SortOption = 'prioridade'): Promise<{ gifts: Gift[]; globalHashId: string }> {
    const response = await api.get<ApiResponse<{ gifts: Gift[]; globalHashId: string }>>(`/lists/global?sort=${sort}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Erro ao buscar lista global');
  },
};
