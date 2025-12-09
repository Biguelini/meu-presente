import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';
import { nanoid } from 'nanoid';

export interface IListDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  nome: string;
  descricao?: string;
  slug: string;
  publicHashId: string;
  createdAt: Date;
  updatedAt: Date;
}

const listSchema = new Schema<IListDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId é obrigatório'],
      index: true,
    },
    nome: {
      type: String,
      required: [true, 'Nome da lista é obrigatório'],
      trim: true,
      minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
      maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
    },
    descricao: {
      type: String,
      trim: true,
      maxlength: [500, 'Descrição deve ter no máximo 500 caracteres'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    publicHashId: {
      type: String,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);


listSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('nome')) {
    const baseSlug = slugify(this.nome, { lower: true, strict: true });
    const uniqueId = nanoid(8);
    this.slug = `${baseSlug}-${uniqueId}`;
  }
  
  if (this.isNew) {
    this.publicHashId = nanoid(6).toUpperCase();
  }
  
  next();
});

listSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const obj = ret as { __v?: number };
    delete obj.__v;
    return ret;
  },
});

export const List = mongoose.model<IListDocument>('List', listSchema);
