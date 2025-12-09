import { Request, Response } from 'express';
import { authService } from '../services/index.js';
import { asyncHandler } from '../middlewares/index.js';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { nome, email, senha } = req.body;
    
    const { user, tokens } = await authService.register({ nome, email, senha });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user,
        ...tokens,
      },
    });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, senha } = req.body;
    
    const { user, tokens } = await authService.login({ email, senha });

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user,
        ...tokens,
      },
    });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    
    const tokens = await authService.refresh(refreshToken);

    res.json({
      success: true,
      message: 'Tokens atualizados com sucesso',
      data: tokens,
    });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { refreshToken } = req.body;
    
    await authService.logout(userId, refreshToken);

    res.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    
    const user = await authService.getUserById(userId);

    res.json({
      success: true,
      data: { user },
    });
  }),
};
