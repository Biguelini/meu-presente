import mongoose from 'mongoose';
import { Gift, IGiftDocument, List, User } from '../models/index.js';
import { BadRequestError, NotFoundError, ForbiddenError, ConflictError } from '../utils/errors.js';
import { SortOption } from '../types/index.js';

interface CreateGiftDTO {
  nome: string;
  link?: string;
  preco?: number;
}

interface UpdateGiftDTO {
  nome?: string;
  link?: string;
  preco?: number | null;
}

interface ReorderDTO {
  giftIds: string[];
}

class GiftService {
  private getSortCriteria(sort: SortOption): Record<string, 1 | -1> {
    switch (sort) {
      case 'nome':
        return { nome: 1 };
      case 'preco-asc':
        return { preco: 1, nome: 1 };
      case 'preco-desc':
        return { preco: -1, nome: 1 };
      case 'insercao-asc':
        return { ordemInsercao: 1 };
      case 'insercao-desc':
        return { ordemInsercao: -1 };
      case 'prioridade':
      default:
        return { ordemPrioridadeLista: 1 };
    }
  }

  async create(listaId: string, userId: string, data: CreateGiftDTO): Promise<IGiftDocument> {
    const { nome, link, preco } = data;

    if (!nome || nome.trim().length < 2) {
      throw new BadRequestError('Nome do presente é obrigatório (mínimo 2 caracteres)');
    }


    const list = await List.findById(listaId);
    if (!list) {
      throw new NotFoundError('Lista não encontrada');
    }
    if (list.userId.toString() !== userId) {
      throw new ForbiddenError('Você não tem permissão para adicionar presentes nesta lista');
    }


    const maxOrdemLista = await Gift.findOne({ listaId: list._id })
      .sort({ ordemPrioridadeLista: -1 })
      .select('ordemPrioridadeLista');

    const maxOrdemGlobal = await Gift.findOne({ userId: list.userId })
      .sort({ ordemPrioridadeGlobal: -1 })
      .select('ordemPrioridadeGlobal');

    const gift = await Gift.create({
      listaId: new mongoose.Types.ObjectId(listaId),
      userId: new mongoose.Types.ObjectId(userId),
      nome: nome.trim(),
      link: link?.trim(),
      preco: preco !== undefined && preco !== null ? preco : undefined,
      status: 'disponivel',
      ordemPrioridadeLista: (maxOrdemLista?.ordemPrioridadeLista ?? -1) + 1,
      ordemPrioridadeGlobal: (maxOrdemGlobal?.ordemPrioridadeGlobal ?? -1) + 1,
      ordemInsercao: new Date(),
    });

    return gift;
  }

  async getByListId(
    listaId: string, 
    userId: string, 
    sort: SortOption = 'prioridade'
  ): Promise<IGiftDocument[]> {

    const list = await List.findById(listaId);
    if (!list) {
      throw new NotFoundError('Lista não encontrada');
    }
    if (list.userId.toString() !== userId) {
      throw new ForbiddenError('Você não tem permissão para acessar esta lista');
    }

    const sortCriteria = this.getSortCriteria(sort);
    

    const gifts = await Gift.find({ 
      listaId: list._id, 
      status: 'disponivel' 
    }).sort(sortCriteria);


    if (sort === 'preco-asc' || sort === 'preco-desc') {
      const withPrice = gifts.filter(g => g.preco !== undefined && g.preco !== null);
      const withoutPrice = gifts.filter(g => g.preco === undefined || g.preco === null);
      return [...withPrice, ...withoutPrice];
    }

    return gifts;
  }

  async getGlobalList(
    userId: string, 
    sort: SortOption = 'prioridade'
  ): Promise<IGiftDocument[]> {
    let sortCriteria: Record<string, 1 | -1>;
    
    if (sort === 'prioridade') {
      sortCriteria = { ordemPrioridadeGlobal: 1 };
    } else {
      sortCriteria = this.getSortCriteria(sort);
    }

    const gifts = await Gift.find({ 
      userId: new mongoose.Types.ObjectId(userId), 
      status: 'disponivel' 
    }).sort(sortCriteria);


    if (sort === 'preco-asc' || sort === 'preco-desc') {
      const withPrice = gifts.filter(g => g.preco !== undefined && g.preco !== null);
      const withoutPrice = gifts.filter(g => g.preco === undefined || g.preco === null);
      return [...withPrice, ...withoutPrice];
    }

    return gifts;
  }

  async getById(giftId: string, userId: string): Promise<IGiftDocument> {
    if (!mongoose.Types.ObjectId.isValid(giftId)) {
      throw new BadRequestError('ID do presente inválido');
    }

    const gift = await Gift.findById(giftId);
    if (!gift) {
      throw new NotFoundError('Presente não encontrado');
    }

    if (gift.userId.toString() !== userId) {
      throw new ForbiddenError('Você não tem permissão para acessar este presente');
    }

    return gift;
  }

