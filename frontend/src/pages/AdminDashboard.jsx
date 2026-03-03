/**
 * DASHBOARD DE ADMINISTRAÇÃO (MODERAÇÃO)
 * 
 * Página exclusiva para "SuperUsers" (Administradores).
 * Permite visualizar, aprovar ou rejeitar filmes enviados por usuários comuns.
 */

import React, { useState, useEffect } from 'react';
import { Check, X, ShieldAlert, Film, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import { getApiUrl, getUploadUrl } from '../api/config';

export default function AdminDashboard() {
  const [pendingMovies, setPendingMovies] = useState([]); // Lista de filmes aguardando aprovação
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Busca no backend todos os filmes que estão com status="pendente".
   */
  const fetchPendencies = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('moderacao/pendentes'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPendingMovies(data);
      }
    } catch (error) {
      console.error('Erro ao buscar pendências:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendencies();
  }, []);

  /**
   * Envia para o servidor a decisão do administrador (Aprovar ou Rejeitar).
   */
  const handleModeration = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`moderacao/${id}`), {
        method: 'PATCH', // Usamos PATCH porque estamos atualizando apenas uma parte do recurso (o status)
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Remove o filme da lista local assim que ele é processado
        setPendingMovies(prev => prev.filter(m => m._id !== id));
      } else {
        alert('Erro ao processar moderação.');
      }
    } catch (error) {
      alert('Erro de conexão.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-brand-text-secondary">Carregando fila de moderação...</p>
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.3s_ease-in-out]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <ShieldAlert className="text-brand-primary" />
            Dashboard de Moderação
          </h1>
          <p className="text-brand-text-secondary text-sm">Aprove ou rejeite novos filmes para o catálogo global.</p>
        </div>
      </div>

      {pendingMovies.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {pendingMovies.map((movie) => (
            <div key={movie._id} className="bg-brand-card border border-brand-border rounded-3xl p-6 flex flex-col md:flex-row gap-8 items-center transition-all hover:border-brand-primary/30">
              {/* Miniatura da Capa */}
              <div className="flex-none w-[120px] aspect-2/3 rounded-xl overflow-hidden shadow-xl">
                <img 
                  src={movie.capa ? getUploadUrl(movie.capa) : 'https://placehold.co/600x900/1b172a/a19ea8?text=Pendente'} 
                  className="w-full h-full object-cover"
                  alt={movie.nome}
                />
              </div>

              {/* Informações do Filme e de quem enviou */}
              <div className="flex-1 flex flex-col gap-2 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h3 className="text-xl font-bold text-brand-text-primary">{movie.nome}</h3>
                  <span className="text-xs bg-brand-warning/10 text-brand-warning px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    <Clock size={10} />
                    Pendente
                  </span>
                </div>
                <p className="text-sm text-brand-text-secondary line-clamp-2 max-w-2xl">
                  {movie.descricao || 'Sem descrição.'}
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-brand-text-secondary mt-2">
                  <span className="flex items-center gap-1">
                    <Film size={12} className="text-brand-primary" />
                    {movie.genero} • {movie.ano}
                  </span>
                  <span className="flex items-center gap-1">
                    Enviado por: <span className="text-brand-text-primary font-medium">{movie.usuario?.nome} ({movie.usuario?.email})</span>
                  </span>
                </div>
              </div>

              {/* Botões de Decisão */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to={`/movie/${movie._id}`}>
                  <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-brand-text-primary px-4 py-3 rounded-xl border border-brand-border transition-all font-bold text-sm cursor-pointer w-full">
                    <ExternalLink size={16} />
                    Visualizar
                  </button>
                </Link>
                <button 
                  onClick={() => handleModeration(movie._id, 'aprovado')}
                  className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white px-4 py-3 rounded-xl border border-emerald-500/20 transition-all font-bold text-sm cursor-pointer"
                >
                  <Check size={18} />
                  Aprovar
                </button>
                <button 
                  onClick={() => handleModeration(movie._id, 'rejeitado')}
                  className="flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white px-4 py-3 rounded-xl border border-rose-500/20 transition-all font-bold text-sm cursor-pointer"
                >
                  <X size={18} />
                  Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Estado quando não há nada para moderar
        <div className="flex flex-col items-center justify-center text-center py-24 px-8 text-brand-text-secondary gap-4 bg-brand-card/30 rounded-3xl border border-brand-border/50 border-dashed">
          <Check className="w-16 h-16 stroke-[1px] mb-4 text-emerald-500/50" />
          <p className="text-brand-text-primary text-xl font-medium">Fila de moderação vazia!</p>
          <p>Não há novos filmes aguardando aprovação no momento.</p>
        </div>
      )}
    </div>
  );
}
