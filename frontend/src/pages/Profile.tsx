import { useState } from 'react';
import { Layout } from '../components';
import { useAuth } from '../contexts';
import { authService } from '../services';

export function Profile() {
  const { user, updateUser, logout } = useAuth();
  
  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setIsUpdatingProfile(true);

    try {
      const updatedUser = await authService.updateProfile({ nome, email });
      updateUser(updatedUser);
      setProfileMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (err) {
      setProfileMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Erro ao atualizar perfil' 
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (novaSenha !== confirmarSenha) {
      setPasswordMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    if (novaSenha.length < 6) {
      setPasswordMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' });
      return;
    }

    setIsChangingPassword(true);

    try {
      await authService.changePassword(senhaAtual, novaSenha);
      setPasswordMessage({ type: 'success', text: 'Senha alterada com sucesso! Você será deslogado.' });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (err) {
      setPasswordMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Erro ao alterar senha' 
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu Perfil</h1>

        {/* Formulário de Perfil */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="input"
                required
                minLength={2}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </div>

            {profileMessage && (
              <div className={`p-3 rounded-lg text-sm ${
                profileMessage.type === 'success' 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {profileMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="btn-primary w-full"
            >
              {isUpdatingProfile ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>

        {/* Formulário de Senha */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h2>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="senhaAtual" className="block text-sm font-medium text-gray-700 mb-1">
                Senha Atual
              </label>
              <input
                type="password"
                id="senhaAtual"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700 mb-1">
                Nova Senha
              </label>
              <input
                type="password"
                id="novaSenha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="input"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                id="confirmarSenha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="input"
                required
                minLength={6}
              />
            </div>

            {passwordMessage && (
              <div className={`p-3 rounded-lg text-sm ${
                passwordMessage.type === 'success' 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {passwordMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isChangingPassword}
              className="btn-primary w-full"
            >
              {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
