import mongoose, { Schema, Document } from 'mongoose';

export interface IGiftDocument extends Document {
  _id: mongoose.Types.ObjectId;
  listaId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  nome: string;
  link?: string;
  preco?: number;
  status: 'disponivel' | 'comprado';
  ordemPrioridadeLista: number;
  ordemPrioridadeGlobal: number;
  ordemInsercao: Date;
  createdAt: Date;
  updatedAt: Date;
}

const giftSchema = new Schema<IGiftDocument>(
  {
    listaId: {
      type: Schema.Types.ObjectId,
      ref: 'List',
      required: [true, 'listaId é obrigatório'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId é obrigatório'],
      index: true,
    },
    nome: {
      type: String,
      required: [true, 'Nome do presente é obrigatório'],
      trim: true,
      minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
      maxlength: [200, 'Nome deve ter no máximo 200 caracteres'],
    },
    link: {
      type: String,
      trim: true,
      maxlength: [2000, 'Link deve ter no máximo 2000 caracteres'],
    },
    preco: {
      type: Number,
      min: [0, 'Preço não pode ser negativo'],
    },
    status: {
      type: String,
      enum: ['disponivel', 'comprado'],
      default: 'disponivel',
      index: true,
    },
    ordemPrioridadeLista: {
      type: Number,
      default: 0,
    },
    ordemPrioridadeGlobal: {
      type: Number,
      default: 0,
    },
    ordemInsercao: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


giftSchema.index({ listaId: 1, status: 1 });
giftSchema.index({ userId: 1, status: 1 });
giftSchema.index({ listaId: 1, ordemPrioridadeLista: 1 });
giftSchema.index({ userId: 1, ordemPrioridadeGlobal: 1 });

giftSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const obj = ret as { __v?: number };
    delete obj.__v;
    return ret;
  },
});

export const Gift = mongoose.model<IGiftDocument>('Gift', giftSchema);
