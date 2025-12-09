import { Request, Response } from 'express';
import { giftService } from '../services/index.js';
import { asyncHandler } from '../middlewares/index.js';

export const publicController = {
  getListBySlug: asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    
    const { gifts, publicHashId, listaNome, donoNome } = await giftService.getPublicListGifts(slug);

    res.json({
      success: true,
      data: { 
        publicHashId,
        listaNome,
        donoNome,
        gifts: gifts.map(gift => ({
          _id: gift._id,
          nome: gift.nome,
          link: gift.link,
          preco: gift.preco,
        })),
      },
    });
  }),

  getGlobalByHash: asyncHandler(async (req: Request, res: Response) => {
    const { hashId } = req.params;
    
    const data = await giftService.getPublicGlobalList(hashId);

    res.json({
      success: true,
      data,
    });
  }),

  markAsBought: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    await giftService.markAsBought(id);

    res.json({
      success: true,
      message: 'Presente marcado como comprado',
    });
  }),
};
