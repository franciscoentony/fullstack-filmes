import React, { useState, useEffect } from 'react';
import { Upload, Loader2, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { getApiUrl, getUploadUrl } from '../api/config';

export default function NewMovie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    nome: '',
    ano: '',
    genero: '',
    descricao: ''
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchMovie = async () => {
        try {
          const response = await fetch(getApiUrl(`filmes/${id}`));
          if (!response.ok) throw new Error('Filme não encontrado');
          const data = await response.json();
          
          setFormData({
            nome: data.nome || '',
            ano: data.ano || '',
            genero: data.genero || '',
            descricao: data.descricao || ''
          });

          if (data.capa) {
            const imageUrl = getUploadUrl(data.capa);
            setImagePreview(imageUrl);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do filme:', error);
          alert('Erro ao carregar dados do filme para edição.');
          navigate('/my-movies');
        } finally {
          setIsLoading(false);
        }
      };

      fetchMovie();
    }
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Dados do formulário salvando:', formData);
      
      const formDataToSend = new FormData();
      formDataToSend.append('nome', formData.nome);
      formDataToSend.append('ano', formData.ano);
      formDataToSend.append('genero', formData.genero);
      formDataToSend.append('descricao', formData.descricao);
      
      // Only append cover if a new file was selected
      if (imageFile) {
        console.log('Nova capa selecionada:', imageFile.name);
        formDataToSend.append('capa', imageFile);
      }

      const url = isEditMode 
        ? getApiUrl(`filmes/${id}`) 
        : getApiUrl('filmes');
        
      const method = isEditMode ? 'PUT' : 'POST';

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: method,
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        navigate('/my-movies');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro da API:', errorData);
        const errorMessage = errorData.mensagem || errorData.erro || errorData.message || 'Erro desconhecido';
        const errorDetail = errorData.detalhe ? `\nDetalhe: ${errorData.detalhe}` : '';
        alert(`Falha ao salvar o filme: ${errorMessage}${errorDetail}`);
      }
    } catch (error) {
      console.error('Erro ao conectar com a API:', error);
      alert('Erro ao conectar com a API. Verifique se o servidor está rodando.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
        <p className="text-brand-text-secondary">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.3s_ease-in-out] max-w-[900px] mx-auto">
      <h1 className="text-3xl font-bold mb-2">
        {isEditMode ? 'Editar filme' : 'Novo filme'}
      </h1>
      <p className="text-brand-text-secondary mb-8 flex items-center gap-2">
        <Clock size={16} className="text-brand-warning" />
        Todo conteúdo passará por aprovação de um administrador antes de ser publicado.
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 md:gap-12 bg-brand-card p-6 md:p-8 rounded-2xl border border-brand-border">
        <div className="flex-none w-[200px] md:w-[300px] mx-auto md:mx-0">
          <label className="flex flex-col items-center justify-center w-full aspect-2/3 bg-brand-input border-2 border-dashed border-brand-border rounded-xl cursor-pointer relative overflow-hidden transition-all duration-200 hover:border-brand-primary hover:bg-brand-primary/5 group">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 text-white opacity-0 transition-opacity duration-200 backdrop-blur-[2px] group-hover:opacity-100">
                  <Upload size={24} />
                  <span>Alterar imagem</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 text-brand-text-secondary font-medium group-hover:text-brand-primary">
                <Upload size={32} />
                <span>Fazer upload</span>
              </div>
            )}
          </label>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-text-secondary">Título</label>
            <Input 
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Interestelar"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-brand-text-secondary">Ano</label>
              <Input 
                type="number"
                name="ano"
                value={formData.ano}
                onChange={handleChange}
                placeholder="Ex: 2014"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-brand-text-secondary">Categoria</label>
              <select 
                className="bg-brand-input border border-brand-border rounded-lg py-3 px-4 text-brand-text-primary text-sm w-full transition-colors duration-200 focus:border-brand-primary focus:outline-none appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a19ea8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1em'
                }}
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Selecione uma categoria</option>
                <option value="Ação">Ação</option>
                <option value="Aventura">Aventura</option>
                <option value="Comédia">Comédia</option>
                <option value="Drama">Drama</option>
                <option value="Ficção">Ficção Científica</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-text-secondary">Descrição</label>
            <textarea 
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="bg-brand-input border border-brand-border rounded-lg py-3 px-4 text-brand-text-primary text-sm w-full transition-colors duration-200 focus:border-brand-primary focus:outline-none placeholder:text-brand-text-secondary resize-y min-h-[120px]"
              placeholder="Digite a sinopse do filme..."
              rows="5"
              required
            />
          </div>

          <div className="flex justify-end gap-4 mt-auto pt-8">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/my-movies')}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting} className={isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}>
              {isSubmitting ? 'Salvando...' : (isEditMode ? 'Salvar alterações' : 'Salvar')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
