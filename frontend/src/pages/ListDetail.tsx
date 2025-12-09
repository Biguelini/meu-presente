import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Layout,
  Loading,
  EmptyState,
  SortSelect,
  GiftList,
  CreateGiftModal,
  EditGiftModal,
  EditListModal,
  ConfirmDialog,
} from '../components';
import { listService, giftService } from '../services';
import { List as ListType, Gift, SortOption } from '../types';

export function ListDetail() {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<ListType | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<SortOption>('prioridade');
  const [copied, setCopied] = useState(false);

  const [isCreateGiftOpen, setIsCreateGiftOpen] = useState(false);
  const [editGift, setEditGift] = useState<Gift | null>(null);
  const [isEditListOpen, setIsEditListOpen] = useState(false);
  const [deleteGiftId, setDeleteGiftId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadList = useCallback(async () => {
    if (!id) return;

    try {
      const data = await listService.getById(id, sort);
      setList(data.list);
      setGifts(data.gifts);
    } catch {
      setError('Erro ao carregar lista');
    } finally {
      setIsLoading(false);
    }
  }, [id, sort]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
  };

  const handleCreateGift = async (nome: string, link?: string, preco?: number) => {
    if (!id) return;
    await giftService.create(id, { nome, link, preco });
    loadList();
  };

  const handleUpdateGift = async (giftId: string, nome: string, link?: string, preco?: number | null) => {
    await giftService.update(giftId, { nome, link, preco });
    loadList();
  };

  const handleDeleteGift = async () => {
    if (!deleteGiftId) return;

    setIsDeleting(true);
    try {
      await giftService.delete(deleteGiftId);
      setGifts(gifts.filter((g) => g._id !== deleteGiftId));
      setDeleteGiftId(null);
    } catch {
      alert('Erro ao excluir presente');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorder = async (newOrder: string[]) => {
    if (!id) return;


    const newGifts = newOrder.map((giftId) => gifts.find((g) => g._id === giftId)!);
    setGifts(newGifts);

    try {
      await giftService.reorderList(id, newOrder);
    } catch {

      loadList();
    }
  };

  const handleUpdateList = async (_listId: string, nome: string, descricao?: string) => {
    if (!id) return;
    const updated = await listService.update(id, { nome, descricao });
    setList(updated);
  };

  const copyPublicLink = async () => {
    if (!list) return;
    const url = `${window.location.origin}/l/${list.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Não foi possível copiar o link');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Loading text="Carregando lista..." />
        </div>
      </Layout>
    );
  }

  if (error || !list) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600">{error || 'Lista não encontrada'}</p>
          <Link to="/dashboard" className="text-primary-600 hover:underline mt-4 inline-block">
            Voltar ao Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  const isDraggable = sort === 'prioridade';

  return (
    <Layout>
      <div className="mb-6">
        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Voltar
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{list.nome}</h1>
              <button
                onClick={() => setIsEditListOpen(true)}
                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                title="Editar lista"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
            {list.descricao && (
              <p className="text-sm sm:text-base text-gray-500 mt-1">{list.descricao}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button 
              onClick={copyPublicLink} 
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copiado!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Compartilhar
                </>
              )}
            </button>
            <button onClick={() => setIsCreateGiftOpen(true)} className="btn-primary text-sm sm:text-base justify-center">
              + Adicionar Presente
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4">
        <p className="text-xs sm:text-sm text-gray-500">
          {gifts.length} presente{gifts.length !== 1 ? 's' : ''}
          {!isDraggable && (
            <span className="block sm:inline sm:ml-2 text-yellow-600">
              (Arraste para reordenar apenas na ordenação por prioridade)
            </span>
          )}
        </p>
        <SortSelect value={sort} onChange={handleSortChange} />
      </div>

      {gifts.length === 0 ? (
        <EmptyState
          icon="gift"
          title="Nenhum presente ainda"
          description="Adicione presentes à sua lista para que seus amigos possam ver!"
          action={{
            label: 'Adicionar Presente',
            onClick: () => setIsCreateGiftOpen(true),
          }}
        />
      ) : (
        <GiftList
          gifts={gifts}
          onReorder={handleReorder}
          onEdit={setEditGift}
          onDelete={(id) => setDeleteGiftId(id)}
          isDraggable={isDraggable}
        />
      )}

      <CreateGiftModal
        isOpen={isCreateGiftOpen}
        onClose={() => setIsCreateGiftOpen(false)}
        onCreate={handleCreateGift}
      />

      <EditGiftModal
        isOpen={!!editGift}
        onClose={() => setEditGift(null)}
        onUpdate={handleUpdateGift}
        gift={editGift}
      />

      <EditListModal
        isOpen={isEditListOpen}
        onClose={() => setIsEditListOpen(false)}
        onUpdate={handleUpdateList}
        list={list}
      />

      <ConfirmDialog
        isOpen={!!deleteGiftId}
        onClose={() => setDeleteGiftId(null)}
        onConfirm={handleDeleteGift}
        title="Excluir Presente"
        message="Tem certeza que deseja excluir este presente?"
        confirmText="Excluir"
        isLoading={isDeleting}
      />
    </Layout>
  );
}
