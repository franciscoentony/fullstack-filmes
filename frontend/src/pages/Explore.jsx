/**
 * PÁGINA EXPLORAR (FRONTEND)
 * 
 * Esta é uma das páginas mais completas do projeto. Ela possui:
 * 1. Alternância entre busca de Filmes e Usuários.
 * 2. Layout dinâmico estilo Netflix (quando não há busca).
 * 3. Busca em tempo real com Debounce (para usuários).
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Clapperboard, X, User, Film, ChevronRight, Star, ChevronLeft } from 'lucide-react';
import Input from '../components/Input.jsx';
import MovieCard from '../components/MovieCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiUrl, getUploadUrl } from '../api/config';

export default function Explore() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('movies'); // Controla se buscamos 'movies' ou 'users'
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('filmes'));
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
  }, []);

  /**
   * Lógica de Busca de Usuários com DEBOUNCE.
   * O Debounce evita que a cada tecla digitada seja feita uma requisição ao servidor.
   * Ele espera 500ms de "silêncio" antes de disparar a busca.
   */
  useEffect(() => {
    if (searchType === 'users') {
      const delayDebounceFn = setTimeout(async () => {
        setIsLoading(true);
        try {
          const url = searchQuery.trim().length > 0 
            ? getApiUrl(`auth/usuarios?nome=${searchQuery}`)
            : getApiUrl('auth/usuarios');
            
          const response = await fetch(url);
          const data = await response.json();
          setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Erro ao buscar usuários:', error);
        } finally {
          setIsLoading(false);
        }
      }, searchQuery.trim().length > 0 ? 500 : 0);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, searchType]);

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Administrador: Tem certeza que deseja excluir este filme permanentemente?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`filmes/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMovies(prev => prev.filter(m => (m._id || m.id) !== id));
      } else {
        alert('Erro ao excluir o filme.');
      }
    } catch (error) {
      alert('Erro de conexão.');
    }
  };

  // Agrupamento de filmes por gênero e destaques
  const topRatedMovies = [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
  
  const genres = [...new Set(movies.map(m => m.genero))];
  const moviesByGenre = genres.map(genre => ({
    name: genre,
    movies: movies.filter(m => m.genero === genre)
  }));

  const filteredMovies = Array.isArray(movies)
    ? movies.filter((movie) =>
        (movie?.nome || movie?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="animate-[fadeIn_0.3s_ease-in-out] pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Explorar</h1>
          <p className="text-brand-text-secondary text-sm">Encontre seus filmes e perfis favoritos.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex bg-brand-card p-1 rounded-xl border border-brand-border w-full sm:w-auto">
            <button 
              onClick={() => { setSearchType('movies'); setSearchQuery(''); }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${searchType === 'movies' ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-text-secondary hover:text-brand-text-primary'}`}
            >
              <Film size={16} />
              Filmes
            </button>
            <button 
              onClick={() => { setSearchType('users'); setSearchQuery(''); }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${searchType === 'users' ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-text-secondary hover:text-brand-text-primary'}`}
            >
              <User size={16} />
              Usuários
            </button>
          </div>

          <Input
            icon={Search}
            placeholder={searchType === 'movies' ? "Pesquisar filme..." : "Pesquisar usuário..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-[250px] lg:w-[350px]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-brand-text-secondary animate-pulse">Buscando {searchType === 'movies' ? 'filmes' : 'usuários'}...</p>
        </div>
      ) : searchType === 'movies' ? (
        searchQuery.trim().length > 0 ? (
          // Vista de pesquisa (Grid normal)
          filteredMovies.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 md:gap-8">
              {filteredMovies.map((movie) => (
                <MovieCard 
                  key={movie._id || movie.id} 
                  id={movie._id || movie.id}
                  title={movie.nome || movie.title}
                  category={movie.genero || movie.category}
                  year={movie.ano || movie.year}
                  rating={Number(movie.rating) || 0}
                  coverImage={getUploadUrl(movie.capa)} 
                  onDelete={user?.isSuperUser ? handleDeleteMovie : undefined}
                />
              ))}
            </div>
          ) : (
            <EmptyState query={searchQuery} onClear={() => setSearchQuery('')} type="filme" />
          )
        ) : (
          // Vista Estilo Netflix
          <div className="flex flex-col gap-16">
            {/* Seção Destaques */}
            {topRatedMovies.length > 0 && (
              <MovieRow 
                title="Mais Bem Avaliados" 
                icon={<Star className="text-brand-warning" size={20} />}
                movies={topRatedMovies} 
                user={user} 
                onDelete={handleDeleteMovie} 
              />
            )}

            {/* Seções por Gênero */}
            {moviesByGenre.map((section, idx) => (
              <MovieRow 
                key={idx} 
                title={section.name} 
                icon={<Film className="text-brand-primary" size={20} />}
                movies={section.movies} 
                user={user} 
                onDelete={handleDeleteMovie} 
              />
            ))}
          </div>
        )
      ) : (
        /* Render Users Search Results */
        users.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((u) => (
              <Link to={`/user/${u._id}`} key={u._id} className="group block">
                <div className="bg-brand-card border border-brand-border p-5 rounded-2xl flex items-center justify-between transition-all duration-300 hover:border-brand-primary/50 hover:shadow-xl hover:shadow-brand-primary/5 group-hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <img 
                      src={u.avatar ? getUploadUrl(u.avatar) : `https://i.pravatar.cc/150?u=${u._id}`} 
                      alt={u.nome} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-brand-border shadow-md"
                    />
                    <div>
                      <h3 className="font-bold text-brand-text-primary group-hover:text-brand-primary transition-colors">{u.nome}</h3>
                      <p className="text-xs text-brand-text-secondary">{u.email}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-brand-text-secondary group-hover:text-brand-primary group-hover:translate-x-1 transition-all" size={20} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState query={searchQuery} onClear={() => setSearchQuery('')} type="usuário" />
        )
      )}
    </div>
  );
}

