import { useState, useEffect, useCallback } from 'react';
import { Layout, ListCard, CreateListModal, Loading, EmptyState, ConfirmDialog } from '../components';
import { listService } from '../services';
import { List } from '../types';

export function Dashboard() {
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadLists = useCallback(async () => {
    try {
      const data = await listService.getAll();
      setLists(data);
    } catch {
      setError('Erro ao carregar listas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const handleCreateList = async (nome: string, descricao?: string) => {
    await listService.create({ nome, descricao });
    loadLists();
  };

  const handleDeleteList = async () => {
    if (!deleteListId) return;

    setIsDeleting(true);
    try {
      await listService.delete(deleteListId);
      setLists(lists.filter((l) => l._id !== deleteListId));
      setDeleteListId(null);
    } catch {
      alert('Erro ao excluir lista');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Loading text="Carregando listas..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Listas</h1>
          <p className="text-gray-500 mt-1">Gerencie suas listas de presentes</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
          + Nova Lista
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {lists.length === 0 ? (
        <EmptyState
          icon="list"
          title="Nenhuma lista ainda"
          description="Crie sua primeira lista de presentes para começar a organizar seus desejos!"
          action={{
            label: 'Criar Lista',
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <ListCard
              key={list._id}
              list={list}
              onDelete={(id) => setDeleteListId(id)}
            />
          ))}
        </div>
      )}

      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateList}
      />

      <ConfirmDialog
        isOpen={!!deleteListId}
        onClose={() => setDeleteListId(null)}
        onConfirm={handleDeleteList}
        title="Excluir Lista"
        message="Tem certeza que deseja excluir esta lista? Todos os presentes serão removidos. Esta ação não pode ser desfeita."
        confirmText="Excluir"
        isLoading={isDeleting}
      />
    </Layout>
  );
}
