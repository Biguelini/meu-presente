import { useState, FormEvent, useEffect } from 'react';
import { Modal } from '../UI';
import { Gift } from '../../types';

interface EditGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, nome: string, link?: string, preco?: number | null) => Promise<void>;
  gift: Gift | null;
}

export function EditGiftModal({ isOpen, onClose, onUpdate, gift }: EditGiftModalProps) {
  const [nome, setNome] = useState('');
  const [link, setLink] = useState('');
  const [preco, setPreco] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (gift) {
      setNome(gift.nome);
      setLink(gift.link || '');
      setPreco(gift.preco !== undefined ? gift.preco.toString().replace('.', ',') : '');
    }
  }, [gift]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!gift) return;

    setError('');

    if (nome.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      return;
    }

    const precoNumber = preco ? parseFloat(preco.replace(',', '.')) : null;
    if (preco && (isNaN(precoNumber!) || precoNumber! < 0)) {
      setError('Preço inválido');
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(gift._id, nome.trim(), link.trim() || undefined, precoNumber);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar presente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Presente">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="nome" className="label">
            Nome do presente *
          </label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="input"
            placeholder="Ex: Jogo de panelas"
            maxLength={200}
            autoFocus
          />
        </div>

        <div className="mb-4">
          <label htmlFor="link" className="label">
            Link (opcional)
          </label>
          <input
            type="url"
            id="link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="input"
            placeholder="https://..."
            maxLength={2000}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="preco" className="label">
            Preço (opcional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              R$
            </span>
            <input
              type="text"
              id="preco"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className="input pl-10"
              placeholder="0,00"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
