import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Film, Calendar, User as UserIcon, Loader2, Trash2 } from 'lucide-react';
import MovieCard from '../components/MovieCard.jsx';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiUrl, getUploadUrl } from '../api/config';

export default function UserProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      // Buscar dados do usuário
      const userRes = await fetch(getApiUrl(`auth/usuarios/${id}`));
      if (!userRes.ok) throw new Error('Usuário não encontrado');
      const userData = await userRes.json();
      setUser(userData);

      // Buscar filmes do usuário
      const moviesRes = await fetch(getApiUrl(`filmes?usuarioId=${id}`));
      const moviesData = await moviesRes.json();
      setMovies(Array.isArray(moviesData) ? moviesData : []);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const handleDeleteUser = async () => {
    if (!window.confirm(`ADMINISTRADOR: Tem certeza que deseja excluir permanentemente a conta de ${user.nome}? Todos os filmes e avaliações dele também serão apagados.`)) return;
    
    const confirmText = window.prompt(`Digite "DELETAR ${user.nome.toUpperCase()}" para confirmar:`);
    if (confirmText !== `DELETAR ${user.nome.toUpperCase()}`) {
      if (confirmText !== null) alert("Confirmação incorreta.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`auth/perfil/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert("Usuário excluído com sucesso.");
        navigate('/explore');
      } else {
        alert("Erro ao excluir usuário.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Administrador: Deseja excluir este filme do perfil deste usuário?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`filmes/${movieId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMovies(prev => prev.filter(m => (m._id || m.id) !== movieId));
      } else {
        alert('Erro ao excluir o filme.');
      }
    } catch (error) {
      alert('Erro de conexão.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
        <p className="text-brand-text-secondary">Carregando perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
        <h2 className="text-2xl font-bold">Usuário não encontrado</h2>
        <Link to="/">
          <Button variant="primary" icon={ArrowLeft}>Voltar para o início</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.3s_ease-in-out] max-w-[1200px] mx-auto pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-brand-text-secondary font-medium mb-8 transition-colors duration-200 hover:text-brand-primary">
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <div className="bg-brand-card border border-brand-border rounded-3xl p-8 mb-12 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <img 
            src={user.avatar ? getUploadUrl(user.avatar) : `https://i.pravatar.cc/150?u=${user._id}`} 
            alt={user.nome} 
            className="w-32 h-32 rounded-full object-cover border-4 border-brand-border shadow-2xl"
          />
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-brand-text-primary leading-tight">{user.nome}</h1>
                  <div className="flex items-center justify-center md:justify-start gap-3 mt-1">
                    {user.isSuperUser && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
                        Administrador
                      </span>
                    )}
                    <span className="text-brand-text-secondary text-sm flex items-center gap-1.5">
                      <Calendar size={14} />
                      Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {currentUser?.isSuperUser && currentUser.id !== user._id && (
                  <button 
                    onClick={handleDeleteUser}
                    className="flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white px-4 py-2 rounded-xl border border-rose-500/20 transition-all font-bold text-sm cursor-pointer"
                  >
                    <Trash2 size={16} />
                    Excluir Usuário
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-brand-text-secondary mt-4">
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full text-xs font-medium border border-brand-border">
                <Film size={14} className="text-brand-primary" />
                {movies.length} Filmes adicionados
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Film className="text-brand-primary" />
          Filmes de {user.nome.split(' ')[0]}
        </h2>

        {movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard 
                key={movie._id}
                id={movie._id}
                title={movie.nome}
                category={movie.genero}
                year={movie.ano}
                rating={movie.rating || 0}
                coverImage={movie.capa ? getUploadUrl(movie.capa) : 'https://placehold.co/600x900/1b172a/a19ea8?text=Sem+Capa'}
                onDelete={currentUser?.isSuperUser ? handleDeleteMovie : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-brand-card/30 rounded-3xl border border-dashed border-brand-border">
            <UserIcon className="w-16 h-16 text-brand-text-secondary/20 mx-auto mb-4" />
            <p className="text-brand-text-secondary text-lg">Este usuário ainda não adicionou nenhum filme.</p>
          </div>
        )}
      </div>
    </div>
  );
}
