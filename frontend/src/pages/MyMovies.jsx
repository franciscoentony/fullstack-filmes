import React, { useState, useEffect } from 'react';
import { Search, Plus, Clapperboard, X, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import MovieCard from '../components/MovieCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiUrl, getUploadUrl } from '../api/config';

export default function MyMovies() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMovies = async () => {
    try {
      if (!user?.id) return;
      setIsLoading(true);
      const response = await fetch(getApiUrl(`filmes?usuarioId=${user.id}`));
      const data = await response.json();
      setMovies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [user?.id]);

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este filme?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`filmes/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMovies(prev => prev.filter(movie => (movie._id || movie.id) !== id));
      } else {
        alert('Erro ao excluir o filme.');
      }
    } catch (error) {
      alert('Erro de conexão.');
    }
  };

  const approvedMovies = movies.filter(m => m.status === 'aprovado' || !m.status);
  const pendingMovies = movies.filter(m => m.status === 'pendente');

  const filterList = (list) => list.filter((movie) =>
    (movie.nome || movie.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-[fadeIn_0.3s_ease-in-out] pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Meus Filmes</h1>
          <p className="text-brand-text-secondary text-sm">Gerencie o seu catálogo pessoal de filmes.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Input
            icon={Search}
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 md:w-[250px]"
          />
          <Link to="/new">
            <Button variant="primary" icon={Plus}>Novo</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-brand-text-secondary">Buscando seus filmes...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-brand-card/30 rounded-3xl border-2 border-brand-border border-dashed gap-4">
          <Clapperboard className="w-16 h-16 stroke-[1px] opacity-20" />
          <p className="text-brand-text-primary text-xl font-medium">Nenhum filme cadastrado.</p>
          <Link to="/new">
            <Button variant="primary" icon={Plus}>Cadastrar Primeiro Filme</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {/* Sessão Pendentes */}
          {pendingMovies.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <Clock className="text-brand-warning" size={20} />
                <h2 className="text-xl font-bold text-brand-text-primary">Aguardando Aprovação</h2>
                <span className="bg-brand-warning/10 text-brand-warning text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {pendingMovies.length}
                </span>
                <div className="h-px flex-1 bg-linear-to-r from-brand-warning/30 to-transparent ml-4"></div>
              </div>
              
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
                {filterList(pendingMovies).map((movie) => (
                  <div key={movie._id} className="grayscale-[0.5] opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <MovieCard 
                      id={movie._id}
                      title={movie.nome}
                      category={movie.genero}
                      year={movie.ano}
                      rating={0}
                      coverImage={movie.capa ? getUploadUrl(movie.capa) : 'https://placehold.co/600x900/1b172a/a19ea8?text=Pendente'}
                      onDelete={handleDeleteMovie}
                      status="pendente"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sessão Aprovados */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <CheckCircle2 className="text-brand-primary" size={20} />
              <h2 className="text-xl font-bold text-brand-text-primary">Catálogo Público</h2>
              <div className="h-px flex-1 bg-linear-to-r from-brand-primary/30 to-transparent ml-4"></div>
            </div>

            {filterList(approvedMovies).length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
                {filterList(approvedMovies).map((movie) => (
                  <MovieCard 
                    key={movie._id || movie.id} 
                    id={movie._id || movie.id}
                    title={movie.nome || movie.title}
                    category={movie.genero || movie.category}
                    year={movie.ano || movie.year}
                    rating={Number(movie.rating) || 0}
                    coverImage={getUploadUrl(movie.capa || movie.coverImage)}
                    onDelete={handleDeleteMovie}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-brand-text-secondary bg-brand-card/20 rounded-2xl border border-brand-border border-dashed">
                <p>Nenhum filme aprovado encontrado.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
