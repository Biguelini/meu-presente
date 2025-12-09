import { useState, useEffect, useCallback } from 'react';
import {
  Layout,
  Loading,
  EmptyState,
  SortSelect,
  GiftList,
  EditGiftModal,
  ConfirmDialog,
} from '../components';
import { useAuth } from '../contexts';
import { listService, giftService } from '../services';
import { Gift, SortOption } from '../types';

export function GlobalList() {
  const { user } = useAuth();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [globalHashId, setGlobalHashId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<SortOption>('prioridade');
  const [copied, setCopied] = useState(false);

  const [editGift, setEditGift] = useState<Gift | null>(null);
  const [deleteGiftId, setDeleteGiftId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadGifts = useCallback(async () => {
    try {
      const data = await listService.getGlobal(sort);
      setGifts(data.gifts);
      setGlobalHashId(data.globalHashId);
    } catch {
      setError('Erro ao carregar presentes');
    } finally {
      setIsLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    loadGifts();
  }, [loadGifts]);

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
  };

  const handleUpdateGift = async (giftId: string, nome: string, link?: string, preco?: number | null) => {
    await giftService.update(giftId, { nome, link, preco });
    loadGifts();
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

    const newGifts = newOrder.map((giftId) => gifts.find((g) => g._id === giftId)!);
    setGifts(newGifts);

    try {
      await giftService.reorderGlobal(newOrder);
    } catch {

      loadGifts();
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Loading text="Carregando presentes..." />
        </div>
      </Layout>
    );
  }

  const isDraggable = sort === 'prioridade';

  const shareUrl = `${window.location.origin}/g/${globalHashId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Erro ao copiar link');
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Presentes de {user?.nome}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              Todos os seus presentes disponíveis em todas as listas
            </p>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
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
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4">
        <p className="text-xs sm:text-sm text-gray-500">
          {gifts.length} presente{gifts.length !== 1 ? 's' : ''} disponíve{gifts.length !== 1 ? 'is' : 'l'}
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
          description="Você ainda não tem presentes em nenhuma lista. Crie uma lista e adicione presentes!"
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

      <EditGiftModal
        isOpen={!!editGift}
        onClose={() => setEditGift(null)}
        onUpdate={handleUpdateGift}
        gift={editGift}
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
