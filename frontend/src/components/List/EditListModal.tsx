import { useState, FormEvent, useEffect } from 'react';
import { Modal } from '../UI';
import { List } from '../../types';

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, nome: string, descricao?: string) => Promise<void>;
  list: List | null;
}

export function EditListModal({ isOpen, onClose, onUpdate, list }: EditListModalProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (list) {
      setNome(list.nome);
      setDescricao(list.descricao || '');
    }
  }, [list]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!list) return;

    setError('');

    if (nome.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(list._id, nome.trim(), descricao.trim() || undefined);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar lista');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Lista">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="nome" className="label">
            Nome da lista *
          </label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="input"
            placeholder="Ex: Chá de Casa Nova"
            maxLength={100}
            autoFocus
          />
        </div>

        <div className="mb-6">
          <label htmlFor="descricao" className="label">
            Descrição (opcional)
          </label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="input resize-none"
            rows={3}
            placeholder="Uma breve descrição da sua lista..."
            maxLength={500}
          />
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
