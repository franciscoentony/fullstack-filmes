import React, { useState, useRef } from 'react';
import { Camera, Loader2, ArrowLeft, User, Check, AlertCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiUrl, getUploadUrl } from '../api/config';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [nome, setNome] = useState(user?.nome || '');
  const [imagePreview, setImagePreview] = useState(
    user?.avatar 
      ? getUploadUrl(user.avatar) 
      : `https://i.pravatar.cc/150?u=${user?.email}`
  );
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const formData = new FormData();
      formData.append('nome', nome);
      if (imageFile) {
        formData.append('avatar', imageFile);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('auth/perfil'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        updateUser({
          nome: data.nome,
          avatar: data.avatar
        });
        setStatus({ type: 'success', message: 'Perfil atualizado com sucesso!' });
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
      } else {
        setStatus({ type: 'error', message: data.mensagem || 'Erro ao atualizar perfil.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Erro de conexão com o servidor.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("ATENÇÃO: A exclusão da conta é IRREVERSÍVEL. Todos os seus filmes e avaliações também serão excluídos. Deseja continuar?")) return;
    
    const confirmName = window.prompt(`Para confirmar, digite seu nome completo (${user?.nome}):`);
    if (confirmName !== user?.nome) {
      if (confirmName !== null) alert("Nome incorreto. Ação cancelada.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('auth/perfil'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert("Sua conta foi excluída com sucesso. Sentiremos sua falta!");
        logout();
        navigate('/login');
      } else {
        alert("Erro ao excluir conta.");
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-[fadeIn_0.3s_ease-in-out] max-w-[600px] mx-auto pb-20">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-brand-text-secondary hover:text-brand-primary mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Voltar</span>
      </button>

      <div className="bg-brand-card p-10 rounded-2xl border border-brand-border shadow-xl">
        <h1 className="text-3xl font-bold mb-10 text-center">Configurações da Conta</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-brand-primary/20 group-hover:border-brand-primary transition-all duration-300">
                <img 
                  src={imagePreview} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                <Camera className="text-white w-8 h-8" />
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange}
              />
            </div>
            <p className="mt-4 text-sm text-brand-text-secondary">Clique para alterar o avatar</p>
          </div>

          <div className="flex flex-col gap-6 mt-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-brand-text-secondary">Nome completo</label>
              <Input 
                icon={User}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                required
              />
              {user?.isSuperUser && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20 w-fit">
                  Administrador
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 opacity-60">
              <label className="text-sm font-medium text-brand-text-secondary">E-mail (não alterável)</label>
              <Input 
                value={user?.email}
                disabled
                className="cursor-not-allowed"
              />
            </div>
          </div>

          {status.message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 animate-[slideUp_0.3s_ease-out] ${
              status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {status.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-medium">{status.message}</span>
            </div>
          )}

          <div className="flex flex-col gap-4 mt-2">
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full py-4 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} /> Salvando...
                </span>
              ) : 'Salvar Alterações'}
            </Button>

            <div className="border-t border-brand-border mt-6 pt-8">
              <h3 className="text-lg font-bold text-rose-500 mb-2">Zona de Perigo</h3>
              <p className="text-sm text-brand-text-secondary mb-6">Uma vez que você exclui sua conta, não há como voltar atrás. Por favor, tenha certeza.</p>
              <button 
                type="button"
                onClick={handleDeleteAccount}
                className="w-full py-4 rounded-xl border-2 border-rose-500/30 text-rose-500 font-bold hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                Excluir minha conta permanentemente
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
