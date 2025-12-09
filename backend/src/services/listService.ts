import mongoose from 'mongoose';
import { List, IListDocument, Gift } from '../models/index.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors.js';

interface CreateListDTO {
  nome: string;
  descricao?: string;
}

interface UpdateListDTO {
  nome?: string;
  descricao?: string;
}

class ListService {
  async create(userId: string, data: CreateListDTO): Promise<IListDocument> {
    const { nome, descricao } = data;

    if (!nome || nome.trim().length < 2) {
      throw new BadRequestError('Nome da lista é obrigatório (mínimo 2 caracteres)');
    }

    const list = await List.create({
      userId: new mongoose.Types.ObjectId(userId),
      nome: nome.trim(),
      descricao: descricao?.trim(),
    });

    return list;
  }

  async getAll(userId: string): Promise<IListDocument[]> {
    const lists = await List.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
    return lists;
  }

  async getById(listId: string, userId: string): Promise<IListDocument> {
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw new BadRequestError('ID da lista inválido');
    }

    const list = await List.findById(listId);
    if (!list) {
      throw new NotFoundError('Lista não encontrada');
    }

    if (list.userId.toString() !== userId) {
      throw new ForbiddenError('Você não tem permissão para acessar esta lista');
    }

    return list;
  }

  async getBySlug(slug: string): Promise<IListDocument> {
    const list = await List.findOne({ slug });
    if (!list) {
      throw new NotFoundError('Lista não encontrada');
    }
    return list;
  }

  async update(listId: string, userId: string, data: UpdateListDTO): Promise<IListDocument> {

    const list = await this.getById(listId, userId);

    if (data.nome !== undefined) {
      if (data.nome.trim().length < 2) {
        throw new BadRequestError('Nome da lista deve ter pelo menos 2 caracteres');
      }
      list.nome = data.nome.trim();
    }

    if (data.descricao !== undefined) {
      list.descricao = data.descricao.trim() || undefined;
    }

    await list.save();
    return list;
  }

  async delete(listId: string, userId: string): Promise<void> {

    const list = await this.getById(listId, userId);


    await Gift.deleteMany({ listaId: list._id });


    await List.findByIdAndDelete(listId);
  }

  async getListWithGiftsCount(userId: string): Promise<any[]> {
    const lists = await List.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'gifts',
          let: { listId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$listaId', '$$listId'] },
                    { $eq: ['$status', 'disponivel'] }
                  ]
                }
              }
            }
          ],
          as: 'gifts'
        }
      },
      {
        $addFields: {
          totalPresentes: { $size: '$gifts' }
        }
      },
      {
        $project: {
          gifts: 0,
          __v: 0
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    return lists;
  }
}

export const listService = new ListService();
