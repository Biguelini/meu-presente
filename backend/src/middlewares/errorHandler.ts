import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors.js';
import { config } from '../config/index.js';

interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
  stack?: string;
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Erro:', err);


  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      message: err.message,
    };

    if (err instanceof ValidationError) {
      response.errors = err.errors;
    }

    if (config.nodeEnv === 'development') {
      response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }


  if (err.name === 'ValidationError') {
    const mongooseError = err as any;
    const errors: Record<string, string> = {};
    
    Object.keys(mongooseError.errors).forEach((key) => {
      errors[key] = mongooseError.errors[key].message;
    });

    res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors,
    });
    return;
  }


  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'ID inválido',
    });
    return;
  }


  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || 'campo';
    res.status(409).json({
      success: false,
      message: `${field} já está em uso`,
    });
    return;
  }


  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expirado',
    });
    return;
  }


  const response: ErrorResponse = {
    success: false,
    message: config.nodeEnv === 'production' 
      ? 'Erro interno do servidor' 
      : err.message,
  };

  if (config.nodeEnv === 'development') {
    response.stack = err.stack;
  }

  res.status(500).json(response);
};