  async update(giftId: string, userId: string, data: UpdateGiftDTO): Promise<IGiftDocument> {
    const gift = await this.getById(giftId, userId);

    if (data.nome !== undefined) {
      if (data.nome.trim().length < 2) {
        throw new BadRequestError('Nome do presente deve ter pelo menos 2 caracteres');
      }
      gift.nome = data.nome.trim();
    }

    if (data.link !== undefined) {
      gift.link = data.link.trim() || undefined;
    }

    if (data.preco !== undefined) {
      gift.preco = data.preco === null ? undefined : data.preco;
    }

    await gift.save();
    return gift;
  }

  async delete(giftId: string, userId: string): Promise<void> {
    const gift = await this.getById(giftId, userId);
    await Gift.findByIdAndDelete(gift._id);
  }

  async reorderList(listaId: string, userId: string, data: ReorderDTO): Promise<void> {
    const { giftIds } = data;

    if (!Array.isArray(giftIds) || giftIds.length === 0) {
      throw new BadRequestError('Lista de IDs é obrigatória');
    }


    const list = await List.findById(listaId);
    if (!list) {
      throw new NotFoundError('Lista não encontrada');
    }
    if (list.userId.toString() !== userId) {
      throw new ForbiddenError('Você não tem permissão para reordenar esta lista');
    }


    const bulkOps = giftIds.map((giftId, index) => ({
      updateOne: {
        filter: { 
          _id: new mongoose.Types.ObjectId(giftId), 
          listaId: list._id,
          userId: list.userId 
        },
        update: { $set: { ordemPrioridadeLista: index } }
      }
    }));

    await Gift.bulkWrite(bulkOps);
  }

  async reorderGlobal(userId: string, data: ReorderDTO): Promise<void> {
    const { giftIds } = data;

    if (!Array.isArray(giftIds) || giftIds.length === 0) {
      throw new BadRequestError('Lista de IDs é obrigatória');
    }


    const bulkOps = giftIds.map((giftId, index) => ({
      updateOne: {
        filter: { 
          _id: new mongoose.Types.ObjectId(giftId), 
          userId: new mongoose.Types.ObjectId(userId)
        },
        update: { $set: { ordemPrioridadeGlobal: index } }
      }
    }));

    await Gift.bulkWrite(bulkOps);
  }


  async getPublicListGifts(slug: string): Promise<{ 
    gifts: IGiftDocument[]; 
    publicHashId: string;
    listaNome: string;
    donoNome: string;
  }> {
    const list = await List.findOne({ slug });
    if (!list) {
      throw new NotFoundError('Lista não encontrada');
    }

    const user = await User.findById(list.userId).select('nome');
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const gifts = await Gift.find({ 
      listaId: list._id, 
      status: 'disponivel' 
    }).sort({ ordemPrioridadeLista: 1 });

    return { 
      gifts, 
      publicHashId: list.publicHashId,
      listaNome: list.nome,
      donoNome: user.nome,
    };
  }

  async markAsBought(giftId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(giftId)) {
      throw new BadRequestError('ID do presente inválido');
    }

    const gift = await Gift.findById(giftId);
    if (!gift) {
      throw new NotFoundError('Presente não encontrado');
    }

    if (gift.status === 'comprado') {
      throw new ConflictError('Este presente já foi comprado');
    }

    gift.status = 'comprado';
    await gift.save();
  }


  async getPublicGlobalList(globalHashId: string): Promise<{
    globalHashId: string;
    donoNome: string;
    gifts: Array<{
      _id: string;
      nome: string;
      link?: string;
      preco?: number;
      listaNome: string;
      listaPublicHashId: string;
    }>;
    listas: Array<{
      publicHashId: string;
      nome: string;
    }>;
  }> {
    const user = await User.findOne({ globalHashId });
    if (!user) {
      throw new NotFoundError('Lista não encontrada');
    }


    const listas = await List.find({ userId: user._id }).select('_id nome publicHashId');
    

    const gifts = await Gift.find({
      userId: user._id,
      status: 'disponivel',
    }).sort({ ordemPrioridadeGlobal: 1 });


    const listasMap = new Map(listas.map(l => [l._id.toString(), { nome: l.nome, publicHashId: l.publicHashId }]));


    const giftsFormatted = gifts.map(gift => {
      const listaInfo = listasMap.get(gift.listaId.toString());
      return {
        _id: gift._id.toString(),
        nome: gift.nome,
        link: gift.link,
        preco: gift.preco,
        listaNome: listaInfo?.nome || 'Lista removida',
        listaPublicHashId: listaInfo?.publicHashId || '',
      };
    });

    return {
      globalHashId: user.globalHashId,
      donoNome: user.nome,
      gifts: giftsFormatted,
      listas: listas.map(l => ({
        publicHashId: l.publicHashId,
        nome: l.nome,
      })),
    };
  }
}

export const giftService = new GiftService();
