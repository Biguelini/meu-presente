import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export interface IUserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  nome: string;
  email: string;
  senha: string;
  refreshTokens: string[];
  globalHashId: string;
  createdAt: Date;
  updatedAt: Date;
  compararSenha(senha: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
      maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'E-mail é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'E-mail inválido'],
    },
    senha: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
    globalHashId: {
      type: String,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);


userSchema.pre('save', async function (next) {
  if (this.isNew) {
    this.globalHashId = nanoid(10);
  }
  
  if (!this.isModified('senha')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});


userSchema.methods.compararSenha = async function (senha: string): Promise<boolean> {
  return bcrypt.compare(senha, this.senha);
};


userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const obj = ret as { senha?: string; refreshTokens?: string[]; __v?: number };
    delete obj.senha;
    delete obj.refreshTokens;
    delete obj.__v;
    return ret;
  },
});

export const User = mongoose.model<IUserDocument>('User', userSchema);
