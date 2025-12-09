import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/index.js';
import { config } from '../config/index.js';
import { 
  BadRequestError, 
  UnauthorizedError, 
  ConflictError,
  NotFoundError 
} from '../utils/errors.js';
import { TokenPayload, AuthTokens } from '../types/index.js';

interface RegisterDTO {
  nome: string;
  email: string;
  senha: string;
}

interface LoginDTO {
  email: string;
  senha: string;
}

class AuthService {
  private generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiresIn,
    } as jwt.SignOptions);
  }

  private generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as jwt.SignOptions);
  }

  private generateTokens(user: IUserDocument): AuthTokens {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  async register(data: RegisterDTO): Promise<{ user: IUserDocument; tokens: AuthTokens }> {
    const { nome, email, senha } = data;


    if (!nome || !email || !senha) {
      throw new BadRequestError('Nome, e-mail e senha são obrigatórios');
    }

    if (senha.length < 6) {
      throw new BadRequestError('Senha deve ter pelo menos 6 caracteres');
    }


    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('E-mail já cadastrado');
    }


    const user = await User.create({
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      senha,
    });


    const tokens = this.generateTokens(user);


    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return { user, tokens };
  }

  async login(data: LoginDTO): Promise<{ user: IUserDocument; tokens: AuthTokens }> {
    const { email, senha } = data;


    if (!email || !senha) {
      throw new BadRequestError('E-mail e senha são obrigatórios');
    }


    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedError('E-mail ou senha incorretos');
    }


    const isValidPassword = await user.compararSenha(senha);
    if (!isValidPassword) {
      throw new UnauthorizedError('E-mail ou senha incorretos');
    }


    const tokens = this.generateTokens(user);


    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return { user, tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new BadRequestError('Refresh token é obrigatório');
    }

    try {

      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as TokenPayload;


      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedError('Usuário não encontrado');
      }


      if (!user.refreshTokens.includes(refreshToken)) {
        throw new UnauthorizedError('Refresh token inválido');
      }


      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);


      const tokens = this.generateTokens(user);


      user.refreshTokens.push(tokens.refreshToken);
      await user.save();

      return tokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Refresh token inválido ou expirado');
      }
      throw error;
    }
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    if (refreshToken) {

      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    } else {

      user.refreshTokens = [];
    }

    await user.save();
  }

  async getUserById(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }
    return user;
  }

  async updateProfile(userId: string, data: { nome?: string; email?: string }): Promise<IUserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    if (data.nome) {
      if (data.nome.trim().length < 2) {
        throw new BadRequestError('Nome deve ter pelo menos 2 caracteres');
      }
      user.nome = data.nome.trim();
    }

    if (data.email) {
      const newEmail = data.email.toLowerCase().trim();
      if (newEmail !== user.email) {
        const existingUser = await User.findOne({ email: newEmail });
        if (existingUser) {
          throw new ConflictError('Este e-mail já está em uso');
        }
        user.email = newEmail;
      }
    }

    await user.save();
    return user;
  }

  async changePassword(userId: string, senhaAtual: string, novaSenha: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const isValidPassword = await user.compararSenha(senhaAtual);
    if (!isValidPassword) {
      throw new UnauthorizedError('Senha atual incorreta');
    }

    if (novaSenha.length < 6) {
      throw new BadRequestError('Nova senha deve ter pelo menos 6 caracteres');
    }

    user.senha = novaSenha;
    user.refreshTokens = [];
    await user.save();
  }
}

export const authService = new AuthService();
