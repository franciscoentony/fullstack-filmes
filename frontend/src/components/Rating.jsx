/**
 * COMPONENTE DE AVALIAÇÃO (ESTRELAS)
 * 
 * Componente interativo que permite ao usuário escolher uma nota de 1 a 5
 * ou apenas exibir uma nota já existente.
 */

import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function Rating({ value, onChange, readonly = false, size = 24 }) {
  // Estado para controlar qual estrela está sendo "focada" pelo mouse (Dá o efeito visual de brilho)
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {/* Geramos um array de 1 a 5 para renderizar as 5 estrelas */}
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly} // Desabilita o clique se for apenas leitura
          className={`${readonly ? 'cursor-default' : 'cursor-pointer transition-transform hover:scale-110 active:scale-95'}`}
          onClick={() => onChange && onChange(star)} // Ao clicar, envia o valor para o componente pai
          onMouseEnter={() => !readonly && setHover(star)} // Ao passar o mouse, brilha até essa estrela
          onMouseLeave={() => !readonly && setHover(0)} // Ao tirar o mouse, volta ao valor real da nota
        >
          <Star
            size={size}
            // A estrela deve ser pintada se o mouse estiver sobre ela OU se o valor real for maior/igual a ela
            fill={(hover || value) >= star ? '#FFAD1E' : 'transparent'}
            className={`${(hover || value) >= star ? 'text-brand-warning' : 'text-brand-border'} transition-colors duration-200`}
          />
        </button>
      ))}
    </div>
  );
}
