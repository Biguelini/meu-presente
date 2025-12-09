import { Request, Response } from 'express';
import { listService, giftService, authService } from '../services/index.js';
import { asyncHandler } from '../middlewares/index.js';
import { SortOption } from '../types/index.js';

export const listController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { nome, descricao } = req.body;
    
    const list = await listService.create(userId, { nome, descricao });

    res.status(201).json({
      success: true,
      message: 'Lista criada com sucesso',
      data: { list },
    });
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    
    const lists = await listService.getListWithGiftsCount(userId);

    res.json({
      success: true,
      data: { lists },
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    
    const list = await listService.getById(id, userId);
    const sort = (req.query.sort as SortOption) || 'prioridade';
    const gifts = await giftService.getByListId(id, userId, sort);

    res.json({
      success: true,
      data: { list, gifts },
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    const { nome, descricao } = req.body;
    
    const list = await listService.update(id, userId, { nome, descricao });

    res.json({
      success: true,
      message: 'Lista atualizada com sucesso',
      data: { list },
    });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    
    await listService.delete(id, userId);

    res.json({
      success: true,
      message: 'Lista excluída com sucesso',
    });
  }),

  getGlobal: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const sort = (req.query.sort as SortOption) || 'prioridade';
    
    const gifts = await giftService.getGlobalList(userId, sort);
    const user = await authService.getUserById(userId);

    res.json({
      success: true,
      data: { 
        gifts,
        globalHashId: user.globalHashId,
      },
    });
  }),
};
