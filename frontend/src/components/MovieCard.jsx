/**
 * COMPONENTE MOVIECARD
 * 
 * Este é o componente responsável por exibir um filme individual na grade (grid).
 * Ele recebe diversas informações via "props" para se adaptar a diferentes telas.
 */

import React from 'react';
import { Star, Trash2, Edit3, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MovieCard({ id, title, category, year, rating, coverImage, onDelete, status }) {
  
  /**
   * Função para lidar com a exclusão sem navegar para a página de detalhes.
   * Usamos e.stopPropagation() para que o clique no botão de lixeira não ative
   * o <Link> que envolve o card todo.
   */
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <div className="group relative flex flex-col bg-transparent rounded-xl transition-transform duration-200 hover:-translate-y-1">
      {/* Envolvemos o card num Link para que, ao clicar, vá para os detalhes do filme */}
      <Link to={`/movie/${id}`} className="flex flex-col cursor-pointer">
        <div className="relative w-full aspect-2/3 rounded-xl overflow-hidden">
          {/* Imagem de Capa */}
          <img src={coverImage} alt={title} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          
          {/* Badge de Nota (Estrela) */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold text-white z-10">
            <span>{rating.toFixed(1)}</span>
            <Star size={12} fill="currentColor" className="text-brand-warning" />
          </div>

          {/* Badge de Status "Pendente" (Aparece enquanto o Admin não aprova) */}
          {status === 'pendente' && (
            <div className={`absolute left-3 bg-brand-card/90 backdrop-blur-sm border border-brand-warning/30 px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-xl z-20 pointer-events-none ${onDelete ? 'bottom-3' : 'top-3'}`}>
              <Clock size={12} className="text-brand-warning animate-pulse" />
              <span className="text-[10px] font-bold text-brand-warning uppercase whitespace-nowrap">Pendente</span>
            </div>
          )}
        </div>
        
        {/* Informações de Texto */}
        <div className="py-4">
          <h3 className="text-base font-semibold mb-1 whitespace-nowrap overflow-hidden text-ellipsis text-brand-text-primary">{title}</h3>
          <p className="text-sm text-brand-text-secondary">{category} • {year}</p>
        </div>
      </Link>

      {/* Botões de Ação (Aparecem apenas se a prop "onDelete" existir, ex: na página de administração) */}
      {onDelete && (
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          <button 
            onClick={handleDelete}
            className="bg-brand-danger/20 backdrop-blur-md p-2 rounded-lg text-brand-danger opacity-0 transition-opacity duration-200 hover:bg-brand-danger hover:text-white group-hover:opacity-100 cursor-pointer"
            title="Excluir filme"
          >
            <Trash2 size={16} />
          </button>
          
          {/* Botão de Editar */}
          <Link 
            to={`/edit/${id}`}
            className="bg-brand-primary/20 backdrop-blur-md p-2 rounded-lg text-brand-primary opacity-0 transition-opacity duration-200 hover:bg-brand-primary hover:text-white group-hover:opacity-100 flex items-center justify-center cursor-pointer"
            title="Editar filme"
            onClick={(e) => e.stopPropagation()} // Evita navegar para os detalhes ao clicar em editar
          >
            <Edit3 size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
