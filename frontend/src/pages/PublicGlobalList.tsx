import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loading, EmptyState, ConfirmDialog } from '../components';
import { giftService } from '../services';
import { PublicGlobalGift, PublicListInfo } from '../types';
import { AxiosError } from 'axios';

export function PublicGlobalList() {
  const { hashId } = useParams<{ hashId: string }>();
  const [donoNome, setDonoNome] = useState('');
  const [gifts, setGifts] = useState<PublicGlobalGift[]>([]);
  const [listas, setListas] = useState<PublicListInfo[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [buyGiftId, setBuyGiftId] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    const loadGifts = async () => {
      if (!hashId) return;

      try {
        const data = await giftService.getPublicGlobalList(hashId);
        setDonoNome(data.donoNome);
        setGifts(data.gifts);
        setListas(data.listas);
      } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 404) {
          setError('Lista não encontrada');
        } else {
          setError('Erro ao carregar lista');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadGifts();
  }, [hashId]);

  const handleMarkBought = async () => {
    if (!buyGiftId) return;

    setIsBuying(true);
    try {
      await giftService.markAsBought(buyGiftId);
      setGifts(gifts.filter((g) => g._id !== buyGiftId));
      setBuyGiftId(null);
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 409) {
        alert('Este presente já foi comprado por outra pessoa!');
        setGifts(gifts.filter((g) => g._id !== buyGiftId));
      } else {
        alert('Erro ao marcar como comprado. Tente novamente.');
      }
      setBuyGiftId(null);
    } finally {
      setIsBuying(false);
    }
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const filteredGifts = selectedListId === 'all'
    ? gifts
    : gifts.filter((g) => g.listaPublicHashId === selectedListId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading text="Carregando lista..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">{error}</h1>
        <p className="text-gray-500 mb-4">Verifique se o link está correto</p>
        <Link to="/" className="text-primary-600 hover:underline">
          Ir para a página inicial
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-600"
              >
                <polyline points="20 12 20 22 4 22 4 12"></polyline>
                <rect x="2" y="7" width="20" height="5"></rect>
                <line x1="12" y1="22" x2="12" y2="7"></line>
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Todos os Presentes</h1>
              <p className="text-sm text-gray-500">Lista de presentes de {donoNome}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Filter by list */}
        {listas.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por lista
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedListId('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedListId === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Todas ({gifts.length})
              </button>
              {listas.map((lista) => {
                const count = gifts.filter((g) => g.listaPublicHashId === lista.publicHashId).length;
                return (
                  <button
                    key={lista.publicHashId}
                    onClick={() => setSelectedListId(lista.publicHashId)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedListId === lista.publicHashId
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {lista.nome} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Info */}
        <p className="text-sm text-gray-500 mb-4">
          {filteredGifts.length} presente{filteredGifts.length !== 1 ? 's' : ''} disponíve{filteredGifts.length !== 1 ? 'is' : 'l'}
        </p>

        {/* Gifts */}
        {filteredGifts.length === 0 ? (
          <EmptyState
            icon="gift"
            title="Nenhum presente disponível"
            description={selectedListId === 'all' 
              ? "Todos os presentes já foram comprados ou a lista está vazia."
              : "Não há presentes disponíveis nesta categoria. Tente outra lista!"}
          />
        ) : (
          <div className="space-y-3">
            {filteredGifts.map((gift) => (
              <div
                key={gift._id}
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">{gift.nome}</h3>
                      {gift.link && (
                        <a
                          href={gift.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 flex-shrink-0"
                          title="Ver produto"
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
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {gift.listaNome && selectedListId === 'all' && (
                        <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                          {gift.listaNome}
                        </span>
                      )}
                      {formatPrice(gift.preco) && (
                        <span className="text-sm text-gray-500">{formatPrice(gift.preco)}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setBuyGiftId(gift._id)}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 flex-shrink-0"
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
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Vou dar!
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            Powered by{' '}
            <Link to="/" className="text-primary-600 hover:underline">
              Meu Presente
            </Link>
          </p>
        </div>
      </main>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!buyGiftId}
        onClose={() => setBuyGiftId(null)}
        onConfirm={handleMarkBought}
        title="Confirmar Compra"
        message="Você está marcando este presente como comprado. Esta ação não pode ser desfeita. Tem certeza?"
        confirmText="Sim, vou dar!"
        variant="info"
        isLoading={isBuying}
      />
    </div>
  );
}