/**
 * COMPONENTE MOVIEROW (Carrossel Estilo Netflix)
 * 
 * Implementa o efeito de scroll horizontal com botões de navegação.
 */
function MovieRow({ title, icon, movies, user, onDelete }) {
  const scrollRef = useRef(null);

  // Função para rolar o carrossel lateralmente
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/row">
      <div className="flex items-center gap-3 mb-6 px-2">
        {icon}
        <h2 className="text-2xl font-bold text-brand-text-primary">{title}</h2>
        <div className="h-[2px] flex-1 bg-linear-to-r from-brand-primary/50 to-transparent rounded-full ml-4 opacity-30"></div>
      </div>

      <div className="relative">
        {/* Botões de Navegação */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-30 bg-black/60 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-brand-primary hover:scale-110 cursor-pointer hidden md:block border border-white/10"
        >
          <ChevronLeft size={24} />
        </button>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-30 bg-black/60 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-brand-primary hover:scale-110 cursor-pointer hidden md:block border border-white/10"
        >
          <ChevronRight size={24} />
        </button>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide px-2 snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <div key={movie._id || movie.id} className="flex-none w-[160px] md:w-[220px] snap-start">
              <MovieCard 
                id={movie._id || movie.id}
                title={movie.nome || movie.title}
                category={movie.genero || movie.category}
                year={movie.ano || movie.year}
                rating={Number(movie.rating) || 0}
                coverImage={
                  movie.capa 
                    ? (movie.capa.startsWith('http') ? movie.capa : `http://localhost:4000/uploads/${movie.capa}`) 
                    : 'https://placehold.co/600x900/1b172a/a19ea8?text=Sem+Capa'
                } 
                onDelete={user?.isSuperUser ? onDelete : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ query, onClear, type }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-8 text-brand-text-secondary gap-4 bg-brand-card/30 rounded-3xl border border-brand-border/50">
      <Clapperboard className="w-16 h-16 stroke-[1px] mb-4 opacity-20" />
      <p className="text-brand-text-primary text-xl font-medium">
        Nenhum {type} encontrado com "{query}"
      </p>
      <p>Que tal tentar outra busca?</p>
      <button 
        className="text-brand-primary flex items-center gap-2 mt-4 hover:underline cursor-pointer font-medium" 
        onClick={onClear}
      >
        <X size={16} />
        Limpar busca
      </button>
    </div>
  );
}
