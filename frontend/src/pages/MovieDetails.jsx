import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Star, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import Button from '../components/Button.jsx';
import Rating from '../components/Rating.jsx';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiUrl, getUploadUrl } from '../api/config';

export default function MovieDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const reviewsRes = await fetch(getApiUrl(`avaliacoes/filme/${id}`));
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData);
        
        // Se logado, atualizar o estado local de avaliação do usuário baseado na lista
        if (user) {
          const myReview = reviewsData.find(r => r.usuario?._id === user.id);
          if (myReview) {
            setUserRating(myReview.nota);
            setUserComment(myReview.comentario || '');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    }
  };

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setIsLoading(true);
        // Buscar detalhes do filme
        const movieRes = await fetch(getApiUrl(`filmes/${id}`));
        if (!movieRes.ok) throw new Error('Filme não encontrado');
        const movieData = await movieRes.json();
        setMovie(movieData);

        await fetchReviews();
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();
  }, [id, user?.id]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Tem certeza que deseja excluir esta avaliação?")) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(getApiUrl(`avaliacoes/${reviewId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Atualizar filme com a nova média
        setMovie(curr => ({ ...curr, rating: data.rating, numAvaliacoes: data.numAvaliacoes }));
        // Recarregar avaliações
        await fetchReviews();
        
        // Se a avaliação excluída era a do usuário, resetar campos
        const reviewToDelete = reviews.find(r => r._id === reviewId);
        if (reviewToDelete?.usuario?._id === user?.id) {
            setUserRating(0);
            setUserComment('');
        }
      } else {
        alert("Erro ao excluir avaliação.");
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor.");
    }
  };

  const submitReview = async () => {
    if (userRating === 0) {
      alert('Por favor, selecione uma nota antes de publicar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('avaliacoes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          filmeId: id, 
          nota: userRating,
          comentario: userComment 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMovie(prev => ({
          ...prev,
          rating: data.rating,
          numAvaliacoes: data.numAvaliacoes
        }));
        
        await fetchReviews();
        setIsModalOpen(false);
      } else {
        alert(data.mensagem || 'Erro ao salvar avaliação.');
      }
    } catch (error) {
      alert('Erro de conexão com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
        <p className="text-brand-text-secondary">Carregando detalhes...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
        <h2 className="text-2xl font-bold">Filme não encontrado</h2>
        <Link to="/">
          <Button variant="primary" icon={ArrowLeft}>Voltar para o início</Button>
        </Link>
      </div>
    );
  }

  const movieImageUrl = getUploadUrl(movie.capa) || 'https://placehold.co/600x900/1b172a/a19ea8?text=Sem+Capa';

  return (
    <div className="animate-[fadeIn_0.3s_ease-in-out] max-w-[1000px] mx-auto pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-brand-text-secondary font-medium mb-8 transition-colors duration-200 hover:text-brand-primary">
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-16">
        <div className="flex-none w-[200px] md:w-[300px] mx-auto rounded-2xl overflow-hidden shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5)]">
          <img src={movieImageUrl} alt={movie.nome} className="w-full h-auto block" />
        </div>
        
        <div className="flex-1 flex flex-col justify-center text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">{movie.nome}</h1>
          </div>
          
          <div className="flex flex-col gap-1 text-brand-text-secondary text-base mb-6">
            <span>Categoria: {movie.genero}</span>
            <span>Ano: {movie.ano}</span>
            {movie.usuario && (
              <span className="flex items-center justify-center md:justify-start gap-2">
                Adicionado por:{' '}
                <Link to={`/user/${movie.usuario._id}`} className="text-brand-primary hover:underline font-medium">
                  {movie.usuario.nome}
                </Link>
                {movie.usuario.isSuperUser && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">
                    Administrador
                  </span>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
            <Rating value={Number(movie.rating) || 0} readonly />
            <div className="flex flex-col">
               <span className="font-bold text-xl text-brand-text-primary px-2">
                 {(Number(movie.rating) || 0).toFixed(1)}
               </span>
               <span className="text-xs text-brand-text-secondary px-2">{movie.numAvaliacoes || 0} avaliações</span>
            </div>
          </div>

          {movie.descricao && (
            <p className="leading-relaxed text-[#ccc] text-lg">
              {movie.descricao}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-brand-border pt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Avaliações</h2>
            <p className="text-brand-text-secondary text-sm">O que as pessoas estão achando deste filme.</p>
          </div>
          <Button variant="primary" icon={Star} onClick={() => setIsModalOpen(true)} className="cursor-pointer">
            {userRating > 0 ? 'Editar minha avaliação' : 'Avaliar Filme'}
          </Button>
        </div>

        {reviews.length > 0 ? (
          <div className="flex flex-col gap-6">
            {reviews.map((review) => (
              <div key={review._id} className="flex flex-col md:flex-row gap-6 bg-brand-card p-6 rounded-2xl border border-brand-border hover:border-brand-primary/30 transition-colors">
                <div className="flex-none basis-[200px] flex items-start gap-4">
                  <Link to={`/user/${review.usuario?._id}`}>
                    <img 
                      src={review.usuario?.avatar ? getUploadUrl(review.usuario.avatar) : `https://i.pravatar.cc/150?u=${review.usuario?._id}`} 
                      alt={review.usuario?.nome} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-brand-border hover:border-brand-primary transition-all shadow-lg" 
                    />
                  </Link>
                  <div className="flex flex-col gap-1">
                    <Link to={`/user/${review.usuario?._id}`} className="font-bold text-brand-text-primary hover:text-brand-primary transition-colors leading-tight">
                      {review.usuario?.nome}
                    </Link>
                    {review.usuario?.isSuperUser && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded w-fit">
                        Administrador
                      </span>
                    )}
                    <span className="text-[10px] text-brand-text-secondary">
                      {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < review.nota ? "text-brand-warning fill-brand-warning" : "text-brand-border fill-transparent"} 
                        />
                      ))}
                    </div>
                    
                    {user && (user.id === review.usuario?._id || user.isSuperUser) && (
                      <button 
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-2 text-brand-text-secondary hover:text-brand-danger hover:bg-brand-danger/10 rounded-xl transition-all cursor-pointer opacity-50 hover:opacity-100"
                        title="Excluir avaliação"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  <p className="text-brand-text-primary leading-relaxed text-base italic">
                    "{review.comentario || 'Apenas nota.'}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-brand-card/50 rounded-3xl border-2 border-brand-border border-dashed gap-4 text-brand-text-secondary">
            <MessageSquare size={48} className="opacity-20" />
            <p>Nenhuma avaliação ainda. Seja o primeiro!</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={userRating > 0 ? "Editar sua nota" : "Avaliar filme"}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 pb-6 border-b border-brand-border">
             <img src={movieImageUrl} alt={movie.nome} className="w-[60px] h-[90px] rounded-lg object-cover" />
             <div className="flex flex-col">
               <h3 className="text-lg font-semibold mb-1 w-full truncate">{movie.nome}</h3>
               <span className="text-sm text-brand-text-secondary">{movie.genero} • {movie.ano}</span>
             </div>
          </div>

          <div className="flex flex-col items-center gap-4 py-4 bg-brand-input/50 rounded-2xl">
            <label className="text-sm font-medium text-brand-text-secondary uppercase tracking-wider">Sua nota</label>
            <Rating value={userRating} onChange={setUserRating} size={40} />
            <span className="text-xl font-bold text-brand-primary">
              {userRating > 0 ? `${userRating} de 5` : 'Selecione uma nota'}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-brand-text-secondary">Seu comentário</label>
            <textarea 
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              className="bg-brand-input border border-brand-border rounded-xl py-4 px-4 text-brand-text-primary text-sm w-full transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 focus:outline-none placeholder:text-brand-text-secondary resize-none"
              placeholder="O que achou do filme?"
              rows="4"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer">
              Cancelar
            </Button>
            <Button variant="primary" onClick={submitReview} disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? 'Salvando...' : 'Confirmar Avaliação'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
