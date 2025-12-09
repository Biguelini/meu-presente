import { Request, Response } from 'express';
import { giftService } from '../services/index.js';
import { asyncHandler } from '../middlewares/index.js';

export const giftController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { listaId } = req.params;
    const { nome, link, preco } = req.body;
    
    const gift = await giftService.create(listaId, userId, { nome, link, preco });

    res.status(201).json({
      success: true,
      message: 'Presente adicionado com sucesso',
      data: { gift },
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    const { nome, link, preco } = req.body;
    
    const gift = await giftService.update(id, userId, { nome, link, preco });

    res.json({
      success: true,
      message: 'Presente atualizado com sucesso',
      data: { gift },
    });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    
    await giftService.delete(id, userId);

    res.json({
      success: true,
      message: 'Presente excluído com sucesso',
    });
  }),

  reorderList: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { listaId } = req.params;
    const { giftIds } = req.body;
    
    await giftService.reorderList(listaId, userId, { giftIds });

    res.json({
      success: true,
      message: 'Ordem atualizada com sucesso',
    });
  }),

  reorderGlobal: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { giftIds } = req.body;
    
    await giftService.reorderGlobal(userId, { giftIds });

    res.json({
      success: true,
      message: 'Ordem global atualizada com sucesso',
    });
  }),
};
