import api from './api';
import { Gift, PublicGift, PublicGlobalGift, PublicListInfo, ApiResponse } from '../types';

interface CreateGiftData {
  nome: string;
  link?: string;
  preco?: number;
}

interface UpdateGiftData {
  nome?: string;
  link?: string;
  preco?: number | null;
}

export const giftService = {
  async create(listaId: string, data: CreateGiftData): Promise<Gift> {
    const response = await api.post<ApiResponse<{ gift: Gift }>>(`/lists/${listaId}/gifts`, data);
    if (response.data.success && response.data.data) {
      return response.data.data.gift;
    }
    throw new Error(response.data.message || 'Erro ao criar presente');
  },

  async update(id: string, data: UpdateGiftData): Promise<Gift> {
    const response = await api.put<ApiResponse<{ gift: Gift }>>(`/gifts/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data.gift;
    }
    throw new Error(response.data.message || 'Erro ao atualizar presente');
  },

  async delete(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<null>>(`/gifts/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erro ao excluir presente');
    }
  },

  async reorderList(listaId: string, giftIds: string[]): Promise<void> {
    const response = await api.patch<ApiResponse<null>>(`/lists/${listaId}/gifts/reorder`, { giftIds });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erro ao reordenar presentes');
    }
  },

  async reorderGlobal(giftIds: string[]): Promise<void> {
    const response = await api.patch<ApiResponse<null>>('/lists/global/gifts/reorder', { giftIds });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erro ao reordenar presentes');
    }
  },


  async getPublicList(slug: string): Promise<{ 
    publicHashId: string; 
    listaNome: string;
    donoNome: string;
    gifts: PublicGift[] 
  }> {
    const response = await api.get<ApiResponse<{ 
      publicHashId: string; 
      listaNome: string;
      donoNome: string;
      gifts: PublicGift[] 
    }>>(`/public/lists/${slug}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Lista não encontrada');
  },

  async markAsBought(giftId: string): Promise<void> {
    const response = await api.post<ApiResponse<null>>(`/public/gifts/${giftId}/mark-bought`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erro ao marcar presente como comprado');
    }
  },

  async getPublicGlobalList(hashId: string): Promise<{
    globalHashId: string;
    donoNome: string;
    gifts: PublicGlobalGift[];
    listas: PublicListInfo[];
  }> {
    const response = await api.get<ApiResponse<{
      globalHashId: string;
      donoNome: string;
      gifts: PublicGlobalGift[];
      listas: PublicListInfo[];
    }>>(`/public/global/${hashId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Lista não encontrada');
  },
};
